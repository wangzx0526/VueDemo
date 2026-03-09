<template>
  <div class="app-container">
    <div class="content-card">    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="部门名称">
          <el-input 
            v-model="searchForm.departmentName" 
            placeholder="请输入部门名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select 
            v-model="searchForm.status" 
            placeholder="部门状态"
            clearable
            style="width: 120px;"
          >
            <el-option label="正常" :value="1"></el-option>
            <el-option label="已禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 操作按钮栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd()" v-permission="'sys:dept:add'">新增</el-button>
      <el-button @click="toggleExpandAll">{{ isExpandAll ? '折叠全部' : '展开全部' }}</el-button>
    </div>

    <div class="table-wrapper">
      <div class="table-container">
        <el-table 
          ref="departmentTable"
          class="list-table"
          :data="departmentTreeData" 
          v-loading="loading"
          stripe
          :row-key="getRowKey"
          :expand-row-keys="expandedRowKeys"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          table-layout="fixed"
          fit
          height="100%"
        >
        <el-table-column prop="deptName" label="部门名称" min-width="150">
          <template #default="scope">
            <span>{{ scope.row.deptName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" label="排序" min-width="80"></el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="scope">
            <el-tag 
              :type="scope.row.status === 1 ? 'success' : 'danger'" 
              disable-transitions
            >
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
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
              size="small"
              type="primary"
              @click="handleAddChild(scope.row)"
              icon="Plus"
              v-permission="'sys:dept:add'"
            >
              新增子部门
            </el-button>
            <el-button
              size="small"
              type="warning"
              @click="handleEdit(scope.row)"
              icon="Edit"
              v-permission="'sys:dept:edit'"
            >
              修改
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
              icon="Delete"
              v-permission="'sys:dept:delete'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
        </el-table>
      </div>      
    </div>
    
    <!-- 编辑/新增部门对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="600px"
      :modal="true"
      :lock-scroll="true"
      :close-on-click-modal="true"
      :append-to-body="true"
    >
      <el-form :model="departmentForm" :rules="departmentRules" ref="departmentFormRef" label-width="100px">
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="departmentForm.deptName" placeholder="请输入部门名称"></el-input>
        </el-form-item>
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="departmentForm.parentId"
            :data="departmentTreeData"
            placeholder="请选择上级部门"
            :props="{ value: 'id', label: 'deptName', children: 'children' }"
            check-strictly
            clearable
            filterable
          />
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="departmentForm.orderNum" :min="0" :max="999" placeholder="请输入排序值"></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="departmentForm.status"
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
    </div>
  </div>
</template>

<script>
import { getDepartmentList, addDepartment, updateDepartment, deleteDepartment } from '@/api/auth';
import apiClient from '@/api/index'; // 导入apiClient

export default {
  name: 'DepartmentView',
  data() {
    return {
      departmentData: [],      // 原始完整数据
      fullDepartmentData: [],  // 用于搜索重置的完整数据
      departmentTreeData: [],
      loading: true,
      searchForm: {
        departmentName: '',
        status: ''
      },
      dialogVisible: false, // 控制编辑对话框显示
      dialogTitle: '新增部门',
      isEdit: false,      // 是否为编辑模式
      parentId: null,     // 父部门ID
      departmentForm: {   // 部门表单数据
        id: null,
        deptName: '',
        parentId: null,
        orderNum: 1,
        status: 1
      },
      departmentRules: {  // 部门表单验证规则
        deptName: [
          { required: true, message: '请输入部门名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ]
      },
      currentDepartment: {}, // 当前操作的部门
      isExpandAll: true,     // 控制表格默认展开
      expandedRowKeys: []    // 存储展开的行的keys
    }
  },
  mounted() {
    this.fetchDepartments();
  },
  methods: {
    // 获取部门列表（扁平 + 条件搜索，使用 /system/dept/list）
    async fetchDepartments() {
      try {
        this.loading = true;

        const params = {};
        if (this.searchForm.departmentName) {
          // 后端参数名为 deptName，这里做一次映射
          params.deptName = this.searchForm.departmentName;
        }
        if (this.searchForm.status !== '' && this.searchForm.status !== null && this.searchForm.status !== undefined) {
          params.status = this.searchForm.status;
        }

        const response = await apiClient.get('/system/dept/list', { params });

        console.log('Dept API Response:', response);

        // 根据实际返回格式处理数据
        if (response) {
          let departmentList = [];

          // 兼容多种返回结构：List<SysDeptVo> / { data: List } / { data: { records } } / { records: [] }
          if (Array.isArray(response)) {
            departmentList = response;
          } else if (response.hasOwnProperty('data')) {
            if (Array.isArray(response.data)) {
              departmentList = response.data;
            } else if (response.data && Array.isArray(response.data.records)) {
              departmentList = response.data.records;
            }
          } else if (response.hasOwnProperty('records') && Array.isArray(response.records)) {
            departmentList = response.records;
          }

          if (!Array.isArray(departmentList)) {
            console.error('Unexpected dept response format:', response);
            this.$message.error('获取部门列表失败：返回数据格式不正确');
            return;
          }

          this.departmentData = departmentList.map(dept => ({
            ...dept,
            status: dept.status !== undefined ? dept.status : 1  // 默认状态为正常
          }));

          this.generateTreeData();
        } else {
          console.error('Unexpected response format:', response);
          this.$message.error('获取部门列表失败');
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        this.$message.error('获取部门列表失败');
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
      this.departmentData.forEach(item => {
        // 为每个部门添加children数组
        item.children = [];
        map[item.id] = item;
      });

      // 构建树形结构
      this.departmentData.forEach(item => {
        const parentId = item.parentId;
        // 情况一：根节点（parentId 为空或 0）
        // 情况二：搜索结果只返回了子节点，父节点不在当前列表中，这时也当成根节点显示
        if (parentId === null || parentId === 0 || !map[parentId]) {
          roots.push(item);
        } else {
          map[parentId].children.push(item);
        }
      });

      this.departmentTreeData = roots;
      
      // 应用展开状态
      this.applyExpandState();
    },
    
    // 应用展开状态
    applyExpandState() {
      this.$nextTick(() => {
        if (this.isExpandAll) {
          // 展开全部
          this.expandedRowKeys = this.getExpandableIds(this.departmentTreeData);
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

    // 根据当前 isExpandAll 状态同步 expandedRowKeys

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


    // 搜索：直接调用后端查询
    onSearch() {
      this.fetchDepartments();
    },

    // 重置：清空条件并重新查询
    onReset() {
      this.searchForm = {
        departmentName: '',
        status: ''
      };
      this.fetchDepartments();
    },
    
    // 新增部门
    handleAdd(parentId = null) {
      this.isEdit = false;
      this.dialogTitle = '新增部门';
      this.parentId = parentId;

      // 重置表单
      this.departmentForm = {
        id: null,
        deptName: '',
        parentId: parentId || null,
        orderNum: 1,
        status: 1
      };

      this.dialogVisible = true;
    },

    // 新增子部门
    handleAddChild(department) {
      this.handleAdd(department.id);
    },

    // 编辑部门
    handleEdit(row) {
      this.isEdit = true;
      this.dialogTitle = '编辑部门';
      this.currentDepartment = { ...row };
      this.departmentForm = { ...row };
      this.dialogVisible = true;
    },

    // 确认保存
    async confirmSave() {
      // 验证表单
      if (!this.departmentForm.deptName) {
        this.$message.error('请输入部门名称');
        return;
      }

      try {
        let response;
        const formData = { ...this.departmentForm };
        
        // 清除空值
        if (formData.parentId === null || formData.parentId === '') {
          formData.parentId = 0;
        }

        if (this.isEdit) {
          // 更新部门
          response = await updateDepartment(formData);
          if (response && (response.code === 200 || response.code === undefined)) {
            this.$message.success('部门信息更新成功！');
          } else {
            this.$message.error(response.msg || '更新部门信息失败');
            return;
          }
        } else {
          // 新增部门
          response = await addDepartment(formData);
          if (response && (response.code === 200 || response.code === undefined)) {
            this.$message.success('部门新增成功！');
          } else {
            this.$message.error(response.msg || '新增部门失败');
            return;
          }
        }
        
        this.dialogVisible = false;
        // 重新获取部门列表
        await this.fetchDepartments();
      } catch (error) {
        console.error(this.isEdit ? 'Failed to update department:' : 'Failed to add department:', error);
        this.$message.error((this.isEdit ? '更新' : '新增') + '部门失败: ' + (error.message || '请求异常'));
      }
    },

    // 删除部门
    async handleDelete(row) {
      try {
        await this.$confirm(`此操作将永久删除部门 "${row.deptName}"，是否继续？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        // 调用API删除部门
        const response = await deleteDepartment(row.id);
        if (response && (response.code === 200 || response.code === undefined)) {
          this.$message.success('删除成功！');
          // 重新获取部门列表
          await this.fetchDepartments();
        } else {
          this.$message.error(response.msg || '删除失败');
        }
      } catch (error) {
        console.error('Failed to delete department:', error);
        if (error !== 'cancel') {
          this.$message.error('删除失败: ' + (error.message || '请求异常'));
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
/* 外层 content-view 背景 */
.app-container {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
  background: linear-gradient(180deg, #f8fafc 0%, #f3f6fb 100%);
}

/* 搜索 + 按钮 + 表格 一张卡片 */
.content-card {
  background: #fff;
  border: 1px solid #edf1f7;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

/* 搜索区域平铺 */
.search-bar {
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

/* 按钮行贴着搜索，不再卡片 */
.operation-bar {
  margin: 0;
  padding: 0;
  display: flex;
  gap: 10px;
  background: transparent;
  border: none;
  box-shadow: none;
}

/* 表格区域占满剩余空间 */
.table-wrapper {
  flex: 1;
  padding: 0;
  min-height: 0;
  overflow: hidden;
}

/* 表格保留圆角 */
:deep(.el-table) {
  border-radius: 10px;
  overflow: hidden;
}

.operation-bar {
  margin-bottom: 0;
  padding: 12px 16px;
}

.search-bar {
  margin-bottom: 0;
  padding: 14px 16px 2px;
}

.table-wrapper {
  padding: 10px 12px;
}

:deep(.el-table) {
  border-radius: 10px;
  overflow: hidden;
}

:deep(.el-button) {
  border-radius: 8px;
}

:deep(.el-button > span) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  line-height: 1;
}

:deep(.el-button .el-icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
