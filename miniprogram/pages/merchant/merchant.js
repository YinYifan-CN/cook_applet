// pages/merchant/merchant.js - 商家管理页
const api = require('../../utils/api.js')

Page({
  data: {
    currentTab: 'orders',  // orders 或 dishes
    orders: [],
    filteredOrders: [],
    dishes: [],
    statusFilter: 'all',
    totalOrders: 0,
    pendingOrders: 0,
    statusMap: {
      'pending': '待确认',
      'confirmed': '已确认',
      'preparing': '制作中',
      'ready': '待取餐',
      'completed': '已完成',
      'cancelled': '已取消'
    }
  },

  onLoad() {
    this.loadOrders()
    this.loadDishes()
  },

  onShow() {
    this.loadOrders()
    this.loadDishes()
  },

  onPullDownRefresh() {
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载订单
  async loadOrders() {
    try {
      console.log('开始加载商家订单...')
      let orders = await api.getMerchantOrders()
      
      console.log('商家订单API返回:', orders)
      console.log('订单数量:', orders ? orders.length : 0)
      
      // 确保orders是数组
      if (!Array.isArray(orders)) {
        console.warn('订单不是数组，设置为空')
        orders = []
      }
      
      // 按创建时间倒序
      orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      
      // 为每个订单添加下一个状态信息
      orders.forEach(order => {
        order.nextStatus = this.getNextStatus(order.status)
        order.nextStatusText = this.getNextStatusText(order.status)
      })
      
      // 计算统计数据
      const totalOrders = orders.length
      const pendingOrders = orders.filter(o => o.status === 'pending').length
      
      console.log('总订单数:', totalOrders, '待处理:', pendingOrders)
      
      this.setData({ 
        orders,
        filteredOrders: orders,
        totalOrders,
        pendingOrders
      })
    } catch (err) {
      console.error('加载订单失败:', err)
      this.setData({ 
        orders: [],
        totalOrders: 0,
        pendingOrders: 0
      })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 筛选订单
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

  // 更新订单状态
  updateStatus(e) {
    const { orderId, status } = e.currentTarget.dataset
    
    console.log('准备更新订单状态:', orderId, '→', status)
    
    wx.showModal({
      title: '确认操作',
      content: `确定要将订单状态改为"${this.data.statusMap[status]}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            console.log('开始调用API更新订单...')
            const result = await api.updateOrderStatus(orderId, status)
            console.log('API返回结果:', result)
            
            wx.showToast({
              title: '更新成功',
              icon: 'success'
            })
            this.loadOrders()
          } catch (err) {
            console.error('更新状态失败:', err)
            wx.showToast({
              title: '更新失败',
              icon: 'none'
            })
          }
        } else {
          console.log('用户取消了更新操作')
        }
      }
    })
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const order = e.currentTarget.dataset.order
    const items = order.items.map(item => 
      `${item.dish_name} x${item.quantity} - ¥${(item.price * item.quantity).toFixed(2)}`
    ).join('\n')
    
    wx.showModal({
      title: `订单详情 - ${order.id}`,
      content: `顾客：${order.user_name}\n状态：${this.data.statusMap[order.status]}\n\n${items}\n\n总计：¥${order.total_amount}\n\n${order.note ? '备注：' + order.note : ''}`,
      showCancel: false
    })
  },

  // 格式化时间
  formatTime(dateStr) {
    const date = new Date(dateStr)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hour}:${minute}`
  },

  // 获取下一个状态
  getNextStatus(currentStatus) {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'completed'
    }
    return statusFlow[currentStatus]
  },

  // 获取下一个状态文本
  getNextStatusText(currentStatus) {
    const nextStatus = this.getNextStatus(currentStatus)
    return nextStatus ? this.data.statusMap[nextStatus] : ''
  },

  // 切换Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
  },

  // 加载菜品列表
  async loadDishes() {
    try {
      const dishes = await api.getDishes()
      this.setData({ dishes })
    } catch (err) {
      console.error('加载菜品失败:', err)
    }
  },

  // 显示添加菜品对话框
  showAddDishDialog() {
    wx.navigateTo({
      url: '/pages/add-dish/add-dish'
    })
  },

  // 编辑菜品
  editDish(e) {
    const dish = e.currentTarget.dataset.dish
    const cookingInstructions = encodeURIComponent(dish.cooking_instructions || '')
    const description = encodeURIComponent(dish.description || '')
    wx.navigateTo({
      url: `/pages/add-dish/add-dish?id=${dish.id}&name=${dish.name}&price=${dish.price}&description=${description}&cookingInstructions=${cookingInstructions}`
    })
  },

  // 删除菜品
  deleteDish(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个菜品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteDish(id)
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            this.loadDishes()
          } catch (err) {
            console.error('删除失败:', err)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }
})
