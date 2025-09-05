"use client";

import type { ReactNode } from "react";
import { Suspense } from 'react';
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Folder,
  File,
  Plus,
  Home,
  Settings,
} from "lucide-react";
import { TesseraLogo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const fileOpen = searchParams.get('file');

  if (fileOpen) {
    return (
       <div className="flex flex-col h-dvh bg-background">
        <DashboardHeader />
        <main className="flex-1">
            {children}
        </main>
      </div>
    )
  }

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
            <div className="flex items-center justify-between py-2 px-2">
              <h2 className="text-lg font-semibold tracking-tight">
                Projects
              </h2>
              <Button size="sm">
                <Plus className="h-4 w-4" /> 
              </Button>
            </div>
             <div className="flex flex-col gap-1 py-4">
              <Button variant="ghost" className="justify-start gap-3 px-2">
                <Folder /> My Game
              </Button>
              <Button variant="secondary" className="justify-start gap-3 pl-10 w-full" asChild>
                <Link href="/dashboard?file=main-scene"><File /> Main Scene</Link>
              </Button>
              <Button variant="ghost" className="justify-start gap-3 pl-10">
                <File /> Character Sprites
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" className="justify-start gap-3 px-2">
                <Folder /> Platformer Kit
              </Button>
               <Button variant="ghost" className="justify-start gap-3 pl-10">
                  <File /> Tileset
                </Button>
                <Button variant="ghost" className="justify-start gap-3 pl-10">
                  <File /> Player Controller
                </Button>
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
       <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
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
