<template>
  <div class="products-container">
    <div class="page-header">
      <h2>产品管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>添加产品
      </el-button>
    </div>
    
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="分类">
          <el-select v-model="filterForm.category" placeholder="选择分类" clearable>
            <el-option label="戒指" value="戒指" />
            <el-option label="项链" value="项链" />
            <el-option label="手链" value="手链" />
            <el-option label="耳环" value="耳环" />
            <el-option label="手镯" value="手镯" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="products"
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="产品图片" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.images[0]"
              :preview-src-list="row.images"
              fit="cover"
              class="product-image"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="产品名称" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isHot ? 'success' : 'info'" size="small">
              {{ row.isHot ? '热门' : '普通' }}
            </el-tag>
            <el-tag :type="row.isNew ? 'warning' : 'info'" size="small" class="ml-10">
              {{ row.isNew ? '新品' : '常规' }}
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
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getProducts, deleteProduct } from '@/api/products';

const router = useRouter();
const loading = ref(false);
const products = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const filterForm = reactive({
  category: ''
});

const fetchProducts = async () => {
  loading.value = true;
  try {
    const res = await getProducts({
      page: currentPage.value,
      limit: pageSize.value,
      category: filterForm.category
    });
    products.value = res.products;
    total.value = res.pagination.total;
  } catch (error) {
    ElMessage.error('获取产品列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchProducts();
};

const resetFilter = () => {
  filterForm.category = '';
  handleSearch();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchProducts();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchProducts();
};

const handleCreate = () => {
  router.push('/products/create');
};

const handleEdit = (row) => {
  router.push(`/products/${row._id}/edit`);
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该产品吗？', '提示', {
      type: 'warning'
    });
    
    await deleteProduct(row._id);
    ElMessage.success('删除成功');
    fetchProducts();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.products-container {
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

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.ml-10 {
  margin-left: 10px;
}
</style> 