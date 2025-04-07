# 聊天机器人后端

这是一个使用 FastAPI 构建的聊天机器人后端，与 uniapp 前端配合使用，提供文本和语音消息处理功能。

## 功能特点

- 接收文本消息并生成回复
- 接收语音文件并返回语音URL
- 提供静态文件访问
- 支持CORS跨域请求

## 安装与运行

1. 安装依赖：

```bash
pip install -r requirements.txt
```

2. 运行服务器：

```bash
python main.py
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
    "voiceUrl": "/uploads/123e4567-e89b-12d3-a456-426614174000.mp3",
    "duration": 5
  }
  ```

### 3. 访问上传的文件

- **URL**: `/uploads/{filename}`
- **方法**: GET

## 自定义回复逻辑

要自定义回复逻辑，请修改 `main.py` 中的 `generate_text_reply` 函数。你可以：

1. 添加更多关键词匹配
2. 集成外部AI模型
3. 连接数据库获取信息

## 注意事项

- 生产环境中应该限制CORS的 `allow_origins`
- 上传目录 `uploads` 会自动创建
- 语音文件使用UUID生成唯一文件名 