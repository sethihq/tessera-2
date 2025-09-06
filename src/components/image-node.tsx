
'use client';
import { Handle, Position, useReactFlow, useNodeId, useStore } from 'reactflow';
import Image from 'next/image';
import { Button } from './ui/button';
import { Scissors, X, Workflow } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

const connectionNodeIdSelector = (state: any) => state.connectionNodeId;

interface ImageNodeProps {
  id: string;
  data: { 
    label: string; 
    nodeType: 'asset-generator' | 'generate-gif';
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

  const sourceNode = useMemo(() => {
    if (!id) return null;
    const edges = getEdges();
    const nodes = getNodes();
    const incomerEdge = edges.find(e => e.target === id);
    if (!incomerEdge) return null;
    return nodes.find(n => n.id === incomerEdge.source);
  }, [id, getEdges, getNodes]);

  const sourceNodeImage = sourceNode?.data.image;
  const isSourceAnimationNode = sourceNode?.data.nodeType === 'animation';
  

  const handleGenerateClick = () => {
    if (nodeId) {
      if(data.nodeType === 'asset-generator') {
        onGenerate(nodeId);
      } else {
        onGenerateGif(nodeId, gridSize);
      }
    }
  };
  
  const isGifNode = data.nodeType === 'generate-gif';
  const isGeneratorNode = data.nodeType === 'asset-generator';

  return (
    <div className={`w-80 rounded-lg border border-neutral-700 bg-neutral-900/80 text-white shadow-xl backdrop-blur-sm ${isTarget ? 'border-primary' : ''}`}>
       <div className="flex items-center justify-between border-b border-neutral-700 p-4">
        <div className="text-sm font-semibold tracking-tight">{data.label}</div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-400 hover:bg-neutral-700 hover:text-white" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 flex flex-col items-center justify-center gap-4 min-h-[200px]">
        {data.loading ? (
          <Skeleton className="w-[250px] h-[250px] bg-neutral-700" />
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
          <div className="text-neutral-400 text-sm text-center px-6">
            {isGifNode ? 'Connect an image node to generate a GIF' : 'Connect an Animation node to generate an asset'}
          </div>
        )}

        {isGifNode && (sourceNodeImage || data.image) && !data.loading && (
          <div className="w-full space-y-2 pt-4">
            <Label htmlFor="grid-size" className="text-xs font-medium text-neutral-400">Sprite Grid</Label>
            <Select value={gridSize} onValueChange={setGridSize}>
              <SelectTrigger id="grid-size" className="bg-neutral-800 border-neutral-700 text-white focus:ring-primary">
                <SelectValue placeholder="Select grid size" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                <SelectItem value="2x2">2x2</SelectItem>
                <SelectItem value="3x3">3x3</SelectItem>
                <SelectItem value="4x4">4x4</SelectItem>
                 <SelectItem value="8x8">8x8</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
      </div>
       <div className="p-4 pt-0">
        {(isGifNode && sourceNodeImage) || (isGeneratorNode && isSourceAnimationNode) ? (
          <Button className="w-full" onClick={handleGenerateClick} disabled={data.loading || (isGifNode && !sourceNodeImage)}>
            {isGeneratorNode ? <Workflow className="mr-2 h-4 w-4" /> : <Scissors className="mr-2 h-4 w-4" />}
            {isGeneratorNode ? 'Generate' : 'Generate GIF'}
          </Button>
        ) : null}
       </div>
       <Handle type="source" position={Position.Bottom} />
       <Handle type="target" position={Position.Top} />
    </div>
  );
}
