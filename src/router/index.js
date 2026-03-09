import { createRouter, createWebHashHistory } from 'vue-router'
import LoginRegisterView from '../views/LoginRegisterView.vue'
import SystemView from '../views/SystemView.vue'
import SystemHomeView from '../views/SystemHomeView.vue'
import NotFoundView from '../views/error/404.vue'
import store from '../store'
import ProfileView from '../views/system/profile/index.vue'

export const constantRoutes = [
  {
    path: '/',
    name: 'auth',
    component: LoginRegisterView
  },
  {
    path: '/auth',
    name: 'authentication',
    component: LoginRegisterView
  },
  {
    path: '/system',
    name: 'system',
    component: SystemView,
    children: [
      {
        path: '',
        name: 'system-home',
        component: SystemHomeView
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes: constantRoutes
})

let dynamicRoutesLoaded = false

export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHashHistory(process.env.BASE_URL),
    routes: constantRoutes
  })
  router.options.routes = constantRoutes
  router.matcher = newRouter.matcher
  dynamicRoutesLoaded = false
}

export function addDynamicRoutes(dynamicRoutes) {
  if (!Array.isArray(dynamicRoutes)) {
    console.error('addDynamicRoutes expects an array, got:', typeof dynamicRoutes)
    return
  }

  const systemRoute = router.options.routes.find(r => r.name === 'system')
  const existing = new Set(
    (systemRoute?.children || []).map(child => child.path)
  )

  dynamicRoutes.forEach(route => {
    if (!route || !route.path) {
      return
    }

    if (existing.has(route.path)) {
      return
    }

    router.addRoute('system', route)
    if (systemRoute && Array.isArray(systemRoute.children)) {
      systemRoute.children.push(route)
    }
    existing.add(route.path)
  })
  
  dynamicRoutesLoaded = true
}

async function ensureDynamicRoutesLoaded() {
  if (dynamicRoutesLoaded) {
    return true
  }

  try {
    const [menus] = await Promise.all([
      store.dispatch('menu/generateRoutes'),
      store.dispatch('menu/fetchUserPerms')
    ])
    const dynamicRoutes = await store.dispatch('menu/generateDynamicRoutes')
    addDynamicRoutes(Array.isArray(dynamicRoutes) ? dynamicRoutes : [])
    store.commit('menu/SET_MENUS', Array.isArray(menus) ? menus : [])
    return true
  } catch (error) {
    console.error('Failed to load dynamic routes:', error)
    return false
  }
}

router.beforeEach(async (to) => {
  const token = localStorage.getItem('authToken')
  const isSystemPath = to.path.startsWith('/system')

  if (isSystemPath && !token) {
    return '/auth'
  }

  if (isSystemPath && token) {
    const wasLoaded = dynamicRoutesLoaded
    const loaded = await ensureDynamicRoutesLoaded()
    
    if (!loaded) {
      return '/auth'
    }
    
    if (!wasLoaded) {
      return { path: to.path, query: to.query, hash: to.hash, replace: true }
    }
    return true
  }

  return true
})

export default router
