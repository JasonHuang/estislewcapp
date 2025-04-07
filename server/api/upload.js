const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// 上传单张图片
router.post('/single', (req, res) => {
  const uploadMiddleware = upload.single('image');

  uploadMiddleware(req, res, function(err) {
    if (err) {
      console.error('上传错误:', err);
      // 处理不同类型的错误
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          message: '文件大小超过限制，最大支持5MB', 
          error: err.message 
        });
      }
      if (err.message.includes('文件')) {
        return res.status(400).json({ 
          message: err.message, 
          error: 'INVALID_FILE_TYPE' 
        });
      }
      return res.status(500).json({ 
        message: '文件上传失败', 
        error: err.message 
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: '没有上传文件' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: '上传成功',
      file: {
        filename: req.file.filename,
        path: fileUrl,
        url: fileUrl, // 增加url字段，方便前端使用
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  });
});

// 上传多张图片
router.post('/multiple', (req, res) => {
  const uploadMiddleware = upload.array('images', 5);

  uploadMiddleware(req, res, function(err) {
    if (err) {
      console.error('多文件上传错误:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          message: '文件大小超过限制，最大支持5MB', 
          error: err.message 
        });
      }
      if (err.message.includes('文件')) {
        return res.status(400).json({ 
          message: err.message, 
          error: 'INVALID_FILE_TYPE' 
        });
      }
      return res.status(500).json({ 
        message: '文件上传失败', 
        error: err.message 
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '没有上传文件' });
    }
    
    const files = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));
    
    res.json({
      message: '上传成功',
      files
    });
  });
});

module.exports = router; 