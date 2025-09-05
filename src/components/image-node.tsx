'use client';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export function ImageNode({ data }: { data: { label: string; image?: string } }) {

  return (
    <Card className="w-80">
        <CardHeader>
            <CardTitle className="text-base">{data.label}</CardTitle>
        </CardHeader>
      <CardContent className="min-h-40 flex items-center justify-center">
        {data.image ? (
            <Image 
                src={data.image} 
                alt={data.label}
                width={300}
                height={300} 
                className="rounded-md"
            />
        ) : (
            <div className="text-muted-foreground text-sm">
                No image generated
            </div>
        )}
        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Top} />
      </CardContent>
    </Card>
  );
}
