/**
 * 图片URL处理工具函数
 */

/**
 * 获取完整的图片URL
 * @param {string} path - 图片路径
 * @returns {string} 完整URL
 */
export const getImageUrl = (path) => {
  if (!path) return ''

  // 如果已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // 如果是blob URL（临时URL），直接返回
  if (path.startsWith('blob:')) {
    return path
  }

  // 如果是相对路径（/uploads/...），拼接API前缀
  if (path.startsWith('/uploads')) {
    return `/api${path}`
  }

  return path
}

/**
 * 获取活动封面图片URL
 * @param {object} activity - 活动对象
 * @returns {string} 图片URL
 */
export const getActivityCoverUrl = (activity) => {
  if (!activity) return ''

  if (activity.coverImage) {
    return getImageUrl(activity.coverImage)
  }

  // 使用随机山地图片作为默认
  const randomId = activity.id ? activity.id % 9 + 1 : 1
  return `/images/activities/activity-${randomId}.jpg`
}

/**
 * 获取用户头像URL
 * @param {string} avatarPath - 头像路径
 * @returns {string} 头像URL
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return ''
  return getImageUrl(avatarPath)
}
