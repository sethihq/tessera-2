'use client';

import React, { useState, useCallback, DragEvent } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NodesSidebar } from '@/components/nodes-sidebar';

const initialNodes: Node[] = [
  { id: '1', position: { x: 250, y: 5 }, data: { label: 'Prompt Node' }, type: 'input' },
  { id: '2', position: { x: 100, y: 100 }, data: { label: 'Sprite Sheet' } },
  { id: '3', position: { x: 400, y: 100 }, data: { label: 'Sprite Sheet to GIF' } },
];

const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

const nodeColor = (node: Node) => {
    switch (node.type) {
      case 'input':
        return '#6ede87';
      case 'output':
        return '#6865A5';
      default:
        return '#ff0072';
    }
  };

let id = 4;
const getId = () => `${id++}`;

export default function CanvasPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

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

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node` },
      };

      if (type === 'prompt') {
          newNode.type = 'input';
          newNode.data.label = 'Prompt Node';
      } else if (type === 'output') {
          newNode.type = 'output';
          newNode.data.label = 'Output Node';
      } else if (type === 'sprite-sheet') {
        newNode.data.label = 'Sprite Sheet';
      } else if (type === 'generate-gif') {
        newNode.data.label = 'Generate GIF';
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
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
            </ReactFlow>
        </div>
    </div>
  );
}
