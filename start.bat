@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 智课方舟一键启动脚本 - Windows 版本
:: 支持自动检测和安装 Node.js

:: 颜色定义 (Windows 10+ 支持 ANSI 颜色)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "CYAN=[96m"
set "NC=[0m"

:: 打印横幅
call :print_banner

:: 检测操作系统
call :detect_os

:: 检查 Node.js
call :check_node

:: 安装依赖
call :install_dependencies

:: 配置环境
call :setup_env

:: 启动开发服务器
call :start_dev_server

goto :eof

:print_banner
echo.
echo %CYAN%╔════════════════════════════════════════╗%NC%
echo %CYAN%║   智课方舟 - 智能课程创建平台           ║%NC%
echo %CYAN%║   一键启动脚本 (Windows 版)            ║%NC%
echo %CYAN%╚════════════════════════════════════════╝%NC%
echo.
goto :eof

:detect_os
echo %GREEN%✅ 检测到系统: Windows%NC%
goto :eof

:check_node
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo %GREEN%✅ Node.js 已安装:%NC% !NODE_VERSION!
    
    :: 检查版本 (简化版本检查)
    for /f "tokens=2 delims=v" %%i in ('node --version') do set NODE_VER=%%i
    for /f "tokens=1 delims=." %%i in ("!NODE_VER!") do set NODE_MAJOR=%%i
    
    if !NODE_MAJOR! lss 18 (
        echo %YELLOW%⚠️  Node.js 版本过低 (需要 18+)，当前: !NODE_VERSION!%NC%
        set /p choice="是否安装新版本? (y/n): "
        if /i "!choice!"=="y" (
            call :install_node
        ) else (
            exit /b 1
        )
    )
    goto :eof
) else (
    echo %RED%❌ Node.js 未安装%NC%
    echo.
    set /p choice="是否自动安装 Node.js? (y/n): "
    echo.
    echo.
    
    if /i "!choice!"=="y" (
        call :install_node
        
        :: 重新检查
        where node >nul 2>&1
        if %errorlevel% equ 0 (
            for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
            echo %GREEN%✅ Node.js 安装成功:%NC% !NODE_VERSION!
        ) else (
            echo %RED%❌ Node.js 安装失败，请手动安装%NC%
            echo 下载地址: https://nodejs.org/
            exit /b 1
        )
    ) else (
        echo %YELLOW%请先安装 Node.js 后再运行此脚本%NC%
        echo 下载地址: https://nodejs.org/
        exit /b 1
    )
)
goto :eof

:install_node
echo %BLUE%💡 开始安装 Node.js...%NC%
echo.
echo %YELLOW%正在下载 Node.js 安装程序...%NC%

:: 创建临时目录
if not exist "%TEMP%\nodejs_install" mkdir "%TEMP%\nodejs_install"
cd /d "%TEMP%\nodejs_install"

:: 下载 Node.js LTS 版本 (使用 PowerShell)
echo %BLUE%📦 正在下载 Node.js LTS 版本...%NC%
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v22.12.0/node-v22.12.0-x64.msi' -OutFile 'nodejs-installer.msi'}"

if exist "nodejs-installer.msi" (
    echo %BLUE%📦 正在安装 Node.js...%NC%
    msiexec /i nodejs-installer.msi /quiet /norestart
    
    :: 等待安装完成
    timeout /t 10 /nobreak >nul
    
    :: 刷新环境变量
    call refreshenv >nul 2>&1
    
    echo %GREEN%✅ Node.js 安装完成%NC%
    
    :: 清理临时文件
    del nodejs-installer.msi >nul 2>&1
    cd /d "%~dp0"
    rmdir /s /q "%TEMP%\nodejs_install" >nul 2>&1
) else (
    echo %RED%❌ 下载失败，请手动安装 Node.js%NC%
    echo 下载地址: https://nodejs.org/
    cd /d "%~dp0"
    exit /b 1
)

cd /d "%~dp0"
goto :eof

:install_dependencies
echo %BLUE%📦 检查项目依赖...%NC%

if not exist "node_modules" (
    echo %YELLOW%依赖未安装，开始安装...%NC%
    npm install
    
    if %errorlevel% neq 0 (
        echo %RED%❌ 依赖安装失败%NC%
        exit /b 1
    )
    
    echo %GREEN%✅ 依赖安装完成%NC%
) else (
    echo %GREEN%✅ 依赖已安装%NC%
)
echo.
goto :eof

:setup_env
echo %BLUE%🔧 检查环境配置...%NC%

if not exist ".env" (
    echo %YELLOW%⚠️  未检测到 .env 文件%NC%
    echo.
    set /p choice="是否创建默认 .env 文件? (y/n): "
    echo.
    echo.
    
    if /i "!choice!"=="y" (
        (
            echo # Kimi API 配置
            echo # 请访问 https://platform.moonshot.cn/ 获取您的 API Key
            echo VITE_KIMI_API_KEY=your-kimi-api-key-here
            echo.
            echo # API 基础路径
            echo VITE_KIMI_BASE_URL=/v1
            echo.
            echo # 应用名称
            echo VITE_APP_NAME=智课方舟
        ) > .env
        echo %GREEN%✅ 已创建 .env 文件%NC%
        echo.
        echo %YELLOW%📝 提示: 请编辑 .env 文件，填入您的 Kimi API Key%NC%
        echo 获取地址: https://platform.moonshot.cn/
        echo.
        pause
    )
) else (
    echo %GREEN%✅ 环境配置已存在%NC%
    
    :: 检查是否需要配置 API Key
    findstr /c:"your-kimi-api-key-here" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo %YELLOW%⚠️  检测到默认 API Key，请在 .env 文件中配置真实的 API Key%NC%
    )
)
echo.
goto :eof

:start_dev_server
echo %CYAN%╔════════════════════════════════════════╗%NC%
echo %CYAN%║   正在启动开发服务器...                ║%NC%
echo %CYAN%╚════════════════════════════════════════╝%NC%
echo.
echo %GREEN%✅ 应用将在以下地址启动:%NC%
echo    %GREEN%➜%NC%  Local:   %BLUE%http://localhost:3000%NC%
echo.
echo %YELLOW%💡 提示: 按 Ctrl+C 停止服务器%NC%
echo.
echo ==================================
echo.

npm run dev
goto :eof
