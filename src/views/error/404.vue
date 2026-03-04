<template>
  <div class="error-404-container">
    <div class="error-404-content">
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>您访问的页面不存在，请检查URL是否正确。</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Error404View',
  methods: {
    goHome() {
      this.$router.push('/system');
    }
  }
}
</script>

<style scoped>
.error-404-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.error-404-content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.error-404-content h1 {
  font-size: 72px;
  color: #409eff;
  margin: 0 0 20px 0;
  font-weight: 700;
}

.error-404-content h2 {
  font-size: 24px;
  color: #606266;
  margin: 0 0 10px 0;
}

.error-404-content p {
  font-size: 14px;
  color: #909399;
  margin: 0 0 30px 0;
}
</style>
