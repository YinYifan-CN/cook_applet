# 微信小程序 - 香香厨房

## 📱 小程序端使用指南

### 快速开始

1. **安装微信开发者工具**
   - 下载：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
   - 安装并登录

2. **导入项目**
   - 打开微信开发者工具
   - 点击"+"创建项目
   - 选择 `miniprogram` 目录
   - 填入AppID（测试阶段可选"测试号"）
   - 项目名称：香香厨房
   - 点击"确定"

3. **配置后端地址**
   
   编辑 `miniprogram/utils/api.js`：
   ```javascript
   // 开发环境（本地测试）
   const API_BASE = 'http://localhost:8000'
   
   // 或使用内网穿透（ngrok/frp）
   const API_BASE = 'https://your-ngrok-url.ngrok.io'
   
   // 正式环境（上线后）
   const API_BASE = 'https://api.yourdomain.com'
   ```

4. **启动后端服务**
   ```bash
   cd /Users/yxc/MyCode/python/Cook_applet
   source aenv/bin/activate
   python Cook_applet.py
   ```

5. **配置微信开发者工具**
   - 点击右上角"详情"
   - 勾选"不校验合法域名..."（仅开发环境）
   - 点击"编译"

### 项目结构

```
miniprogram/
├── pages/              # 页面
│   ├── index/          # 菜品列表页（用户点餐）
│   ├── cart/           # 购物车页（结算）
│   ├── order/          # 订单页（用户查看订单）
│   └── merchant/       # 商家管理页（接单、改状态）
├── utils/
│   └── api.js          # API接口封装
├── app.js              # 小程序入口
├── app.json            # 全局配置
└── app.wxss            # 全局样式
```

### 功能说明

#### 用户端功能
- ✅ 浏览菜品列表
- ✅ 查看菜品详情（含制作说明）
- ✅ 添加到购物车
- ✅ 购物车管理（增减数量、删除）
- ✅ 提交订单
- ✅ 查看订单状态
- ✅ 订单筛选

#### 商家端功能
- ✅ 查看所有订单
- ✅ 订单筛选（待确认/制作中/已完成）
- ✅ 更新订单状态
- ✅ 订单详情查看
- ✅ 实时统计（总订单/待处理）

### TabBar说明

小程序底部有4个标签页：

1. **点餐** - 浏览菜品、加购物车
2. **购物车** - 结算、提交订单
3. **订单** - 查看个人订单
4. **商家** - 商家管理订单

### 开发测试流程

1. **测试点餐流程**
   - 点击"点餐" tab
   - 浏览菜品，点击"加入购物车"
   - 点击右下角浮动购物车按钮
   - 点击"去结算"
   - 填写备注（可选）
   - 点击"提交订单"

2. **测试商家管理**
   - 切换到"商家" tab
   - 查看待处理订单
   - 点击订单卡片查看详情
   - 点击状态按钮更新订单

### 注意事项

#### 开发环境
- ⚠️ 必须勾选"不校验合法域名"才能访问localhost
- ⚠️ 确保后端服务已启动在 8000 端口
- ⚠️ 小程序和后端必须在同一网络（或使用内网穿透）

#### 正式上线前
- ❌ 需要购买服务器和域名
- ❌ 必须配置HTTPS
- ❌ 在微信公众平台配置服务器域名
- ❌ 取消勾选"不校验合法域名"

### 常见问题

**Q1: 小程序无法连接后端？**
- 检查后端是否启动（http://localhost:8000）
- 检查是否勾选"不校验合法域名"
- 查看开发者工具Console是否有错误

**Q2: 提交订单后没反应？**
- 打开Console查看错误信息
- 检查后端日志
- 确认API地址配置正确

**Q3: TabBar图标不显示？**
- 图标路径配置在 `app.json` 中
- 需要自己准备图标放到 `images/` 目录
- 或者删除 tabBar.iconPath 配置（只显示文字）

### TabBar图标准备（可选）

如果想显示图标，需要准备以下图片（尺寸81px x 81px）：

```
miniprogram/images/
├── dish.png          # 点餐图标（未选中）
├── dish-active.png   # 点餐图标（选中）
├── cart.png          # 购物车图标（未选中）
├── cart-active.png   # 购物车图标（选中）
├── order.png         # 订单图标（未选中）
├── order-active.png  # 订单图标（选中）
├── merchant.png      # 商家图标（未选中）
└── merchant-active.png  # 商家图标（选中）
```

或者临时删除图标配置（只显示文字）：

编辑 `app.json`，删除所有 `iconPath` 和 `selectedIconPath` 行。

### API 接口文档

详见后端文档：http://localhost:8000/docs

### 下一步

1. ✅ 本地测试通过后，申请微信小程序账号
2. ✅ 购买服务器和域名，配置HTTPS
3. ✅ 部署后端到服务器
4. ✅ 修改 `utils/api.js` 中的API地址为正式域名
5. ✅ 在微信公众平台配置服务器域名
6. ✅ 上传代码，提交审核

### 技术栈

- 微信小程序原生开发
- FastAPI后端
- SQLite数据库（可升级为MySQL/PostgreSQL）

---

**需要帮助？** 查看 `../微信小程序上架指南.md` 获取详细上线流程。
