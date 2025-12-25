# Deployment Guide

## 🚀 Railway Deployment

### Backend Deployment

1. **Create Railway Project**
   ```bash
   railway login
   railway init
   ```

2. **Add PostgreSQL Database**
   - Go to Railway dashboard
   - Add PostgreSQL service
   - Copy the DATABASE_URL from the service

3. **Set Environment Variables**
   ```bash
   railway variables set JWT_SECRET=your-super-secret-jwt-key-production
   railway variables set NODE_ENV=production
   railway variables set FRONTEND_URL=https://your-frontend-domain.com
   railway variables set PORT=3000
   ```

4. **Deploy Backend**
   ```bash
   railway up
   ```

### Frontend Deployment (Netlify/Vercel)

1. **Build Frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect GitHub repository
   - Set build command: `cd client && npm run build`
   - Set publish directory: `client/dist`
   - Set environment variable: `VITE_API_URL=https://your-backend-domain.railway.app/api`

3. **Deploy to Vercel**
   ```bash
   cd client
   vercel --prod
   ```

## 🐳 Docker Deployment

### Build and Run Locally

```bash
# Build the image
docker build -t task-manager .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/dbname \
  -e JWT_SECRET=your-secret \
  -e NODE_ENV=production \
  task-manager
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/task_manager
      - JWT_SECRET=your-secret-key
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=task_manager
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## 🔧 Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=30m
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (client/.env)
```bash
VITE_API_URL=https://your-backend-domain.com/api
```

## 📊 Health Checks

The application includes health check endpoints:

- **API Health**: `GET /api/health`
- **Database Health**: Included in API health check
- **Docker Health**: Built-in healthcheck in Dockerfile

## 🔒 Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong database passwords
- [ ] Enable SSL/HTTPS in production
- [ ] Configure CORS for production domains
- [ ] Set up rate limiting
- [ ] Enable database SSL
- [ ] Use environment variables for secrets
- [ ] Set up monitoring and logging

## 📈 Performance Optimization

### Database
- [ ] Add database indexes for frequently queried fields
- [ ] Set up connection pooling
- [ ] Configure database backup strategy
- [ ] Monitor query performance

### Application
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Monitor application metrics

### Frontend
- [ ] Enable service worker for caching
- [ ] Optimize bundle size
- [ ] Use lazy loading for routes
- [ ] Compress images and assets

## 🔍 Monitoring

### Recommended Tools
- **Application Monitoring**: New Relic, DataDog
- **Error Tracking**: Sentry
- **Uptime Monitoring**: Pingdom, UptimeRobot
- **Log Management**: LogRocket, Papertrail

### Key Metrics to Monitor
- Response time
- Error rate
- Database connection pool usage
- Memory and CPU usage
- Active user sessions
- Translation cache hit rate

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check database URL format
DATABASE_URL=postgresql://username:password@host:port/database

# Verify SSL settings for production
ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
```

**CORS Errors**
```bash
# Update CORS origin in production
FRONTEND_URL=https://your-actual-frontend-domain.com
```

**Migration Errors**
```bash
# Run migrations manually
npm run migrate

# Check migration status
psql $DATABASE_URL -c "SELECT * FROM migrations;"
```

**Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules client/node_modules
npm run install:all
npm run build
```

## 📱 Mobile Considerations

The application is responsive and works on mobile devices. For native mobile apps:

1. **React Native**: Reuse API and business logic
2. **Capacitor**: Wrap existing web app
3. **PWA**: Add service worker and manifest

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm run install:all
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Railway
        uses: railway/cli@v2
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
        run: railway up
```

## 📋 Post-Deployment Checklist

- [ ] Verify all API endpoints work
- [ ] Test user registration and login
- [ ] Test task CRUD operations
- [ ] Test admin panel functionality
- [ ] Test language switching
- [ ] Verify translations load correctly
- [ ] Test mobile responsiveness
- [ ] Check error handling
- [ ] Verify security headers
- [ ] Test database migrations
- [ ] Set up monitoring alerts
- [ ] Document API endpoints
- [ ] Create backup strategy
