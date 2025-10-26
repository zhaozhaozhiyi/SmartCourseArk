@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 颜色定义
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "CYAN=[96m"
set "NC=[0m"

echo.
echo %CYAN%╔════════════════════════════════════════╗%NC%
echo %CYAN%║   智课方舟 - 智能课程创建平台           ║%NC%
echo %CYAN%║   正在启动开发服务器...                ║%NC%
echo %CYAN%╚════════════════════════════════════════╝%NC%
echo.

REM 检查 node_modules 是否存在
if not exist "node_modules\" (
    echo %YELLOW%检测到未安装依赖，正在安装...%NC%
    echo.
    call npm install
    echo.
)

echo %GREEN%✅ 服务器将在以下地址启动:%NC%
echo    %GREEN%➜%NC% 系统页面: %BLUE%http://localhost:3000%NC%
echo    %GREEN%➜%NC% 文档页面: %BLUE%http://localhost:5173%NC%
echo.
echo %YELLOW%💡 提示: 按 Ctrl+C 停止所有服务器%NC%
echo.
echo ==================================
echo.

:: 启动服务器
start /b cmd /c "npm run dev"
timeout /t 3 /nobreak >nul

start /b cmd /c "npm run docs:dev"
timeout /t 3 /nobreak >nul

:: 等待服务器启动
echo %BLUE%⏳ 等待服务器启动...%NC%
set max_attempts=30
set attempt=0

:wait_loop
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
    if %errorlevel% equ 0 (
        echo %GREEN%✅ 服务器已启动%NC%
        goto servers_ready
    )
)

set /a attempt+=1
if %attempt% geq %max_attempts% (
    echo %YELLOW%⚠️  服务器启动超时，但将继续尝试打开浏览器%NC%
    goto servers_ready
)

timeout /t 1 /nobreak >nul
echo|set /p="."
goto wait_loop

:servers_ready
echo.
echo %GREEN%🎉 所有服务器已启动成功！%NC%
echo.

:: 打开浏览器
echo %BLUE%🌐 正在打开系统页面...%NC%
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
echo %GREEN%✅ 系统页面已在浏览器中打开%NC%

timeout /t 1 /nobreak >nul

echo %BLUE%🌐 正在打开文档页面...%NC%
timeout /t 1 /nobreak >nul
start "" "http://localhost:5173"
echo %GREEN%✅ 文档页面已在浏览器中打开%NC%

echo.
echo %CYAN%╔════════════════════════════════════════╗%NC%
echo %CYAN%║   服务器运行中...                      ║%NC%
echo %CYAN%║   按 Ctrl+C 停止所有服务器            ║%NC%
echo %CYAN%╚════════════════════════════════════════╝%NC%
echo.

:: 保持脚本运行
:keep_running
timeout /t 5 /nobreak >nul
goto keep_running
