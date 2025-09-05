
'use client';
import { Handle, Position, useReactFlow, useNodeId, useStore } from 'reactflow';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from './ui/button';
import { Scissors, X, Sparkles } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

const connectionNodeIdSelector = (state: any) => state.connectionNodeId;

interface ImageNodeProps {
  id: string;
  data: { 
    label: string; 
    nodeType: 'output' | 'generate-gif';
    image?: string; 
    loading?: boolean;
    sourceImage?: string;
  };
  onGenerate: (nodeId: string) => void;
  onGenerateGif: (nodeId: string, grid: string) => void;
}

export function ImageNode({ id, data, onGenerate, onGenerateGif }: ImageNodeProps) {
  const { setNodes, setEdges, getEdges, getNodes } = useReactFlow();
  const nodeId = useNodeId();
  const [gridSize, setGridSize] = useState('2x2');

  const onDelete = useCallback(() => {
    if (!id) return;
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id));
  }, [id, setNodes, setEdges]);
  
  const connectionNodeId = useStore(connectionNodeIdSelector);
  const isTarget = connectionNodeId && connectionNodeId !== id;

  const hasSourceConnection = useMemo(() => {
    const edges = getEdges();
    return edges.some(edge => edge.target === id);
  }, [id, getEdges]);

  const sourceNodeImage = useMemo(() => {
    if (!hasSourceConnection) return null;
    const nodes = getNodes();
    const edges = getEdges();
    const incomerEdge = edges.find(e => e.target === id);
    if (!incomerEdge) return null;
    const incomerNode = nodes.find(n => n.id === incomerEdge.source);
    return incomerNode?.data.image;
  }, [id, getNodes, getEdges, hasSourceConnection]);

  const handleGenerateClick = () => {
    if (nodeId) {
      if(data.nodeType === 'output') {
        onGenerate(nodeId);
      } else {
        onGenerateGif(nodeId, gridSize);
      }
    }
  };
  
  const isGifNode = data.nodeType === 'generate-gif';

  return (
    <Card className={`w-80 ${isTarget ? 'border-primary' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{data.label}</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="min-h-40 flex flex-col items-center justify-center gap-4">
        {data.loading ? (
          <Skeleton className="w-[250px] h-[250px]" />
        ) : data.image ? (
          <Image
            src={data.image}
            alt={data.label}
            width={300}
            height={300}
            className="rounded-md"
          />
        ) : isGifNode && sourceNodeImage ? (
           <Image
            src={sourceNodeImage}
            alt="Source for GIF"
            width={300}
            height={300}
            className="rounded-md opacity-50"
          />
        ) : (
          <div className="text-muted-foreground text-sm">
            {isGifNode ? 'Connect an image to generate a GIF' : 'Connect inputs to generate'}
          </div>
        )}

        {isGifNode && (sourceNodeImage || data.image) && !data.loading && (
          <div className="w-full space-y-2">
            <Label htmlFor="grid-size">Sprite Grid</Label>
            <Select value={gridSize} onValueChange={setGridSize}>
              <SelectTrigger id="grid-size">
                <SelectValue placeholder="Select grid size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2x2">2x2</SelectItem>
                <SelectItem value="3x3">3x3</SelectItem>
                <SelectItem value="4x4">4x4</SelectItem>
                 <SelectItem value="8x8">8x8</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Top} />
      </CardContent>
       {(isGifNode && (sourceNodeImage || data.image)) || data.nodeType === 'output' && (
        <CardFooter>
          <Button className="w-full" onClick={handleGenerateClick} disabled={data.loading}>
            {isGifNode ? <Scissors className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isGifNode ? 'Generate GIF' : 'Generate'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
