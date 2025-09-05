'use client';

import { useReactFlow } from 'reactflow';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, Expand, MousePointer2 } from 'lucide-react';
import { Separator } from './ui/separator';

export function FloatingControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-2 bg-background p-2 rounded-lg border shadow-md">
            <Button variant="secondary" size="icon">
                <MousePointer2 />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="icon" onClick={() => zoomIn({ duration: 300 })}>
                <ZoomIn />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => zoomOut({ duration: 300 })}>
                <ZoomOut />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => fitView({ duration: 300 })}>
                <Expand />
            </Button>
        </div>
    </div>
  );
}
