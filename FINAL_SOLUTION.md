# OnlyOffice Callback 最终解决方案

## 问题根源分析

经过深入分析，OnlyOffice callback连接问题的根本原因是：

1. **Docker网络隔离**: OnlyOffice Document Server运行在Docker容器内，无法直接访问宿主机的`localhost:8080`
2. **缺少文档存储服务**: 原项目只有前端页面，缺少处理文档保存的后端服务
3. **外部文档URL**: 使用外部文档URL时，OnlyOffice需要能够回调到一个可访问的存储服务

## 完整解决方案

### 1. Docker网络配置 ✅
在`docker-compose.yml`中添加host映射：
```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

### 2. Callback服务器 ✅
创建了完整的Node.js Express服务器 (`callback-server.js`)：
- 处理OnlyOffice回调请求
- 提供文档文件服务
- 增强的日志记录
- CORS支持

### 3. 本地文档服务 ✅
- 下载模板文档到本地 `documents/template.docx`
- 提供文档访问端点 `/documents/:filename`
- 支持从Docker容器访问

### 4. 配置更新 ✅
更新所有配置文件使用正确的URL：
- Callback URL: `http://host.docker.internal:8080/callback`
- 文档URL: `http://host.docker.internal:8080/documents/template.docx`

## 当前状态验证

✅ **Callback服务器运行正常**
```bash
curl http://localhost:8080/health
# 返回: {"status":"ok","message":"OnlyOffice Callback Server is running"}
```

✅ **OnlyOffice Document Server运行正常**
```bash
docker ps | grep onlyoffice
# 显示容器正在运行
```

✅ **网络连接正常**
```bash
# Docker容器可以访问callback服务器
docker exec onlyoffice-documentserver wget -q --spider http://host.docker.internal:8080/health
# 返回成功

# Docker容器可以访问文档文件
docker exec onlyoffice-documentserver wget -q --spider http://host.docker.internal:8080/documents/template.docx
# 返回成功
```

✅ **Callback端点测试正常**
```bash
curl -X POST http://localhost:8080/callback -H "Content-Type: application/json" -d '{"status":1,"key":"test"}'
# 返回: {"error":0}
```

## 服务架构

```
Browser (localhost:8080/api-integration.html)
    ↓
OnlyOffice Document Server (Docker:80)
    ↓ (通过 host.docker.internal:8080)
Callback Server (Node.js:8080)
    ↓
Local Documents Storage (./documents/)
```

## 使用方法

### 启动服务
```bash
# 方法1: 使用启动脚本
./start.sh

# 方法2: 手动启动
docker-compose up -d
node callback-server.js
```

### 访问演示
1. 打开浏览器访问: `http://localhost:8080/api-integration.html`
2. 文档应该正常加载，不再显示callback连接错误
3. 编辑文档时，callback服务器会显示详细日志

### 监控日志
Callback服务器会显示详细的调试信息：
```
=== OnlyOffice 回调 [2025-07-24T09:46:30.000Z] ===
请求头: {...}
请求体: {...}
文档状态: 1, 文档键: document-key-api-abc123
📝 文档正在编辑中
返回响应: {"error":0}
=== 回调处理完成 ===
```

## 预期结果

现在应该不再看到文档保存错误提示了。如果仍有问题：

1. **检查服务状态**:
   ```bash
   # 检查callback服务器
   curl http://localhost:8080/health
   
   # 检查Docker容器
   docker ps | grep onlyoffice
   ```

2. **查看日志**:
   - Callback服务器日志会显示在终端
   - Docker日志: `docker-compose logs -f`

3. **验证网络连接**:
   ```bash
   # 从容器内测试连接
   docker exec onlyoffice-documentserver wget -q --spider http://host.docker.internal:8080/callback
   ```

这个解决方案提供了完整的OnlyOffice集成环境，包含必要的文档存储和回调处理功能。