import axios from 'axios'
import { getToken } from '../utils/storage'

/**
 * 文件上传相关API
 */

/**
 * 上传图片
 * @param {File} file - 图片文件
 * @returns {Promise<{url: string, filename: string}>}
 */
export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const token = getToken()

  const response = await axios.post('/api/file/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { 'Authorization': `Bearer ${token.trim()}` } : {})
    }
  })

  if (response.data.code === 200) {
    return response.data.data
  } else {
    throw new Error(response.data.message || '上传失败')
  }
}

/**
 * 删除文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<void>}
 */
export const deleteFile = async (filePath) => {
  const token = getToken()

  const response = await axios.delete('/api/file/delete', {
    params: { path: filePath },
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token.trim()}` } : {})
    }
  })

  if (response.data.code !== 200) {
    throw new Error(response.data.message || '删除失败')
  }
}

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

  // 如果是相对路径，拼接API前缀
  if (path.startsWith('/uploads')) {
    return `/api${path}`
  }

  return path
}
