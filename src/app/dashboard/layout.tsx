
"use client";

import type { ReactNode } from "react";
import React, { Suspense, useState, useEffect } from 'react';
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Folder,
  Plus,
  Settings,
  Search,
} from "lucide-react";
import { TesseraLogo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchModal } from "@/components/search-modal";

const projects = [
    { name: 'My Game', icon: Folder, fileCount: 2, href: '/dashboard' },
    { name: 'Platformer Kit', icon: Folder, fileCount: 2, href: '/dashboard?project=platformer-kit' },
];

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const selectedProject = searchParams.get('project') || 'my-game';

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }

        e.preventDefault()
        setIsSearchModalOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <div className="grid h-dvh w-full lg:grid-cols-[280px_1fr]">
      <Sidebar>
        <SidebarHeader className="border-b">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <TesseraLogo className="h-6 w-6" />
            <span className="">Tessera</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
           <nav className="grid items-start text-sm font-medium">
             <div className="p-2">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => setIsSearchModalOpen(true)}>
                    <Search className="mr-2 h-4 w-4" />
                    Search...
                    <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>
            </div>
            <div className="flex items-center justify-between py-2 px-2">
              <h2 className="text-lg font-semibold tracking-tight">
                Projects
              </h2>
              <Button size="icon" variant="ghost">
                <Plus className="h-4 w-4" /> 
              </Button>
            </div>
             <div className="flex flex-col gap-1 py-2">
               {projects.map(project => (
                  <Link href={project.href} key={project.name}>
                    <Button 
                      variant={
                        (selectedProject === 'my-game' && project.name === 'My Game') ||
                        (selectedProject === 'platformer-kit' && project.name === 'Platformer Kit')
                        ? 'secondary' : 'ghost'
                      } 
                      className="justify-start gap-3 px-2 w-full"
                    >
                      <project.icon /> {project.name}
                    </Button>
                  </Link>
               ))}
            </div>
          </nav>
        </SidebarContent>
        <SidebarFooter className="border-t p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-left gap-3 px-2">
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
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Solo Dev</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      solodev@tessera.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
       <div className="flex flex-col h-dvh">
        <DashboardHeader />
        <main className="flex-1 overflow-auto bg-muted/10">
          {children}
        </main>
      </div>
       <SearchModal open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen} />
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
