#!/bin/bash

# PDCabinet 部署脚本
set -e

echo "🚀 开始部署 PDCabinet..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数定义
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 检查环境
log_info "检查环境..."
check_command docker
check_command docker-compose

# 检查环境文件
if [ ! -f "server/.env" ]; then
    log_warn "server/.env 文件不存在，将使用默认配置"
    cp server/env.example server/.env
fi

# 停止现有服务
log_info "停止现有服务..."
docker-compose down

# 拉取最新代码（可选）
if [ "$1" == "--pull" ]; then
    log_info "拉取最新代码..."
    git pull origin main
fi

# 构建镜像
log_info "构建 Docker 镜像..."
docker-compose build --no-cache

# 启动服务
log_info "启动服务..."
docker-compose up -d

# 等待服务启动
log_info "等待服务启动..."
sleep 10

# 健康检查
log_info "进行健康检查..."

# 检查MySQL
if docker-compose exec -T mysql mysqladmin ping -h localhost --silent; then
    log_info "✅ MySQL 服务正常运行"
else
    log_error "❌ MySQL 服务异常"
    exit 1
fi

# 检查后端服务
if curl -f http://localhost:4000/health &>/dev/null; then
    log_info "✅ 后端服务正常运行"
else
    log_error "❌ 后端服务异常"
    exit 1
fi

# 检查前端服务
if curl -f http://localhost &>/dev/null; then
    log_info "✅ 前端服务正常运行"
else
    log_error "❌ 前端服务异常"
    exit 1
fi

# 显示服务状态
echo ""
log_info "服务状态："
docker-compose ps

echo ""
log_info "🎉 部署完成！"
echo ""
echo "📋 访问地址："
echo "  前端: http://localhost"
echo "  后端API: http://localhost:4000"
echo ""
echo "📊 管理命令："
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo "  备份数据: ./backup.sh"
echo ""

# 创建备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

# 备份数据库
echo "备份数据库..."
docker-compose exec -T mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD:-pdcabinet123} ${DB_NAME:-pdcabinet} > $BACKUP_DIR/db_backup_$DATE.sql

# 备份上传文件
echo "备份上传文件..."
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz server/uploads/

# 清理旧备份（保留最近7天）
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: $BACKUP_DIR/backup_$DATE"
EOF

chmod +x backup.sh

log_info "备份脚本已创建: ./backup.sh"