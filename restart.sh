#!/bin/bash
# 点菜系统重启脚本

echo "🔄 正在停止旧进程..."
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "✅ 旧进程已停止" || echo "ℹ️  没有运行中的进程"

sleep 1

echo "🚀 正在启动服务器..."
cd /Users/yxc/MyCode/python/Cook_applet
source aenv/bin/activate
python Cook_applet.py
