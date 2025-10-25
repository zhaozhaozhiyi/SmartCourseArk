#!/bin/bash

echo "Building Go HTTP Server..."
echo

# 编译 macOS 版本
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Building for macOS (darwin)..."
    GOOS=darwin GOARCH=amd64 go build -o server-macos -ldflags="-s -w" server.go
    
    if [ $? -eq 0 ]; then
        echo
        echo "✓ Build successful!"
        echo
        echo "Generated: server-macos"
        echo
        echo "You can now run it with: ./server-macos"
    else
        echo "✗ Build failed!"
        exit 1
    fi
# 编译 Linux 版本
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Building for Linux..."
    go build -o server-linux -ldflags="-s -w" server.go
    
    if [ $? -eq 0 ]; then
        echo
        echo "✓ Build successful!"
        echo
        echo "Generated: server-linux"
        echo
        echo "You can now run it with: ./server-linux"
    else
        echo "✗ Build failed!"
        exit 1
    fi
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi


