"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useGeneration } from "@/context/generation-context";
import { Button } from "./ui/button";
import { Download, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

export function DashboardHeader() {
  const { generatedAsset, clearAsset } = useGeneration();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background/50 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <h1 className="text-lg font-semibold tracking-tight">Playground</h1>
      </div>
      <div className="flex items-center gap-2">
        {generatedAsset && (
            <>
                <Button variant="outline" size="icon" onClick={clearAsset} aria-label="Clear asset">
                    <X className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>PNG + JSON (Aseprite)</DropdownMenuItem>
                        <DropdownMenuItem>Tiled (.tmx/.tsx)</DropdownMenuItem>
                        <DropdownMenuItem>Godot (.tres)</DropdownMenuItem>
                        <DropdownMenuItem>Unity SpriteAtlas</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
