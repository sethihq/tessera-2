'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Workflow, Text, Image as ImageIcon } from 'lucide-react';

export function NodesSidebar() {
  return (
    <aside className="w-80 border-r bg-background p-4">
      <h2 className="text-lg font-semibold tracking-tight mb-4">Nodes</h2>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Text className="h-4 w-4" />
              Input Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full justify-start">
              Prompt
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Asset Nodes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              Sprite Sheet
            </Button>
             <Button variant="outline" className="w-full justify-start">
              Generate GIF
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
             <Button variant="outline" className="w-full justify-start">
              Output
            </Button>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
