#!/bin/bash

# 创建临时JSON文件存储工具函数
cat > tools.json << 'EOF'
[
  {
    "name": "weather",
    "description": "获取天气信息",
    "parameters": {
      "location": "城市名称"
    }
  },
  {
    "name": "calendar",
    "description": "查看日历事件",
    "parameters": {
      "date": "日期"
    }
  }
]
EOF

# 执行curl请求
# 请将 sample.wav 替换为实际的音频文件路径
curl -X POST http://localhost:3000/api/voice-function-call \
  -F "audio=@sample.wav" \
  -F "tools=@tools.json" \
  -H "Content-Type: multipart/form-data" \
  | jq '.'

# 删除临时JSON文件
rm tools.json 