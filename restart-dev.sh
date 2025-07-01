#!/bin/bash
# Quick restart for active development
#
# Default mode (no options) - runs in foreground
# ./restart-dev.sh
#
# Follow-log mode (restarts server and tails log)
# ./restart-dev.sh -f
#
# Background mode with process display
# ./restart-dev.sh -b
#
# Just check server status without restarting
# ./restart-dev.sh -s
#
# Just kill the server without restarting
# ./restart-dev.sh -k
#
# Show help with all options
# ./restart-dev.sh -h
#
#######################################################################
# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="$HOME/Learn/AI/Genesis"

# Common development ports to check and clean up
DEV_PORTS=(
    5173 5174 5175 5176 5177 5178 5179  # Vite dev server ports
    3000 3001 3002 3003                 # Common React/Next.js ports
    54321 54322 54323 54324 54325       # Supabase local ports
    8000 8080 8081                      # Common development ports
)

# Default mode
BACKGROUND_MODE=false
STATUS_ONLY=false
FOLLOW_MODE=false
KILL_ONLY=false

# Function to show running server processes
show_server_processes() {
    echo -e "${CYAN}🔍 Checking for running development server processes...${NC}"
    
    # Check for Vite dev processes
    VITE_PROCESSES=$(ps aux | grep -E "vite|npm run dev|pnpm dev|yarn dev" | grep -v grep)
    if [ ! -z "$VITE_PROCESSES" ]; then
        echo -e "${GREEN}📋 Vite/Dev processes:${NC}"
        echo "$VITE_PROCESSES" | while read line; do
            echo -e "${YELLOW}  $line${NC}"
        done
    fi
    
    # Check for Supabase processes
    SUPABASE_PROCESSES=$(ps aux | grep -E "supabase|postgres|deno" | grep -v grep)
    if [ ! -z "$SUPABASE_PROCESSES" ]; then
        echo -e "${GREEN}🗄️  Supabase processes:${NC}"
        echo "$SUPABASE_PROCESSES" | while read line; do
            echo -e "${YELLOW}  $line${NC}"
        done
    fi
    
    # Check processes on all common development ports
    echo -e "${GREEN}🌐 Processes on development ports:${NC}"
    for port in "${DEV_PORTS[@]}"; do
        PORT_PROCESSES=$(lsof -i:$port 2>/dev/null)
        if [ ! -z "$PORT_PROCESSES" ]; then
            echo -e "${CYAN}  Port $port:${NC}"
            echo "$PORT_PROCESSES" | tail -n +2 | while read line; do
                echo -e "${YELLOW}    $line${NC}"
            done
        fi
    done
    
    # Check if common development ports are responding
    echo -e "${GREEN}🔗 Port connectivity check:${NC}"
    for port in 5173 5176 3000 54321; do
        if curl -s http://localhost:$port > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Port $port is responding${NC}"
        else
            echo -e "${YELLOW}⚠️  Port $port not responding${NC}"
        fi
    done
}

# Function to kill running server processes
kill_server_processes() {
    echo -e "${YELLOW}💀 Killing existing development servers...${NC}"

    # Kill Vite dev processes
    pkill -f "vite" 2>/dev/null && echo -e "${GREEN}✅ Killed Vite processes${NC}"
    
    # Kill npm/pnpm/yarn dev processes
    pkill -f "npm run dev" 2>/dev/null && echo -e "${GREEN}✅ Killed npm dev processes${NC}"
    pkill -f "pnpm dev" 2>/dev/null && echo -e "${GREEN}✅ Killed pnpm dev processes${NC}"
    pkill -f "yarn dev" 2>/dev/null && echo -e "${GREEN}✅ Killed yarn dev processes${NC}"
    
    # Kill Next.js dev processes (in case any are running)
    pkill -f "next dev" 2>/dev/null && echo -e "${GREEN}✅ Killed Next.js dev processes${NC}"

    # Kill any processes on development ports (excluding Docker/Supabase)
    echo -e "${YELLOW}🔌 Checking and killing processes on development ports...${NC}"
    for port in "${DEV_PORTS[@]}"; do
        # Get process info to check if it's a Docker/Supabase process
        PORT_INFO=$(lsof -i:$port 2>/dev/null)
        if [ ! -z "$PORT_INFO" ]; then
            # Skip Docker processes (Supabase runs in Docker)
            if echo "$PORT_INFO" | grep -q "com.docker\|Docker\|supabase"; then
                if [[ $port -ge 54321 && $port -le 54325 ]]; then
                    echo -e "${CYAN}ℹ️  Skipping Supabase/Docker process on port $port${NC}"
                    continue
                fi
            fi
            
            # Kill non-Docker processes
            PORT_PIDS=$(lsof -ti:$port 2>/dev/null)
            if [ ! -z "$PORT_PIDS" ]; then
                echo "$PORT_PIDS" | xargs kill -9 2>/dev/null
                echo -e "${GREEN}✅ Killed processes on port $port${NC}"
            fi
        fi
    done

    # Kill any lingering Node.js processes that might be development servers
    NODE_PIDS=$(ps aux | grep -E "node.*dev|node.*vite|node.*start" | grep -v grep | awk '{print $2}')
    if [ ! -z "$NODE_PIDS" ]; then
        echo "$NODE_PIDS" | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✅ Killed lingering Node.js dev processes${NC}"
    fi

    echo -e "${GREEN}🧹 Development server cleanup complete${NC}"
}

