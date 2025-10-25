# 智课方舟一键启动脚本 - PowerShell 版本
# 支持自动检测和安装 Node.js

# 设置控制台编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 颜色定义
$RED = "`e[91m"
$GREEN = "`e[92m"
$YELLOW = "`e[93m"
$BLUE = "`e[94m"
$CYAN = "`e[96m"
$NC = "`e[0m"

# 打印横幅
function Print-Banner {
    Write-Host ""
    Write-Host "${CYAN}╔════════════════════════════════════════╗${NC}"
    Write-Host "${CYAN}║   智课方舟 - 智能课程创建平台           ║${NC}"
    Write-Host "${CYAN}║   一键启动脚本 (PowerShell 版)          ║${NC}"
    Write-Host "${CYAN}╚════════════════════════════════════════╝${NC}"
    Write-Host ""
}

# 检测操作系统
function Detect-OS {
    Write-Host "${GREEN}✅ 检测到系统: Windows (PowerShell)${NC}"
}

# 检查 Node.js 是否安装
function Test-NodeJS {
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "${GREEN}✅ Node.js 已安装:${NC} $nodeVersion"
            
            # 检查版本
            $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
            if ($versionNumber -lt 18) {
                Write-Host "${YELLOW}⚠️  Node.js 版本过低 (需要 18+)，当前: $nodeVersion${NC}"
                $choice = Read-Host "是否安装新版本? (y/n)"
                if ($choice -eq 'y' -or $choice -eq 'Y') {
                    Install-NodeJS
                } else {
                    exit 1
                }
            }
            return $true
        }
    } catch {
        # Node.js 未安装
    }
    
    Write-Host "${RED}❌ Node.js 未安装${NC}"
    Write-Host ""
    $choice = Read-Host "是否自动安装 Node.js? (y/n)"
    Write-Host ""
    Write-Host ""
    
    if ($choice -eq 'y' -or $choice -eq 'Y') {
        Install-NodeJS
        
        # 重新检查
        try {
            $nodeVersion = node --version 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "${GREEN}✅ Node.js 安装成功:${NC} $nodeVersion"
                return $true
            }
        } catch {
            # 安装失败
        }
        
        Write-Host "${RED}❌ Node.js 安装失败，请手动安装${NC}"
        Write-Host "下载地址: https://nodejs.org/"
        exit 1
    } else {
        Write-Host "${YELLOW}请先安装 Node.js 后再运行此脚本${NC}"
        Write-Host "下载地址: https://nodejs.org/"
        exit 1
    }
}

# 安装 Node.js
function Install-NodeJS {
    Write-Host "${BLUE}💡 开始安装 Node.js...${NC}"
    Write-Host ""
    
    # 检查是否安装了 Chocolatey
    $chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue
    if ($chocoInstalled) {
        Write-Host "${BLUE}📦 使用 Chocolatey 安装 Node.js...${NC}"
        choco install nodejs -y
    } else {
        # 使用 winget 安装
        $wingetInstalled = Get-Command winget -ErrorAction SilentlyContinue
        if ($wingetInstalled) {
            Write-Host "${BLUE}📦 使用 winget 安装 Node.js...${NC}"
            winget install OpenJS.NodeJS
        } else {
            # 手动下载安装
            Write-Host "${BLUE}📦 正在下载 Node.js LTS 版本...${NC}"
            
            $tempDir = Join-Path $env:TEMP "nodejs_install"
            if (!(Test-Path $tempDir)) {
                New-Item -ItemType Directory -Path $tempDir | Out-Null
            }
            
            $installerPath = Join-Path $tempDir "nodejs-installer.msi"
            $downloadUrl = "https://nodejs.org/dist/v22.12.0/node-v22.12.0-x64.msi"
            
            try {
                Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
                
                Write-Host "${BLUE}📦 正在安装 Node.js...${NC}"
                Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait
                
                # 刷新环境变量
                $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
                
                Write-Host "${GREEN}✅ Node.js 安装完成${NC}"
                
                # 清理临时文件
                Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
            } catch {
                Write-Host "${RED}❌ 下载或安装失败，请手动安装 Node.js${NC}"
                Write-Host "下载地址: https://nodejs.org/"
                exit 1
            }
        }
    }
    
    Write-Host ""
}

