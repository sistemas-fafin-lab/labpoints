import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface UseAvatarUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

interface UploadResult {
  url: string | null;
  error: Error | null;
}

export function useAvatarUpload(options?: UseAvatarUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Extrai o nome do arquivo da URL do avatar
   */
  const extractFilePath = (avatarUrl: string | null): string | null => {
    if (!avatarUrl) return null;
    
    // URL típica: https://xxx.supabase.co/storage/v1/object/public/avatars/user-id/filename.ext
    const match = avatarUrl.match(/\/avatars\/(.+)$/);
    return match ? match[1] : null;
  };

  /**
   * Deleta o avatar antigo do storage
   */
  const deleteOldAvatar = async (oldAvatarUrl: string | null): Promise<void> => {
    const filePath = extractFilePath(oldAvatarUrl);
    if (!filePath) return;

    try {
      await supabase.storage.from('avatars').remove([filePath]);
    } catch (error) {
      // Ignora erros de deleção - o arquivo pode já não existir
      console.warn('Could not delete old avatar:', error);
    }
  };

  /**
   * Gera um nome único para o arquivo
   */
  const generateFileName = (file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `avatar-${timestamp}-${random}.${extension}`;
  };

  /**
   * Valida o arquivo antes do upload
   */
  const validateFile = (file: File): Error | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return new Error('Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.');
    }

    if (file.size > maxSize) {
      return new Error('Arquivo muito grande. O tamanho máximo é 5MB.');
    }

    return null;
  };

  /**
   * Faz o upload do avatar
   */
  const uploadAvatar = async (
    userId: string,
    file: File,
    oldAvatarUrl?: string | null
  ): Promise<UploadResult> => {
    setUploading(true);
    setProgress(0);

    try {
      // Valida o arquivo
      const validationError = validateFile(file);
      if (validationError) {
        throw validationError;
      }

      setProgress(10);

      // Gera nome único para o arquivo
      const fileName = generateFileName(file);
      const filePath = `${userId}/${fileName}`;

      setProgress(20);

      // Deleta avatar antigo se existir
      if (oldAvatarUrl) {
        await deleteOldAvatar(oldAvatarUrl);
      }

      setProgress(40);

      // Faz upload do novo avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      setProgress(70);

      // Obtém a URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProgress(85);

      // Atualiza o avatar_url no banco de dados
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        // Se falhar ao atualizar o banco, tenta deletar o arquivo enviado
        await supabase.storage.from('avatars').remove([filePath]);
        throw updateError;
      }

      setProgress(100);

      options?.onSuccess?.(publicUrl);

      return { url: publicUrl, error: null };
    } catch (error) {
      const err = error as Error;
      options?.onError?.(err);
      return { url: null, error: err };
    } finally {
      setUploading(false);
      // Reset progress after a short delay
      setTimeout(() => setProgress(0), 500);
    }
  };

  /**
   * Remove o avatar do usuário
   */
  const removeAvatar = async (
    userId: string,
    currentAvatarUrl: string | null
  ): Promise<{ error: Error | null }> => {
    setUploading(true);

    try {
      // Deleta o arquivo do storage
      if (currentAvatarUrl) {
        await deleteOldAvatar(currentAvatarUrl);
      }

      // Atualiza o banco para null
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      options?.onSuccess?.('');
      return { error: null };
    } catch (error) {
      const err = error as Error;
      options?.onError?.(err);
      return { error: err };
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadAvatar,
    removeAvatar,
    uploading,
    progress,
  };
}
