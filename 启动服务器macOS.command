#!/bin/bash

# 获取脚本所在目录
cd "$(dirname "$0")"

echo "╔════════════════════════════════════════╗"
echo "║     AIclassS 前端项目                  ║"
echo "║     正在启动开发服务器...              ║"
echo "╚════════════════════════════════════════╝"
echo

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "检测到未安装依赖，正在安装..."
    echo
    npm install
    echo
fi

echo "启动开发服务器..."
echo "访问地址: http://localhost:3000"
echo
echo "浏览器将在服务器启动后自动打开..."
echo "按 Ctrl+C 停止服务器"
echo

npm run dev
