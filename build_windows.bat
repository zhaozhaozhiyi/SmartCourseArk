@echo off
echo ========================================
echo 构建Windows单文件应用（原生GUI）
echo ========================================
echo.

if not exist "release" mkdir release

echo [1/4] 安装Go依赖...
call go mod download
if errorlevel 1 (
    echo 错误: Go依赖安装失败
    pause
    exit /b 1
)

echo.
echo [2/4] 构建前端...
call npm run build-only
if errorlevel 1 (
    echo 错误: 前端构建失败
    pause
    exit /b 1
)

echo.
echo [3/4] 构建文档...
call npm run build:docs
if errorlevel 1 (
    echo 警告: 文档构建失败，继续构建...
)

echo.
echo [4/4] 构建Go程序...
set CGO_ENABLED=1
set GOOS=windows
set GOARCH=amd64
go build -ldflags="-s -w" -o release/智课方舟_Windows_amd64.exe server.go
if errorlevel 1 (
    echo 错误: Go构建失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 构建完成！
echo ========================================
echo 可执行文件位置: release\智课方舟_Windows_amd64.exe
echo.
echo 双击运行即可启动应用！
pause
