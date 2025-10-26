#!/bin/bash

# 获取脚本所在目录
cd "$(dirname "$0")"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印横幅
print_banner() {
    echo
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║    智课方舟 - 智能课程创建平台          ║${NC}"
    echo -e "${CYAN}║    正在启动开发服务器...                ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo
}

# 检查依赖
check_dependencies() {
    echo -e "${BLUE}📦 检查项目依赖...${NC}"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}依赖未安装，开始安装...${NC}"
        npm install
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 依赖安装失败${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}✅ 依赖安装完成${NC}"
    else
        echo -e "${GREEN}✅ 依赖已安装${NC}"
    fi
    echo
}

# 等待服务器启动
wait_for_server() {
    local url=$1
    local max_attempts=30
    local attempt=0
    
    echo -e "${BLUE}⏳ 等待服务器启动...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ 服务器已启动${NC}"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep 1
        echo -n "."
    done
    
    echo -e "${YELLOW}⚠️  服务器启动超时，但将继续尝试打开浏览器${NC}"
    return 1
}

# 打开浏览器
open_browser() {
    local url=$1
    local name=$2
    
    echo -e "${BLUE}🌐 正在打开 $name...${NC}"
    sleep 2
    open "$url"
    echo -e "${GREEN}✅ $name 已在浏览器中打开${NC}"
}

# 启动服务器
start_servers() {
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║   正在启动服务器...                    ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo
    
    echo -e "${GREEN}✅ 服务器将在以下地址启动:${NC}"
    echo -e "   ${GREEN}➜${NC}  系统页面: ${BLUE}http://localhost:3000${NC}"
    echo -e "   ${GREEN}➜${NC}  文档页面: ${BLUE}http://localhost:5173${NC}"
    echo
    echo -e "${YELLOW}💡 提示: 按 Ctrl+C 停止所有服务器${NC}"
    echo
    echo "=================================="
    echo
    
    # 启动服务器
    npm run dev &
    DEV_PID=$!
    
    npm run docs:dev &
    DOCS_PID=$!
    
    # 等待服务器启动
    wait_for_server "http://localhost:3000"
    wait_for_server "http://localhost:5173"
    
    echo
    echo -e "${GREEN}🎉 所有服务器已启动成功！${NC}"
    echo
    
    # 打开浏览器
    open_browser "http://localhost:3000" "系统页面"
    sleep 1
    open_browser "http://localhost:5173" "文档页面"
    
    echo
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║   服务器运行中...                      ║${NC}"
    echo -e "${CYAN}║   按 Ctrl+C 停止所有服务器            ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo
    
    # 等待用户中断
    trap 'echo -e "\n${YELLOW}正在停止服务器...${NC}"; kill $DEV_PID $DOCS_PID 2>/dev/null; echo -e "${GREEN}✅ 服务器已停止${NC}"; exit 0' INT
    
    # 保持脚本运行
    wait
}

# 主函数
main() {
    print_banner
    check_dependencies
    start_servers
}

# 运行主函数
main
