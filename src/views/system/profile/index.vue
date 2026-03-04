<template>
  <div class="profile-container">
    <el-card class="profile-card" shadow="never">
      <div class="profile-header">
        <el-avatar size="100" :src="avatarUrl" />
        <h2 class="profile-name">{{ userName }}</h2>
        <p class="profile-role">系统管理员</p>
      </div>

      <div class="profile-info">
        <el-descriptions title="用户信息" :column="2" border>
          <el-descriptions-item label="用户名">{{ userName }}</el-descriptions-item>
          <el-descriptions-item label="角色">系统管理员</el-descriptions-item>
          <el-descriptions-item label="邮箱">admin@example.com</el-descriptions-item>
          <el-descriptions-item label="部门">技术部</el-descriptions-item>
          <el-descriptions-item label="创建时间">2024-01-01</el-descriptions-item>
          <el-descriptions-item label="最后登录">2024-03-04</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="profile-actions">
        <el-button type="primary" @click="handleEditProfile">编辑资料</el-button>
        <el-button @click="handleChangePassword">修改密码</el-button>
        <el-button @click="handleLogout">退出登录</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
import { logout } from '@/api/auth'

export default {
  name: 'ProfileView',
  data() {
    return {
      userName: '管理员',
      avatarUrl: 'https://cube.elemecdn.net/0/15/7210400a1cf47217694e26ef32ea4ee1.png'
    }
  },
  methods: {
    handleEditProfile() {
      this.$message.info('编辑资料功能开发中...')
    },
    
    handleChangePassword() {
      this.$message.info('修改密码功能开发中...')
    },
    
    async handleLogout() {
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await logout()
        
        localStorage.removeItem('authToken')
        localStorage.removeItem('systemTabsData')
        
        ElMessage.success('退出登录成功')
        this.$router.push('/')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('退出登录失败:', error)
          localStorage.removeItem('authToken')
          localStorage.removeItem('systemTabsData')
          this.$router.push('/')
        }
      }
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  margin-bottom: 20px;
}

.profile-header {
  text-align: center;
  padding: 30px 0;
  border-bottom: 1px solid #dcdfe6;
  margin-bottom: 30px;
}

.profile-header .el-avatar {
  margin-bottom: 15px;
}

.profile-name {
  margin: 10px 0 5px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.profile-role {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.profile-info {
  margin-bottom: 30px;
}

.profile-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 20px;
  border-top: 1px solid #dcdfe6;
}

:deep(.el-descriptions__label) {
  width: 120px;
}
</style>
