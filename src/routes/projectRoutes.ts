import { Router } from "express";
import { getProjects, createProject, updateProject, deleteProject } from "../controllers/projectController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get('/',authMiddleware, getProjects);


router.post('/',authMiddleware, createProject);
router.patch('/:id',authMiddleware, updateProject);
router.delete('/:id',authMiddleware, deleteProject);


export default router;