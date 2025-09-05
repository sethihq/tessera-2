
"use client";

import React, { useState, useCallback, DragEvent, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  ReactFlowProvider,
  useReactFlow,
  getOutgoers,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NodesSidebar } from '@/components/nodes-sidebar';
import { PromptNode } from '@/components/prompt-node';
import { ImageNode } from '@/components/image-node';
import { FloatingControls, type Tool } from '@/components/floating-controls';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { generateAssetsFromTextPrompt } from '@/ai/flows/generate-assets-from-text-prompt';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';


const initialNodes: Node[] = [
  { 
    id: '1', 
    position: { x: 250, y: 5 }, 
    data: { 
      label: 'Prompt Node', 
      prompt: 'A medieval castle on a hill' 
    }, 
    type: 'prompt' 
  },
  { 
    id: '2', 
    position: { x: 100, y: 300 }, 
    data: { 
      label: 'Sprite Sheet',
      image: null,
      loading: false,
    }, 
    type: 'image' 
  },
  { 
    id: '3', 
    position: { x: 400, y: 300 }, 
    data: { 
      label: 'Output',
      image: null,
      loading: false, 
    }, 
    type: 'output' 
  },
];

const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

const proOptions = { hideAttribution: true };

let id = 4;
const getId = () => `${id++}`;

function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const { toast } = useToast();
  const { getNodes } = useReactFlow();

  const handleGenerate = useCallback(async (nodeId: string) => {
    const allNodes = getNodes();
    
    const promptNode = allNodes.find(n => n.id === nodeId);
    if (!promptNode) return;

    const downstreamNodes = getOutgoers(promptNode, nodes, edges);

    if (downstreamNodes.length === 0) {
      toast({
        variant: 'destructive',
        title: "Generation Error",
        description: "Please connect the prompt to an output node.",
      });
      return;
    }

    setNodes(nds => 
      nds.map(n => {
        if (downstreamNodes.some(dn => dn.id === n.id)) {
          return {
            ...n,
            data: { ...n.data, loading: true },
          };
        }
        return n;
      })
    );
    
    try {
      const { assetDataUri } = await generateAssetsFromTextPrompt({ prompt: promptNode.data.prompt });
      
      setNodes(nds => 
        nds.map(n => {
          if (downstreamNodes.some(dn => dn.id === n.id)) {
            return {
              ...n,
              data: { ...n.data, image: assetDataUri, loading: false },
            };
          }
          return n;
        })
      );
    } catch (error) {
      console.error("Generation failed:", error);
      toast({
        variant: 'destructive',
        title: "Generation Failed",
        description: "There was an error generating the asset. Please try again.",
      });
      setNodes(nds => 
        nds.map(n => {
          if (downstreamNodes.some(dn => dn.id === n.id)) {
            return {
              ...n,
              data: { ...n.data, loading: false },
            };
          }
          return n;
        })
      );
    }
  }, [getNodes, setNodes, toast, nodes, edges]);
  
  const nodeTypes: NodeTypes = useMemo(() => ({
    prompt: (props) => <PromptNode {...props} onGenerate={handleGenerate} />,
    image: ImageNode,
    output: ImageNode,
  }), [handleGenerate]);


  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }
      
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let newNode: Node;
      
      switch (type) {
        case 'prompt':
          newNode = {
            id: getId(),
            type,
            position,
            data: { label: 'Prompt Node', prompt: '' },
          };
          break;
        case 'sprite-sheet':
          newNode = {
            id: getId(),
            type: 'image',
            position,
            data: { label: 'Sprite Sheet', image: null, loading: false },
          };
          break;
         case 'generate-gif':
            newNode = {
                id: getId(),
                type: 'image',
                position,
                data: { label: 'Generate GIF', image: null, loading: false },
            };
            break;
        case 'output':
            newNode = {
                id: getId(),
                type: 'output',
                position,
                data: { label: 'Output', image: null, loading: false },
            };
            break;
        default:
            return;
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <div className="flex h-full">
        <NodesSidebar />
        <div className="flex-1 h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                fitView
                panOnDrag={activeTool === 'pan'}
                selectionOnDrag={activeTool === 'select'}
                className={activeTool === 'pan' ? 'cursor-grab' : ''}
                proOptions={proOptions}
            >
                <Background />
                <FloatingControls activeTool={activeTool} onToolChange={setActiveTool} />
            </ReactFlow>
        </div>
    </div>
  );
}

const projects = [
    {
        name: 'Main Scene',
        project: 'My Game',
        href: '/dashboard?file=main-scene',
        image: 'https://picsum.photos/800/600',
        image_hint: 'game level',
        lastUpdated: '2 hours ago',
    },
    {
        name: 'Character Sprites',
        project: 'My Game',
        href: '#',
        image: 'https://picsum.photos/800/600',
        image_hint: 'character sprite sheet',
        lastUpdated: '5 hours ago',
    },
    {
        name: 'Tileset',
        project: 'Platformer Kit',
        href: '#',
        image: 'https://picsum.photos/800/600',
        image_hint: 'game tileset',
        lastUpdated: '1 day ago',
    },
    {
        name: 'Player Controller',
        project: 'Platformer Kit',
        href: '#',
        image: 'https://picsum.photos/800/600',
        image_hint: 'game character',
        lastUpdated: '3 days ago',
    },
]

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const file = searchParams.get('file');

  if (file) {
    return (
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    );
  }

  return (
     <div>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Projects</h1>
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
            </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((item, index) => (
                <Link href={item.href} key={index}>
                    <Card className="overflow-hidden transition-all hover:shadow-lg">
                        <AspectRatio ratio={16/9}>
                            <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill
                                className="object-cover"
                                data-ai-hint={item.image_hint}
                            />
                        </AspectRatio>
                        <CardHeader>
                            <CardTitle>{item.name}</CardTitle>
                            <CardDescription>{item.project}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>Updated {item.lastUpdated}</span>
                            <Badge variant="secondary">{item.project === 'My Game' ? 'Personal' : 'Kit'}</Badge>
                        </CardFooter>
                    </Card>
                </Link>
            ))}
        </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardPageContent />
    </Suspense>
  )
}
