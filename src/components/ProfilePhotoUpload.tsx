import { useRef, useState } from 'react';
import { Camera, Loader2, Trash2, Upload, X, Check } from 'lucide-react';
import { useAvatarUpload } from '../hooks/useAvatarUpload';

interface ProfilePhotoUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  userName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onUploadComplete?: (newUrl: string | null) => void;
  className?: string;
}

export function ProfilePhotoUpload({
  userId,
  currentAvatarUrl,
  userName,
  size = 'lg',
  editable = true,
  onUploadComplete,
  className = '',
}: ProfilePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { uploadAvatar, removeAvatar, uploading, progress } = useAvatarUpload({
    onSuccess: (url) => {
      setPreviewUrl(null);
      setSelectedFile(null);
      setError(null);
      onUploadComplete?.(url || null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  };

  const iconSizeClasses = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  };

  const getInitials = (name: string) => {
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.');
      return;
    }

    if (file.size > maxSize) {
      setError('Arquivo muito grande. O tamanho máximo é 5MB.');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Cria preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setShowMenu(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await uploadAvatar(userId, selectedFile, currentAvatarUrl);
  };

  const handleRemove = async () => {
    setShowMenu(false);
    await removeAvatar(userId, currentAvatarUrl);
    onUploadComplete?.(null);
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;
  const hasImage = Boolean(displayUrl);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Avatar container */}
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-lab-gradient flex items-center justify-center font-ranade font-bold shadow-lg ring-4 ring-white transition-all duration-300 ${
          editable && !uploading ? 'cursor-pointer hover:ring-lab-primary/30' : ''
        } ${uploading ? 'opacity-75' : ''}`}
        onClick={() => editable && !uploading && !previewUrl && setShowMenu(!showMenu)}
      >
        {hasImage ? (
          <img
            src={displayUrl!}
            alt={userName}
            className="w-full h-full object-cover"
            onError={() => setPreviewUrl(null)}
          />
        ) : (
          <span className={`text-white ${textSizeClasses[size]} leading-none`}>
            {getInitials(userName)}
          </span>
        )}

        {/* Progress overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" />
              <span className="text-white text-xs font-dm-sans mt-1 block">
                {progress}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Edit button overlay */}
      {editable && !uploading && !previewUrl && (
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="absolute top-0 right-0 w-10 h-10 bg-lab-primary rounded-full flex items-center justify-center shadow-lg border-3 border-white hover:bg-lab-primary/90 transition-all hover:scale-110"
          aria-label="Alterar foto"
        >
          <Camera size={iconSizeClasses[size] - 4} className="text-white" />
        </button>
      )}

      {/* Preview actions */}
      {previewUrl && !uploading && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-red-600 transition-all hover:scale-110"
            aria-label="Cancelar"
          >
            <X size={18} className="text-white" />
          </button>
          <button
            onClick={handleUpload}
            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-green-600 transition-all hover:scale-110"
            aria-label="Confirmar"
          >
            <Check size={18} className="text-white" />
          </button>
        </div>
      )}

      {/* Dropdown menu */}
      {showMenu && !uploading && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-xl shadow-xl py-2 z-20 animate-scale-in min-w-[180px] border border-gray-100">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2.5 text-left text-sm font-dm-sans text-slate-700 hover:bg-lab-light flex items-center gap-3 transition-colors"
            >
              <Upload size={16} className="text-lab-primary" />
              Fazer upload
            </button>
            
            {currentAvatarUrl && (
              <button
                onClick={handleRemove}
                className="w-full px-4 py-2.5 text-left text-sm font-dm-sans text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <Trash2 size={16} />
                Remover foto
              </button>
            )}
          </div>
        </>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Selecionar foto"
      />

      {/* Error message */}
      {error && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-14 bg-red-50 border border-red-200 text-red-600 text-xs font-dm-sans px-3 py-2 rounded-lg whitespace-nowrap z-30">
          {error}
        </div>
      )}
    </div>
  );
}
