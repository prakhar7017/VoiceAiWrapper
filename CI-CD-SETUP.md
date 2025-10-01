# CI/CD Setup Guide

This document explains the simple CI/CD pipeline setup for the VoiceAI Wrapper project.

## 🚀 Overview

Our CI/CD pipeline includes:
- **GitHub Actions** for automated testing and building
- **Docker** containers for consistent deployments
- **Health checks** for monitoring
- **Multi-stage builds** for optimization

## 📁 Files Structure

```
.github/workflows/ci-cd.yml    # GitHub Actions workflow
backend/Dockerfile             # Backend container
frontend/Dockerfile            # Frontend container  
frontend/nginx.conf            # Nginx configuration
docker-compose.yml             # Full stack orchestration
```

## 🔄 CI/CD Workflow

### Triggers
- **Push** to `main` or `develop` branches
- **Pull requests** to `main` branch

### Pipeline Stages

1. **Backend Testing**
   - Sets up Python 3.11
   - Installs dependencies
   - Runs database migrations
   - Executes tests
   - Builds Docker image (on main branch)

2. **Frontend Testing**
   - Sets up Node.js 18
   - Installs dependencies
   - Runs linting and type checking
   - Runs tests
   - Builds application
   - Creates Docker image (on main branch)

3. **Deployment** (main branch only)
   - Deploys to staging environment
   - Ready for production deployment

## 🐳 Docker Setup

### Local Development
```bash
# Start the full stack
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Services
```bash
# Backend only
cd backend
docker build -t voiceai-backend .
docker run -p 8000:8000 voiceai-backend

# Frontend only
cd frontend
docker build -t voiceai-frontend .
docker run -p 3000:80 voiceai-frontend
```

## 🌐 Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **GraphQL Playground**: http://localhost:8000/graphql/
- **Admin Panel**: http://localhost:8000/admin/
- **PgAdmin**: http://localhost:5050

## 📊 Health Checks

All services include health checks:
- **Backend**: `/admin/` endpoint
- **Frontend**: `/health` endpoint
- **Database**: `pg_isready` command

## 🔧 Environment Variables

### Backend
```env
DATABASE_URL=postgres://postgres:postgres@postgres:5432/project_management
DEBUG=0
ALLOWED_HOSTS=localhost,127.0.0.1,backend
```

### Frontend
Built-time configuration in `vite.config.ts`

## 📝 Available Scripts

### Frontend
```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
npm run type-check   # TypeScript checking
npm run test         # Run tests
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
```

### Backend
```bash
python manage.py runserver    # Development server
python manage.py test         # Run tests
python manage.py migrate      # Database migrations
gunicorn voiceai.wsgi        # Production server
```

## 🚀 Deployment Options

### 1. Simple VPS Deployment
```bash
# On your server
git clone <your-repo>
cd VoiceAiWrapper
docker-compose up -d
```

### 2. Cloud Platforms

#### Heroku
- Add `heroku.yml` for container deployment
- Set environment variables in Heroku dashboard

#### DigitalOcean App Platform
- Connect GitHub repository
- Configure build and run commands
- Set environment variables

#### AWS/GCP
- Use container services (ECS, Cloud Run)
- Configure load balancers and databases

## 🔐 Security Considerations

1. **Environment Variables**
   - Never commit secrets to Git
   - Use GitHub Secrets for CI/CD
   - Use environment-specific configs

2. **Docker Security**
   - Non-root users in containers
   - Health checks for monitoring
   - Security headers in Nginx

3. **Database**
   - Use strong passwords
   - Enable SSL in production
   - Regular backups

## 📈 Monitoring

### Health Check Endpoints
- `GET /health` - Frontend health
- `GET /admin/` - Backend health
- Database connection checks

### Logs
```bash
# View all logs
docker-compose logs

# Specific service logs
docker-compose logs backend
docker-compose logs frontend
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :8000
   ```

2. **Database Connection**
   ```bash
   # Check PostgreSQL status
   docker-compose ps postgres
   docker-compose logs postgres
   ```

3. **Build Failures**
   ```bash
   # Rebuild without cache
   docker-compose build --no-cache
   ```

## 🎯 Next Steps

1. **Set up GitHub repository**
2. **Configure GitHub Secrets** for deployment
3. **Choose deployment platform**
4. **Set up monitoring** (optional)
5. **Configure domain and SSL** (production)

## 📞 Support

For issues with the CI/CD setup:
1. Check GitHub Actions logs
2. Review Docker container logs
3. Verify environment variables
4. Test locally with Docker Compose

---

**Happy Deploying! 🚀**
