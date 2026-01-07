import { Router } from "express";
import { getTasksByProject, createTask, updateTask, deleteTask } from "../controllers/taskController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get('/project/:projectId',authMiddleware, getTasksByProject);
router.post('/',authMiddleware, createTask);
router.patch('/:taskid',authMiddleware, updateTask);
router.delete('/:taskid',authMiddleware, deleteTask);




export default router;