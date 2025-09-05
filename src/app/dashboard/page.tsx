

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
  getIncomers,
  getOutgoers,
  EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NodesSidebar } from '@/components/nodes-sidebar';
import { InputNode } from '@/components/input-node';
import { ImageNode } from '@/components/image-node';
import { FloatingControls, type Tool } from '@/components/floating-controls';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { generateSpriteSheet } from '@/ai/flows/generate-sprite-sheet';
import { generateGifFromSpriteSheet } from '@/ai/flows/generate-gif-from-sprite-sheet';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomEdge } from '@/components/custom-edge';


const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const proOptions = { hideAttribution: true };

let id = 1;
const getId = () => `${id++}`;

function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const { toast } = useToast();
  const { getNodes, setNodes: setReactFlowNodes, getEdges, setEdges: setReactFlowEdges } = useReactFlow();

  const handleGenerate = useCallback(async (nodeId: string) => {
    const allNodes = getNodes();
    const allEdges = getEdges();
    
    const outputNode = allNodes.find(n => n.id === nodeId);
    if (!outputNode) return;

    setReactFlowNodes(nds => 
      nds.map(n => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, loading: true } };
        }
        return n;
      })
    );
    
    const animatedEdgeIds = new Set(allEdges.filter(e => e.target === nodeId).map(e => e.id));
    setReactFlowEdges(eds => 
      eds.map(e => animatedEdgeIds.has(e.id) ? { ...e, type: 'custom', animated: true } : e)
    );

    try {
        const outputIncomers = getIncomers(outputNode, allNodes, allEdges);
        const animationNode = outputIncomers.find(n => n.data.nodeType === 'animation');

        if (!animationNode) {
            throw new Error("An Animation node must be connected to the Output node.");
        }
        
        const characterNode = getIncomers(animationNode, allNodes, allEdges).find(n => n.data.nodeType === 'character');
        
        if (!characterNode) {
            throw new Error("A Character node must be connected to the Animation node.");
        }

        const stageNodes = getOutgoers(animationNode, allNodes, allEdges).filter(n => n.data.nodeType === 'stage');

        if (stageNodes.length === 0) {
            throw new Error("At least one Stage node must be connected from the Animation node.");
        }
        
        const frames = [];
        for (const stageNode of stageNodes) {
            const stageOutgoers = getOutgoers(stageNode, allNodes, allEdges);
            const frameNodes = stageOutgoers.filter(n => n.data.nodeType === 'frame');
            
            for (const frameNode of frameNodes) {
                 frames.push({
                    frame_number: frames.length + 1,
                    stage: stageNode.data.fields.find((f:any) => f.id === 'stage_number')?.value,
                    description: frameNode.data.fields.find((f:any) => f.id === 'description')?.value,
                 });
            }
        }

        if (frames.length === 0) {
            throw new Error("At least one Frame node must be connected to a Stage node.");
        }

        const promptData = {
          sprite_sheet: {
            style: "Pixel art",
            canvas: {
              size: "64x64 pixels",
              background: "transparent",
              consistency: "same pose alignment, proportions, and framing across all frames"
            },
            character: {
              identity: characterNode.data.fields.find((f:any) => f.id === 'identity').value,
              base_pose: characterNode.data.fields.find((f:any) => f.id === 'base_pose').value,
            },
            animation: {
              title: animationNode.data.fields.find((f:any) => f.id === 'title').value,
              stages: stageNodes.map(sn => ({
                  stage_number: sn.data.fields.find((f:any) => f.id === 'stage_number').value,
                  label: sn.data.fields.find((f:any) => f.id === 'label').value,
                  description: sn.data.fields.find((f:any) => f.id === 'description').value,
              })),
            },
            frames,
          }
        };

        const result = await generateSpriteSheet({ prompt: JSON.stringify(promptData) });
        const { assetDataUri } = result;

        setReactFlowNodes(nds => 
            nds.map(n => {
                if (n.id === nodeId) {
                    return { ...n, data: { ...n.data, image: assetDataUri, loading: false } };
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
                if (n.id === nodeId) {
                    return { ...n, data: { ...n.data, loading: false } };
                }
                return n;
            })
        );
    } finally {
        setReactFlowEdges(eds => 
            eds.map(e => animatedEdgeIds.has(e.id) ? { ...e, type: 'default', animated: false } : e)
        );
    }
  }, [getNodes, setReactFlowNodes, toast, getEdges, setReactFlowEdges]);

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

    setReactFlowEdges(eds => 
      eds.map(e => {
        if (e.target === nodeId) {
          return { ...e, type: 'custom', animated: true };
        }
        return e;
      })
    );

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
    } finally {
        setReactFlowEdges(eds => 
            eds.map(e => {
                if (e.target === nodeId) {
                    return { ...e, type: 'default', animated: false };
                }
                return e;
            })
        );
    }

  }, [getNodes, getEdges, setReactFlowNodes, toast, setReactFlowEdges]);
  
  const nodeTypes: NodeTypes = useMemo(() => ({
    input: InputNode,
    output: (props) => <ImageNode {...props} onGenerate={handleGenerate} onGenerateGif={handleGenerateGif} />,
  }), [handleGenerate, handleGenerateGif]);

  const edgeTypes: EdgeTypes = useMemo(() => ({
    custom: CustomEdge,
  }), []);


  const onConnect = useCallback(
    (params: Edge | Connection) => {
        const newEdge = { ...params };
        const allNodes = getNodes();
        const targetNode = allNodes.find(n => n.id === params.target);
        
        if (targetNode?.data.nodeType === 'generate-gif') {
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

      const nodeDataString = event.dataTransfer.getData('application/reactflow');

      if (typeof nodeDataString === 'undefined' || !nodeDataString || !reactFlowInstance) {
        return;
      }
      
      const { type, nodeType, data } = JSON.parse(nodeDataString);

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { ...data, nodeType },
      };

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
                edgeTypes={edgeTypes}
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
                 <defs>
                    <linearGradient id="animated-gradient-url" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: 'hsl(var(--accent-foreground))', stopOpacity: 1}} />
                    </linearGradient>
                </defs>
                
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

    