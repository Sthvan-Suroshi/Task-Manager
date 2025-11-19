import { create } from "zustand";
import axios from "axios";

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline?: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Project {
  _id: string;
  name: string;
  columns: Column[];
}

interface KanbanState {
  isLoggedIn: boolean;
  projects: Project[];
  currentProjectId: string | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  loadProjects: () => Promise<Project[]>;
  addProject: (name: string) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;
  setCurrentProject: (id: string) => void;
  getCurrentProject: () => Project | undefined;
  addTask: (
    projectId: string,
    columnId: string,
    task: Omit<Task, "id">
  ) => Promise<void>;
  moveTask: (
    projectId: string,
    taskId: string,
    fromColumnId: string,
    toColumnId: string
  ) => Promise<void>;
  updateTask: (
    projectId: string,
    taskId: string,
    updates: Partial<Task>
  ) => Promise<void>;
  deleteTask: (
    projectId: string,
    taskId: string,
    columnId: string
  ) => Promise<void>;
  checkDeadlines: (projectId: string) => Promise<void>;
}

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useKanbanStore = create<KanbanState>()((set, get) => ({
  isLoggedIn: !!localStorage.getItem("token"),
  projects: [],
  currentProjectId: null,
  loading: false,
  login: () => set({ isLoggedIn: true }),
  logout: () => {
    localStorage.removeItem("token");
    set({ isLoggedIn: false, projects: [], currentProjectId: null });
  },
  loadProjects: async (): Promise<Project[]> => {
    try {
      set({ loading: true });
      const response = await api.get("/projects");
      set({ projects: response.data, loading: false });
      if (response.data.length > 0 && !get().currentProjectId) {
        set({ currentProjectId: response.data[0]._id });
      }
      return response.data;
    } catch (error) {
      console.error("Failed to load projects", error);
      set({ loading: false });
      return [];
    }
  },
  addProject: async (name) => {
    try {
      const response = await api.post("/projects", { name });
      set((state) => ({
        projects: [...state.projects, response.data],
        currentProjectId: response.data._id,
      }));
    } catch (error) {
      console.error("Failed to add project", error);
    }
  },
  renameProject: async (id, name) => {
    try {
      await api.put(`/projects/${id}`, { name });
      set((state) => ({
        projects: state.projects.map((proj) =>
          proj._id === id ? { ...proj, name } : proj
        ),
      }));
    } catch (error) {
      console.error("Failed to rename project", error);
    }
  },
  setCurrentProject: (id) => set({ currentProjectId: id }),
  getCurrentProject: () => {
    const state = get();
    return state.projects.find((p) => p._id === state.currentProjectId);
  },
  addTask: async (projectId, columnId, task) => {
    try {
      const response = await api.post(`/projects/${projectId}/tasks`, {
        columnId,
        task,
      });
      set((state) => ({
        projects: state.projects.map((proj) =>
          proj._id === projectId ? response.data : proj
        ),
      }));
    } catch (error) {
      console.error("Failed to add task", error);
    }
  },
  moveTask: async (projectId, taskId, fromColumnId, toColumnId) => {
    try {
      const response = await api.post(`/projects/${projectId}/move-task`, {
        taskId,
        fromColumnId,
        toColumnId,
      });
      set((state) => ({
        projects: state.projects.map((proj) =>
          proj._id === projectId ? response.data : proj
        ),
      }));
    } catch (error) {
      console.error("Failed to move task", error);
    }
  },
  updateTask: async (projectId, taskId, updates) => {
    try {
      const response = await api.put(
        `/projects/${projectId}/tasks/${taskId}`,
        updates
      );
      set((state) => ({
        projects: state.projects.map((proj) =>
          proj._id === projectId ? response.data : proj
        ),
      }));
    } catch (error) {
      console.error("Failed to update task", error);
    }
  },
  deleteTask: async (projectId, taskId) => {
    try {
      const response = await api.delete(
        `/projects/${projectId}/tasks/${taskId}`
      );
      set((state) => ({
        projects: state.projects.map((proj) =>
          proj._id === projectId ? response.data : proj
        ),
      }));
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  },
  checkDeadlines: async (projectId) => {
    console.log(projectId);
  },
}));
