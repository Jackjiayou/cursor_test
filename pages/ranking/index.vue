<template>
	<view class="ranking-container">
		<view class="ranking-header">
			<text class="ranking-title">培训排行榜</text>
			<view class="ranking-tabs">
				<view class="tab-item" :class="{'active': activeTab === 'weekly'}" @tap="switchTab('weekly')">周榜</view>
				<view class="tab-item" :class="{'active': activeTab === 'monthly'}" @tap="switchTab('monthly')">月榜</view>
				<view class="tab-item" :class="{'active': activeTab === 'total'}" @tap="switchTab('total')">总榜</view>
			</view>
		</view>
		
		<view class="ranking-list">
			<!-- 前三名特殊展示 -->
			<view class="top-three">
				<!-- 第二名 -->
				<view class="top-item second">
					<view class="rank-number">2</view>
					<image class="avatar" src="/static/avatar-other.png" mode="aspectFill"></image>
					<text class="name">李经理</text>
					<text class="score">98分</text>
				</view>
				
				<!-- 第一名 -->
				<view class="top-item first">
					<view class="rank-number">1</view>
					<image class="avatar" src="/static/avatar-other.png" mode="aspectFill"></image>
					<text class="name">张经理</text>
					<text class="score">100分</text>
				</view>
				
				<!-- 第三名 -->
				<view class="top-item third">
					<view class="rank-number">3</view>
					<image class="avatar" src="/static/avatar-other.png" mode="aspectFill"></image>
					<text class="name">王经理</text>
					<text class="score">95分</text>
				</view>
			</view>
			
			<!-- 其他排名 -->
			<view class="other-ranks">
				<view class="rank-item" v-for="(item, index) in otherRanks" :key="index">
					<view class="rank-number">{{ item.rank }}</view>
					<image class="avatar" :src="item.avatar" mode="aspectFill"></image>
					<text class="name">{{ item.name }}</text>
					<text class="score">{{ item.score }}分</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				activeTab: 'weekly',
				otherRanks: [
					{ rank: 4, name: '赵经理', avatar: '/static/avatar-other.png', score: 92 },
					{ rank: 5, name: '钱经理', avatar: '/static/avatar-other.png', score: 90 },
					{ rank: 6, name: '孙经理', avatar: '/static/avatar-other.png', score: 88 },
					{ rank: 7, name: '周经理', avatar: '/static/avatar-other.png', score: 85 },
					{ rank: 8, name: '吴经理', avatar: '/static/avatar-other.png', score: 82 },
					{ rank: 9, name: '郑经理', avatar: '/static/avatar-other.png', score: 80 },
					{ rank: 10, name: '王经理', avatar: '/static/avatar-other.png', score: 78 }
				]
			}
		},
		methods: {
			// 切换排行榜类型
			switchTab(tab) {
				this.activeTab = tab;
				// 这里可以根据不同的tab加载不同的数据
				uni.showToast({
					title: '切换到' + tab + '榜',
					icon: 'none'
				});
			}
		}
	}
</script>

<style>
	.ranking-container {
		padding: 30rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	.ranking-header {
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.ranking-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
		display: block;
		text-align: center;
	}
	
	.ranking-tabs {
		display: flex;
		justify-content: space-around;
		border-bottom: 1rpx solid #eee;
	}
	
	.tab-item {
		padding: 20rpx 0;
		font-size: 28rpx;
		color: #666;
		position: relative;
	}
	
	.tab-item.active {
		color: #07c160;
		font-weight: bold;
	}
	
	.tab-item.active:after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 40rpx;
		height: 4rpx;
		background-color: #07c160;
		border-radius: 2rpx;
	}
	
	.ranking-list {
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	/* 前三名样式 */
	.top-three {
		display: flex;
		justify-content: space-around;
		align-items: flex-end;
		margin-bottom: 50rpx;
		padding: 0 30rpx;
	}
	
	.top-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}
	
	.first {
		transform: scale(1.1);
	}
	
	.rank-number {
		position: absolute;
		top: -20rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 40rpx;
		height: 40rpx;
		background-color: #f5f5f5;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 24rpx;
		font-weight: bold;
	}
	
	.first .rank-number {
		background-color: #ffd700;
		color: #fff;
	}
	
	.second .rank-number {
		background-color: #c0c0c0;
		color: #fff;
	}
	
	.third .rank-number {
		background-color: #cd7f32;
		color: #fff;
	}
	
	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 60rpx;
		margin-bottom: 10rpx;
	}
	
	.first .avatar {
		width: 140rpx;
		height: 140rpx;
		border-radius: 70rpx;
		border: 4rpx solid #ffd700;
	}
	
	.name {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 5rpx;
	}
	
	.score {
		font-size: 24rpx;
		color: #07c160;
		font-weight: bold;
	}
	
	/* 其他排名样式 */
	.other-ranks {
		border-top: 1rpx solid #eee;
		padding-top: 30rpx;
	}
	
	.rank-item {
		display: flex;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #eee;
	}
	
	.rank-item:last-child {
		border-bottom: none;
	}
	
	.rank-item .rank-number {
		position: static;
		width: 60rpx;
		height: 60rpx;
		background-color: #f5f5f5;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 28rpx;
		font-weight: bold;
		color: #666;
		margin-right: 20rpx;
	}
	
	.rank-item .avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 40rpx;
		margin-right: 20rpx;
	}
	
	.rank-item .name {
		flex: 1;
		margin-bottom: 0;
	}
	
	.rank-item .score {
		margin-bottom: 0;
	}
</style> 