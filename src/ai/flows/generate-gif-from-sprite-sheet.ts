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
import { createGifFromSpriteSheet } from '@/lib/gif-generator';

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
    const [columns, rows] = input.grid.split('x').map(Number);
    const base64Image = input.sourceImageUri.split(',')[1];
    
    const gifDataUri = await createGifFromSpriteSheet(base64Image, columns, rows);

    return { assetDataUri: gifDataUri };
  }
);
