"use client";

import { Folder } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-background mb-6 mx-auto">
          <Folder className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Select a file</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Choose a file from the project list on the left to start editing on the canvas.
        </p>
      </div>
    </div>
  );
}
