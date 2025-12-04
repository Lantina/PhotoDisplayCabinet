-- 该SQL脚本用于将数据库主键从INT改为UUID
-- 先备份数据！！！

-- 更新photos表
ALTER TABLE photos MODIFY id CHAR(36) NOT NULL PRIMARY KEY;

-- 更新admins表
ALTER TABLE admins MODIFY id CHAR(36) NOT NULL PRIMARY KEY;

-- 更新users表
ALTER TABLE users MODIFY id CHAR(36) NOT NULL PRIMARY KEY;