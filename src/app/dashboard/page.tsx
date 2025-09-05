
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
  getIncomers,
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
import { generateSpriteSheet } from '@/ai/flows/generate-sprite-sheet';
import { generateGifFromSpriteSheet } from '@/ai/flows/generate-gif-from-sprite-sheet';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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
  const { getNodes, setNodes: setReactFlowNodes, getEdges } = useReactFlow();

  const handleGenerate = useCallback(async (nodeId: string) => {
    const allNodes = getNodes();
    
    const promptNode = allNodes.find(n => n.id === nodeId);
    if (!promptNode) return;

    const downstreamNodes = getOutgoers(promptNode, allNodes, edges);

    if (downstreamNodes.length === 0) {
      toast({
        variant: 'destructive',
        title: "Generation Error",
        description: "Please connect the prompt to an output node.",
      });
      return;
    }

    setReactFlowNodes(nds => 
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
    
    for (const targetNode of downstreamNodes) {
        try {
          const isSpriteSheet = targetNode.data.label === 'Sprite Sheet';
          
          let result;
          if (isSpriteSheet) {
            result = await generateSpriteSheet({ prompt: promptNode.data.prompt });
          } else {
            result = await generateAssetsFromTextPrompt({ prompt: promptNode.data.prompt });
          }
    
          const { assetDataUri } = result;
          
          setReactFlowNodes(nds => 
            nds.map(n => {
              if (n.id === targetNode.id) {
                 return {
                  ...n,
                  data: { ...n.data, image: assetDataUri, loading: false },
                };
              }
              return n;
            })
          );
        } catch (error: any) {
          console.error("Generation failed:", error);
          toast({
            variant: 'destructive',
            title: "Generation Failed",
            description: error.message || "There was an error generating the asset. Please try again.",
          });
          setReactFlowNodes(nds => 
            nds.map(n => {
              if (n.id === targetNode.id) {
                return {
                  ...n,
                  data: { ...n.data, loading: false },
                };
              }
              return n;
            })
          );
        }
    }
  }, [getNodes, setReactFlowNodes, toast, edges]);

  const handleGenerateGif = useCallback(async (nodeId: string, grid: string) => {
    const allNodes = getNodes();
    const allEdges = getEdges();

    const gifNode = allNodes.find(n => n.id === nodeId);
    if (!gifNode) return;
    
    const incomers = getIncomers(gifNode, allNodes, allEdges);
    if (incomers.length === 0) {
      toast({
        variant: 'destructive',
        title: "GIF Generation Error",
        description: "Please connect an image node to the Generate GIF node.",
      });
      return;
    }

    const sourceNode = incomers[0];
    const sourceImageUri = sourceNode.data.image;

    if (!sourceImageUri) {
       toast({
        variant: 'destructive',
        title: "GIF Generation Error",
        description: "The connected source node does not have an image.",
      });
      return;
    }

    setReactFlowNodes(nds => 
      nds.map(n => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: { ...n.data, loading: true },
          };
        }
        return n;
      })
    );

    try {
      const result = await generateGifFromSpriteSheet({ sourceImageUri, grid });
      const { assetDataUri } = result;
      setReactFlowNodes(nds => 
        nds.map(n => {
          if (n.id === nodeId) {
             return {
              ...n,
              data: { ...n.data, image: assetDataUri, loading: false },
            };
          }
          return n;
        })
      );
    } catch (error: any) {
       console.error("GIF Generation failed:", error);
        toast({
            variant: 'destructive',
            title: "GIF Generation Failed",
            description: error.message || "There was an error generating the GIF. Please try again.",
        });
        setReactFlowNodes(nds => 
            nds.map(n => {
                if (n.id === nodeId) {
                    return { ...n, data: { ...n.data, loading: false } };
                }
                return n;
            })
        );
    }

  }, [getNodes, getEdges, setReactFlowNodes, toast]);
  
  const nodeTypes: NodeTypes = useMemo(() => ({
    prompt: (props) => <PromptNode {...props} onGenerate={handleGenerate} />,
    image: (props) => <ImageNode {...props} onGenerateGif={handleGenerateGif} />,
    output: (props) => <ImageNode {...props} onGenerateGif={handleGenerateGif} />,
  }), [handleGenerate, handleGenerateGif]);


  const onConnect = useCallback(
    (params: Edge | Connection) => {
        const newEdge = { ...params };
        const allNodes = getNodes();
        const targetNode = allNodes.find(n => n.id === params.target);

        if (targetNode?.data.label === 'Generate GIF') {
            const sourceNode = allNodes.find(n => n.id === params.source);
            if (sourceNode?.data.image) {
                 setReactFlowNodes(nds => 
                    nds.map(n => {
                        if (n.id === targetNode.id) {
                            return { ...n, data: { ...n.data, sourceImage: sourceNode.data.image } };
                        }
                        return n;
                    })
                );
            }
        }

        setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, getNodes, setReactFlowNodes]
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
        type: 'Personal'
    },
    {
        name: 'Character Sprites',
        project: 'My Game',
        href: '#',
        image: 'https://picsum.photos/800/600',
        image_hint: 'character sprite sheet',
        lastUpdated: '5 hours ago',
        type: 'Personal'
    },
    {
        name: 'Tileset',
        project: 'Platformer Kit',
        href: '#',
        image: 'https://picsum.photos/800/600',
        image_hint: 'game tileset',
        lastUpdated: '1 day ago',
        type: 'Kit'
    },
    {
        name: 'Player Controller',
        project: 'Platformer Kit',
        href: '#',
        image: 'https://picsum.photos/800/600',
        image_hint: 'game character',
        lastUpdated: '3 days ago',
        type: 'Kit'
    },
]

function ProjectGrid({ filter }: { filter: 'All' | 'Personal' | 'Kit' }) {
    const filteredProjects = projects.filter(p => filter === 'All' || p.type === filter);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((item, index) => (
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
                            <Badge variant="secondary">{item.type}</Badge>
                        </CardFooter>
                    </Card>
                </Link>
            ))}
        </div>
    )
}

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
     <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Tabs defaultValue="all">
            <div className="flex items-center">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="kits">Kits</TabsTrigger>
                </TabsList>
                <div className="ml-auto flex items-center gap-2">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </div>
            </div>
            <TabsContent value="all">
                <ProjectGrid filter="All" />
            </TabsContent>
            <TabsContent value="personal">
                <ProjectGrid filter="Personal" />
            </TabsContent>
            <TabsContent value="kits">
                <ProjectGrid filter="Kit" />
            </TabsContent>
        </Tabs>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardPageContent />
    </Suspense>
  )
}

    
