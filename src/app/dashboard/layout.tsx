"use client";

import type { ReactNode } from "react";
import { Suspense } from 'react';
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Folder,
  File,
  Plus,
} from "lucide-react";
import { TesseraLogo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard-header";


function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const fileOpen = searchParams.get('file');

  if (fileOpen) {
    return (
       <div className="flex flex-col h-dvh">
        <DashboardHeader />
        <main className="flex-1">
            {children}
        </main>
      </div>
    )
  }

  return (
    <div className="grid h-dvh w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <TesseraLogo className="h-6 w-6" />
              <span className="">Tessera</span>
            </Link>
          </div>
          <div className="flex-1">
             <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <div className="flex items-center justify-between py-2">
                <h2 className="text-lg font-semibold tracking-tight">
                  Projects
                </h2>
                <Button size="sm">
                  <Plus className="h-4 w-4" /> 
                </Button>
              </div>
               <div className="flex flex-col gap-2 py-4">
                <Button variant="ghost" className="justify-start gap-3">
                  <Folder /> My Game
                </Button>
                <Button variant="secondary" className="justify-start gap-3 pl-11 w-full" asChild>
                  <Link href="/dashboard?file=main-scene"><File /> Main Scene</Link>
                </Button>
                <Button variant="ghost" className="justify-start gap-3 pl-11">
                  <File /> Character Sprites
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start gap-3">
                  <Folder /> Platformer Kit
                </Button>
                 <Button variant="ghost" className="justify-start gap-3 pl-11">
                    <File /> Tileset
                  </Button>
                  <Button variant="ghost" className="justify-start gap-3 pl-11">
                    <File /> Player Controller
                  </Button>
              </div>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <div className="flex items-center gap-3 pt-4 mt-4 border-t">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src="https://picsum.photos/100"
                  alt="User avatar"
                  data-ai-hint="user avatar"
                />
                <AvatarFallback>DV</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Solo Dev</span>
                <span className="text-xs text-muted-foreground">
                  Pro Plan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
       <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
        </main>
      </div>
    </div>
  );
}


export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}
