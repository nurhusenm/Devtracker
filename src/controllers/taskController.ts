import { type Request, type Response } from "express";
import Project from "../model/Project.js";
import Task from "../model/Task.js";

// 1. Create a Task (Must link to a Project)
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    // We expect projectId to be sent in the body
    const { title, description, status, projectId } = req.body;

    // Validation: Check if the Project actually exists first!
    const projectExists = await Project.findById(projectId);
    if (!projectExists) {
        res.status(404).json({ message: "Project not found" });
        return; 
    }

    const newTask = new Task({
      title,
      description,
      status: status || 'todo',
      projectId // This links the task to the project
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);

  } catch (error) {
    console.error("🔥 ERROR CREATING TASK:", error); 
    res.status(500).json({ message: 'Failed to create task', error });  }
};

// 2. Get Tasks for a specific Project
export const getTasksByProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.projectId; // We will get this from the URL (e.g., /api/tasks/project/123)

    if (!projectId) {
      res.status(400).json({ message: 'Project ID is required' });
      return;
    }

    // Find all tasks where the 'projectId' field matches our URL param
    const tasks = await Task.find({ projectId: projectId });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { taskid } = req.params; // Must match route parameter name :taskid

        if (!taskid) {
            res.status(400).json({ message: 'Task ID is required' });
            return;
        }

        // Remove projectId from update data - tasks shouldn't change projects
        const { projectId, ...updateData } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(taskid, updateData, { new: true, runValidators: true });
        if(!updatedTask) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update task', error });
    }
}

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { taskid } = req.params;
        const deletedTask = await Task.findByIdAndDelete(taskid);
        if(!deletedTask) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete task', error });
    }
}
