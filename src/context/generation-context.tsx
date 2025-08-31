"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { ExtractWorldStyleOutput } from '@/ai/flows/extract-world-style-from-reference-art';
import { extractWorldStyle } from '@/ai/flows/extract-world-style-from-reference-art';
import type { GenerateAssetsFromTextPromptOutput } from '@/ai/flows/generate-assets-from-text-prompt';
import { generateAssetsFromTextPrompt } from '@/ai/flows/generate-assets-from-text-prompt';
import type { GenerateAssetsFromVisualGuideOutput } from '@/ai/flows/generate-assets-from-visual-guide';
import { generateAssetsFromVisualGuide } from '@/ai/flows/generate-assets-from-visual-guide';


export type AssetType = 'parallax' | 'tileset' | 'props' | 'fx';

type GenerationResult = GenerateAssetsFromTextPromptOutput | GenerateAssetsFromVisualGuideOutput;

type GenerationState = {
  worldStyle: ExtractWorldStyleOutput | null;
  generatedAsset: GenerationResult | null;
  isLoading: boolean;
  isStyleLoading: boolean;
  error: string | null;
  extractStyle: (dataUri: string) => Promise<void>;
  generateAsset: (
    mode: 'text' | 'visual',
    params: { prompt?: string; visualGuideDataUri?: string; assetType: AssetType }
  ) => Promise<void>;
  clearAsset: () => void;
};

const GenerationContext = createContext<GenerationState | undefined>(undefined);

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [worldStyle, setWorldStyle] = useState<ExtractWorldStyleOutput | null>(null);
  const [generatedAsset, setGeneratedAsset] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isStyleLoading, setIsStyleLoading] = useState(false);
  const { toast } = useToast();

  const handleStyleExtraction = async (dataUri: string) => {
    setIsStyleLoading(true);
    setError(null);
    try {
      const result = await extractWorldStyle({ referenceArtDataUri: dataUri });
      setWorldStyle(result);
      toast({
        title: "Style Extracted",
        description: "New world style has been created.",
      });
    } catch (e: any) {
      const errorMessage = e.message || 'An unknown error occurred';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error Extracting Style",
        description: errorMessage,
      });
    } finally {
      setIsStyleLoading(false);
    }
  };

  const handleAssetGeneration = async (
    mode: 'text' | 'visual',
    params: { prompt?: string; visualGuideDataUri?: string; assetType: AssetType }
  ) => {
    startTransition(async () => {
      setError(null);
      setGeneratedAsset(null);

      try {
        let result: GenerationResult;
        if (mode === 'text' && params.prompt) {
          result = await generateAssetsFromTextPrompt({ prompt: params.prompt });
        } else if (mode === 'visual' && params.visualGuideDataUri) {
          if (!worldStyle) {
            throw new Error("A World Style must be extracted before generating from a visual guide.");
          }
          result = await generateAssetsFromVisualGuide({
            visualGuideDataUri: params.visualGuideDataUri,
            worldStyle: worldStyle,
            assetType: params.assetType,
            parameters: 'tile_size: 32x32', // Placeholder parameters
          });
        } else {
          throw new Error('Invalid generation parameters.');
        }

        setGeneratedAsset(result);
        toast({
          title: "Asset Generated",
          description: "Your new asset is ready in the playground.",
        });
      } catch (e: any) {
        const errorMessage = e.message || 'An unknown error occurred during generation.';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: errorMessage,
        });
      }
    });
  };

  const clearAsset = () => {
    setGeneratedAsset(null);
  };

  const value = {
    worldStyle,
    generatedAsset,
    isLoading: isPending,
    isStyleLoading,
    error,
    extractStyle: handleStyleExtraction,
    generateAsset: handleAssetGeneration,
    clearAsset,
  };

  return (
    <GenerationContext.Provider value={value}>
      {children}
    </GenerationContext.Provider>
  );
}

export function useGeneration() {
  const context = useContext(GenerationContext);
  if (context === undefined) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
}
