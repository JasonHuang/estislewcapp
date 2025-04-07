const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  // 公司基本信息
  companyName: {
    type: String,
    required: true,
    default: '屿夏珠宝'
  },
  logo: {
    type: String,
    default: '/images/logo.png'
  },
  intro: {
    type: String,
    required: true,
    default: '深圳市屿夏珠宝有限公司成立于2015年，是一家专注于珠宝设计、制作和销售的企业。我们致力于为顾客提供高品质、独特设计的珠宝产品，以精湛的工艺和卓越的服务赢得市场认可。'
  },
  vision: {
    type: String,
    default: '成为中国珠宝行业的创新领导者，打造具有国际影响力的珠宝品牌。'
  },
  values: [{
    type: String
  }],
  
  // 团队成员信息
  team: [{
    name: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    },
    photo: {
      type: String,
      default: ''
    },
    intro: {
      type: String,
      default: ''
    }
  }],
  
  // 联系信息
  address: {
    type: String,
    default: '广东省深圳市罗湖区水贝珠宝大厦1588号'
  },
  phone: {
    type: String,
    default: '0755-1234 5678'
  },
  email: {
    type: String,
    default: 'contact@yuxiajewelry.com'
  },
  wechat: {
    type: String,
    default: 'YuXiaJewelry'
  },
  
  // 最后更新信息
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('About', aboutSchema); 