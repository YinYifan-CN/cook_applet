#!/bin/bash
# 点菜系统启动脚本

echo "🚀 正在启动点菜系统..."

# 激活虚拟环境
if [ -d "aenv" ]; then
    source aenv/bin/activate
    echo "✅ 虚拟环境已激活"
else
    echo "⚠️  虚拟环境不存在，请先创建: python3 -m venv aenv"
    exit 1
fi

# 启动服务器
python Cook_applet.py
