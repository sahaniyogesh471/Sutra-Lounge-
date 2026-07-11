#!/bin/bash

#
# Cloudflare Pages Rollback Script
# Rollback to previous deployment
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ${NC}  $1"; }
log_success() { echo -e "${GREEN}✓${NC}  $1"; }
log_error() { echo -e "${RED}✗${NC}  $1"; }

PROJECT_NAME="sutra-lounge"

main() {
  echo -e "${BLUE}═══════════════════════════════════════${NC}"
  echo -e "${BLUE}Cloudflare Pages Rollback${NC}"
  echo -e "${BLUE}═══════════════════════════════════════${NC}\n"
  
  if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    log_error "CLOUDFLARE_API_TOKEN not set"
    exit 1
  fi
  
  log_info "Fetching deployment history..."
  
  # List recent deployments
  DEPLOYMENTS=$(wrangler pages deployments list --project-name="$PROJECT_NAME" 2>&1)
  
  log_info "Recent deployments:"
  echo "$DEPLOYMENTS"
  
  # Get the previous deployment ID
  PREV_ID=$(echo "$DEPLOYMENTS" | grep -v "current" | head -2 | tail -1 | awk '{print $1}')
  
  if [ -z "$PREV_ID" ]; then
    log_error "No previous deployment found"
    exit 1
  fi
  
  log_info "Rolling back to deployment: $PREV_ID"
  
  # Confirm rollback
  read -p "Are you sure you want to rollback? (yes/no): " confirm
  
  if [ "$confirm" != "yes" ]; then
    log_info "Rollback cancelled"
    exit 0
  fi
  
  # Perform rollback
  ROLLBACK_OUTPUT=$(wrangler pages rollback --project-name="$PROJECT_NAME" --version="$PREV_ID" 2>&1)
  
  if [ $? -eq 0 ]; then
    log_success "Rollback completed successfully!"
    log_info "Rolled back to: $PREV_ID"
  else
    log_error "Rollback failed"
    echo "$ROLLBACK_OUTPUT"
    exit 1
  fi
  
  log_info "Waiting for rollback to propagate..."
  sleep 10
  
  if curl -s -f -o /dev/null "https://$PROJECT_NAME.pages.dev/"; then
    log_success "Site is online"
  else
    log_error "Site appears to be offline"
  fi
  
  echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
  log_success "Rollback completed!"
  echo -e "${BLUE}═══════════════════════════════════════${NC}"
}

trap 'log_error "Rollback failed"; exit 1' ERR
main "$@"
