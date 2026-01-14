// pages/dish-list/dish-list.js - 菜品管理页
const api = require('../../utils/api.js')

Page({
  data: {
    dishes: []
  },

  onLoad() {
    this.loadDishes()
  },

  onShow() {
    this.loadDishes()
  },

  onPullDownRefresh() {
    this.loadDishes().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载菜品列表
  async loadDishes() {
    try {
      wx.showLoading({ title: '加载中...' })
      const dishes = await api.getDishes()
      this.setData({ dishes })
      wx.hideLoading()
    } catch (err) {
      wx.hideLoading()
      console.error('加载菜品失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 添加菜品
  addDish() {
    wx.navigateTo({
      url: '/pages/add-dish/add-dish'
    })
  },

  // 编辑菜品
  editDish(e) {
    const dish = e.currentTarget.dataset.dish
    wx.navigateTo({
      url: `/pages/add-dish/add-dish?dishId=${dish.id}`
    })
  },

  // 删除菜品
  async deleteDish(e) {
    const dishId = e.currentTarget.dataset.id
    const dishName = e.currentTarget.dataset.name
    
    const result = await wx.showModal({
      title: '确认删除',
      content: `确定要删除"${dishName}"吗？`
    })
    
    if (!result.confirm) return
    
    try {
      wx.showLoading({ title: '删除中...' })
      await api.deleteDish(dishId)
      wx.hideLoading()
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      this.loadDishes()
    } catch (err) {
      wx.hideLoading()
      console.error('删除菜品失败:', err)
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  },

  // 切换上架状态
  async toggleAvailable(e) {
    const dish = e.currentTarget.dataset.dish
    const newStatus = !dish.is_available
    
    try {
      const updatedDish = {
        ...dish,
        is_available: newStatus
      }
      await api.updateDish(dish.id, updatedDish)
      wx.showToast({
        title: newStatus ? '已上架' : '已下架',
        icon: 'success'
      })
      this.loadDishes()
    } catch (err) {
      console.error('更新失败:', err)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  }
})
