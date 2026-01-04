-- 检查活动当前报名人数是否准确
-- 这个脚本对比 activity 表中的 current_participants 字段
-- 和 registration 表中实际状态为已通过的报名数量

SELECT
    a.id AS activity_id,
    a.title AS activity_title,
    a.current_participants AS cached_count,
    COALESCE(COUNT(r.id), 0) AS actual_count,
    (a.current_participants - COALESCE(COUNT(r.id), 0)) AS diff,
    CASE
        WHEN a.current_participants = COALESCE(COUNT(r.id), 0) THEN '✓ 正确'
        WHEN a.current_participants > COALESCE(COUNT(r.id), 0) THEN '✗ 缓存偏大'
        ELSE '✗ 缓存偏小'
    END AS status
FROM activity a
LEFT JOIN registration r
    ON a.id = r.activity_id
    AND r.status = 1  -- 1 = 已通过的报名
WHERE a.status IN (2, 3, 4)  -- 2=已发布 3=进行中 4=已结束
GROUP BY a.id, a.title, a.current_participants
ORDER BY diff DESC;

