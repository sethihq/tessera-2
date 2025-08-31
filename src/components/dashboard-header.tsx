"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { useGeneration } from "@/context/generation-context";
import { Button } from "./ui/button";
import { Download, Share2, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardHeader() {
  const { generatedAsset, clearAsset } = useGeneration();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex-1">
        {/* Placeholder for breadcrumbs or title */}
      </div>
      <div className="flex items-center gap-2">
        <AnimatePresence>
        {generatedAsset && (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
            >
                <Button variant="ghost" size="icon" onClick={clearAsset} aria-label="Clear asset">
                    <X />
                </Button>
                <Button variant="outline">
                    <Share2 />
                    Share
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            <Download />
                            Export
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem>PNG</DropdownMenuItem>
                         <DropdownMenuItem>JPG</DropdownMenuItem>
                        <DropdownMenuItem>SVG</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Copy as Data URL</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </motion.div>
        )}
        </AnimatePresence>
        <ThemeToggle />
      </div>
    </header>
  );
}
