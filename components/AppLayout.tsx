"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  alertCount?: number;
}

export function AppLayout({ children, alertCount = 0 }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] grid-overlay">
      <Sidebar alertCount={alertCount} />
      <div className="ml-64 min-h-screen flex flex-col">{children}</div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className = "" }: PageContentProps) {
  return (
    <main className={`flex-1 p-6 overflow-auto ${className}`}>
      <div className="max-w-[1600px] mx-auto">{children}</div>
    </main>
  );
}
