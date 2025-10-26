#!/bin/bash

echo "========================================"
echo "构建macOS单文件应用（原生GUI）"
echo "========================================"
echo ""

# 创建release目录
mkdir -p release

echo "[1/4] 安装Go依赖..."
go mod download
if [ $? -ne 0 ]; then
    echo "❌ 错误: Go依赖安装失败"
    exit 1
fi

echo ""
echo "[2/4] 构建前端..."
npm run build-only
if [ $? -ne 0 ]; then
    echo "❌ 错误: 前端构建失败"
    exit 1
fi

echo ""
echo "[3/4] 构建文档..."
npm run build:docs
if [ $? -ne 0 ]; then
    echo "⚠️  警告: 文档构建失败，继续构建..."
fi

echo ""
echo "[4/4] 构建Go程序..."
export CGO_ENABLED=1
export GOOS=darwin

# Intel芯片
echo "构建 Intel (amd64) 版本..."
export GOARCH=amd64
go build -ldflags="-s -w" -o release/智课方舟_macOS_amd64 server.go
if [ $? -ne 0 ]; then
    echo "❌ 错误: Intel版本构建失败"
    exit 1
fi

# Apple Silicon
echo "构建 Apple Silicon (arm64) 版本..."
export GOARCH=arm64
go build -ldflags="-s -w" -o release/智课方舟_macOS_arm64 server.go
if [ $? -ne 0 ]; then
    echo "❌ 错误: Apple Silicon版本构建失败"
    exit 1
fi

echo ""
echo "========================================"
echo "✅ 构建完成！"
echo "========================================"
echo "Intel芯片: release/智课方舟_macOS_amd64"
echo "Apple Silicon: release/智课方舟_macOS_arm64"
echo ""
echo "添加执行权限..."
chmod +x release/智课方舟_macOS_amd64
chmod +x release/智课方舟_macOS_arm64
