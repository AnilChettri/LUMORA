# Deployment Guide

This guide covers deployment of the Brainimation UI application to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL 16+ (for production)
- Git
- npm or yarn package manager

## Local Development Setup

### 1. Install Dependencies

```bash
cd BrainimationUI/main
npm install
```

### 2. Environment Configuration

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Update with your local settings:

```env
DATABASE_URL=postgresql://localhost:5432/brainimation_dev
NODE_ENV=development
PORT=5001
VITE_API_URL=http://localhost:5001
SESSION_SECRET=your-dev-secret
OPENAI_API_KEY=your_test_api_key
```

### 3. Setup Database

```bash
npm run db:generate  # Generate migrations
npm run db:push     # Apply migrations
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5001`

## Docker Deployment

### Quick Start with Docker Compose

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Build Docker Image Manually

```bash
# Build image
docker build -t brainimation:latest .

# Run container
docker run -d \
  -p 5001:5001 \
  -e DATABASE_URL=postgresql://postgres:password@db:5432/brainimation \
  -e NODE_ENV=production \
  --name brainimation \
  brainimation:latest
```

### Docker Compose with Custom Environment

Create `docker-compose.override.yml`:

```yaml
version: '3.8'
services:
  app:
    environment:
      DATABASE_URL: postgresql://your-user:your-pass@postgres:5432/brainimation
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      SESSION_SECRET: ${SESSION_SECRET}
```

## Cloud Deployment

### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create brainimation

# Add PostgreSQL add-on
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-secret
heroku config:set OPENAI_API_KEY=your-key

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### AWS Deployment (ECS)

1. **Create ECR Repository**

```bash
aws ecr create-repository --repository-name brainimation
```

2. **Build and Push Image**

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t brainimation:latest .

docker tag brainimation:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/brainimation:latest

docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/brainimation:latest
```

3. **Create ECS Task Definition**

See `aws/ecs-task-definition.json`

4. **Deploy Service**

```bash
aws ecs create-service \
  --cluster brainimation-cluster \
  --service-name brainimation-service \
  --task-definition brainimation:1 \
  --desired-count 2 \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=app,containerPort=5001
```

### Vercel Deployment

1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure Build Settings:
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Root Directory: `./BrainimationUI/main`
4. Deploy!

## Database Setup

### PostgreSQL Local Setup

```bash
# Install PostgreSQL
brew install postgresql@16  # macOS
# or apt-get install postgresql-16  # Ubuntu

# Start PostgreSQL
brew services start postgresql@16

# Create database
createdb brainimation_dev

# Run migrations
npm run db:push
```

### RDS Setup (AWS)

1. Create RDS instance
2. Get connection string
3. Set DATABASE_URL environment variable
4. Run migrations

```bash
DATABASE_URL="postgresql://user:pass@rds-instance:5432/brainimation" npm run db:push
```

### Database Backup

```bash
# Backup
pg_dump postgresql://user:pass@localhost/brainimation > backup.sql

# Restore
psql postgresql://user:pass@localhost/brainimation < backup.sql
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/brainimation` |
| `NODE_ENV` | Environment mode | `production` or `development` |
| `SESSION_SECRET` | Session encryption key | Long random string |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `VITE_API_URL` | Frontend API URL | `http://localhost:5001` |
| `JWT_SECRET` | JWT signing secret | Auto-generated |
| `GOOGLE_ANALYTICS_ID` | GA tracking ID | - |
| `SENTRY_DSN` | Error tracking | - |

## CI/CD Pipeline

The project uses GitHub Actions for automated testing and deployment.

### Workflow Stages

1. **Test** - Type checking, linting, building
2. **Build** - Docker image creation and registry push
3. **Deploy** - Deployment to production (on main branch)

### Triggering Deployments

```bash
# Automatic on push to main
git push origin main

# Manual trigger
gh workflow run ci-cd.yml
```

## Monitoring & Logging

### Application Logs

```bash
# Docker logs
docker-compose logs -f app

# File logs (if configured)
tail -f logs/app.log
```

### Database Monitoring

```bash
# Check connection
psql -c "SELECT version();"

# Monitor active connections
psql -c "SELECT * FROM pg_stat_activity;"
```

### Performance Monitoring

Consider integrating:

- **Sentry** - Error tracking
- **DataDog** - Performance monitoring
- **New Relic** - APM monitoring
- **Prometheus** - Metrics collection

### Health Checks

```bash
curl http://localhost:5001/health
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -i :5001

# Kill process
kill -9 <PID>
```

#### Database Connection Failed

```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

#### Docker Build Fails

```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker build --no-cache -t brainimation:latest .
```

#### Node Modules Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Performance Optimization

1. **Enable Compression** - Already configured in Express
2. **Database Indexing** - Run `npm run db:push` to apply
3. **Code Splitting** - Vite handles this automatically
4. **Caching** - Configure CDN for static assets
5. **Image Optimization** - Use WebP format

## Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database migrated and backed up
- [ ] SSL/TLS certificates installed
- [ ] Monitoring and logging enabled
- [ ] Rate limiting configured
- [ ] Backup strategy in place
- [ ] Disaster recovery plan documented
- [ ] Security headers configured
- [ ] Database connection pooling enabled
- [ ] Load balancing configured (if multi-instance)

## Support & Resources

- Documentation: See `README.md`
- Issues: GitHub Issues
- Monitoring: Check `MONITORING.md`
- Security: See `SECURITY.md`
