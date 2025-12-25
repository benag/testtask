"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const taskService_1 = require("../services/taskService");
const taskService = new taskService_1.TaskService();
class TaskController {
    async createTask(req, res) {
        try {
            const userId = req.user.id;
            const taskData = req.body;
            const task = await taskService.createTask(userId, taskData);
            res.status(201).json({
                success: true,
                data: task,
                message: 'Task created successfully'
            });
        }
        catch (error) {
            console.error('Create task error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async getTasks(req, res) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                status: req.query.status,
                priority: req.query.priority,
                search: req.query.search,
                due_date_from: req.query.due_date_from,
                due_date_to: req.query.due_date_to,
            };
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined) {
                    delete filters[key];
                }
            });
            const result = await taskService.getUserTasks(userId, filters, page, limit);
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('Get tasks error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async getTask(req, res) {
        try {
            const userId = req.user.id;
            const taskId = req.params.id;
            const task = await taskService.getTaskById(taskId, userId);
            if (!task) {
                res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
                return;
            }
            res.json({
                success: true,
                data: task
            });
        }
        catch (error) {
            console.error('Get task error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async updateTask(req, res) {
        try {
            const userId = req.user.id;
            const taskId = req.params.id;
            const taskData = req.body;
            const task = await taskService.updateTask(taskId, userId, taskData);
            if (!task) {
                res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
                return;
            }
            res.json({
                success: true,
                data: task,
                message: 'Task updated successfully'
            });
        }
        catch (error) {
            console.error('Update task error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async deleteTask(req, res) {
        try {
            const userId = req.user.id;
            const taskId = req.params.id;
            const deleted = await taskService.deleteTask(taskId, userId);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Task deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete task error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
exports.TaskController = TaskController;
//# sourceMappingURL=taskController.js.map