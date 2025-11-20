import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useKanbanStore, type Project } from "../stores/kanbanStore";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "./ui/sidebar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Plus, Folder, Edit, MoreVertical, Trash2 } from "lucide-react";
import axios from "axios";

export function ProjectSidebar() {
  const {
    projects,
    addProject,
    renameProject,
    deleteProject,
    setCurrentProject,
    logout,
  } = useKanbanStore();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null
  );

  const handleAddProject = async () => {
    if (newProjectName.trim()) {
      await addProject(newProjectName.trim());
      setNewProjectName("");
      setIsOpen(false);
    }
  };

  const startEditing = (project: Project) => {
    setEditingProjectId(project._id);
    setEditingName(project.name);
  };

  const saveEditing = () => {
    if (editingProjectId && editingName.trim()) {
      renameProject(editingProjectId, editingName.trim());
      setEditingProjectId(null);
      setEditingName("");
    }
  };

  const cancelEditing = () => {
    setEditingProjectId(null);
    setEditingName("");
  };

  const handleDeleteProject = async () => {
    if (deletingProjectId) {
      await deleteProject(deletingProjectId);
      setDeletingProjectId(null);
      if (projectId === deletingProjectId) {
        navigate("/projects");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    localStorage.removeItem("token");
    logout();
    navigate("/login");
  };

  return (
    <Sidebar className="mx-3">
      <SidebarHeader>
        <h2 className="text-lg font-semibold">Projects</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {projects.map((project) => (
            <SidebarMenuItem key={project._id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center flex-1">
                  <Folder className="h-4 w-4 mr-2" />
                  {editingProjectId === project._id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditing();
                        if (e.key === "Escape") cancelEditing();
                      }}
                      onBlur={saveEditing}
                      autoFocus
                      className="h-6 px-1 py-0 text-sm"
                    />
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={projectId === project._id}
                      className="flex-1 justify-start"
                    >
                      <Link
                        to={`/projects/${project._id}`}
                        onClick={() => setCurrentProject(project._id)}
                      >
                        {project.name}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => startEditing(project)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingProjectId(project._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="space-y-1 mb-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <Button onClick={handleAddProject} className="w-full">
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <AlertDialog
          open={!!deletingProjectId}
          onOpenChange={() => setDeletingProjectId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this project? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProject}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full hover:bg-rose-100"
        >
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
