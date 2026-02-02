// utils/api.js - 商家端API接口封装
const app = getApp()

// API基础地址
const API_BASE = 'http://yxcmqx.top:8000'

console.log('商家端API地址:', API_BASE)

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
      timeout: 30000,
      header: {
        'content-type': 'application/json',
        ...options.header
      },
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode === 200) {
          resolve(res.data)
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
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// ============ 商家端API ============

// 获取所有订单
export function getOrders(status = null) {
  const url = status ? `/api/merchant/orders?status=${status}` : '/api/merchant/orders'
  return request(url)
}

// 获取订单详情（包含制作说明）
export function getOrderDetail(orderId) {
  return request(`/api/merchant/orders/${orderId}`)
}

// 接单
export function acceptOrder(orderId) {
  return request(`/api/merchant/orders/${orderId}/accept`, {
    method: 'POST'
  })
}

// 开始制作
export function startPreparing(orderId) {
  return request(`/api/merchant/orders/${orderId}/start`, {
    method: 'POST'
  })
}

// 完成订单
export function completeOrder(orderId) {
  return request(`/api/merchant/orders/${orderId}/complete`, {
    method: 'POST'
  })
}

// 取消订单
export function cancelOrder(orderId) {
  return request(`/api/merchant/orders/${orderId}/cancel`, {
    method: 'POST'
  })
}

// 获取菜品列表
export function getDishes() {
  return request('/api/user/dishes')
}

// 添加菜品
export function addDish(dishData) {
  return request('/api/merchant/dishes', {
    method: 'POST',
    data: dishData
  })
}

// 更新菜品
export function updateDish(dishId, dishData) {
  return request(`/api/merchant/dishes/${dishId}`, {
    method: 'PUT',
    data: dishData
  })
}

// 删除菜品
export function deleteDish(dishId) {
  return request(`/api/merchant/dishes/${dishId}`, {
    method: 'DELETE'
  })
}
