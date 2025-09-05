'use client';

import React, { useState, useCallback, DragEvent, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
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
            >
                <Background />
                <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
                <FloatingControls />
            </ReactFlow>
        </div>
    </div>
  );
}

export default function CanvasPage() {
    return (
        <ReactFlowProvider>
            <Canvas />
        </ReactFlowProvider>
    )
}