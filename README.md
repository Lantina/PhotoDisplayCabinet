# CAMARTS 风格照片展示柜

Vue 3 + Vite + Pinia 打造的沉浸式瀑布流前端，配合 Node.js + Express + MySQL 8 后端，实现 camarts.app 式的展示体验。公众首页仅展示作品流，管理员需手动访问 `/admin` 才能登录并上传作品。

## 项目结构

- `server/` — Express、Multer、MySQL2、JWT 与 EXIF 解析，提供鉴权、上传、星级评价与参数写入 MySQL。
- `client/` — Vue 3 + Pinia + Vue Router + Axios，包含纯展示的瀑布流页面与隐藏的 `/admin` 上传入口。

## 快速开始

```bash
# 启动后端
cd server
cp env.example .env         # 默认连接 localhost:3306，账号 root/123456
npm install
npm run dev

# 启动前端
cd ../client
npm install
npm run dev
```

前端默认直连 `http://localhost:4000/api`。如需自定义可在 `client/.env` 设置：

- `VITE_API_BASE=https://your-domain/api`
- `VITE_ASSET_BASE=https://your-domain` （静态图片访问地址）

## API 摘要

- `POST /api/auth/login`：管理员登录，返回 JWT；默认账号可在 `.env` 中配置。
- `GET /api/photos`：公开的照片列表。
- `POST /api/photos`：管理员上传作品（需 `Authorization: Bearer <token>`），后台自动解析 EXIF 并允许覆盖。
- `DELETE /api/photos/:id`：管理员删除指定作品。

上传文件保存至 `server/uploads/`，MySQL `photos` 表会记录标题、描述、七星上限的评价、以及 EXIF 字段（制造商、相机型号、拍摄时间、曝光时间、光圈值、ISO、修改时间、焦距等）。首次启动会自动建库并根据 `.env` 生成默认管理员。请在生产环境中为 `uploads` 目录和数据库提供持久化与备份策略。

