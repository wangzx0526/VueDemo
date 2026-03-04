<template>
  <div class="common-layout">
    <el-container>
      <el-aside :width="sidebarWidth" class="sidebar">
        <div class="logo" v-show="!sidebarCollapsed">
          <span class="logo-text">DD管理系统</span>
        </div>
        <el-menu
          :default-active="activeIndex"
          class="menu"
          :router="false"
          :unique-opened="true"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          collapse-transition="false"
          :collapse="sidebarCollapsed"
        >
          <el-menu-item index="/system" @click="selectTab('system', '首页', '/system')">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          
          <template v-for="menu in dynamicMenus" :key="menu.fullPath || menu.path">
            <el-sub-menu v-if="isMenuGroup(menu)" :index="resolveMenuPath(menu)">
              <template #title>
                <el-icon :is="getMenuIcon(menu.icon)" />
                <span>{{ menu.name }}</span>
              </template>
              <el-menu-item 
                v-for="child in getDisplayChildren(menu)" 
                :key="child.fullPath || child.path" 
                :index="resolveMenuPath(child)"
                @click="selectTab(child.routeName || child.name, child.name, resolveMenuPath(child))"
              >
                <el-icon :is="getMenuIcon(child.icon)" />
                <span>{{ child.name }}</span>
              </el-menu-item>
            </el-sub-menu>
            
            <el-menu-item v-else-if="isMenuItem(menu)" :index="resolveMenuPath(menu)" @click="selectTab(menu.routeName || menu.name, menu.name, resolveMenuPath(menu))">
              <el-icon :is="getMenuIcon(menu.icon)" />
              <span>{{ menu.name }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header class="header">
          <div class="header-content">
            <div class="header-left">
              <el-icon class="collapse-icon" @click="toggleSidebar">
                <component :is="sidebarCollapsed ? 'Expand' : 'Fold'" />
              </el-icon>
              <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item :to="{ path: '/system' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-if="currentParentMenu">{{ currentParentMenu }}</el-breadcrumb-item>
                <el-breadcrumb-item v-if="getCurrentTabTitle !== '首页' && !currentParentMenuIsCurrentTab">{{ getCurrentTabTitle }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="header-actions">
              <el-link href="https://github.com" target="_blank" :underline="false" class="header-icon">
                <el-icon><Platform /></el-icon>
              </el-link>
              <el-link href="https://blog.example.com" target="_blank" :underline="false" class="header-icon">
                <el-icon><Document /></el-icon>
              </el-link>
              <el-dropdown @command="handleUserCommand">
                <div class="user-avatar">
                  <el-avatar size="small" :src="avatarUrl" />
                  <span class="user-name">{{ userName }}</span>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>
        
        <el-main class="main-content">
          <!-- Tabs 标签页 -->
          <div class="tabs-container">
            <el-tabs 
              v-model="activeTab" 
              type="card" 
              closable
              @tab-remove="removeTab"
              @tab-click="handleTabClick"
            >
              <el-tab-pane
                v-for="item in tabsList"
                :key="item.name"
                :label="item.title"
                :name="item.name"
                :closable="item.closable"
              >
                <template #label>
                  <span @contextmenu.prevent="openContextMenu($event, item)">
                    {{ item.title }}
                  </span>
                </template>
              </el-tab-pane>
            </el-tabs>
            
            <!-- 右键菜单 -->
            <div 
              v-show="contextMenuVisible" 
              class="context-menu" 
              :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
              @click.stop
            >
              <ul>
                <li @click="closeCurrentTab">关闭当前标签页</li>
                <li @click="closeOtherTabs">关闭其他标签页</li>
                <li @click="closeAllTabs">关闭全部标签页</li>
              </ul>
            </div>
          </div>
          
          <!-- 分割线 -->
          <!-- <div class="divider-line"></div> -->
          
          <!-- 路由视图 -->
          <div class="content-view">
            <router-view v-slot="{ Component }">
              <keep-alive :include="cachedViews">
                <component :is="Component" :key="$route.fullPath" />
              </keep-alive>
            </router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { Platform, Document, Fold, Expand, House, Setting, Tools, User, List, Avatar, OfficeBuilding, Menu } from '@element-plus/icons-vue'
import { mapActions } from 'vuex'
import { logout } from '@/api/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { resetRouter } from '@/router'

export default {
  name: 'SystemView',
  components: {
    Platform,
    Document,
    Fold,
    Expand,
    House,
    Setting,
    Tools,
    User,
    List,
    Avatar,
    OfficeBuilding,
    Menu
  },
  data() {
    return {
      activeIndex: '/system', // 当前激活的菜单项
      activeTab: 'system',
      tabsList: [
        { title: '首页', name: 'system', route: '/system', closable: false }
      ],
      cachedViews: [], // 缓存的视图组件
      userName: '管理员',
      avatarUrl: 'https://cube.elemecdn.net/0/15/7210400a1cf47217694e26ef32ea4ee1.png', // 默认头像
      sidebarCollapsed: false, // 侧边栏折叠状态
      contextMenuVisible: false, // 右键菜单显示状态
      contextMenuX: 0, // 右键菜单X坐标
      contextMenuY: 0, // 右键菜单Y坐标
      currentTab: null, // 当前右键点击的标签页
      dynamicMenus: [] // 动态菜单数据
    };
  },
  computed: {
    // 获取当前标签页标题
    getCurrentTabTitle() {
      const currentTab = this.tabsList.find(tab => tab.name === this.activeTab);
      return currentTab ? currentTab.title : '首页';
    },
    // 计算侧边栏宽度
    sidebarWidth() {
      return this.sidebarCollapsed ? '64px' : '200px';
    },
    // 获取当前父级菜单名称
    currentParentMenu() {
      const parentMenus = {
        '/system/settings': '系统管理',
        '/system/menus': '系统管理',
        '/system/users': '系统管理',
        '/system/roles': '系统管理',
        '/system/departments': '系统管理'
      };
      return parentMenus[this.activeIndex] || '';
    },
    // 判断父级菜单是否就是当前标签页（例如"用户管理"本身）
    currentParentMenuIsCurrentTab() {
      // 这种情况目前不存在，因为用户管理不是一个独立的标签页
      // 但保留此逻辑以备将来扩展
      return false;
    }
  },
  watch: {
    // 监听路由变化，同步标签页和菜单状态
    '$route'(to) {
      this.updateActiveStates(to.path);
    }
  },
  created() {
    this.restoreTabsFromStorage();
    this.loadUserMenu();
  },
  mounted() {
    // 确保路由变化时更新状态
    this.updateActiveStates(this.$route.path);
  },
  methods: {
    ...mapActions('menu', ['generateRoutes', 'generateDynamicRoutes']),
    
    async loadUserMenu() {
      try {
        const menus = await this.generateRoutes();
        this.dynamicMenus = Array.isArray(menus) ? menus : [];

        const dynamicRoutes = await this.generateDynamicRoutes();
        const routeList = Array.isArray(dynamicRoutes) ? dynamicRoutes : [];

        const { addDynamicRoutes } = await import('@/router');
        addDynamicRoutes(routeList);

        if (this.$route.path !== '/system' && this.$route.name === 'system-home') {
          this.$router.replace(this.$route.fullPath);
        }
      } catch (error) {
        console.error('Failed to load user menu:', error);
      }
    },

    isMenuGroup(menu) {
      if (!menu || !this.isDisplayableMenu(menu)) return false;
      return Array.isArray(menu.children) && menu.children.some(child => this.isDisplayableMenu(child));
    },

    isMenuItem(menu) {
      if (!menu || !this.isDisplayableMenu(menu)) return false;
      return !Array.isArray(menu.children) || menu.children.length === 0;
    },

    getDisplayChildren(menu) {
      if (!menu || !Array.isArray(menu.children)) return [];
      return menu.children.filter(child => this.isDisplayableMenu(child));
    },

    isDisplayableMenu(menu) {
      const type = String(menu.type || '').toUpperCase();
      return type === 'MENU' || type === 'DIRECTORY' || type === 'M' || type === 'C';
    },

    resolveMenuPath(menu) {
      if (!menu) return '/system';
      const rawPath = String(menu.fullPath || menu.path || '').trim();
      if (!rawPath) return '/system';

      if (this.isExternalUrl(rawPath)) {
        return rawPath;
      }

      const normalized = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
      if (normalized === '/system') {
        return '/system';
      }

      if (normalized.startsWith('/system/')) {
        return normalized.replace(/\/{2,}/g, '/');
      }

      return `/system${normalized}`.replace(/\/{2,}/g, '/');
    },

    isExternalUrl(path) {
      return /^(https?:)?\/\//i.test(String(path || '').trim());
    },
    
    getMenuIcon(iconName) {
      if (!iconName) return 'Menu';
      
      const iconMap = {
        'Setting': Setting,
        'Tools': Tools,
        'Menu': Menu,
        'List': List,
        'Avatar': Avatar,
        'OfficeBuilding': OfficeBuilding,
        'User': User,
        'House': House,
        'Document': Document,
        'Platform': Platform,
        'Fold': Fold,
        'Expand': Expand
      };
      
      return iconMap[iconName] || 'Menu';
    },
    
    // 返回标签的显示内容，为当前激活的标签添加白色圆形指示器
    getTabLabel(tab) {
      return tab.title;
    },
    
    // 更新活动状态（菜单和标签页）
    updateActiveStates(currentPath) {
      // 更新活动标签页
      const matchedTab = this.tabsList.find(tab => tab.route === currentPath);
      if (matchedTab) {
        this.activeTab = matchedTab.name;
      }
      
      // 更新活动菜单项
      this.activeIndex = currentPath;
    },
    
    handleMenuSelect(key, keyPath) {
      console.log('Menu selected:', key, keyPath);
    },
    
    selectTab(name, title, route) {
      if (this.isExternalUrl(route)) {
        window.open(route, '_blank', 'noopener,noreferrer');
        return;
      }

      // 检查标签页是否已存在
      const tabExists = this.tabsList.some(tab => tab.name === name);
      
      if (!tabExists) {
        // 添加新的标签页
        this.tabsList.push({
          title: title,
          name: name,
          route: route,
          closable: name !== 'system' // 首页不可关闭
        });
      }
      
      // 更新活动标签页和菜单
      this.activeTab = name;
      this.activeIndex = route;
      
      // 导航到对应路由
      this.$router.push(route);
      
      // 添加到缓存
      if (!this.cachedViews.includes(title)) {
        this.cachedViews.push(title);
      }
      
      // 保存标签页状态到 localStorage
      this.saveTabsToStorage();
    },
    
    handleTabClick(tabPane) {
      // 根据标签页名称找到对应的路由
      const tab = this.tabsList.find(t => t.name === tabPane.paneName);
      if (tab) {
        // 更新活动标签页和菜单
        this.activeTab = tab.name;
        this.activeIndex = tab.route;
        
        // 导航到对应路由
        this.$router.push(tab.route);
      }
    },
    
    removeTab(targetName) {
      // 不允许关闭首页
      if (targetName === 'system') {
        return;
      }
      
      const tabIndex = this.tabsList.findIndex(tab => tab.name === targetName);
      if (tabIndex > -1) {
        // 获取要删除的标签页信息
        const tabToRemove = this.tabsList[tabIndex];
        
        // 从标签列表中移除
        this.tabsList.splice(tabIndex, 1);
        
        // 从缓存中移除
        const cachedIndex = this.cachedViews.indexOf(tabToRemove.title);
        if (cachedIndex > -1) {
          this.cachedViews.splice(cachedIndex, 1);
        }
        
        // 保存标签页状态到 localStorage
        this.saveTabsToStorage();
      }
      
      // 如果关闭的是当前活动标签页，则切换到相邻的标签页
      if (targetName === this.activeTab) {
        if (this.tabsList.length > 0) {
          // 优先切换到被关闭标签的前一个标签，如果没有则切换到后一个
          let nextTab;
          if (tabIndex > 0) {
            // 如果被关闭的标签不是第一个，则切换到前一个
            nextTab = this.tabsList[tabIndex - 1];
          } else if (this.tabsList.length > 0) {
            // 否则切换到剩下的第一个
            nextTab = this.tabsList[0];
          }
          
          if (nextTab) {
            this.activeTab = nextTab.name;
            this.activeIndex = nextTab.route;
            
            // 同时导航到下一个标签对应的路由
            this.$router.push(nextTab.route);
          }
        } else {
          // 如果没有其他标签页了，回到首页
          this.activeTab = 'system';
          this.activeIndex = '/system';
          this.$router.push('/system');
        }
      }
    },
    
    // 切换侧边栏状态
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    
    // 处理用户下拉菜单命令
    handleUserCommand(command) {
      if (command === 'profile') {
        this.$router.push('/system/profile');
      } else if (command === 'logout') {
        this.handleLogout();
      }
    },
    
    // 退出登录
    async handleLogout() {
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        // 调用退出登录API
        await logout();
        
        // 清除token
        localStorage.removeItem('authToken');
        
        // 清除标签页数据
        localStorage.removeItem('systemTabsData');
        resetRouter();
        
        // 显示成功消息
        ElMessage.success('退出登录成功');
        
        // 跳转到登录页
        this.$router.replace('/auth');
      } catch (error) {
        if (error !== 'cancel') {
          console.error('退出登录失败:', error);
          // 即使API调用失败，也清除本地数据并跳转
          localStorage.removeItem('authToken');
          localStorage.removeItem('systemTabsData');
          resetRouter();
          this.$router.replace('/auth');
        }
      }
    },
    
    // 保存标签页状态到 localStorage
    saveTabsToStorage() {
      const tabsData = {
        tabsList: this.tabsList,
        activeTab: this.activeTab,
        activeIndex: this.activeIndex, // 保存当前激活的菜单项
        cachedViews: this.cachedViews
      };
      localStorage.setItem('systemTabsData', JSON.stringify(tabsData));
    },
    
    // 从 localStorage 恢复标签页状态
    restoreTabsFromStorage() {
      const tabsDataStr = localStorage.getItem('systemTabsData');
      if (tabsDataStr) {
        try {
          const tabsData = JSON.parse(tabsDataStr);
          
          // 恢复标签页列表
          this.tabsList = tabsData.tabsList || [
            { title: '首页', name: 'system', route: '/system', closable: false }
          ];
          
          // 恢复活动标签页
          this.activeTab = tabsData.activeTab || 'system';
          
          // 恢复活动菜单项
          this.activeIndex = tabsData.activeIndex || '/system';
          
          // 恢复缓存视图
          this.cachedViews = tabsData.cachedViews || [];
          
          // 如果当前路由不在标签页列表中，需要导航到当前活动标签页对应的路由
          const currentRouteInTabs = this.tabsList.some(tab => tab.route === this.$route.path);
          if (!currentRouteInTabs && this.tabsList.length > 0) {
            const activeTabInfo = this.tabsList.find(tab => tab.name === this.activeTab);
            if (activeTabInfo) {
              this.activeIndex = activeTabInfo.route;
              this.$router.replace(activeTabInfo.route);
            }
          }
        } catch (error) {
          console.error('Failed to restore tabs from storage:', error);
          // 如果解析失败，使用默认值
          this.tabsList = [
            { title: '首页', name: 'system', route: '/system', closable: false }
          ];
          this.activeTab = 'system';
          this.activeIndex = '/system';
          this.cachedViews = [];
        }
      }
    },
    
    // 打开右键菜单
    openContextMenu(event, tab) {
      // 计算相对于整个页面的位置
      this.contextMenuX = event.clientX;
      this.contextMenuY = event.clientY;
      this.currentTab = tab;
      this.contextMenuVisible = true;
      
      // 阻止默认浏览器上下文菜单
      event.preventDefault();
      
      // 监听页面点击事件以关闭右键菜单
      document.addEventListener('click', this.closeContextMenuOnce);
    },
    
    // 用于关闭右键菜单的临时方法
    closeContextMenuOnce() {
      this.contextMenuVisible = false;
      document.removeEventListener('click', this.closeContextMenuOnce);
    },
    
    // 关闭当前标签页
    closeCurrentTab() {
      if (this.currentTab && this.currentTab.name !== 'system') {
        this.removeTab(this.currentTab.name);
      }
      this.closeContextMenuOnce();
    },
    
    // 关闭其他标签页
    closeOtherTabs() {
      this.tabsList = this.tabsList.filter(tab => tab.name === this.currentTab.name || tab.name === 'system');
      
      // 如果当前激活的标签页不在过滤后的列表中，切换到当前右键的标签页
      if (!this.tabsList.some(tab => tab.name === this.activeTab) && this.currentTab.name !== 'system') {
        this.activeTab = this.currentTab.name;
        this.activeIndex = this.currentTab.route;
        this.$router.push(this.currentTab.route);
      } else if (!this.tabsList.some(tab => tab.name === this.activeTab)) {
        // 如果当前激活的标签页不在过滤后的列表中，且右键的也不是首页，则切换到首页
        const homeTab = this.tabsList.find(tab => tab.name === 'system');
        if (homeTab) {
          this.activeTab = 'system';
          this.activeIndex = homeTab.route;
          this.$router.push(homeTab.route);
        }
      }
      
      // 更新缓存视图
      this.cachedViews = this.cachedViews.filter(view => 
        this.tabsList.some(tab => tab.title === view)
      );
      
      this.saveTabsToStorage();
      this.closeContextMenuOnce();
    },
    
    // 关闭全部标签页
    closeAllTabs() {
      // 保留首页标签页
      this.tabsList = [
        { title: '首页', name: 'system', route: '/system', closable: false }
      ];
      
      // 如果当前激活的不是首页，切换到首页
      if (this.activeTab !== 'system') {
        this.activeTab = 'system';
        this.activeIndex = '/system';
        this.$router.push('/system');
      }
      
      // 清空缓存视图
      this.cachedViews = [];
      
      this.saveTabsToStorage();
      this.closeContextMenuOnce();
    }
  }
}
</script>

<style scoped>
.common-layout {
  height: 100vh;
  overflow: hidden;
  background-color: #f0f2f5;
}

:deep(.el-container) {
  height: 100%;
}

.sidebar {
  background-color: #545c64;
  height: 100vh;
  transition: width 0.3s ease; /* 添加过渡动画 */
}

.logo {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
}

.logo-text {
  margin-left: 8px;
}

.menu {
  border-right: none;
  height: calc(100% - 48px); /* 减去logo的高度 */
}

.header {
  padding: 0;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-icon {
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.breadcrumb {
  margin-left: 10px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  font-size: 18px;
  color: #666;
}

.user-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.user-name {
  margin-left: 8px;
  font-size: 14px;
  color: #666;
}

/* 修复 el-dropdown 悬停时的黑色方框问题 */
:deep(.el-dropdown) {
  display: inline-block;
}

:deep(.el-dropdown .el-dropdown-link) {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
}

:deep(.el-dropdown .el-dropdown-link:hover) {
  background-color: transparent;
}

:deep(.el-dropdown-menu__item) {
  padding: 10px 20px;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #ecf5ff;
}

.main-content {
  background-color: #f0f2f5;
  padding: 10px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.tabs-container {
  background-color: #ffffff;
  padding: 10px 10px 15px 10px;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 增强阴影效果 */
  margin-bottom: 5px; /* 添加底部边距 */
  position: relative; /* 添加相对定位 */
  z-index: 1; /* 提升层级 */
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  z-index: 9999;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.context-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.context-menu li {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: background-color 0.2s;
  line-height: 1.5;
}

.context-menu li:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

/* 移除card类型标签页的默认边框 */
:deep(.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  border: none !important;
  border-radius: 0;
}

/* 自定义标签页样式 - RuoYi风格 */
:deep(.el-tabs__nav) {
  display: flex;
  border: none;
  padding: 0 10px;
}

:deep(.el-tabs__item) {
  height: 32px;
  line-height: 32px;
  padding: 0 12px;
  margin-right: 4px;
  border: 1px solid #d8dce5;
  border-radius: 4px 4px 0 0;
  background-color: #fafafa;
  color: #495060;
  font-size: 12px;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  position: relative;
  box-sizing: border-box;
  margin-top: 0;
  margin-bottom: -1px;
  display: inline-block;
}

/* 未激活标签页的样式 */
:deep(.el-tabs__item:not(.is-active)) {
  border: 1px solid #d8dce5;
  border-bottom: 1px solid #d8dce5;
  background-color: #f0f0f0;
  color: #666;
}

/* 鼠标悬停效果 */
:deep(.el-tabs__item:hover) {
  background-color: #e6e6e6;
  color: #409eff;
}

/* 激活的标签页样式 */
:deep(.el-tabs__item.is-active) {
  border: 1px solid #d8dce5;
  border-bottom: 1px solid #fff;
  background-color: #fff;
  color: #409eff;
  font-weight: 600;
  box-shadow: inset 0 2px 3px -1px #0003, inset 0 1px 0 #0000000d;
}

/* 激活标签页底部蓝色高亮边框 */
:deep(.el-tabs__item.is-active)::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background-color: #409eff;
  z-index: 1;
}

/* 激活标签页左侧蓝色竖条 */
:deep(.el-tabs__item.is-active)::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background-color: #409eff;
  border-radius: 3px 0 0 3px;
}

/* 关闭按钮样式 */
:deep(.el-tabs__item .el-icon-close) {
  border-radius: 50%;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  margin-left: 8px;
  width: 16px;
  height: 16px;
  line-height: 16px;
  font-size: 12px;
  vertical-align: middle;
}

:deep(.el-tabs__item .el-icon-close:hover) {
  background-color: #b4bccc;
  color: #fff;
}

:deep(.el-tabs__nav-add) {
  height: 32px;
  line-height: 32px;
}

:deep(.el-tabs__header) {
  margin: 0;
  padding: 5px 0;
  border: none;
}

/* .divider-line {
  height: 8px;
  background-color: #f0f0f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 5px 0;
  border-radius: 2px;
} */

.content-view {
  flex: 1;
  background-color: #ffffff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 8px #f0f1f2;
  min-height: 0;
  overflow: auto;
  position: relative;
  z-index: 0;
}

:deep(.el-tab-pane) {
  height: 100%;
}
</style>
