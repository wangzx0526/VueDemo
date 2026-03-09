import apiClient from './index';

export const getUserMenu = () => {
  return apiClient.get('/system/menu/getRouters');
};

export const getUserPerms = () => {
  return apiClient.get('/system/menu/userPerms');
};

export const getAllMenu = () => {
  return apiClient.get('/system/menu/allMenu');
};

export const getMenuTree = () => {
  return apiClient.get('/system/menu/tree');
};

/** 根据 id 获取菜单详情，用于编辑或新增子菜单时获取父菜单 */
export const getMenuById = (id) => {
  return apiClient.get(`/system/menu/${id}`);
};
