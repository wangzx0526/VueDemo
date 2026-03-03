<template>
  <div class="system-home-container">
    <div class="welcome-section">
      <h2><i class="el-icon-house"></i> 欢迎回来，管理员</h2>
      <p>今天是 {{ currentDate }}，祝您工作愉快！</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon bg-blue">
            <i class="el-icon-user"></i>
          </div>
          <div class="stat-info">
            <p class="stat-title">用户总数</p>
            <p class="stat-value">1,245</p>
          </div>
        </div>
        <div class="stat-trend">
          <el-tag type="success" size="mini">+12%</el-tag>
          <span>较上周</span>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon bg-green">
            <i class="el-icon-office-building"></i>
          </div>
          <div class="stat-info">
            <p class="stat-title">部门总数</p>
            <p class="stat-value">32</p>
          </div>
        </div>
        <div class="stat-trend">
          <el-tag type="success" size="mini">+3</el-tag>
          <span>较上月</span>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon bg-orange">
            <i class="el-icon-suitcase"></i>
          </div>
          <div class="stat-info">
            <p class="stat-title">角色总数</p>
            <p class="stat-value">18</p>
          </div>
        </div>
        <div class="stat-trend">
          <el-tag type="warning" size="mini">0</el-tag>
          <span>较上周</span>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon bg-purple">
            <i class="el-icon-data-analysis"></i>
          </div>
          <div class="stat-info">
            <p class="stat-title">系统访问量</p>
            <p class="stat-value">12,874</p>
          </div>
        </div>
        <div class="stat-trend">
          <el-tag type="success" size="mini">+24%</el-tag>
          <span>较上周</span>
        </div>
      </el-card>
    </div>

    <!-- 通知和公告区域 -->
    <div class="main-content">
      <!-- 左侧通知 -->
      <div class="notifications-section">
        <el-card class="notification-card" shadow="never">
          <template #header>
            <span class="notification-title">事件通知</span>
            <el-link type="primary" :underline="false" class="view-more">查看更多</el-link>
          </template>
          <div class="notification-list">
            <div class="notification-item" v-for="(item, index) in notifications" :key="index">
              <div class="notification-icon" :class="item.iconClass">
                <i :class="item.icon"></i>
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <h4 class="notification-title-text">{{ item.title }}</h4>
                  <span class="notification-time">{{ item.time }}</span>
                </div>
                <p class="notification-desc">{{ item.description }}</p>
                <div class="notification-actions">
                  <el-button size="small" type="primary" plain>查看详情</el-button>
                  <el-button size="small" @click="markAsRead(index)">标记已读</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧公告 -->
      <div class="announcements-section">
        <el-card class="announcement-card" shadow="never">
          <template #header>
            <span class="announcement-title">系统公告</span>
            <el-link type="primary" :underline="false" class="view-more">查看更多</el-link>
          </template>
          <div class="announcement-list">
            <div class="announcement-item" v-for="(item, index) in announcements" :key="index">
              <div class="announcement-badge" :class="item.priorityClass">
                {{ item.priority }}
              </div>
              <div class="announcement-content">
                <h4 class="announcement-title-text">{{ item.title }}</h4>
                <p class="announcement-desc">{{ item.description }}</p>
                <div class="announcement-meta">
                  <span class="announcement-author">{{ item.author }}</span>
                  <span class="announcement-date">{{ item.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemHomeView',
  data() {
    return {
      notifications: [
        { 
          title: '系统更新通知', 
          description: '系统将于今晚22:00-24:00进行维护升级，请提前做好相关准备。', 
          time: '2分钟前', 
          icon: 'el-icon-warning', 
          iconClass: 'orange-bg' 
        },
        { 
          title: '新用户注册', 
          description: '用户张三刚刚注册了新账号，等待管理员审核。', 
          time: '15分钟前', 
          icon: 'el-icon-user', 
          iconClass: 'blue-bg' 
        },
        { 
          title: '权限变更', 
          description: '您对用户李四的权限进行了修改，已生效。', 
          time: '1小时前', 
          icon: 'el-icon-lock', 
          iconClass: 'green-bg' 
        },
        { 
          title: '数据备份完成', 
          description: '系统数据备份任务已完成，备份文件已保存。', 
          time: '3小时前', 
          icon: 'el-icon-folder-checked', 
          iconClass: 'purple-bg' 
        },
        { 
          title: '系统异常警告', 
          description: '检测到数据库连接异常，请及时处理。', 
          time: '5小时前', 
          icon: 'el-icon-error', 
          iconClass: 'red-bg' 
        }
      ],
      announcements: [
        { 
          title: '国庆节放假安排', 
          description: '根据公司安排，国庆节期间（10月1日至10月7日）放假，系统正常使用。', 
          author: '人事部', 
          date: '2023-09-25', 
          priority: '高', 
          priorityClass: 'high-priority' 
        },
        { 
          title: '新功能上线', 
          description: '用户角色权限管理功能已正式上线，欢迎体验并提出宝贵意见。', 
          author: '技术部', 
          date: '2023-09-20', 
          priority: '中', 
          priorityClass: 'medium-priority' 
        },
        { 
          title: '安全提醒', 
          description: '请各位管理员定期更换密码，确保账户安全。', 
          author: '安全部', 
          date: '2023-09-18', 
          priority: '中', 
          priorityClass: 'medium-priority' 
        },
        { 
          title: '培训通知', 
          description: '本周五下午2点将举行系统操作培训，请相关人员准时参加。', 
          author: '培训部', 
          date: '2023-09-15', 
          priority: '低', 
          priorityClass: 'low-priority' 
        }
      ]
    }
  },
  methods: {
    markAsRead(index) {
      // 标记通知为已读的逻辑
      this.notifications.splice(index, 1);
      this.$message.success('已标记为已读');
    }
  },
  computed: {
    currentDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const weekday = weekdays[now.getDay()];
      return `${year}-${month}-${day} ${weekday}`;
    }
  }
}
</script>

