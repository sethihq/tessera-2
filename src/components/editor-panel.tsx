"use client";

import type React from 'react';
import { useState } from 'react';
import { useGeneration, type AssetType } from '@/context/generation-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Palette, UploadCloud, Wand2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

function WorldStyleExtractor() {
  const { worldStyle, extractStyle, isStyleLoading } = useGeneration();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleExtract = async () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (loadEvent) => {
        const dataUri = loadEvent.target?.result as string;
        await extractStyle(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="picture">Reference Art</Label>
        <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      {preview && (
        <div className="aspect-video rounded-md overflow-hidden border border-dashed flex items-center justify-center bg-muted/50">
          <img src={preview} alt="Reference preview" className="max-h-full max-w-full object-contain" />
        </div>
      )}
      <Button onClick={handleExtract} disabled={!file || isStyleLoading} className="w-full">
        {isStyleLoading ? <Loader2 className="animate-spin" /> : <Palette />}
        Extract Style
      </Button>
      {worldStyle && (
        <div className="space-y-2">
          <Label>Extracted Palette</Label>
          <div className="flex flex-wrap gap-2">
            {worldStyle.palette.map((color, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-6 w-6 rounded-md border" style={{ backgroundColor: color }} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{color}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GenerationForm() {
    const { generateAsset, isLoading, worldStyle } = useGeneration();
    const [mode, setMode] = useState<'text' | 'visual'>('text');
    const [prompt, setPrompt] = useState('');
    const [assetType, setAssetType] = useState<AssetType>('tileset');
    const [visualGuideFile, setVisualGuideFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setVisualGuideFile(selectedFile);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        if (mode === 'text') {
            await generateAsset('text', { prompt, assetType });
        } else if (mode === 'visual' && visualGuideFile) {
             const reader = new FileReader();
             reader.onload = async (loadEvent) => {
                const dataUri = loadEvent.target?.result as string;
                await generateAsset('visual', { visualGuideDataUri: dataUri, assetType });
             };
             reader.readAsDataURL(visualGuideFile);
        }
    };
    
    const isVisualModeDisabled = !worldStyle;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="text" onValueChange={(value) => setMode(value as 'text' | 'visual')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">
                        <Wand2 />
                        Prompt
                    </TabsTrigger>
                    <TabsTrigger value="visual" disabled={isVisualModeDisabled}>
                         <UploadCloud />
                        Visual
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="space-y-4 pt-4">
                    <Label htmlFor="prompt">Prompt</Label>
                    <Textarea id="prompt" placeholder="e.g., A single 32x32 tile of a cracked stone floor for a dungeon." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} />
                </TabsContent>
                <TabsContent value="visual" className="space-y-4 pt-4">
                    <Label htmlFor="visual-guide">Visual Guide (Sketch)</Label>
                    <Input id="visual-guide" type="file" accept="image/*" onChange={handleFileChange} disabled={isVisualModeDisabled} />
                    {isVisualModeDisabled && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Info className="size-3.5" />
                            Please extract a World Style first to enable this mode.
                        </p>
                    )}
                </TabsContent>
            </Tabs>

            <div className='space-y-1.5'>
                <Label htmlFor="asset-type">Asset Type</Label>
                <Select onValueChange={(value) => setAssetType(value as AssetType)} defaultValue={assetType}>
                    <SelectTrigger id="asset-type">
                        <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="tileset">Tileset</SelectItem>
                        <SelectItem value="parallax">Parallax Background</SelectItem>
                        <SelectItem value="props">Props</SelectItem>
                        <SelectItem value="fx">FX Sprite</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || (mode === 'visual' && (!visualGuideFile || isVisualModeDisabled)) || (mode === 'text' && !prompt)}>
                 {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                Generate Asset
            </Button>
        </form>
    );
}

export function EditorPanel() {
  return (
    <div className="w-full p-4 space-y-4">
      <Accordion type="multiple" defaultValue={['style-section', 'generate-section']} className="w-full space-y-4">
        <AccordionItem value="style-section" className="border-none">
            <Card>
                <AccordionTrigger className="p-4 text-base font-semibold hover:no-underline">World Style</AccordionTrigger>
                <AccordionContent className="p-4 pt-0">
                    <WorldStyleExtractor />
                </AccordionContent>
            </Card>
        </AccordionItem>
        <AccordionItem value="generate-section" className="border-none">
            <Card>
              <AccordionTrigger className="p-4 text-base font-semibold hover:no-underline">Generate Asset</AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <GenerationForm />
              </AccordionContent>
            </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
