import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Pagination from './components/Pagination/index.vue'
import RightToolbar from './components/RightToolbar/index.vue'

const resizeObserverLoopError = 'ResizeObserver loop completed with undelivered notifications.'

window.addEventListener('error', (event) => {
  if (event.message === resizeObserverLoopError) {
    event.stopImmediatePropagation()
  }
})

window.addEventListener('unhandledrejection', (event) => {
  if (typeof event.reason === 'string' && event.reason.includes('ResizeObserver loop')) {
    event.stopImmediatePropagation()
  }
})

const app = createApp(App)
app.use(store).use(router).use(ElementPlus)
app.component('Pagination', Pagination)
app.component('RightToolbar', RightToolbar)
app.mount('#app')
