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
  return new Promise(async (resolve, reject) => {
    try {
      const imageBuffer = Buffer.from(base64Image, 'base64');
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      const frameWidth = Math.floor((metadata.width || 0) / columns);
      const frameHeight = Math.floor((metadata.height || 0) / rows);
      
      if (frameWidth <= 0 || frameHeight <= 0) {
        return reject(new Error('Invalid frame dimensions calculated. Ensure columns and rows are correct.'));
      }

      const encoder = new GIFEncoder(frameWidth, frameHeight);
      
      const stream = encoder.createReadStream();
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk as Buffer));
      stream.on('end', () => {
        const gifBuffer = Buffer.concat(chunks);
        resolve(`data:image/gif;base64,${gifBuffer.toString('base64')}`);
      });
      stream.on('error', reject);

      encoder.start();
      encoder.setRepeat(0); // 0 for repeat
      encoder.setDelay(1000 / frameRate);
      encoder.setQuality(10); // Lower is better quality

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const frameBuffer = await image
            .extract({ left: x * frameWidth, top: y * frameHeight, width: frameWidth, height: frameHeight })
            .ensureAlpha() // Ensure the frame has an alpha channel
            .raw()
            .toBuffer();
          
          encoder.addFrame(frameBuffer);
        }
      }
      
      encoder.finish();
    } catch (error) {
      console.error('Error generating GIF:', error);
      reject(new Error('Failed to generate GIF from sprite sheet.'));
    }
  });
}
