FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    mysql-client \
    curl

# 复制package文件
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 创建必要的目录
RUN mkdir -p uploads logs && \
    chmod 755 uploads logs

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S pdcabinet -u 1001 -G nodejs

# 更改文件权限
RUN chown -R pdcabinet:nodejs /app
USER pdcabinet

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

# 暴露端口
EXPOSE 4000

# 启动应用
CMD ["npm", "start"]