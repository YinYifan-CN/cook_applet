// app.js
App({
  globalData: {
    userInfo: null,
    cart: [],  // 购物车数据
    apiBase: 'http://localhost:8000'  // 开发环境，正式环境改为 https://api.yourdomain.com
  },

  onLaunch() {
    // 小程序启动时执行
    console.log('小程序启动')
    
    // 加载本地购物车数据
    const cart = wx.getStorageSync('cart')
    if (cart) {
      this.globalData.cart = cart
    }

    // 检查登录状态
    this.checkLogin()
  },

  // 检查登录
  checkLogin() {
    const token = wx.getStorageSync('token')
    if (!token) {
      this.login()
    }
  },

  // 微信登录
  login() {
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('获取code成功:', res.code)
          // 这里可以调用后端接口换取token
          // 目前先生成一个临时用户ID
          const userId = 'USER_' + Date.now()
          wx.setStorageSync('userId', userId)
          wx.setStorageSync('userName', '微信用户')
        }
      }
    })
  },

  // 获取用户ID
  getUserId() {
    let userId = wx.getStorageSync('userId')
    if (!userId) {
      userId = 'USER_' + Date.now()
      wx.setStorageSync('userId', userId)
    }
    return userId
  },

  // 获取用户名
  getUserName() {
    let userName = wx.getStorageSync('userName')
    if (!userName) {
      userName = '微信用户'
      wx.setStorageSync('userName', userName)
    }
    return userName
  },

  // 更新购物车
  updateCart(cart) {
    this.globalData.cart = cart
    wx.setStorageSync('cart', cart)
    
    // 更新购物车badge
    if (cart.length > 0) {
      const total = cart.reduce((sum, item) => sum + item.quantity, 0)
      wx.setTabBarBadge({
        index: 1,
        text: total.toString()
      })
    } else {
      wx.removeTabBarBadge({
        index: 1
      })
    }
  }
})
