import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { useKanbanStore } from "../stores/kanbanStore";
import { KanbanColumn } from "./KanbanColumn";
import { ScrollArea } from "./ui/scroll-area";

export function KanbanBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const { getCurrentProject, setCurrentProject, moveTask, loadProjects } =
    useKanbanStore();

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  const project = getCurrentProject();

  useEffect(() => {
    if (!project) {
      loadProjects();
    }
  }, [project, loadProjects]);

  if (!project) return <div>Loading...</div>;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !project) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let fromColumnId = "";
    for (const column of project.columns) {
      if (column.tasks.some((task) => task.id === activeId)) {
        fromColumnId = column.id;
        break;
      }
    }

    const toColumnId = overId;

    if (fromColumnId && toColumnId && fromColumnId !== toColumnId) {
      moveTask(project._id, activeId, fromColumnId, toColumnId);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <ScrollArea className="w-full">
        <div className="flex gap-4 p-4 min-w-max">
          {project.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              projectId={project._id}
            />
          ))}
        </div>
      </ScrollArea>
    </DndContext>
  );
}
