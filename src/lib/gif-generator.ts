import sharp from 'sharp';
import GIFEncoder from 'gif-encoder-2';

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
  try {
    const imageBuffer = Buffer.from(base64Image, 'base64');
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const frameWidth = Math.floor((metadata.width || 0) / columns);
    const frameHeight = Math.floor((metadata.height || 0) / rows);
    
    if (frameWidth === 0 || frameHeight === 0) {
        throw new Error('Invalid frame dimensions calculated.');
    }

    const encoder = new GIFEncoder(frameWidth, frameHeight);

    encoder.start();
    encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
    encoder.setDelay(1000 / frameRate);
    encoder.setQuality(10); // 1-30, lower is better

    const canvas = sharp({
        create: {
            width: frameWidth,
            height: frameHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    }).png();

    const context = encoder.createWriteStream();
    
    const framePromises: Promise<void>[] = [];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
          const framePromise = new Promise<void>(async (resolve) => {
            const frameBuffer = await image
              .extract({ left: x * frameWidth, top: y * frameHeight, width: frameWidth, height: frameHeight })
              .ensureAlpha()
              .raw()
              .toBuffer();
            
            encoder.addFrame(frameBuffer);
            resolve();
          });
          framePromises.push(framePromise);
      }
    }
    
    await Promise.all(framePromises);
    encoder.finish();

    const gifBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        context.on('data', (chunk) => chunks.push(chunk));
        context.on('end', () => resolve(Buffer.concat(chunks)));
        context.on('error', reject);
    });

    return `data:image/gif;base64,${gifBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error generating GIF:', error);
    throw new Error('Failed to generate GIF from sprite sheet.');
  }
}
