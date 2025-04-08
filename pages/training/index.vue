<template>
	<view class="training-container">
		<!-- 员工信息区域 -->
		<view class="employee-info">
			<view class="avatar-container">
				<image class="avatar" src="/static/avatar-other.png" mode="aspectFill"></image>
				<text class="employee-name">张经理</text>
			</view>
			<view class="stats-container">
				<view class="stat-item">
					<text class="stat-value">12</text>
					<text class="stat-label">练习次数</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">3.5h</text>
					<text class="stat-label">练习时长</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">3</text>
					<text class="stat-label">练习场景</text>
				</view>
			</view>
		</view>
		
		<!-- 功能按钮区域 -->
		<view class="function-buttons">
			<view class="function-btn" @tap="viewRanking">
				<image class="function-icon" src="/static/ranking.png" mode="aspectFit"></image>
				<text class="function-text">排行榜</text>
			</view>
			<view class="function-btn" @tap="viewHistory">
				<image class="function-icon" src="/static/history.png" mode="aspectFit"></image>
				<text class="function-text">练习记录</text>
			</view>
		</view>
		
		<!-- 练习场景区域 -->
		<view class="scenarios-container">
			<text class="section-title">练习场景</text>
			<view class="scenario-list">
				<view class="scenario-item" v-for="(item, index) in scenarios" :key="index" @tap="startTraining(item)">
					<view class="scenario-icon">
						<text class="iconfont">{{ item.icon }}</text>
					</view>
					<view class="scenario-info">
						<view class="scenario-title">{{ item.title }}</view>
						<view class="scenario-desc">{{ item.description }}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				employeeInfo: {
					name: '张经理',
					avatar: '/static/avatar-other.png',
					stats: {
						times: 12,
						duration: '3.5h',
						scenarios: 3
					}
				},
				scenarios: [
					{ id: 'attract', icon: '🎯', title: '吸引客户到现场', description: '学习如何有效吸引客户到店参观' },
					{ id: 'referral', icon: '🤝', title: '请老客户转介绍新客户', description: '学习如何获取老客户推荐新客户' },
					{ id: 'culture', icon: '🏢', title: '向客户介绍公司文化', description: '学习如何向客户展示公司文化和价值观' }
				]
			}
		},
		methods: {
			// 查看排行榜
			viewRanking() {
				uni.showToast({
					title: '查看排行榜',
					icon: 'none'
				});
				// 这里可以跳转到排行榜页面
				// uni.navigateTo({
				//     url: '/pages/ranking/index'
				// });
			},
			
			// 查看练习记录
			viewHistory() {
				uni.showToast({
					title: '查看练习记录',
					icon: 'none'
				});
				// 这里可以跳转到练习记录页面
				// uni.navigateTo({
				//     url: '/pages/history/index'
				// });
			},
			
			// 开始训练
			startTraining(scenario) {
				// 跳转到聊天页面，传递场景参数
				uni.navigateTo({
					url: `/pages/index/index?scenario=${encodeURIComponent(scenario.id)}`
				});
			}
		}
	}
</script>

<style>
	.training-container {
		padding: 30rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	/* 员工信息区域样式 */
	.employee-info {
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.avatar-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.avatar {
		width: 150rpx;
		height: 150rpx;
		border-radius: 75rpx;
		margin-bottom: 20rpx;
	}
	
	.employee-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}
	
	.stats-container {
		display: flex;
		justify-content: space-around;
		border-top: 1rpx solid #eee;
		padding-top: 30rpx;
	}
	
	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.stat-value {
		font-size: 40rpx;
		font-weight: bold;
		color: #07c160;
		margin-bottom: 10rpx;
	}
	
	.stat-label {
		font-size: 24rpx;
		color: #666;
	}
	
	/* 功能按钮区域样式 */
	.function-buttons {
		display: flex;
		justify-content: space-around;
		margin-bottom: 30rpx;
	}
	
	.function-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		width: 45%;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.function-icon {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 20rpx;
	}
	
	.function-text {
		font-size: 28rpx;
		color: #333;
	}
	
	/* 练习场景区域样式 */
	.scenarios-container {
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
	}
	
	.scenario-list {
		display: flex;
		flex-direction: column;
	}
	
	.scenario-item {
		display: flex;
		align-items: center;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #eee;
	}
	
	.scenario-item:last-child {
		border-bottom: none;
	}
	
	.scenario-icon {
		font-size: 50rpx;
		margin-right: 20rpx;
	}
	
	.scenario-info {
		flex: 1;
	}
	
	.scenario-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}
	
	.scenario-desc {
		font-size: 24rpx;
		color: #999;
	}
	
	.scenario-arrow {
		font-size: 30rpx;
		color: #ccc;
	}
</style> 