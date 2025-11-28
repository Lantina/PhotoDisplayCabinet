#!/bin/bash

# PDCabinet 版本发布脚本
set -e

echo "🏷️  PDCabinet 版本发布工具"
echo "============================"

# 获取当前版本
if git describe --tags --abbrev=0 2>/dev/null; then
    CURRENT_VERSION=$(git describe --tags --abbrev=0)
    echo "当前版本: $CURRENT_VERSION"
else
    echo "当前版本: 无"
    CURRENT_VERSION="v0.0.0"
fi

# 读取新版本号
read -p "请输入新版本号 (如: v1.0.0): " NEW_VERSION

# 验证版本号格式
if [[ ! $NEW_VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ 版本号格式错误！请使用 v1.0.0 格式"
    exit 1
fi

# 读取发布说明
read -p "请输入发布说明: " RELEASE_NOTES

# 确认信息
echo ""
echo "请确认发布信息："
echo "版本号: $NEW_VERSION"
echo "发布说明: $RELEASE_NOTES"
echo ""
read -p "确认发布？(y/N): " CONFIRM

if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
    echo "❌ 发布已取消"
    exit 1
fi

# 检查是否有未提交的更改
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ 有未提交的更改，请先提交或暂存"
    git status
    exit 1
fi

# 确保在main分支
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ $CURRENT_BRANCH != "main" ]]; then
    echo "❌ 请在 main 分支上发布版本"
    exit 1
fi

# 拉取最新代码
echo "拉取最新代码..."
git pull origin main

# 更新版本号文件
echo "$NEW_VERSION" > VERSION
echo "$(date '+%Y-%m-%d')" > RELEASE_DATE

# 更新RELEASE.md
if [ -f "RELEASE.md" ]; then
    # 在文件开头添加新版本信息
    TEMP_FILE=$(mktemp)
    echo "## $NEW_VERSION ($(date '+%Y-%m-%d'))" > $TEMP_FILE
    echo "" >> $TEMP_FILE
    echo "$RELEASE_NOTES" >> $TEMP_FILE
    echo "" >> $TEMP_FILE
    cat RELEASE.md >> $TEMP_FILE
    mv $TEMP_FILE RELEASE.md
fi

# 提交更改
git add -A
git commit -m "Release $NEW_VERSION

$RELEASE_NOTES"

# 创建标签
git tag -a $NEW_VERSION -m "Release $NEW_VERSION

$RELEASE_NOTES"

# 推送到远程
echo "推送到远程仓库..."
git push origin main
git push origin $NEW_VERSION

# 构建生产版本
echo "构建生产版本..."
cd client && npm run build && cd ..

# 显示发布信息
echo ""
echo "✅ 发布成功！"
echo "=================="
echo "版本号: $NEW_VERSION"
echo "发布说明: $RELEASE_NOTES"
echo "Git标签: $NEW_VERSION"
echo ""
echo "📋 后续操作："
echo "1. 如果需要，可以运行 ./deploy.sh 部署到服务器"
echo "2. 在GitHub上创建Release"
echo "3. 更新文档和通知用户"
echo ""
echo "🎉 恭喜！发布完成！"