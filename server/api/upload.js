const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// 上传单张图片
router.post('/single', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '没有上传文件' });
    }
    res.json({
      message: '上传成功',
      file: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({ message: '上传失败', error: error.message });
  }
});

// 上传多张图片
router.post('/multiple', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '没有上传文件' });
    }
    const files = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));
    res.json({
      message: '上传成功',
      files
    });
  } catch (error) {
    res.status(500).json({ message: '上传失败', error: error.message });
  }
});

module.exports = router; 