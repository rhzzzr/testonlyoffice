#!/bin/bash

echo "启动 OnlyOffice Document Server..."

# 创建数据目录
mkdir -p data/onlyoffice/DocumentServer/{logs,data,lib,rabbitmq,redis,db}
mkdir -p documents

# 设置目录权限
chmod -R 755 data/
chmod -R 755 documents/

# 检查是否安装了Node.js和npm
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "错误: 未找到 npm，请先安装 npm"
    exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装 Node.js 依赖..."
    npm install
fi

# 启动 Docker Compose
echo "启动 OnlyOffice Document Server Docker 容器..."
docker-compose up -d

# 等待Docker容器启动
echo "等待 OnlyOffice Document Server 启动..."
sleep 5

# 启动 Callback Server
echo "启动 Callback Server..."
node callback-server.js &
CALLBACK_PID=$!

echo ""
echo "所有服务已启动!"
echo ""
echo "OnlyOffice Document Server: http://localhost:8081"
echo "Callback Server: http://localhost:8080/callback"
echo "演示页面: http://localhost:8080/api-integration.html"
echo "健康检查: http://localhost:8080/health"
echo "文档列表: http://localhost:8080/documents"
echo ""
echo "查看Docker日志: docker-compose logs -f"
echo "停止所有服务: ./stop.sh"
echo ""

# 保存PID以便后续停止
echo $CALLBACK_PID > .callback-server.pid

echo "按 Ctrl+C 停止所有服务"
wait