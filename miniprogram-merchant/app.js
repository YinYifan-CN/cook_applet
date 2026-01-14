// app.js - 商家端
App({
  globalData: {
    merchantInfo: null,
    apiBase: 'http://192.168.70.209:8000'  // 开发环境使用局域网IP（手机需连同一WiFi）
  },

  onLaunch() {
    // 小程序启动时执行
    console.log('商家端小程序启动')
    
    // 检查登录状态
    this.checkLogin()
  },

  // 检查登录
  checkLogin() {
    const merchantToken = wx.getStorageSync('merchantToken')
    if (!merchantToken) {
      this.login()
    }
  },

  // 登录
  login() {
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('登录成功，code:', res.code)
          // 这里应该调用后端API验证code并获取token
          // 示例：临时使用本地存储
          wx.setStorageSync('merchantToken', 'temp_merchant_token_' + Date.now())
          
          // 获取商家信息
          wx.getUserInfo({
            success: (userRes) => {
              this.globalData.merchantInfo = userRes.userInfo
              console.log('商家信息:', this.globalData.merchantInfo)
            }
          })
        }
      }
    })
  },

  // 获取商家信息
  getMerchantInfo() {
    return this.globalData.merchantInfo
  }
})
