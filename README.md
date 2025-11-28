# PDCabinet 风格照片展示柜

Vue 3 + Vite + Pinia 打造的沉浸式瀑布流前端，配合 Node.js + Express + MySQL 8 后端，实现 PDCabinet 式的展示体验。公众首页仅展示作品流，管理员需手动访问 `/admin` 才能登录并上传作品，同时支持用户注册功能。

## ✨ 主要功能

- 🎨 **沉浸式瀑布流展示**：优雅的视觉体验，支持EXIF信息展示
- 📝 **用户注册/登录**：用户可注册账号，需管理员审核后登录
- 🔐 **管理员后台**：支持作品上传、用户审核、系统管理
- 📸 **EXIF自动解析**：自动提取照片拍摄参数（制造商、相机型号、拍摄时间、曝光时间、光圈值、ISO、焦距等）
- ⚙️ **自定义拍摄参数**：上传时可手动输入光圈值、ISO、曝光时间、焦距等参数
- ⭐ **星级评价**：支持1-7星评分系统
- 📱 **响应式设计**：完美适配移动端和桌面端
- 🌈 **现代UI**：渐变背景、平滑动画、优雅的交互体验
- 🔒 **照片不可变性**：上传后的照片不可修改或删除，确保数据完整性
- 👤 **上传者显示**：照片详情页显示上传者信息

## 🏗️ 项目结构

```
PhotoDisplayCabinet/
├── client/          # Vue 3 + Pinia + Vue Router + Axios 前端
│   ├── src/
│   │   ├── components/    # 组件（照片网格、模态框、登录注册等）
│   │   ├── views/        # 页面视图
│   │   ├── stores/       # Pinia状态管理
│   │   ├── api/          # API接口封装
│   │   └── router/       # 路由配置
│   └── dist/             # 构建输出
├── server/          # Node.js + Express + MySQL 后端
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── services/      # 业务逻辑
│   │   ├── middleware/    # 中间件
│   │   ├── routes/        # 路由定义
│   │   └── config/        # 配置文件
│   └── uploads/          # 上传文件存储
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js 16+
- MySQL 8.0+
- npm 或 yarn

### 1. 克隆项目

```bash
git clone [项目地址]
cd PhotoDisplayCabinet
```

### 2. 配置数据库

确保MySQL服务已启动，创建数据库（可选，项目会自动创建）：

```sql
CREATE DATABASE IF NOT EXISTS pdcabinet DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 启动后端服务

```bash
cd server

# 复制环境变量模板
cp env.example .env

# 编辑配置文件（重要！）
# 修改数据库连接信息和默认管理员账号
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=123456
# DB_NAME=pdcabinet
# ADMIN_USERNAME=admin
# ADMIN_PASSWORD=admin123
# JWT_SECRET=your-secret-key

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

后端服务将在 `http://localhost:4000` 启动

### 4. 启动前端服务

```bash
cd ../client

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

### 5. 访问应用

- **主页**：`http://localhost:5173` - 浏览照片展示
- **用户注册/登录**：`http://localhost:5173/auth` - 用户注册和登录
- **管理后台**：`http://localhost:5173/admin` - 管理员登录、上传照片、审核用户

## 📋 详细使用方法

### 用户功能

#### 注册新账号
1. 访问 `http://localhost:5173/auth`
2. 点击"注册"标签
3. 填写用户名、邮箱、密码（密码至少6位）
4. 点击"注册"按钮
5. 等待管理员审核通过

#### 用户登录
1. 访问 `http://localhost:5173/auth`
2. 输入用户名和密码
3. 点击"登录"按钮
4. 审核通过的用户可以正常登录

#### 浏览照片
1. 在主页浏览瀑布流式照片展示
2. 点击任意照片查看大图和详细信息
3. 查看照片的EXIF信息（制造商、相机型号、拍摄参数等）
4. 查看照片的星级评分

### 管理员功能

#### 管理员登录
1. 访问 `http://localhost:5173/admin`
2. 输入管理员账号密码（在`.env`文件中配置）
3. 登录成功后可以访问管理功能

#### 上传照片
1. 在管理后台点击"上传管理"标签
2. 填写照片标题和描述（可选）
3. 填写拍摄参数：光圈值、ISO、曝光时间、焦距、拍摄时间（可选，会覆盖EXIF数据）
4. 选择照片文件上传
5. 系统会自动解析EXIF信息并保存，手动输入的参数优先级更高

#### 审核用户
1. 在管理后台点击"用户审核"标签
2. 查看待审核的用户列表
3. 点击"批准"或"拒绝"按钮处理注册申请
4. 只有批准的用户才能登录系统

## ⚙️ 环境配置

### 前端环境变量（可选）

在 `client/.env` 文件中设置：

```env
# API基础地址（默认：http://localhost:4000/api）
VITE_API_BASE=https://your-domain/api

# 静态资源地址（默认：http://localhost:4000）
VITE_ASSET_BASE=https://your-domain
```

### 后端环境变量

在 `server/.env` 文件中设置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=camarts

# 管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# JWT密钥（生产环境务必修改）
JWT_SECRET=your-secret-key-here

# 端口配置（可选）
PORT=4000
```

## 🔧 API 接口文档

### 公开接口

- `GET /api/photos` - 获取公开照片列表（支持分页）
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/user/login` - 用户登录

### 需要认证的接口