<style scoped>
.system-home-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 80px);
}

.welcome-section {
  margin-bottom: 24px;
}

.welcome-section h2 {
  color: #303133;
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.welcome-section p {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.stat-content {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
  font-size: 24px;
}

.bg-blue {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
}

.bg-green {
  background: linear-gradient(135deg, #00b894, #00cec9);
}

.bg-orange {
  background: linear-gradient(135deg, #fdcb6e, #e17055);
}

.bg-purple {
  background: linear-gradient(135deg, #a29bfe, #6c5ce7);
}

.stat-info {
  flex: 1;
}

.stat-title {
  color: #909399;
  font-size: 14px;
  margin: 0 0 4px 0;
}

.stat-value {
  color: #303133;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.stat-trend {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 12px;
}

.stat-trend .el-tag {
  margin-right: 6px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.notification-card, .announcement-card {
  border-radius: 8px;
  overflow: hidden;
}

.notification-card ::v-deep .el-card__header,
.announcement-card ::v-deep .el-card__header {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-title, .announcement-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.view-more {
  font-size: 12px;
}

.notification-list {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
}

.notification-item {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #f4f4f5;
  align-items: flex-start;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  color: white;
  font-size: 16px;
}

.blue-bg {
  background-color: #74b9ff;
}

.green-bg {
  background-color: #00b894;
}

.orange-bg {
  background-color: #fdcb6e;
}

.red-bg {
  background-color: #ff7675;
}

.purple-bg {
  background-color: #a29bfe;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.notification-title-text {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.notification-time {
  color: #909399;
  font-size: 12px;
}

.notification-desc {
  color: #606266;
  font-size: 13px;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.notification-actions {
  display: flex;
  gap: 8px;
}

.announcement-list {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
}

.announcement-item {
  padding: 16px 0;
  border-bottom: 1px solid #f4f4f5;
  position: relative;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-badge {
  position: absolute;
  top: 16px;
  left: 0;
  width: 40px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.high-priority {
  background-color: #f56c6c;
}

.medium-priority {
  background-color: #e6a23c;
}

.low-priority {
  background-color: #909399;
}

.announcement-content {
  margin-left: 50px;
}

.announcement-title-text {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 6px 0;
}

.announcement-desc {
  color: #606266;
  font-size: 13px;
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.announcement-meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
}

@media (max-width: 992px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
```