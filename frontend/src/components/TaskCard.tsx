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
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { X, Edit } from "lucide-react";

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
    return date.toLocaleDateString();
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
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing p-3 ${
        isDragging ? "opacity-50" : ""
      }`}
      {...listeners}
      {...attributes}
    >
      <div className="flex flex-row items-start justify-between">
        <h3 className="text-sm font-medium">{task.title}</h3>
        <div className="flex space-x-1">
          <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onPointerDown={(e) => e.stopPropagation()}
                className="h-5 w-5 p-0 hover:bg-blue-100"
              >
                <Edit className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent onPointerDown={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Task title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Task description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                />
                <Button onClick={handleEdit} className="w-full">
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            onPointerDown={(e) => e.stopPropagation()}
            className="h-5 w-5 p-0 hover:bg-red-100"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {task.description && (
        <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
      )}
      {task.deadline && (
        <p className="text-xs text-red-500 mt-1">
          Due: {formatDateForDisplay(task.deadline)}
        </p>
      )}
    </Card>
  );
}