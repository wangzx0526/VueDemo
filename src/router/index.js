import { createRouter, createWebHashHistory } from 'vue-router'
import LoginRegisterView from '../views/LoginRegisterView.vue'
import SystemView from '../views/SystemView.vue'
import UserListView from '../views/system/user/index.vue'
import SystemHomeView from '../views/SystemHomeView.vue'
import SettingsView from '../views/system/setting/index.vue'
import RolesView from '../views/system/role/index.vue'
import DepartmentView from '../views/system/dept/index.vue'
import MenuManagementView from '../views/system/menu/index.vue'

const routes = [
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
        path: 'users',
        name: 'users',
        component: UserListView
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsView
      },
      {
        path: 'roles',
        name: 'roles',
        component: RolesView
      },
      {
        path: 'departments',
        name: 'departments',
        component: DepartmentView
      },
      {
        path: 'menus',
        name: 'menus',
        component: MenuManagementView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

export default router