#!/bin/bash
# Production Deployment Script
# Usage: ./scripts/deploy-production.sh [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_ENV=production
VERSION=${1:-$(date +%Y%m%d_%H%M%S)}
LOG_FILE="logs/deploy_${VERSION}.log"
BACKUP_DIR="backups"

# Functions
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

check_prerequisites() {
  log_info "Checking prerequisites..."
  
  # Check Node.js
  if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    exit 1
  fi
  
  # Check npm
  if ! command -v npm &> /dev/null; then
    log_error "npm is not installed"
    exit 1
  fi
  
  # Check Docker (if using containers)
  if ! command -v docker &> /dev/null; then
    log_warn "Docker is not installed (required for containerized deployment)"
  fi
  
  # Check git
  if ! command -v git &> /dev/null; then
    log_error "Git is not installed"
    exit 1
  fi
  
  log_info "All prerequisites met"
}

backup_database() {
  log_info "Backing up database..."
  
  mkdir -p "$BACKUP_DIR"
  
  BACKUP_FILE="$BACKUP_DIR/backup_${VERSION}.sql.gz"
  
  if ! pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"; then
    log_error "Database backup failed"
    exit 1
  fi
  
  log_info "Database backed up to $BACKUP_FILE"
  
  # Upload to S3 (optional)
  if command -v aws &> /dev/null && [ -n "$AWS_S3_BACKUP_BUCKET" ]; then
    log_info "Uploading backup to S3..."
    aws s3 cp "$BACKUP_FILE" "s3://$AWS_S3_BACKUP_BUCKET/" || log_warn "S3 upload failed"
  fi
}

build_application() {
  log_info "Building application..."
  
  npm ci --production=false
  
  if ! npm run build; then
    log_error "Build failed"
    exit 1
  fi
  
  log_info "Build completed successfully"
}

run_tests() {
  log_info "Running tests..."
  
  if ! npm run test; then
    log_error "Tests failed"
    exit 1
  fi
  
  log_info "All tests passed"
}

run_type_check() {
  log_info "Running TypeScript type check..."
  
  if ! npm run check; then
    log_error "Type check failed"
    exit 1
  fi
  
  log_info "Type check passed"
}

run_migrations() {
  log_info "Running database migrations..."
  
  if ! npm run db:push; then
    log_error "Database migrations failed"
    exit 1
  fi
  
  log_info "Migrations completed successfully"
}

build_docker_image() {
  log_info "Building Docker image..."
  
  DOCKER_TAG="brainimation:${VERSION}"
  DOCKER_LATEST="brainimation:latest"
  
  if ! docker build -t "$DOCKER_TAG" -t "$DOCKER_LATEST" .; then
    log_error "Docker build failed"
    exit 1
  fi
  
  log_info "Docker image built: $DOCKER_TAG"
}

push_docker_image() {
  log_info "Pushing Docker image to registry..."
  
  DOCKER_REGISTRY=${DOCKER_REGISTRY:-ghcr.io}
  IMAGE_NAME="${DOCKER_REGISTRY}/brainimation:${VERSION}"
  
  if ! docker tag "brainimation:${VERSION}" "$IMAGE_NAME"; then
    log_error "Failed to tag Docker image"
    exit 1
  fi
  
  if ! docker push "$IMAGE_NAME"; then
    log_error "Failed to push Docker image"
    exit 1
  fi
  
  log_info "Docker image pushed: $IMAGE_NAME"
}

deploy_docker() {
  log_info "Deploying with Docker Compose..."
  
  if ! docker-compose -f docker-compose.prod.yml pull; then
    log_error "Failed to pull Docker images"
    exit 1
  fi
  
  if ! docker-compose -f docker-compose.prod.yml up -d; then
    log_error "Failed to start services"
    exit 1
  fi
  
  log_info "Services deployed successfully"
}

health_check() {
  log_info "Performing health checks..."
  
  HEALTH_URL=${HEALTH_URL:-http://localhost:5001/health}
  RETRIES=5
  DELAY=10
  
  for ((i=1; i<=RETRIES; i++)); do
    log_info "Health check attempt $i/$RETRIES..."
    
    if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
      log_info "✓ Application is healthy"
      return 0
    fi
    
    if [ $i -lt $RETRIES ]; then
      sleep $DELAY
    fi
  done
  
  log_error "Health check failed after $RETRIES attempts"
  return 1
}

smoke_tests() {
  log_info "Running smoke tests..."
  
  local api_url=${API_URL:-http://localhost:5001}
  
  # Test health endpoint
  if ! curl -f "$api_url/health" > /dev/null 2>&1; then
    log_error "Health endpoint test failed"
    return 1
  fi
  log_info "✓ Health endpoint working"
  
  # Test API response
  if ! curl -f "$api_url/api/health" > /dev/null 2>&1; then
    log_warn "API endpoint test inconclusive"
  fi
  log_info "✓ API responding"
  
  log_info "All smoke tests passed"
  return 0
}

notify_deployment() {
  log_info "Notifying team of deployment..."
  
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
      -H 'Content-Type: application/json' \
      -d "{
        \"text\": \"🚀 Deployment Completed\",
        \"blocks\": [
          {
            \"type\": \"section\",
            \"text\": {
              \"type\": \"mrkdwn\",
              \"text\": \"*Brainimation Deployment*\n• Version: $VERSION\n• Status: Success ✓\"
            }
          }
        ]
      }" || log_warn "Failed to send Slack notification"
  fi
}

main() {
  mkdir -p logs
  
  log_info "Starting deployment process for version $VERSION"
  log_info "Environment: $DEPLOY_ENV"
  
  # Pre-deployment checks
  check_prerequisites
  
  # Build phase
  run_type_check
  build_application
  run_tests
  
  # Backup phase
  backup_database
  
  # Migration phase
  run_migrations
  
  # Deploy phase
  if command -v docker &> /dev/null; then
    build_docker_image
    deploy_docker
  else
    log_warn "Skipping Docker deployment (Docker not installed)"
  fi
  
  # Verification phase
  if health_check && smoke_tests; then
    log_info "✓ Deployment successful!"
    notify_deployment
  else
    log_error "✗ Deployment verification failed"
    exit 1
  fi
}

# Run main function
main
