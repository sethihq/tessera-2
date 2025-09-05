'use client';

import React from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 250, y: 5 }, data: { label: 'Prompt Node' }, type: 'input' },
  { id: '2', position: { x: 100, y: 100 }, data: { label: 'Sprite Sheet' } },
  { id: '3', position: { x: 400, y: 100 }, data: { label: 'Sprite Sheet to GIF' } },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

const nodeColor = (node) => {
    switch (node.type) {
      case 'input':
        return '#6ede87';
      case 'output':
        return '#6865A5';
      default:
        return '#ff0072';
    }
  };

export default function CanvasPage() {
  return (
    <div style={{ height: '100%', width: '100%' }} className="rounded-xl overflow-hidden">
      <ReactFlow
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>
    </div>
  );
}
