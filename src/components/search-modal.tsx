
"use client"

import * as React from "react"
import {
  File,
  Search,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

const projects = [
    { name: 'My Game', files: ['Main Scene', 'Character Sprites'] },
    { name: 'Platformer Kit', files: ['Tileset', 'Player Controller'] },
]

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: Props) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {projects.map(project => (
            <CommandGroup heading={project.name} key={project.name}>
                {project.files.map(file => (
                     <CommandItem key={file}>
                        <File className="mr-2 h-4 w-4" />
                        <span>{file}</span>
                    </CommandItem>
                ))}
            </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
