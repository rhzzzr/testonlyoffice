FROM node:18-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制应用代码
COPY . .

# 创建documents目录
RUN mkdir -p documents

# 暴露端口
EXPOSE 8080

# 启动命令
CMD ["node", "callback-server.js"]