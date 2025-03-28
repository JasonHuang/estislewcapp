Page({
  data: {
    companyInfo: {
      name: '屿夏珠宝',
      description: '屿夏珠宝是一家专注于高端珠宝设计与制作的品牌，致力于为每一位顾客打造独特、精致的珠宝作品。',
      address: '深圳市南山区科技园',
      phone: '0755-88888888',
      email: 'contact@estisle.com'
    },
    teamMembers: [
      {
        name: '张设计师',
        position: '首席设计师',
        image: 'https://via.placeholder.com/200x200/FFD700/000000?text=设计师1'
      },
      {
        name: '李工艺师',
        position: '高级工艺师',
        image: 'https://via.placeholder.com/200x200/FFD700/000000?text=工艺师1'
      },
      {
        name: '王鉴定师',
        position: '珠宝鉴定师',
        image: 'https://via.placeholder.com/200x200/FFD700/000000?text=鉴定师1'
      }
    ],
    companyCulture: [
      {
        title: '匠心精神',
        description: '追求卓越品质，精益求精'
      },
      {
        title: '创新设计',
        description: '融合传统与现代，打造独特风格'
      },
      {
        title: '诚信服务',
        description: '以诚为本，用心服务'
      }
    ]
  },

  // 拨打电话
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.companyInfo.phone
    });
  },

  // 复制邮箱
  copyEmail() {
    wx.setClipboardData({
      data: this.data.companyInfo.email,
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        });
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    const urls = this.data.teamMembers.map(member => member.image);
    wx.previewImage({
      current: src,
      urls: urls
    });
  }
}); 