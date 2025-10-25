@echo off
echo Building Go HTTP Server...
echo.

REM 编译 Windows 64位版本
go build -o server.exe -ldflags="-s -w" server.go

if %errorlevel% equ 0 (
    echo.
    echo ✓ Build successful!
    echo.
    echo Generated: server.exe
    echo.
    echo You can now run server.exe by double-clicking it.
) else (
    echo.
    echo ✗ Build failed!
)

pause


