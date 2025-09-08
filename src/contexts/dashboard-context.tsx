
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Project, FileStore } from '@/components/dashboard-page-content';
import { initialProjects, initialFiles } from '@/components/dashboard-page-content';

interface DashboardContextType {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  allFiles: FileStore;
  setAllFiles: React.Dispatch<React.SetStateAction<FileStore>>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [allFiles, setAllFiles] = useState<FileStore>(initialFiles);

  return (
    <DashboardContext.Provider value={{ projects, setProjects, allFiles, setAllFiles }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
