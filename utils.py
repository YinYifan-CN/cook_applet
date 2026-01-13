"""
工具函数模块
"""
import hashlib
import time
import random
import string


def generate_order_number():
    """生成唯一订单号"""
    timestamp = str(int(time.time() * 1000))
    random_str = ''.join(random.choices(string.digits, k=6))
    return f"ORD{timestamp}{random_str}"


def generate_wechat_signature(params: dict, api_key: str) -> str:
    """
    生成微信签名
    :param params: 参数字典
    :param api_key: API密钥
    :return: 签名字符串
    """
    # 按照key排序
    sorted_params = sorted(params.items())
    # 拼接成字符串
    string_params = '&'.join([f"{k}={v}" for k, v in sorted_params if v])
    # 添加key
    string_params += f"&key={api_key}"
    # MD5加密并转大写
    return hashlib.md5(string_params.encode()).hexdigest().upper()


def parse_wechat_xml_response(xml_str: str) -> dict:
    """
    解析微信XML响应
    :param xml_str: XML字符串
    :return: 字典
    """
    import xml.etree.ElementTree as ET
    root = ET.fromstring(xml_str)
    return {child.tag: child.text for child in root}
