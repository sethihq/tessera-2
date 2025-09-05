
'use client';
import { useCallback, useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from 'reactflow';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles, PlusCircle, Trash2 } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';

interface SpriteSheetPromptNodeProps {
  id: string;
  data: {
    label: string;
    promptData: any;
  };
  onGenerate: (nodeId: string) => void;
}

export function SpriteSheetPromptNode({ id, data, onGenerate }: SpriteSheetPromptNodeProps) {
  const { setNodes, setEdges, getNode } = useReactFlow();
  const nodeId = useNodeId();

  const [promptData, setPromptData] = useState(data.promptData);

  const updateNodeData = (newData: any) => {
    if (!nodeId) return;
    const node = getNode(nodeId);
    if (!node) return;

    const newNode = { ...node, data: { ...node.data, promptData: newData } };
    setNodes(nodes => nodes.map(n => (n.id === nodeId ? newNode : n)));
  };

  const handleInputChange = (path: string, value: string) => {
    const newPromptData = { ...promptData };
    const keys = path.split('.');
    let current = newPromptData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setPromptData(newPromptData);
    updateNodeData(newPromptData);
  };
  
  const handleStageChange = (index: number, field: string, value: string) => {
    const newStages = [...promptData.sprite_sheet.animation.stages];
    newStages[index][field] = value;
    handleInputChange('sprite_sheet.animation.stages', newStages as any);
  };

  const handleFrameChange = (index: number, value: string) => {
    const newFrames = [...promptData.sprite_sheet.frames];
    newFrames[index].description = value;
    handleInputChange('sprite_sheet.frames', newFrames as any);
  };
  
  const addStage = () => {
    const newStages = [...promptData.sprite_sheet.animation.stages, { stage_number: promptData.sprite_sheet.animation.stages.length + 1, label: '', description: '' }];
    handleInputChange('sprite_sheet.animation.stages', newStages as any);
  };

  const removeStage = (index: number) => {
    const newStages = promptData.sprite_sheet.animation.stages.filter((_: any, i: number) => i !== index);
    handleInputChange('sprite_sheet.animation.stages', newStages as any);
  };

  const addFrame = () => {
    const newFrames = [...promptData.sprite_sheet.frames, { frame_number: promptData.sprite_sheet.frames.length + 1, stage: 1, description: '' }];
     handleInputChange('sprite_sheet.frames', newFrames as any);
  };

  const removeFrame = (index: number) => {
    const newFrames = promptData.sprite_sheet.frames.filter((_: any, i: number) => i !== index);
    handleInputChange('sprite_sheet.frames', newFrames as any);
  };

  const onDelete = useCallback(() => {
    if (!nodeId) return;
    setNodes(nodes => nodes.filter(n => n.id !== nodeId));
    setEdges(edges => edges.filter(e => e.source !== nodeId && e.target !== nodeId));
  }, [nodeId, setNodes, setEdges]);

  const handleGenerateClick = () => {
    if (nodeId) {
      onGenerate(nodeId);
    }
  };

  return (
    <Card className="w-96">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{data.label}</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div
          className="nodrag"
          onWheel={(event) => event.stopPropagation()}
        >
          <ScrollArea 
            className="h-96 w-full pr-4"
          >
            <div className="space-y-4">
              <h4 className="font-semibold">Character</h4>
              <div className="space-y-2">
                <Label>Identity</Label>
                <Input
                  defaultValue={promptData.sprite_sheet.character.identity}
                  onChange={e => handleInputChange('sprite_sheet.character.identity', e.target.value)}
                  placeholder="e.g., a wizard with long white beard..."
                />
              </div>
              <div className="space-y-2">
                <Label>Base Pose</Label>
                <Input
                  defaultValue={promptData.sprite_sheet.character.base_pose}
                  onChange={e => handleInputChange('sprite_sheet.character.base_pose', e.target.value)}
                  placeholder="e.g., neutral pose, frontal view..."
                />
              </div>

              <h4 className="font-semibold">Animation</h4>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                   defaultValue={promptData.sprite_sheet.animation.title}
                   onChange={e => handleInputChange('sprite_sheet.animation.title', e.target.value)}
                  placeholder="e.g., casting fireball spell"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Stages</h4>
                  <Button variant="outline" size="sm" onClick={addStage}><PlusCircle className="mr-2 h-4 w-4" /> Add Stage</Button>
                </div>
                {promptData.sprite_sheet.animation.stages.map((stage: any, index: number) => (
                  <div key={index} className="p-2 border rounded-md space-y-2 relative">
                     <Button variant="ghost" size="icon" className="h-6 w-6 absolute top-1 right-1" onClick={() => removeStage(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                     <Label>Stage {stage.stage_number}</Label>
                     <Input placeholder="Label (e.g., Setup)" defaultValue={stage.label} onChange={(e) => handleStageChange(index, 'label', e.target.value)} />
                     <Textarea placeholder="Description..." defaultValue={stage.description} onChange={(e) => handleStageChange(index, 'description', e.target.value)} />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Frames</h4>
                </div>
                {promptData.sprite_sheet.frames.map((frame: any, index: number) => (
                   <div key={index} className="p-2 border rounded-md space-y-2 relative">
                     <Button variant="ghost" size="icon" className="h-6 w-6 absolute top-1 right-1" onClick={() => removeFrame(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                     <Label>Frame {frame.frame_number}</Label>
                     <Textarea placeholder="Description..." defaultValue={frame.description} onChange={(e) => handleFrameChange(index, e.target.value)} />
                   </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="w-full" onClick={addFrame}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Frame
        </Button>
        <Button className="w-full" onClick={handleGenerateClick}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate
        </Button>
      </CardFooter>
    </Card>
  );
}
