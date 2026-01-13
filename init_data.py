"""
数据初始化脚本 - 创建示例菜品数据
"""
from database import SessionLocal, DishModel, init_database


def create_sample_dishes():
    """创建示例菜品数据"""
    init_database()  # 先创建表
    
    db = SessionLocal()
    
    # 清空现有数据（可选）
    # db.query(DishModel).delete()
    
    sample_dishes = [
        {
            "name": "宫保鸡丁",
            "price": 0.0,
            "description": "鸡肉、花生、干辣椒、花椒",
            "image_url": "https://example.com/images/gongbao.jpg",
            "cooking_instructions": """【宫保鸡丁】

📋 所需食材：
  • 鸡胸肉 300g
  • 花生米 50g
  • 干辣椒 10个
  • 花椒 1小勺
  • 葱姜蒜 适量
  • 料酒、酱油、醋、糖、盐 适量

👨‍🍳 制作步骤：
  1. 鸡胸肉切丁，加料酒、盐、淀粉腌制15分钟
  2. 热油炒花生米至金黄，盛出备用
  3. 锅中留底油，放入干辣椒和花椒爆香
  4. 倒入鸡丁快速翻炒至变色
  5. 加入葱姜蒜和调味料翻炒均匀
  6. 最后加入花生米，翻炒几下即可出锅

💡 小贴士：
  火候要掌握好，鸡肉不要炒老了""",
            "category": "川菜",
            "is_available": True
        },
        {
            "name": "鱼香肉丝",
            "price": 0.0,
            "description": "猪肉、木耳、胡萝卜、青椒",
            "image_url": "https://example.com/images/yuxiang.jpg",
            "cooking_instructions": """【鱼香肉丝】

📋 所需食材：
  • 猪里脊肉 250g
  • 木耳 适量
  • 胡萝卜 1根
  • 青椒 2个
  • 葱姜蒜 适量
  • 泡椒、豆瓣酱 适量

👨‍🍳 制作步骤：
  1. 猪肉切丝，加料酒、淀粉腌制
  2. 木耳泡发切丝，胡萝卜、青椒切丝
  3. 调制鱼香汁：酱油、醋、糖、水、淀粉
  4. 热油滑炒肉丝至变色，盛出
  5. 锅中加油，炒香豆瓣酱和泡椒
  6. 加入配菜翻炒，倒入肉丝
  7. 淋入鱼香汁，快速翻炒均匀

💡 小贴士：
  鱼香汁的比例要掌握好，糖醋味要突出""",
            "category": "川菜",
            "is_available": True
        },
        {
            "name": "麻婆豆腐",
            "price": 0.0,
            "description": "豆腐、牛肉末、豆瓣酱、花椒",
            "image_url": "https://example.com/images/mapo.jpg",
            "cooking_instructions": """【麻婆豆腐】

📋 所需食材：
  • 嫩豆腐 1盒
  • 牛肉末 100g
  • 郫县豆瓣酱 2勺
  • 花椒粉 适量
  • 葱姜蒜 适量

👨‍🍳 制作步骤：
  1. 豆腐切小块，用盐水焯一下
  2. 炒香牛肉末，盛出备用
  3. 炒豆瓣酱出红油
  4. 加入高汤或清水，放入豆腐
  5. 加入牛肉末，轻轻推匀
  6. 调味后，勾芡
  7. 撒上花椒粉和葱花

💡 小贴士：
  豆腐要选嫩的，焯水可以去豆腥味""",
            "category": "川菜",
            "is_available": True
        },
        {
            "name": "红烧肉",
            "price": 0.0,
            "description": "五花肉、冰糖、酱油、料酒",
            "image_url": "https://example.com/images/hongshao.jpg",
            "cooking_instructions": """【红烧肉】

📋 所需食材：
  • 五花肉 500g
  • 冰糖 30g
  • 酱油 适量
  • 料酒 适量
  • 八角、桂皮 适量

👨‍🍳 制作步骤：
  1. 五花肉切块，焯水去血沫
  2. 锅中放冰糖炒糖色
  3. 放入五花肉翻炒上色
  4. 加入料酒、酱油、八角、桂皮
  5. 加水没过肉块，大火烧开
  6. 转小火慢炖1小时
  7. 大火收汁即可

💡 小贴士：
  糖色要炒到枣红色，不要炒糊了""",
            "category": "家常菜",
            "is_available": True
        },
        {
            "name": "清蒸鲈鱼",
            "price": 0.0,
            "description": "鲈鱼、葱姜、蒸鱼豉油",
            "image_url": "https://example.com/images/luyu.jpg",
            "cooking_instructions": """【清蒸鲈鱼】

📋 所需食材：
  • 鲈鱼 1条（约500g）
  • 葱姜 适量
  • 蒸鱼豉油 2勺
  • 料酒 1勺

👨‍🍳 制作步骤：
  1. 鲈鱼清洗干净，两面划几刀
  2. 抹上料酒和盐腌制10分钟
  3. 鱼身塞入葱姜丝
  4. 水开后上锅蒸8-10分钟
  5. 关火后焖2分钟
  6. 倒掉蒸出的水，浇上蒸鱼豉油
  7. 撒上葱丝，浇热油

💡 小贴士：
  蒸的时间不要太长，鱼肉会老""",
            "category": "海鲜",
            "is_available": True
        },
        {
            "name": "糖醋排骨",
            "price": 0.0,
            "description": "排骨、白糖、醋、料酒",
            "image_url": "https://example.com/images/tangcu.jpg",
            "cooking_instructions": """【糖醋排骨】

📋 所需食材：
  • 小排 500g
  • 白糖 3勺
  • 醋 2勺
  • 料酒 1勺
  • 酱油 1勺
  • 盐 适量

👨‍🍳 制作步骤：
  1. 排骨切段，焯水去血沫
  2. 热油炸排骨至金黄
  3. 锅中留底油，炒糖色
  4. 放入排骨翻炒
  5. 加入料酒、酱油、醋、糖
  6. 加水没过排骨，焖煮20分钟
  7. 大火收汁，撒上芝麻

💡 小贴士：
  糖醋比例可根据个人口味调整""",
            "category": "家常菜",
            "is_available": True
        }
    ]
    
    for dish_data in sample_dishes:
        # 检查是否已存在
        existing = db.query(DishModel).filter(DishModel.name == dish_data["name"]).first()
        if not existing:
            dish = DishModel(**dish_data)
            db.add(dish)
    
    db.commit()
    
    # 查询并显示所有菜品
    all_dishes = db.query(DishModel).all()
    print(f"\n成功创建 {len(sample_dishes)} 个示例菜品！")
    print("\n当前数据库中的菜品：")
    for dish in all_dishes:
        print(f"  {dish.id}. {dish.name} - {dish.category} - ¥{dish.price}")
    
    db.close()


if __name__ == "__main__":
    create_sample_dishes()
