'use server';
/**
 * @fileOverview Generates game assets from a text prompt using Genkit and Nano Banana's API.
 *
 * - generateAssetsFromTextPrompt - A function that generates game assets based on a text prompt.
 * - GenerateAssetsFromTextPromptInput - The input type for the generateAssetsFromTextPrompt function.
 * - GenerateAssetsFromTextPromptOutput - The return type for the generateAssetsFromTextPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAssetsFromTextPromptInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired game assets (e.g., \'Cyberpunk Rooftops 32x32 tiles, rain FX\').'),
});
export type GenerateAssetsFromTextPromptInput = z.infer<typeof GenerateAssetsFromTextPromptInputSchema>;

const GenerateAssetsFromTextPromptOutputSchema = z.object({
  assetDataUri: z.string().describe('The generated game asset as a data URI (e.g., data:image/png;base64,...).'),
});
export type GenerateAssetsFromTextPromptOutput = z.infer<typeof GenerateAssetsFromTextPromptOutputSchema>;

export async function generateAssetsFromTextPrompt(input: GenerateAssetsFromTextPromptInput): Promise<GenerateAssetsFromTextPromptOutput> {
  return generateAssetsFromTextPromptFlow(input);
}

const generateAssetsFromTextPromptFlow = ai.defineFlow(
  {
    name: 'generateAssetsFromTextPromptFlow',
    inputSchema: GenerateAssetsFromTextPromptInputSchema,
    outputSchema: GenerateAssetsFromTextPromptOutputSchema,
  },
  async input => {
    // Call Nano Banana's API to generate the image
    const {media} = await ai.generate({
      prompt: input.prompt,
    });

    if (!media) {
      throw new Error('No asset was generated from the prompt.');
    }

    return {assetDataUri: media.url!};
  }
);