#### 管理员接口
- `POST /api/auth/login` - 管理员登录
- `POST /api/photos` - 上传照片（需管理员权限）
- `DELETE /api/photos/:id` - 删除照片（需管理员权限）
- `GET /api/auth/users/pending` - 获取待审核用户列表
- `POST /api/auth/users/:id/approve` - 批准用户注册
- `POST /api/auth/users/:id/reject` - 拒绝用户注册
- `GET /api/auth/users` - 获取所有用户列表

## 🗄️ 数据库结构

### 核心数据表

- **photos**：照片信息表（包含EXIF数据、评分等）
- **admins**：管理员账号表
- **users**：用户账号表（包含状态字段：pending/approved/rejected）

## 🚀 部署建议

### 生产环境部署

1. **修改默认密码**：务必修改默认管理员密码和JWT密钥
2. **HTTPS配置**：建议使用HTTPS协议
3. **数据库备份**：定期备份MySQL数据库
4. **文件备份**：定期备份`server/uploads/`目录中的照片文件
5. **环境变量**：不要在代码中硬编码敏感信息

### Docker部署（可选）

```dockerfile
# 后端Dockerfile示例
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## 📝 注意事项

- 首次启动会自动创建数据库表和默认管理员账号
- 上传的照片文件保存在`server/uploads/`目录
- 用户注册后需要管理员审核才能登录
- 系统会自动解析上传照片的EXIF信息
- 支持1-7星评分系统
- 上传后的照片不可修改或删除
- 手动输入的拍摄参数会覆盖EXIF数据

## 🚀 发布准备指南

### 📦 构建生产版本

#### 构建前端
```bash
cd client
npm run build
```
构建完成后，静态文件会在 `client/dist/` 目录中

#### 构建后端
后端无需构建，直接部署即可

### 🔧 生产环境配置检查清单

#### 1. 环境变量配置
- [ ] 修改 `server/.env` 中的数据库配置
- [ ] 修改默认管理员密码
- [ ] 生成强JWT密钥
- [ ] 配置正确的域名和端口

#### 2. 安全设置
- [ ] 修改默认管理员账号密码
- [ ] 配置HTTPS证书
- [ ] 设置防火墙规则
- [ ] 配置CORS允许的域名

#### 3. 性能优化
- [ ] 启用Gzip压缩
- [ ] 配置静态文件缓存
- [ ] 设置数据库连接池
- [ ] 配置图片压缩和缩略图生成

### 🐳 Docker部署方案

#### 创建Docker网络
```bash
docker network create pdcabinet-network
```

#### MySQL容器
```bash
docker run -d \
  --name pdcabinet-mysql \
  --network pdcabinet-network \
  -e MYSQL_ROOT_PASSWORD=your-strong-password \
  -e MYSQL_DATABASE=pdcabinet \
  -v pdcabinet-mysql-data:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8.0
```

#### 后端容器
```dockerfile
# server/Dockerfile
FROM node:16-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源码
COPY . .

# 创建上传目录
RUN mkdir -p uploads

# 暴露端口
EXPOSE 4000

# 启动应用
CMD ["npm", "start"]
```

```bash
# 构建并运行后端容器
docker build -t pdcabinet-server ./server
docker run -d \
  --name pdcabinet-server \
  --network pdcabinet-network \
  -p 4000:4000 \
  -v $(pwd)/server/uploads:/app/uploads \
  -v $(pwd)/server/.env:/app/.env \
  pdcabinet-server
```

#### 前端容器（Nginx）
```dockerfile
# client/Dockerfile
FROM node:16-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# 构建并运行前端容器
docker build -t pdcabinet-client ./client
docker run -d \
  --name pdcabinet-client \
  -p 80:80 \
  pdcabinet-client
```

### 🔄 自动化部署脚本

创建部署脚本 `deploy.sh`：
```bash
#!/bin/bash

# 停止现有容器
docker-compose down

# 拉取最新代码
git pull origin main

# 构建新镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps
```

### 📊 监控和维护

#### 日志监控
```bash
# 查看实时日志
docker logs -f pdcabinet-server

# 查看错误日志
docker logs pdcabinet-server | grep ERROR
```

#### 数据备份
```bash
# 备份数据库
docker exec pdcabinet-mysql mysqldump -u root -p pdcabinet > backup.sql

# 备份上传文件
tar -czf uploads-backup.tar.gz server/uploads/
```

#### 性能监控
- 使用 `htop` 监控系统资源
- 使用 `netstat` 监控网络连接
- 使用 `df -h` 监控磁盘空间

### 🌐 域名和SSL配置

#### Nginx反向代理配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 前端
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 后端API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态资源
    location /uploads {
        alias /path/to/your/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 📋 发布检查清单

- [ ] 代码已通过测试
- [ ] README文档已更新
- [ ] 环境变量已配置
- [ ] 数据库已备份
- [ ] 文件上传目录权限正确
- [ ] SSL证书已配置
- [ ] 监控告警已设置
- [ ] 备份策略已制定
- [ ] 回滚方案已准备

### 🎯 版本管理

建议使用语义化版本号：
- `v1.0.0` - 初始发布版本
- `v1.1.0` - 新功能版本
- `v1.1.1` - 修复版本

创建Git标签：
```bash
git tag -a v1.0.0 -m "PDCabinet v1.0.0 正式发布"
git push origin v1.0.0
```

## 🔍 故障排除

### 常见问题

1. **数据库连接失败**：检查MySQL服务是否启动，确认数据库配置正确
2. **上传失败**：检查`server/uploads/`目录是否有写入权限
3. **登录失败**：确认管理员账号密码正确，用户账号已通过审核
4. **端口冲突**：修改`.env`文件中的端口号

### 日志查看

后端日志会显示详细的错误信息，便于调试和问题定位。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

