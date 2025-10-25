#!/bin/bash

# GitHub Pages 部署脚本
# 使用方法: ./deploy.sh

set -e

echo "🚀 开始部署到 GitHub Pages..."

# 检查是否在正确的分支
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "❌ 错误: 请在 main 分支上运行此脚本"
    echo "当前分支: $current_branch"
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ 错误: 有未提交的更改，请先提交或暂存"
    git status --short
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm ci

# 构建项目
echo "🔨 构建项目..."
npm run build-only

# 检查构建结果
if [ ! -d "dist" ]; then
    echo "❌ 错误: 构建失败，dist 目录不存在"
    exit 1
fi

# 提交并推送
echo "📝 提交更改..."
git add .
git commit -m "chore: 更新构建文件" || echo "没有新的更改需要提交"

echo "📤 推送到 GitHub..."
git push origin main

echo "✅ 部署完成！"
echo "🌐 您的网站将在几分钟后可用: https://$(git config user.name).github.io/AIclassS/"
echo "📊 查看部署状态: https://github.com/$(git config user.name)/AIclassS/actions"


