import { useState, useEffect } from 'react';
import { supabase, Reward } from '../lib/supabase';

const REWARD_IMAGES_BUCKET = 'reward-images';

export function useRewards(activeOnly = true) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('ativo', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setRewards(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [activeOnly]);

  return { rewards, loading, error, refetch: fetchRewards };
}

/**
 * Upload a reward image to Supabase Storage
 * @param file - The image file to upload (JPEG or PNG)
 * @param rewardId - Optional reward ID for organizing images
 * @returns The public URL of the uploaded image
 */
export async function uploadRewardImage(file: File, rewardId?: string): Promise<string> {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use apenas JPEG ou PNG.');
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. O tamanho máximo é 5MB.');
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const fileName = rewardId 
    ? `${rewardId}/${timestamp}-${randomStr}.${fileExt}`
    : `${timestamp}-${randomStr}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(REWARD_IMAGES_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw new Error('Erro ao fazer upload da imagem. Tente novamente.');
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(REWARD_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Delete a reward image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteRewardImage(imageUrl: string): Promise<void> {
  // Extract file path from URL
  const bucketPath = `/storage/v1/object/public/${REWARD_IMAGES_BUCKET}/`;
  const pathIndex = imageUrl.indexOf(bucketPath);
  
  if (pathIndex === -1) {
    // Not a storage URL, skip deletion
    return;
  }

  const filePath = imageUrl.substring(pathIndex + bucketPath.length);

  const { error } = await supabase.storage
    .from(REWARD_IMAGES_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
    // Don't throw, just log - image might already be deleted
  }
}

export async function createReward(reward: Omit<Reward, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('rewards')
    .insert([reward])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReward(id: string, updates: Partial<Reward>) {
  const { data, error } = await supabase
    .from('rewards')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReward(id: string) {
  // First get the reward to check if it has an image
  const { data: reward } = await supabase
    .from('rewards')
    .select('imagem_url')
    .eq('id', id)
    .single();

  // Delete the image if it exists
  if (reward?.imagem_url) {
    await deleteRewardImage(reward.imagem_url);
  }

  const { error } = await supabase
    .from('rewards')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
