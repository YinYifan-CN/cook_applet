// pages/merchant/merchant.js - 商家端订单管理页
const api = require('../../utils/api.js')

Page({
  data: {
    orders: [],
    filteredOrders: [],
    statusFilter: 'all',
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    statusMap: {
      'pending': '待接单',
      'accepted': '已接单',
      'preparing': '制作中',
      'completed': '已完成',
      'cancelled': '已取消'
    },
    statusColors: {
      'pending': '#ffc107',
      'accepted': '#2196F3',
      'preparing': '#4CAF50',
      'completed': '#9E9E9E',
      'cancelled': '#f44336'
    }
  },

  onLoad() {
    this.loadOrders()
    this.startAutoRefresh()
  },

  onUnload() {
    // 清除定时器
    this.stopAutoRefresh()
  },

  onShow() {
    this.loadOrders()
    this.startAutoRefresh()
  },

  onHide() {
    // 页面隐藏时停止定时器
    this.stopAutoRefresh()
  },

  // 启动自动刷新
  startAutoRefresh() {
    // 先清除旧的定时器
    this.stopAutoRefresh()
    // 每30秒自动刷新订单
    this.autoRefreshTimer = setInterval(() => {
      if (typeof this.loadOrders === 'function') {
        this.loadOrders(true)  // 静默刷新
      }
    }, 30000)
  },

  // 停止自动刷新
  stopAutoRefresh() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer)
      this.autoRefreshTimer = null
    }
  },

  onPullDownRefresh() {
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载订单
  async loadOrders(silent = false) {
    try {
      if (!silent) {
        wx.showLoading({ title: '加载中...' })
      }
      
      const orders = await api.getOrders()
      
      // 按创建时间倒序
      orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      
      // 格式化价格数据
      orders.forEach(order => {
        order.totalAmountFormatted = order.total_amount.toFixed(2)
        order.createdAtFormatted = this.formatTime(order.created_at)
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            item.priceFormatted = (item.price * item.quantity).toFixed(2)
          })
        }
      })
      
      // 计算统计数据
      const totalOrders = orders.length
      const pendingOrders = orders.filter(o => o.status === 'pending').length
      const completedOrders = orders.filter(o => o.status === 'completed')
      const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_amount, 0)
      
      this.setData({ 
        orders,
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenue.toFixed(2)
      })
      
      // 应用当前筛选
      this.applyFilter()
      
      if (!silent) {
        wx.hideLoading()
      }
    } catch (err) {
      console.error('加载订单失败:', err)
      if (!silent) {
        wx.hideLoading()
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    }
  },

  // 筛选订单
  filterOrders(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ statusFilter: status })
    this.applyFilter()
  },

  // 应用筛选
  applyFilter() {
    const { orders, statusFilter } = this.data
    const filteredOrders = statusFilter === 'all' 
      ? orders 
      : orders.filter(order => order.status === statusFilter)
    
    this.setData({ filteredOrders })
  },

  // 接单
  async acceptOrder(e) {
    const orderId = e.currentTarget.dataset.id
    
    try {
      await api.acceptOrder(orderId)
      wx.showToast({
        title: '接单成功',
        icon: 'success'
      })
      this.loadOrders()
    } catch (err) {
      console.error('接单失败:', err)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 开始制作
  async startPreparing(e) {
    const orderId = e.currentTarget.dataset.id
    
    try {
      await api.startPreparing(orderId)
      wx.showToast({
        title: '已开始制作',
        icon: 'success'
      })
      this.loadOrders()
    } catch (err) {
      console.error('操作失败:', err)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 完成订单
  async completeOrder(e) {
    const orderId = e.currentTarget.dataset.id
    
    try {
      await api.completeOrder(orderId)
      wx.showToast({
        title: '订单已完成',
        icon: 'success'
      })
      this.loadOrders()
    } catch (err) {
      console.error('操作失败:', err)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 取消订单
  async cancelOrder(e) {
    const orderId = e.currentTarget.dataset.id
    
    const result = await wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？'
    })
    
    if (!result.confirm) return
    
    try {
      await api.cancelOrder(orderId)
      wx.showToast({
        title: '订单已取消',
        icon: 'success'
      })
      this.loadOrders()
    } catch (err) {
      console.error('操作失败:', err)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 查看订单详情（包含制作说明）
  async viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    
    try {
      wx.showLoading({ title: '加载中...' })
      const orderDetail = await api.getOrderDetail(orderId)
      wx.hideLoading()
      
      // 跳转到订单详情页
      wx.navigateTo({
        url: `/pages/order-detail/order-detail?order=${encodeURIComponent(JSON.stringify(orderDetail))}`
      })
    } catch (err) {
      wx.hideLoading()
      console.error('加载订单详情失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 格式化时间
  formatTime(dateStr) {
    const date = new Date(dateStr)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hour}:${minute}`
  }
})
