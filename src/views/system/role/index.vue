<template>
  <div class="app-container">
    <el-form
      :model="searchForm"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      @submit.prevent
    >
      <el-form-item label="角色名称" prop="roleName">
        <el-input 
          v-model="searchForm.roleName" 
          placeholder="请输入角色名称"
          clearable
          style="width: 200px"
        ></el-input>
      </el-form-item>
      <el-form-item label="角色标识" prop="roleCode">
        <el-input 
          v-model="searchForm.roleCode" 
          placeholder="请输入角色标识"
          clearable
          style="width: 200px"
        ></el-input>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTimeRange">
        <el-date-picker
          v-model="searchForm.createTimeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select 
          v-model="searchForm.status" 
          placeholder="角色状态"
          clearable
          style="width: 120px;"
        >
          <el-option label="正常" :value="1"></el-option>
          <el-option label="已禁用" :value="0"></el-option>
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
          @click="handleAdd"
          v-hasPermi="['system:role:add']"
        >
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleEdit(singleSelection)"
          v-hasPermi="['system:role:edit']"
        >
          修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleBatchDelete"
          v-hasPermi="['system:role:remove']"
        >
          删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Upload"
          @click="handleImport"
          v-hasPermi="['system:role:import']"
        >
          导入
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:role:export']"
        >
          导出
        </el-button>
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="fetchRoles"
      ></right-toolbar>
    </el-row>
    
    <el-table 
      ref="roleTable"
      :data="roleData" 
      v-loading="loading"
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column label="ID" align="center" prop="id" width="80"></el-table-column>
      <el-table-column label="角色名称" align="center" prop="roleName" min-width="120"></el-table-column>
      <el-table-column label="角色标识" align="center" prop="roleCode" min-width="120"></el-table-column>
      <el-table-column label="排序" align="center" prop="sort" min-width="80"></el-table-column>
      <el-table-column label="状态" align="center" min-width="100">
        <template #default="scope">
          <el-tag 
            :type="scope.row.status === 1 || scope.row.status === undefined ? 'success' : 'danger'" 
            disable-transitions
          >
            {{ scope.row.status === 1 || scope.row.status === undefined ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="150">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['system:role:edit']"
          >
            修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:role:remove']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="paginationTotal > 0"
      :total="paginationTotal"
      v-model:page="currentPage"
      v-model:limit="pageSize"
      @pagination="fetchRoles"
    />
    
    <!-- 编辑角色对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="600px"
      :modal="true"
      :lock-scroll="true"
      :close-on-click-modal="true"
      :append-to-body="true"
    >
      <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色标识" prop="roleCode">
          <el-input v-model="roleForm.roleCode" placeholder="请输入角色标识"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input 
            v-model="roleForm.description" 
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="roleForm.sort" :min="0" :max="999" placeholder="请输入排序值"></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="roleForm.status"
            :active-value="1"
            :inactive-value="0"
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
    
    <!-- 新增角色对话框 -->
    <el-dialog 
      v-model="addDialogVisible" 
      title="新增角色" 
      width="600px"
      :modal="true"
      :lock-scroll="true"
      :close-on-click-modal="true"
      :append-to-body="true"
    >
      <el-form :model="addRoleForm" :rules="roleRules" ref="addRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色标识" prop="roleCode">
          <el-input v-model="addRoleForm.roleCode" placeholder="请输入角色标识"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input 
            v-model="addRoleForm.description" 
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="addRoleForm.sort" :min="0" :max="999" placeholder="请输入排序值"></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="addRoleForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="正常"
            inactive-text="禁用">
          </el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAdd">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getRoleList, updateRole, deleteRole, batchDeleteRoles, addRole } from '@/api/auth';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: 'RolesView',
  data() {
    return {
      roleData: [],
      loading: true,
      showSearch: true,
      searchForm: {
        roleName: '',
        roleCode: '',
        status: '',
        createTimeRange: []
      },
      currentPage: 1,     // 当前页码
      pageSize: 10,       // 每页显示数量
      paginationTotal: 0, // 总数据量
      dialogVisible: false, // 控制编辑对话框显示
      addDialogVisible: false, // 控制新增对话框显示
      dialogTitle: '编辑角色',
      roleForm: {         // 编辑角色表单数据
        id: null,
        roleName: '',
        roleCode: '',
        description: '',
        sort: 1,
        status: 1
      },
      addRoleForm: {      // 新增角色表单数据
        roleName: '',
        roleCode: '',
        description: '',
        sort: 1,
        status: 1
      },
      roleRules: {        // 角色表单验证规则
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        roleCode: [
          { required: true, message: '请输入角色标识', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ]
      },
      currentRole: {},    // 当前操作的角色
      multipleSelection: [], // 多选的角色
      singleSelection: null, // 单选的角色
      single: true, // 单选按钮状态
      multiple: true // 多选按钮状态
    }
  },
  mounted() {
    this.fetchRoles();
  },
  methods: {
    // 获取角色列表
    async fetchRoles() {
      try {
        this.loading = true;
        
        // 准备请求参数
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          roleName: this.searchForm.roleName,
          roleCode: this.searchForm.roleCode,
          status: this.searchForm.status
        };
        
        // 处理时间范围参数
        if (this.searchForm.createTimeRange && Array.isArray(this.searchForm.createTimeRange) && this.searchForm.createTimeRange.length === 2) {
          params.startTime = this.searchForm.createTimeRange[0];
          params.endTime = this.searchForm.createTimeRange[1];
        }
        
        // 过滤掉空字符串、null 和 undefined 参数
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key];
          }
        });

        const response = await getRoleList(params);
        
        // 根据实际返回格式处理数据
        if (response && response.code === 200) {
          // 为每个角色添加默认状态值（如果后端没有返回状态字段）
          this.roleData = (response.records || []).map(role => ({
            ...role,
            status: role.status !== undefined ? role.status : 1  // 默认状态为正常
          }));
          this.paginationTotal = response.total || 0;
        } else {
          console.error('Unexpected response format:', response);
          ElMessage.error('获取角色列表失败');
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        ElMessage.error('获取角色列表失败');
      } finally {
        this.loading = false;
      }
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
    
    // 处理表格选择变化
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
      if (selection.length === 1) {
        this.singleSelection = selection[0];
        this.single = false;
      } else {
        this.singleSelection = null;
        this.single = true;
      }
      this.multiple = !selection.length;
    },
    
    // 搜索
    onSearch() {
      this.currentPage = 1;
      this.fetchRoles();
    },
    
    // 重置
    onReset() {
      this.searchForm = {
        roleName: '',
        roleCode: '',
        status: '',
        createTimeRange: []
      };
      this.currentPage = 1;
      this.fetchRoles();
    },
    
    // 分页变化
    handleCurrentChange(page) {
      this.currentPage = page;
      this.fetchRoles();
    },
    
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.currentPage = 1;
      this.fetchRoles();
    },
    
    // 新增角色
    handleAdd() {
      // 重置表单
      this.addRoleForm = {
        roleName: '',
        roleCode: '',
        description: '',
        sort: 1,
        status: 1
      };
      this.addDialogVisible = true;
    },
    
    // 取消新增
    handleCancelAdd() {
      this.addDialogVisible = false;
    },
    
    // 确认新增
    async confirmAdd() {
      // 验证表单
      if (!this.addRoleForm.roleName || !this.addRoleForm.roleCode) {
        ElMessage.error('请填写完整信息');
        return;
      }
      
      try {
        // 调用API新增角色
        const response = await addRole(this.addRoleForm);
        
        if(response) {
          ElMessage.success('角色新增成功！');
          this.addDialogVisible = false;
          // 重新获取角色列表
          this.fetchRoles();
        } else {
          ElMessage.error('新增角色失败');
        }
      } catch (error) {
        console.error('Failed to add role:', error);
        ElMessage.error('新增角色失败: ' + error.message);
      }
    },
    
    // 编辑角色
    handleEdit(row) {
      this.dialogTitle = '编辑角色';
      this.currentRole = { ...row };
      this.roleForm = { 
        ...row,
        description: row.description || ''  // 确保角色描述字段存在
      };
      this.dialogVisible = true;
    },
    
    // 确认保存
    async confirmSave() {
      // 验证表单
      if (!this.roleForm.roleName || !this.roleForm.roleCode) {
        ElMessage.error('请填写完整信息');
        return;
      }
      
      try {
        // 调用API更新角色信息
        const response = await updateRole(this.roleForm);
        
        if(response) {
          ElMessage.success('角色信息更新成功！');
          this.dialogVisible = false;
          // 重新获取角色列表
          this.fetchRoles();
        } else {
          ElMessage.error('更新角色信息失败');
        }
      } catch (error) {
        console.error('Failed to update role:', error);
        ElMessage.error('更新角色信息失败: ' + error.message);
      }
    },
    
    // 删除角色
    async handleDelete(row) {
      try {
        await ElMessageBox.confirm(
          `此操作将永久删除角色 "${row.roleName}"，是否继续？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        // 调用API删除角色
        const response = await deleteRole(row.id);
        if(response) {
          ElMessage.success('删除成功！');
          // 重新获取角色列表
          this.fetchRoles();
        } else {
          ElMessage.error('删除失败');
        }
      } catch (error) {
        console.error('Failed to delete role:', error);
        if (error !== 'cancel') {
          ElMessage.error('删除失败: ' + error.message);
        }
      }
    },
    
    // 批量删除
    async handleBatchDelete() {
      if (!this.multipleSelection.length) {
        ElMessage.warning('请至少选择一个角色');
        return;
      }
      
      try {
        const roleNames = this.multipleSelection.map(role => role.roleName).join(', ');
        const confirmMsg = `此操作将永久删除以下角色：${roleNames}，是否继续？`;
        await ElMessageBox.confirm(confirmMsg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        // 获取选中角色的ID列表
        const roleIds = this.multipleSelection.map(role => role.id);
        
        // 调用API批量删除角色
        const response = await batchDeleteRoles(roleIds);
        
        if(response) {
          ElMessage.success('批量删除成功！');
          // 清空选择
          this.multipleSelection = [];
          this.singleSelection = null;
          this.single = true;
          this.multiple = true;
          // 重新获取角色列表
          this.fetchRoles();
        } else {
          ElMessage.error('批量删除失败');
        }
      } catch (error) {
        console.error('Failed to batch delete roles:', error);
        if (error !== 'cancel') {
          ElMessage.error('批量删除失败: ' + error.message);
        }
      }
    },
    
    // 导入功能
    handleImport() {
      ElMessage.info('导入功能待实现');
    },
    
    // 导出功能
    handleExport() {
      ElMessage.info('导出功能待实现');
    }
  }
}
</script>

<style scoped>
.role-management-container {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 120px); /* 调整高度，确保分页可见 */
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;  /* 分页右对齐 */
  flex-shrink: 0; /* 防止分页被压缩 */
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

/* 权限树样式 */
:deep(.el-tree) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
}
</style>