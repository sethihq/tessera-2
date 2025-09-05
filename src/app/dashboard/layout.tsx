import type { ReactNode } from "react";
import Link from "next/link";
import {
  Home,
  Settings,
  LifeBuoy,
  Folder,
  File,
  Plus,
} from "lucide-react";
import { TesseraLogo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-screen w-full pl-[56px]">
      <aside className="inset-y fixed left-0 z-20 flex h-full flex-col border-r">
        <div className="border-b p-2">
          <Button variant="outline" size="icon" aria-label="Home">
            <TesseraLogo className="size-5 fill-foreground" />
          </Button>
        </div>
        <nav className="grid gap-1 p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg bg-muted"
                  aria-label="Projects"
                >
                  <Folder />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Projects
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Settings"
                >
                  <Settings />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Settings
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
        <nav className="mt-auto grid gap-1 p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Help"
                >
                  <LifeBuoy />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Help
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src="https://picsum.photos/100"
                    alt="User avatar"
                    data-ai-hint="user avatar"
                  />
                  <AvatarFallback>DV</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Account
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative hidden flex-col items-start gap-8 md:flex">
            <div className="grid w-full gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">
                  Projects
                </h2>
                <Button size="sm">
                  <Plus className="mr-2" /> New Project
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start gap-3">
                  <Folder /> My Game
                </Button>
                <Link href="/dashboard/canvas">
                  <Button variant="ghost" className="justify-start gap-3 pl-11 w-full">
                    <File /> Main Scene
                  </Button>
                </Link>
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
            </div>
          </div>
          <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
