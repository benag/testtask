console.log('🔄 Starting server initialization...');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';
import routes from './routes';
import { generalLimiter } from './middleware/rateLimiting';
import { xssProtection } from './middleware/sanitization';

console.log('✅ All imports loaded successfully');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// XSS Protection
app.use(xssProtection);

// Rate limiting
app.use('/api/', generalLimiter);

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  console.log('📥 Root endpoint hit');
  res.json({
    success: true,
    message: 'Task Manager API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Simple health check (bypass middleware)
app.get('/health', (req, res) => {
  console.log('📥 Direct health check hit');
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message
  });
});

// Start server - Railway compatibility
console.log('🚀 Starting server...');
console.log('🔍 Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);

const PORT = parseInt(process.env.PORT || config.port.toString(), 10);
console.log(`🔌 Attempting to bind to port ${PORT} on 0.0.0.0`);

let server: any;

try {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server successfully running on port ${PORT}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`🌐 CORS origin: ${config.cors.origin}`);
    console.log(`🔍 Railway PORT env: ${process.env.PORT}`);
    console.log(`🔍 Config port: ${config.port}`);
    console.log('🎆 Server startup complete!');
  });
  
  server.on('error', (error: any) => {
    console.error('❌ Server error:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export default app;
