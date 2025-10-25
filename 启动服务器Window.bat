@echo off
chcp 65001 >nul
title AIclassS 开发服务器
color 0B

echo ╔════════════════════════════════════════╗
echo ║     AIclassS 前端项目                  ║
echo ║     正在启动开发服务器...              ║
echo ╚════════════════════════════════════════╝
echo.

REM 检查 node_modules 是否存在
if not exist "node_modules\" (
    echo 检测到未安装依赖，正在安装...
    echo.
    call npm install
    echo.
)

echo 启动开发服务器...
echo 访问地址: http://localhost:3000
echo.
echo 浏览器将在服务器启动后自动打开...
echo 按 Ctrl+C 停止服务器
echo.

call npm run dev

pause
