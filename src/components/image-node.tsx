
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
  onGenerateGif: (nodeId: string, columns: number, rows: number) => void;
}

export function ImageNode({ id, data, onGenerate, onGenerateGif }: ImageNodeProps) {
  const { setNodes, setEdges } = useReactFlow();
  const nodeId = useNodeId();
  const [columns, setColumns] = useState(4);
  const [rows, setRows] = useState(4);

  const onDelete = useCallback(() => {
    if (!id) return;
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id));
  }, [id, setNodes, setEdges]);
  
  const connectionNodeId = useStore(connectionNodeIdSelector);
  const isTarget = connectionNodeId && connectionNodeId !== id;
  
  const displayImage = data.image || data.sourceImage;
  
  const handleGenerateClick = () => {
    if (nodeId) {
      if(data.nodeType === 'asset-generator') {
        onGenerate(nodeId);
      } else {
        onGenerateGif(nodeId, columns, rows);
      }
    }
  };
  
  const isGifNode = data.nodeType === 'generate-gif';
  const isAssetGeneratorReady = !isGifNode; 

  return (
    <div className={`w-80 rounded-lg border bg-card text-card-foreground shadow-sm ${isTarget ? 'border-primary' : ''}`}>
       <div className="flex items-center justify-between border-b p-4">
        <div className="text-sm font-semibold tracking-tight">{data.label}</div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-accent hover:text-accent-foreground" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 flex flex-col items-center justify-center gap-4 min-h-[200px]">
        {data.loading ? (
          <Skeleton className="w-[250px] h-[250px] bg-muted" />
        ) : displayImage ? (
          <Image
            src={displayImage}
            alt={data.label}
            width={300}
            height={300}
            className="rounded-md"
          />
        ) : (
          <div className="text-muted-foreground text-sm text-center px-6">
            {isGifNode ? 'Connect an Asset Generator node' : 'Connect a sequence of Keyframe nodes'}
          </div>
        )}

        {isGifNode && (data.sourceImage || data.image) && !data.loading && (
           <div className="w-full grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="columns" className="text-xs font-medium text-muted-foreground">Columns</Label>
                <Input
                id="columns"
                type="number"
                value={columns}
                onChange={(e) => setColumns(parseInt(e.target.value, 10))}
                className="nodrag"
                />
            </div>
            <div className="space-y-2">
                 <Label htmlFor="rows" className="text-xs font-medium text-muted-foreground">Rows</Label>
                <Input
                id="rows"
                type="number"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value, 10))}
                className="nodrag"
                />
            </div>
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
