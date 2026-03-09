import axios from 'axios';

// 创建axios实例，设置基础URL
// 在开发环境中，请求将通过vue.config.js中的代理转发到http://localhost:8999
// 在生产环境中，请求将直接发送到当前域名下的/api端点
const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : '/', // 代理路径
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  },
  // 允许携带认证凭据
  withCredentials: true
});

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么，比如添加认证 token
    const token = localStorage.getItem('authToken');
    if (token) {
      /**
       * Sa-Token 配置：
       * sa-token.token-name = Authorization
       * 且 is-read-header = true
       * 因此这里需要使用 header 名称 Authorization，值为纯 token 字符串（不要加 Bearer 前缀）
       */
      config.headers.Authorization = token;
    }
    console.log('Request sent:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  error => {
    // 对请求错误做些什么
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    console.log('Response received:', response.status, response.data);
    
    // 检查响应体中的业务状态码
    const data = response.data;
    const rawBizCode = data?.code ?? data?.status;
    const bizCode = rawBizCode !== undefined && rawBizCode !== null && rawBizCode !== ''
      ? Number(rawBizCode)
      : undefined;
    const hasBizCode = bizCode !== undefined && !Number.isNaN(bizCode);
    const isBizSuccess = bizCode === 200 || bizCode === 0;

    if (hasBizCode && !isBizSuccess) {
      // 业务状态码不是 200，视为错误
      
      // 401 - 未登录
      if (bizCode === 401) {
        console.error('未登录或登录已过期');
        localStorage.removeItem('authToken');
        localStorage.removeItem('systemTabsData');
        window.location.href = '/auth';
        const error = new Error('Business error');
        error.response = response;
        error.code = bizCode;
        error.message = data.message || '未登录或登录已过期';
        return Promise.reject(error);
      }
      
      // 403 - 无权限
      if (bizCode === 403) {
        console.error('无权限访问:', data.message || 'No permission');
        const error = new Error('Business error');
        error.response = response;
        error.code = bizCode;
        error.message = data.message || '无权限';
        return Promise.reject(error);
      }
      
      // 其他业务错误
      const error = new Error('Business error');
      error.response = response;
      error.code = bizCode;
      error.message = data.message || '请求失败';
      return Promise.reject(error);
    }
    
    return response.data;
  },
  error => {
    // 对响应错误做点什么
    console.error('API Error:', error);
    
    // 处理 HTTP 错误响应
    if (error.response) {
      const { status, data } = error.response;
      
      // 401 - 未登录
      if (status === 401) {
        console.error('未登录或登录已过期');
        // 清除 token 并跳转到登录页
        localStorage.removeItem('authToken');
        localStorage.removeItem('systemTabsData');
        window.location.href = '/auth';
        return Promise.reject(error);
      }
      
      // 403 - 无权限
      if (status === 403) {
        console.error('无权限访问:', data?.message || 'No permission');
        return Promise.reject(error);
      }
      
      // 404 - 资源不存在
      if (status === 404) {
        console.error('请求的资源不存在');
        return Promise.reject(error);
      }
      
      // 500 - 服务器错误
      if (status === 500) {
        console.error('服务器内部错误');
        return Promise.reject(error);
      }
    }
    
    // 特别处理网络错误
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('Network Error: 请确认后端服务是否正在运行');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
