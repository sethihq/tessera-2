'use server';
/**
 * @fileOverview Generates game assets from a visual guide, using a specified World Style.
 *
 * - generateAssetsFromVisualGuide - A function that handles the asset generation process from a visual guide.
 * - GenerateAssetsFromVisualGuideInput - The input type for the generateAssetsFromVisualGuide function.
 * - GenerateAssetsFromVisualGuideOutput - The return type for the generateAssetsFromVisualGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAssetsFromVisualGuideInputSchema = z.object({
  worldStyleId: z.string().describe('The ID of the World Style to use for asset generation.'),
  visualGuideDataUri: z
    .string()
    .describe(
      'A visual guide as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
  assetType: z.enum(['parallax', 'tileset', 'props', 'fx']).describe('The type of asset to generate.'),
  parameters: z.string().optional().describe('Additional parameters to guide asset generation.'),
});

export type GenerateAssetsFromVisualGuideInput = z.infer<typeof GenerateAssetsFromVisualGuideInputSchema>;

const GenerateAssetsFromVisualGuideOutputSchema = z.object({
  assetDataUri: z.string().describe('The generated asset as a data URI.'),
  metadata: z.record(z.any()).optional().describe('Optional metadata associated with the asset.'),
});

export type GenerateAssetsFromVisualGuideOutput = z.infer<typeof GenerateAssetsFromVisualGuideOutputSchema>;

export async function generateAssetsFromVisualGuide(
  input: GenerateAssetsFromVisualGuideInput
): Promise<GenerateAssetsFromVisualGuideOutput> {
  return generateAssetsFromVisualGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAssetsFromVisualGuidePrompt',
  input: {schema: GenerateAssetsFromVisualGuideInputSchema},
  output: {schema: GenerateAssetsFromVisualGuideOutputSchema},
  prompt: `You are an expert game asset generator, skilled at creating assets that match a specific style.

You will generate a game asset of type {{{assetType}}} based on the provided visual guide and the specified World Style (ID: {{{worldStyleId}}}). The World Style dictates the overall look and feel of the asset.

Visual Guide: {{media url=visualGuideDataUri}}

Additional Parameters: {{{parameters}}}

Ensure that the generated asset is suitable for use in a game engine, with appropriate formatting and metadata.

Return the generated asset as a data URI.
`,
});

const generateAssetsFromVisualGuideFlow = ai.defineFlow(
  {
    name: 'generateAssetsFromVisualGuideFlow',
    inputSchema: GenerateAssetsFromVisualGuideInputSchema,
    outputSchema: GenerateAssetsFromVisualGuideOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
