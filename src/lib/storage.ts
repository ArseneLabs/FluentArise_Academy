import { isSupabaseConfigured, supabase } from './supabase';

export type MediaType = 'image' | 'video' | 'audio' | 'document';

export interface FileTypeConfig {
  maxBytes: number;
  labelMax: string;
  allowedExtensions: string[];
  allowedMimes: string[];
}

export const MEDIA_CONFIGS: Record<MediaType, FileTypeConfig> = {
  image: {
    maxBytes: 5 * 1024 * 1024, // 5 MB
    labelMax: '5 MB',
    allowedExtensions: ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'],
    allowedMimes: [
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ],
  },
  document: {
    maxBytes: 20 * 1024 * 1024, // 20 MB
    labelMax: '20 MB',
    allowedExtensions: ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.zip', '.txt'],
    allowedMimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
    ],
  },
  audio: {
    maxBytes: 25 * 1024 * 1024, // 25 MB
    labelMax: '25 MB',
    allowedExtensions: ['.mp3', '.wav', '.m4a', '.aac', '.ogg'],
    allowedMimes: [
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/aac',
      'audio/ogg',
      'audio/x-m4a',
    ],
  },
  video: {
    maxBytes: 50 * 1024 * 1024, // 50 MB
    labelMax: '50 MB',
    allowedExtensions: ['.mp4', '.webm', '.ogg', '.mov'],
    allowedMimes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  },
};

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function validateMediaFile(
  file: File,
  type: MediaType
): { valid: boolean; error?: string } {
  const config = MEDIA_CONFIGS[type];

  // 1. File size check
  if (file.size > config.maxBytes) {
    return {
      valid: false,
      error: `File size (${formatBytes(file.size)}) exceeds the maximum allowed size of ${config.labelMax}.`,
    };
  }

  // 2. Extension check
  const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
  const validExt = config.allowedExtensions.includes(ext);
  const validMime =
    config.allowedMimes.includes(file.type) || !file.type; // Some operating systems don't register mime

  if (!validExt && !validMime) {
    return {
      valid: false,
      error: `File type "${ext}" is not supported. Allowed extensions: ${config.allowedExtensions.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a local file from the computer directly to Supabase Storage.
 * Generates an immutable, clean public URL.
 * Falls back gracefully to base64 Data URL if bucket is not yet provisioned.
 */
export async function uploadMediaFile(
  file: File,
  folder: 'thumbnails' | 'videos' | 'audio' | 'documents' = 'thumbnails',
  type: MediaType = 'image'
): Promise<{ url: string | null; error: string | null; sizeFormatted: string }> {
  const sizeFormatted = formatBytes(file.size);

  // Validate before attempting upload
  const validation = validateMediaFile(file, type);
  if (!validation.valid) {
    return { url: null, error: validation.error || 'Invalid file', sizeFormatted };
  }

  const BUCKET_NAME = 'academy-media';
  const cleanFileName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '_')
    .slice(-40);
  const filePath = `${folder}/${Date.now()}_${cleanFileName}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return { url: publicUrlData.publicUrl, error: null, sizeFormatted };
        }
      }

      if (error) {
        console.warn('Supabase storage upload error, falling back:', error.message);
      }
    } catch (err: any) {
      console.warn('Storage upload exception:', err?.message || err);
    }
  }

  // Graceful fallback for local / offline mode or before bucket creation:
  // Convert image/small documents to base64 data URL
  if (file.size <= 5 * 1024 * 1024) {
    try {
      const base64 = await readFileAsDataUrl(file);
      return { url: base64, error: null, sizeFormatted };
    } catch {
      // ignore
    }
  }

  // For larger files offline, create local Object URL
  const objectUrl = URL.createObjectURL(file);
  return { url: objectUrl, error: null, sizeFormatted };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
