import { Router } from "express";
import { getTasksByProject, createTask, updateTask, deleteTask } from "../controllers/taskController.js";

const router = Router();

router.get('/project/:projectId', getTasksByProject);
router.post('/', createTask);
router.patch('/:taskid', updateTask);
router.delete('/:taskid', deleteTask);




export default router;