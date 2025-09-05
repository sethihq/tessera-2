'use client';
import { useCallback } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from 'reactflow';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';

interface PromptNodeProps {
  id: string;
  data: {
    label: string;
    prompt: string;
  };
  onGenerate: (nodeId: string) => void;
}

export function PromptNode({ id, data, onGenerate }: PromptNodeProps) {
  const { setNodes, setEdges, getNode } = useReactFlow();
  const nodeId = useNodeId();

  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!nodeId) return;
    const node = getNode(nodeId);
    if (!node) return;
    
    const newNode = {
      ...node,
      data: {
        ...node.data,
        prompt: evt.target.value,
      },
    };

    setNodes(nodes => nodes.map(n => n.id === nodeId ? newNode : n));
  }, [nodeId, getNode, setNodes]);

  const onDelete = useCallback(() => {
    if (!nodeId) return;
    setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
    setEdges((edges) => edges.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [nodeId, setNodes, setEdges]);

  const handleGenerateClick = () => {
    if (nodeId) {
      onGenerate(nodeId);
    }
  };

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
      <CardFooter>
        <Button className="w-full" onClick={handleGenerateClick}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate
        </Button>
      </CardFooter>
    </Card>
  );
}

    