<template>
	<view class="chat-container">
		<!-- 聊天消息列表 -->
		<scroll-view class="message-list" scroll-y="true" :scroll-top="scrollTop" @scrolltoupper="loadMoreMessages">
			<view class="message-item" v-for="(item, index) in messages" :key="index" :class="{'message-self': item.isSelf}">
				<view class="avatar">
					<image :src="item.isSelf ? '/static/avatar-self.png' : '/static/avatar-other.png'" mode="aspectFill"></image>
				</view>
				<view class="message-content">
					<view class="message-bubble" v-if="item.type === 'text'">{{ item.content }}</view>
					<view class="message-bubble voice-message" v-else-if="item.type === 'voice'" @tap="playVoice(item)">
						<text class="iconfont" :class="{'playing': item.isPlaying}">🔊</text> {{ item.duration }}''
					</view>
					<view class="message-time">{{ item.time }}</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 底部输入区域 -->
		<view class="input-area">
			<view class="input-box">
				<input type="text" v-model="inputMessage" placeholder="请输入消息" @confirm="sendMessage" />
			</view>
			<view class="action-buttons">
				<button class="voice-btn" @touchstart="startRecording" @touchend="stopRecording">
					<text class="iconfont">🎤</text>
				</button>
				<button class="send-btn" @tap="sendMessage">发送</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				messages: [],
				inputMessage: '',
				scrollTop: 0,
				isRecording: false,
				recorderManager: null,
				innerAudioContext: null,
				apiUrl: 'http://localhost:8000/api/messages',
				recordingStartTime: 0,
				recordingDuration: 0
			}
		},
		onLoad(options) {
			// 获取场景参数
			if (options.scenario) {
				const scenario = decodeURIComponent(options.scenario);
				uni.setNavigationBarTitle({
					title: scenario
				});
			}
			
			// 初始化录音管理器
			this.recorderManager = uni.getRecorderManager();
			this.initRecorder();
			
			// 初始化音频播放器
			this.innerAudioContext = uni.createInnerAudioContext();
			this.innerAudioContext.onEnded(() => {
				console.log('音频播放结束');
			});
			
			// 添加一些测试消息
			this.messages = [
				{
					content: '你好！我是AI助手，有什么可以帮你的吗？',
					time: this.getCurrentTime(),
					isSelf: false,
					type: 'text'
				}
			];
		},
		onUnload() {
			// 页面卸载时释放资源
			if (this.innerAudioContext) {
				this.innerAudioContext.destroy();
			}
		},
		methods: {
			// 发送消息
			sendMessage() {
				if (!this.inputMessage.trim()) return;
				
				const newMessage = {
					content: this.inputMessage,
					time: this.getCurrentTime(),
					isSelf: true,
					type: 'text'
				};
				
				this.messages.push(newMessage);
				this.inputMessage = '';
				
				// 发送消息到后端API
				this.sendToApi(newMessage);
				
				this.scrollToBottom();
			},
			
			// 发送消息到API
			sendToApi(message) {
				uni.showLoading({
					title: '发送中...'
				});
				
				// 准备请求数据
				const requestData = {
					message: message.content,
					type: message.type,
					timestamp: new Date().getTime()
				};
				
				// 如果是语音消息，添加语音相关数据
				if (message.type === 'voice') {
					requestData.voiceUrl = message.voiceUrl;
					requestData.duration = message.duration;
				}
				
				// 发送请求到后端API
				uni.request({
					url: this.apiUrl,
					method: 'POST',
					data: requestData,
					success: (res) => {
						console.log('API响应:', res);
						uni.hideLoading();
						
						// 处理API响应
						if (res.statusCode === 200 && res.data) {
							// 添加机器人回复
							const replyMessage = {
								content: res.data.reply || '抱歉，我没有理解你的问题。',
								time: this.getCurrentTime(),
								isSelf: false,
								type: res.data.type || 'text'
							};
							
							// 如果是语音回复，添加语音URL
							if (replyMessage.type === 'voice' && res.data.voiceUrl) {
								replyMessage.voiceUrl = res.data.voiceUrl;
								replyMessage.duration = res.data.duration || 0;
							}
							
							this.messages.push(replyMessage);
							// 使用setTimeout确保消息渲染完成后再滚动
							setTimeout(() => {
								this.scrollToBottom();
							}, 100);
						} else {
							// 处理错误
							uni.showToast({
								title: '获取回复失败',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						console.error('API请求失败:', err);
						uni.hideLoading();
						uni.showToast({
							title: '网络错误，请稍后重试',
							icon: 'none'
						});
					}
				});
			},
			
			// 获取当前时间
			getCurrentTime() {
				const now = new Date();
				return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
			},
			
			// 滚动到底部
			scrollToBottom() {
				// 使用nextTick确保DOM更新后再滚动
				this.$nextTick(() => {
					const query = uni.createSelectorQuery().in(this);
					query.select('.message-list').boundingClientRect(data => {
						if (data) {
							this.scrollTop = data.height * 2; // 乘以2确保滚动到底部
						}
					}).exec();
				});
			},
			
			// 加载更多消息
			loadMoreMessages() {
				// 这里可以添加加载历史消息的逻辑
			},
			
			// 初始化录音管理器
			initRecorder() {
				this.recorderManager.onStart(() => {
					console.log('录音开始');
					this.isRecording = true;
					this.recordingStartTime = new Date().getTime();
					
					// 显示录音提示
					uni.showToast({
						title: '正在录音...',
						icon: 'none',
						duration: 60000
					});
				});
				
				this.recorderManager.onStop((res) => {
					console.log('录音结束', res);
					this.isRecording = false;
					
					// 计算录音时长
					this.recordingDuration = Math.round((new Date().getTime() - this.recordingStartTime) / 1000);
					
					// 隐藏录音提示
					uni.hideToast();
					
					// 上传录音文件
					this.uploadVoiceFile(res.tempFilePath);
				});
				
				this.recorderManager.onError((err) => {
					console.error('录音错误:', err);
					this.isRecording = false;
					uni.hideToast();
					uni.showToast({
						title: '录音失败',
						icon: 'none'
					});
				});
			},
			
			// 上传语音文件
			uploadVoiceFile(filePath) {
				uni.showLoading({
					title: '上传中...'
				});
				
				// 上传录音文件到服务器
				uni.uploadFile({
					url: this.apiUrl + '/upload',
					filePath: filePath,
					name: 'voice',
					formData: {
						duration: this.recordingDuration
					},
					success: (uploadRes) => {
						console.log('上传成功:', uploadRes);
						uni.hideLoading();
						
						// 解析响应
						let response;
						try {
							response = JSON.parse(uploadRes.data);
						} catch (e) {
							response = { success: false };
						}
						
						if (response.success && response.voiceUrl) {
							// 添加语音消息
							const voiceMessage = {
								content: '语音消息',
								time: this.getCurrentTime(),
								isSelf: true,
								type: 'voice',
								voiceUrl: response.voiceUrl,
								duration: this.recordingDuration
							};
							
							this.messages.push(voiceMessage);
							this.scrollToBottom();
							
							// 发送语音消息到API
							this.sendToApi(voiceMessage);
						} else {
							uni.showToast({
								title: '上传失败',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						console.error('上传失败:', err);
						uni.hideLoading();
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						});
					}
				});
			},
			
			// 开始录音
			startRecording() {
				// 请求录音权限
				uni.authorize({
					scope: 'scope.record',
					success: () => {
						this.recorderManager.start({
							duration: 60000, // 最长录音时间，单位ms
							sampleRate: 16000,
							numberOfChannels: 1,
							encodeBitRate: 96000,
							format: 'mp3'
						});
					},
					fail: () => {
						uni.showModal({
							title: '提示',
							content: '需要录音权限才能发送语音消息',
							showCancel: false
						});
					}
				});
			},
			
			// 停止录音
			stopRecording() {
				if (this.isRecording) {
					this.recorderManager.stop();
				}
			},
			
			// 播放语音
			playVoice(item) {
				if (!item.voiceUrl) {
					uni.showToast({
						title: '语音文件不存在',
						icon: 'none'
					});
					return;
				}
				
				// 确保URL是完整的HTTP地址
				let audioUrl = item.voiceUrl;
				if (!audioUrl.startsWith('http')) {
					audioUrl = 'http://localhost:8000' + audioUrl;
				}
				
				// 如果正在播放，先停止
				if (item.isPlaying) {
					this.innerAudioContext.stop();
					item.isPlaying = false;
					return;
				}
				
				// 停止当前播放的音频
				this.innerAudioContext.stop();
				
				// 重置音频上下文
				this.innerAudioContext = uni.createInnerAudioContext();
				
				// 设置音频源
				this.innerAudioContext.src = audioUrl;
				
				// 显示播放状态
				item.isPlaying = true;
				
				// 监听播放结束
				this.innerAudioContext.onEnded(() => {
					item.isPlaying = false;
					// 销毁音频上下文
					this.innerAudioContext.destroy();
				});
				
				// 监听播放错误
				this.innerAudioContext.onError((err) => {
					console.error('播放错误:', err);
					item.isPlaying = false;
					// 销毁音频上下文
					this.innerAudioContext.destroy();
					uni.showToast({
						title: '播放失败，请重试',
						icon: 'none'
					});
				});
				
				// 开始播放
				this.innerAudioContext.play();
			}
		}
	}
</script>

<style>
	.chat-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
	}

	.message-list {
		flex: 1;
		padding: 20rpx;
	}

	.message-item {
		display: flex;
		margin-bottom: 30rpx;
	}

	.message-self {
		flex-direction: row-reverse;
	}

	.avatar {
		width: 80rpx;
		height: 80rpx;
		margin: 0 20rpx;
	}

	.avatar image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.message-content {
		max-width: 60%;
	}

	.message-bubble {
		padding: 20rpx;
		background-color: #fff;
		border-radius: 10rpx;
		font-size: 28rpx;
		word-break: break-all;
	}

	.message-self .message-bubble {
		background-color: #95ec69;
	}

	.voice-message {
		display: flex;
		align-items: center;
	}

	.voice-message .iconfont {
		margin-right: 10rpx;
	}

	.message-time {
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
		text-align: center;
	}

	.input-area {
		padding: 20rpx;
		background-color: #f8f8f8;
		border-top: 1rpx solid #ddd;
		display: flex;
		align-items: center;
	}

	.input-box {
		flex: 1;
		background-color: #fff;
		border-radius: 10rpx;
		padding: 10rpx 20rpx;
		margin-right: 20rpx;
	}

	.input-box input {
		width: 100%;
		height: 60rpx;
		font-size: 28rpx;
	}

	.action-buttons {
		display: flex;
		align-items: center;
	}

	.voice-btn, .send-btn {
		margin: 0 10rpx;
		padding: 0 30rpx;
		height: 70rpx;
		line-height: 70rpx;
		font-size: 28rpx;
		border-radius: 10rpx;
	}

	.voice-btn {
		background-color: #fff;
	}

	.send-btn {
		background-color: #07c160;
		color: #fff;
	}

	.voice-message .iconfont.playing {
		animation: voicePlaying 1s infinite;
	}
	
	@keyframes voicePlaying {
		0% { transform: scale(1); }
		50% { transform: scale(1.2); }
		100% { transform: scale(1); }
	}
</style>
