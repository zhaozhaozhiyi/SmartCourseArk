#!/bin/bash

echo "🚀 创建智课方舟 Release"
echo ""

# 获取当前版本号
VERSION=$(date +"%Y.%m.%d-%H%M")
echo "📦 版本号: $VERSION"

# 创建并推送 tag
echo "🏷️  创建 tag: v$VERSION"
git tag "v$VERSION"
git push origin "v$VERSION"

echo ""
echo "✅ Tag 已推送，GitHub Actions 将自动构建并创建 Release"
echo "📥 请稍等几分钟后访问: https://github.com/zhaozhaozhiyi/SmartCourseArk/releases"
echo ""
echo "💡 提示："
echo "   - Windows: 下载 .exe 文件，双击运行"
echo "   - macOS: 下载对应架构文件，首次运行需右键-打开"
echo "   - Linux: 下载对应架构文件，添加执行权限后运行"
