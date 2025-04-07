require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// 导入路由
const bannerRoutes = require('./api/banners');
const productRoutes = require('./api/products');
const uploadRoutes = require('./api/upload');
const userRoutes = require('./api/users');
const categoryRoutes = require('./api/categories');

const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 配置
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:8080'
];

app.use(cors({
  origin: function(origin, callback) {
    // 允许没有来源的请求（比如移动端应用）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.warn(`CORS请求来自未允许的源: ${origin}`);
      // 开发环境下允许所有来源
      return callback(null, true);
      //const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      //return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 预检请求结果缓存1天
}));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yuxia_jewelry', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('数据库连接成功'))
.catch(err => console.error('数据库连接失败:', err));

// 路由
app.use('/api/banners', bannerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/goldprice', require('./api/goldprice'));
app.use('/api/auth', require('./api/auth'));
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/about', require('./api/about'));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  console.error('错误栈:', err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 