import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditorPanel } from "@/components/editor-panel";
import { GenerationProvider } from "@/context/generation-context";
import { TesseraLogo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Home, Settings, LifeBuoy } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <GenerationProvider>
      <div className="flex h-dvh bg-muted/20">
        <Sidebar className="w-80 border-r shrink-0">
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <TesseraLogo className="size-8" />
              <h1 className="text-xl font-semibold tracking-tight">Tessera</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <ScrollArea className="h-full">
              <EditorPanel />
            </ScrollArea>
          </SidebarContent>
          <SidebarFooter className="p-4 mt-auto border-t">
            <div className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start gap-2">
                    <Home />
                    <span>Home</span>
                </Button>
                <Button variant="ghost" className="justify-start gap-2">
                    <Settings />
                    <span>Settings</span>
                </Button>
                <Button variant="ghost" className="justify-start gap-2">
                    <LifeBuoy />
                    <span>Help</span>
                </Button>
            </div>
            <div className="flex items-center gap-3 pt-4 mt-4 border-t">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://picsum.photos/100" alt="User avatar" data-ai-hint="user avatar" />
                <AvatarFallback>DV</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Solo Dev</span>
                <span className="text-xs text-muted-foreground">Pro Plan</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </GenerationProvider>
  );
}
