# OnlyOffice Callback 问题快速修复

## 问题原因
Docker容器内的OnlyOffice无法访问`localhost:8080`的callback服务器，因为从容器视角看，`localhost`指向容器本身而非宿主机。

## 已完成的修复

### 1. Docker网络配置
在`docker-compose.yml`中添加了host映射：
```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

### 2. 更新Callback URL
将所有配置文件中的callback URL从：
- `http://localhost:8080/callback`

更改为：
- `http://host.docker.internal:8080/callback`

影响的文件：
- `api-integration.html`
- `config.js`

### 3. 验证连接
✅ Callback服务器运行正常：`http://localhost:8080/health`
✅ OnlyOffice Document Server运行正常：`http://localhost/`
✅ Docker容器可以访问callback服务器

## 当前状态
- **OnlyOffice Document Server**: 运行在端口80
- **Callback Server**: 运行在端口8080
- **网络连接**: Docker容器可以通过`host.docker.internal`访问宿主机服务

## 测试方法
1. 访问演示页面：`http://localhost:8080/api-integration.html`
2. 文档应该正常加载，不再显示callback连接错误
3. 编辑文档并保存，回调应该正常工作

## 如果问题仍然存在
请检查：
1. 两个服务都在运行
2. 防火墙没有阻止端口8080
3. 查看callback服务器的控制台日志以确认收到回调请求

现在应该可以正常使用OnlyOffice文档编辑功能了！