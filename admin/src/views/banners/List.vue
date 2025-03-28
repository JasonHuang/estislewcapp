<template>
  <div class="banners-container">
    <div class="page-header">
      <h2>轮播图管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>添加轮播图
      </el-button>
    </div>
    
    <el-card>
      <el-table
        v-loading="loading"
        :data="banners"
        style="width: 100%"
        row-key="_id"
        border
        draggable
        @row-dragend="handleDragEnd"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="图片" width="200">
          <template #default="{ row }">
            <el-image
              :src="getFullImageUrl(row.image)"
              :preview-src-list="[getFullImageUrl(row.image)]"
              fit="cover"
              class="banner-image"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="link" label="链接" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
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
      :title="isEdit ? '编辑轮播图' : '添加轮播图'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        
        <el-form-item label="图片" prop="image">
          <el-upload
            :action="uploadAction"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            :on-preview="handlePreview"
            name="image"
            class="banner-uploader"
            :file-list="fileList"
            :limit="1"
          >
            <template v-if="!fileList.length">
              <el-icon class="banner-uploader-icon"><Plus /></el-icon>
            </template>
          </el-upload>
          <el-dialog v-model="previewVisible" title="图片预览">
            <img :src="previewImageUrl" alt="Preview" style="width: 100%;" />
          </el-dialog>
        </el-form-item>
        
        <el-form-item label="链接" prop="link">
          <el-input v-model="form.link" placeholder="请输入链接" />
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
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/store/user';
import { getBanners, createBanner, updateBanner, deleteBanner, updateBannerOrder } from '@/api/banners';

const userStore = useUserStore();
const loading = ref(false);
const dialogVisible = ref(false);
const formRef = ref(null);
const fileList = ref([]);
const banners = ref([]);
const previewVisible = ref(false);
const previewImageUrl = ref('');

const isEdit = ref(false);
const currentId = ref('');
const baseImageUrl = 'http://localhost:3001';

const form = reactive({
  title: '',
  image: '',
  link: '',
  isActive: true
});

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传图片', trigger: 'change' }
  ]
};

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}));

const uploadAction = 'http://localhost:3001/api/upload/single';

const fetchBanners = async () => {
  loading.value = true;
  try {
    const data = await getBanners();
    banners.value = data;
  } catch (error) {
    ElMessage.error('获取轮播图列表失败');
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  isEdit.value = false;
  currentId.value = '';
  form.title = '';
  form.image = '';
  form.link = '';
  form.isActive = true;
  fileList.value = [];
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  isEdit.value = true;
  currentId.value = row._id;
  form.title = row.title;
  form.image = row.image;
  form.link = row.link;
  form.isActive = row.isActive;
  fileList.value = [{
    url: getFullImageUrl(row.image),
    name: row.image.split('/').pop()
  }];
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该轮播图吗？', '提示', {
      type: 'warning'
    });
    
    await deleteBanner(row._id);
    ElMessage.success('删除成功');
    fetchBanners();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const handleUploadSuccess = (response) => {
  form.image = response.file.path;
  fileList.value = [{
    url: getFullImageUrl(response.file.path),
    name: response.file.path.split('/').pop()
  }];
};

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！');
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    loading.value = true;
    
    if (isEdit.value) {
      await updateBanner(currentId.value, form);
      ElMessage.success('更新成功');
    } else {
      await createBanner(form);
      ElMessage.success('创建成功');
    }
    
    dialogVisible.value = false;
    fetchBanners();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '保存失败');
  } finally {
    loading.value = false;
  }
};

const handleDragEnd = async (draggingNode, dropNode) => {
  if (!dropNode) return;
  
  try {
    const orders = banners.value.map((banner, index) => ({
      id: banner._id,
      order: index
    }));
    
    await updateBannerOrder(orders);
    ElMessage.success('排序更新成功');
  } catch (error) {
    ElMessage.error('排序更新失败');
  }
};

const getFullImageUrl = (image) => {
  if (image) {
    return image.startsWith('http') ? image : `${baseImageUrl}${image}`;
  }
  return '';
};

const handlePreview = (file) => {
  previewImageUrl.value = file.url;
  previewVisible.value = true;
};

onMounted(() => {
  fetchBanners();
});
</script>

<style scoped>
.banners-container {
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

.banner-image {
  width: 180px;
  height: 100px;
  border-radius: 4px;
}

.banner-uploader {
  text-align: center;
}

.banner-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.banner-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.banner-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 180px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.banner-preview {
  width: 180px;
  height: 100px;
  display: block;
}

.el-table :deep(.el-table__row) {
  cursor: move;
}

.el-table :deep(.el-table__row.is-dragging) {
  background-color: #f5f7fa;
}
</style>
 