import { getUserMenu, getUserPerms } from '@/api/menu';

const state = {
  menus: [],
  flatMenuMap: {},
  userPerms: []
};

const mutations = {
  SET_MENUS: (state, menus) => {
    state.menus = menus;
  },
  SET_FLAT_MENU_MAP: (state, flatMenuMap) => {
    state.flatMenuMap = flatMenuMap;
  },
  SET_USER_PERMS: (state, perms) => {
    state.userPerms = perms;
  }
};

const actions = {
  async generateRoutes({ commit }) {
    try {
      const response = await getUserMenu();
      const menus = normalizeMenuTree(extractMenuArray(response));

      commit('SET_MENUS', menus);
      commit('SET_FLAT_MENU_MAP', flattenMenuTree(menus));

      return menus;
    } catch (error) {
      console.error('Failed to generate routes:', error);
      return [];
    }
  },

  async fetchUserPerms({ commit }) {
    try {
      const response = await getUserPerms();
      let perms = [];
      if (Array.isArray(response)) {
        perms = response;
      } else if (response && Array.isArray(response.data)) {
        perms = response.data;
      } else if (response && response.code === 200 && Array.isArray(response.data)) {
        perms = response.data;
      }
      commit('SET_USER_PERMS', perms);
      return perms;
    } catch (error) {
      console.error('Failed to fetch user permissions:', error);
      return [];
    }
  },

  generateDynamicRoutes({ state }) {
    const routes = convertMenusToRoutes(state.menus || []);
    return routes;
  }
};

function convertMenusToRoutes(menus, parentPath = '') {
  const routes = [];

  menus.forEach(menu => {
    if (!isRoutableMenu(menu)) {
      return;
    }

    const fullPath = menu.fullPath || joinPath(parentPath, menu.path);
    const children = Array.isArray(menu.children) ? menu.children : [];
    const childRoutes = convertMenusToRoutes(children, fullPath);

    // Directory nodes only carry children routes.
    if (menu.type === 'DIRECTORY') {
      routes.push(...childRoutes);
      return;
    }

    const routePath = toSystemChildPath(fullPath);
    if (!routePath) {
      return;
    }

    routes.push({
      path: routePath,
      name: normalizeRouteName(`${menu.routeName || menu.name || 'route'}-${routePath}`),
      component: resolveRouteComponent(menu)
    });

    if (childRoutes.length > 0) {
      routes.push(...childRoutes);
    }
  });

  return routes;
}

function flattenMenuTree(menus, parentPath = '') {
  const flatMap = {};

  menus.forEach(menu => {
    const fullPath = menu.fullPath || joinPath(parentPath, menu.path);

    flatMap[fullPath] = menu;

    if (menu.children && menu.children.length > 0) {
      const childMap = flattenMenuTree(menu.children, fullPath);
      Object.assign(flatMap, childMap);
    }
  });

  return flatMap;
}

function extractMenuArray(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.rows)) {
    return response.rows;
  }

  return [];
}

function normalizeMenuTree(menus, parentPath = '') {
  if (!Array.isArray(menus)) {
    return [];
  }

  return menus.map(menu => normalizeMenuNode(menu, parentPath));
}

function normalizeMenuNode(menu, parentPath = '') {
  const path = String(menu.path || '').trim();
  const fullPath = joinPath(parentPath, path);
  const children = normalizeMenuTree(menu.children || [], fullPath);

  return {
    ...menu,
    id: menu.id,
    parentId: menu.parentId,
    name: menu.name || menu.menuName || menu.routeName || path,
    routeName: menu.routeName || menu.name || menu.menuName || path,
    path,
    fullPath,
    component: normalizeComponentPath(menu.component),
    perms: menu.perms || '',
    icon: menu.icon || '',
    type: normalizeMenuType(menu.type || menu.menuType),
    children
  };
}

function normalizeMenuType(typeValue) {
  const raw = String(typeValue || '').toUpperCase();
  if (raw === 'MENU' || raw === 'C') {
    return 'MENU';
  }
  if (raw === 'M' || raw === 'DIR' || raw === 'DIRECTORY') {
    return 'DIRECTORY';
  }
  if (raw === 'F' || raw === 'BUTTON') {
    return 'BUTTON';
  }
  return raw || 'MENU';
}

function normalizeComponentPath(componentPath) {
  const value = String(componentPath || '').trim();
  if (!value) {
    return '';
  }
  return value.replace(/^\//, '').replace(/\.vue$/i, '');
}

function joinPath(parent, child) {
  const normalizedChild = String(child || '').trim();
  const normalizedParent = String(parent || '').trim();

  if (!normalizedChild) {
    return normalizedParent || '/';
  }

  if (isExternalUrl(normalizedChild)) {
    return normalizedChild;
  }

  if (normalizedChild.startsWith('/')) {
    return normalizedChild.replace(/\/{2,}/g, '/');
  }

  if (!normalizedParent || normalizedParent === '/') {
    return `/${normalizedChild}`.replace(/\/{2,}/g, '/');
  }

  return `${normalizedParent}/${normalizedChild}`.replace(/\/{2,}/g, '/');
}

function isExternalUrl(path) {
  return /^(https?:)?\/\//i.test(String(path || '').trim());
}

function isRoutableMenu(menu) {
  return menu.type === 'MENU' || menu.type === 'DIRECTORY';
}

function toSystemChildPath(fullPath) {
  const normalized = String(fullPath || '').trim();
  if (!normalized || normalized === '/') {
    return '';
  }

  if (normalized === '/system') {
    return '';
  }

  if (normalized.startsWith('/system/')) {
    return normalized.slice('/system/'.length);
  }

  return normalized.replace(/^\//, '');
}

function normalizeRouteName(name) {
  return String(name || '')
    .trim()
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveRouteComponent(menu) {
  if (menu.component) {
    return () =>
      import(`@/views/${menu.component}.vue`).catch(error => {
        console.warn(`Failed to load component for menu: ${menu.name}`, error);
        return import('@/views/error/404.vue');
      });
  }

  return () => import('@/views/error/404.vue');
}

const getters = {
  menus: state => state.menus,
  flatMenuMap: state => state.flatMenuMap,
  userPerms: state => state.userPerms,

  permissions: state => {
    if (state.userPerms && state.userPerms.length > 0) {
      return state.userPerms;
    }
    const perms = [];
    Object.values(state.flatMenuMap).forEach(menu => {
      if (menu.perms && menu.perms.trim() !== '') {
        perms.push(menu.perms.trim());
      }
    });
    return perms;
  },

  hasPermission: state => perms => {
    if (!perms || perms === '') return true;

    const userPerms = [];
    Object.values(state.flatMenuMap).forEach(menu => {
      if (menu.perms && menu.perms.trim() !== '') {
        userPerms.push(menu.perms.trim());
      }
    });

    return userPerms.includes(perms.trim());
  },

  getRouteByPath: state => path => {
    return state.flatMenuMap[path] || null;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
