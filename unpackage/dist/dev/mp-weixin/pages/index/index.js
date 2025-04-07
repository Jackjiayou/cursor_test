"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      messages: [],
      inputMessage: "",
      scrollTop: 0,
      isRecording: false,
      recorderManager: null,
      innerAudioContext: null,
      apiUrl: "http://localhost:8000/api/messages",
      recordingStartTime: 0,
      recordingDuration: 0
    };
  },
  onLoad(options) {
    if (options.scenario) {
      const scenario = decodeURIComponent(options.scenario);
      common_vendor.index.setNavigationBarTitle({
        title: scenario
      });
    }
    this.recorderManager = common_vendor.index.getRecorderManager();
    this.initRecorder();
    this.innerAudioContext = common_vendor.index.createInnerAudioContext();
    this.innerAudioContext.onEnded(() => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:65", "音频播放结束");
    });
    this.messages = [
      {
        content: "你好！我是AI助手，有什么可以帮你的吗？",
        time: this.getCurrentTime(),
        isSelf: false,
        type: "text"
      }
    ];
  },
  onUnload() {
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy();
    }
  },
  methods: {
    // 发送消息
    sendMessage() {
      if (!this.inputMessage.trim())
        return;
      const newMessage = {
        content: this.inputMessage,
        time: this.getCurrentTime(),
        isSelf: true,
        type: "text"
      };
      this.messages.push(newMessage);
      this.inputMessage = "";
      this.sendToApi(newMessage);
      this.scrollToBottom();
    },
    // 发送消息到API
    sendToApi(message) {
      common_vendor.index.showLoading({
        title: "发送中..."
      });
      const requestData = {
        message: message.content,
        type: message.type,
        timestamp: (/* @__PURE__ */ new Date()).getTime()
      };
      if (message.type === "voice") {
        requestData.voiceUrl = message.voiceUrl;
        requestData.duration = message.duration;
      }
      common_vendor.index.request({
        url: this.apiUrl,
        method: "POST",
        data: requestData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:130", "API响应:", res);
          common_vendor.index.hideLoading();
          if (res.statusCode === 200 && res.data) {
            const replyMessage = {
              content: res.data.reply || "抱歉，我没有理解你的问题。",
              time: this.getCurrentTime(),
              isSelf: false,
              type: res.data.type || "text"
            };
            if (replyMessage.type === "voice" && res.data.voiceUrl) {
              replyMessage.voiceUrl = res.data.voiceUrl;
              replyMessage.duration = res.data.duration || 0;
            }
            this.messages.push(replyMessage);
            setTimeout(() => {
              this.scrollToBottom();
            }, 100);
          } else {
            common_vendor.index.showToast({
              title: "获取回复失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:163", "API请求失败:", err);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "网络错误，请稍后重试",
            icon: "none"
          });
        }
      });
    },
    // 获取当前时间
    getCurrentTime() {
      const now = /* @__PURE__ */ new Date();
      return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    },
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        const query = common_vendor.index.createSelectorQuery().in(this);
        query.select(".message-list").boundingClientRect((data) => {
          if (data) {
            this.scrollTop = data.height * 2;
          }
        }).exec();
      });
    },
    // 加载更多消息
    loadMoreMessages() {
    },
    // 初始化录音管理器
    initRecorder() {
      this.recorderManager.onStart(() => {
        common_vendor.index.__f__("log", "at pages/index/index.vue:200", "录音开始");
        this.isRecording = true;
        this.recordingStartTime = (/* @__PURE__ */ new Date()).getTime();
        common_vendor.index.showToast({
          title: "正在录音...",
          icon: "none",
          duration: 6e4
        });
      });
      this.recorderManager.onStop((res) => {
        common_vendor.index.__f__("log", "at pages/index/index.vue:213", "录音结束", res);
        this.isRecording = false;
        this.recordingDuration = Math.round(((/* @__PURE__ */ new Date()).getTime() - this.recordingStartTime) / 1e3);
        common_vendor.index.hideToast();
        this.uploadVoiceFile(res.tempFilePath);
      });
      this.recorderManager.onError((err) => {
        common_vendor.index.__f__("error", "at pages/index/index.vue:227", "录音错误:", err);
        this.isRecording = false;
        common_vendor.index.hideToast();
        common_vendor.index.showToast({
          title: "录音失败",
          icon: "none"
        });
      });
    },
    // 上传语音文件
    uploadVoiceFile(filePath) {
      common_vendor.index.showLoading({
        title: "上传中..."
      });
      common_vendor.index.uploadFile({
        url: this.apiUrl + "/upload",
        filePath,
        name: "voice",
        formData: {
          duration: this.recordingDuration
        },
        success: (uploadRes) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:252", "上传成功:", uploadRes);
          common_vendor.index.hideLoading();
          let response;
          try {
            response = JSON.parse(uploadRes.data);
          } catch (e) {
            response = { success: false };
          }
          if (response.success && response.voiceUrl) {
            const voiceMessage = {
              content: "语音消息",
              time: this.getCurrentTime(),
              isSelf: true,
              type: "voice",
              voiceUrl: response.voiceUrl,
              duration: this.recordingDuration
            };
            this.messages.push(voiceMessage);
            this.scrollToBottom();
            this.sendToApi(voiceMessage);
          } else {
            common_vendor.index.showToast({
              title: "上传失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:287", "上传失败:", err);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "上传失败",
            icon: "none"
          });
        }
      });
    },
    // 开始录音
    startRecording() {
      common_vendor.index.authorize({
        scope: "scope.record",
        success: () => {
          this.recorderManager.start({
            duration: 6e4,
            // 最长录音时间，单位ms
            sampleRate: 16e3,
            numberOfChannels: 1,
            encodeBitRate: 96e3,
            format: "mp3"
          });
        },
        fail: () => {
          common_vendor.index.showModal({
            title: "提示",
            content: "需要录音权限才能发送语音消息",
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
        common_vendor.index.showToast({
          title: "语音文件不存在",
          icon: "none"
        });
        return;
      }
      let audioUrl = item.voiceUrl;
      if (!audioUrl.startsWith("http")) {
        audioUrl = "http://localhost:8000" + audioUrl;
      }
      if (item.isPlaying) {
        this.innerAudioContext.stop();
        item.isPlaying = false;
        return;
      }
      this.innerAudioContext.stop();
      this.innerAudioContext = common_vendor.index.createInnerAudioContext();
      this.innerAudioContext.src = audioUrl;
      item.isPlaying = true;
      this.innerAudioContext.onEnded(() => {
        item.isPlaying = false;
        this.innerAudioContext.destroy();
      });
      this.innerAudioContext.onError((err) => {
        common_vendor.index.__f__("error", "at pages/index/index.vue:372", "播放错误:", err);
        item.isPlaying = false;
        this.innerAudioContext.destroy();
        common_vendor.index.showToast({
          title: "播放失败，请重试",
          icon: "none"
        });
      });
      this.innerAudioContext.play();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.messages, (item, index, i0) => {
      return common_vendor.e({
        a: item.isSelf ? "/static/avatar-self.png" : "/static/avatar-other.png",
        b: item.type === "text"
      }, item.type === "text" ? {
        c: common_vendor.t(item.content)
      } : item.type === "voice" ? {
        e: item.isPlaying ? 1 : "",
        f: common_vendor.t(item.duration),
        g: common_vendor.o(($event) => $options.playVoice(item), index)
      } : {}, {
        d: item.type === "voice",
        h: common_vendor.t(item.time),
        i: index,
        j: item.isSelf ? 1 : ""
      });
    }),
    b: $data.scrollTop,
    c: common_vendor.o((...args) => $options.loadMoreMessages && $options.loadMoreMessages(...args)),
    d: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    e: $data.inputMessage,
    f: common_vendor.o(($event) => $data.inputMessage = $event.detail.value),
    g: common_vendor.o((...args) => $options.startRecording && $options.startRecording(...args)),
    h: common_vendor.o((...args) => $options.stopRecording && $options.stopRecording(...args)),
    i: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
