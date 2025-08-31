import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditorPanel } from "@/components/editor-panel";
import { GenerationProvider } from "@/context/generation-context";
import { TesseraLogo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <GenerationProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-4">
             <div className="flex items-center gap-3">
                <TesseraLogo className="size-8" />
                <h1 className="text-xl font-semibold">Tessera</h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-0">
            <ScrollArea className="h-full">
              <EditorPanel />
            </ScrollArea>
          </SidebarContent>
          <SidebarFooter className="p-4">
             <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src="https://picsum.photos/100" alt="User avatar" data-ai-hint="user avatar"/>
                    <AvatarFallback>DV</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-medium">Solo Dev</span>
                    <span className="text-xs text-muted-foreground">Pro Plan</span>
                </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </GenerationProvider>
  );
}
