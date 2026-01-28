// pages/order/order.js - 清单列表页
const api = require('../../utils/api.js')
const app = getApp()

Page({
  data: {
    orders: [],
    filteredOrders: [],
    statusFilter: 'all',
    statusMap: {
      'pending': '待确认',
      'confirmed': '已确认',
      'preparing': '制作中',
      'ready': '待取餐',
      'completed': '已完成',
      'cancelled': '已取消'
    },
    progressSteps: {
      'pending': { step: 1, total: 4, text: '等待确认' },
      'confirmed': { step: 2, total: 4, text: '已确认' },
      'preparing': { step: 3, total: 4, text: '制作中' },
      'ready': { step: 4, total: 4, text: '待取餐' },
      'completed': { step: 4, total: 4, text: '已完成' },
      'cancelled': { step: 0, total: 4, text: '已取消' }
    }
  },

  onLoad() {
    this.loadOrders()
  },

  onShow() {
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载清单列表
  async loadOrders() {
    try {
      const userId = app.getUserId()
      let orders = await api.getUserOrders(userId)
      
      // 确保orders是数组
      if (!Array.isArray(orders)) {
        orders = []
      }
      
      // 按创建时间倒序排列
      orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      
      // 为每个订单添加进度信息
      orders.forEach(order => {
        const progress = this.data.progressSteps[order.status] || { step: 0, total: 4, text: '未知' }
        order.progressStep = progress.step
        order.progressTotal = progress.total
        order.progressText = progress.text
        order.progressPercent = order.status === 'cancelled' ? 0 : (progress.step / progress.total * 100)
      })
      
      this.setData({ 
        orders,
        filteredOrders: orders
      })
    } catch (err) {
      console.error('加载清单失败:', err)
      this.setData({ orders: [] })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 筛选清单
  filterOrders(e) {
    const status = e.currentTarget.dataset.status
    const filteredOrders = status === 'all' 
      ? this.data.orders 
      : this.data.orders.filter(order => order.status === status)
    
    this.setData({ 
      statusFilter: status,
      filteredOrders: filteredOrders
    })
  },

  // 查看清单详情
  viewOrderDetail(e) {
    const order = e.currentTarget.dataset.order
    const items = order.items.map(item => 
      `${item.dish_name} x${item.quantity} - ¥${(item.price * item.quantity).toFixed(2)}`
    ).join('\n')
    
    wx.showModal({
      title: `清单详情 - ${order.id}`,
      content: `状态：${this.data.statusMap[order.status]}\n\n${items}\n\n参考价：¥${order.total_amount}\n\n${order.note ? '备注：' + order.note : ''}`,
      showCancel: false
    })
  },

  // 格式化时间
  formatTime(dateStr) {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
})
