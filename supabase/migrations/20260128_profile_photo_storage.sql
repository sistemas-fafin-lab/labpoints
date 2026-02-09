-- =============================================
-- MIGRAÇÃO: Sistema de Foto de Perfil Customizável
-- Data: 2026-01-28
-- Descrição: Configura storage bucket para avatares,
--            políticas de acesso e triggers para limpeza automática
-- =============================================

BEGIN;

-- ============================================
-- 1. CRIAR BUCKET DE STORAGE PARA AVATARES
-- ============================================
-- Nota: Buckets são criados via API do Supabase, não via SQL.
-- Execute este comando no dashboard do Supabase ou via API:
-- Storage > New Bucket > Name: "avatars" > Public: true

-- Para criar via SQL (requer extensão storage habilitada):
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limite
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 2. POLÍTICAS DE STORAGE PARA O BUCKET AVATARS
-- ============================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all avatars" ON storage.objects;

-- 2.1 Leitura pública de avatares
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- 2.2 Upload do próprio avatar (usuário autenticado)
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2.3 Atualização do próprio avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2.4 Deleção do próprio avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2.5 Admins podem gerenciar todos os avatares
CREATE POLICY "Admins can manage all avatars"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'avatars'
  AND public.get_current_user_role() = 'adm'
)
WITH CHECK (
  bucket_id = 'avatars'
  AND public.get_current_user_role() = 'adm'
);

-- ============================================
-- 3. FUNÇÃO PARA EXTRAIR NOME DO ARQUIVO DA URL
-- ============================================
CREATE OR REPLACE FUNCTION public.extract_avatar_filename(avatar_url TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  filename TEXT;
BEGIN
  IF avatar_url IS NULL OR avatar_url = '' THEN
    RETURN NULL;
  END IF;
  
  -- Extrai o caminho após /avatars/
  -- URL típica: https://xxx.supabase.co/storage/v1/object/public/avatars/user-id/filename.ext
  filename := regexp_replace(avatar_url, '^.*/avatars/', '');
  
  RETURN filename;
END;
$$;

-- ============================================
-- 4. FUNÇÃO PARA DELETAR AVATAR ANTIGO DO STORAGE
-- ============================================
CREATE OR REPLACE FUNCTION public.delete_old_avatar()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_filename TEXT;
BEGIN
  -- Se avatar_url mudou e o antigo não era nulo
  IF OLD.avatar_url IS DISTINCT FROM NEW.avatar_url AND OLD.avatar_url IS NOT NULL THEN
    old_filename := public.extract_avatar_filename(OLD.avatar_url);
    
    IF old_filename IS NOT NULL THEN
      -- Deleta o arquivo antigo do storage
      -- Nota: Isso requer a extensão pg_net ou um edge function para funcionar
      -- Como alternativa, você pode implementar a limpeza no frontend ou via cron job
      RAISE NOTICE 'Old avatar to delete: %', old_filename;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- 5. TRIGGER PARA LIMPEZA DE AVATAR ANTIGO
-- ============================================
DROP TRIGGER IF EXISTS trigger_delete_old_avatar ON public.users;

CREATE TRIGGER trigger_delete_old_avatar
  BEFORE UPDATE OF avatar_url ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_old_avatar();

-- ============================================
-- 6. FUNÇÃO PARA GERAR URL DO AVATAR
-- ============================================
CREATE OR REPLACE FUNCTION public.get_avatar_url(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  avatar TEXT;
BEGIN
  SELECT avatar_url INTO avatar
  FROM public.users
  WHERE id = user_id;
  
  RETURN avatar;
END;
$$;

-- ============================================
-- 7. FUNÇÃO PARA ATUALIZAR AVATAR_URL
-- ============================================
CREATE OR REPLACE FUNCTION public.update_avatar_url(
  p_user_id UUID,
  p_avatar_url TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verifica se o usuário está atualizando seu próprio avatar ou é admin
  IF auth.uid() != p_user_id AND public.get_current_user_role() != 'adm' THEN
    RAISE EXCEPTION 'Não autorizado a atualizar este avatar';
  END IF;
  
  UPDATE public.users
  SET 
    avatar_url = p_avatar_url,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Permissões para a função
GRANT EXECUTE ON FUNCTION public.update_avatar_url(UUID, TEXT) TO authenticated;

-- ============================================
-- 8. VERIFICAR SE COLUNA AVATAR_URL EXISTE
-- ============================================
DO $$
BEGIN
  -- Verifica se a coluna já existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'avatar_url'
  ) THEN
    -- Adiciona a coluna se não existir
    ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- ============================================
-- 9. ÍNDICE PARA PERFORMANCE (OPCIONAL)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_avatar_url 
ON public.users(avatar_url) 
WHERE avatar_url IS NOT NULL;

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================

-- Permissão para usuários autenticados atualizarem seu próprio avatar_url
-- (Isso já deve estar coberto pelas policies existentes, mas garantimos aqui)

GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

COMMIT;

-- =============================================
-- INSTRUÇÕES DE USO NO FRONTEND:
-- =============================================
-- 
-- 1. Upload de Avatar:
--    const { data, error } = await supabase.storage
--      .from('avatars')
--      .upload(`${userId}/${fileName}`, file, {
--        cacheControl: '3600',
--        upsert: true
--      });
--
-- 2. Obter URL pública:
--    const { data: { publicUrl } } = supabase.storage
--      .from('avatars')
--      .getPublicUrl(`${userId}/${fileName}`);
--
-- 3. Atualizar no banco:
--    await supabase.from('users')
--      .update({ avatar_url: publicUrl })
--      .eq('id', userId);
--
-- 4. Deletar avatar antigo (opcional, no frontend):
--    await supabase.storage
--      .from('avatars')
--      .remove([`${userId}/${oldFileName}`]);
-- =============================================
