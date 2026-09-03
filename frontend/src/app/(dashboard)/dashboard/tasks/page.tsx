"use client";

import { useEffect, useState } from "react";
import { Plus, ListTodo, Trash2, Edit2, Calendar, Bell, X, Check, ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Task, TaskStatus } from "@/features/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "today" | "upcoming" | "completed">("all");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [addToCalendar, setAddToCalendar] = useState(true);
  const [status, setStatus] = useState<TaskStatus>("pending");
  
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ tasks: Task[] }>("/api/tasks");
      setTasks(res.tasks || []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Update reminder time automatically when deadline changes
  useEffect(() => {
    if (deadline && !reminderTime) {
      const deadlineDate = new Date(deadline);
      const reminderDate = new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
      
      // Format to yyyy-MM-ddThh:mm for datetime-local input
      try {
        const offset = reminderDate.getTimezoneOffset();
        const localReminder = new Date(reminderDate.getTime() - offset * 60 * 1000);
        setReminderTime(localReminder.toISOString().slice(0, 16));
      } catch (e) {
        // ignore invalid dates
      }
    }
  }, [deadline]);

  // Filters logic
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "completed") return task.status === "completed";
    if (task.status === "completed" && activeFilter !== "all") return false; // hide completed in other lists
    
    const taskDate = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    if (activeFilter === "today") {
      return taskDate >= today && taskDate < tomorrow;
    }
    if (activeFilter === "upcoming") {
      return taskDate >= today && taskDate <= nextWeek;
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditId(null);
    setTitle("");
    setSubject("");
    setDescription("");
    setDeadline("");
    setReminderTime("");
    setAddToCalendar(true);
    setStatus("pending");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setIsEditing(true);
    setEditId(task.id);
    setTitle(task.title);
    setSubject(task.subject);
    setDescription(task.description || "");
    
    // Format to yyyy-MM-ddThh:mm
    const dlDate = new Date(task.deadline);
    const dlOffset = dlDate.getTimezoneOffset();
    const dlLocal = new Date(dlDate.getTime() - dlOffset * 60 * 1000);
    setDeadline(dlLocal.toISOString().slice(0, 16));

    if (task.reminder_time) {
      const remDate = new Date(task.reminder_time);
      const remOffset = remDate.getTimezoneOffset();
      const remLocal = new Date(remDate.getTime() - remOffset * 60 * 1000);
      setReminderTime(remLocal.toISOString().slice(0, 16));
    } else {
      setReminderTime("");
    }
    
    setAddToCalendar(task.add_to_calendar);
    setStatus(task.status);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!title || !subject || !deadline) {
      setFormError("Title, Subject and Deadline are required");
      return;
    }

    setSubmitting(true);
    try {
      const deadlineISO = new Date(deadline).toISOString();
      const reminderISO = reminderTime ? new Date(reminderTime).toISOString() : new Date(new Date(deadline).getTime() - 24 * 60 * 60 * 1000).toISOString();

      const payload = {
        title,
        subject,
        description: description || null,
        deadline: deadlineISO,
        reminder_time: reminderISO,
        add_to_calendar: addToCalendar,
        status
      };

      if (isEditing && editId) {
        await api.put(`/api/tasks/${editId}`, payload);
      } else {
        await api.post("/api/tasks", payload);
      }
      
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus: TaskStatus = task.status === "completed" ? "pending" : "completed";
    try {
      const updated = await api.put<{ task: Task }>(`/api/tasks/${task.id}`, {
        ...task,
        status: newStatus
      });
      setTasks(tasks.map((t) => (t.id === task.id ? updated.task : t)));
    } catch (err) {
      console.error("Failed to toggle task status", err);
    }
  };

  const getDaysLeft = (deadlineStr: string) => {
    const now = new Date();
    const dl = new Date(deadlineStr);
    const diff = dl.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return "Overdue";
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `${days} days left`;
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
        <button 
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-[10px] hover:opacity-90 transition-standard cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-1 mb-4 flex-shrink-0">
        {(["all", "today", "upcoming", "completed"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-standard capitalize cursor-pointer ${
              activeFilter === filter
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 h-full">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white border border-border rounded-[10px] p-12 text-center shadow-sm max-w-md mx-auto mt-10">
            <ListTodo className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No tasks found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {activeFilter === "all" 
                ? "Create your first task to get started with deadline tracking." 
                : `No tasks found for "${activeFilter}" filter.`}
            </p>
            {activeFilter === "all" && (
              <button 
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-[10px] hover:opacity-90 transition-standard cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
              className={`bg-white border rounded-[10px] p-5 shadow-sm transition-all hover:shadow-md flex items-start gap-4 ${
                task.status === "completed" ? "opacity-75 border-green-200 bg-green-50/10" : "border-border"
              }`}
            >
              {/* Status toggle button */}
              <button
                onClick={() => handleToggleStatus(task)}
                className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors cursor-pointer ${
                  task.status === "completed"
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-muted-foreground hover:border-primary hover:bg-primary/5 text-transparent"
                }`}
              >
                <Check className="w-4 h-4" />
              </button>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`text-base font-semibold text-foreground ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </h3>
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-muted text-muted-foreground rounded-[10px] mt-1">
                      {task.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="p-1.5 hover:bg-accent rounded-[10px] text-muted-foreground hover:text-foreground transition-standard cursor-pointer"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1.5 hover:bg-destructive/10 rounded-[10px] text-muted-foreground hover:text-destructive transition-standard cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {task.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2 leading-relaxed">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-3 border-t border-dashed border-border mt-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>
                      Deadline: {new Date(task.deadline).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      <span className={`ml-2 font-medium ${
                        task.status === "completed" 
                          ? "text-green-600" 
                          : getDaysLeft(task.deadline) === "Overdue" 
                            ? "text-destructive" 
                            : "text-orange-600"
                      }`}>
                        ({task.status === "completed" ? "Completed" : getDaysLeft(task.deadline)})
                      </span>
                    </span>
                  </div>
                  {task.reminder_time && (
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-secondary" />
                      <span>
                        Reminder: {new Date(task.reminder_time).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>
                  )}
                  {task.add_to_calendar && (
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-[10px] font-medium">
                      Google Calendar Linked
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Task Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[12px] border border-border shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="text-lg font-bold text-foreground">
                {isEditing ? "Edit Task" : "Create New Task"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-standard cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-[10px] text-sm text-destructive">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., DBMS Assignment 2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Subject / Category *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., DBMS"
                    required
                  />
                </div>
                
                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TaskStatus)}
                      className="w-full px-3 py-2 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 px-3 py-2 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Additional assignment details, submission link, etc."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Telegram Reminder Time
                  </label>
                  <input
                    type="datetime-local"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="add-to-calendar"
                  type="checkbox"
                  checked={addToCalendar}
                  onChange={(e) => setAddToCalendar(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="add-to-calendar" className="text-sm font-medium text-foreground cursor-pointer">
                  Sync with Google Calendar & trigger Telegram automations
                </label>
              </div>

              <div className="flex gap-3 justify-end border-t border-border pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border text-foreground font-medium rounded-[10px] hover:bg-accent transition-standard cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-[10px] hover:opacity-90 transition-standard cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEditing ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
