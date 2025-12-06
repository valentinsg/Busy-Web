import { createHash } from 'crypto';
import { Vibrant } from 'node-vibrant/node';
import sharp from 'sharp';

interface ImageSize {
  width: number;
  height: number;
}

interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

interface ImageColors {
  vibrant: string | null;
  darkVibrant: string | null;
  lightVibrant: string | null;
  muted: string | null;
  darkMuted: string | null;
  lightMuted: string | null;
}

export async function processImage(
  buffer: Buffer,
  options: {
    format?: 'webp' | 'jpeg' | 'png';
    quality?: number;
    resize?: {
      width: number;
      height?: number;
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
      position?: number | string;
      background?: string;
    };
  } = {}
): Promise<ProcessedImage> {
  const { format = 'webp', quality = 80, resize } = options;

  let pipeline = sharp(buffer);

  if (resize) {
    pipeline = pipeline.resize({
      width: resize.width,
      height: resize.height,
      fit: resize.fit || 'cover',
      position: resize.position || 'center',
      background: resize.background || { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }

  // Convert to specified format
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality, effort: 6 });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
    case 'png':
      pipeline = pipeline.png({ quality: Math.floor(quality / 10) });
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  const processedBuffer = await pipeline.toBuffer();
  const metadata = await sharp(processedBuffer).metadata();

  return {
    buffer: processedBuffer,
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: format,
    size: processedBuffer.length,
  };
}

export async function generateThumbnails(
  buffer: Buffer,
  sizes: Array<{ width: number; suffix: string }> = [
    { width: 300, suffix: 'thumb' },
    { width: 800, suffix: 'medium' },
    { width: 1600, suffix: 'full' },
  ]
): Promise<{ [key: string]: ProcessedImage }> {
  const results: { [key: string]: ProcessedImage } = {};

  await Promise.all(
    sizes.map(async ({ width, suffix }) => {
      const processed = await processImage(buffer, {
        format: 'webp', // Always use WebP for thumbnails
        quality: 80,
        resize: {
          width,
          fit: 'inside',
        },
      });

      results[suffix] = processed;
    })
  );

  return results;
}

export async function extractDominantColors(
  buffer: Buffer,
  count = 5
): Promise<string[]> {
  try {
    const vibrant = new Vibrant(buffer, { colorCount: count });
    const palette = await vibrant.getPalette();

    const rawValues = Object.values(palette as any).filter(Boolean);

    const colors = rawValues
      .map((swatch: any) => {
        // Direct string value
        if (typeof swatch === 'string') return swatch;

        // Classic node-vibrant Swatch with getHex()
        if (swatch && typeof swatch.getHex === 'function') {
          return swatch.getHex();
        }

        // Some builds expose hex as a plain property
        if (swatch && typeof swatch.hex === 'string') {
          return swatch.hex;
        }

        return null;
      })
      .filter((hex): hex is string => Boolean(hex));

    return colors;
  } catch (error) {
    console.error('Error extracting colors:', error);
    return [];
  }
}

// Backwards-compatible helper used by Busy Archive upload route
export async function analyzeImageColors(buffer: Buffer): Promise<string[]> {
  return extractDominantColors(buffer, 5);
}

export function getContrastColor(hexColor: string): 'black' | 'white' {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? 'black' : 'white';
}

export async function generateBlurhash(buffer: Buffer): Promise<string> {
  try {
    const { encode } = await import('blurhash');

    const { data, info } = await sharp(buffer)
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: 'inside' })
      .toBuffer({ resolveWithObject: true });

    const pixels = new Uint8ClampedArray(data);
    return encode(pixels, info.width, info.height, 4, 4);
  } catch (error) {
    console.error('Error generating blurhash:', error);
    return '';
  }
}

export async function getImageMetadata(buffer: Buffer): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
  hash: string;
}> {
  const metadata = await sharp(buffer).metadata();
  const hash = createHash('md5').update(buffer).digest('hex');

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: buffer.length,
    hash,
  };
}
