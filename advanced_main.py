from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
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
import json
import asyncio
from datetime import datetime
import aiohttp
import aiofiles
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(title="高级聊天机器人API")

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
VOICE_DIR = os.path.join(UPLOAD_DIR, "voice")
TTS_DIR = os.path.join(UPLOAD_DIR, "tts")

for directory in [UPLOAD_DIR, VOICE_DIR, TTS_DIR]:
    if not os.path.exists(directory):
        os.makedirs(directory)

# 挂载静态文件目录
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

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

# 语音转文本API配置
# 这里使用模拟的API，实际使用时替换为真实的语音识别API
async def speech_to_text(audio_file_path: str) -> str:
    """
    将语音文件转换为文本
    实际项目中应替换为真实的语音识别API，如百度语音、讯飞等
    """
    logger.info(f"开始语音转文本: {audio_file_path}")
    
    # 模拟API调用延迟
    await asyncio.sleep(1)
    
    # 模拟返回结果
    # 实际项目中，这里应该调用真实的语音识别API
    return "这是一段模拟的语音转文本结果，实际项目中应替换为真实的语音识别结果。"

# 文本转语音API配置
# 这里使用模拟的API，实际使用时替换为真实的语音合成API
async def text_to_speech(text: str, output_path: str) -> str:
    """
    将文本转换为语音文件
    实际项目中应替换为真实的语音合成API，如百度语音、讯飞等
    """
    logger.info(f"开始文本转语音: {text}")
    
    # 模拟API调用延迟
    await asyncio.sleep(1)
    
    # 生成唯一的文件名
    file_extension = ".mp3"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(TTS_DIR, unique_filename)
    
    # 模拟生成语音文件
    # 实际项目中，这里应该调用真实的语音合成API
    # 这里我们创建一个空的音频文件作为示例
    async with aiofiles.open(file_path, 'wb') as f:
        # 写入一些模拟的音频数据
        await f.write(b'\x00' * 1024)  # 1KB的静音数据
    
    # 返回文件URL
    return f"/uploads/tts/{unique_filename}"

# 路由：接收消息
@app.post("/api/messages", response_model=Reply)
async def receive_message(message: Message, background_tasks: BackgroundTasks):
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
        # 文本消息处理
        reply_text = generate_text_reply(message.message)
        
        # 随机决定是否回复语音（示例：30%的概率回复语音）
        import random
        if random.random() < 0.3:
            # 异步生成语音回复
            voice_url = await text_to_speech(reply_text, TTS_DIR)
            return Reply(reply=reply_text, type="voice", voiceUrl=voice_url, duration=3)
        else:
            return Reply(reply=reply_text, type="text")
    
    elif message.type == "voice":
        # 语音消息处理
        if not message.voiceUrl:
            return Reply(reply="语音消息处理失败：未提供语音URL", type="text")
        
        # 获取语音文件路径
        voice_filename = os.path.basename(message.voiceUrl)
        voice_path = os.path.join(VOICE_DIR, voice_filename)
        
        # 检查文件是否存在
        if not os.path.exists(voice_path):
            return Reply(reply="语音文件不存在", type="text")
        
        # 语音转文本
        text_content = await speech_to_text(voice_path)
        
        # 生成回复
        reply_text = generate_text_reply(text_content)
        
        # 异步生成语音回复
        voice_url = await text_to_speech(reply_text, TTS_DIR)
        
        return Reply(reply=reply_text, type="voice", voiceUrl=voice_url, duration=3)
    
    else:
        return Reply(reply="不支持的消息类型", type="text")

# 路由：上传语音文件
@app.post("/api/messages/upload")
async def upload_voice(voice: UploadFile = File(...), duration: int = Form(...)):
    # 生成唯一文件名
    file_extension = os.path.splitext(voice.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(VOICE_DIR, unique_filename)
    
    # 保存文件
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(voice.file, buffer)
    
    # 返回文件URL
    voice_url = f"/uploads/voice/{unique_filename}"
    
    return JSONResponse({
        "success": True,
        "voiceUrl": voice_url,
        "duration": duration
    })

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
    elif "笑话" in message or "讲个笑话" in message:
        jokes = [
            "为什么程序员不喜欢户外活动？因为他们害怕遇到bug。",
            "有一天，我在调试代码，突然发现了一个bug。我修复了它，然后它变成了两个bug。",
            "为什么程序员总是分不清万圣节和圣诞节？因为 Oct 31 = Dec 25。",
            "一个程序员走进一家咖啡店，点了一杯咖啡。服务员问：'要加糖吗？'程序员回答：'是的，加一个糖。'",
            "为什么程序员不喜欢写文档？因为他们认为代码就是最好的文档。"
        ]
        import random
        return random.choice(jokes)
    else:
        return f"我收到了你的消息："{message}"。有什么我可以帮你的吗？"

# 启动服务器
if __name__ == "__main__":
    uvicorn.run("advanced_main:app", host="0.0.0.0", port=8000, reload=True) 