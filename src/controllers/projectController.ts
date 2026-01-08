// src/controllers/projectController.ts
import {type Request, type Response } from 'express';
import Project from '../model/Project.js';
import { type AuthRequest } from '../middlewares/authMiddleware.js';
// 1. Get all Projects (Dashboard view)
export const getProjects = async (req: Request, res: Response) => {
  try {

    const userId = (req as AuthRequest).user?.userId;

    const projects = await Project.find({ owner: userId}); // Mongoose query
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// 2. Create a new Project
export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
const userId = (req as AuthRequest).user?.userId;

    // req.body contains the data sent from the frontend (or Postman)
    const { name, description, status } = req.body;
    // Basic validation
    if (!name || !description ) {
        res.status(400).json({ message: "Name and Description are required" });
        return; // Stop execution
    }

    // Create a new instance of the model
    const newProject = new Project({
      name,
      description,
      status: status || 'active',
      owner: userId
    });

    // Save to Database (this is the actual DB call)
    const savedProject = await newProject.save();

    // Respond with the saved data
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project', error });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {

  try {
    
  const {id} = req.params;
  const userId = (req as AuthRequest).user?.userId;

  const project = await Project.findById(id);

  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  if (project.owner.toString() !== userId) {
    res.status(403).json({ message: "Not authorized to delete this project" });
    return;
}

await project.deleteOne();
// await project.save();

res.json({ message: "Project deleted successfully" });


} catch (error) {
  res.status(500).json({ message: 'Failed to delete project' });
}
}

export const updateProject = async (req: Request, res: Response): Promise<void> => {

  try {
    
  const {id } = req.params;
  const { name, description, status} = req.body;
  const userId = (req as AuthRequest).user?.userId;

  const project = await Project.findById(id);

  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  if (project.owner.toString() !== userId) {
    res.status(403).json({ message: "Not authorized to update this project" });
    return;
}


project.name = name ?? project.name;
project.description = description ?? project.description;
project.status = status ?? project.status;

await project.save();
res.json(project);

} catch (error) {
  res.status(500).json({ message: 'Failed to update project' });
}
}