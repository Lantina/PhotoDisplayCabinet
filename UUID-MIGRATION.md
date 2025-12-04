# UUID主键迁移指南

## 已完成的修改

### 1. 数据库配置修改 (`server/src/config/db.js`)
- 引入了 `uuid` 库用于生成UUID
- 将所有表的主键从 `INT AUTO_INCREMENT PRIMARY KEY` 改为 `CHAR(36) NOT NULL PRIMARY KEY`
- 更新了 `ensureDefaultAdmin()` 函数，在创建管理员时生成UUID

### 2. 用户服务修改 (`server/src/services/userService.js`)
- 引入 `uuid` 库
- 在 `createUser()` 函数中生成UUID并插入到users表中
- 不再依赖 `result.insertId`，而是直接使用生成的UUID

### 3. 图片服务修改 (`server/src/services/photoService.js`)
- 引入 `uuid` 库
- 在 `insertPhoto()` 函数中生成UUID并插入到photos表中
- 不再依赖 `result.insertId`，而是直接使用生成的UUID

### 4. 依赖安装
- 为server项目安装了 `uuid` 依赖

## 手动操作步骤

### 对于新数据库
直接运行项目即可，新的表结构将自动创建并使用UUID主键。

### 对于现有数据库
需要执行以下SQL脚本将现有表转换为UUID主键：

```sql
-- 备份数据之前请先运行！！！

-- 方法一：直接转换（仅适用于表为空或数据可以重新生成的情况）
ALTER TABLE photos MODIFY id CHAR(36) NOT NULL PRIMARY KEY;
ALTER TABLE admins MODIFY id CHAR(36) NOT NULL PRIMARY KEY;
ALTER TABLE users MODIFY id CHAR(36) NOT NULL PRIMARY KEY;

-- 方法二：如果表中有数据需要保留，请使用以下步骤：
-- 1. 创建新表
-- 2. 将旧表数据迁移到新表，为每条记录生成UUID
-- 3. 删除旧表并将新表重命名
```

## 验证
服务器已成功启动，没有报错。项目现在支持UUID作为所有表的主键。

## 注意事项
- UUID格式为 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`，共36个字符
- 客户端代码不需要修改，因为JavaScript/JSON会自动处理字符串类型的ID
- 使用UUID可以避免主键冲突，提高系统的可扩展性