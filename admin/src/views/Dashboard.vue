<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6" :lg="6" v-for="(item, index) in cardItems" :key="index" class="mb-20">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>{{ item.title }}</span>
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <span class="number">{{ item.value }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" class="mb-20">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近添加的产品</span>
            </div>
          </template>
          <el-table :data="recentProducts" style="width: 100%">
            <el-table-column prop="name" label="产品名称" min-width="120" />
            <el-table-column prop="category" label="分类" min-width="80">
              <template #default="{ row }">
                {{ getCategoryName(row.category) }}
              </template>
            </el-table-column>
            <el-table-column prop="price" label="价格" min-width="80">
              <template #default="{ row }">
                ¥{{ row.price.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="添加时间" min-width="120">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
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
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Goods, Picture, Star, User } from '@element-plus/icons-vue';
import { getProducts } from '@/api/products';
import { getBanners } from '@/api/banners';
import { getUsers } from '@/api/auth';
import { getPublicCategories } from '@/api/categories';

const statistics = ref({
  totalProducts: 0,
  totalBanners: 0,
  hotProducts: 0,
  totalUsers: 0
});

const cardItems = computed(() => [
  { title: '产品总数', value: statistics.value.totalProducts, icon: 'Goods' },
  { title: '轮播图数量', value: statistics.value.totalBanners, icon: 'Picture' },
  { title: '热门产品', value: statistics.value.hotProducts, icon: 'Star' },
  { title: '用户数量', value: statistics.value.totalUsers, icon: 'User' }
]);

const recentProducts = ref([]);
const systemInfo = ref({
  nodeVersion: 'v18.x',
  mongoVersion: '6.0',
  serverTime: new Date().toLocaleString()
});
const categories = ref([]);

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat._id === categoryId);
  return category ? category.name : '';
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
    
    // 获取分类数据
    const categoriesRes = await getPublicCategories();
    categories.value = categoriesRes;
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
  height: 180px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 15px 0;
}

.number {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 10px;
}

.mt-20 {
  margin-top: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .dashboard-card {
    margin-bottom: 15px;
  }
  
  .number {
    font-size: 28px;
  }
}
</style> 