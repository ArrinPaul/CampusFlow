"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color?: string;
}

export function StatCard({ icon: Icon, label, value, color = "bg-primary/10 text-primary" }: StatCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white border border-border rounded-[10px] p-5 card-hover shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div className={cn("w-11 h-11 rounded-[10px] flex items-center justify-center", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
