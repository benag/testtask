console.log('🔄 Starting server initialization...');

import express from 'express';
import cors from 'cors';
// import helmet from 'helmet'; // Disabled for Railway deployment
import compression from 'compression';
import path from 'path';
import { config } from './config';
import routes from './routes';
// import { generalLimiter } from './middleware/rateLimiting'; // Disabled for debugging
import { xssProtection } from './middleware/sanitization';

console.log('✅ All imports loaded successfully');

const app = express();

// Trust proxy for Railway deployment
app.set('trust proxy', true);

// Security middleware - Helmet disabled for Railway deployment
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       scriptSrc: ["'self'"],
//       imgSrc: ["'self'", "data:", "https:"],
//     },
//   },
// }));
console.log('⚠️  Helmet disabled for deployment debugging');

// XSS Protection
app.use(xssProtection);

// Rate limiting - Disabled for Railway deployment debugging
// app.use('/api/', generalLimiter);
console.log('⚠️  Rate limiting disabled for deployment debugging');

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

// Health endpoints (before catch-all)
app.get('/health', (req, res) => {
  console.log('🟢 Health check requested');
  res.json({
    success: true,
    message: 'Task Manager API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv,
    port: parseInt(process.env.PORT || config.port.toString(), 10)
  });
});

app.get('/ping', (req, res) => {
  console.log('🏓 Ping requested');
  res.json({ success: true, message: 'pong', timestamp: new Date().toISOString() });
});

// Serve static files from React build
const clientBuildPath = path.join(__dirname, '../client/dist');
console.log('📁 Serving static files from:', clientBuildPath);

// Check if client build exists
try {
  const fs = require('fs');
  const indexExists = fs.existsSync(path.join(clientBuildPath, 'index.html'));
  console.log('🔍 Client index.html exists:', indexExists);
  if (indexExists) {
    const files = fs.readdirSync(clientBuildPath);
    console.log('📁 Client build files:', files);
  }
} catch (error) {
  console.error('❌ Error checking client build:', error);
}

app.use(express.static(clientBuildPath));

// Railway health check / root handler
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint accessed');

  const indexPath = path.join(clientBuildPath, 'index.html');
  const acceptsHtml = (req.headers.accept || '').includes('text/html');

  try {
    const fs = require('fs');
    const indexExists = fs.existsSync(indexPath);
    if (acceptsHtml && indexExists) {
      res.sendFile(indexPath);
      return;
    }
  } catch (error) {
    console.error('❌ Error serving index.html:', error);
  }

  res.json({
    success: true,
    message: 'Task Manager is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      admin: '/admin/login'
    }
  });
});

// Catch-all handler: send back React's index.html file for SPA routing
app.get('*', (req, res) => {
  // Skip API routes and health endpoints
  if (req.path.startsWith('/api') || req.path === '/health' || req.path === '/ping') {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
    return;
  }
  
  console.log('📥 Serving React app for:', req.path);
  const indexPath = path.join(clientBuildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving React app:', err);
      res.status(500).json({ success: false, error: 'Failed to serve app' });
    }
  });
});

// Remove duplicate endpoints - already defined above

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
console.log('- NODE_ENV:', config.nodeEnv);
console.log('- PORT:', config.port);
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('- OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('- OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);

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
    console.log(`🔗 Server accessible at: http://0.0.0.0:${PORT}`);
    console.log('🎆 Server startup complete!');
  });
  
  server.on('error', (error: any) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
    }
    process.exit(1);
  });
  
  server.on('connection', (socket: any) => {
    console.log('🔗 New connection established');
  });
  
  server.on('request', (req: any) => {
    console.log(`📞 Incoming request: ${req.method} ${req.url}`);
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
