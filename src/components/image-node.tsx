
'use client';
import { Handle, Position, useReactFlow, useNodeId, useStore } from 'reactflow';
import Image from 'next/image';
import { Button } from './ui/button';
import { Scissors, X, Workflow } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
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
  const { setNodes, setEdges } = useReactFlow();
  const nodeId = useNodeId();
  const [gridSize, setGridSize] = useState('4x4');

  const onDelete = useCallback(() => {
    if (!id) return;
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id));
  }, [id, setNodes, setEdges]);
  
  const connectionNodeId = useStore(connectionNodeIdSelector);
  const isTarget = connectionNodeId && connectionNodeId !== id;
  
  // The primary image to display. If the node has its own generated image (a GIF), show that.
  // Otherwise, show the source image passed from the generator.
  const displayImage = data.image || data.sourceImage;
  
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
  // Asset generator is ready if it's connected to something. A more robust check might be needed.
  const isAssetGeneratorReady = !isGifNode; 

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
        ) : displayImage ? (
          <Image
            src={displayImage}
            alt={data.label}
            width={300}
            height={300}
            className="rounded-md"
          />
        ) : (
          <div className="text-neutral-400 text-sm text-center px-6">
            {isGifNode ? 'Connect an Asset Generator node' : 'Connect a sequence of Keyframe nodes'}
          </div>
        )}

        {isGifNode && (data.sourceImage || data.image) && !data.loading && (
          <div className="w-full space-y-2 pt-4">
            <Label htmlFor="grid-size" className="text-xs font-medium text-neutral-400">Sprite Grid</Label>
            <Input
              id="grid-size"
              placeholder="e.g., 4x4"
              value={gridSize}
              onChange={(e) => setGridSize(e.target.value)}
              className="nodrag bg-neutral-800 border-neutral-700 text-white focus:ring-primary"
            />
          </div>
        )}
        
      </div>
       <div className="p-4 pt-0">
        {(isGifNode && data.sourceImage) || isAssetGeneratorReady ? (
          <Button className="w-full" onClick={handleGenerateClick} disabled={data.loading || (isGifNode && !data.sourceImage)}>
            {data.nodeType === 'asset-generator' ? <Workflow className="mr-2 h-4 w-4" /> : <Scissors className="mr-2 h-4 w-4" />}
            {data.nodeType === 'asset-generator' ? 'Generate Asset' : 'Generate GIF'}
          </Button>
        ) : null}
       </div>
       <Handle type="source" position={Position.Bottom} />
       <Handle type="target" position={Position.Top} />
    </div>
  );
}
