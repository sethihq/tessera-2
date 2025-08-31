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
import { Loader2, Palette, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

function WorldStyleExtractor() {
  const { worldStyle, extractStyle, isStyleLoading } = useGeneration();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
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
      <CardHeader className="p-4">
        <CardTitle className="text-base">World Style</CardTitle>
        <CardDescription className="text-xs">
          Define a consistent style from a reference image.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-4 pt-0">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Reference Art</Label>
          <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <Button onClick={handleExtract} disabled={!file || isStyleLoading}>
          {isStyleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Palette className="mr-2 h-4 w-4" />}
          Extract Style
        </Button>
        {worldStyle && (
          <div>
            <h4 className="text-sm font-medium mb-2">Extracted Palette:</h4>
            <div className="flex flex-wrap gap-2">
              {worldStyle.palette.map((color, index) => (
                <div key={index} className="h-6 w-6 rounded-sm border" style={{ backgroundColor: color }} title={color} />
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
            <CardHeader className="p-4">
                <CardTitle className="text-base">Generate Asset</CardTitle>
                 <CardDescription className="text-xs">
                  Create new assets based on your world style.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs defaultValue="text" onValueChange={(value) => setMode(value as 'text' | 'visual')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Text Prompt</TabsTrigger>
                            <TabsTrigger value="visual" disabled={isVisualModeDisabled} title={isVisualModeDisabled ? "Extract a World Style first" : ""}>
                                Visual Guide
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="text" className="space-y-4 pt-2">
                            <Label htmlFor="prompt">Prompt</Label>
                            <Textarea id="prompt" placeholder="e.g., Cyberpunk Rooftops 32x32 tiles, rain FX" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                        </TabsContent>
                        <TabsContent value="visual" className="space-y-4 pt-2">
                            <Label htmlFor="visual-guide">Visual Guide (Sketch)</Label>
                            <Input id="visual-guide" type="file" accept="image/*" onChange={handleFileChange} />
                        </TabsContent>
                    </Tabs>

                    <div>
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

                    <Button type="submit" className="w-full" disabled={isLoading || (mode === 'visual' && !visualGuideFile)}>
                         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                        Generate
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export function EditorPanel() {
  return (
    <div className="w-full p-0">
      <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">World Style</AccordionTrigger>
          <AccordionContent>
            <WorldStyleExtractor />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className="border-b-0">
          <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">Generate Asset</AccordionTrigger>
          <AccordionContent>
            <GenerationForm />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
