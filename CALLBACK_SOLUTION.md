# OnlyOffice Callback 连接问题解决方案

## 问题分析

你遇到的错误信息表明 OnlyOffice Document Server 无法连接到 callback URL (`http://localhost:8080/callback`)。这是因为：

1. **缺少 Callback Handler**: 原项目只有前端页面，没有后端服务来处理 OnlyOffice 的回调请求
2. **端口冲突**: OnlyOffice Document Server 和 Callback Server 都尝试使用同一个端口

## 解决方案

我已经为你创建了一个完整的解决方案：

### 1. 新建的文件

- **`callback-server.js`**: Node.js Express 服务器，处理 OnlyOffice 回调
- **`package.json`**: Node.js 依赖配置
- **`stop.sh`**: 停止所有服务的脚本
- **`CALLBACK_SOLUTION.md`**: 本说明文档

### 2. 修改的文件

- **`start.sh`**: 更新为同时启动 Docker 和 Callback Server
- **`docker-compose.yml`**: 将 OnlyOffice 端口改为 80
- **`api-integration.html`**: 更新 API 脚本路径
- **`config.js`**: 更新服务器地址配置

### 3. 新的架构

```
┌─────────────────────────────────────┐
│   OnlyOffice Document Server       │
│   (Docker Container)                │
│   Port: 80                          │
│   URL: http://localhost/            │
└─────────────────────────────────────┘
                   │
                   │ API 调用
                   ▼
┌─────────────────────────────────────┐
│   Callback Server                  │
│   (Node.js Express)                 │
│   Port: 8080                        │
│   URL: http://localhost:8080/       │
└─────────────────────────────────────┘
```

## 使用步骤

### 1. 安装依赖

确保你已安装：
- Docker 和 Docker Compose
- Node.js (14+ 版本)
- npm

### 2. 启动服务

```bash
# 给脚本执行权限
chmod +x start.sh stop.sh

# 启动所有服务
./start.sh
```

启动后你会看到：
- OnlyOffice Document Server: http://localhost/
- Callback Server: http://localhost:8080/callback
- 演示页面: http://localhost:8080/api-integration.html

### 3. 测试文档编辑

1. 访问 http://localhost:8080/api-integration.html
2. 文档应该正常加载，不再显示连接错误
3. 编辑文档后保存，服务器会自动处理回调

### 4. 停止服务

```bash
./stop.sh
```

## Callback Handler 功能

新的 `callback-server.js` 提供：

1. **文档保存处理**: 自动接收和保存 OnlyOffice 回调的文档
2. **静态文件服务**: 直接访问 HTML 演示页面
3. **文档管理**: 查看已保存的文档列表
4. **健康检查**: 服务状态监控
5. **CORS 支持**: 跨域请求处理

## API 端点

- `POST /callback` - OnlyOffice 回调处理
- `GET /health` - 服务健康检查
- `GET /documents` - 获取文档列表
- `GET /` - 重定向到演示页面

## 文档保存

编辑的文档会自动保存到 `documents/` 目录中，文件名格式为 `{document-key}.docx`。

## 故障排除

如果仍有问题：

1. **检查端口占用**:
   ```bash
   # 检查端口 80 和 8080 是否被占用
   lsof -i :80
   lsof -i :8080
   ```

2. **查看服务日志**:
   ```bash
   # Docker 日志
   docker-compose logs -f
   
   # Callback Server 会在终端显示日志
   ```

3. **验证服务状态**:
   ```bash
   # 检查健康状态
   curl http://localhost:8080/health
   
   # 检查 OnlyOffice API
   curl http://localhost/web-apps/apps/api/documents/api.js
   ```

## 成功指标

解决方案成功时你应该看到：
- ✅ 文档编辑器正常加载
- ✅ 不再显示 callback URL 连接错误
- ✅ 文档保存后在 `documents/` 目录中可以找到文件
- ✅ 服务器终端显示回调处理日志

这个解决方案提供了一个完整的 OnlyOffice 集成环境，包含必要的 callback 处理机制。