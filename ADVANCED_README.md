# 高级聊天机器人后端

这是一个使用 FastAPI 构建的高级聊天机器人后端，与 uniapp 前端配合使用，提供文本和语音消息处理功能，包括语音转文本和文本转语音功能。

## 功能特点

- 接收文本消息并生成回复
- 接收语音文件并返回语音URL
- 语音转文本功能（模拟实现）
- 文本转语音功能（模拟实现）
- 提供静态文件访问
- 支持CORS跨域请求
- 异步处理提高性能

## 安装与运行

1. 安装依赖：

```bash
pip install -r requirements.txt
```

2. 运行服务器：

```bash
python advanced_main.py
```

服务器将在 http://0.0.0.0:8000 上运行。

## API 接口

### 1. 发送消息

- **URL**: `/api/messages`
- **方法**: POST
- **请求体**:
  ```json
  {
    "message": "你好",
    "type": "text",
    "timestamp": 1677123456789
  }
  ```
- **响应**:
  ```json
  {
    "reply": "你好！很高兴见到你。",
    "type": "text"
  }
  ```
  或
  ```json
  {
    "reply": "你好！很高兴见到你。",
    "type": "voice",
    "voiceUrl": "/uploads/tts/123e4567-e89b-12d3-a456-426614174000.mp3",
    "duration": 3
  }
  ```

### 2. 上传语音文件

- **URL**: `/api/messages/upload`
- **方法**: POST
- **表单数据**:
  - `voice`: 语音文件
  - `duration`: 语音时长（秒）
- **响应**:
  ```json
  {
    "success": true,
    "voiceUrl": "/uploads/voice/123e4567-e89b-12d3-a456-426614174000.mp3",
    "duration": 5
  }
  ```

### 3. 访问上传的文件

- **URL**: `/uploads/{filename}`
- **方法**: GET

## 集成真实语音服务

当前版本使用模拟的语音服务。要集成真实的语音服务，你需要：

1. 修改 `speech_to_text` 函数，连接到真实的语音识别API（如百度语音、讯飞等）
2. 修改 `text_to_speech` 函数，连接到真实的语音合成API

## 自定义回复逻辑

要自定义回复逻辑，请修改 `advanced_main.py` 中的 `generate_text_reply` 函数。你可以：

1. 添加更多关键词匹配
2. 集成外部AI模型（如GPT-3、ChatGPT等）
3. 连接数据库获取信息

## 目录结构

```
/
├── advanced_main.py     # 高级版本主应用
├── main.py              # 基础版本主应用
├── requirements.txt     # 依赖项
├── README.md            # 基础版本说明
├── ADVANCED_README.md   # 高级版本说明
└── uploads/             # 上传文件目录
    ├── voice/           # 语音文件目录
    └── tts/             # 文本转语音文件目录
```

## 注意事项

- 生产环境中应该限制CORS的 `allow_origins`
- 上传目录 `uploads` 会自动创建
- 语音文件使用UUID生成唯一文件名
- 当前版本使用模拟的语音服务，实际应用中需要替换为真实的语音API 