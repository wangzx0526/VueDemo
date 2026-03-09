import store from '@/store';

const permission = {
  mounted(el, binding) {
    const { value } = binding;
    const permissions = store.getters['menu/permissions'] || [];

    if (value && value instanceof Array && value.length > 0) {
      const requiredPermissions = value;
      const hasPermission = requiredPermissions.some(permission => {
        return permissions.includes(permission);
      });

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el);
      }
    } else if (typeof value === 'string' && value.trim() !== '') {
      const hasPermission = permissions.includes(value.trim());
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el);
      }
    } else {
      throw new Error('v-permission 需要传入权限标识，如 v-permission="[\'sys:user:add\']" 或 v-permission="\'sys:user:add\'"');
    }
  }
};

export default permission;