# Function to show dev server logs hyperlink
show_logs_hyperlink() {
    local log_file="$1"
    local full_path="$PROJECT_DIR/$log_file"
    
    echo -e "${PURPLE}📄 Dev Server Logs: ${YELLOW}$log_file${NC}"
    
    # Provide simple, clean log file information
    echo -e "${CYAN}   📁 Log file: $log_file${NC}"
    echo -e "${CYAN}   📂 Full path: $full_path${NC}"
    
    # Also provide command to tail the logs
    echo -e "${CYAN}   🔍 To follow logs: ${YELLOW}tail -f $log_file${NC}"
    echo -e "${CYAN}   📖 To view logs: ${YELLOW}cat $log_file${NC}"
    echo ""
}

# Function to show usage
show_usage() {
    echo -e "${CYAN}Usage: $0 [OPTIONS]${NC}"
    echo -e "${CYAN}Options:${NC}"
    echo -e "  ${YELLOW}-b, --background${NC}    Run dev server in background (script exits, server continues)"
    echo -e "  ${YELLOW}-f, --follow${NC}        Restart server and tail the server log file"
    echo -e "  ${YELLOW}-k, --kill${NC}          Kill running server processes and exit"
    echo -e "  ${YELLOW}-s, --status${NC}        Show running server processes without restarting"
    echo -e "  ${YELLOW}-h, --help${NC}          Show this help message"
    echo ""
    echo -e "${CYAN}Default Action (no options):${NC}"
    echo -e "  Run dev server in foreground (stopping script stops server)"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo -e "  ${GREEN}./restart-dev.sh${NC}              # Foreground mode (default)"
    echo -e "  ${GREEN}./restart-dev.sh -f${NC}           # Restart server and follow logs"
    echo -e "  ${GREEN}./restart-dev.sh -b${NC}           # Background mode"
    echo -e "  ${GREEN}./restart-dev.sh -s${NC}           # Just show server status"
    echo -e "  ${GREEN}./restart-dev.sh -k${NC}           # Just kill the server"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -b|--background)
            BACKGROUND_MODE=true
            shift
            ;;
        -f|--follow)
            FOLLOW_MODE=true
            shift
            ;;
        -k|--kill)
            KILL_ONLY=true
            shift
            ;;
        -s|--status)
            STATUS_ONLY=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# Change to project directory first
echo -e "${YELLOW}📂 Changing to project directory...${NC}"
cd "$PROJECT_DIR" || {
    echo -e "${RED}❌ Error: Could not change to project directory: $PROJECT_DIR${NC}"
    exit 1
}

# Handle modes that don't start a server
if [ "$STATUS_ONLY" = true ]; then
    echo -e "${BLUE}🔍 Checking Genesis Dev Server Status...${NC}"
    show_server_processes
    exit 0
fi

if [ "$KILL_ONLY" = true ]; then
    echo -e "${RED}🔪 Killing Genesis Dev Servers...${NC}"
    kill_server_processes
    exit 0
fi

# For all other modes, we restart the server, which involves killing it first.
kill_server_processes

