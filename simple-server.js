const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const port = 3000;

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:jhbsd73b@database-1.cn8k6a26wgvi.us-east-1.rds.amazonaws.com:5432/task_manager'
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Server and database are running!',
      timestamp: result.rows[0].now,
      database: 'Connected to RDS PostgreSQL'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error.message
    });
  }
});

// Test endpoint to check tables
app.get('/api/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    res.json({
      success: true,
      tables: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Simple server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`📋 Tables: http://localhost:${port}/api/tables`);
});
