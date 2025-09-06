
'use server';
/**
 * @fileOverview Generates a sprite sheet from a structured JSON object.
 *
 * - generateSpriteSheet - A function that generates a sprite sheet based on a JSON prompt.
 * - GenerateSpriteSheetInput - The input type for the generateSpriteSheet function.
 * - GenerateSpriteSheetOutput - The return type for the generateSpritesheet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpriteSheetInputSchema = z.object({
  prompt: z.string().describe('A JSON string describing the desired sprite sheet animation.'),
});
export type GenerateSpriteSheetInput = z.infer<typeof GenerateSpriteSheetInputSchema>;

const GenerateSpriteSheetOutputSchema = z.object({
  assetDataUri: z.string().describe('The generated sprite sheet as a data URI (e.g., data:image/png;base64,...).'),
});
export type GenerateSpriteSheetOutput = z.infer<typeof GenerateSpriteSheetOutputSchema>;

export async function generateSpriteSheet(input: GenerateSpriteSheetInput): Promise<GenerateSpriteSheetOutput> {
  return generateSpriteSheetFlow(input);
}

const generateSpriteSheetFlow = ai.defineFlow(
  {
    name: 'generateSpriteSheetFlow',
    inputSchema: GenerateSpriteSheetInputSchema,
    outputSchema: GenerateSpriteSheetOutputSchema,
  },
  async (input) => {
    const promptData = JSON.parse(input.prompt);
    const keyframeCount = promptData.sprite_sheet.keyframes.length;

    const imageGenerationPrompt = `
      You are an expert pixel artist. Create a sprite sheet based on the following JSON object.
      The output MUST be a single image containing exactly ${keyframeCount} keyframes, no more, no less.
      The frames should be arranged in a logical grid that accommodates all ${keyframeCount} frames (e.g., a 3x2 grid for 6 frames).
      Pay close attention to all 'consistency' requirements to ensure all keyframes are perfectly aligned as if using onion skinning.

      ${input.prompt}
    `;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [{ text: imageGenerationPrompt }],
       config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('No sprite sheet was generated from the prompt.');
    }

    return { assetDataUri: media.url! };
  }
);
