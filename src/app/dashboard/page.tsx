"use client";

import Image from 'next/image';
import { useGeneration } from '@/context/generation-context';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

function PlaygroundPlaceholder() {
    return (
        <Card className="flex flex-col items-center justify-center h-full text-center p-8 border-dashed shadow-none bg-background">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <ImageIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Asset Playground</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
                Your generated assets will appear here. Get started by using the panel on the left.
            </p>
        </Card>
    );
}

function LoadingSkeleton() {
    return (
        <Card className="aspect-square w-full rounded-lg shadow-none border-dashed bg-background">
            <CardContent className="p-6 h-full flex items-center justify-center">
                <Skeleton className="w-full h-full" />
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
  const { generatedAsset, isLoading, error } = useGeneration();

  return (
    <div className="h-full p-4 md:p-6 lg:p-8">
        {isLoading ? (
            <LoadingSkeleton />
        ) : error ? (
            <div className="flex items-center justify-center h-full">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Generation Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        ) : generatedAsset?.assetDataUri ? (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex items-center justify-center"
            >
                <Card className="shadow-xl rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm">
                    <CardContent className="p-0">
                         <Image
                            src={generatedAsset.assetDataUri}
                            alt="Generated Asset"
                            width={512}
                            height={512}
                            className="object-contain max-w-full max-h-[calc(100vh-12rem)]"
                        />
                    </CardContent>
                </Card>
            </motion.div>
        ) : (
            <PlaygroundPlaceholder />
        )}
    </div>
  );
}
