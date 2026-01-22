"use client";

import { ReactNode } from "react";

interface SystemShellProps {
  children: ReactNode;
}

export function SystemShell({ children }: SystemShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] grid-overlay">
      {/* Main application container */}
      <div className="flex flex-col min-h-screen">{children}</div>
    </div>
  );
}

interface MainGridProps {
  children: ReactNode;
}

export function MainGrid({ children }: MainGridProps) {
  return (
    <main className="flex-1 p-4 overflow-auto">
      <div className="max-w-[1920px] mx-auto">{children}</div>
    </main>
  );
}

interface PanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  status?: "nominal" | "warning" | "critical";
}

export function Panel({
  title,
  children,
  className = "",
  actions,
  status,
}: PanelProps) {
  return (
    <div className={`panel ${className}`}>
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status && <span className={`status-dot ${status}`} />}
          <span>{title}</span>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

interface SectionGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export function SectionGrid({
  children,
  cols = 2,
  className = "",
}: SectionGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[cols]} gap-4 ${className}`}>
      {children}
    </div>
  );
}
