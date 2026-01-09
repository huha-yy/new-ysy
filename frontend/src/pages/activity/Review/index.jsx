import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Rate, Input, Button, Upload, Switch, message, Modal, Space, Avatar, Popconfirm } from 'antd'
import { StarOutlined, UploadOutlined, UserOutlined, LoadingOutlined } from '@ant-design/icons'
import { submitReview } from '../../../api/activity'
import { uploadImage } from '../../../api/file'
import { getImageUrl } from '../../../utils/imageUrl'
import dayjs from 'dayjs'
import './Review.css'

function Review() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form] = Form.useForm()
  const [uploadedImages, setUploadedImages] = useState([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    // 检查是否有资格评价（从后端获取）
    // 这里模拟一下，实际应该从后端获取
    // 设置表单初始值
    form.setFieldsValue({
      overallRating: 5,
      routeRating: 5,
      organizationRating: 5,
      safetyRating: 5,
      content: '',
      isAnonymous: false
    })
  }, [form, id])

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      // 将图片URL数组转换为逗号分隔的字符串
      // 将布尔值转换为整数（0或1）
      const submitData = {
        ...values,
        images: uploadedImages.join(','),
        isAnonymous: values.isAnonymous ? 1 : 0
      }
      await submitReview(id, submitData)
      message.success('评价提交成功')
      navigate(`/activities/${id}`)
    } catch (error) {
      console.error('评价提交失败:', error)
      message.error('评价提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = async (info) => {
    if (uploadedImages.length >= 6) {
      message.warning('最多上传6张图片')
      return
    }

    // 使用真实上传
    setUploading(true)
    try {
      const result = await uploadImage(info.file)
      const newImages = [...uploadedImages, result.url]
      setUploadedImages(newImages)
      message.success('图片上传成功')
    } catch (error) {
      console.error('图片上传失败:', error)
      message.error('图片上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(newImages)
  }

  const handlePreview = (image) => {
    setPreviewImage(image)
    setPreviewVisible(true)
  }

  const desc = ['非常差', '比较差', '一般', '比较好', '非常好']

  return (
    <div className="review-page">
      <div className="container">
        <Card
          title="💬 活动评价"
          className="review-card"
          extra={
            <Button onClick={() => navigate(`/activities/${id}`)} icon={<StarOutlined />}>
              返回活动
            </Button>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            scrollToFirstError
          >
            {/* 整体评分 */}
            <div className="rating-section">
              <h3 className="section-title">⭐ 整体评分</h3>
              <Form.Item
                label="请为本次徒步活动打分"
                name="overallRating"
                rules={[
                  { required: true, message: '请进行整体评分' }
                ]}
              >
                <Rate 
                  tooltips={desc}
                  allowHalf
                  character={<StarOutlined />}
                  style={{ fontSize: 28 }}
                  className="rating"
                />
              </Form.Item>
            </div>

            {/* 路线评分 */}
            <div className="rating-section">
              <h3 className="section-title">🗺️ 路线评分</h3>
              <Form.Item
                label="路线规划、难度、风景"
                name="routeRating"
                rules={[
                  { required: true, message: '请进行路线评分' }
                ]}
              >
                <Rate 
                  tooltips={desc}
                  allowHalf
                  character={<StarOutlined />}
                  style={{ fontSize: 28 }}
                  className="rating"
                />
              </Form.Item>
            </div>

            {/* 组织评分 */}
            <div className="rating-section">
              <h3 className="section-title">👥 组织评分</h3>
              <Form.Item
                label="组织者专业度、活动安排"
                name="organizationRating"
                rules={[
                  { required: true, message: '请进行组织评分' }
                ]}
              >
                <Rate 
                  tooltips={desc}
                  allowHalf
                  character={<StarOutlined />}
                  style={{ fontSize: 28 }}
                  className="rating"
                />
              </Form.Item>
            </div>

            {/* 安全评分 */}
            <div className="rating-section">
              <h3 className="section-title">🛡️ 安全评分</h3>
              <Form.Item
                label="安全措施、紧急处理"
                name="safetyRating"
                rules={[
                  { required: true, message: '请进行安全评分' }
                ]}
              >
                <Rate 
                  tooltips={desc}
                  allowHalf
                  character={<StarOutlined />}
                  style={{ fontSize: 28 }}
                  className="rating"
                />
              </Form.Item>
            </div>

            {/* 评价内容 */}
            <div className="content-section">
              <h3 className="section-title">💬 评价内容</h3>
              <Form.Item
                label="分享你的徒步体验和建议"
                name="content"
                rules={[
                  { required: true, message: '请输入评价内容' },
                  { min: 10, message: '评价内容至少10个字' },
                  { max: 500, message: '评价内容最多500个字' }
                ]}
              >
                <Input.TextArea
                  placeholder="活动如何？组织者怎么样？路线怎么样？..."
                  rows={4}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </div>

            {/* 图片上传 */}
            <div className="upload-section">
              <h3 className="section-title">📸 添加图片（可选）</h3>
              <div className="upload-list">
                {uploadedImages.map((image, index) => (
                  <div className="upload-item" key={index}>
                    <img
                      src={getImageUrl(image)}
                      alt={`评价图片${index}`}
                      className="upload-preview"
                    />
                    <Popconfirm
                      title="确认删除这张图片？"
                      onConfirm={() => handleImageRemove(index)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                      >
                        删除
                      </Button>
                    </Popconfirm>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handlePreview(getImageUrl(image))}
                    >
                      预览
                    </Button>
                  </div>
                ))}
              </div>
              <Upload
                listType="picture"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleImageChange}
                disabled={uploading}
              >
                <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} disabled={uploading}>
                  {uploading ? '上传中...' : '上传图片'}
                </Button>
              </Upload>
            </div>

            {/* 是否匿名 */}
            <div className="anonymous-section">
              <h3 className="section-title">👤 是否匿名</h3>
              <Form.Item
                name="isAnonymous"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="匿名评价"
                  className="anonymous-switch"
                />
                <span className="anonymous-tip">
                  匿名评价不会显示您的用户名和头像
                </span>
              </Form.Item>
            </div>

            {/* 提交按钮 */}
            <Form.Item className="submit-section">
              <Space size="large" style={{ width: '100%' }}>
                <Button 
                  size="large"
                  onClick={() => navigate(`/activities/${id}`)}
                  icon={<StarOutlined />}
                >
                  取消
                </Button>
                <Button 
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={<StarOutlined />}
                  block
                >
                  提交评价
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* 图片预览模态框 */}
        <Modal
          open={previewVisible}
          title="图片预览"
          footer={[
            <Button key="close" onClick={() => setPreviewVisible(false)}>
              关闭
            </Button>
          ]}
          onCancel={() => setPreviewVisible(false)}
          width={600}
        >
          <img 
            src={previewImage} 
            alt="预览"
            style={{ width: '100%' }}
          />
        </Modal>
      </div>
    </div>
  )
}

export default Review

