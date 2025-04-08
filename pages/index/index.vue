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
					<view class="message-bubble" v-else-if="item.type === 'voice'">
						<!-- 语音条 -->
						<view class="voice-bar" @tap="playVoice(item)">
							<view class="voice-content">
								<text class="iconfont" :class="{'playing': item.isPlaying}">🔊</text>
								<text class="duration">{{ item.duration }}''</text>
							</view>
						</view>
						
						<!-- 翻译和评价区域 -->
						<view class="content-section" v-if="item.text || item.evaluation">
							<view class="content-header">
								<text class="content-label">内容详情</text>
								<view class="content-btn" @tap.stop="toggleContent(item)">
									<text class="iconfont">{{ item.showContent ? '▼' : '▶' }}</text>
									<text>{{ item.showContent ? '收起' : '展开' }}</text>
								</view>
							</view>
							
							<view class="content-details" v-if="item.showContent">
								<!-- 翻译部分 -->
								<view class="content-item" v-if="item.text">
									<text class="item-label">文字内容：</text>
									<text class="item-text">{{ item.text }}</text>
								</view>
								
								<!-- 评价部分 -->
								<view class="content-item" v-if="item.evaluation">
									<text class="item-label">评价：</text>
									<text class="item-text">{{ item.evaluation }}</text>
								</view>
							</view>
						</view>
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
				recordingDuration: 0,
				// 场景问题列表
				scenarioQuestions: {
					'attract': [
						'请用1分钟时间介绍如何吸引客户到现场参观？',
						'如果客户对价格有异议，你会如何引导客户到现场？',
						'请分享一个成功吸引客户到现场的案例。'
					],
					'referral': [
						'你会如何向老客户请求转介绍？',
						'请分享一个成功获取老客户转介绍的案例。',
						'如果老客户不愿意转介绍，你会如何处理？'
					],
					'culture': [
						'请用1分钟时间介绍公司的核心价值观。',
						'你会如何向客户展示公司的专业能力？',
						'请分享一个体现公司文化的成功案例。'
					]
				},
				// 场景标题映射
				scenarioTitles: {
					'attract': '吸引客户到现场',
					'referral': '请老客户转介绍新客户',
					'culture': '向客户介绍公司文化'
				},
				currentScenario: '',
				currentQuestion: ''
			}
		},
		onLoad(options) {
			// 获取场景参数
			if (options.scenario) {
				this.currentScenario = decodeURIComponent(options.scenario);
				// 设置页面标题
				const title = this.scenarioTitles[this.currentScenario] || this.currentScenario;
				uni.setNavigationBarTitle({
					title: title
				});
				
				// 随机选择一个场景问题
				const questions = this.scenarioQuestions[this.currentScenario] || [];
				if (questions.length > 0) {
					const randomIndex = Math.floor(Math.random() * questions.length);
					this.currentQuestion = questions[randomIndex];
					
					// 添加机器人提问
					this.messages.push({
						content: this.currentQuestion,
						time: this.getCurrentTime(),
						isSelf: false,
						type: 'text'
					});
				}
			}
			
			// 初始化录音管理器
			this.recorderManager = uni.getRecorderManager();
			this.initRecorder();
			
			// 初始化音频播放器
			this.innerAudioContext = uni.createInnerAudioContext();
			this.innerAudioContext.onEnded(() => {
				console.log('音频播放结束');
			});
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
					timestamp: new Date().getTime(),
					scenario: this.currentScenario,
					question: this.currentQuestion
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
					header: {
						'Content-Type': 'application/json'
					},
					success: (res) => {
						console.log('API响应:', res);
						uni.hideLoading();
						
						// 处理API响应
						if (res.statusCode === 200 && res.data) {
							// 如果是语音消息，添加转文字结果和评价
							if (message.type === 'voice') {
								if (res.data.text) {
									message.text = res.data.text;
								}
								if (res.data.evaluation) {
									message.evaluation = res.data.evaluation;
									message.showEvaluation = false;
								}
							}
							
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
							console.error('API响应错误:', res);
							uni.showToast({
								title: '获取回复失败: ' + (res.data?.detail || '未知错误'),
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
				// 获取录音管理器实例
				this.recorderManager = uni.getRecorderManager();
				
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
					if (res.tempFilePath) {
						this.uploadVoiceFile(res.tempFilePath);
					} else {
						uni.showToast({
							title: '录音文件获取失败',
							icon: 'none'
						});
					}
				});
				
				this.recorderManager.onError((err) => {
					console.error('录音错误:', err);
					this.isRecording = false;
					uni.hideToast();
					uni.showToast({
						title: '录音失败: ' + (err.errMsg || '未知错误'),
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
						duration: this.recordingDuration,
						scenario: this.currentScenario,
						question: this.currentQuestion
					},
					success: (uploadRes) => {
						console.log('上传成功:', uploadRes);
						uni.hideLoading();
						
						// 解析响应
						let response;
						try {
							response = JSON.parse(uploadRes.data);
						} catch (e) {
							console.error('解析响应失败:', e);
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
								duration: this.recordingDuration,
								scenario: this.currentScenario,
								question: this.currentQuestion
							};
							
							this.messages.push(voiceMessage);
							this.scrollToBottom();
							
							// 发送语音消息到API
							this.sendToApi(voiceMessage);
						} else {
							console.error('上传失败:', response);
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
				// 如果已经在录音，先停止
				if (this.isRecording) {
					this.stopRecording();
					return;
				}
				
				// 请求录音权限
				uni.authorize({
					scope: 'scope.record',
					success: () => {
						if (this.recorderManager) {
							this.recorderManager.start({
								duration: 60000, // 最长录音时间，单位ms
								sampleRate: 16000,
								numberOfChannels: 1,
								encodeBitRate: 96000,
								format: 'mp3'
							});
						} else {
							console.error('录音管理器未初始化');
							uni.showToast({
								title: '录音初始化失败',
								icon: 'none'
							});
						}
					},
					fail: () => {
						uni.showModal({
							title: '提示',
							content: '需要录音权限才能发送语音消息',
							showCancel: false,
							success: (res) => {
								if (res.confirm) {
									// 引导用户去设置页面开启权限
									uni.openSetting({
										success: (settingRes) => {
											console.log('设置页面打开成功:', settingRes);
										},
										fail: (err) => {
											console.error('打开设置页面失败:', err);
										}
									});
								}
							}
						});
					}
				});
			},
			
			// 停止录音
			stopRecording() {
				if (this.recorderManager && this.isRecording) {
					console.log('停止录音');
					this.recorderManager.stop();
					// 立即设置状态为false，避免重复触发
					this.isRecording = false;
					// 隐藏录音提示
					uni.hideToast();
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
			},
			
			// 切换内容显示
			toggleContent(item) {
				item.showContent = !item.showContent;
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
		flex-direction: column;
		align-items: flex-start;
		padding: 20rpx;
		min-width: 200rpx;
	}
	
	.voice-bar {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding: 16rpx 24rpx;
		background-color: rgba(255, 255, 255, 0.1);
		border-radius: 8rpx;
		width: 100%;
	}
	
	.voice-content {
		display: flex;
		align-items: center;
	}
	
	.duration {
		margin-left: 12rpx;
		font-size: 28rpx;
		color: #333;
	}
	
	.content-section {
		margin-top: 16rpx;
		width: 100%;
	}
	
	.content-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8rpx;
	}
	
	.content-label {
		font-size: 24rpx;
		color: #999;
	}
	
	.content-btn {
		display: flex;
		align-items: center;
		padding: 4rpx 12rpx;
		background-color: rgba(0, 0, 0, 0.05);
		border-radius: 6rpx;
		font-size: 24rpx;
		color: #666;
	}
	
	.content-btn .iconfont {
		margin-right: 4rpx;
		font-size: 20rpx;
	}
	
	.content-details {
		padding: 12rpx;
		background-color: rgba(255, 255, 255, 0.1);
		border-radius: 8rpx;
	}
	
	.content-item {
		margin-bottom: 12rpx;
	}
	
	.content-item:last-child {
		margin-bottom: 0;
	}
	
	.item-label {
		font-size: 24rpx;
		color: #999;
		margin-right: 8rpx;
	}
	
	.item-text {
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
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
