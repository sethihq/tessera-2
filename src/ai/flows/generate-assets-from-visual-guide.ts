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
import { type ExtractWorldStyleOutput } from './extract-world-style-from-reference-art';

const GenerateAssetsFromVisualGuideInputSchema = z.object({
  worldStyle: z.any().describe("The World Style object to use for asset generation."),
  visualGuideDataUri: z
    .string()
    .describe(
      'A visual guide as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
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

const generateAssetsFromVisualGuideFlow = ai.defineFlow(
  {
    name: 'generateAssetsFromVisualGuideFlow',
    inputSchema: GenerateAssetsFromVisualGuideInputSchema,
    outputSchema: GenerateAssetsFromVisualGuideOutputSchema,
  },
  async input => {
    const worldStyle = input.worldStyle as ExtractWorldStyleOutput;

    const generationPrompt = `Generate a game asset of type "${input.assetType}" that matches the following style characteristics. 
    The asset should be guided by the provided visual sketch.

    Style:
    - Palette: ${worldStyle.palette.join(', ')}
    - Textures: ${worldStyle.textures}
    - Perspective: ${worldStyle.perspective}
    - Line Weight: ${worldStyle.lineWeight}
    
    ${input.parameters ? `Additional Parameters: ${input.parameters}` : ''}
    `;

    const {media} = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            {media: {url: input.visualGuideDataUri}},
            {text: generationPrompt},
        ],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media) {
        throw new Error("Asset generation failed.");
    }
    
    return {
        assetDataUri: media.url,
    };
  }
);
