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
    type: str
    timestamp: int
    voiceUrl: Optional[str] = None
    duration: Optional[int] = None
    scenario: Optional[str] = None
    question: Optional[str] = None

# 定义回复模型
class Reply(BaseModel):
    reply: str
    type: str
    voiceUrl: Optional[str] = None
    duration: Optional[int] = None
    evaluation: Optional[str] = None
    text: Optional[str] = None

# 存储聊天记录
chat_history = []

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
async def process_message(message: Message):
    try:
        logger.info(f"收到消息: {message}")
        
        # 存储聊天记录
        chat_history.append({
            "role": "user",
            "content": message.message,
            "type": message.type,
            "timestamp": message.timestamp,
            "scenario": message.scenario,
            "question": message.question
        })
        
        # 如果是语音消息，进行语音转文字
        if message.type == "voice" and message.voiceUrl:
            try:
                text = await speech_to_text(message.voiceUrl)
            except Exception as e:
                logger.error(f"语音转文字失败: {e}")
                text = "语音转文字失败"
        else:
            text = message.message
        
        # 使用大模型分析回答
        try:
            evaluation = await analyze_response(
                scenario=message.scenario,
                question=message.question,
                answer=text,
                chat_history=chat_history
            )
        except Exception as e:
            logger.error(f"分析回答失败: {e}")
            evaluation = "分析回答失败"
        
        # 生成回复
        try:
            reply = await generate_text_reply(evaluation)
        except Exception as e:
            logger.error(f"生成回复失败: {e}")
            reply = "生成回复失败"
        
        # 将回复添加到聊天记录
        chat_history.append({
            "role": "assistant",
            "content": reply,
            "type": "text",
            "timestamp": int(datetime.now().timestamp() * 1000)
        })
        
        return Reply(
            reply=reply,
            type="text",
            evaluation=evaluation,
            text=text if message.type == "voice" else None
        )
    except Exception as e:
        logger.error(f"处理消息时发生错误: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 路由：上传语音文件
@app.post("/api/messages/upload")
async def upload_voice_file(
    voice: UploadFile = File(...),
    duration: int = Form(...),
    scenario: str = Form(...),
    question: str = Form(...)
):
    # 生成文件名
    timestamp = int(datetime.now().timestamp() * 1000)
    filename = f"voice_{timestamp}.mp3"
    file_path = os.path.join(VOICE_DIR, filename)
    
    # 保存文件
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(voice.file, buffer)
    
    # 返回文件URL
    voice_url = f"/uploads/voice/{filename}"
    
    return {
        "success": True,
        "voiceUrl": voice_url,
        "duration": duration,
        "scenario": scenario,
        "question": question
    }

# 生成文本回复的简单函数
async def generate_text_reply(evaluation: str) -> str:
    try:
        # 确保evaluation不为空
        if not evaluation:
            evaluation = "暂无评价"
            
        return f"感谢您的回答！以下是对您回答的评价：\n{evaluation}\n\n您可以继续练习，或者查看其他场景的问题。"
    except Exception as e:
        logger.error(f"生成回复失败: {e}")
        return "生成回复失败"

async def analyze_response(
    scenario: str,
    question: str,
    answer: str,
    chat_history: List[dict]
) -> str:
    try:
        # 确保参数不为空
        if not scenario:
            scenario = "未知场景"
        if not question:
            question = "未知问题"
        if not answer:
            answer = "无回答内容"
            
        # 这里可以集成实际的大模型服务
        # 例如：OpenAI、文心一言等
        return f"场景：{scenario}\n问题：{question}\n回答分析：\n1. 内容完整性：良好\n2. 表达清晰度：优秀\n3. 专业度：良好\n4. 建议改进：可以加入更多具体案例"
    except Exception as e:
        logger.error(f"分析回答失败: {e}")
        return "分析回答失败"

# 启动服务器
if __name__ == "__main__":
    uvicorn.run("advanced_main:app", host="0.0.0.0", port=8000, reload=True) 