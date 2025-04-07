<template>
  <div class="about-form-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>关于我们设置</span>
        </div>
      </template>

      <el-form
        :model="formData"
        :rules="rules"
        ref="formRef"
        label-width="120px"
        v-loading="loading"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <!-- 公司名称 -->
            <el-form-item label="公司名称" prop="companyName">
              <el-input v-model="formData.companyName" />
            </el-form-item>

            <!-- Logo -->
            <el-form-item label="Logo" prop="logo">
              <el-upload
                class="avatar-uploader"
                :action="uploadAction"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="handleLogoSuccess"
                :on-error="handleLogoError"
                :before-upload="beforeAvatarUpload"
                name="image"
              >
                <img v-if="formData.logo" :src="logoUrl" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="upload-tip">
                建议上传正方形图片，尺寸不小于200x200像素<br>
                支持jpg、png、gif等格式，大小不超过2MB
              </div>
            </el-form-item>

            <!-- 公司简介 -->
            <el-form-item label="公司简介" prop="intro">
              <el-input
                v-model="formData.intro"
                type="textarea"
                :rows="4"
                placeholder="请输入公司简介"
              />
            </el-form-item>

            <!-- 企业愿景 -->
            <el-form-item label="企业愿景" prop="vision">
              <el-input
                v-model="formData.vision"
                type="textarea"
                :rows="3"
                placeholder="请输入企业愿景"
              />
            </el-form-item>

            <!-- 核心价值观 -->
            <el-form-item label="核心价值观">
              <div v-for="(value, index) in formData.values" :key="index" class="value-item">
                <el-input v-model="formData.values[index]" placeholder="例如：品质至上：严选材料，精工细作" />
                <el-button type="danger" icon="Delete" @click="removeValue(index)" />
              </div>
              <el-button type="primary" icon="Plus" @click="addValue">添加价值观</el-button>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="我的团队" name="team">
            <div v-for="(member, index) in formData.team" :key="index" class="team-member">
              <el-divider v-if="index > 0" />
              
              <div class="member-header">
                <h3>团队成员 #{{ index + 1 }}</h3>
                <el-button 
                  type="danger" 
                  size="small" 
                  icon="Delete" 
                  @click="removeMember(index)"
                >删除</el-button>
              </div>
              
              <!-- 成员姓名 -->
              <el-form-item :label="'姓名'" :prop="`team[${index}].name`" :rules="rules.memberName">
                <el-input v-model="member.name" placeholder="请输入成员姓名" />
              </el-form-item>
              
              <!-- 成员职位 -->
              <el-form-item :label="'职位'" :prop="`team[${index}].position`" :rules="rules.memberPosition">
                <el-input v-model="member.position" placeholder="请输入成员职位" />
              </el-form-item>
              
              <!-- 成员照片 -->
              <el-form-item :label="'照片'">
                <el-upload
                  class="avatar-uploader"
                  :action="uploadAction"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="(res) => handleMemberPhotoSuccess(res, index)"
                  :on-error="handleLogoError"
                  :before-upload="beforeAvatarUpload"
                  name="image"
                >
                  <img 
                    v-if="member.photo" 
                    :src="getMemberPhotoUrl(member.photo)" 
                    class="avatar" 
                  />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div class="upload-tip">
                  建议上传正方形照片，尺寸不小于200x200像素
                </div>
              </el-form-item>
              
              <!-- 成员简介 -->
              <el-form-item :label="'个人简介'">
                <el-input
                  v-model="member.intro"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入成员简介"
                />
              </el-form-item>
            </div>
            
            <div class="add-member">
              <el-button type="primary" icon="Plus" @click="addMember">添加团队成员</el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="联系信息" name="contact">
            <!-- 地址 -->
            <el-form-item label="地址" prop="address">
              <el-input v-model="formData.address" placeholder="请输入公司地址" />
            </el-form-item>

            <!-- 电话 -->
            <el-form-item label="电话" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入联系电话" />
            </el-form-item>

            <!-- 邮箱 -->
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入电子邮箱" />
            </el-form-item>

            <!-- 微信 -->
            <el-form-item label="微信" prop="wechat">
              <el-input v-model="formData.wechat" placeholder="请输入微信号" />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>

        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import { getAboutInfo, updateAboutInfo } from '@/api/about';
import { getToken } from '@/utils/auth';

const activeTab = ref('basic');
const loading = ref(false);
const formRef = ref(null);

// 表单数据
const formData = reactive({
  companyName: '',
  logo: '',
  intro: '',
  vision: '',
  values: [],
  team: [],
  address: '',
  phone: '',
  email: '',
  wechat: ''
});

