"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardPageContent = dynamic(() => import('@/components/dashboard-page-content').then(mod => mod.DashboardPageContent), { 
    ssr: false,
    loading: () => <div className="p-4 sm:px-6 sm:py-0 md:gap-8 grid flex-1 items-start gap-4"><Skeleton className="w-full h-32" /><div className="grid grid-cols-4 gap-6"><Skeleton className="w-full h-64" /><Skeleton className="w-full h-64" /><Skeleton className="w-full h-64" /><Skeleton className="w-full h-64" /></div></div>,
});

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardPageContent />
    </Suspense>
  )
}
