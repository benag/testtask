"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const database_1 = __importDefault(require("../config/database"));
class TaskService {
    async createTask(userId, taskData) {
        const { title, description, status = 'todo', priority = 'medium', due_date } = taskData;
        const query = `
      INSERT INTO tasks (user_id, title, description, status, priority, due_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
        const values = [userId, title, description, status, priority, due_date || null];
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    async getUserTasks(userId, filters = {}, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        let whereConditions = ['user_id = $1'];
        let queryParams = [userId];
        let paramIndex = 2;
        if (filters.status) {
            whereConditions.push(`status = $${paramIndex}`);
            queryParams.push(filters.status);
            paramIndex++;
        }
        if (filters.priority) {
            whereConditions.push(`priority = $${paramIndex}`);
            queryParams.push(filters.priority);
            paramIndex++;
        }
        if (filters.search) {
            whereConditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
            queryParams.push(`%${filters.search}%`);
            paramIndex++;
        }
        if (filters.due_date_from) {
            whereConditions.push(`due_date >= $${paramIndex}`);
            queryParams.push(filters.due_date_from);
            paramIndex++;
        }
        if (filters.due_date_to) {
            whereConditions.push(`due_date <= $${paramIndex}`);
            queryParams.push(filters.due_date_to);
            paramIndex++;
        }
        const whereClause = whereConditions.join(' AND ');
        const countQuery = `SELECT COUNT(*) FROM tasks WHERE ${whereClause}`;
        const countResult = await database_1.default.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].count, 10);
        const dataQuery = `
      SELECT * FROM tasks 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        queryParams.push(limit, offset);
        const dataResult = await database_1.default.query(dataQuery, queryParams);
        return {
            data: dataResult.rows,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
    async getTaskById(taskId, userId) {
        const query = 'SELECT * FROM tasks WHERE id = $1 AND user_id = $2';
        const result = await database_1.default.query(query, [taskId, userId]);
        return result.rows[0] || null;
    }
    async updateTask(taskId, userId, taskData) {
        const updateFields = [];
        const values = [];
        let paramIndex = 1;
        Object.entries(taskData).forEach(([key, value]) => {
            if (value !== undefined) {
                updateFields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });
        if (updateFields.length === 0) {
            return this.getTaskById(taskId, userId);
        }
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(taskId, userId);
        const query = `
      UPDATE tasks 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;
        const result = await database_1.default.query(query, values);
        return result.rows[0] || null;
    }
    async deleteTask(taskId, userId) {
        const query = 'DELETE FROM tasks WHERE id = $1 AND user_id = $2';
        const result = await database_1.default.query(query, [taskId, userId]);
        return result.rowCount !== null && result.rowCount > 0;
    }
    async getTaskStats() {
        const totalQuery = 'SELECT COUNT(*) as total_tasks FROM tasks';
        const totalResult = await database_1.default.query(totalQuery);
        const statusQuery = `
      SELECT status, COUNT(*) as count 
      FROM tasks 
      GROUP BY status 
      ORDER BY status
    `;
        const statusResult = await database_1.default.query(statusQuery);
        const priorityQuery = `
      SELECT priority, COUNT(*) as count 
      FROM tasks 
      GROUP BY priority 
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END
    `;
        const priorityResult = await database_1.default.query(priorityQuery);
        return {
            total_tasks: parseInt(totalResult.rows[0].total_tasks, 10),
            tasks_by_status: statusResult.rows,
            tasks_by_priority: priorityResult.rows,
        };
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=taskService.js.map