"use client";

import { useState, useEffect, useCallback } from "react";

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("UniKit_sidebar_collapsed");
    if (stored === "true") setIsCollapsed(true);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("UniKit_sidebar_collapsed", String(next));
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  return { isCollapsed, isMobileOpen, toggleCollapse, openMobile, closeMobile };
}
