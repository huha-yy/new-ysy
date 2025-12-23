-- =============================================
-- 更新管理员密码
-- 密码：123（需要替换为实际生成的 BCrypt 密文）
-- =============================================

-- 方法1：使用在线 BCrypt 工具生成密文
-- 访问 https://bcrypt-generator.com/
-- 输入密码：123，选择 cost factor：10
-- 复制生成的密文，替换下面的 {BCRYPT_HASH}

UPDATE `user`
SET `password` = '$2a$10$Hbr4de9o1K0f37SEL3Q2ZunGcHcl0UM9xzsaoRyb6UJPCHt0Cu.sq'
WHERE `username` = 'admin';

-- 验证更新
SELECT `id`, `username`, `nickname`, `role`, `status` FROM `user` WHERE `username` = 'admin';

