<template>
  <div class="categories-container">
    <div class="page-header">
      <h2>分类管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>添加分类
      </el-button>
    </div>
    
    <el-card>
      <el-table
        v-loading="loading"
        :data="categories"
        style="width: 100%"
        border
        row-key="_id"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="order" label="排序" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '添加分类'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="form.order" :min="0" />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/categories';
import { Plus } from '@element-plus/icons-vue';

const loading = ref(false);
const dialogVisible = ref(false);
const formRef = ref(null);
const categories = ref([]);
const isEdit = ref(false);
const currentId = ref('');

const form = reactive({
  name: '',
  order: 0,
  isActive: true
});

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  order: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
};

const fetchCategories = async () => {
  loading.value = true;
  try {
    const data = await getCategories();
    categories.value = data;
  } catch (error) {
    ElMessage.error('获取分类列表失败');
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  isEdit.value = false;
  currentId.value = '';
  form.name = '';
  form.order = 0;
  form.isActive = true;
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  isEdit.value = true;
  currentId.value = row._id;
  form.name = row.name;
  form.order = row.order;
  form.isActive = row.isActive;
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除分类"${row.name}"吗？`, '提示', {
      type: 'warning'
    });
    
    await deleteCategory(row._id);
    ElMessage.success('删除成功');
    fetchCategories();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败');
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    loading.value = true;
    
    if (isEdit.value) {
      await updateCategory(currentId.value, form);
      ElMessage.success('更新成功');
    } else {
      await createCategory(form);
      ElMessage.success('创建成功');
    }
    
    dialogVisible.value = false;
    fetchCategories();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '保存失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.categories-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}
</style> 