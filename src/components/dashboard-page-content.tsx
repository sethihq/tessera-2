
"use client";

import React, { useState, useCallback, DragEvent, useMemo, Suspense, KeyboardEvent } from 'react';
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
  getConnectedEdges,
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
  const { getNodes, setNodes: setReactFlowNodes, getEdges, setEdges: setReactFlowEdges, getNode } = useReactFlow();

 const handleGenerate = useCallback(async (nodeId: string) => {
    const allNodes = getNodes();
    const allEdges = getEdges();
    
    const generatorNode = allNodes.find(n => n.id === nodeId);
    if (!generatorNode) return;

    // Set loading state and animate edges
    setReactFlowNodes(nds => 
      nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, loading: true } } : n)
    );
    const animatedEdgeIds = new Set(allEdges.filter(e => e.target === nodeId).map(e => e.id));
    setReactFlowEdges(eds => 
      eds.map(e => animatedEdgeIds.has(e.id) ? { ...e, type: 'custom', animated: true } : e)
    );

    try {
      let currentNode: Node | undefined = generatorNode;
      let characterNode: Node | undefined;
      let animationNode: Node | undefined;
      
      const keyframeNodes: Node[] = [];

      // Traverse backwards from the generator node to collect keyframes in order
      while (currentNode) {
        const incomers = getIncomers(currentNode, allNodes, allEdges);
        if (incomers.length === 0) break;
        
        const parentNode = incomers[0];

        if (parentNode.data.nodeType === 'keyframe') {
            keyframeNodes.unshift(parentNode); // Add to the beginning to maintain order
        } else if (parentNode.data.nodeType === 'animation') {
            animationNode = parentNode;
            const animationIncomers = getIncomers(animationNode, allNodes, allEdges);
            characterNode = animationIncomers.find(n => n.data.nodeType === 'character');
            break; 
        }
        currentNode = parentNode;
      }
      
      if (keyframeNodes.length === 0) {
        throw new Error("At least one Keyframe node must be in the sequence.");
      }
      
      const numberedKeyframes = keyframeNodes.map((node, index) => ({
          keyframe_number: index + 1,
          description: node.data.fields.find((f:any) => f.id === 'description')?.value,
      }));


      if (!characterNode || !animationNode) {
        throw new Error("A Character and an Animation node must be connected in sequence to the keyframes.");
      }

      const promptData = {
        sprite_sheet: {
          style: "Pixel art",
          canvas: {
            size: "64x64 pixels",
            background: "transparent",
            consistency: [
              "Use onion skinning principles to ensure frame-to-frame alignment.",
              "The character must be anchored to the center of each frame.",
              "Maintain a consistent character size and a centered bounding box across all keyframes."
            ]
          },
          character: {
            identity: characterNode.data.fields.find((f:any) => f.id === 'identity').value,
            base_pose: characterNode.data.fields.find((f:any) => f.id === 'base_pose').value,
          },
          animation: {
            title: animationNode.data.fields.find((f:any) => f.id === 'title').value,
          },
          keyframes: numberedKeyframes,
        }
      };

      const result = await generateSpriteSheet({ prompt: JSON.stringify(promptData, null, 2) });
      const { assetDataUri } = result;
      
      setReactFlowNodes(nds => 
          nds.map(n => {
              if (n.id === nodeId) {
                  return { ...n, data: { ...n.data, image: assetDataUri, loading: false } };
              }
              return n;
          })
      );
      
      const outgoingEdges = allEdges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        const connectedNodeId = edge.target;
        const connectedNode = allNodes.find(n => n.id === connectedNodeId);
        if (connectedNode && connectedNode.data.nodeType === 'generate-gif') {
          setReactFlowNodes(nds => 
            nds.map(n => {
              if (n.id === connectedNodeId) {
                return { ...n, data: { ...n.data, sourceImage: assetDataUri, image: null } }; 
              }
              return n;
            })
          );
        }
      }

    } catch (error: any) {
        console.error("Generation failed:", error);
        toast({
            variant: 'destructive',
            title: "Generation Failed",
            description: error.message || "There was an error generating the asset. Please try again.",
        });
        setReactFlowNodes(nds => 
            nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, loading: false } } : n)
        );
    } finally {
        setReactFlowEdges(eds => 
            eds.map(e => animatedEdgeIds.has(e.id) ? { ...e, type: 'default', animated: false } : e)
        );
    }
  }, [getNodes, setReactFlowNodes, toast, getEdges, setReactFlowEdges]);

  const handleGenerateGif = useCallback(async (nodeId: string, columns: number, rows: number) => {
    const allNodes = getNodes();
    const allEdges = getEdges();

    const gifNode = allNodes.find(n => n.id === nodeId);
    if (!gifNode) return;
    
    const sourceImageUri = gifNode.data.sourceImage;

    if (!sourceImageUri) {
       toast({
        variant: 'destructive',
        title: "GIF Generation Error",
        description: "The connected source node does not have an image. Please generate or connect an image.",
      });
      return;
    }
    
    setReactFlowNodes(nds => 
      nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, loading: true } } : n)
    );
    setReactFlowEdges(eds => 
      eds.map(e => e.target === nodeId ? { ...e, type: 'custom', animated: true } : e)
    );

    try {
      const result = await generateGifFromSpriteSheet({ sourceImageUri, columns, rows });
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
            nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, loading: false } } : n)
        );
    } finally {
        setReactFlowEdges(eds => 
            eds.map(e => e.target === nodeId ? { ...e, type: 'default', animated: false } : e)
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
        const sourceNode = allNodes.find(n => n.id === params.source);
        const targetNode = allNodes.find(n => n.id === params.target);
        
        if (targetNode?.data.nodeType === 'generate-gif' && sourceNode?.data.image) {
            setReactFlowNodes(nds => 
                nds.map(n => {
                    if (n.id === targetNode.id) {
                        return { ...n, data: { ...n.data, sourceImage: sourceNode.data.image, image: null } };
                    }
                    return n;
                })
            );
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

      const dataString = event.dataTransfer.getData('application/reactflow');
      if (!dataString || !reactFlowInstance) return;

      const { type, payload } = JSON.parse(dataString);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (type === 'workflow') {
        const { nodes: workflowNodes, edges: workflowEdges } = payload;
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        const idMap = new Map<string, string>();

        workflowNodes.forEach((node: any) => {
          const oldId = node.id;
          const newId = getId();
          idMap.set(oldId, newId);
          newNodes.push({
            id: newId,
            type: node.type,
            position: { x: position.x + node.position.x, y: position.y + node.position.y },
            data: { ...node.data },
          });
        });

        workflowEdges.forEach((edge: any) => {
          newEdges.push({
            ...edge,
            id: `e${idMap.get(edge.source)}-${idMap.get(edge.target)}`,
            source: idMap.get(edge.source)!,
            target: idMap.get(edge.target)!,
          });
        });

        setNodes((nds) => nds.concat(newNodes));
        setEdges((eds) => eds.concat(newEdges));

      } else { // It's a single node
        const { nodeType, data } = payload;
        const newNode: Node = {
          id: getId(),
          type: type,
          position,
          data: { ...data, nodeType },
        };
        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, setNodes, setEdges]
  );
  
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const allNodes = getNodes();

      if (event.ctrlKey || event.metaKey) {
        if (event.key.toLowerCase() === 'a') {
          event.preventDefault();
          setReactFlowNodes(allNodes.map(n => ({...n, selected: true})));
        } else if (event.key.toLowerCase() === 'd') {
          event.preventDefault();
          const selectedNodes = allNodes.filter((n) => n.selected);
          if (selectedNodes.length === 1) {
            const nodeToDuplicate = selectedNodes[0];
            const newNode: Node = {
              id: getId(),
              type: nodeToDuplicate.type,
              position: {
                x: nodeToDuplicate.position.x + 20,
                y: nodeToDuplicate.position.y + 20,
              },
              data: { ...nodeToDuplicate.data },
            };
            setReactFlowNodes((nds) => nds.concat(newNode));
          }
        }
      }
    },
    [getNodes, setReactFlowNodes]
  );

  return (
    <div className="flex h-full" onKeyDown={onKeyDown} tabIndex={0}>
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
                deleteKeyCode={['Backspace', 'Delete']}
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

export function DashboardPageContent() {
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
