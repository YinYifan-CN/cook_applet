"""
数据库模型定义（使用SQLAlchemy）
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import enum

Base = declarative_base()


class OrderStatusEnum(enum.Enum):
    """订单状态枚举"""
    PENDING = "pending"
    ACCEPTED = "accepted"
    PREPARING = "preparing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class DishModel(Base):
    """菜品数据表"""
    __tablename__ = "dishes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    price = Column(Float, nullable=False)
    description = Column(Text)
    image_url = Column(String(500))
    cooking_instructions = Column(Text)  # 制作说明（从PDF解析）
    category = Column(String(50), index=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)


class OrderModel(Base):
    """订单数据表"""
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    user_name = Column(String(100))
    total_price = Column(Float, nullable=False)
    status = Column(SQLEnum(OrderStatusEnum), default=OrderStatusEnum.PENDING, index=True)
    items = Column(Text)  # JSON格式存储订单项目
    note = Column(Text)
    payment_status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.now, index=True)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class UserModel(Base):
    """用户数据表"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    openid = Column(String(100), unique=True, index=True)
    nickname = Column(String(100))
    phone = Column(String(20))
    created_at = Column(DateTime, default=datetime.now)


# 数据库连接
DATABASE_URL = "sqlite:///./cook_applet.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_database():
    """初始化数据库（创建所有表）"""
    Base.metadata.create_all(bind=engine)
    print("数据库表创建成功！")


if __name__ == "__main__":
    init_database()
