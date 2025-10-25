#!/bin/bash

# 获取脚本所在目录
cd "$(dirname "$0")"

echo "╔════════════════════════════════════════╗"
echo "║     AIclassS 项目启动器                ║"
echo "║     正在启动前端和文档服务器...        ║"
echo "╚════════════════════════════════════════╝"
echo

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "检测到未安装依赖，正在安装..."
    echo
    npm install
    echo
fi

echo "启动选项："
echo "1. 仅启动前端服务器 (端口 3000)"
echo "2. 仅启动文档服务器 (端口 5173)"
echo "3. 同时启动前端和文档服务器"
echo
read -p "请选择启动选项 (1-3): " choice

case $choice in
    1)
        echo "启动前端开发服务器..."
        echo "访问地址: http://localhost:3000"
        echo "按 Ctrl+C 停止服务器"
        echo
        npm run dev
        ;;
    2)
        echo "启动文档服务器..."
        echo "访问地址: http://localhost:5173"
        echo "按 Ctrl+C 停止服务器"
        echo
        npm run docs:dev
        ;;
    3)
        echo "同时启动前端和文档服务器..."
        echo "前端访问地址: http://localhost:3000"
        echo "文档访问地址: http://localhost:5173"
        echo "按 Ctrl+C 停止所有服务器"
        echo
        # 使用 npm-run-all 同时启动两个服务器
        npx npm-run-all2 --parallel dev docs:dev
        ;;
    *)
        echo "无效选择，启动前端服务器..."
        echo "访问地址: http://localhost:3000"
        echo "按 Ctrl+C 停止服务器"
        echo
        npm run dev
        ;;
esac

