#!/bin/bash

echo "正在停止所有服务..."

# 停止 Callback Server
if [ -f ".callback-server.pid" ]; then
    CALLBACK_PID=$(cat .callback-server.pid)
    if ps -p $CALLBACK_PID > /dev/null 2>&1; then
        echo "停止 Callback Server (PID: $CALLBACK_PID)..."
        kill $CALLBACK_PID
        sleep 2
        
        # 强制停止如果还在运行
        if ps -p $CALLBACK_PID > /dev/null 2>&1; then
            echo "强制停止 Callback Server..."
            kill -9 $CALLBACK_PID
        fi
    fi
    rm -f .callback-server.pid
fi

# 停止所有Node.js进程（callback-server.js）
echo "停止所有 callback-server.js 进程..."
pkill -f "callback-server.js"

# 停止 Docker Compose
echo "停止 OnlyOffice Document Server..."
docker-compose down

echo "所有服务已停止。"