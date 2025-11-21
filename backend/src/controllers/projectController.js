import Project from "../models/Project.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name } = req.body;
    const project = new Project({
      name,
      columns: [
        { id: "backlog", title: "Backlog", tasks: [] },
        { id: "todo", title: "To Do", tasks: [] },
        { id: "in-progress", title: "In Progress", tasks: [] },
        { id: "done", title: "Done", tasks: [] },
      ],
    });
    await project.save();
    global.io.sockets.sockets.forEach((socket) => {
      if (socket.userId !== req.user.userId) {
        socket.emit("project-created", project);
      }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const project = await Project.findOneAndUpdate({ _id: id }, updates, {
      new: true,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    global.io.sockets.sockets.forEach((socket) => {
      if (socket.userId !== req.user.userId) {
        socket.emit("project-updated", project);
      }
    });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await Project.findOneAndDelete({ _id: id });
    global.io.sockets.sockets.forEach((socket) => {
      if (socket.userId !== req.user.userId) {
        socket.emit("project-deleted", { id });
      }
    });
    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { columnId, task } = req.body;
    const project = await Project.findOne({
      _id: projectId,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const column = project.columns.find((col) => col.id === columnId);
    if (!column) return res.status(404).json({ message: "Column not found" });

    const newTask = { ...task, id: Date.now().toString() };
    column.tasks.push(newTask);
    await project.save();
    global.io.sockets.sockets.forEach((socket) => {
      if (socket.userId !== req.user.userId) {
        socket.emit("task-added", project);
      }
    });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const updates = req.body;
    const project = await Project.findOne({
      _id: projectId,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    for (const column of project.columns) {
      const taskIndex = column.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        Object.assign(column.tasks[taskIndex], updates);
        break;
      }
    }
    await project.save();
    global.io.sockets.sockets.forEach((socket) => {
      if (socket.userId !== req.user.userId) {
        socket.emit("task-updated", project);
      }
    });
    console.log("task updated successfully");
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const project = await Project.findOne({
      _id: projectId,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    for (const column of project.columns) {
      column.tasks = column.tasks.filter((task) => task.id !== taskId);
    }
    await project.save();
    global.io.sockets.sockets.forEach((socket) => {
      if (socket.userId !== req.user.userId) {
        socket.emit("task-deleted", project);
      }
    });
    console.log("task deleted successfully");
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const moveTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { taskId, fromColumnId, toColumnId } = req.body;
    const project = await Project.findOne({
      _id: projectId,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const fromColumn = project.columns.find((col) => col.id === fromColumnId);
    const toColumn = project.columns.find((col) => col.id === toColumnId);
    if (!fromColumn || !toColumn)
      return res.status(404).json({ message: "Column not found" });

    const taskIndex = fromColumn.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1)
      return res.status(404).json({ message: "Task not found" });

    const [task] = fromColumn.tasks.splice(taskIndex, 1);
    toColumn.tasks.push(task);
    await project.save();
    global.io.sockets.sockets.forEach((socket) => {
      if (socket.userId !== req.user.userId) {
        socket.emit("task-moved", project);
      }
    });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
