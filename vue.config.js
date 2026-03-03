const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  devServer: {
    port: 8080,
    proxy: {
      '/': {           
        ws: false, 
        target: 'http://localhost:8999', 
        changeOrigin: true,              
        secure: false,                   
        logLevel: 'debug'                
      }
    },
    // 添加缓存配置以提高编译速度
    hot: true, // 启用热更新
    client: {
      overlay: false, // 禁用浏览器全屏错误覆盖，改为控制台错误
    },
  },
  
  configureWebpack: {
    // 启用模块和chunks的缓存
    cache: {
      type: 'filesystem'
    }
  },
  
  chainWebpack: config => {
    // 优化构建性能
    config.resolve.symlinks(false) // 当有软链接时，设置为false
    
    // 配置babel-loader缓存
    config.module
      .rule('js')
      .use('babel-loader')
      .tap(options => {
        options.cacheDirectory = true
        return options
      })
  }
})