import apiClient from './index';

export const getUserMenu = () => {
  return apiClient.get('/system/menu/userMenu');
};

export const getAllMenu = () => {
  return apiClient.get('/system/menu/allMenu');
};
