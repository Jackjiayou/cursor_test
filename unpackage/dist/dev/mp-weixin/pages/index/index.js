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
      recordingDuration: 0,
      // 场景问题列表
      scenarioQuestions: {
        "attract": [
          "请用1分钟时间介绍如何吸引客户到现场参观？",
          "如果客户对价格有异议，你会如何引导客户到现场？",
          "请分享一个成功吸引客户到现场的案例。"
        ],
        "referral": [
          "你会如何向老客户请求转介绍？",
          "请分享一个成功获取老客户转介绍的案例。",
          "如果老客户不愿意转介绍，你会如何处理？"
        ],
        "culture": [
          "请用1分钟时间介绍公司的核心价值观。",
          "你会如何向客户展示公司的专业能力？",
          "请分享一个体现公司文化的成功案例。"
        ]
      },
      // 场景标题映射
      scenarioTitles: {
        "attract": "吸引客户到现场",
        "referral": "请老客户转介绍新客户",
        "culture": "向客户介绍公司文化"
      },
      currentScenario: "",
      currentQuestion: ""
    };
  },
  onLoad(options) {
    if (options.scenario) {
      this.currentScenario = decodeURIComponent(options.scenario);
      const title = this.scenarioTitles[this.currentScenario] || this.currentScenario;
      common_vendor.index.setNavigationBarTitle({
        title
      });
      const questions = this.scenarioQuestions[this.currentScenario] || [];
      if (questions.length > 0) {
        const randomIndex = Math.floor(Math.random() * questions.length);
        this.currentQuestion = questions[randomIndex];
        this.messages.push({
          content: this.currentQuestion,
          time: this.getCurrentTime(),
          isSelf: false,
          type: "text"
        });
      }
    }
    this.recorderManager = common_vendor.index.getRecorderManager();
    this.initRecorder();
    this.innerAudioContext = common_vendor.index.createInnerAudioContext();
    this.innerAudioContext.onEnded(() => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:139", "音频播放结束");
    });
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
        timestamp: (/* @__PURE__ */ new Date()).getTime(),
        scenario: this.currentScenario,
        question: this.currentQuestion
      };
      if (message.type === "voice") {
        requestData.voiceUrl = message.voiceUrl;
        requestData.duration = message.duration;
      }
      common_vendor.index.request({
        url: this.apiUrl,
        method: "POST",
        data: requestData,
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          var _a;
          common_vendor.index.__f__("log", "at pages/index/index.vue:199", "API响应:", res);
          common_vendor.index.hideLoading();
          if (res.statusCode === 200 && res.data) {
            if (message.type === "voice") {
              if (res.data.text) {
                message.text = res.data.text;
              }
              if (res.data.evaluation) {
                message.evaluation = res.data.evaluation;
                message.showEvaluation = false;
              }
            }
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
            common_vendor.index.__f__("error", "at pages/index/index.vue:236", "API响应错误:", res);
            common_vendor.index.showToast({
              title: "获取回复失败: " + (((_a = res.data) == null ? void 0 : _a.detail) || "未知错误"),
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:244", "API请求失败:", err);
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
      this.recorderManager = common_vendor.index.getRecorderManager();
      this.recorderManager.onStart(() => {
        common_vendor.index.__f__("log", "at pages/index/index.vue:284", "录音开始");
        this.isRecording = true;
        this.recordingStartTime = (/* @__PURE__ */ new Date()).getTime();
        common_vendor.index.showToast({
          title: "正在录音...",
          icon: "none",
          duration: 6e4
        });
      });
      this.recorderManager.onStop((res) => {
        common_vendor.index.__f__("log", "at pages/index/index.vue:297", "录音结束", res);
        this.isRecording = false;
        this.recordingDuration = Math.round(((/* @__PURE__ */ new Date()).getTime() - this.recordingStartTime) / 1e3);
        common_vendor.index.hideToast();
        if (res.tempFilePath) {
          this.uploadVoiceFile(res.tempFilePath);
        } else {
          common_vendor.index.showToast({
            title: "录音文件获取失败",
            icon: "none"
          });
        }
      });
      this.recorderManager.onError((err) => {
        common_vendor.index.__f__("error", "at pages/index/index.vue:318", "录音错误:", err);
        this.isRecording = false;
        common_vendor.index.hideToast();
        common_vendor.index.showToast({
          title: "录音失败: " + (err.errMsg || "未知错误"),
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
          duration: this.recordingDuration,
          scenario: this.currentScenario,
          question: this.currentQuestion
        },
        success: (uploadRes) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:345", "上传成功:", uploadRes);
          common_vendor.index.hideLoading();
          let response;
          try {
            response = JSON.parse(uploadRes.data);
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/index/index.vue:353", "解析响应失败:", e);
            response = { success: false };
          }
          if (response.success && response.voiceUrl) {
            const voiceMessage = {
              content: "语音消息",
              time: this.getCurrentTime(),
              isSelf: true,
              type: "voice",
              voiceUrl: response.voiceUrl,
              duration: this.recordingDuration,
              scenario: this.currentScenario,
              question: this.currentQuestion
            };
            this.messages.push(voiceMessage);
            this.scrollToBottom();
            this.sendToApi(voiceMessage);
          } else {
            common_vendor.index.__f__("error", "at pages/index/index.vue:376", "上传失败:", response);
            common_vendor.index.showToast({
              title: "上传失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:384", "上传失败:", err);
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
      if (this.isRecording) {
        this.stopRecording();
        return;
      }
      common_vendor.index.authorize({
        scope: "scope.record",
        success: () => {
          if (this.recorderManager) {
            this.recorderManager.start({
              duration: 6e4,
              // 最长录音时间，单位ms
              sampleRate: 16e3,
              numberOfChannels: 1,
              encodeBitRate: 96e3,
              format: "mp3"
            });
          } else {
            common_vendor.index.__f__("error", "at pages/index/index.vue:415", "录音管理器未初始化");
            common_vendor.index.showToast({
              title: "录音初始化失败",
              icon: "none"
            });
          }
        },
        fail: () => {
          common_vendor.index.showModal({
            title: "提示",
            content: "需要录音权限才能发送语音消息",
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                common_vendor.index.openSetting({
                  success: (settingRes) => {
                    common_vendor.index.__f__("log", "at pages/index/index.vue:432", "设置页面打开成功:", settingRes);
                  },
                  fail: (err) => {
                    common_vendor.index.__f__("error", "at pages/index/index.vue:435", "打开设置页面失败:", err);
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
        common_vendor.index.__f__("log", "at pages/index/index.vue:448", "停止录音");
        this.recorderManager.stop();
        this.isRecording = false;
        common_vendor.index.hideToast();
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:501", "播放错误:", err);
        item.isPlaying = false;
        this.innerAudioContext.destroy();
        common_vendor.index.showToast({
          title: "播放失败，请重试",
          icon: "none"
        });
      });
      this.innerAudioContext.play();
    },
    // 切换内容显示
    toggleContent(item) {
      item.showContent = !item.showContent;
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
      } : item.type === "voice" ? common_vendor.e({
        e: item.isPlaying ? 1 : "",
        f: common_vendor.t(item.duration),
        g: common_vendor.o(($event) => $options.playVoice(item), index),
        h: item.text || item.evaluation
      }, item.text || item.evaluation ? common_vendor.e({
        i: common_vendor.t(item.showContent ? "▼" : "▶"),
        j: common_vendor.t(item.showContent ? "收起" : "展开"),
        k: common_vendor.o(($event) => $options.toggleContent(item), index),
        l: item.showContent
      }, item.showContent ? common_vendor.e({
        m: item.text
      }, item.text ? {
        n: common_vendor.t(item.text)
      } : {}, {
        o: item.evaluation
      }, item.evaluation ? {
        p: common_vendor.t(item.evaluation)
      } : {}) : {}) : {}) : {}, {
        d: item.type === "voice",
        q: common_vendor.t(item.time),
        r: index,
        s: item.isSelf ? 1 : ""
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
