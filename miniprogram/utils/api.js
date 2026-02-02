// utils/api.js - API接口封装
const app = getApp()

// API基础地址 - 服务器地址
const API_BASE = 'http://yxcmqx.top:8000'

console.log('当前API地址:', API_BASE)

// 封装请求方法
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    wx.request({
      url: API_BASE + url,
      method: options.method || 'GET',
      data: options.data || {},
      timeout: 30000,  // 超时时间30秒
      header: {
        'content-type': 'application/json',
        'ngrok-skip-browser-warning': 'true',  // 跳过ngrok警告页
        ...options.header
      },
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode === 200) {
          // 检查是否是HTML（ngrok警告页）
          if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) {
            console.error('收到HTML响应，可能是ngrok警告页')
            wx.showToast({
              title: 'ngrok警告页拦截',
              icon: 'none',
              duration: 3000
            })
            reject(new Error('ngrok warning page'))
          } else {
            resolve(res.data)
          }
        } else {
          wx.showToast({
            title: '请求失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('请求失败详情:', err)
        wx.showToast({
          title: `网络错误: ${err.errMsg}`,
          icon: 'none',
          duration: 3000
        })
        reject(err)
      }
    })
  })
}

// 导出API方法
module.exports = {
  // 获取所有菜品
  getDishes: () => {
    return request('/api/user/dishes')
  },

  // 获取单个菜品详情
  getDish: (dishId) => {
    return request(`/api/user/dishes/${dishId}`)
  },

  // 创建订单
  createOrder: (orderData) => {
    return request('/api/user/orders', {
      method: 'POST',
      data: orderData
    })
  },

  // 获取用户订单列表
  getUserOrders: (userId) => {
    return request(`/api/user/orders/${userId}`)
  },

  // 商家端 - 获取所有订单
  getMerchantOrders: (status) => {
    const url = status ? `/api/merchant/orders?status=${status}` : '/api/merchant/orders'
    return request(url)
  },

  // 商家端 - 更新订单状态
  updateOrderStatus: (orderId, status) => {
    return request(`/api/merchant/orders/${orderId}`, {
      method: 'PUT',
      data: { status }
    })
  },

  // 商家端 - 添加菜品
  addDish: (dishData) => {
    return request('/api/merchant/dishes', {
      method: 'POST',
      data: dishData
    })
  },

  // 商家端 - 更新菜品
  updateDish: (dishId, dishData) => {
    return request(`/api/merchant/dishes/${dishId}`, {
      method: 'PUT',
      data: dishData
    })
  },

  // 商家端 - 删除菜品
  deleteDish: (dishId) => {
    return request(`/api/merchant/dishes/${dishId}`, {
      method: 'DELETE'
    })
  }
}
