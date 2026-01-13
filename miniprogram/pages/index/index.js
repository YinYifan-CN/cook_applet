// pages/index/index.js - 菜品列表页
const api = require('../../utils/api.js')
const app = getApp()

Page({
  data: {
    dishes: [],
    cart: [],
    showCartPopup: false
  },

  onLoad() {
    this.loadDishes()
    this.loadCart()
  },

  onShow() {
    this.loadCart()
  },

  // 加载菜品列表
  async loadDishes() {
    try {
      console.log('开始加载菜品...')
      const dishes = await api.getDishes()
      console.log('菜品API返回类型:', typeof dishes)
      console.log('菜品是否为数组:', Array.isArray(dishes))
      console.log('成功加载菜品数量:', dishes ? dishes.length : 0)
      console.log('菜品数据:', dishes)
      
      if (!dishes || !Array.isArray(dishes)) {
        console.error('菜品数据格式错误:', dishes)
        wx.showToast({
          title: '数据格式错误',
          icon: 'none',
          duration: 3000
        })
        return
      }
      
      this.setData({ dishes })
      
      if (dishes.length === 0) {
        wx.showToast({
          title: '暂无菜品',
          icon: 'none'
        })
      } else {
        console.log('已设置菜品数据到页面')
      }
    } catch (err) {
      console.error('加载菜品失败:', err)
      console.error('错误详情:', JSON.stringify(err))
      wx.showToast({
        title: `加载失败: ${err.errMsg || err.message || '未知错误'}`,
        icon: 'none',
        duration: 3000
      })
    }
  },

  // 加载购物车
  loadCart() {
    const cart = app.globalData.cart || []
    this.setData({ cart })
  },

  // 添加到购物车
  addToCart(e) {
    const dish = e.currentTarget.dataset.dish
    let cart = [...this.data.cart]
    
    // 检查购物车中是否已存在该菜品
    const index = cart.findIndex(item => item.dish_id === dish.id)
    
    if (index > -1) {
      // 已存在，数量+1
      cart[index].quantity += 1
    } else {
      // 不存在，添加新项
      cart.push({
        dish_id: dish.id,
        dish_name: dish.name,
        price: dish.price,
        quantity: 1
      })
    }
    
    this.setData({ cart })
    app.updateCart(cart)
    
    wx.showToast({
      title: '已添加到购物车',
      icon: 'success',
      duration: 1000
    })
  },

  // 减少数量
  decreaseQuantity(e) {
    const dishId = e.currentTarget.dataset.dishId
    let cart = [...this.data.cart]
    const index = cart.findIndex(item => item.dish_id === dishId)
    
    if (index > -1) {
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1
      } else {
        cart.splice(index, 1)
      }
      this.setData({ cart })
      app.updateCart(cart)
    }
  },

  // 查看菜品详情
  viewDishDetail(e) {
    const dish = e.currentTarget.dataset.dish
    
    // 构建详情内容
    let content = `${dish.description || '暂无描述'}\n\n价格：¥${dish.price}`
    
    if (dish.cooking_instructions) {
      content += `\n\n制作方式：\n${dish.cooking_instructions}`
    }
    
    wx.showModal({
      title: dish.name,
      content: content,
      confirmText: '加入购物车',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm) {
          this.addToCart(e)
        }
      }
    })
  },

  // 显示购物车弹窗
  showCart() {
    if (this.data.cart.length === 0) {
      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      })
      return
    }
    this.setData({ showCartPopup: true })
  },

  // 隐藏购物车弹窗
  hideCart() {
    this.setData({ showCartPopup: false })
  },

  // 去结算
  goToCheckout() {
    if (this.data.cart.length === 0) {
      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/cart/cart'
    })
  },

  // 计算购物车总价
  getCartTotal() {
    return this.data.cart.reduce((sum, item) => {
      return sum + (item.price * item.quantity)
    }, 0).toFixed(2)
  },

  // 计算购物车商品数量
  getCartCount() {
    return this.data.cart.reduce((sum, item) => sum + item.quantity, 0)
  }
})
