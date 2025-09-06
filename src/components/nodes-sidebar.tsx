

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Workflow, Text, ImageIcon, Scissors, User, Bot, Frame, ToyBrick } from 'lucide-react';
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
      label: 'Keyframe', 
      nodeType: 'keyframe', 
      icon: Frame,
      data: {
        label: 'Keyframe',
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
                { id: 'char', type: 'input', position: { x: 0, y: 0 }, data: { label: 'Character', nodeType: 'character', fields: [{ id: 'identity', label: 'Identity', type: 'textarea', value: '8-bit pixel art Goku, orange gi, black hair, muscular build.' }, { id: 'base_pose', label: 'Base Pose', type: 'text', value: 'Facing forward, ready stance.' }] } },
                { id: 'anim', type: 'input', position: { x: 0, y: 250 }, data: { label: 'Animation', nodeType: 'animation', fields: [{ id: 'title', label: 'Title', type: 'text', value: 'Kamehameha' }] } },
                { id: 'keyframe1', type: 'input', position: { x: 0, y: 460 }, data: { label: 'Keyframe 1', nodeType: 'keyframe', fields: [{ id: 'description', label: 'Description', type: 'textarea', value: 'Goku pulls his hands back to his right side, cupping them together. Knees are slightly bent.' }] } },
                { id: 'keyframe2', type: 'input', position: { x: 0, y: 670 }, data: { label: 'Keyframe 2', nodeType: 'keyframe', fields: [{ id: 'description', label: 'Description', type: 'textarea', value: 'A small, bright blue ball of energy appears between his cupped hands. The energy glows, illuminating his side.' }] } },
                { id: 'keyframe3', type: 'input', position: { x: 0, y: 880 }, data: { label: 'Keyframe 3', nodeType: 'keyframe', fields: [{ id: 'description', label: 'Description', type: 'textarea', value: 'Goku begins to thrust his hands forward, the energy ball leading the motion.' }] } },
                { id: 'keyframe4', type: 'input', position: { x: 0, y: 1090 }, data: { label: 'Keyframe 4', nodeType: 'keyframe', fields: [{ id: 'description', label: 'Description', type: 'textarea', value: 'With hands fully extended, a powerful beam of blue energy erupts forward. His body is braced from the force.' }] } },
                { id: 'keyframe5', type: 'input', position: { x: 0, y: 1300 }, data: { label: 'Keyframe 5', nodeType: 'keyframe', fields: [{ id: 'description', label: 'Description', type: 'textarea', value: 'The beam continues to fire, reaching its full width. The area around Goku is brightly lit by the beam.' }] } },
                { id: 'keyframe6', type: 'input', position: { x: 0, y: 1510 }, data: { label: 'Keyframe 6', nodeType: 'keyframe', fields: [{ id: 'description', label: 'Description', type: 'textarea', value: 'The beam dissipates. Goku holds his follow-through pose for a moment, hands still extended, before returning to a ready stance.' }] } },
                { id: 'gen', type: 'output', position: { x: 0, y: 1720 }, data: { label: 'Asset Generator', nodeType: 'asset-generator', image: null, loading: false } },
                { id: 'gif', type: 'output', position: { x: 400, y: 1720 }, data: { label: 'Generate GIF', nodeType: 'generate-gif', image: null, loading: false } },
            ],
            edges: [
                { id: 'e-char-anim', source: 'char', target: 'anim' },
                { id: 'e-anim-keyframe1', source: 'anim', target: 'keyframe1' },
                { id: 'e-keyframe1-keyframe2', source: 'keyframe1', target: 'keyframe2' },
                { id: 'e-keyframe2-keyframe3', source: 'keyframe2', target: 'keyframe3' },
                { id: 'e-keyframe3-keyframe4', source: 'keyframe3', target: 'keyframe4' },
                { id: 'e-keyframe4-keyframe5', source: 'keyframe4', target: 'keyframe5' },
                { id: 'e-keyframe5-keyframe6', source: 'keyframe5', target: 'keyframe6' },
                { id: 'e-keyframe6-gen', source: 'keyframe6', target: 'gen' },
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
