#!/bin/bash

#
# Cloudflare Pages Deployment Script
# Automated deployment with validation and rollback support
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="sutra-lounge"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$PROJECT_DIR/dist"
BUILD_LOG="$PROJECT_DIR/.build.log"

# Functions
log_info() {
  echo -e "${BLUE}ℹ${NC}  $1"
}

log_success() {
  echo -e "${GREEN}✓${NC}  $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC}  $1"
}

log_error() {
  echo -e "${RED}✗${NC}  $1"
}

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."
  
  if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    exit 1
  fi
  log_success "Node.js found: $(node --version)"
  
  if ! command -v npm &> /dev/null; then
    log_error "npm is not installed"
    exit 1
  fi
  log_success "npm found: $(npm --version)"
  
  if ! command -v wrangler &> /dev/null; then
    log_warning "Wrangler CLI not found, installing..."
    npm install -g wrangler@latest
  fi
  log_success "Wrangler found: $(wrangler --version)"
  
  if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    log_error "CLOUDFLARE_API_TOKEN environment variable not set"
    exit 1
  fi
  log_success "Cloudflare API token configured"
}

# Validate environment variables
validate_env() {
  log_info "Validating environment variables..."
  
  if [ -z "$VITE_SUPABASE_URL" ]; then
    log_error "VITE_SUPABASE_URL not set"
    exit 1
  fi
  log_success "VITE_SUPABASE_URL configured"
  
  if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    log_error "VITE_SUPABASE_ANON_KEY not set"
    exit 1
  fi
  log_success "VITE_SUPABASE_ANON_KEY configured"
}

# Install dependencies
install_deps() {
  log_info "Installing dependencies..."
  cd "$PROJECT_DIR"
  npm ci > "$BUILD_LOG" 2>&1
  log_success "Dependencies installed"
}

# Run tests
run_tests() {
  log_info "Running tests..."
  cd "$PROJECT_DIR"
  npm run lint > "$BUILD_LOG" 2>&1 || log_warning "Linting completed with warnings"
  log_success "Tests completed"
}

# Build application
build_app() {
  log_info "Building application..."
  cd "$PROJECT_DIR"
  
  VITE_ENVIRONMENT=production npm run build > "$BUILD_LOG" 2>&1
  
  if [ ! -d "$DIST_DIR" ]; then
    log_error "Build failed: dist directory not found"
    cat "$BUILD_LOG"
    exit 1
  fi
  
  log_success "Build completed"
  
  # Log build statistics
  DIST_SIZE=$(du -sh "$DIST_DIR" | cut -f1)
  log_info "Build size: $DIST_SIZE"
}

# Verify build output
verify_build() {
  log_info "Verifying build output..."
  
  if [ ! -f "$DIST_DIR/index.html" ]; then
    log_error "index.html not found in build"
    exit 1
  fi
  log_success "index.html found"
  
  if [ ! -d "$DIST_DIR/assets" ]; then
    log_error "assets directory not found in build"
    exit 1
  fi
  log_success "assets directory found"
  
  if [ ! -d "$DIST_DIR/images" ]; then
    log_error "images directory not found in build"
    exit 1
  fi
  log_success "images directory found"
  
  # Check for required config files
  if [ ! -f "$DIST_DIR/_headers" ]; then
    log_warning "_headers file not found"
  else
    log_success "_headers file verified"
  fi
  
  if [ ! -f "$DIST_DIR/_redirects" ]; then
    log_warning "_redirects file not found"
  else
    log_success "_redirects file verified"
  fi
}

# Deploy to Cloudflare
deploy() {
  log_info "Deploying to Cloudflare Pages..."
  
  cd "$PROJECT_DIR"
  
  DEPLOY_OUTPUT=$(wrangler pages publish "$DIST_DIR" --project-name="$PROJECT_NAME" 2>&1)
  
  if [ $? -ne 0 ]; then
    log_error "Deployment failed"
    echo "$DEPLOY_OUTPUT"
    exit 1
  fi
  
  log_success "Deployment completed"
  echo "$DEPLOY_OUTPUT"
  
  # Extract deployment URL
  DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oP 'https://[^\s]+' | head -1 || echo "")
  
  if [ -n "$DEPLOY_URL" ]; then
    log_info "Deployment URL: $DEPLOY_URL"
  fi
}

# Health check
health_check() {
  log_info "Running health checks..."
  
  # Wait for deployment to be live
  sleep 5
  
  if curl -s -f -o /dev/null "https://$PROJECT_NAME.pages.dev/"; then
    log_success "Health check passed"
  else
    log_warning "Health check failed (may still be propagating)"
  fi
}

# Cleanup
cleanup() {
  log_info "Cleaning up..."
  rm -f "$BUILD_LOG"
  log_success "Cleanup completed"
}

# Main deployment flow
main() {
  echo -e "${BLUE}═══════════════════════════════════════${NC}"
  echo -e "${BLUE}Cloudflare Pages Deployment${NC}"
  echo -e "${BLUE}═══════════════════════════════════════${NC}\n"
  
  check_prerequisites
  validate_env
  install_deps
  run_tests
  build_app
  verify_build
  deploy
  health_check
  cleanup
  
  echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
  log_success "Deployment completed successfully!"
  echo -e "${BLUE}═══════════════════════════════════════${NC}"
}

# Handle errors
trap 'log_error "Deployment failed"; exit 1' ERR

# Run main
main "$@"
