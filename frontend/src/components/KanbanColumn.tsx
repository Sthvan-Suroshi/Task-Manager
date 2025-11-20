import { useState, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useKanbanStore } from "../stores/kanbanStore";
import type { Column } from "../stores/kanbanStore";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Plus, Type, FileText, Calendar } from "lucide-react";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  column: Column;
  projectId: string;
}

export function KanbanColumn({ column, projectId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });
  const { addTask } = useKanbanStore();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleAddTask = async () => {
    if (title.trim()) {
      await addTask(projectId, column.id, {
        title: title.trim(),
        description: description.trim(),
        deadline: deadline || undefined,
      });
      setTitle("");
      setDescription("");
      setDeadline("");
      setIsOpen(false);
    }
  };

  const columnColor = useMemo(() => {
    const t = column.title.toLowerCase();
    if (t.includes("todo") || t.includes("backlog"))
      return "bg-blue-500 text-blue-600 border-blue-200";
    if (t.includes("progress"))
      return "bg-amber-500 text-amber-600 border-amber-200";
    if (t.includes("done") || t.includes("completed"))
      return "bg-emerald-500 text-emerald-600 border-emerald-200";
    return "bg-slate-500 text-slate-600 border-slate-200";
  }, [column.title]);

  return (
    <div className="flex flex-col h-full max-h-full w-80 shrink-0 border-2 rounded-xl p-2">
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {/* Status Dot */}
          <div
            className={`h-2 w-2 rounded-full ${columnColor.split(" ")[0]}`}
          />

          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            {column.title}
          </h2>

          {/* Count Badge */}
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200 px-1.5 text-[10px] font-bold text-slate-600">
            {column.tasks.length}
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-slate-200 text-slate-500"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[550px] p-0 gap-0 overflow-hidden border-slate-200 shadow-2xl rounded-xl"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {/* 1. Header Section */}
              <div className="px-6 py-5 border-b border-slate-100 bg-white">
                <DialogHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-lg font-semibold text-slate-900 tracking-tight">
                      Add to {column.title}
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-sm text-slate-500">
                    Create a new task for this column.
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* 2. Body Section */}
              <div className="p-6 space-y-6 bg-white">
                {/* Title Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                  >
                    <Type className="w-3.5 h-3.5" />
                    Task Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-11 border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 font-medium text-slate-900"
                    placeholder="Enter task title"
                    autoFocus
                  />
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="desc"
                    className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Description
                  </Label>
                  <Textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px] border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 resize-none text-sm leading-relaxed"
                    placeholder="Add a more detailed description..."
                  />
                </div>

                {/* Meta Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="date"
                      className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Due Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="h-11 border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 text-sm"
                    />
                  </div>
                  {/* Add more meta fields here in the future (e.g., Assignee, Priority) */}
                </div>
              </div>

              {/* 3. Footer Section */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="ghost"
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <DialogFooter className="sm:justify-end">
                  <Button
                    onClick={handleAddTask}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm px-6"
                  >
                    Create Task
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Drop Zone Container */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 flex flex-col gap-3 
          rounded-xl border-2 
          p-2 overflow-y-auto
          transition-colors duration-200 ease-in-out
          ${
            isOver
              ? "bg-slate-100 border-slate-300"
              : "bg-slate-50/50 border-transparent"
          }
          scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent
        `}
      >
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columnId={column.id}
            projectId={projectId}
          />
        ))}

        {/* Empty State / Drop Area Placeholder */}
        {column.tasks.length === 0 && (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400">
            <p className="text-xs font-medium">No tasks yet</p>
            <Button
              variant="link"
              size="sm"
              className="text-xs text-slate-500 hover:text-slate-800 h-auto p-0 mt-1"
              onClick={() => setIsOpen(true)}
            >
              Add one
            </Button>
          </div>
        )}

        <div className="h-4 shrink-0" />
      </div>
    </div>
  );
}
