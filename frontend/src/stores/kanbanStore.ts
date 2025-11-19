import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline?: string; // ISO date string
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  columns: Column[];
}

interface KanbanState {
  projects: Project[];
  currentProjectId: string | null;
  addProject: (name: string) => string;
  renameProject: (id: string, name: string) => void;
  setCurrentProject: (id: string) => void;
  getCurrentProject: () => Project | undefined;
  addTask: (projectId: string, columnId: string, task: Omit<Task, "id">) => void;
  moveTask: (projectId: string, taskId: string, fromColumnId: string, toColumnId: string) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (projectId: string, taskId: string, columnId: string) => void;
  checkDeadlines: (projectId: string) => void;
}

const initialColumns: Column[] = [
  { id: "backlog", title: "Backlog", tasks: [] },
  { id: "todo", title: "To Do", tasks: [] },
  { id: "in-progress", title: "In Progress", tasks: [] },
  { id: "done", title: "Done", tasks: [] },
];

const initialProjects: Project[] = [
  { id: "default", name: "Default Project", columns: initialColumns },
];

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      projects: initialProjects,
      currentProjectId: "default",
      addProject: (name) => {
        const id = Date.now().toString();
        set((state) => ({
          projects: [...state.projects, { id, name, columns: initialColumns.map(col => ({ ...col, tasks: [] })) }],
        }));
        return id;
      },
      renameProject: (id, name) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === id ? { ...proj, name } : proj
          ),
        })),
      setCurrentProject: (id) => set({ currentProjectId: id }),
      getCurrentProject: () => {
        const state = get();
        return state.projects.find(p => p.id === state.currentProjectId);
      },
      addTask: (projectId, columnId, task) =>
        set((state) => {
          const newState = {
            ...state,
            projects: state.projects.map((proj) =>
              proj.id === projectId
                ? {
                    ...proj,
                    columns: proj.columns.map((col) =>
                      col.id === columnId
                        ? {
                            ...col,
                            tasks: [...col.tasks, { ...task, id: Date.now().toString() }],
                          }
                        : col
                    ),
                  }
                : proj
            ),
          };
          // After adding, check deadlines for this project
          const now = new Date().toISOString().split('T')[0];
          newState.projects = newState.projects.map((proj) => {
            if (proj.id !== projectId) return proj;
            let backlogTasks: Task[] = [];
            proj.columns.forEach((col) => {
              if (col.id === 'backlog') {
                backlogTasks = [...col.tasks];
              }
            });
            const updatedColumns = proj.columns.map((col) => {
              if (col.id === 'backlog') return col;
              const overdueTasks = col.tasks.filter(
                (task) => task.deadline && task.deadline < now
              );
              const remainingTasks = col.tasks.filter(
                (task) => !task.deadline || task.deadline >= now
              );
              backlogTasks = [...backlogTasks, ...overdueTasks];
              return { ...col, tasks: remainingTasks };
            });
            return {
              ...proj,
              columns: updatedColumns.map((col) =>
                col.id === 'backlog' ? { ...col, tasks: backlogTasks } : col
              ),
            };
          });
          return newState;
        }),
      moveTask: (projectId, taskId, fromColumnId, toColumnId) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  columns: (() => {
                    const fromColumn = proj.columns.find((col) => col.id === fromColumnId);
                    const toColumn = proj.columns.find((col) => col.id === toColumnId);
                    if (!fromColumn || !toColumn) return proj.columns;

                    const taskIndex = fromColumn.tasks.findIndex((task) => task.id === taskId);
                    if (taskIndex === -1) return proj.columns;

                    const [task] = fromColumn.tasks.splice(taskIndex, 1);
                    toColumn.tasks.push(task);

                    return proj.columns.map((col) =>
                      col.id === fromColumnId
                        ? { ...col, tasks: fromColumn.tasks }
                        : col.id === toColumnId
                        ? { ...col, tasks: toColumn.tasks }
                        : col
                    );
                  })(),
                }
              : proj
          ),
        })),
      updateTask: (projectId, taskId, updates) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  columns: proj.columns.map((col) => ({
                    ...col,
                    tasks: col.tasks.map((task) =>
                      task.id === taskId ? { ...task, ...updates } : task
                    ),
                  })),
                }
              : proj
          ),
        })),
      deleteTask: (projectId, taskId, columnId) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  columns: proj.columns.map((col) =>
                    col.id === columnId
                      ? {
                          ...col,
                          tasks: col.tasks.filter((task) => task.id !== taskId),
                        }
                      : col
                  ),
                }
              : proj
          ),
        })),
      checkDeadlines: (projectId) =>
        set((state) => {
          const now = new Date().toISOString().split('T')[0];
          return {
            projects: state.projects.map((proj) => {
              if (proj.id !== projectId) return proj;
              let backlogTasks: Task[] = [];
              proj.columns.forEach((col) => {
                if (col.id === 'backlog') {
                  backlogTasks = [...col.tasks];
                }
              });
              const updatedColumns = proj.columns.map((col) => {
                if (col.id === 'backlog') return col;
                const overdueTasks = col.tasks.filter(
                  (task) => task.deadline && task.deadline < now
                );
                const remainingTasks = col.tasks.filter(
                  (task) => !task.deadline || task.deadline >= now
                );
                backlogTasks = [...backlogTasks, ...overdueTasks];
                return { ...col, tasks: remainingTasks };
              });
              return {
                ...proj,
                columns: updatedColumns.map((col) =>
                  col.id === 'backlog' ? { ...col, tasks: backlogTasks } : col
                ),
              };
            }),
          };
        }),
    }),
    {
      name: "kanban-storage",
    }
  )
);
