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
        name: '张总监',
        title: '创意总监',
        avatar: '/images/team1.jpg',
        intro: '拥有15年珠宝设计经验，曾获多项国际珠宝设计大奖'
      },
      {
        name: '李经理',
        title: '生产经理',
        avatar: '/images/team2.jpg',
        intro: '精通各类珠宝制作工艺，带领团队打造精品珠宝'
      },
      {
        name: '王顾问',
        title: '珠宝顾问',
        avatar: '/images/team3.jpg',
        intro: '宝石学专家，为客户提供专业的珠宝选购建议'
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