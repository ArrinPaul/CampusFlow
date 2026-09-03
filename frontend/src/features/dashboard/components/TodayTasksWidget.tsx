"use client";

import Link from "next/link";
import { CalendarClock, Plus, ArrowRight, ClipboardList } from "lucide-react";
import type { Task } from "@/features/types";
import { motion } from "framer-motion";

interface TodayTasksWidgetProps {
  tasks: Task[];
}

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
};

export function TodayTasksWidget({ tasks = [] }: TodayTasksWidgetProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTasks = tasks.filter((task) => {
    const taskDate = new Date(task.deadline);
    return taskDate >= today && taskDate < tomorrow;
  });

  return (
    <div className="bg-white border border-border rounded-[10px] p-5 card-hover h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-primary/10 flex items-center justify-center">
            <CalendarClock className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Today&apos;s Tasks</h3>
        </div>
        {todayTasks.length > 0 && (
          <Link href="/dashboard/tasks" className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {todayTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <ClipboardList className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No tasks due today</p>
          <p className="text-xs text-muted-foreground mb-4">Enjoy your free day!</p>
          <Link
            href="/dashboard/tasks"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-medium rounded-[10px] hover:bg-primary/90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </Link>
        </div>
      ) : (
        <motion.div 
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="space-y-2 flex-1"
        >
          {todayTasks.slice(0, 5).map((task) => (
            <motion.div
              key={task.id}
              variants={itemVariants}
              whileHover={{ scale: 1.01, x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-[10px] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.subject}</p>
              </div>
              <span className="ml-2 px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-[10px] whitespace-nowrap">
                {task.status}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