# 安装项目依赖
function Install-Dependencies {
    Write-Host "${BLUE}📦 检查项目依赖...${NC}"
    
    if (!(Test-Path "node_modules")) {
        Write-Host "${YELLOW}依赖未安装，开始安装...${NC}"
        npm install
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "${RED}❌ 依赖安装失败${NC}"
            exit 1
        }
        
        Write-Host "${GREEN}✅ 依赖安装完成${NC}"
    } else {
        Write-Host "${GREEN}✅ 依赖已安装${NC}"
    }
    Write-Host ""
}

# 配置环境变量
function Setup-Environment {
    Write-Host "${BLUE}🔧 检查环境配置...${NC}"
    
    if (!(Test-Path ".env")) {
        Write-Host "${YELLOW}⚠️  未检测到 .env 文件${NC}"
        Write-Host ""
        $choice = Read-Host "是否创建默认 .env 文件? (y/n)"
        Write-Host ""
        Write-Host ""
        
        if ($choice -eq 'y' -or $choice -eq 'Y') {
            $envContent = @"
# Kimi API 配置
# 请访问 https://platform.moonshot.cn/ 获取您的 API Key
VITE_KIMI_API_KEY=your-kimi-api-key-here

# API 基础路径
VITE_KIMI_BASE_URL=/v1

# 应用名称
VITE_APP_NAME=智课方舟
"@
            $envContent | Out-File -FilePath ".env" -Encoding UTF8
            Write-Host "${GREEN}✅ 已创建 .env 文件${NC}"
            Write-Host ""
            Write-Host "${YELLOW}📝 提示: 请编辑 .env 文件，填入您的 Kimi API Key${NC}"
            Write-Host "获取地址: https://platform.moonshot.cn/"
            Write-Host ""
            Read-Host "按回车键继续..."
        }
    } else {
        Write-Host "${GREEN}✅ 环境配置已存在${NC}"
        
        # 检查是否需要配置 API Key
        $envContent = Get-Content ".env" -Raw
        if ($envContent -match "your-kimi-api-key-here") {
            Write-Host "${YELLOW}⚠️  检测到默认 API Key，请在 .env 文件中配置真实的 API Key${NC}"
        }
    }
    Write-Host ""
}

# 启动开发服务器
function Start-DevServer {
    Write-Host "${CYAN}╔════════════════════════════════════════╗${NC}"
    Write-Host "${CYAN}║   正在启动开发服务器...                ║${NC}"
    Write-Host "${CYAN}╚════════════════════════════════════════╝${NC}"
    Write-Host ""
    Write-Host "${GREEN}✅ 应用将在以下地址启动:${NC}"
    Write-Host "   ${GREEN}➜${NC}  Local:   ${BLUE}http://localhost:3000${NC}"
    Write-Host ""
    Write-Host "${YELLOW}💡 提示: 按 Ctrl+C 停止服务器${NC}"
    Write-Host ""
    Write-Host "=================================="
    Write-Host ""
    
    npm run dev
}

# 检查是否在正确的目录中运行
function Test-Directory {
    if (!(Test-Path "package.json")) {
        Write-Host "${RED}❌ 错误: 请在项目根目录中运行此脚本${NC}"
        Write-Host "${YELLOW}💡 请先切换到项目目录:${NC}"
        Write-Host "   ${BLUE}cd C:\path\to\AIclassS${NC}"
        Write-Host "   ${BLUE}.\start.ps1${NC}"
        Write-Host ""
        exit 1
    }
}

# 主函数
function Main {
    # 检查目录
    Test-Directory
    
    Print-Banner
    
    # 检测操作系统
    Detect-OS
    Write-Host ""
    
    # 检查 Node.js
    Test-NodeJS
    Write-Host ""
    
    # 安装依赖
    Install-Dependencies
    
    # 配置环境
    Setup-Environment
    
    # 启动服务器
    Start-DevServer
}

# 运行主函数
Main

