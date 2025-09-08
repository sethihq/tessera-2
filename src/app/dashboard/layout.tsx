
"use client";

import type { ReactNode } from "react";
import React, { Suspense, useState, useEffect } from 'react';
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Folder,
  Plus,
  Settings,
  Search,
  FilePlus,
  Trash2,
  Pencil,
} from "lucide-react";
import { TesseraLogo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchModal } from "@/components/search-modal";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { DashboardProvider, useDashboard } from '@/contexts/dashboard-context';
import { ThemeToggle } from "@/components/theme-toggle";

let idCounter = 5; // Start from a number higher than initial data
const getId = () => `${idCounter++}`;


function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileOpen = searchParams.get('file');

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { projects, setProjects, setAllFiles } = useDashboard();
  
  const selectedProjectName = searchParams.get('project') || 'my-game';
  
  const selectedProject = projects.find(p => p.id === selectedProjectName) || projects[0];

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

  const handleAddNewFile = (projectId: string) => {
     const newFile = {
      id: getId(),
      name: 'Untitled File',
      project: projects.find(p => p.id === projectId)?.name || 'Untitled',
      href: `/dashboard?project=${projectId}&file=untitled-${getId()}`,
      image: `https://picsum.photos/800/600?grayscale&random=${getId()}`,
      image_hint: 'new file placeholder',
      lastUpdated: 'Just now',
    };
    setAllFiles(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newFile]
    }));
  };

  const handleAddNewProject = () => {
    const newId = getId();
    const newProject = { 
        id: `new-project-${newId}`,
        name: `New Project ${projects.length + 1}`, 
        icon: Folder, 
        href: `/dashboard?project=new-project-${newId}`
    };
    setProjects(prev => [...prev, newProject]);
    setAllFiles(prev => ({...prev, [newProject.id]: []}));
    router.push(newProject.href);
  };
  
  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project and all its files?')) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setAllFiles(prev => {
            const newFiles = {...prev};
            delete newFiles[projectId];
            return newFiles;
        });
        
        const remainingProjects = projects.filter(p => p.id !== projectId);
        if (selectedProjectName === projectId) {
            if(remainingProjects.length > 1) {
                router.push(remainingProjects[0].href);
            } else {
                 router.push('/dashboard');
            }
        }
    }
  };
  
  const handleRenameProject = (projectId: string) => {
    const newName = prompt('Enter new project name:');
    if (newName) {
        setProjects(prev => prev.map(p => p.id === projectId ? {...p, name: newName} : p));
    }
  };


  return (
    <div className={`grid h-dvh w-full ${fileOpen ? 'lg:grid-cols-[1fr]' : 'lg:grid-cols-[280px_1fr]'}`}>
      {!fileOpen && (
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
                <Button size="icon" variant="ghost" onClick={handleAddNewProject}>
                  <Plus className="h-4 w-4" /> 
                </Button>
              </div>
              <div className="flex flex-col gap-1 py-2">
                {projects.map(project => (
                  <ContextMenu key={project.id}>
                      <ContextMenuTrigger>
                        <Link href={project.href}>
                          <Button 
                            variant={selectedProject && selectedProject.id === project.id ? 'secondary' : 'ghost'} 
                            className="justify-start gap-3 px-2 w-full"
                          >
                            <project.icon /> {project.name}
                          </Button>
                        </Link>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-48">
                          <ContextMenuItem onClick={() => handleAddNewFile(project.id)}>
                              <FilePlus className="mr-2 h-4 w-4" />
                              Add New File
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleRenameProject(project.id)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Rename Project
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem className="text-destructive" onClick={() => handleDeleteProject(project.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Project
                          </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                ))}
              </div>
            </nav>
          </SidebarContent>
          <SidebarFooter className="border-t p-2">
              <div className="flex items-center gap-2">
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
                  <ThemeToggle />
              </div>
          </SidebarFooter>
        </Sidebar>
      )}
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
      <DashboardProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </DashboardProvider>
    </Suspense>
  )
}
