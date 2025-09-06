
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
  let image = sharp(imageBuffer);
  const metadata = await image.metadata();

  const originalWidth = metadata.width || 0;
  const originalHeight = metadata.height || 0;

  if (originalWidth === 0 || originalHeight === 0) {
    throw new Error('Could not read image dimensions from sprite sheet.');
  }

  // **THE FIX**: Calculate the largest dimensions that are perfectly divisible by the grid.
  const newWidth = Math.floor(originalWidth / columns) * columns;
  const newHeight = Math.floor(originalHeight / rows) * rows;

  if (newWidth === 0 || newHeight === 0) {
     throw new Error(
      `Invalid grid dimensions (${columns}x${rows}) for a ${originalWidth}x${originalHeight} image. The resulting frame size would be zero.`
    );
  }
  
  // Resize the image to the new, perfectly divisible dimensions.
  image = image.resize(newWidth, newHeight);

  const frameWidth = newWidth / columns;
  const frameHeight = newHeight / rows;

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

  // With the resized image, this loop is now guaranteed to be safe.
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

  encoder.finish();
  
  return gifPromise;
}
