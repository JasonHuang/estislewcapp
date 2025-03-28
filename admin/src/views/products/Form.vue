<template>
  <div class="product-form-container">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑产品' : '添加产品' }}</h2>
      <el-button @click="handleCancel">返回</el-button>
    </div>
    
    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="product-form"
      >
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入产品名称" />
        </el-form-item>
        
        <el-form-item label="产品分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择产品分类">
            <el-option 
              v-for="category in categories"
              :key="category._id"
              :label="category.name"
              :value="category._id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="产品价格" prop="price">
          <el-input-number
            v-model="form.price"
            :precision="2"
            :step="0.1"
            :min="0"
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="产品图片" prop="images">
          <el-upload
            :action="uploadAction"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-remove="handleUploadRemove"
            :before-upload="beforeUpload"
            :on-preview="handlePreview"
            :on-change="handleChange"
            name="images"
            multiple
            list-type="picture-card"
            :file-list="fileList"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <el-dialog v-model="dialogImageVisible" title="图片预览">
            <img :src="dialogImageUrl" alt="Preview" style="width: 100%;" />
          </el-dialog>
        </el-form-item>
        
        <el-form-item label="产品规格">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item prop="specifications.material">
                <el-input v-model="form.specifications.material" placeholder="材质" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="specifications.weight">
                <el-input v-model="form.specifications.weight" placeholder="重量" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="specifications.size">
                <el-input v-model="form.specifications.size" placeholder="尺寸" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item prop="specifications.color">
                <el-input v-model="form.specifications.color" placeholder="颜色" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="specifications.purity">
                <el-input v-model="form.specifications.purity" placeholder="纯度" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        
        <el-form-item label="产品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入产品描述"
          />
        </el-form-item>
        
        <el-form-item label="产品状态">
          <el-switch
            v-model="form.isHot"
            active-text="热门"
            inactive-text="普通"
          />
          <el-switch
            v-model="form.isNew"
            active-text="新品"
            inactive-text="常规"
            class="ml-20"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            保存
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';
import { getProduct, createProduct, updateProduct, uploadImages } from '@/api/products';
import { getPublicCategories } from '@/api/categories';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const formRef = ref(null);
const loading = ref(false);
const fileList = ref([]);
const dialogImageVisible = ref(false);
const dialogImageUrl = ref('');
const categories = ref([]);

const isEdit = computed(() => !!route.params.id);
const uploadAction = 'http://localhost:3001/api/upload/multiple';
const baseImageUrl = 'http://localhost:3001';

const form = reactive({
  name: '',
  category: '',
  price: 0,
  images: [],
  description: '',
  specifications: {
    material: '',
    weight: '',
    size: '',
    color: '',
    purity: ''
  },
  isHot: false,
  isNew: true
});

const rules = {
  name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择产品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入产品价格', trigger: 'blur' }
  ],
  images: [
    { required: true, message: '请上传产品图片', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入产品描述', trigger: 'blur' }
  ]
};

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}));

const fetchProduct = async (id) => {
  try {
    const data = await getProduct(id);
    Object.assign(form, data);
    fileList.value = data.images.map(url => ({
      url: url.startsWith('http') ? url : `${baseImageUrl}${url}`,
      name: url.split('/').pop()
    }));
  } catch (error) {
    ElMessage.error('获取产品信息失败');
  }
};

const fetchCategories = async () => {
  try {
    const data = await getPublicCategories();
    categories.value = data;
  } catch (error) {
    ElMessage.error('获取分类列表失败');
  }
};

const handleUploadSuccess = (response) => {
  // 获取新上传的图片路径
  const newImagePaths = response.files.map(file => file.path);
  
  // 合并到现有图片列表中（避免重复）
  newImagePaths.forEach(path => {
    if (!form.images.includes(path)) {
      form.images.push(path);
    }
  });
  
  // 更新fileList用于显示和预览，合并现有的和新上传的
  const newFileList = response.files.map(file => ({
    url: file.path.startsWith('http') ? file.path : `${baseImageUrl}${file.path}`,
    name: file.path.split('/').pop()
  }));
  
  // 合并文件列表（避免显示重复）
  const existingNames = fileList.value.map(file => file.name);
  newFileList.forEach(file => {
    if (!existingNames.includes(file.name)) {
      fileList.value.push(file);
    }
  });
};

const handleUploadRemove = (file) => {
  // 从已有的图片列表中移除被删除的图片
  const filename = file.name;
  const index = form.images.findIndex(path => path.includes(filename));
  if (index > -1) {
    form.images.splice(index, 1);
  }
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

const handlePreview = (file) => {
  dialogImageUrl.value = file.url;
  dialogImageVisible.value = true;
};

const handleChange = (file) => {
  // 处理图片变化时的逻辑
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    loading.value = true;
    
    if (isEdit.value) {
      await updateProduct(route.params.id, form);
      ElMessage.success('更新成功');
    } else {
      await createProduct(form);
      ElMessage.success('创建成功');
    }
    
    router.push('/products');
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '保存失败');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.back();
};

onMounted(() => {
  fetchCategories();
  if (isEdit.value) {
    fetchProduct(route.params.id);
  }
});
</script>

<style scoped>
.product-form-container {
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

.product-form {
  max-width: 800px;
  margin: 0 auto;
}

.ml-20 {
  margin-left: 20px;
}

:deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
  line-height: 120px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 120px;
  height: 120px;
}
</style> 