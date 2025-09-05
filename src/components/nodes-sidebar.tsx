
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Workflow, Text, ImageIcon, MoveRight, Scissors, FileText, User, Bot, Layers, Frame } from 'lucide-react';
import type { DragEvent } from 'react';

const legoBlocks = {
  inputs: [
    { 
      label: 'Character', 
      nodeType: 'character', 
      icon: User,
      data: {
        label: 'Character',
        fields: [
          { id: 'identity', label: 'Identity', type: 'textarea', value: 'a wizard with long white beard, blue robe, and staff' },
          { id: 'base_pose', label: 'Base Pose', type: 'text', value: 'neutral pose, frontal view' },
        ]
      }
    },
    { 
      label: 'Animation', 
      nodeType: 'animation', 
      icon: Bot,
      data: {
        label: 'Animation',
        fields: [
          { id: 'title', label: 'Title', type: 'text', value: 'casting fireball spell' },
        ]
      }
    },
    { 
      label: 'Stage', 
      nodeType: 'stage', 
      icon: Layers,
      data: {
        label: 'Stage',
        fields: [
          { id: 'stage_number', label: 'Stage Number', type: 'number', value: '1' },
          { id: 'label', label: 'Label', type: 'text', value: 'Setup' },
          { id: 'description', label: 'Description', type: 'textarea', value: 'character preparing the action' },
        ]
      }
    },
     { 
      label: 'Frame', 
      nodeType: 'frame', 
      icon: Frame,
      data: {
        label: 'Frame',
        fields: [
          { id: 'description', label: 'Description', type: 'textarea', value: 'wizard with neutral stance, slight hand motion' },
        ]
      }
    },
  ],
  outputs: [
      { 
        label: 'Generate GIF', 
        nodeType: 'generate-gif', 
        icon: Scissors,
        data: { label: 'Generate GIF', image: null, loading: false }
      },
      { 
        label: 'Output', 
        nodeType: 'output', 
        icon: MoveRight,
        data: { label: 'Output', image: null, loading: false }
      },
  ]
};

export function NodesSidebar() {
  const onDragStart = (event: DragEvent, type: string, nodeType: string, data: any) => {
    const nodeData = { type, nodeType, data };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-80 border-r bg-background p-4">
      <h2 className="text-lg font-semibold tracking-tight mb-4">Lego Blocks</h2>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Text className="h-4 w-4" />
              Input Blocks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {legoBlocks.inputs.map(block => (
              <Button 
                key={block.nodeType}
                variant="outline" 
                className="w-full justify-start"
                onDragStart={(event) => onDragStart(event, 'input', block.nodeType, block.data)}
                draggable
              >
                <block.icon className="mr-2 h-4 w-4" />
                {block.label}
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Output Blocks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
             {legoBlocks.outputs.map(block => (
              <Button 
                key={block.nodeType}
                variant="outline" 
                className="w-full justify-start"
                onDragStart={(event) => onDragStart(event, 'output', block.nodeType, block.data)}
                draggable
              >
                <block.icon className="mr-2 h-4 w-4" />
                {block.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
