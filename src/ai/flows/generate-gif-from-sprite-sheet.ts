'use server';
/**
 * @fileOverview Generates an animated GIF from a sprite sheet.
 *
 * - generateGifFromSpriteSheet - A function that generates a GIF from a sprite sheet.
 * - GenerateGifFromSpriteSheetInput - The input type for the generateGifFromSpriteSheet function.
 * - GenerateGifFromSpriteSheetOutput - The return type for the generateGifFromSpriteSheet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGifFromSpriteSheetInputSchema = z.object({
  sourceImageUri: z
    .string()
    .describe(
      "The source sprite sheet image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    grid: z.string().describe('The grid size of the sprite sheet (e.g., "4x4", "2x2").'),
});
export type GenerateGifFromSpriteSheetInput = z.infer<typeof GenerateGifFromSpriteSheetInputSchema>;

const GenerateGifFromSpriteSheetOutputSchema = z.object({
  assetDataUri: z.string().describe('The generated GIF as a data URI (e.g., data:image/gif;base64,...).'),
});
export type GenerateGifFromSpriteSheetOutput = z.infer<typeof GenerateGifFromSpriteSheetOutputSchema>;

export async function generateGifFromSpriteSheet(input: GenerateGifFromSpriteSheetInput): Promise<GenerateGifFromSpriteSheetOutput> {
  return generateGifFromSpriteSheetFlow(input);
}


const generateGifFromSpriteSheetFlow = ai.defineFlow(
  {
    name: 'generateGifFromSpriteSheetFlow',
    inputSchema: GenerateGifFromSpriteSheetInputSchema,
    outputSchema: GenerateGifFromSpriteSheetOutputSchema,
  },
  async (input) => {
    
    const generationPrompt = `
        You are an expert animator. Take the provided sprite sheet image and convert it into an animated GIF.
        The sprite sheet is organized in a ${input.grid} grid.
        You must slice the image into frames based on this grid and create an animation sequence starting from the top-left frame and proceeding from left-to-right, top-to-bottom.
        The output must be a single animated GIF.
    `;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: input.sourceImageUri}},
        {text: generationPrompt},
      ],
      config: {
        responseMimeType: 'image/gif',
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('No GIF was generated from the sprite sheet.');
    }

    return { assetDataUri: media.url! };
  }
);
