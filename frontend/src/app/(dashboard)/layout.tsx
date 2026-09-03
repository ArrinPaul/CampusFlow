"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/hooks/useSidebar";
import { Sidebar } from "@/components/shared/Sidebar";
import { MobileFooter } from "@/components/shared/MobileFooter";
import { MobileNav } from "@/components/shared/MobileNav";
import { DashboardFooter } from "@/components/shared/DashboardFooter";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleCollapse, openMobile, closeMobile } = useSidebar();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const isWhiteboard = pathname?.startsWith("/dashboard/whiteboard");
  const isDashboardRoot = pathname === "/dashboard";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      {isDesktop ? (
        <div className="sticky top-0 h-screen flex-shrink-0">
          <Sidebar isCollapsed={isCollapsed} onToggle={toggleCollapse} />
        </div>
      ) : (
        <MobileNav
          isOpen={isMobileOpen}
          onClose={closeMobile}
          isCollapsed={false}
          onToggle={toggleCollapse}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <main className={`flex-1 overflow-auto ${!isDesktop && isDashboardRoot ? "pb-16" : ""}`}>
          <div className={isWhiteboard ? "p-4" : "p-6"}>{children}</div>
        </main>

        {isDesktop && isDashboardRoot && <DashboardFooter />}

        {!isDesktop && isDashboardRoot && <MobileFooter onMenuClick={openMobile} />}
      </div>
    </div>
  );
}
