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
    // 在发送请求之前做些什么，比如添加认证token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    return response.data;
  },
  error => {
    // 对响应错误做点什么
    console.error('API Error:', error);
    
    // 特别处理网络错误
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('Network Error: 请确认后端服务是否正在运行');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;