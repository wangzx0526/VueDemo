import apiClient from './index';

// 用户登录
export const login = (username, password) => {
  return apiClient.post(
    `/system/login?username=${username}&password=${password}`
  );
};

// 用户注册
export const register = (username, email, password) => {
  return apiClient.post('/system/register', {
    username,
    email,
    password
  });
};

// 获取所有用户
export const getAllUsers = () => {
  return apiClient.get('/system/getAllUsers');
};

// 用户登出
export const logout = () => {
  return apiClient.get('/system/logout');
};

// 获取当前用户信息
export const getCurrentUser = () => {
  return apiClient.get('/system/me');
};

// 获取分页用户列表
export const getUserList = (params) => {
  return apiClient.get('/system/user/pagelist', { params });
};

// 获取分页角色列表
export const getRoleList = (params) => {
  return apiClient.get('/system/role/pagelist', { params });
};

// 根据ID获取用户信息
export const getUserById = (userId) => {
  return apiClient.get(`/system/user/${userId}`);
};

// 更新用户信息
export const updateUser = (userData) => {
  return apiClient.post('/system/user/update', userData);
};

// 新增用户
export const addUser = (userData) => {
  return apiClient.post('/system/user/add', userData);
};

// 删除用户
export const deleteUser = (userId) => {
  return apiClient.delete(`/system/user/delete/${userId}`);
};

// 批量删除用户
export const batchDeleteUsers = (ids) => {
  return apiClient.delete('/system/user/batchDelete', { data: ids });
};

// 更新角色信息
export const updateRole = (roleData) => {
  return apiClient.post('/system/role/update', roleData);
};

// 新增角色
export const addRole = (roleData) => {
  return apiClient.post('/system/role/add', roleData);
};

// 删除角色
export const deleteRole = (roleId) => {
  return apiClient.delete(`/system/role/delete/${roleId}`);
};

// 批量删除角色
export const batchDeleteRoles = (ids) => {
  return apiClient.delete('/system/role/batchDelete', { data: ids });
};

// 根据ID获取角色信息
export const getRoleById = (roleId) => {
  return apiClient.get(`/system/role/${roleId}`);
};

// 获取部门列表
export const getDepartmentList = (params) => {
  return apiClient.get('/system/dept/pagelist', { params });
};

// 新增部门
export const addDepartment = (departmentData) => {
  return apiClient.post('/system/dept/add', departmentData);
};

// 更新部门
export const updateDepartment = (departmentData) => {
  return apiClient.post('/system/dept/update', departmentData);
};

// 删除部门
export const deleteDepartment = (departmentId) => {
  return apiClient.delete(`/system/dept/delete/${departmentId}`);
};
