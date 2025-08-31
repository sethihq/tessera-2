'use server';
/**
 * @fileOverview Extracts key style characteristics from reference art to create a 'World Style'.
 *
 * - extractWorldStyle - A function that handles the world style extraction process.
 * - ExtractWorldStyleInput - The input type for the extractWorldStyle function.
 * - ExtractWorldStyleOutput - The return type for the extractWorldStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractWorldStyleInputSchema = z.object({
  referenceArtDataUri: z
    .string()
    .describe(
      "A reference image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractWorldStyleInput = z.infer<typeof ExtractWorldStyleInputSchema>;

const ExtractWorldStyleOutputSchema = z.object({
  palette: z.array(z.string()).describe('The color palette extracted from the reference art.'),
  textures: z.string().describe('Description of the textures present in the reference art.'),
  perspective: z.string().describe('Description of the perspective in the reference art.'),
  lineWeight: z.string().describe('Description of the line weight in the reference art.'),
});
export type ExtractWorldStyleOutput = z.infer<typeof ExtractWorldStyleOutputSchema>;

export async function extractWorldStyle(input: ExtractWorldStyleInput): Promise<ExtractWorldStyleOutput> {
  return extractWorldStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractWorldStylePrompt',
  input: {schema: ExtractWorldStyleInputSchema},
  output: {schema: ExtractWorldStyleOutputSchema},
  prompt: `You are an expert art director. Analyze the provided reference art and extract its key style characteristics, specifically palette, textures, perspective, and line weight.\n\nReference Art: {{media url=referenceArtDataUri}}\n\nOutput the extracted style characteristics in a JSON format. Palette should be an array of color hex codes. Textures, perspective and lineWeight should be a string description.\n`,
});

const extractWorldStyleFlow = ai.defineFlow(
  {
    name: 'extractWorldStyleFlow',
    inputSchema: ExtractWorldStyleInputSchema,
    outputSchema: ExtractWorldStyleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
