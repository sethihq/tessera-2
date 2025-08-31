"use client";

import type React from 'react';
import { useState } from 'react';
import { useGeneration, type AssetType } from '@/context/generation-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Palette, UploadCloud, Wand2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
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
    <Card className="bg-transparent border-none shadow-none">
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="picture" className="text-xs text-muted-foreground">Reference Art</Label>
          <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="bg-transparent"/>
        </div>
        {preview && (
          <div className="aspect-video rounded-md overflow-hidden border border-dashed flex items-center justify-center">
            <img src={preview} alt="Reference preview" className="max-h-full max-w-full object-contain" />
          </div>
        )}
        <Button onClick={handleExtract} disabled={!file || isStyleLoading} className="w-full">
          {isStyleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Palette className="mr-2 h-4 w-4" />}
          Extract Style
        </Button>
        {worldStyle && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Extracted Palette</h4>
            <div className="flex flex-wrap gap-2">
              {worldStyle.palette.map((color, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger>
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
      </CardContent>
    </Card>
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
        <Card className="bg-transparent border-none shadow-none">
            <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Tabs defaultValue="text" onValueChange={(value) => setMode(value as 'text' | 'visual')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">
                                <Wand2 className="mr-2 size-4" />
                                Prompt
                            </TabsTrigger>
                            <TabsTrigger value="visual" disabled={isVisualModeDisabled}>
                                 <UploadCloud className="mr-2 size-4" />
                                Visual
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="text" className="space-y-4 pt-4">
                            <Label htmlFor="prompt" className="text-xs text-muted-foreground">Prompt</Label>
                            <Textarea id="prompt" placeholder="e.g., A single 32x32 tile of a cracked stone floor for a dungeon." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className="bg-transparent" />
                        </TabsContent>
                        <TabsContent value="visual" className="space-y-4 pt-4">
                            <Label htmlFor="visual-guide" className="text-xs text-muted-foreground">Visual Guide (Sketch)</Label>
                            <Input id="visual-guide" type="file" accept="image/*" onChange={handleFileChange} disabled={isVisualModeDisabled} className="bg-transparent" />
                            {isVisualModeDisabled && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Info className="size-3.5" />
                                    Please extract a World Style first to enable this mode.
                                </p>
                            )}
                        </TabsContent>
                    </Tabs>

                    <div>
                        <Label htmlFor="asset-type" className="text-xs text-muted-foreground">Asset Type</Label>
                        <Select onValueChange={(value) => setAssetType(value as AssetType)} defaultValue={assetType}>
                            <SelectTrigger id="asset-type" className="bg-transparent">
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
                         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate Asset
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export function EditorPanel() {
  return (
    <div className="w-full p-0">
      <Accordion type="multiple" defaultValue={['style-section', 'generate-section']} className="w-full space-y-4">
        <AccordionItem value="style-section" className="border-b-0 rounded-lg bg-background/50 p-4">
          <AccordionTrigger className="p-0 text-base font-semibold hover:no-underline">World Style</AccordionTrigger>
          <AccordionContent className="pt-4">
            <WorldStyleExtractor />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="generate-section" className="border-b-0 rounded-lg bg-background/50 p-4">
          <AccordionTrigger className="p-0 text-base font-semibold hover:no-underline">Generate Asset</AccordionTrigger>
          <AccordionContent className="pt-4">
            <GenerationForm />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
