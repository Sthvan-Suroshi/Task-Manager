import { create } from "zustand";
import axios from "axios";
import { io, Socket } from "socket.io-client";

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

interface Cursor {
  userId: string;
  x: number;
  y: number;
  name: string;
}

interface KanbanState {
  isLoggedIn: boolean;
  projects: Project[];
  currentProjectId: string | null;
  loading: boolean;
  socket: Socket | null;
  cursors: Cursor[];
  userName: string;
  hasLoadedProjects: boolean;
  login: (user?: { name: string }) => void;
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
  connectSocket: () => void;
  disconnectSocket: () => void;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  sendCursor: (x: number, y: number) => void;
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
  socket: null,
  cursors: [],
  userName: "",
  hasLoadedProjects: false,
  login: (user?: { name: string }) => {
    set({ isLoggedIn: true, userName: user?.name || "" });
    get().connectSocket();
  },
  logout: () => {
    localStorage.removeItem("token");
    get().disconnectSocket();
    set({
      isLoggedIn: false,
      projects: [],
      currentProjectId: null,
      userName: "",
      hasLoadedProjects: false,
    });
  },
  loadProjects: async (): Promise<Project[]> => {
    try {
      set({ loading: true });
      const response = await api.get("/projects");
      set({ projects: response.data, loading: false, hasLoadedProjects: true });
      if (response.data.length > 0 && !get().currentProjectId) {
        set({ currentProjectId: response.data[0]._id });
      }
      return response.data;
    } catch (error) {
      console.error("Failed to load projects", error);
      set({ loading: false, hasLoadedProjects: true });
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
  connectSocket: () => {
    const { socket } = get();
    if (socket && socket.connected) return;
    const token = localStorage.getItem("token");
    if (token) {
      const socket = io("http://localhost:3000", {
        auth: { token },
      });
      socket.on("cursor-update", (data) => {
        set((state) => ({
          cursors: state.cursors
            .filter((c) => c.userId !== data.userId)
            .concat(data),
        }));
      });
      socket.on("task-added", (project) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p._id === project._id ? project : p
          ),
        }));
      });
      socket.on("task-updated", (project) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p._id === project._id ? project : p
          ),
        }));
      });
      socket.on("task-deleted", (project) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p._id === project._id ? project : p
          ),
        }));
      });
      socket.on("task-moved", (project) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p._id === project._id ? project : p
          ),
        }));
      });
      socket.on("project-created", (project) => {
        set((state) => ({
          projects: [...state.projects, project],
        }));
      });
      socket.on("project-updated", (project) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p._id === project._id ? project : p
          ),
        }));
      });
      socket.on("project-deleted", (data) => {
        set((state) => ({
          projects: state.projects.filter((p) => p._id !== data.id),
        }));
      });
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        if (error.message === 'Authentication error') {
          get().logout();
        }
      });
      set({ socket });
    }
  },
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, cursors: [] });
  },
  joinProject: (projectId) => {
    const { socket } = get();
    if (socket) {
      socket.emit("join-project", projectId);
    }
  },
  leaveProject: (projectId) => {
    const { socket } = get();
    if (socket) {
      socket.emit("leave-project", projectId);
    }
    set({ cursors: [] });
  },
  sendCursor: (() => {
    let timeout: number | null = null;
    return (x: number, y: number) => {
      if (timeout) return;
      timeout = window.setTimeout(() => {
        const { socket, userName, currentProjectId } = get();
        if (socket && currentProjectId) {
          socket.emit("cursor-move", { projectId: currentProjectId, x, y, name: userName });
        }
        timeout = null;
      }, 50); // throttle to 20fps
    };
  })(),
}));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useKanbanStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
