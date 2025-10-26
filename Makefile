.PHONY: help install start dev build clean check test reinstall

# 默认目标
.DEFAULT_GOAL := help

# 帮助信息
help: ## 显示帮助信息
	@echo ""
	@echo "╔════════════════════════════════════════╗"
	@echo "║   智课方舟 - 快速命令                   ║"
	@echo "╚════════════════════════════════════════╝"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "💡 推荐使用: make start"

# 使用启动脚本（智能版）
start: ## 使用智能启动脚本（自动检测并安装 Node.js）
	@chmod +x start.sh
	@./start.sh

# 安装依赖
install: ## 安装项目依赖
	@echo "📦 安装依赖..."
	@npm install
	@echo "✅ 依赖安装完成"

# 检查环境
check: ## 检查环境和依赖
	@echo "🔍 检查环境..."
	@command -v node >/dev/null 2>&1 || { echo "❌ 未安装 Node.js"; exit 1; }
	@echo "✅ Node.js: $$(node --version)"
	@command -v npm >/dev/null 2>&1 || { echo "❌ 未安装 npm"; exit 1; }
	@echo "✅ npm: $$(npm --version)"
	@[ -f "package.json" ] || { echo "❌ package.json 不存在"; exit 1; }
	@echo "✅ 项目文件检查通过"

# 检查并创建环境变量文件
check-env:
	@if [ ! -f ".env" ]; then \
		echo "⚠️  未检测到 .env 文件，创建默认配置..."; \
		echo "# Kimi API 配置" > .env; \
		echo "# 请访问 https://platform.moonshot.cn/ 获取您的 API Key" >> .env; \
		echo "VITE_KIMI_API_KEY=your-kimi-api-key-here" >> .env; \
		echo "VITE_KIMI_BASE_URL=/v1" >> .env; \
		echo "VITE_APP_NAME=智课方舟" >> .env; \
		echo "✅ .env 文件已创建"; \
	fi

# 快速启动开发服务器
dev: check-env ## 快速启动开发服务器
	@echo "🚀 启动开发服务器..."
	@npm run dev

# 构建生产版本
build: install ## 构建生产版本
	@echo "🏗️  构建生产版本..."
	@npm run build
	@echo "✅ 构建完成，输出目录: dist/"

# 预览生产版本
preview: build ## 构建并预览生产版本
	@echo "🚀 预览生产版本..."
	@npm run preview

# 清理
clean: ## 清理构建产物和依赖
	@echo "🧹 清理..."
	@rm -rf dist node_modules
	@echo "✅ 清理完成"

# 代码检查
lint: ## 运行代码检查
	@echo "🔍 代码检查..."
	@npm run lint

# 类型检查
type-check: ## 运行 TypeScript 类型检查
	@echo "🔍 类型检查..."
	@npm run type-check

# 完整检查
test: lint type-check ## 运行完整的代码检查

# 重新安装
reinstall: clean ## 完全重新安装依赖
	@rm -f package-lock.json
	@echo "📦 重新安装依赖..."
	@npm install
	@echo "✅ 安装完成"

# 开发文档
docs: ## 启动 VitePress 文档服务器
	@echo "📚 启动文档服务器..."
	@npm run docs:dev

# 构建文档
docs-build: ## 构建 VitePress 文档
	@echo "📚 构建文档..."
	@npm run docs:build

# 预览文档
docs-preview: docs-build ## 预览 VitePress 文档
	@echo "📚 预览文档..."
	@npm run docs:preview

# 构建单文件应用
build-app: ## 构建当前平台的单文件应用
	@echo "🏗️  构建单文件应用..."
	@npm run build-only
	@npm run build:docs
	@CGO_ENABLED=1 go build -ldflags="-s -w" -o release/AIclassS_$(shell go env GOOS)_$(shell go env GOARCH) server.go
	@echo "✅ 构建完成: release/AIclassS_$(shell go env GOOS)_$(shell go env GOARCH)"

# 构建Windows应用
build-windows: ## 构建Windows应用
	@./build_windows.bat

# 构建macOS应用
build-macos: ## 构建macOS应用
	@./build_macos.sh
