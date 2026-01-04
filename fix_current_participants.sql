-- 修复活动当前报名人数缓存字段
-- 根据 registration 表中实际已通过的报名数量更新 activity.current_participants

UPDATE activity a
SET current_participants = (
    SELECT COUNT(*)
    FROM registration r
    WHERE r.activity_id = a.id
    AND r.status = 1  -- 1 = 已通过
)
WHERE id IN (
    -- 只更新缓存和实际数据不一致的活动
    SELECT sub.id
    FROM (
        SELECT a.id
        FROM activity a
        LEFT JOIN registration r
            ON a.id = r.activity_id
            AND r.status = 1
        GROUP BY a.id, a.current_participants
        HAVING a.current_participants != COUNT(r.id)
    ) sub
);

-- 验证修复结果
SELECT
    a.id AS activity_id,
    a.title AS activity_title,
    a.current_participants AS cached_count,
    COALESCE(COUNT(r.id), 0) AS actual_count,
    CASE
        WHEN a.current_participants = COALESCE(COUNT(r.id), 0) THEN '✓ 已修复'
        ELSE '✗ 仍有问题'
    END AS status
FROM activity a
LEFT JOIN registration r
    ON a.id = r.activity_id
    AND r.status = 1
WHERE a.status IN (2, 3, 4)  -- 2=已发布 3=进行中 4=已结束
GROUP BY a.id, a.title, a.current_participants
ORDER BY a.id;

