

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Workflow, Text, ImageIcon, Scissors, User, Bot, Layers, Frame, ToyBrick } from 'lucide-react';
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
        label: 'Asset Generator', 
        nodeType: 'asset-generator', 
        icon: Workflow,
        data: { label: 'Asset Generator', image: null, loading: false }
      },
      { 
        label: 'Generate GIF', 
        nodeType: 'generate-gif', 
        icon: Scissors,
        data: { label: 'Generate GIF', image: null, loading: false }
      },
  ]
};

const workflows = [
    {
        label: 'Sprite Animation',
        icon: ToyBrick,
        type: 'workflow',
        payload: {
            nodes: [
                { id: 'char', type: 'input', position: { x: 0, y: 0 }, data: { label: 'Character', nodeType: 'character', fields: [{ id: 'identity', label: 'Identity', type: 'textarea', value: 'a knight with shining armor' }, { id: 'base_pose', label: 'Base Pose', type: 'text', value: 'standing, facing forward' }] } },
                { id: 'anim', type: 'input', position: { x: 0, y: 250 }, data: { label: 'Animation', nodeType: 'animation', fields: [{ id: 'title', label: 'Title', type: 'text', value: 'sword swing' }] } },
                { id: 'stage', type: 'input', position: { x: 0, y: 500 }, data: { label: 'Stage', nodeType: 'stage', fields: [{ id: 'stage_number', label: 'Stage Number', type: 'number', value: '1' }, { id: 'label', label: 'Label', type: 'text', value: 'Anticipation' }, { id: 'description', label: 'Description', type: 'textarea', value: 'knight raises sword' }] } },
                { id: 'frame', type: 'input', position: { x: 0, y: 750 }, data: { label: 'Frame', nodeType: 'frame', fields: [{ id: 'description', label: 'Description', type: 'textarea', value: 'sword is halfway up' }] } },
                { id: 'gen', type: 'output', position: { x: 400, y: 250 }, data: { label: 'Asset Generator', nodeType: 'asset-generator', image: null, loading: false } },
                { id: 'gif', type: 'output', position: { x: 800, y: 250 }, data: { label: 'Generate GIF', nodeType: 'generate-gif', image: null, loading: false } },
            ],
            edges: [
                { id: 'e-char-anim', source: 'char', target: 'anim' },
                { id: 'e-anim-stage', source: 'anim', target: 'stage', sourceHandle: 'stage-out' },
                { id: 'e-stage-frame', source: 'stage', target: 'frame' },
                { id: 'e-anim-gen', source: 'anim', target: 'gen', sourceHandle: 'asset-out' },
                { id: 'e-gen-gif', source: 'gen', target: 'gif' },
            ],
        },
    }
];

export function NodesSidebar() {
  const onDragStart = (event: DragEvent, type: 'input' | 'output' | 'workflow', payload: any) => {
    const data = { type, payload };
    if (type !== 'workflow') {
      data.payload = { nodeType: payload.nodeType, data: payload.data };
    }
    event.dataTransfer.setData('application/reactflow', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-80 border-r bg-background p-4">
      <h2 className="text-lg font-semibold tracking-tight mb-4">Lego Blocks</h2>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ToyBrick className="h-4 w-4" />
              Workflows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
             {workflows.map(flow => (
              <Button 
                key={flow.label}
                variant="outline" 
                className="w-full justify-start"
                onDragStart={(event) => onDragStart(event, 'workflow', flow.payload)}
                draggable
              >
                <flow.icon className="mr-2 h-4 w-4" />
                {flow.label}
              </Button>
            ))}
          </CardContent>
        </Card>
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
                onDragStart={(event) => onDragStart(event, 'input', block)}
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
                onDragStart={(event) => onDragStart(event, 'output', block)}
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
