
'use client';
import { Handle, Position, useReactFlow, useNodeId } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { useCallback } from 'react';
import { Skeleton } from './ui/skeleton';

export function ImageNode({ data }: { data: { label: string; image?: string; loading?: boolean } }) {
  const { setNodes, setEdges } = useReactFlow();
  const id = useNodeId();

  const onDelete = useCallback(() => {
    if (!id) return;
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id));
  }, [id, setNodes, setEdges]);

  return (
    <Card className="w-80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{data.label}</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="min-h-40 flex items-center justify-center">
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
        ) : (
          <div className="text-muted-foreground text-sm">No image generated</div>
        )}
        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Top} />
      </CardContent>
    </Card>
  );
}
