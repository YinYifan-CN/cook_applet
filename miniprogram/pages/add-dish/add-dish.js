// pages/add-dish/add-dish.js
const api = require('../../utils/api.js')

Page({
  data: {
    id: null,
    name: '',
    price: '',
    description: '',
    cookingInstructions: '',
    isEdit: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        id: options.id,
        name: options.name || '',
        price: options.price || '',
        description: decodeURIComponent(options.description || ''),
        cookingInstructions: decodeURIComponent(options.cookingInstructions || ''),
        isEdit: true
      })
    }
  },

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

  async submitDish() {
    const { id, name, price, description, cookingInstructions, isEdit } = this.data

    if (!name || !price) {
      wx.showToast({
        title: '请填写必填项',
        icon: 'none'
      })
      return
    }

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      wx.showToast({
        title: '请输入有效价格',
        icon: 'none'
      })
      return
    }

    try {
      const dishData = {
        name,
        price: priceNum,
        description: description || '',
        cooking_instructions: cookingInstructions || '',
        category: '默认分类',
        available: true
      }

      if (isEdit) {
        await api.updateDish(id, dishData)
        wx.showToast({
          title: '修改成功',
          icon: 'success'
        })
      } else {
        await api.addDish(dishData)
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        })
      }

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('操作失败:', err)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  cancel() {
    wx.navigateBack()
  }
})
