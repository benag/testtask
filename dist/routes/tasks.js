"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const taskController = new taskController_1.TaskController();
router.use(auth_1.authenticateToken);
router.post('/', (0, validation_1.validateRequest)(validation_1.schemas.createTask), taskController.createTask.bind(taskController));
router.get('/', taskController.getTasks.bind(taskController));
router.get('/:id', taskController.getTask.bind(taskController));
router.put('/:id', (0, validation_1.validateRequest)(validation_1.schemas.updateTask), taskController.updateTask.bind(taskController));
router.delete('/:id', taskController.deleteTask.bind(taskController));
exports.default = router;
//# sourceMappingURL=tasks.js.map