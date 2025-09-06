
import sharp from 'sharp';
import GIFEncoder from 'gif-encoder-2';
import { Readable } from 'stream';

/**
 * Creates an animated GIF from a sprite sheet.
 * @param base64Image The base64 encoded sprite sheet image.
 * @param columns The number of columns in the sprite sheet grid.
 * @param rows The number of rows in the sprite sheet grid.
 * @param frameRate The desired frame rate for the GIF in frames per second.
 * @returns A promise that resolves to a data URI of the generated GIF.
 */
export async function createGifFromSpriteSheet(
  base64Image: string,
  columns: number,
  rows: number,
  frameRate: number = 10
): Promise<string> {
  const imageBuffer = Buffer.from(base64Image, 'base64');
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  const frameWidth = Math.floor((metadata.width || 0) / columns);
  const frameHeight = Math.floor((metadata.height || 0) / rows);

  if (frameWidth <= 0 || frameHeight <= 0) {
    throw new Error(
      `Invalid frame dimensions calculated. The image is ${metadata.width}x${metadata.height} but the grid is ${columns}x${rows}. Please ensure the grid dimensions are correct for the source image.`
    );
  }

  const encoder = new GIFEncoder(frameWidth, frameHeight, 'neuquant', true);
  const stream = encoder.createReadStream();
  
  const gifPromise = new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk as Buffer));
    stream.on('end', () => {
      const gifBuffer = Buffer.concat(chunks);
      resolve(`data:image/gif;base64,${gifBuffer.toString('base64')}`);
    });
    stream.on('error', (err) => {
        console.error('Error generating GIF stream:', err);
        reject(new Error('Failed to generate GIF from sprite sheet stream.'));
    });
  });

  encoder.start();
  encoder.setRepeat(0); 
  encoder.setDelay(1000 / frameRate);
  encoder.setQuality(10);

  try {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const frameBuffer = await image
          .extract({ left: x * frameWidth, top: y * frameHeight, width: frameWidth, height: frameHeight })
          .ensureAlpha()
          .raw()
          .toBuffer();
        
        encoder.addFrame(frameBuffer as any);
      }
    }
  } catch (error: any) {
    console.error('Error during frame extraction:', error);
    throw new Error(
      `Failed to extract frames. This usually means the grid dimensions (${columns}x${rows}) do not match the sprite sheet image dimensions (${metadata.width}x${metadata.height}). Please double-check the 'Sprite Grid' setting. Original error: ${error.message}`
    );
  }

  encoder.finish();
  
  return gifPromise;
}
