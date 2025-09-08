
"use client";

import { useSearchParams } from 'next/navigation';

export function DashboardHeader() {
  const searchParams = useSearchParams();
  const fileOpen = searchParams.get('file');

  const projectName = searchParams.get('project') === 'platformer-kit' ? 'Platformer Kit' : 'My Game';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="ml-auto flex items-center gap-2">
      </div>
    </header>
  );
}
