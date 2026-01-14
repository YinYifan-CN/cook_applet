# 📱 香香厨房 - 点菜小程序系统

基于Python FastAPI的微信小程序点餐系统，包含**用户端和商家端两个独立小程序**，支持完整的订单流程和制作说明查看。

## 🎯 项目亮点

⭐ **用户端和商家端完全分离** - 两个独立小程序，各司其职  
⭐ **制作说明功能** - 商家可查看每道菜的详细制作步骤  
⭐ **订单流程管理** - 待接单→已接单→制作中→已完成  
⭐ **实时通知** - WebSocket实时推送新订单  

## 📂 项目结构

```
├── 📱 miniprogram/              # 用户端小程序（点餐、购物车、订单）
├── 🏪 miniprogram-merchant/     # 商家端小程序（订单管理、菜品管理）
├── Cook_applet.py               # FastAPI后端服务
├── database.py                  # 数据库模型
└── cook_applet.db               # SQLite数据库
```

## ✨ 功能特性

### 👤 用户端小程序（miniprogram）
- 📱 浏览菜品列表
- 🛒 购物车管理
- 📝 下单并填写备注
- 📖 菜品详情查看（含制作说明）
- 💳 在线下单与支付
- 📝 订单备注

### 商家端
- 🏪 实时订单管理
- 📊 订单统计与数据分析
- 🔔 WebSocket实时订单通知
- 👨‍🍳 订单状态流转（待确认→已确认→制作中→待取餐→已完成）
- 💰 收入统计

### 系统特性
- 🗄️ SQLite数据库存储
- 📄 PDF菜谱解析
- ⚡ 异步API设计
- 🔌 WebSocket实时通信
- 🎨 响应式UI设计

## 📁 项目结构

```
Cook_applet/
├── Cook_applet.py          # 主应用程序（FastAPI）
├── database.py             # 数据库模型定义
├── config.py               # 配置文件
├── utils.py                # 工具函数
├── pdf_parser.py           # PDF解析模块
├── init_data.py            # 初始化示例数据
├── requirements.txt        # Python依赖
├── start.sh                # 启动脚本
├── restart.sh              # 重启脚本
├── demo.html               # 用户端界面
├── merchant.html           # 商家端界面
├── cook_applet.db          # SQLite数据库（运行后生成）
└── README.md               # 项目文档
```

## 🚀 快速开始

### 1. 环境要求

- Python 3.8+
- pip

### 2. 安装依赖

```bash
# 激活虚拟环境（如果有）
source aenv/bin/activate

# 安装Python包
pip install -r requirements.txt
```

### 3. 初始化数据库

```bash
# 创建数据库表
python database.py

# 导入示例菜品数据（6道菜）
python init_data.py
```

### 4. 启动服务器

```bash
# 方式1：使用启动脚本
./start.sh

# 方式2：使用重启脚本（会先清理8000端口）
./restart.sh

# 方式3：直接运行
python Cook_applet.py
```

服务器将在 `http://localhost:8000` 启动

### 5. 访问系统

- **用户端**: http://localhost:8000/demo.html
- **商家端**: http://localhost:8000/merchant.html
- **API文档**: http://localhost:8000/docs

## 📦 依赖说明

```
fastapi==0.104.1         # Web框架
uvicorn==0.24.0          # ASGI服务器
sqlalchemy==2.0.23       # ORM框架
PyPDF2==3.0.1            # PDF解析
websockets==12.0         # WebSocket支持
```

## 🔧 配置说明

编辑 `config.py` 修改配置：

```python
DATABASE_URL = "sqlite:///cook_applet.db"  # 数据库路径
HOST = "0.0.0.0"                           # 服务器地址
PORT = 8000                                # 服务器端口
```

## 📋 API接口

### 用户端接口

- `GET /api/user/dishes` - 获取菜品列表
- `GET /api/user/categories` - 获取菜品分类
- `POST /api/user/orders` - 创建订单
- `POST /api/user/payment` - 支付订单

### 商家端接口

- `GET /api/merchant/orders` - 获取所有订单
- `PUT /api/merchant/orders/{order_id}` - 更新订单状态
- `GET /api/merchant/dishes` - 获取菜品管理列表
- `WS /ws/merchant` - WebSocket实时通知

## 🗃️ 数据库模型

### DishModel（菜品表）
- id: 主键
- name: 菜品名称
- category: 分类
- price: 价格
- description: 描述
- cooking_instructions: 制作说明
- image_url: 图片URL
- is_available: 是否可售

### OrderModel（订单表）
- id: 订单号（格式：ORD20240101120000）
- user_id: 用户ID
- user_name: 用户名
- items: 订单项（JSON）
- total_amount: 总金额
- status: 状态（pending/confirmed/preparing/ready/completed）
- note: 备注
- created_at: 创建时间
- updated_at: 更新时间

### UserModel（用户表）
- id: 用户ID
- openid: 微信OpenID
- nickname: 昵称
- phone: 手机号
- created_at: 注册时间

## 🎯 示例菜品

系统预置6道经典菜品：

1. **宫保鸡丁** - 川菜经典，鸡肉与花生的完美搭配
2. **鱼香肉丝** - 酸甜可口，色香味俱全
3. **麻婆豆腐** - 麻辣鲜香，下饭神器
4. **红烧肉** - 肥而不腻，入口即化
5. **清蒸鲈鱼** - 鲜嫩可口，原汁原味
6. **糖醋排骨** - 酸甜适中，外酥里嫩

每道菜都包含详细的制作说明（食材、调料、步骤）。

## 🔄 订单流程

```
用户下单 → 待确认(pending) → 已确认(confirmed) 
         → 制作中(preparing) → 待取餐(ready) 
         → 已完成(completed)
```

## 🛠️ 开发说明

### 添加新菜品

```python
from database import SessionLocal, DishModel

session = SessionLocal()
new_dish = DishModel(
    name="新菜名",
    category="分类",
    price=29.99,
    description="菜品描述",
    cooking_instructions="制作说明",
    is_available=True
)
session.add(new_dish)
session.commit()
```

### PDF菜谱解析

将菜谱PDF放入项目目录，使用：

```python
from pdf_parser import parse_pdf_dishes

dishes = parse_pdf_dishes("菜谱.pdf")
```

## 🐛 常见问题

### 1. 端口被占用

```bash
# 查看占用8000端口的进程
lsof -ti:8000

# 杀死进程
lsof -ti:8000 | xargs kill -9

# 或使用restart.sh自动处理
./restart.sh
```

### 2. 数据库未初始化

```bash
python database.py
python init_data.py
```

### 3. WebSocket连接失败

确保后端服务正常运行，检查浏览器控制台是否有CORS错误。

## 📝 更新日志

### v1.0.0 (2024-01-01)
- ✅ 完成用户端点餐功能
- ✅ 完成商家端订单管理
- ✅ 实现WebSocket实时通知
- ✅ 添加菜品详情展示
- ✅ 支持订单状态流转
- ✅ 集成PDF菜谱解析

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

如有问题，请提交Issue或联系开发者。

---

**享受烹饪，享受生活！🍳**