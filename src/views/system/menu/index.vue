<template>
  <div class="app-container">
    <el-form
      :model="searchForm"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      @submit.prevent
    >
      <el-form-item label="菜单名称" prop="menuName">
        <el-input 
          v-model="searchForm.menuName" 
          placeholder="请输入菜单名称"
          clearable
          style="width: 200px"
          @keyup.enter="onSearch"
        ></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select 
          v-model="searchForm.status" 
          placeholder="菜单状态"
          clearable
          style="width: 120px;"
        >
          <el-option label="正常" :value="0"></el-option>
          <el-option label="已禁用" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="onSearch">
          搜索
        </el-button>
        <el-button icon="Refresh" @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd()"
          v-hasPermi="['system:menu:add']"
        >
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Grid"
          @click="toggleExpandAll"
        >
          {{ isExpandAll ? '折叠' : '展开' }}
        </el-button>
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="fetchMenus"
      ></right-toolbar>
    </el-row>

    <div class="table-and-pagination-wrapper">
    <el-table 
      ref="menuTable"
      :data="menuTreeData" 
      v-loading="loading"
      stripe
      :row-key="getRowKey"
      :expand-row-keys="expandedRowKeys"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="menuName" label="菜单名称" min-width="150">
        <template #default="scope">
          <span>{{ scope.row.menuName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" min-width="80"></el-table-column>
      <el-table-column label="状态" min-width="100">
        <template #default="scope">
          <el-tag 
            :type="scope.row.status === 0 ? 'success' : 'danger'" 
            disable-transitions
          >
            {{ scope.row.status === 0 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="150">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="220" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Plus"
            @click="handleAddChild(scope.row)"
            v-hasPermi="['system:menu:add']"
          >
            新增
          </el-button>
          <el-button
            link
            type="success"
            icon="Edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['system:menu:edit']"
          >
            修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:menu:remove']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>
    
    <!-- 编辑/新增菜单对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="600px"
      :modal="true"
      :lock-scroll="true"
      :close-on-click-modal="true"
      :append-to-body="true"
    >
      <el-form :model="menuForm" :rules="menuRules" ref="menuFormRef" label-width="100px">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="menuForm.menuName" placeholder="请输入菜单名称"></el-input>
        </el-form-item>
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="menuForm.parentId"
            :data="menuTreeData"
            placeholder="请选择上级菜单"
            :props="{ value: 'id', label: 'menuName', children: 'children' }"
            check-strictly
            clearable
            filterable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="menuForm.orderNum" :min="0" :max="999" placeholder="请输入排序值"></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="menuForm.status"
            :active-value="0"
            :inactive-value="1"
            active-text="正常"
            inactive-text="禁用">
          </el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSave">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus';
import apiClient from '@/api/index';

export default {
  name: 'MenuManagementView',
  data() {
    return {
      menuData: [],
      menuTreeData: [],
      loading: true,
      showSearch: true,
      searchForm: {
        menuName: '',
        status: ''
      },
      dialogVisible: false, // 控制编辑对话框显示
      dialogTitle: '新增菜单',
      isEdit: false,      // 是否为编辑模式
      parentId: null,     // 父菜单ID
      menuForm: {   // 菜单表单数据
        id: null,
        menuName: '',
        parentId: null,
        orderNum: 1,
        status: 0  // 默认状态为正常(0)
      },
      menuRules: {  // 菜单表单验证规则
        menuName: [
          { required: true, message: '请输入菜单名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ]
      },
      currentMenu: {}, // 当前操作的菜单
      isExpandAll: true,     // 控制表格默认展开
      expandedRowKeys: []    // 存储展开的行的keys
    }
  },
  mounted() {
    this.fetchMenus();
  },
  methods: {
    // 获取菜单列表（扁平 + 条件搜索，使用 /system/menu/list）
    async fetchMenus() {
      try {
        this.loading = true;

        const params = {};
        if (this.searchForm.menuName) {
          params.menuName = this.searchForm.menuName;
        }
        if (this.searchForm.status !== '' && this.searchForm.status !== null && this.searchForm.status !== undefined) {
          params.status = this.searchForm.status;
        }

        const response = await apiClient.get('/system/menu/list', { params });

        if (response) {
          let menuList = [];

          // 兼容后端直接返回 List 或 包一层 data 的情况
          if (Array.isArray(response)) {
            menuList = response;
          } else if (response.hasOwnProperty('data') && Array.isArray(response.data)) {
            menuList = response.data;
          } else {
            ElMessage.error('获取菜单列表失败：返回数据格式不正确');
            return;
          }

          this.menuData = menuList.map(menu => ({
            ...menu,
            status: menu.status !== undefined ? menu.status : 0,
            orderNum: menu.sort
          }));

          this.generateTreeData();
        } else {
          ElMessage.error('获取菜单列表失败');
        }
      } catch (error) {
        console.error('Failed to fetch menus:', error);
        ElMessage.error('获取菜单列表失败');
      } finally {
        this.loading = false;
      }
    },

    // 生成树形数据
    generateTreeData() {
      // 将扁平数据转换为树形结构
      const map = {};
      const roots = [];

      // 创建映射
      this.menuData.forEach(item => {
        // 为每个菜单添加children数组
        item.children = [];
        map[item.id] = item;
      });

      // 构建树形结构
      this.menuData.forEach(item => {
        const parentId = item.parentId;
        // 情况一：根节点（parentId 为空或 0）
        // 情况二：搜索结果只返回了子节点，父节点不在当前列表中，这时也当成根节点显示
        if (parentId === null || parentId === 0 || !map[parentId]) {
          roots.push(item);
        } else {
          map[parentId].children.push(item);
        }
      });

      this.menuTreeData = roots;
      
      // 应用展开状态
      this.applyExpandState();
    },
    
    // 应用展开状态
    applyExpandState() {
      this.$nextTick(() => {
        if (this.isExpandAll) {
          // 展开全部
          this.expandedRowKeys = this.getExpandableIds(this.menuTreeData);
        } else {
          // 折叠全部
          this.expandedRowKeys = [];
        }
      });
    },
    
    // 递归获取所有ID
    getAllIds(data) {
      const ids = [];
      data.forEach(item => {
        ids.push(item.id);
        if (item.children && item.children.length > 0) {
          ids.push(...this.getAllIds(item.children));
        }
      });
      return ids;
    },

    // 获取可以展开节点的ID（即有 children 的行）
    getExpandableIds(data) {
      const ids = [];
      data.forEach(item => {
        if (item.children && item.children.length > 0) {
          ids.push(this.getRowKey(item));
          ids.push(...this.getExpandableIds(item.children));
        }
      });
      return ids;
    },

    // 统一 row-key 类型，避免 number/string 不一致导致 expand-row-keys 匹配失败
    getRowKey(row) {
      return String(row.id);
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },

    // 搜索
    onSearch() {
      this.fetchMenus();
    },

    // 重置
    onReset() {
      this.searchForm = {
        menuName: '',
        status: ''
      };
      this.fetchMenus();
    },
    
    // 新增菜单
    handleAdd(parentId = null) {
      this.isEdit = false;
      this.dialogTitle = '新增菜单';
      this.parentId = parentId;

      // 重置表单
      this.menuForm = {
        id: null,
        menuName: '',
        parentId: parentId || null,
        orderNum: 1,
        status: 1
      };

      this.dialogVisible = true;
    },

    // 新增子菜单
    handleAddChild(menu) {
      this.handleAdd(menu.id);
    },

    // 编辑菜单
    handleEdit(row) {
      this.isEdit = true;
      this.dialogTitle = '编辑菜单';
      this.currentMenu = { ...row };
      this.menuForm = { 
        ...row,
        menuName: row.menuName,
        parentId: row.parentId,
        orderNum: row.sort,  // 将sort映射为orderNum
        status: row.status
      };
      this.dialogVisible = true;
    },

    // 确认保存
    async confirmSave() {
      // 验证表单
      if (!this.menuForm.menuName) {
        ElMessage.error('请输入菜单名称');
        return;
      }

      try {
        let response;
        const formData = { 
          ...this.menuForm,
          sort: this.menuForm.orderNum  // 将orderNum映射为sort
        };
        
        // 清除空值
        if (formData.parentId === null || formData.parentId === '') {
          formData.parentId = 0;
        }

        if (this.isEdit) {
          // 更新菜单
          response = await apiClient.put('/system/menu', formData);
          if (response && (response.code === 200 || response.code === undefined)) {
            ElMessage.success('菜单信息更新成功！');
          } else {
            ElMessage.error(response.msg || '更新菜单信息失败');
            return;
          }
        } else {
          // 新增菜单
          response = await apiClient.post('/system/menu', formData);
          if (response && (response.code === 200 || response.code === undefined)) {
            ElMessage.success('菜单新增成功！');
          } else {
            ElMessage.error(response.msg || '新增菜单失败');
            return;
          }
        }
        
        this.dialogVisible = false;
        // 重新获取菜单列表
        await this.fetchMenus();
      } catch (error) {
        console.error(this.isEdit ? 'Failed to update menu:' : 'Failed to add menu:', error);
        ElMessage.error((this.isEdit ? '更新' : '新增') + '菜单失败: ' + (error.message || '请求异常'));
      }
    },

    // 删除菜单
    async handleDelete(row) {
      try {
        await ElMessageBox.confirm(
          `此操作将永久删除菜单 "${row.menuName}"，是否继续？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        // 调用API删除菜单
        const response = await apiClient.delete(`/system/menu/${row.id}`);
        if (response && (response.code === 200 || response.code === undefined)) {
          ElMessage.success('删除成功！');
          // 重新获取菜单列表
          await this.fetchMenus();
        } else {
          ElMessage.error(response.msg || '删除失败');
        }
      } catch (error) {
        console.error('Failed to delete menu:', error);
        if (error !== 'cancel') {
          ElMessage.error('删除失败: ' + (error.message || '请求异常'));
        }
      }
    },
    
    // 切换展开/折叠全部
    toggleExpandAll() {
      this.isExpandAll = !this.isExpandAll;
      this.applyExpandState();
    }
  }
}
</script>

<style scoped>
.menu-management-container {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 120px); /* 调整高度，确保界面组件可见 */
}

.operation-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.search-form .el-form-item {
  margin-right: 20px;
  margin-bottom: 15px;
}

.search-form .el-form-item:last-child {
  margin-right: 0;
  flex: unset;
  min-width: auto;
}

.search-form .el-form-item:nth-last-child(2) {  /* 状态选择框是倒数第二个元素 */
  margin-right: 20px;
}

.table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.table-container {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.table-container :deep(.el-table) {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

:deep(.el-table) {
  width: 100% !important;
  table-layout: fixed; /* 固定表格布局以提高性能 */
}

:deep(.el-table th),
:deep(.el-table td) {
  white-space: nowrap;
  padding: 8px 0;
  min-width: 0;
}

:deep(.el-table th div),
:deep(.el-table td div) {
  padding: 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-table .cell) {
  word-break: break-word;
  padding-left: 8px;
  padding-right: 8px;
  text-align: center;
}

/* 操作列按钮样式 */
:deep(.el-table .el-table__cell .cell) {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

:deep(.el-table .el-table__cell .cell .el-button) {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
}

:deep(.el-table .el-table__cell .cell .el-button span) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>