#!/bin/bash
# 智课方舟一键启动脚本 - 智能版
# 支持自动检测和安装 Node.js

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 打印横幅
print_banner() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║   智课方舟 - 智能课程创建平台           ║${NC}"
    echo -e "${CYAN}║   一键启动脚本 (智能版)                 ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo ""
}

# 检测操作系统
detect_os() {
    case "$(uname -s)" in
        Darwin*)
            OS="macos"
            echo -e "${GREEN}✅ 检测到系统: macOS${NC}"
            ;;
        Linux*)
            OS="linux"
            echo -e "${GREEN}✅ 检测到系统: Linux${NC}"
            ;;
        MINGW*|MSYS*|CYGWIN*)
            OS="windows"
            echo -e "${GREEN}✅ 检测到系统: Windows${NC}"
            ;;
        *)
            OS="unknown"
            echo -e "${RED}⚠️  未知系统${NC}"
            ;;
    esac
}

# 检查 nvm 是否安装
check_nvm() {
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
        return 0
    fi
    return 1
}

# 使用 nvm 安装 Node.js
install_node_with_nvm() {
    echo -e "${BLUE}📦 使用 nvm 安装 Node.js 22...${NC}"
    
    # 检查 nvm 是否安装
    if command -v nvm &> /dev/null || check_nvm; then
        echo -e "${GREEN}✅ nvm 已安装${NC}"
    else
        echo -e "${YELLOW}nvm 未安装，正在安装 nvm...${NC}"
        
        # 安装 nvm
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
        
        # 加载 nvm
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
        
        echo -e "${GREEN}✅ nvm 安装完成${NC}"
    fi
    
    # 安装最新的 LTS 版本 Node.js
    nvm install 22
    nvm use 22
    nvm alias default 22
    
    echo -e "${GREEN}✅ Node.js 安装完成${NC}"
    
    # 重新加载环境
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
}

# 使用 Homebrew 安装 Node.js (macOS)
install_node_with_brew() {
    echo -e "${BLUE}📦 使用 Homebrew 安装 Node.js...${NC}"
    
    # 检查 Homebrew 是否安装
    if ! command -v brew &> /dev/null; then
        echo -e "${YELLOW}Homebrew 未安装，正在安装...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # 安装 Node.js
    brew install node@22
    
    # 添加到 PATH
    export PATH="/opt/homebrew/bin:$PATH"
    
    echo -e "${GREEN}✅ Node.js 安装完成${NC}"
}

# 安装 Node.js
install_node() {
    echo -e "${BLUE}💡 开始安装 Node.js...${NC}"
    echo ""
    
    case $OS in
        macos)
            echo "请选择安装方式:"
            echo "  1) 使用 nvm 安装 (推荐)"
            echo "  2) 使用 Homebrew 安装"
            read -p "请选择 (1/2): " choice
            
            if [ "$choice" == "1" ]; then
                install_node_with_nvm
            else
                install_node_with_brew
            fi
            ;;
        linux)
            install_node_with_nvm
            ;;
        windows)
            echo -e "${RED}⚠️  Windows 系统请手动安装 Node.js${NC}"
            echo "下载地址: https://nodejs.org/"
            exit 1
            ;;
        *)
            echo -e "${RED}❌ 不支持的操作系统${NC}"
            exit 1
            ;;
    esac
    
    echo ""
}

# 检查并安装 Node.js
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✅ Node.js 已安装:${NC} $NODE_VERSION"
        
        # 检查版本
        NODE_MAJOR=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_MAJOR" -lt 18 ]; then
            echo -e "${YELLOW}⚠️  Node.js 版本过低 (需要 18+)，当前: $NODE_VERSION${NC}"
            read -p "是否安装新版本? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                install_node
            else
                exit 1
            fi
        fi
        return 0
    else
        echo -e "${RED}❌ Node.js 未安装${NC}"
        echo ""
        read -p "是否自动安装 Node.js 22? (y/n) " -n 1 -r
        echo
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_node
            
            # 重新检查
            if command -v node &> /dev/null; then
                NODE_VERSION=$(node --version)
                echo -e "${GREEN}✅ Node.js 安装成功:${NC} $NODE_VERSION"
            else
                echo -e "${RED}❌ Node.js 安装失败，请手动安装${NC}"
                echo "下载地址: https://nodejs.org/"
                exit 1
            fi
        else
            echo -e "${YELLOW}请先安装 Node.js 后再运行此脚本${NC}"
            echo "下载地址: https://nodejs.org/"
            exit 1
        fi
    fi
}

# 安装项目依赖
install_dependencies() {
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
    echo ""
}

# 配置环境变量
setup_env() {
    echo -e "${BLUE}🔧 检查环境配置...${NC}"
    
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  未检测到 .env 文件${NC}"
        echo ""
        read -p "是否创建默认 .env 文件? (y/n) " -n 1 -r
        echo
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cat > .env << 'EOF'
# Kimi API 配置
# 请访问 https://platform.moonshot.cn/ 获取您的 API Key
VITE_KIMI_API_KEY=your-kimi-api-key-here

# API 基础路径
VITE_KIMI_BASE_URL=/v1

# 应用名称
VITE_APP_NAME=智课方舟
EOF
            echo -e "${GREEN}✅ 已创建 .env 文件${NC}"
            echo ""
            echo -e "${YELLOW}📝 提示: 请编辑 .env 文件，填入您的 Kimi API Key${NC}"
            echo "获取地址: https://platform.moonshot.cn/"
            echo ""
            read -p "按回车键继续..."
        fi
    else
        echo -e "${GREEN}✅ 环境配置已存在${NC}"
        
        # 检查是否需要配置 API Key
        if grep -q "your-kimi-api-key-here" .env 2>/dev/null; then
            echo -e "${YELLOW}⚠️  检测到默认 API Key，请在 .env 文件中配置真实的 API Key${NC}"
        fi
    fi
    echo ""
}

# 启动开发服务器
start_dev_server() {
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║   正在启动开发服务器...                ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✅ 应用将在以下地址启动:${NC}"
    echo -e "   ${GREEN}➜${NC}  Local:   ${BLUE}http://localhost:3000${NC}"
    echo ""
    echo -e "${YELLOW}💡 提示: 按 Ctrl+C 停止服务器${NC}"
    echo ""
    echo "=================================="
    echo ""
    
    npm run dev
}

# 主函数
main() {
    print_banner
    
    # 检测操作系统
    detect_os
    echo ""
    
    # 检查 Node.js
    check_node
    echo ""
    
    # 安装依赖
    install_dependencies
    
    # 配置环境
    setup_env
    
    # 启动服务器
    start_dev_server
}

# 运行主函数
main
