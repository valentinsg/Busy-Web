import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'busy-archive';
// Use the public development URL from Cloudflare R2 settings
// Format: https://pub-{hash}.r2.dev (NOT https://bucket-name.r2.dev)
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-12b1027834c046d2965a5d54e06e9c49.r2.dev';

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  throw new Error('Missing R2 configuration in environment variables');
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

interface UploadOptions {
  contentType: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  options: UploadOptions
): Promise<{ url: string; key: string }> {
  const { contentType, metadata = {}, cacheControl = 'public, max-age=31536000' } = options;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: cacheControl,
    Metadata: metadata,
  });

  try {
    await s3Client.send(command);
    return {
      url: `${R2_PUBLIC_URL}/${key}`,
      key,
    };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload file to R2');
  }
}

export async function getSignedUrlForR2(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

export function getPublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

export async function checkFileExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && (error as { name: string }).name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

export async function deleteFromR2(key: string): Promise<void> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error('Failed to delete file from R2');
  }
}

export function generateEntryPaths(entryId: string, filename: string) {
  return {
    thumb: `entries/${entryId}/thumb/${filename}.webp`,
    medium: `entries/${entryId}/medium/${filename}.webp`,
    full: `entries/${entryId}/full/${filename}.webp`,
  };
}
