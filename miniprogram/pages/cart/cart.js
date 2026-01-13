// pages/cart/cart.js - 购物车/结算页
const api = require('../../utils/api.js')
const app = getApp()

Page({
  data: {
    cart: [],
    note: ''
  },

  onLoad() {
    this.loadCart()
  },

  onShow() {
    this.loadCart()
  },

  // 加载购物车
  loadCart() {
    const cart = app.globalData.cart || []
    this.setData({ cart })
  },

  // 增加数量
  increaseQuantity(e) {
    const dishId = e.currentTarget.dataset.dishId
    let cart = [...this.data.cart]
    const index = cart.findIndex(item => item.dish_id === dishId)
    
    if (index > -1) {
      cart[index].quantity += 1
      this.setData({ cart })
      app.updateCart(cart)
    }
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
        // 删除该项
        wx.showModal({
          title: '提示',
          content: '确定要删除这个菜品吗？',
          success: (res) => {
            if (res.confirm) {
              cart.splice(index, 1)
              this.setData({ cart })
              app.updateCart(cart)
            }
          }
        })
        return
      }
      this.setData({ cart })
      app.updateCart(cart)
    }
  },

  // 备注输入
  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    })
  },

  // 清空购物车
  clearCart() {
    wx.showModal({
      title: '提示',
      content: '确定要清空购物车吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ cart: [] })
          app.updateCart([])
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  },

  // 去点餐页
  goToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 计算总价
  getTotalPrice() {
    return this.data.cart.reduce((sum, item) => {
      return sum + (item.price * item.quantity)
    }, 0).toFixed(2)
  },

  // 提交订单
  async submitOrder() {
    if (this.data.cart.length === 0) {
      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      })
      return
    }

    const orderData = {
      user_id: app.getUserId(),
      user_name: app.getUserName(),
      items: this.data.cart,
      note: this.data.note || null
    }

    try {
      wx.showLoading({ title: '提交中...' })
      const order = await api.createOrder(orderData)
      wx.hideLoading()

      // 清空购物车
      this.setData({ cart: [], note: '' })
      app.updateCart([])

      // 提示成功
      wx.showModal({
        title: '下单成功',
        content: `订单号：${order.id}\n总金额：¥${order.total_amount}`,
        showCancel: false,
        success: () => {
          // 跳转到订单页
          wx.switchTab({
            url: '/pages/order/order'
          })
        }
      })
    } catch (err) {
      wx.hideLoading()
      console.error('提交订单失败:', err)
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      })
    }
  }
})
