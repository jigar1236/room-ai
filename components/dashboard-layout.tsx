"use client";

import type React from "react";
import { Sidebar } from "@/components/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background texture-overlay">
      <Sidebar />
      <main className="lg:pl-72">
        <div className="p-6 md:p-8 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
