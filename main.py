from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os
import time
import uuid
import shutil
from datetime import datetime

# 创建FastAPI应用
app = FastAPI(title="聊天机器人API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，生产环境中应该限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建上传目录
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
    os.makedirs(os.path.join(UPLOAD_DIR, "voice"))
    os.makedirs(os.path.join(UPLOAD_DIR, "tts"))

# 挂载静态文件目录
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 定义消息模型
class Message(BaseModel):
    message: str
    type: str = "text"
    timestamp: int
    voiceUrl: Optional[str] = None
    duration: Optional[int] = None

# 定义回复模型
class Reply(BaseModel):
    reply: str
    type: str = "text"
    voiceUrl: Optional[str] = None
    duration: Optional[int] = None

# 存储消息历史
message_history = []

# 路由：接收消息
@app.post("/api/messages", response_model=Reply)
async def receive_message(message: Message):
    # 记录消息
    message_history.append({
        "content": message.message,
        "type": message.type,
        "timestamp": message.timestamp,
        "voiceUrl": message.voiceUrl,
        "duration": message.duration
    })
    
    # 根据消息类型生成回复
    if message.type == "text":
        # 简单的文本回复逻辑
        reply_text = generate_text_reply(message.message)
        return Reply(reply=reply_text, type="text")
    elif message.type == "voice":
        # 处理语音消息
        reply_text = "我收到了你的语音消息，正在处理中..."
        return Reply(reply=reply_text, type="text")
    else:
        return Reply(reply="不支持的消息类型", type="text")

# 路由：上传语音文件
@app.post("/api/messages/upload")
async def upload_voice(voice: UploadFile = File(...), duration: int = Form(...)):
    # 生成唯一文件名
    file_extension = os.path.splitext(voice.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # 保存文件
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(voice.file, buffer)
    
    # 返回文件URL
    voice_url = f"/uploads/{unique_filename}"
    
    return JSONResponse({
        "success": True,
        "voiceUrl": voice_url,
        "duration": duration
    })

# 路由：提供静态文件访问
@app.get("/uploads/{filename}")
async def get_upload(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)

# 生成文本回复的简单函数
def generate_text_reply(message: str) -> str:
    # 这里可以实现更复杂的回复逻辑，例如调用AI模型
    # 目前使用简单的关键词匹配
    message = message.lower()
    
    if "你好" in message or "hi" in message or "hello" in message:
        return "你好！很高兴见到你。"
    elif "再见" in message or "拜拜" in message or "goodbye" in message:
        return "再见！有需要随时找我聊天。"
    elif "谢谢" in message or "感谢" in message:
        return "不客气！很高兴能帮到你。"
    elif "名字" in message or "你是谁" in message:
        return "我是AI助手，可以回答你的问题和陪你聊天。"
    elif "天气" in message:
        return "抱歉，我目前无法查询实时天气信息。"
    elif "时间" in message or "几点" in message:
        current_time = datetime.now().strftime("%H:%M")
        return f"现在是 {current_time}。"
    else:
        return f"我收到了你的消息："{message}"。有什么我可以帮你的吗？"

# 启动服务器
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 