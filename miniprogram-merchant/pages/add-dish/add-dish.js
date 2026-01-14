// pages/add-dish/add-dish.js
const api = require('../../utils/api.js')

Page({
  data: {
    dishId: null,
    name: '',
    price: '',
    description: '',
    cookingInstructions: '',
    isAvailable: true,
    isEdit: false
  },

  onLoad(options) {
    if (options.dishId) {
      this.loadDishDetail(options.dishId)
    }
  },

  // 加载菜品详情
  async loadDishDetail(dishId) {
    try {
      wx.showLoading({ title: '加载中...' })
      const dishes = await api.getDishes()
      const dish = dishes.find(d => d.id == dishId)
      
      if (dish) {
        this.setData({
          dishId: dish.id,
          name: dish.name,
          price: dish.price.toString(),
          description: dish.description || '',
          cookingInstructions: dish.cooking_instructions === '暂无制作说明' ? '' : (dish.cooking_instructions || ''),
          isAvailable: dish.is_available,
          isEdit: true
        })
      }
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

  // 输入事件
  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  onPriceInput(e) {
    this.setData({ price: e.detail.value })
  },

  onDescInput(e) {
    this.setData({ description: e.detail.value })
  },

  onCookingInput(e) {
    this.setData({ cookingInstructions: e.detail.value })
  },

  onAvailableChange(e) {
    this.setData({ isAvailable: e.detail.value })
  },

  // 提交表单
  async submitDish() {
    const { dishId, name, price, description, cookingInstructions, isAvailable, isEdit } = this.data

    // 验证
    if (!name || !price) {
      wx.showToast({
        title: '请填写菜品名称和价格',
        icon: 'none'
      })
      return
    }

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum < 0) {
      wx.showToast({
        title: '价格不能为负数',
        icon: 'none'
      })
      return
    }

    if (!description) {
      wx.showToast({
        title: '请填写菜品描述',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: isEdit ? '保存中...' : '添加中...' })
      
      const dishData = {
        id: dishId || Date.now(),
        name,
        price: priceNum,
        description,
        cooking_instructions: cookingInstructions || '暂无制作说明',
        category: '菜品',
        is_available: isAvailable,
        image_url: null
      }

      if (isEdit) {
        await api.updateDish(dishId, dishData)
        wx.hideLoading()
        wx.showToast({
          title: '修改成功',
          icon: 'success'
        })
      } else {
        await api.addDish(dishData)
        wx.hideLoading()
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        })
      }

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      wx.hideLoading()
      console.error('操作失败:', err)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 取消
  cancel() {
    wx.navigateBack()
  }
})
