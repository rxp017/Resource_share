// src/modules/listings/imageUtils.ts
import { supabase } from '../../shared/api-client/supabase';

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
const MAX_RAW_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Resizes an image file to a maximum dimension of 1600px, re-encodes to JPEG at 0.82 quality,
 * and strips EXIF metadata through canvas redrawing.
 */
export async function resizeAndStripExif(file: File): Promise<Blob> {
  if (file.size > MAX_RAW_SIZE_BYTES) {
    throw new Error(`File ${file.name} exceeds 10MB limit.`);
  }

  if (!file.type.startsWith('image/')) {
    throw new Error(`File ${file.name} is not an image.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed reading image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed decoding image data.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed getting 2D canvas context.'));
          return;
        }

        // Draw image onto canvas - strips EXIF metadata automatically
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed exporting compressed JPEG from canvas.'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          JPEG_QUALITY
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a resized image blob to the private 'listing-photos' storage bucket.
 * Path convention: {userId}/{listingId}/{photoId}.jpg
 */
export async function uploadListingPhoto(
  userId: string,
  listingId: string,
  photoBlob: Blob
): Promise<string> {
  const photoId = crypto.randomUUID();
  const storagePath = `${userId}/${listingId}/${photoId}.jpg`;

  const { error } = await supabase.storage
    .from('listing-photos')
    .upload(storagePath, photoBlob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw new Error(`Photo upload failed: ${error.message}`);
  }

  return storagePath;
}

/**
 * Creates a signed URL for a private listing photo.
 */
export async function getListingPhotoSignedUrl(storagePath: string, expiresInSeconds = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('listing-photos')
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}
