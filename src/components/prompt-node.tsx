'use client';
import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PromptNode({ data }: { data: { label: string; prompt: string } }) {
  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log(evt.target.value);
  }, []);

  return (
    <Card className="w-80">
        <CardHeader>
            <CardTitle className="text-base">{data.label}</CardTitle>
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
