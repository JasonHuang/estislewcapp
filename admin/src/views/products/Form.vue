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
            <el-option label="戒指" value="戒指" />
            <el-option label="项链" value="项链" />
            <el-option label="手链" value="手链" />
            <el-option label="耳环" value="耳环" />
            <el-option label="手镯" value="手镯" />
            <el-option label="其他" value="其他" />
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
            v-model:file-list="fileList"
            action="/api/upload/multiple"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-remove="handleUploadRemove"
            :before-upload="beforeUpload"
            multiple
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
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
import { getProduct, createProduct, updateProduct } from '@/api/products';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const formRef = ref(null);
const loading = ref(false);
const fileList = ref([]);

const isEdit = computed(() => !!route.params.id);

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
      url,
      name: url.split('/').pop()
    }));
  } catch (error) {
    ElMessage.error('获取产品信息失败');
  }
};

const handleUploadSuccess = (response) => {
  form.images = response.files.map(file => file.path);
};

const handleUploadRemove = (file) => {
  const index = form.images.indexOf(file.url);
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