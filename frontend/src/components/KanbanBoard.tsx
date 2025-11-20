import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { useKanbanStore } from "../stores/kanbanStore";
import { KanbanColumn } from "./KanbanColumn";
import { ScrollArea } from "./ui/scroll-area";

export function KanbanBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    getCurrentProject,
    setCurrentProject,
    moveTask,
    loadProjects,
    sendCursor,
    cursors,
    joinProject,
    leaveProject,
  } = useKanbanStore();
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
      joinProject(projectId);
    }
    return () => {
      if (projectId) {
        leaveProject(projectId);
      }
    };
  }, [projectId, setCurrentProject, joinProject, leaveProject]);

  const project = getCurrentProject();

  useEffect(() => {
    if (!project) {
      loadProjects();
    }
  }, [project, loadProjects]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      sendCursor(x, y);
    }
  };

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
        <div
          ref={boardRef}
          className="flex gap-4 p-4 min-w-max relative"
          onMouseMove={handleMouseMove}
        >
          {project.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              projectId={project._id}
            />
          ))}
          {cursors.map((cursor) => (
            <div
              key={cursor.userId}
              className="absolute pointer-events-none mt-8"
              style={{
                left: cursor.x,
                top: cursor.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded border-blue-700 border-2">
                {cursor.name || "Anonymous"}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </DndContext>
  );
}
