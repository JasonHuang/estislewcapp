// about.js
const app = getApp()

Page({
  data: {
    companyName: app.globalData.companyName,
    companyInfo: {
      logo: '/images/logo.png',
      intro: '深圳市屿夏珠宝有限公司成立于2015年，是一家专注于珠宝设计、制作和销售的企业。我们致力于为顾客提供高品质、独特设计的珠宝产品，以精湛的工艺和卓越的服务赢得市场认可。',
      vision: '成为中国珠宝行业的创新领导者，打造具有国际影响力的珠宝品牌。',
      values: [
        '品质至上：严选材料，精工细作',
        '创新设计：融合传统与现代，打造独特风格',
        '诚信服务：以客户为中心，提供专业透明的服务'
      ]
    },
    contactInfo: {
      address: '广东省深圳市罗湖区水贝珠宝大厦1588号',
      phone: '0755-1234 5678',
      email: 'contact@yuxiajewelry.com',
      wechat: 'YuXiaJewelry'
    },
    teamInfo: [
      {
        id: 1,
        name: '张三',
        role: '创始人 & 首席设计师',
        avatar: '/images/team/team1.png',
        description: '拥有超过15年的珠宝设计经验，曾在国际知名品牌担任设计总监，对珠宝设计有独特的见解和创新理念。'
      },
      {
        id: 2,
        name: '李四',
        role: '工艺总监',
        avatar: '/images/team/team2.png',
        description: '精通各种珠宝制作工艺，坚持传统工艺与现代技术的结合，确保每件作品都达到极致的品质和工艺水准。'
      },
      {
        id: 3,
        name: '王五',
        role: '产品经理',
        avatar: '/images/team/team3.png',
        description: '负责产品开发和市场调研，深入了解消费者需求，确保每一件产品都能满足客户的期望。'
      }
    ]
  },
  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '关于我们'
    })
  },
  callPhone: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.contactInfo.phone.replace(/\s+/g, '')
    })
  },
  copyEmail: function() {
    wx.setClipboardData({
      data: this.data.contactInfo.email,
      success: function() {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        })
      }
    })
  },
  copyWechat: function() {
    wx.setClipboardData({
      data: this.data.contactInfo.wechat,
      success: function() {
        wx.showToast({
          title: '微信号已复制',
          icon: 'success'
        })
      }
    })
  }
}) 