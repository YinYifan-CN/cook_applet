"""
点菜系统微信小程序后端 - 主应用文件
支持用户端点餐和商家端接单功能
"""
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dataclasses import dataclass, asdict
from typing import List, Optional
from datetime import datetime
from enum import Enum
from contextlib import asynccontextmanager
import json
import asyncio
import os

# 定义生命周期管理器
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化数据
    from database import SessionLocal, DishModel
    db = SessionLocal()
    try:
        db_dishes = db.query(DishModel).all()
        for db_dish in db_dishes:
            dish = Dish(
                id=db_dish.id,
                name=db_dish.name,
                price=db_dish.price,
                description=db_dish.description,
                image_url=db_dish.image_url,
                cooking_instructions=db_dish.cooking_instructions,
                category=db_dish.category,
                is_available=db_dish.is_available
            )
            dishes_db.append(dish)
        print(f"已加载 {len(dishes_db)} 个菜品")
    except Exception as e:
        print(f"加载数据失败: {e}")
    finally:
        db.close()
    
    print("点菜系统API启动成功！")
    print("=" * 50)
    print("📱 用户端页面: http://yxcmqx.top:8000/demo.html")
    print("🏪 商家端页面: http://yxcmqx.top:8000/merchant.html")
    print("📖 API文档: http://yxcmqx.top:8000/docs")
    print("🔌 WebSocket: ws://yxcmqx.top:8000/ws/merchant")
    print("=" * 50)
    
    yield
    
    # 关闭时的清理工作（如需要）
    print("应用正在关闭...")

# 创建FastAPI应用
app = FastAPI(
    title="点菜系统API", 
    description="支持用户点餐和商家接单的后端服务",
    lifespan=lifespan
)

# 配置CORS，允许微信小程序访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制为微信小程序域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== 数据模型定义 ====================

class OrderStatus(str, Enum):
    """订单状态枚举"""
    PENDING = "pending"  # 待接单（用户刚下单）
    ACCEPTED = "accepted"  # 已接单（商家已接单）
    PREPARING = "preparing"  # 制作中（商家正在制作）
    COMPLETED = "completed"  # 已完成（制作完成）
    CANCELLED = "cancelled"  # 已取消


@dataclass
class Dish:
    """菜品模型"""
    id: int
    name: str
    price: float
    description: str
    category: str
    image_url: Optional[str] = None
    cooking_instructions: Optional[str] = None  # 制作说明
    is_available: bool = True


@dataclass
class OrderItem:
    """订单项模型"""
    dish_id: int
    dish_name: str
    quantity: int
    price: float


@dataclass
class Order:
    """订单模型"""
    id: str
    user_id: str
    user_name: str
    total_amount: float
    status: OrderStatus
    items: List[OrderItem]
    created_at: datetime
    updated_at: datetime
    note: Optional[str] = None


@dataclass
class CreateOrderRequest:
    """创建订单请求"""
    user_id: str
    user_name: str
    items: List[OrderItem]
    note: Optional[str] = None


@dataclass
class PaymentRequest:
    """支付请求"""
    order_id: str
    payment_method: str  # "wechat"
    amount: float


# ==================== 数据存储（示例用内存存储，生产环境应使用数据库）====================

# 菜品数据存储
dishes_db: List[Dish] = []

# 订单数据存储
orders_db: List[Order] = []
order_id_counter = 1

# WebSocket连接管理器（用于实时通知商家）
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass


manager = ConnectionManager()

# ==================== 辅助函数 ====================

