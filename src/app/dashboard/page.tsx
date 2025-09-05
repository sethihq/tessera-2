"use client";

import React, { useState, useCallback, DragEvent, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactFlow, {
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  ReactFlowProvider,
  useReactFlow,
  getConnectedEdges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Folder } from "lucide-react";
import { NodesSidebar } from '@/components/nodes-sidebar';
import { PromptNode } from '@/components/prompt-node';
import { ImageNode } from '@/components/image-node';
import { FloatingControls } from '@/components/floating-controls';

const initialNodes: Node[] = [
  { id: '1', position: { x: 250, y: 5 }, data: { label: 'Prompt Node', prompt: 'A medieval castle on a hill' }, type: 'prompt' },
  { id: '2', position: { x: 100, y: 200 }, data: { label: 'Sprite Sheet' }, type: 'image' },
  { id: '3', position: { x: 400, y: 200 }, data: { label: 'Output' }, type: 'output' },
];

const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

const nodeColor = (node: Node) => {
    switch (node.type) {
      case 'prompt':
        return '#6ede87';
      case 'output':
        return '#6865A5';
      default:
        return '#ff0072';
    }
  };

let id = 4;
const getId = () => `${id++}`;

function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const { getNodes, getEdges } = useReactFlow();

  const nodeTypes: NodeTypes = useMemo(() => ({
    prompt: PromptNode,
    image: ImageNode,
    output: ImageNode,
  }), []);


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
            data: { label: 'Sprite Sheet' },
          };
          break;
         case 'generate-gif':
            newNode = {
                id: getId(),
                type: 'image',
                position,
                data: { label: 'Generate GIF' },
            };
            break;
        case 'output':
            newNode = {
                id: getId(),
                type: 'output',
                position,
                data: { label: 'Output' },
            };
            break;
        default:
            return;
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDelete = useCallback(
    (nodesToRemove: Node[], edgesToRemove: Edge[]) => {
      const nodeIdsToRemove = new Set(nodesToRemove.map(n => n.id));
      const allEdges = getEdges();
      const allNodes = getNodes();

      const connectedEdges = allEdges.filter(edge => 
        nodeIdsToRemove.has(edge.source) || nodeIdsToRemove.has(edge.target)
      );

      const edgeIdsToRemove = new Set([...edgesToRemove, ...connectedEdges].map(e => e.id));

      setNodes(allNodes.filter(n => !nodeIdsToRemove.has(n.id)));
      setEdges(allEdges.filter(e => !edgeIdsToRemove.has(e.id)));
    },
    [getNodes, getEdges, setNodes, setEdges]
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
                onDelete={onDelete}
                fitView
            >
                <Background />
                <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
                <FloatingControls />
            </ReactFlow>
        </div>
    </div>
  );
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
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-background mb-6 mx-auto">
          <Folder className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Select a file</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Choose a file from the project list on the left to start editing on the canvas.
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPageContent />
    </Suspense>
  )
}
