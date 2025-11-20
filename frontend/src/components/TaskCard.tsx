import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useKanbanStore } from "../stores/kanbanStore";
import type { Task } from "../stores/kanbanStore";
import { Card } from "./ui/card";
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
import {
  Trash2,
  Pencil,
  CalendarClock,
  AlignLeft,
  GripVertical,
  Type,
  Calendar,
  FileText,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  columnId: string;
  projectId: string;
}

export function TaskCard({ task, columnId, projectId }: TaskCardProps) {
  const { deleteTask, updateTask } = useKanbanStore();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description || ""
  );
  const [editDeadline, setEditDeadline] = useState(task.deadline || "");

  const formatDateForInput = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (open) {
      setEditTitle(task.title);
      setEditDescription(task.description || "");
      setEditDeadline(formatDateForInput(task.deadline));
    }
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteTask(projectId, task.id, columnId);
  };

  const handleEdit = async () => {
    await updateTask(projectId, task.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      deadline: editDeadline || undefined,
    });
    setIsEditOpen(false);
  };

  return (
    <>
      <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
        <Card
          ref={setNodeRef}
          style={style}
          {...listeners}
          {...attributes}
          className={`
            group relative w-full flex flex-col gap-2
            border border-slate-200 bg-white 
            rounded-lg shadow-sm
            transition-all duration-200 ease-in-out
            hover:border-slate-300 hover:shadow-md
            cursor-grab active:cursor-grabbing
            ${
              isDragging
                ? "opacity-50 rotate-2 scale-105 shadow-xl ring-2 ring-indigo-500/20 z-50"
                : "opacity-100"
            }
          `}
        >
          {/* Card Header */}
          <div className="flex items-start justify-between p-3 pb-0">
            <div className="flex items-start gap-2 w-full">
              <GripVertical className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
              <h3 className="text-sm font-medium text-slate-900 leading-tight w-full word-break-word">
                {task.title}
              </h3>
            </div>

            <div className="flex items-center -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                onPointerDown={(e) => e.stopPropagation()}
                className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-3 pb-3 flex flex-col gap-3">
            {task.description && (
              <div className="flex gap-2">
                <div className="w-4 shrink-0" />
                <div className="flex items-start gap-1.5 text-slate-500">
                  <AlignLeft className="h-3 w-3 mt-1 shrink-0 opacity-60" />
                  <p className="text-xs leading-relaxed line-clamp-2 font-normal">
                    {task.description}
                  </p>
                </div>
              </div>
            )}

            {task.deadline && (
              <div className="flex items-center pl-6">
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  <CalendarClock className="h-3 w-3 text-slate-500" />
                  <span className="text-[10px] font-medium">
                    {formatDateForDisplay(task.deadline)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* --- ENTERPRISE DIALOG --- 
          Custom styles to override default padding/layout for a cleaner look
        */}
        <DialogContent
          className="sm:max-w-[550px] p-0 gap-0 overflow-hidden border-slate-200 shadow-2xl rounded-xl"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* 1. Header Section */}
          <div className="px-6 py-5 border-b border-slate-100 bg-white">
            <DialogHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-semibold text-slate-900 tracking-tight">
                  Edit Task
                </DialogTitle>
                {/* Close button usually handled by Dialog primitive, but we can add a visual one if needed or rely on default X */}
              </div>
              <DialogDescription className="text-sm text-slate-500">
                Make changes to the task details below.
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
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-11 border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 font-medium text-slate-900"
                placeholder="Enter task title"
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
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
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
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
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
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <DialogFooter className="sm:justify-end">
              <Button
                onClick={handleEdit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm px-6"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