// 表单验证规则
const rules = {
  companyName: [
    { required: true, message: '请输入公司名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度应在2到50个字符之间', trigger: 'blur' }
  ],
  intro: [
    { required: true, message: '请输入公司简介', trigger: 'blur' }
  ],
  vision: [
    { required: true, message: '请输入企业愿景', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入公司地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  memberName: [
    { required: true, message: '请输入成员姓名', trigger: 'blur' }
  ],
  memberPosition: [
    { required: true, message: '请输入成员职位', trigger: 'blur' }
  ]
};

// 上传相关
const uploadAction = computed(() => {
  const url = 'http://localhost:3001/api/upload/single';
  console.log('上传地址:', url);
  return url;
});
const uploadHeaders = computed(() => {
  const token = getToken();
  console.log('上传使用的token:', token);
  return {
    Authorization: `Bearer ${token}`
  };
});
const logoUrl = computed(() => {
  console.log('原始logo路径:', formData.logo);
  if (formData.logo && formData.logo.startsWith('http')) {
    return formData.logo;
  } else if (formData.logo && formData.logo.startsWith('/uploads/')) {
    // 使用localhost，而不是Docker容器名
    return `http://localhost:3001${formData.logo}`;
  }
  return '';
});

// 获取团队成员照片URL
const getMemberPhotoUrl = (photo) => {
  if (photo && photo.startsWith('http')) {
    return photo;
  } else if (photo && photo.startsWith('/uploads/')) {
    return `http://localhost:3001${photo}`;
  }
  return '';
};

// 加载数据
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await getAboutInfo();
    console.log('获取到的数据:', response);
    Object.assign(formData, response);
    
    // 确保values是数组
    if (!formData.values || !Array.isArray(formData.values)) {
      formData.values = [];
    }
    
    // 确保team是数组
    if (!formData.team || !Array.isArray(formData.team)) {
      formData.team = [];
    }
  } catch (error) {
    ElMessage.error('获取关于我们信息失败');
    console.error('获取数据错误:', error);
  } finally {
    loading.value = false;
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    loading.value = true;
    await updateAboutInfo(formData);
    ElMessage.success('保存成功');
  } catch (error) {
    ElMessage.error('保存失败：' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  fetchData();
};

// 添加价值观
const addValue = () => {
  formData.values.push('');
};

// 删除价值观
const removeValue = (index) => {
  formData.values.splice(index, 1);
};

// 添加团队成员
const addMember = () => {
  formData.team.push({
    name: '',
    position: '',
    photo: '',
    intro: ''
  });
};

// 删除团队成员
const removeMember = (index) => {
  formData.team.splice(index, 1);
};

// 处理团队成员照片上传成功
const handleMemberPhotoSuccess = (response, index) => {
  console.log('成员照片上传成功，响应:', response);
  if (response && response.file && response.file.path) {
    formData.team[index].photo = response.file.path;
    ElMessage.success('照片上传成功');
  } else if (response && response.file && response.file.url) {
    formData.team[index].photo = response.file.url;
    ElMessage.success('照片上传成功');
  } else {
    ElMessage.warning('上传成功但返回的数据格式不正确');
    console.error('上传响应格式:', response);
  }
};

// 处理Logo上传成功
const handleLogoSuccess = (response) => {
  console.log('上传成功，响应:', response);
  if (response && response.file && response.file.path) {
    formData.logo = response.file.path;
    ElMessage.success('Logo上传成功');
  } else if (response && response.file && response.file.url) {
    formData.logo = response.file.url;
    ElMessage.success('Logo上传成功');
  } else {
    ElMessage.warning('上传成功但返回的数据格式不正确');
    console.error('上传响应格式:', response);
  }
};

// 处理Logo上传错误
const handleLogoError = (error, file) => {
  console.error('上传失败:', error, file);
  if (error.status === 413) {
    ElMessage.error('Logo上传失败：文件过大，请控制在2MB以内');
  } else if (error.message && error.message.includes('文件')) {
    ElMessage.error(`Logo上传失败：${error.message}`);
  } else {
    ElMessage.error('Logo上传失败，请检查网络连接或稍后重试');
  }
};

// 上传前校验
const beforeAvatarUpload = (file) => {
  console.log('准备上传文件:', file.name, file.type, file.size);
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;
  const fileSize = (file.size / 1024 / 1024).toFixed(2);

  if (!isImage) {
    ElMessage.error(`只能上传图片文件! 当前文件类型: ${file.type}`);
    return false;
  }
  if (!isLt2M) {
    ElMessage.error(`图片大小不能超过2MB! 当前文件大小: ${fileSize}MB`);
    return false;
  }
  ElMessage.info(`正在上传: ${file.name}，大小: ${fileSize}MB`);
  return true;
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.about-form-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #888;
  margin-top: 8px;
}

.value-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.value-item .el-input {
  margin-right: 10px;
}

.team-member {
  padding: 10px 0;
  margin-bottom: 20px;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.member-header h3 {
  margin: 0;
  font-size: 16px;
  color: #606266;
}

.add-member {
  margin-top: 20px;
  text-align: center;
}

.el-button + .el-button {
  margin-left: 10px;
}
</style> 