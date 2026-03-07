#!/usr/bin/env bash

# ==============================================================================
# Portfolio Management Script
# Designed by DevOps, for DevOps. Automates local testing, validation,
# and deployment of the YAML-driven static portfolio site.
# ==============================================================================

set -e # Exit on error

# --- Colors for terminal output ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PORT=8080
IMAGE_NAME="portfolio-dev-server"

# --- Helper Functions ---
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

show_help() {
    cat << EOF
Usage: ./manage.sh [COMMAND]

Commands:
  start      Start a local HTTP server (Python/Node) to preview the site.
  docker     Build and run the site locally using an Nginx Docker container.
  validate   Validate the syntax of content.yaml.
  help       Show this help message.

Example:
  ./manage.sh start
EOF
}

# --- Command: Validate YAML ---
cmd_validate() {
    log_info "Validating content.yaml syntax..."
    
    if [ ! -f "content.yaml" ]; then
        log_error "content.yaml not found in current directory."
        exit 1
    fi

    # Try validating with Python (usually available)
    if command -v python3 >/dev/null 2>&1; then
        python3 -c "import yaml; yaml.safe_load(open('content.yaml'))" 2>/dev/null
        if [ $? -eq 0 ]; then
            log_success "content.yaml syntax is valid."
            return 0
        else
            log_error "Syntax error in content.yaml. Check your indentation and quotes."
            exit 1
        fi
    elif command -v python >/dev/null 2>&1; then
        python -c "import yaml; yaml.safe_load(open('content.yaml'))" 2>/dev/null
        if [ $? -eq 0 ]; then
            log_success "content.yaml syntax is valid."
            return 0
        else
            log_error "Syntax error in content.yaml. Check your indentation and quotes."
            exit 1
        fi
    elif command -v yq >/dev/null 2>&1; then
        yq e '.' content.yaml >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            log_success "content.yaml syntax is valid."
            return 0
        else
            log_error "Syntax error in content.yaml."
            exit 1
        fi
    else
        log_warn "Neither 'python3' (with pyyaml) nor 'yq' found. Skipping strict validation."
    fi
}

# --- Command: Start Local Server ---
cmd_start() {
    log_info "Starting local development server on port ${PORT}..."
    
    # Try Python 3
    if command -v python3 >/dev/null 2>&1; then
        log_success "Using python3 -m http.server"
        python3 -m http.server ${PORT}
    # Try Python 2
    elif command -v python >/dev/null 2>&1; then
        log_success "Using python -m SimpleHTTPServer"
        python -m SimpleHTTPServer ${PORT}
    # Try Node/npx
    elif command -v npx >/dev/null 2>&1; then
        log_success "Using node/serve"
        npx serve -p ${PORT} .
    else
        log_error "No local server environment found (Python or Node). Please use 'docker' command instead."
        exit 1
    fi
}

# --- Command: Docker Nginx Preview ---
cmd_docker() {
    log_info "Preparing Docker Nginx environment..."
    
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is not installed or not in PATH."
        exit 1
    fi

    log_info "Building lightweight Nginx image..."
    cat << 'EOF' > Dockerfile.tmp
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
EOF

    docker build -t ${IMAGE_NAME} -f Dockerfile.tmp .
    rm Dockerfile.tmp

        ;;
    validate)
        cmd_validate
        ;;
    help|*)
        show_help
        ;;
esac
