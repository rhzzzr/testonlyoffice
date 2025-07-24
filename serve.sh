#!/bin/bash

echo "启动本地HTTP服务器用于访问HTML演示页面..."

# 检查 Python 版本并启动HTTP服务器
if command -v python3 &> /dev/null
then
    echo "使用 Python3 启动服务器在端口 9000..."
    python3 -m http.server 9000
elif command -v python &> /dev/null
then
    echo "使用 Python2 启动服务器在端口 9000..."
    python -m SimpleHTTPServer 9000
else
    echo "未找到 Python，请安装 Python 或使用其他HTTP服务器"
    echo "您也可以使用 Node.js: npx http-server -p 9000"
    exit 1
fi