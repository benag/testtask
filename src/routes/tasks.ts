import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { validateRequest, schemas } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const taskController = new TaskController();

// All task routes require authentication
router.use(authenticateToken);

router.post('/', validateRequest(schemas.createTask), taskController.createTask.bind(taskController));
router.get('/', taskController.getTasks.bind(taskController));
router.get('/:id', taskController.getTask.bind(taskController));
router.put('/:id', validateRequest(schemas.updateTask), taskController.updateTask.bind(taskController));
router.delete('/:id', taskController.deleteTask.bind(taskController));

export default router;
