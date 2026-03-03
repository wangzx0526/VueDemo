<template>
  <div class="app-container">
    <!-- <h2>用户列表</h2> -->
        
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form" v-show="showSearch" @submit.prevent>
        <el-form-item label="用户名">
          <el-input 
            v-model="searchForm.userName" 
            placeholder="请输入用户名"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="电话号">
          <el-input 
            v-model="searchForm.phone" 
            placeholder="请输入电话号"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select 
            v-model="searchForm.status" 
            placeholder="用户状态"
            clearable
            style="width: 120px;"
          >
            <el-option label="正常" :value="1"></el-option>
            <el-option label="已禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSearch">搜索</el-button>
          <el-button icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 操作按钮栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
        >
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="!singleSelection"
          @click="handleEdit(singleSelection)"
        >
          修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="!multipleSelection.length"
          @click="handleBatchDelete"
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
        >
          导出
        </el-button>
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="fetchUsers"
      ></right-toolbar>
    </el-row>

    <div class="table-and-pagination-wrapper">
      <el-table 
        ref="userTable"
        :data="userData" 
        v-loading="loading"
        stripe
        table-layout="fixed"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80" v-if="false"></el-table-column>
        <el-table-column prop="userName" label="用户名" min-width="100"></el-table-column>
        <el-table-column prop="nickName" label="昵称" min-width="100"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="150"></el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="120"></el-table-column>
        <el-table-column label="状态" min-width="80">
          <template #default="scope">
            <el-tag 
              :type="scope.row.status === 1 ? 'success' : 'danger'" 
              disable-transitions
            >
              {{ scope.row.status === 1 ? '正常' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="140" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleEdit(scope.row)"
            >
              修改
            </el-button>
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <pagination
        v-show="paginationTotal > 0"
        :total="paginationTotal"
        v-model:page="currentPage"
        v-model:limit="pageSize"
        @pagination="fetchUsers"
      />
    </div>
    
    <!-- 编辑用户对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="编辑用户" 
      width="500px"
      :modal="true"
      :lock-scroll="true"
      :close-on-click-modal="true"
      :append-to-body="true"
    >
      <el-form :model="editUserForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.userName" disabled></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editUserForm.nickName"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editUserForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="所属部门">
          <el-tree-select
            v-model="editUserForm.deptId"
            :data="deptTreeData"
            placeholder="请选择所属部门"
            :props="{ value: 'id', label: 'deptName', children: 'children' }"
            check-strictly
            clearable
            filterable
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="editUserForm.roleIds"
            multiple
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roleTreeData"
              :key="role.id"
              :label="role.roleName"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="editUserForm.status"
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
          <el-button type="primary" @click="confirmUpdate">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 新增用户对话框 -->
    <el-dialog 
      v-model="addDialogVisible" 
      title="新增用户" 
      width="500px"
      :modal="true"
      :lock-scroll="true"
      :close-on-click-modal="true"
      :append-to-body="true"
    >
      <el-form :model="addUserForm" :rules="addUserRules" ref="addUserFormRef" label-width="80px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="addUserForm.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="addUserForm.nickName" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addUserForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="所属部门">
          <el-tree-select
            v-model="addUserForm.deptId"
            :data="deptTreeData"
            placeholder="请选择所属部门"
            :props="{ value: 'id', label: 'deptName', children: 'children' }"
            check-strictly
            clearable
            filterable
          />
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select
            v-model="addUserForm.roleIds"
            multiple
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roleTreeData"
              :key="role.id"
              :label="role.roleName"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="passWord">
          <el-input v-model="addUserForm.passWord" type="passWord" placeholder="默认为123456" show-passWord></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="addUserForm.status"
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
import { getUserList, updateUser, deleteUser, getUserById, addUser, batchDeleteUsers } from '@/api/auth';
import apiClient from '@/api/index'; // 导入apiClient

export default {
  name: 'UserListView',
  data() {
    return {
      userData: [],
      loading: true,
      showSearch: true,
      searchForm: {
        userName: '',
        phone: '',
        status: ''
      },
      currentPage: 1,     // 当前页码
      pageSize: 10,       // 每页显示数量
      paginationTotal: 0, // 总数据量
      dialogVisible: false, // 控制编辑对话框显示
      addDialogVisible: false, // 控制新增对话框显示
      editUserForm: {},   // 编辑用户表单数据
      addUserForm: {      // 新增用户表单数据
        userName: '',
        nickName: '',
        phone: '',
        email: '',
        deptId: null,      // 所属部门ID
        roleIds: [],       // 角色ID数组
        passWord: '123456', // 默认密码
        status: 1           // 默认状态为正常
      },
      deptTreeData: [],   // 部门树形数据
      roleTreeData: [],   // 角色数据
      addUserRules: {     // 新增用户表单验证规则
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '请输入昵称', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        passWord: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        roleIds: [
          { required: true, message: '请选择用户角色', trigger: 'change' }
        ]
      },
      currentUser: {},    // 当前操作的用户
      multipleSelection: [], // 多选的用户
      singleSelection: null // 单选的用户
    }
  },
  async mounted() {
    await this.fetchUsers();
    await this.fetchDeptTree();
    await this.fetchRoleData();
  },
  methods: {
    // 处理表格选择变化
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
      if (selection.length === 1) {
        this.singleSelection = selection[0];
      } else {
        this.singleSelection = null;
      }
    },
    
    async fetchUsers() {
      try {
        this.loading = true;
        
        // 准备请求参数
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          ...this.searchForm
        };
        
        // 过滤掉空字符串参数
        Object.keys(params).forEach(key => {
          if (params[key] === '') {
            delete params[key];
          }
        });

        const response = await getUserList(params);
        
        // 根据实际返回格式处理数据
        if (response && response.code === 200) {
          this.userData = response.records || [];
          this.paginationTotal = response.total || 0;
        } else {
          console.error('Unexpected response format:', response);
          this.$message.error('获取用户列表失败');
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        this.$message.error('获取用户列表失败');
      } finally {
        this.loading = false;
      }
    },
    async handleEdit(row) {
      try {
        console.log("正在编辑用户，ID:", row.id); // 添加调试信息
        
        // 根据用户ID获取完整的用户信息
        const userId = row.id;
        const response = await getUserById(userId);
        
        console.log("获取用户信息响应:", response); // 添加调试信息
        
        // 检查响应格式，可能后端API的响应格式不是 {code: 200, data: {...}}
        // 如果直接返回用户信息，则使用整个响应作为用户数据
        let userData;
        if (response && response.code === 200) {
          // 符合预期格式，使用 response.data
          userData = response.data;
        } else if(response && response.id) {
          // 如果响应直接包含用户信息，不需要包装
          userData = response;
        } else {
          console.error('Unexpected response format for getUserById:', response);
          this.$message.error('获取用户信息失败，响应格式异常');
          return;
        }
        
        // 打开编辑对话框并填充当前行的数据
        this.currentUser = row;
        // 确保包含deptId和roleIds字段，并对roleIds进行类型安全处理
        this.editUserForm = { 
          ...userData,
          deptId: userData.deptId || null,  // 确保有部门ID字段
          roleIds: Array.isArray(userData.roleIds) ? userData.roleIds : (userData.roleIds ? [userData.roleIds] : []) // 确保roleIds是数组类型
        };
        this.dialogVisible = true;
      } catch (error) {
        console.error('Failed to get user info:', error);
        console.error('Error details:', error.message, error.response); // 添加更详细的错误信息
        this.$message.error('获取用户信息失败: ' + error.message);
      }
    },
    
    async confirmUpdate() {
      try {
        // 调用API更新用户信息，后端API使用POST方法和/update路径
        const response = await updateUser(this.editUserForm);
        
        // 检查返回值，后端返回Boolean类型
        if(response) {
          this.$message.success('用户信息更新成功！');
          this.dialogVisible = false;
          // 重新获取用户列表
          this.fetchUsers();
        } else {
          this.$message.error('更新用户信息失败');
        }
      } catch (error) {
        console.error('Failed to update user:', error);
        this.$message.error('更新用户信息失败: ' + error.message);
      }
    },
    async handleDelete(row) {
      try {
        // 弹出确认框
        await this.$confirm(`此操作将永久删除用户 "${row.userName}"，是否继续？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        // 调用API删除用户
        const response = await deleteUser(row.id);
        if(response) {
          this.$message.success('删除成功！');
          // 重新获取用户列表
          this.fetchUsers();
        } else {
          this.$message.error('删除失败');
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
        if (error !== 'cancel') { // 如果不是用户取消操作
          this.$message.error('删除失败: ' + error.message);
        }
      }
    },
    // 新增用户
    handleAdd() {
      // 重置表单
      this.addUserForm = {
        userName: '',
        nickName: '',
        phone: '',
        email: '',
        deptId: null,      // 重置部门ID
        roleIds: [],       // 重置角色ID数组
        passWord: '123456', // 默认密码
        status: 1           // 默认状态为正常
      };
      this.addDialogVisible = true;
    },
    // 确认新增用户
    async confirmAdd() {
      // 表单验证
      if (!this.addUserForm.userName || !this.addUserForm.nickName || !this.addUserForm.phone || 
          !this.addUserForm.email || !this.addUserForm.passWord || this.addUserForm.status === undefined) {
        this.$message.error('请填写完整信息');
        return;
      }

      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(this.addUserForm.phone)) {
        this.$message.error('请输入正确的手机号码');
        return;
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.addUserForm.email)) {
        this.$message.error('请输入正确的邮箱地址');
        return;
      }

      try {
        // 调用API新增用户
        const response = await addUser(this.addUserForm);
        
        if(response) {
          this.$message.success('用户新增成功！');
          this.addDialogVisible = false;
          // 重置表单
          this.addUserForm = {
            userName: '',
            nickName: '',
            phone: '',
            email: '',
            deptId: null,      // 重置部门ID
            roleIds: [],       // 重置角色ID数组
            passWord: '123456', // 默认密码
            status: 1           // 默认状态为正常
          };
          // 重新获取用户列表
          this.fetchUsers();
        } else {
          this.$message.error('新增用户失败');
        }
      } catch (error) {
        console.error('Failed to add user:', error);
        this.$message.error('新增用户失败: ' + error.message);
      }
    },
    // 批量删除
    async handleBatchDelete() {
      if (!this.multipleSelection.length) {
        this.$message.warning('请至少选择一个用户');
        return;
      }
      
      try {
        const userNames = this.multipleSelection.map(user => user.userName).join(', ');
        const confirmMsg = `此操作将永久删除以下用户：${userNames}，是否继续？`;
        await this.$confirm(confirmMsg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        // 获取选中用户的ID列表
        const userIds = this.multipleSelection.map(user => user.id);
        
        // 调用API批量删除用户
        const response = await batchDeleteUsers(userIds);
        
        if(response) {
          this.$message.success('批量删除成功！');
          // 清空选择
          this.multipleSelection = [];
          this.singleSelection = null;
          // 重新获取用户列表
          this.fetchUsers();
        } else {
          this.$message.error('批量删除失败');
        }
      } catch (error) {
        console.error('Failed to batch delete users:', error);
        if (error !== 'cancel') { // 如果不是用户取消操作
          this.$message.error('批量删除失败: ' + error.message);
        }
      }
    },
    // 导入功能
    handleImport() {
      this.$message.info('导入功能待实现');
    },
    // 导出功能
    handleExport() {
      this.$message.info('导出功能待实现');
    },
    onSearch() {
      // 重置到第一页并重新获取数据
      this.currentPage = 1;
      this.fetchUsers();
    },
    onReset() {
      // 重置搜索条件
      this.searchForm = {
        userName: '',
        phone: '',
        status: ''
      };
      
      // 重置到第一页并重新获取数据
      this.currentPage = 1;
      this.fetchUsers();
    },
    handleCurrentChange(page) {
      this.currentPage = page;
      this.fetchUsers(); // 重新获取数据
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.currentPage = 1; // 改变每页大小时回到第一页
      this.fetchUsers(); // 重新获取数据
    },
    // 获取部门树形数据
    async fetchDeptTree() {
      try {
        const response = await apiClient.get('/system/dept/tree');
        
        if (response && Array.isArray(response)) {
          // 处理返回的数据，构建树形结构
          this.deptTreeData = this.buildDeptTree(response);
        } else {
          console.error('Unexpected department tree response format:', response);
          this.$message.error('获取部门树形数据失败');
        }
      } catch (error) {
        console.error('Failed to fetch department tree:', error);
        this.$message.error('获取部门树形数据失败: ' + error.message);
      }
    },
    
    // 构建部门树形结构
    buildDeptTree(depts) {
      // 首先创建一个Map来存储所有部门，便于查找
      const deptMap = new Map();
      const rootNodes = [];
      
      // 第一步：将所有部门存入Map
      depts.forEach(dept => {
        deptMap.set(dept.id, { ...dept, children: [] });
      });
      
      // 第二步：构建树形结构
      depts.forEach(dept => {
        const currentDept = deptMap.get(dept.id);
        
        // 如果parentId为0或者为null/undefined，则为根节点
        if (!dept.parentId || dept.parentId === 0) {
          rootNodes.push(currentDept);
        } else {
          // 查找父节点
          const parentDept = deptMap.get(dept.parentId);
          if (parentDept) {
            parentDept.children.push(currentDept);
          } else {
            // 如果找不到父节点，也作为根节点处理
            rootNodes.push(currentDept);
          }
        }
      });
      
      return rootNodes;
    },
    
    // 获取角色数据
    async fetchRoleData() {
      try {
        const response = await apiClient.get('/system/role/tree');
        
        if (response && Array.isArray(response)) {
          this.roleTreeData = response;
        } else {
          console.error('Unexpected role response format:', response);
          this.$message.error('获取角色数据失败');
        }
      } catch (error) {
        console.error('Failed to fetch role data:', error);
        this.$message.error('获取角色数据失败: ' + error.message);
      }
    }
  }
}
</script>

<style scoped>
.user-list-container {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 30px); /* 调整高度，考虑页面边距 */
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

.table-and-pagination-wrapper {
  display: flex;
  flex-direction: column;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  overflow-y: auto;
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

.pagination {
  margin-top: 10px;  /* 减少分页组件的上边距 */
  padding-bottom: 5px;  /* 添加底部内边距确保完全可见 */
  display: flex;
  justify-content: flex-end;  /* 分页右对齐 */
  flex-shrink: 0; /* 防止分页被压缩 */
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
