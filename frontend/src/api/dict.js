import request from './request'

/**
 * 字典相关 API
 */

/**
 * 获取字典数据
 * @param {string} dictCode - 字典编码（如 activity_difficulty, user_role 等）
 * @returns {Promise} 字典数据列表
 */
export const getDictData = (dictCode) => {
  return request.get(`/dict/data/${dictCode}`)
}

