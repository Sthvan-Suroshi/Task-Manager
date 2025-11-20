import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { useKanbanStore } from "../stores/kanbanStore";
import { ProjectSidebar } from "./ProjectSidebar";
import { KanbanBoard } from "./KanbanBoard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { LayoutDashboard } from "lucide-react";

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { setCurrentProject, projects, addProject } = useKanbanStore();
  const [newProjectName, setNewProjectName] = useState("");

  // Logic to show "Create First Project" modal
  const showFirstProjectModal = useMemo(
    () => !projectId && projects.length === 0,
    [projectId, projects.length]
  );

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  const handleCreateFirst = async () => {
    if (newProjectName.trim()) {
      await addProject(newProjectName.trim());
      setNewProjectName("");
    }
  };

  const currentProjectName = projects.find((p) => p._id === projectId)?.name;

  return (
    <SidebarProvider>
      <ProjectSidebar />
      <SidebarInset>
        {/* Header Bar */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-semibold text-lg">
            {currentProjectName || "Select a Project"}
          </h1>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col gap-4 p-4 h-[calc(100vh-4rem)] overflow-hidden">
          {projectId ? (
            <KanbanBoard />
          ) : (
            // Empty State (When projects exist but none selected)
            !showFirstProjectModal && (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed shadow-sm bg-muted/10">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <LayoutDashboard className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">No Project Selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a project from the sidebar to view the board.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </SidebarInset>

      {/* Force User to Create First Project if none exist */}
      <Dialog open={showFirstProjectModal}>
        <DialogContent
          className="sm:max-w-[425px]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Welcome!</DialogTitle>
            <DialogDescription>
              You don't have any projects yet. Create one to get started with
              your Kanban board.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="My First Project"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateFirst}
              disabled={!newProjectName.trim()}
            >
              Get Started
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
