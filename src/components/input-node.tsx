
'use client';
import { useCallback } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

type Field = {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number';
  value: any;
};

interface InputNodeProps {
  id: string;
  data: {
    label: string;
    fields: Field[];
  };
}

export function InputNode({ id, data }: InputNodeProps) {
  const { setNodes, setEdges, getNode } = useReactFlow();
  const nodeId = useNodeId();

  const handleFieldChange = (fieldId: string, value: string) => {
    if (!nodeId) return;
    const node = getNode(nodeId);
    if (!node) return;

    const newFields = node.data.fields.map((field: Field) => 
      field.id === fieldId ? { ...field, value } : field
    );

    const newNode = {
      ...node,
      data: { ...node.data, fields: newFields },
    };

    setNodes(nodes => nodes.map(n => n.id === nodeId ? newNode : n));
  };
  
  const onDelete = useCallback(() => {
    if (!nodeId) return;
    setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
    setEdges((edges) => edges.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [nodeId, setNodes, setEdges]);

  return (
    <Card className="w-80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{data.label}</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            {field.type === 'textarea' ? (
              <Textarea
                id={field.id}
                defaultValue={field.value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="nodrag"
              />
            ) : (
              <Input
                id={field.id}
                type={field.type}
                defaultValue={field.value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="nodrag"
              />
            )}
          </div>
        ))}
        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Top} />
      </CardContent>
    </Card>
  );
}
