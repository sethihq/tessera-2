'use server';
/**
 * @fileOverview Generates a sprite sheet from a text prompt using a structured JSON framework.
 *
 * - generateSpriteSheet - A function that generates a sprite sheet based on a text prompt.
 * - GenerateSpriteSheetInput - The input type for the generateSpriteSheet function.
 * - GenerateSpriteSheetOutput - The return type for the generateSpriteSheet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpriteSheetInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired sprite sheet animation (e.g., \'a wizard casting a fireball spell\').'),
});
export type GenerateSpriteSheetInput = z.infer<typeof GenerateSpriteSheetInputSchema>;

const GenerateSpriteSheetOutputSchema = z.object({
  assetDataUri: z.string().describe('The generated sprite sheet as a data URI (e.g., data:image/png;base64,...).'),
});
export type GenerateSpriteSheetOutput = z.infer<typeof GenerateSpriteSheetOutputSchema>;

export async function generateSpriteSheet(input: GenerateSpriteSheetInput): Promise<GenerateSpriteSheetOutput> {
  return generateSpriteSheetFlow(input);
}

const spriteSheetJsonPrompt = `
You are an expert game designer and animator. Your task is to take a user's request for a sprite sheet and expand it into a detailed JSON object that describes the entire animation frame-by-frame. Use the following JSON structure as a template.

The user's request is: "{{{prompt}}}"

Fill out the JSON object with creative and detailed descriptions for each stage and frame to guide the image generation model.

Here is the JSON structure to use:
{
  "sprite_sheet": {
    "style": "Pixel art",
    "canvas": {
      "size": "64x64 pixels",
      "background": "transparent",
      "consistency": "same pose alignment, proportions, and framing across all frames"
    },
    "character": {
      "identity": "[character description here, e.g. 'a wizard with long white beard, blue robe, and staff']",
      "base_pose": "[neutral pose, frontal or 3/4 view, shoulders up or full body]"
    },
    "animation": {
      "title": "[animation name, e.g. 'casting fireball spell']",
      "stages": [
        {
          "stage_number": 1,
          "label": "Setup",
          "description": "[character preparing the action, e.g. intricate hand motions, staff raised slightly]"
        },
        {
          "stage_number": 2,
          "label": "Build-up",
          "description": "[energy gathering or transformation, e.g. glowing light forming between hands]"
        },
        {
          "stage_number": 3,
          "label": "Climax",
          "description": "[the peak of the animation, e.g. conjuring a vibrant fireball with bright effects]"
        },
        {
          "stage_number": 4,
          "label": "Release",
          "description": "[the action being executed, e.g. wizard thrusting fireball forward, trails of flames following]"
        },
        {
          "stage_number": 5,
          "label": "Aftermath",
          "description": "[animation cooldown, e.g. wizard lowering hands, faint smoke trails]"
        }
      ]
    },
    "frames": [
      {
        "frame_number": 1,
        "stage": 1,
        "description": "[fine-grained keyframe detail here, e.g. wizard with neutral stance, slight hand motion]"
      },
      {
        "frame_number": 2,
        "stage": 1,
        "description": "[small motion adjustment, hand slightly raised higher]"
      },
      {
        "frame_number": 3,
        "stage": 2,
        "description": "[hands forming shape, faint magical glow between palms]"
      },
      {
        "frame_number": 4,
        "stage": 2,
        "description": "[glow intensifying, sparks forming, wizard leaning forward]"
      },
      {
        "frame_number": 5,
        "stage": 3,
        "description": "[fireball formed, bright glow, energy crackling around it]"
      },
      {
        "frame_number": 6,
        "stage": 3,
        "description": "[fireball pulsing with energy, staff glowing in sync]"
      },
      {
        "frame_number": 7,
        "stage": 4,
        "description": "[wizard thrusts hands forward, fireball moving outward with trail of flames]"
      },
      {
        "frame_number": 8,
        "stage": 4,
        "description": "[fireball mid-air, wizard leaning into casting motion]"
      },
      {
        "frame_number": 9,
        "stage": 5,
        "description": "[wizard hands lowered, faint smoke trails where fireball left, calm expression returning]"
      }
    ]
  }
}
`;


const generateSpriteSheetFlow = ai.defineFlow(
  {
    name: 'generateSpriteSheetFlow',
    inputSchema: GenerateSpriteSheetInputSchema,
    outputSchema: GenerateSpriteSheetOutputSchema,
  },
  async (input) => {
    // Step 1: Generate the detailed JSON prompt.
    const structuredPromptResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: spriteSheetJsonPrompt.replace('{{{prompt}}}', input.prompt),
      config: {
        responseMimeType: 'application/json',
      }
    });

    const structuredPromptText = structuredPromptResponse.text;

    // Step 2: Generate the image using the detailed JSON prompt.
    const imageGenerationPrompt = `
      You are an expert pixel artist. Create a sprite sheet based on the following JSON object.
      The output should be a single image containing all the frames arranged in a grid.
      Pay close attention to the 'consistency' requirement to ensure all frames are aligned.

      ${structuredPromptText}
    `;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: imageGenerationPrompt,
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
