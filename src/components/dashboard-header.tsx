
"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "./ui/button";
import { Share2, Home } from "lucide-react";
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

export function DashboardHeader() {
  const searchParams = useSearchParams();
  const fileOpen = searchParams.get('file');

  const projectName = searchParams.get('project') === 'platformer-kit' ? 'Platformer Kit' : 'My Game';

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
                  <Link href="/dashboard">{projectName}</Link>
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
        <h1 className="text-xl font-semibold md:text-2xl">{projectName}</h1>
      )}

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