def serialize_datetime(obj):
    """JSON序列化时处理datetime对象"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

def dataclass_to_dict(obj):
    """将dataclass对象转换为字典，处理datetime等特殊类型"""
    if hasattr(obj, '__dataclass_fields__'):
        result = asdict(obj)
        # 递归处理字典中的datetime对象
        return _convert_datetime_in_dict(result)
    elif isinstance(obj, list):
        return [dataclass_to_dict(item) for item in obj]
    elif isinstance(obj, datetime):
        return obj.isoformat()
    else:
        return obj

def _convert_datetime_in_dict(data):
    """递归转换字典中的datetime对象"""
    if isinstance(data, dict):
        return {key: _convert_datetime_in_dict(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [_convert_datetime_in_dict(item) for item in data]
    elif isinstance(data, datetime):
        return data.isoformat()
    else:
        return data


# ==================== 静态文件服务 ====================

# 获取当前文件所在目录
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.get("/demo.html")
async def serve_demo():
    """提供用户端演示页面"""
    file_path = os.path.join(BASE_DIR, "demo.html")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/merchant.html")
async def serve_merchant():
    """提供商家端管理页面"""
    file_path = os.path.join(BASE_DIR, "merchant.html")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/")
async def root():
    """根路径重定向到用户端页面"""
    return {"message": "点菜系统API", "user_page": "/demo.html", "merchant_page": "/merchant.html", "docs": "/docs"}


# ==================== 用户端 API ====================

@app.get("/api/user/dishes")
async def get_dishes():
    """获取所有可用菜品"""
    available_dishes = [dish for dish in dishes_db if dish.is_available]
    return [dataclass_to_dict(dish) for dish in available_dishes]


@app.get("/api/user/dishes/{dish_id}")
async def get_dish(dish_id: int):
    """获取单个菜品详情"""
    dish = next((d for d in dishes_db if d.id == dish_id and d.is_available), None)
    if not dish:
        raise HTTPException(status_code=404, detail="菜品不存在")
    return dataclass_to_dict(dish)


@app.get("/api/user/categories")
async def get_categories():
    """获取所有菜品分类"""
    categories = list(set(dish.category for dish in dishes_db))
    return {"categories": categories}


@app.post("/api/user/orders")
async def create_order(request_data: dict):
    """创建订单"""
    global order_id_counter
    from utils import generate_order_number
    
    # 验证必需字段
    required_fields = ['user_id', 'user_name', 'items']
    for field in required_fields:
        if field not in request_data:
            raise HTTPException(status_code=400, detail=f"缺少必需字段: {field}")
    
    # 验证items是列表且不为空
    if not isinstance(request_data['items'], list) or not request_data['items']:
        raise HTTPException(status_code=400, detail="items必须是非空列表")
    
    # 创建 OrderItem 对象
    items = []
    for item_data in request_data['items']:
        if not all(key in item_data for key in ['dish_id', 'dish_name', 'quantity', 'price']):
            raise HTTPException(status_code=400, detail="订单项数据不完整")
        items.append(OrderItem(
            dish_id=item_data['dish_id'],
            dish_name=item_data['dish_name'],
            quantity=item_data['quantity'],
            price=item_data['price']
        ))
    
    # 计算总价
    total_amount = sum(item.price * item.quantity for item in items)
    
    # 生成订单号
    order_id = generate_order_number()
    
    # 创建订单
    order = Order(
        id=order_id,
        user_id=request_data['user_id'],
        user_name=request_data['user_name'],
        total_amount=total_amount,
        status=OrderStatus.PENDING,
        items=items,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        note=request_data.get('note')
    )
    
    orders_db.append(order)
    order_id_counter += 1
    
    # 通知商家端（WebSocket）
    await manager.broadcast(json.dumps({
        "type": "new_order",
        "order": {
            "id": order.id,
            "user_name": order.user_name,
            "total_amount": order.total_amount,
            "items_count": len(order.items)
        }
    }, ensure_ascii=False))
    
    print(f"📦 新订单创建: {order.id}, 通知了 {len(manager.active_connections)} 个WebSocket连接")
    
    return dataclass_to_dict(order)


@app.post("/api/user/payment")
async def process_payment(request_data: dict):
    """处理支付（示例实现）"""
    # 验证必需字段
    required_fields = ['order_id', 'payment_method', 'amount']
    for field in required_fields:
        if field not in request_data:
            raise HTTPException(status_code=400, detail=f"缺少必需字段: {field}")
    
    order = next((o for o in orders_db if o.id == request_data['order_id']), None)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    # 这里应该调用微信支付API
    # 示例：直接标记为已支付
    return {
        "success": True,
        "message": "支付成功",
        "order_id": request.order_id,
        "transaction_id": f"TXN{request.order_id}{int(datetime.now().timestamp())}"
    }


@app.get("/api/user/orders/{user_id}")
async def get_user_orders(user_id: str):
    """获取用户的订单历史"""
    user_orders = [o for o in orders_db if o.user_id == user_id]
    return user_orders


# ==================== 商家端 API ====================

@app.get("/api/merchant/orders")
async def get_all_orders(status: Optional[str] = None):
    """获取所有订单（可按状态筛选）"""
    if status:
        filtered_orders = [o for o in orders_db if o.status == status]
        return [dataclass_to_dict(order) for order in filtered_orders]
    return [dataclass_to_dict(order) for order in orders_db]


@app.get("/api/merchant/orders/{order_id}")
async def get_order_detail(order_id: str):
    """获取订单详情（包含菜品制作说明）"""
    order = next((o for o in orders_db if o.id == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    # 为每个订单项添加制作说明
    order_dict = asdict(order)
    enhanced_items = []
    for item in order.items:
        dish = next((d for d in dishes_db if d.id == item.dish_id), None)
        item_dict = asdict(item)
        if dish:
            item_dict["cooking_instructions"] = dish.cooking_instructions
            item_dict["description"] = dish.description
        enhanced_items.append(item_dict)
    
    order_dict["items"] = enhanced_items
    return order_dict


@dataclass
class UpdateOrderStatusRequest:
    """更新订单状态请求"""
    status: str

@app.put("/api/merchant/orders/{order_id}")
async def update_order_status(order_id: str, request_data: dict):
    """更新订单状态"""
    # 验证必需字段
    if 'status' not in request_data:
        raise HTTPException(status_code=400, detail="缺少必需字段: status")
    
    order = next((o for o in orders_db if o.id == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    order.status = request_data['status']
    order.updated_at = datetime.now()
    
    print(f"✅ 订单 {order_id} 状态更新为: {request_data['status']}")
    
    return {"success": True, "message": "状态更新成功", "order": dataclass_to_dict(order)}


@app.post("/api/merchant/orders/{order_id}/accept")
async def accept_order(order_id: str):
    """商家接单"""
    order = next((o for o in orders_db if o.id == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail="订单状态不正确，无法接单")
    
    order.status = OrderStatus.ACCEPTED
    order.updated_at = datetime.now()
    
    print(f"✅ 商家已接单: {order_id}")
    
    return {"success": True, "message": "接单成功", "order": dataclass_to_dict(order)}


@app.post("/api/merchant/orders/{order_id}/start")
async def start_preparing(order_id: str):
    """开始制作订单"""
    order = next((o for o in orders_db if o.id == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    if order.status != OrderStatus.ACCEPTED:
        raise HTTPException(status_code=400, detail="订单状态不正确，请先接单")
    
    order.status = OrderStatus.PREPARING
    order.updated_at = datetime.now()
    
    print(f"🍳 开始制作订单: {order_id}")
    
    return {"success": True, "message": "开始制作", "order": dataclass_to_dict(order)}


@app.post("/api/merchant/orders/{order_id}/complete")
async def complete_order(order_id: str):
    """完成订单"""
    order = next((o for o in orders_db if o.id == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    if order.status != OrderStatus.PREPARING:
        raise HTTPException(status_code=400, detail="订单状态不正确，请先开始制作")
    
    order.status = OrderStatus.COMPLETED
    order.updated_at = datetime.now()
    
    print(f"✅ 订单已完成: {order_id}")
    
    return {"success": True, "message": "订单已完成", "order": dataclass_to_dict(order)}


@app.post("/api/merchant/orders/{order_id}/cancel")
async def cancel_order(order_id: str):
    """取消订单"""
    order = next((o for o in orders_db if o.id == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    if order.status == OrderStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="订单已完成，无法取消")
    
    order.status = OrderStatus.CANCELLED
    order.updated_at = datetime.now()
    
    print(f"❌ 订单已取消: {order_id}")
    
    return {"success": True, "message": "订单已取消", "order": dataclass_to_dict(order)}


@app.post("/api/merchant/dishes")
async def add_dish(dish_data: dict):
    """添加新菜品"""
    # 验证必需字段
    required_fields = ['name', 'category', 'price', 'description']
    for field in required_fields:
        if field not in dish_data:
            raise HTTPException(status_code=400, detail=f"缺少必需字段: {field}")
    
    from database import SessionLocal, DishModel
    db = SessionLocal()
    try:
        # 创建数据库记录
        db_dish = DishModel(
            name=dish_data['name'],
            category=dish_data['category'],
            price=dish_data['price'],
            description=dish_data['description'],
            cooking_instructions=dish_data.get('cooking_instructions'),
            is_available=dish_data.get('is_available', True),
            image_url=dish_data.get('image_url')
        )
        db.add(db_dish)
        db.commit()
        db.refresh(db_dish)
        
        # 更新内存中的数据
        new_dish = Dish(
            id=db_dish.id,
            name=db_dish.name,
            category=db_dish.category,
            price=db_dish.price,
            description=db_dish.description,
            cooking_instructions=db_dish.cooking_instructions,
            is_available=db_dish.is_available,
            image_url=db_dish.image_url
        )
        dishes_db.append(new_dish)
        
        print(f"✅ 新菜品已添加: {new_dish.name} (ID: {new_dish.id})")
        return dataclass_to_dict(new_dish)
    except Exception as e:
        db.rollback()
        print(f"❌ 添加菜品失败: {e}")
        raise HTTPException(status_code=500, detail=f"添加失败: {str(e)}")
    finally:
        db.close()


@app.put("/api/merchant/dishes/{dish_id}")
async def update_dish(dish_id: int, dish_data: dict):
    """更新菜品信息"""
    # 验证必需字段
    required_fields = ['name', 'category', 'price', 'description']
    for field in required_fields:
        if field not in dish_data:
            raise HTTPException(status_code=400, detail=f"缺少必需字段: {field}")
    from database import SessionLocal, DishModel
    db = SessionLocal()
    try:
        # 查找数据库记录
        db_dish = db.query(DishModel).filter(DishModel.id == dish_id).first()
        if not db_dish:
            raise HTTPException(status_code=404, detail="菜品不存在")
        
        # 更新数据库
        db_dish.name = dish_data['name']
        db_dish.category = dish_data['category']
        db_dish.price = dish_data['price']
        db_dish.description = dish_data['description']
        db_dish.cooking_instructions = dish_data.get('cooking_instructions')
        db_dish.is_available = dish_data.get('is_available', True)
        db_dish.image_url = dish_data.get('image_url')
        
        db.commit()
        db.refresh(db_dish)
        
        # 创建更新后的菜品对象
        updated_dish = Dish(
            id=db_dish.id,
            name=db_dish.name,
            category=db_dish.category,
            price=db_dish.price,
            description=db_dish.description,
            cooking_instructions=db_dish.cooking_instructions,
            is_available=db_dish.is_available,
            image_url=db_dish.image_url
        )
        
        # 更新内存中的数据
        index = next((i for i, d in enumerate(dishes_db) if d.id == dish_id), None)
        if index is not None:
            dishes_db[index] = updated_dish
        
        print(f"✅ 菜品已更新: {updated_dish.name} (ID: {dish_id})")
        return dataclass_to_dict(updated_dish)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ 更新菜品失败: {e}")
        raise HTTPException(status_code=500, detail=f"更新失败: {str(e)}")
    finally:
        db.close()


@app.delete("/api/merchant/dishes/{dish_id}")
async def delete_dish(dish_id: int):
    """删除菜品"""
    from database import SessionLocal, DishModel
    db = SessionLocal()
    try:
        # 查找数据库记录
        db_dish = db.query(DishModel).filter(DishModel.id == dish_id).first()
        if not db_dish:
            raise HTTPException(status_code=404, detail="菜品不存在")
        
        # 从数据库删除
        db.delete(db_dish)
        db.commit()
        
        # 从内存删除
        global dishes_db
        dishes_db = [d for d in dishes_db if d.id != dish_id]
        
        print(f"✅ 菜品已删除: ID {dish_id}")
        return {"success": True, "message": "删除成功"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ 删除菜品失败: {e}")
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")
    finally:
        db.close()


# ==================== WebSocket ====================

@app.websocket("/ws/merchant")
async def websocket_endpoint(websocket: WebSocket):
    """商家端WebSocket连接（实时接收订单通知）"""
    await manager.connect(websocket)
    print(f"🔌 商家端WebSocket已连接，当前连接数: {len(manager.active_connections)}")
    try:
        while True:
            # 保持连接，等待客户端消息
            data = await websocket.receive_text()
            # 可以处理客户端发来的消息
            print(f"📨 收到商家端消息: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"❌ 商家端WebSocket断开连接，剩余连接数: {len(manager.active_connections)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
