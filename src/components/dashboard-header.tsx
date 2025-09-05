
"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "./ui/button";
import { Share2, Home, Search } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Input } from "./ui/input";

export function DashboardHeader() {
  const searchParams = useSearchParams();
  const fileOpen = searchParams.get('file');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      {fileOpen ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard"><Home className="h-4 w-4"/></Link>
          </Button>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                 <BreadcrumbLink asChild>
                  <Link href="/dashboard">My Game</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Main Scene</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      ) : (
        <h1 className="text-xl font-semibold md:text-2xl">Projects</h1>
      )}

      <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
          />
        </div>
      <div className="flex items-center gap-2">
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
