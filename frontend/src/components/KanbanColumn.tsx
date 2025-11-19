import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useKanbanStore } from "../stores/kanbanStore";
import type { Column } from "../stores/kanbanStore";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  column: Column;
  projectId: string;
}

export function KanbanColumn({ column, projectId }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
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

  return (
    <Card className="w-64 shrink-0">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">{column.title}</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <Button onClick={handleAddTask} className="w-full">
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent ref={setNodeRef} className="min-h-48 space-y-2 p-4">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columnId={column.id}
            projectId={projectId}
          />
        ))}
      </CardContent>
    </Card>
  );
}
