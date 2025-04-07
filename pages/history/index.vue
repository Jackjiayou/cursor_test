<template>
	<view class="history-container">
		<view class="history-header">
			<text class="history-title">练习记录</text>
			<view class="history-filter">
				<picker mode="selector" :range="scenarios" @change="filterByScenario">
					<view class="filter-item">
						<text>场景: {{ currentScenario }}</text>
						<text class="filter-arrow">▼</text>
					</view>
				</picker>
				<picker mode="date" fields="month" @change="filterByDate">
					<view class="filter-item">
						<text>月份: {{ currentMonth }}</text>
						<text class="filter-arrow">▼</text>
					</view>
				</picker>
			</view>
		</view>
		
		<view class="history-list">
			<view class="history-item" v-for="(item, index) in filteredHistory" :key="index" @tap="viewDetail(item)">
				<view class="history-date">
					<text class="date-day">{{ item.day }}</text>
					<text class="date-month">{{ item.month }}</text>
				</view>
				<view class="history-content">
					<view class="history-scenario">
						<text class="scenario-icon">{{ item.icon }}</text>
						<text class="scenario-name">{{ item.scenario }}</text>
					</view>
					<view class="history-info">
						<text class="history-duration">时长: {{ item.duration }}</text>
						<text class="history-score">得分: {{ item.score }}</text>
					</view>
				</view>
				<view class="history-arrow">></view>
			</view>
		</view>
		
		<!-- 无数据提示 -->
		<view class="empty-tip" v-if="filteredHistory.length === 0">
			<image class="empty-icon" src="/static/empty.png" mode="aspectFit"></image>
			<text class="empty-text">暂无练习记录</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				scenarios: ['全部场景', '吸引客户到现场', '请老客户转介绍新客户', '向客户介绍公司文化'],
				currentScenario: '全部场景',
				currentMonth: '2023年4月',
				historyList: [
					{
						id: 1,
						day: '15',
						month: '4月',
						scenario: '吸引客户到现场',
						icon: '🎯',
						duration: '15分钟',
						score: '95分',
						date: '2023-04-15'
					},
					{
						id: 2,
						day: '12',
						month: '4月',
						scenario: '请老客户转介绍新客户',
						icon: '🤝',
						duration: '20分钟',
						score: '88分',
						date: '2023-04-12'
					},
					{
						id: 3,
						day: '10',
						month: '4月',
						scenario: '向客户介绍公司文化',
						icon: '🏢',
						duration: '18分钟',
						score: '92分',
						date: '2023-04-10'
					},
					{
						id: 4,
						day: '5',
						month: '4月',
						scenario: '吸引客户到现场',
						icon: '🎯',
						duration: '12分钟',
						score: '85分',
						date: '2023-04-05'
					},
					{
						id: 5,
						day: '3',
						month: '4月',
						scenario: '请老客户转介绍新客户',
						icon: '🤝',
						duration: '16分钟',
						score: '90分',
						date: '2023-04-03'
					}
				]
			}
		},
		computed: {
			// 根据筛选条件过滤历史记录
			filteredHistory() {
				let result = [...this.historyList];
				
				// 按场景筛选
				if (this.currentScenario !== '全部场景') {
					result = result.filter(item => item.scenario === this.currentScenario);
				}
				
				// 按月份筛选 (这里简化处理，实际应该根据日期筛选)
				// 实际项目中应该根据选择的月份进行筛选
				
				return result;
			}
		},
		methods: {
			// 按场景筛选
			filterByScenario(e) {
				const index = e.detail.value;
				this.currentScenario = this.scenarios[index];
			},
			
			// 按日期筛选
			filterByDate(e) {
				const date = new Date(e.detail.value);
				this.currentMonth = `${date.getFullYear()}年${date.getMonth() + 1}月`;
				
				// 实际项目中应该根据选择的月份筛选数据
			},
			
			// 查看详情
			viewDetail(item) {
				uni.showToast({
					title: '查看详情: ' + item.scenario,
					icon: 'none'
				});
				
				// 这里可以跳转到详情页面
				// uni.navigateTo({
				//     url: '/pages/history/detail?id=' + item.id
				// });
			}
		}
	}
</script>

<style>
	.history-container {
		padding: 30rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	.history-header {
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.history-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
		display: block;
		text-align: center;
	}
	
	.history-filter {
		display: flex;
		justify-content: space-between;
	}
	
	.filter-item {
		display: flex;
		align-items: center;
		background-color: #f5f5f5;
		padding: 15rpx 30rpx;
		border-radius: 10rpx;
		font-size: 28rpx;
		color: #333;
	}
	
	.filter-arrow {
		margin-left: 10rpx;
		font-size: 24rpx;
		color: #999;
	}
	
	.history-list {
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.history-item {
		display: flex;
		align-items: center;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #eee;
	}
	
	.history-item:last-child {
		border-bottom: none;
	}
	
	.history-date {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100rpx;
		height: 100rpx;
		background-color: #f5f5f5;
		border-radius: 10rpx;
		margin-right: 20rpx;
	}
	
	.date-day {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}
	
	.date-month {
		font-size: 24rpx;
		color: #999;
	}
	
	.history-content {
		flex: 1;
	}
	
	.history-scenario {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}
	
	.scenario-icon {
		font-size: 36rpx;
		margin-right: 10rpx;
	}
	
	.scenario-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
	}
	
	.history-info {
		display: flex;
		justify-content: space-between;
	}
	
	.history-duration, .history-score {
		font-size: 24rpx;
		color: #666;
	}
	
	.history-score {
		color: #07c160;
		font-weight: bold;
	}
	
	.history-arrow {
		font-size: 30rpx;
		color: #ccc;
		margin-left: 20rpx;
	}
	
	/* 无数据提示样式 */
	.empty-tip {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
	}
	
	.empty-icon {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 30rpx;
	}
	
	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
</style> 