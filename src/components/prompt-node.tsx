'use client';
import { useCallback } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from 'reactflow';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function PromptNode({ data }: { data: { label: string; prompt: string } }) {
  const { setNodes, setEdges } = useReactFlow();
  const id = useNodeId();

  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log(evt.target.value);
  }, []);

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
      <CardContent>
        <Textarea
          id="text"
          name="text"
          onChange={onChange}
          className="nodrag"
          defaultValue={data.prompt}
          placeholder="Enter your prompt here..."
        />
        <Handle type="source" position={Position.Bottom} />
      </CardContent>
    </Card>
  );
}
