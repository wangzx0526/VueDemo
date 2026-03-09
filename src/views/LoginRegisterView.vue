<template>
  <div class="auth-container">
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    
    <div class="auth-card">
      <div class="card-header">
        <div class="logo">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#gradient1)"/>
            <path d="M20 32L28 40L44 24" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="gradient1" x1="4" y1="4" x2="60" y2="60">
                <stop stop-color="#667eea"/>
                <stop offset="1" stop-color="#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 class="title">Zane Wang的管理系统</h1>
        <p class="subtitle">欢迎回来，请登录您的账户</p>
      </div>

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
        <transition name="fade">
          <div v-if="message" :class="['message', messageType]">
            <svg v-if="messageType === 'success'" class="message-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else class="message-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="message-text">{{ message }}</span>
          </div>
        </transition>

        <div class="form-group">
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              required
              placeholder="请输入用户名"
            />
          </div>
        </div>

        <div class="form-group" v-if="!isLoginMode">
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              placeholder="请输入邮箱地址"
            />
          </div>
        </div>

        <div class="form-group">
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="请输入密码"
            />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L23 23M21 12C21 12 19 8 12 8C10.8 8 9.6843 8.31688 8.75 8.875M7.054 7.053C5.70436 7.82133 4.51955 8.84824 3.524 10.051C-0.407999 14.526 -0.407999 19.475 3.524 23.949C4.855 24.672 6.355 25.123 7.904 25.279M9.88 9.879C9.31512 10.4528 8.89984 11.142 8.67335 11.8961C8.44686 12.6502 8.41587 13.4479 8.58374 14.222C8.75161 14.9961 9.11331 15.7232 9.63537 16.3333C10.1574 16.9434 10.8243 17.4182 11.5737 17.7195C12.3231 18.0208 13.1312 18.1401 13.9238 18.0686M16.622 16.621C17.5997 16.0881 18.4304 15.3041 19.032 14.352C22.964 9.878 22.964 4.929 19.032 0.451C17.701 -0.272 16.201 -0.723 14.652 -0.879M12 17C10.4087 16.954 8.88187 16.3484 7.75674 15.312C6.63161 14.2755 6.00042 12.8794 6 11.401M14.878 9.121C15.2518 9.48261 15.5607 9.92026 15.7839 10.4073C16.0071 10.8943 16.1396 11.4211 16.172 11.956C16.2044 12.4909 16.136 13.0267 15.9721 13.532M12 3C12.6657 3.0046 13.3244 3.13664 13.9238 3.39021M12 3V6M12 18V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="form-group" v-if="!isLoginMode">
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              placeholder="请再次输入密码"
            />
            <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
              <svg v-if="showConfirmPassword" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L23 23M21 12C21 12 19 8 12 8C10.8 8 9.6843 8.31688 8.75 8.875M7.054 7.053C5.70436 7.82133 4.51955 8.84824 3.524 10.051C-0.407999 14.526 -0.407999 19.475 3.524 23.949C4.855 24.672 6.355 25.123 7.904 25.279M9.88 9.879C9.31512 10.4528 8.89984 11.142 8.67335 11.8961C8.44686 12.6502 8.41587 13.4479 8.58374 14.222C8.75161 14.9961 9.11331 15.7232 9.63537 16.3333C10.1574 16.9434 10.8243 17.4182 11.5737 17.7195C12.3231 18.0208 13.1312 18.1401 13.9238 18.0686M16.622 16.621C17.5997 16.0881 18.4304 15.3041 19.032 14.352C22.964 9.878 22.964 4.929 19.032 0.451C17.701 -0.272 16.201 -0.723 14.652 -0.879M12 17C10.4087 16.954 8.88187 16.3484 7.75674 15.312C6.63161 14.2755 6.00042 12.8794 6 11.401M14.878 9.121C15.2518 9.48261 15.5607 9.92026 15.7839 10.4073C16.0071 10.8943 16.1396 11.4211 16.172 11.956C16.2044 12.4909 16.136 13.0267 15.9721 13.532M12 3C12.6657 3.0046 13.3244 3.13664 13.9238 3.39021M12 3V6M12 18V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="form-actions" v-if="isLoginMode">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe">
            <span class="checkmark"></span>
            记住我
          </label>
          <a href="#" class="forgot-password">忘记密码？</a>
        </div>

        <button type="submit" class="submit-button" :disabled="loading">
          <svg v-if="loading" class="spinner" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-dasharray="141" stroke-dashoffset="47"/>
          </svg>
          <span>{{ loading ? '提交中...' : (isLoginMode ? '登 录' : '注 册') }}</span>
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
      messageType: '',
      showPassword: false,
      showConfirmPassword: false,
      rememberMe: false,
      formData: {
        username: 'admin',
        email: '',
        password: '123123',
        confirmPassword: ''
      }
    };
  },
  methods: {
    switchToLogin() {
      this.isLoginMode = true;
      this.clearMessage();
      this.resetForm();
    },
    
    switchToRegister() {
      this.isLoginMode = false;
      this.clearMessage();
      this.resetForm();
    },
    
    resetForm() {
      if (this.isLoginMode) {
        this.formData = {
          username: 'admin',
          email: '',
          password: '123123',
          confirmPassword: ''
        };
      } else {
        this.formData = {
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        };
      }
    },
    
    async submitForm() {
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
        const response = await apiLogin(
          this.formData.username,
          this.formData.password
        );
        
        if (response === null || response === undefined) {
          this.showMessage('用户名或密码错误', 'error');
          return;
        }
        
        let token;
        if (typeof response === 'string') {
          token = response;
        } else if (response.data && typeof response.data === 'string') {
          token = response.data;
        } else if (response.token && typeof response.token === 'string') {
          token = response.token;
        } else {
          this.showMessage('用户名或密码错误', 'error');
          return;
        }
        
        if (token) {
          localStorage.setItem('authToken', token);
          
          localStorage.removeItem('systemTabsData');
          
          this.showMessage('登录成功！', 'success');
          
          this.$router.push('/system');
        } else {
          this.showMessage('用户名或密码错误', 'error');
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    
    async register() {
      try {
        const response = await apiRegister(
          this.formData.username,
          this.formData.email,
          this.formData.password
        );
        
        this.showMessage('注册成功！请登录', 'success');
        
        this.switchToLogin();
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    
    handleErrorMessage(error) {
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        this.showMessage('网络错误：无法连接到服务器，请确认后端服务是否正在运行', 'error');
        return;
      }
      
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
          case 409:
            this.showMessage(`冲突错误：${message}`, 'error');
            break;
          case 500:
            this.showMessage('服务器内部错误，请稍后再试', 'error');
            break;
          default:
            this.showMessage(`请求失败 (${status})：${message}`, 'error');
        }
      } else {
        this.showMessage(`操作失败: ${error.message || '未知错误'}`, 'error');
      }
    },
    
    showMessage(text, type) {
      this.message = text;
      this.messageType = type;
      
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.bg-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: white;
  top: -200px;
  right: -200px;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: white;
  bottom: -100px;
  left: -100px;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.auth-card {
  width: 100%;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  position: relative;
  z-index: 10;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  text-align: center;
  padding: 40px 40px 20px;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px;
}

.subtitle {
  color: #718096;
  font-size: 14px;
  margin: 0;
}

.tabs {
  display: flex;
  background: #f7fafc;
  margin: 0 40px;
  border-radius: 12px;
  padding: 6px;
}

.tab-button {
  flex: 1;
  padding: 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #718096;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #667eea;
}

.tab-button.active {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.auth-form {
  padding: 30px 40px 40px;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 14px;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.message-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.message-text {
  flex: 1;
}

.message.success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #86efac;
}

.message.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.form-group {
  margin-bottom: 22px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  width: 20px;
  height: 20px;
  color: #a0aec0;
  pointer-events: none;
  transition: color 0.3s ease;
}

.input-wrapper:focus-within .input-icon {
  color: #667eea;
}

.input-wrapper input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  background: white;
  transition: all 0.3s ease;
  outline: none;
}

.input-wrapper input::placeholder {
  color: #a0aec0;
}

.input-wrapper input:hover {
  border-color: #cbd5e0;
}

.input-wrapper input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.password-toggle {
  position: absolute;
  right: 12px;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.password-toggle:hover {
  background: #f7fafc;
}

.password-toggle svg {
  width: 20px;
  height: 20px;
  color: #718096;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #4a5568;
}

.remember-me input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remember-me input:checked + .checkmark {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.remember-me input:checked + .checkmark::after {
  content: '';
  width: 10px;
  height: 10px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6L9 17L4 12'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #764ba2;
}

.submit-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 40px 20px;
  color: #a0aec0;
  font-size: 14px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 0 40px 40px;
}

@media (max-width: 768px) {
  .auth-card {
    margin: 20px;
    border-radius: 20px;
  }
  
  .card-header {
    padding: 30px 30px 15px;
  }
  
  .tabs {
    margin: 0 30px;
  }
  
  .auth-form {
    padding: 24px 30px 30px;
  }
  
  .divider {
    padding: 0 30px 16px;
  }
  
  .social-login {
    padding: 0 30px 30px;
  }
}

@media (max-width: 480px) {
  .auth-card {
    margin: 12px;
  }
  
  .logo {
    width: 64px;
    height: 64px;
  }
  
  .title {
    font-size: 24px;
  }
}
</style>
