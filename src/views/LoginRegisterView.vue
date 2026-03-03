<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="tabs">
        <button 
          :class="['tab-button', { active: isLoginMode }]" 
          @click="switchToLogin"
        >
          登录
        </button>
        <button 
          :class="['tab-button', { active: !isLoginMode }]" 
          @click="switchToRegister"
        >
          注册
        </button>
      </div>

      <form class="auth-form" @submit.prevent="submitForm">
        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>

        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            :placeholder="isLoginMode ? '请输入用户名' : '请输入用户名'"
          />
        </div>

        <div class="form-group" v-if="!isLoginMode">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            placeholder="请输入邮箱地址"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            placeholder="请输入密码"
          />
        </div>

        <div class="form-group" v-if="!isLoginMode">
          <label for="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            required
            placeholder="请再次输入密码"
          />
        </div>

        <button type="submit" class="submit-button" :disabled="loading">
          {{ loading ? '提交中...' : (isLoginMode ? '登录' : '注册') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { login as apiLogin, register as apiRegister } from '@/api/auth';

export default {
  name: 'LoginRegisterView',
  data() {
    return {
      isLoginMode: true,
      loading: false,
      message: '',
      messageType: '', // 'success' or 'error'
      formData: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    };
  },
  methods: {
    switchToLogin() {
      this.isLoginMode = true;
      this.clearMessage();
    },
    
    switchToRegister() {
      this.isLoginMode = false;
      this.clearMessage();
    },
    
    async submitForm() {
      // 验证表单数据
      if (!this.validateForm()) {
        return;
      }

      this.loading = true;
      
      try {
        if (this.isLoginMode) {
          await this.login();
        } else {
          await this.register();
        }
      } catch (error) {
        console.error(error);
        this.handleErrorMessage(error);
      } finally {
        this.loading = false;
      }
    },
    
    validateForm() {
      const { username, password } = this.formData;
      
      if (!username || username.trim() === '') {
        this.showMessage('请输入用户名', 'error');
        return false;
      }
      
      if (!password || password.length < 6) {
        this.showMessage('密码长度至少为6位', 'error');
        return false;
      }
      
      if (!this.isLoginMode) {
        // 注册时的验证
        const { email, confirmPassword } = this.formData;
        
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          this.showMessage('请输入有效的邮箱地址', 'error');
          return false;
        }
        
        if (password !== confirmPassword) {
          this.showMessage('两次输入的密码不一致', 'error');
          return false;
        }
      }
      
      return true;
    },
    
    async login() {
      try {
        // 调用API进行登录
        const response = await apiLogin(
          this.formData.username,
          this.formData.password
        );
        
        // 检查后端返回的数据
        if (response === null || response === undefined) {
          // 登录失败，后端返回null
          this.showMessage('用户名或密码错误', 'error');
          return;
        }
        
        // 检查是否是有效的token字符串
        let token;
        if (typeof response === 'string') {
          // 如果直接返回字符串，则为token
          token = response;
        } else if (response.data && typeof response.data === 'string') {
          // 如果返回的对象中包含字符串类型的data属性
          token = response.data;
        } else if (response.token && typeof response.token === 'string') {
          // 如果返回的对象中包含字符串类型的token属性
          token = response.token;
        } else {
          // 其他情况视为登录失败
          this.showMessage('用户名或密码错误', 'error');
          return;
        }
        
        if (token) {
          // 登录成功
          this.showMessage('登录成功！', 'success');
          
          // 存储用户token
          localStorage.setItem('authToken', token);
          
          // 跳转到系统首页
          this.$router.push('/system');
        } else {
          // 没有获得有效token，登录失败
          this.showMessage('用户名或密码错误', 'error');
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    
    async register() {
      try {
        // 调用API进行注册
        const response = await apiRegister(
          this.formData.username,
          this.formData.email,
          this.formData.password
        );
        
        // 注册成功
        this.showMessage('注册成功！请登录', 'success');
        
        // 注册成功后切换到登录界面
        this.switchToLogin();
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    
    handleErrorMessage(error) {
      // 处理网络错误
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        this.showMessage('网络错误：无法连接到服务器，请确认后端服务是否正在运行', 'error');
        console.log('提示：请确认后端服务是否正在 http://localhost:8999 运行');
        return;
      }
      
      // 处理HTTP错误状态
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || '操作失败';
        
        switch(status) {
          case 401:
            this.showMessage('登录失败：用户名或密码错误', 'error');
            break;
          case 400:
            this.showMessage(`请求错误：${message}`, 'error');
            break;
          case 409: // 可能是用户名或邮箱已存在
            this.showMessage(`冲突错误：${message}`, 'error');
            break;
          case 500:
            this.showMessage('服务器内部错误，请稍后再试', 'error');
            break;
          default:
            this.showMessage(`请求失败 (${status})：${message}`, 'error');
        }
      } else {
        // 其他错误
        this.showMessage(`操作失败: ${error.message || '未知错误'}`, 'error');
      }
    },
    
    showMessage(text, type) {
      this.message = text;
      this.messageType = type;
      
      // 3秒后自动清除消息
      setTimeout(() => {
        this.clearMessage();
      }, 5000);
    },
    
    clearMessage() {
      this.message = '';
      this.messageType = '';
    }
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
  box-sizing: border-box;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  width: 90%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 20px auto;
  min-height: auto;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-button {
  flex: 1;
  padding: 15px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  color: #42b983;
  border-bottom: 2px solid #42b983;
}

.auth-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #42b983;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

.submit-button:hover:not(:disabled) {
  background-color: #359c6d;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.message {
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
  font-size: 14px;
}

.message.success {
  background-color: #dff0d8;
  color: #3c763d;
  border: 1px solid #d6e9c6;
}

.message.error {
  background-color: #f2dede;
  color: #a94442;
  border: 1px solid #ebccd1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .auth-container {
    padding: 10px;
    min-height: 100vh;
    height: auto;
    min-height: 500px; /* 确保在移动设备上也有足够的高度 */
  }
  
  .auth-card {
    width: 100%;
    margin: 10px auto;
  }
  
  .auth-form {
    padding: 15px;
  }
  
  .tab-button {
    padding: 12px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .auth-container {
    padding: 5px;
  }
  
  .auth-form {
    padding: 10px;
  }
  
  .form-group input {
    padding: 8px;
  }
  
  .submit-button {
    padding: 10px;
  }
}
</style>