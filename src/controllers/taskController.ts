import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';
import { CreateTaskRequest, UpdateTaskRequest, TaskFilters, ApiResponse, Task, PaginatedResponse } from '../types';
import { AuthRequest } from '../middleware/auth';

const taskService = new TaskService();

export class TaskController {
  async createTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskData: CreateTaskRequest = req.body;

      const task = await taskService.createTask(userId, taskData);

      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully'
      });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const filters: TaskFilters = {
        status: req.query.status as any,
        priority: req.query.priority as any,
        search: req.query.search as string,
        due_date_from: req.query.due_date_from as string,
        due_date_to: req.query.due_date_to as string,
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof TaskFilters] === undefined) {
          delete filters[key as keyof TaskFilters];
        }
      });

      const result = await taskService.getUserTasks(userId, filters, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Task ID is required'
        });
        return;
      }

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
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updateTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;
      const taskData: UpdateTaskRequest = req.body;

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Task ID is required'
        });
        return;
      }

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
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Task ID is required'
        });
        return;
      }

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
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
