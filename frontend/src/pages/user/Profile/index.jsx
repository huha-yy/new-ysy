import { Card, Avatar, Descriptions, Button, Space } from 'antd'
import { UserOutlined, EditOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { getImageUrl } from '../../../utils/imageUrl'
import './Profile.css'

function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="profile-page">
      <div className="container">
        <Card title="个人中心" className="profile-card">
          <div className="profile-header">
            <Avatar
              size={100}
              src={user?.avatar ? getImageUrl(user.avatar) : null}
              icon={<UserOutlined />}
            />
            <div className="user-info">
              <h2 className="username">{user?.nickname || user?.username}</h2>
              <p className="user-id">ID: {user?.userId}</p>
            </div>
          </div>

          <Descriptions bordered column={1} className="profile-descriptions">
            <Descriptions.Item label="用户名">
              {user?.username}
            </Descriptions.Item>
            <Descriptions.Item label="昵称">
              {user?.nickname || '未设置'}
            </Descriptions.Item>
            <Descriptions.Item label="角色">
              {getRoleText(user?.role)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {user?.status === 1 ? '正常' : '禁用'}
            </Descriptions.Item>
          </Descriptions>

          <div className="profile-actions">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate('/user/profile/edit')}
            >
              编辑资料
            </Button>
            <Button
              icon={<EnvironmentOutlined />}
              onClick={() => navigate('/user/hiking-profile')}
            >
              徒步档案
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

const getRoleText = (role) => {
  const roleMap = {
    0: '普通用户',
    1: '组织者',
    2: '管理员'
  }
  return roleMap[role] || '未知'
}

export default Profile

