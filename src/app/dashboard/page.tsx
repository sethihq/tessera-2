"use client";

import Image from 'next/image';
import { useGeneration } from '@/context/generation-context';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';

function PlaygroundPlaceholder() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Asset Playground</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
                Your generated assets will appear here. Use the panel on the left to define a world style and generate new assets.
            </p>
        </div>
    );
}


function LoadingSkeleton() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
             <Skeleton className="aspect-square w-full rounded-lg" />
        </div>
    );
}

export default function DashboardPage() {
  const { generatedAsset, isLoading, error } = useGeneration();

  return (
    <div className="flex flex-col h-screen">
      <DashboardHeader />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="flex items-center justify-center h-full">
            {isLoading ? (
                <LoadingSkeleton />
            ) : error ? (
                <div className="w-full max-w-md p-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Generation Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            ) : generatedAsset?.assetDataUri ? (
                <div className="p-4 sm:p-6 lg:p-8 w-full h-full flex items-center justify-center">
                    <Image
                        src={generatedAsset.assetDataUri}
                        alt="Generated Asset"
                        width={512}
                        height={512}
                        className="object-contain rounded-lg border bg-background shadow-md max-w-full max-h-full"
                    />
                </div>
            ) : (
                <PlaygroundPlaceholder />
            )}
        </div>
      </main>
    </div>
  );
}
