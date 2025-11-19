import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import { useKanbanStore } from "../stores/kanbanStore";
import { ProjectSidebar } from "./ProjectSidebar";
import { KanbanBoard } from "./KanbanBoard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { setCurrentProject, projects, addProject } = useKanbanStore();
  const [newProjectName, setNewProjectName] = useState("");

  const showCreate = useMemo(() => !projectId && projects.length === 0, [projectId, projects.length]);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  const handleCreate = async () => {
    if (newProjectName.trim()) {
      await addProject(newProjectName.trim());
      setNewProjectName("");
    }
  };

  return (
    <SidebarProvider>
      <ProjectSidebar />
      <SidebarInset>
        <div className="p-4">
          {projectId || projects.length > 0 ? <KanbanBoard /> : null}
        </div>
      </SidebarInset>
      <Dialog open={showCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Your First Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <Button onClick={handleCreate} className="w-full">
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}