# Wait a moment for processes to fully terminate
sleep 3

echo -e "${YELLOW}🚀 Starting fresh dev server...${NC}"

# Detect which package manager to use
if [ -f "pnpm-lock.yaml" ] && command -v pnpm >/dev/null 2>&1; then
    PACKAGE_MANAGER="pnpm"
    DEV_COMMAND="pnpm dev"
elif [ -f "yarn.lock" ] && command -v yarn >/dev/null 2>&1; then
    PACKAGE_MANAGER="yarn"
    DEV_COMMAND="yarn dev"
else
    PACKAGE_MANAGER="npm"
    DEV_COMMAND="npm run dev"
fi

echo -e "${CYAN}📦 Using package manager: ${YELLOW}$PACKAGE_MANAGER${NC}"

# Start the dev server based on mode
if [ "$BACKGROUND_MODE" = true ]; then
    # Background mode
    echo -e "${BLUE}🔄 Restarting Genesis Dev Server (Background Mode)...${NC}"
    echo -e "${CYAN}ℹ️  Server will continue running after script exits${NC}"
    show_logs_hyperlink "dev-server.log"
    
    nohup $DEV_COMMAND > dev-server.log 2>&1 &
    DEV_PID=$!
    
    sleep 5
    
    if kill -0 $DEV_PID 2>/dev/null; then
        echo -e "${GREEN}✅ Dev server started in background (PID: $DEV_PID)${NC}"
        echo -e "${BLUE}🌐 Server should be available soon. Check these URLs:${NC}"
        echo -e "${CYAN}   - http://localhost:5173 (Vite default)${NC}"
        echo -e "${CYAN}   - http://localhost:3000 (Alternative)${NC}"
        echo ""
        show_server_processes
        echo ""
        echo -e "${GREEN}✅ Script complete - dev server continues running${NC}"
    else
        echo -e "${RED}❌ Failed to start dev server in background${NC}"
        echo -e "${YELLOW}📄 Checking log for errors:${NC}"
        cat dev-server.log
        exit 1
    fi
elif [ "$FOLLOW_MODE" = true ]; then
    # Follow mode
    echo -e "${BLUE}🔄 Restarting Genesis Dev Server (Follow Mode)...${NC}"
    echo -e "${CYAN}ℹ️  Server will run in background, logs will be tailed here.${NC}"
    
    nohup $DEV_COMMAND > dev-server.log 2>&1 &
    DEV_PID=$!
    
    echo -e "${CYAN}⏳ Waiting for server to start... (PID: $DEV_PID)${NC}"
    sleep 5 # Give it a moment
    
    if kill -0 $DEV_PID 2>/dev/null; then
        echo -e "${GREEN}✅ Dev server started successfully.${NC}"
        echo -e "${BLUE}🌐 Server should be available soon. Check these URLs:${NC}"
        echo -e "${CYAN}   - http://localhost:5173 (Vite default)${NC}"
        echo -e "${CYAN}   - http://localhost:3000 (Alternative)${NC}"
        echo -e "${CYAN}📋 Tailing logs now. Press Ctrl+C to stop viewing logs.${NC}"
        echo -e "${YELLOW}⚠️  Note: Stopping the log tail does NOT stop the server.${NC}"
        echo -e "${CYAN}🛑 To stop the server later, run: ./restart-dev.sh -k${NC}"
        echo ""
        tail -f dev-server.log
    else
        echo -e "${RED}❌ Failed to start dev server.${NC}"
        echo -e "${YELLOW}📄 Checking log for errors:${NC}"
        cat dev-server.log
        exit 1
    fi
else
    # Foreground mode (default)
    echo -e "${BLUE}🔄 Restarting Genesis Dev Server (Foreground Mode)...${NC}"
    echo -e "${CYAN}ℹ️  Use Ctrl+C to stop both script and server${NC}"
    echo ""
    show_server_processes
    echo ""
    echo -e "${PURPLE}📄 Dev Server Logs:${NC}"
    echo -e "${CYAN}   📺 Logs will be displayed directly in this terminal${NC}"
    echo ""
    echo -e "${CYAN}🚀 Starting dev server in foreground...${NC}"
    $DEV_COMMAND
    echo -e "${YELLOW}⚠️  Dev server stopped${NC}"
fi 
