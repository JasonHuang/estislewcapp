<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>产品总数</span>
              <el-icon><Goods /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <span class="number">{{ statistics.totalProducts }}</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>轮播图数量</span>
              <el-icon><Picture /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <span class="number">{{ statistics.totalBanners }}</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>热门产品</span>
              <el-icon><Star /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <span class="number">{{ statistics.hotProducts }}</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>用户数量</span>
              <el-icon><User /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <span class="number">{{ statistics.totalUsers }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近添加的产品</span>
            </div>
          </template>
          <el-table :data="recentProducts" style="width: 100%">
            <el-table-column prop="name" label="产品名称" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="price" label="价格" width="120">
              <template #default="{ row }">
                ¥{{ row.price.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="添加时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="Node.js版本">{{ systemInfo.nodeVersion }}</el-descriptions-item>
            <el-descriptions-item label="MongoDB版本">{{ systemInfo.mongoVersion }}</el-descriptions-item>
            <el-descriptions-item label="服务器时间">{{ systemInfo.serverTime }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getProducts } from '@/api/products';
import { getBanners } from '@/api/banners';
import { getUsers } from '@/api/auth';

const statistics = ref({
  totalProducts: 0,
  totalBanners: 0,
  hotProducts: 0,
  totalUsers: 0
});

const recentProducts = ref([]);
const systemInfo = ref({
  nodeVersion: process.version,
  mongoVersion: '6.0',
  serverTime: new Date().toLocaleString()
});

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

const fetchData = async () => {
  try {
    // 获取产品数据
    const productsRes = await getProducts({ limit: 100 });
    statistics.value.totalProducts = productsRes.pagination.total;
    statistics.value.hotProducts = productsRes.products.filter(p => p.isHot).length;
    recentProducts.value = productsRes.products.slice(0, 5);
    
    // 获取轮播图数据
    const bannersRes = await getBanners();
    statistics.value.totalBanners = bannersRes.length;
    
    // 获取用户数据
    const usersRes = await getUsers();
    statistics.value.totalUsers = usersRes.length;
  } catch (error) {
    ElMessage.error('获取数据失败');
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-card {
  height: 120px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.number {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
}

.mt-20 {
  margin-top: 20px;
}
</style> 