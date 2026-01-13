"""
PDF解析模块 - 用于从PDF文件中提取菜品制作说明
"""
import PyPDF2
from typing import List, Dict
import re


def parse_pdf_dishes(pdf_path: str) -> List[Dict]:
    """
    从PDF文件中解析菜品信息
    
    :param pdf_path: PDF文件路径
    :return: 菜品信息列表
    """
    dishes = []
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            full_text = ""
            
            # 读取所有页面
            for page in pdf_reader.pages:
                full_text += page.extract_text()
            
            # 按照菜品分割（假设每个菜品以【】开头）
            dish_blocks = re.split(r'【(.+?)】', full_text)
            
            for i in range(1, len(dish_blocks), 2):
                if i + 1 < len(dish_blocks):
                    dish_name = dish_blocks[i].strip()
                    dish_content = dish_blocks[i + 1].strip()
                    
                    # 提取食材和步骤
                    ingredients = extract_ingredients(dish_content)
                    steps = extract_steps(dish_content)
                    
                    dishes.append({
                        'name': dish_name,
                        'cooking_instructions': dish_content,
                        'ingredients': ingredients,
                        'steps': steps
                    })
    
    except Exception as e:
        print(f"解析PDF时出错: {e}")
    
    return dishes


def extract_ingredients(text: str) -> List[str]:
    """从文本中提取食材列表"""
    ingredients = []
    # 查找"食材："后的内容
    match = re.search(r'食材[:：](.+?)(?:\n\n|步骤|制作)', text, re.DOTALL)
    if match:
        ingredient_text = match.group(1)
        # 按行分割
        ingredients = [line.strip() for line in ingredient_text.split('\n') if line.strip()]
    return ingredients


def extract_steps(text: str) -> List[str]:
    """从文本中提取制作步骤"""
    steps = []
    # 查找"步骤："后的内容
    match = re.search(r'步骤[:：](.+?)(?:\n\n|小贴士|$)', text, re.DOTALL)
    if match:
        steps_text = match.group(1)
        # 提取编号步骤
        step_matches = re.findall(r'\d+[\.、]\s*(.+)', steps_text)
        steps = [step.strip() for step in step_matches]
    return steps


def import_dishes_to_database(pdf_path: str, category: str = "未分类"):
    """
    从PDF导入菜品到数据库
    
    :param pdf_path: PDF文件路径
    :param category: 菜品分类
    """
    from database import SessionLocal, DishModel
    
    dishes = parse_pdf_dishes(pdf_path)
    db = SessionLocal()
    
    try:
        for dish_data in dishes:
            # 检查菜品是否已存在
            existing = db.query(DishModel).filter(DishModel.name == dish_data['name']).first()
            if existing:
                print(f"菜品 {dish_data['name']} 已存在，跳过")
                continue
            
            dish = DishModel(
                name=dish_data['name'],
                price=0.0,  # 价格需要手动设置
                description='、'.join(dish_data['ingredients'][:4]) if dish_data['ingredients'] else "",
                cooking_instructions=dish_data['cooking_instructions'],
                category=category,
                is_available=True
            )
            db.add(dish)
        
        db.commit()
        print(f"成功导入 {len(dishes)} 个菜品")
    
    except Exception as e:
        db.rollback()
        print(f"导入失败: {e}")
    
    finally:
        db.close()


if __name__ == "__main__":
    # 示例用法
    import sys
    if len(sys.argv) > 1:
        pdf_file = sys.argv[1]
        category = sys.argv[2] if len(sys.argv) > 2 else "未分类"
        import_dishes_to_database(pdf_file, category)
    else:
        print("用法: python pdf_parser.py <pdf文件路径> [分类]")
