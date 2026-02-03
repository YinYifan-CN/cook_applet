"""
测试dataclass版本的点菜系统
"""
import asyncio
import json
from Cook_applet import app
from fastapi.testclient import TestClient

def test_api_without_pydantic():
    """测试无Pydantic版本的API"""
    client = TestClient(app)
    
    print("🧪 测试无Pydantic版本的API...")
    
    # 1. 测试获取菜品列表
    response = client.get("/api/user/dishes")
    print(f"📋 获取菜品列表: {response.status_code}")
    if response.status_code == 200:
        dishes = response.json()
        print(f"   找到 {len(dishes)} 个菜品")
    
    # 2. 测试创建订单
    order_data = {
        "user_id": "test_user_123",
        "user_name": "测试用户",
        "items": [
            {
                "dish_id": 1,
                "dish_name": "宫保鸡丁",
                "quantity": 2,
                "price": 28.0
            }
        ],
        "note": "不要太辣"
    }
    
    response = client.post("/api/user/orders", json=order_data)
    print(f"📦 创建订单: {response.status_code}")
    if response.status_code == 200:
        order = response.json()
        print(f"   订单ID: {order.get('id', 'N/A')}")
        print(f"   总金额: {order.get('total_amount', 'N/A')}")
        
        # 3. 测试获取订单列表
        response = client.get("/api/merchant/orders")
        print(f"📊 获取订单列表: {response.status_code}")
        if response.status_code == 200:
            orders = response.json()
            print(f"   订单数量: {len(orders)}")
    
    print("✅ API测试完成")

if __name__ == "__main__":
    test_api_without_pydantic()