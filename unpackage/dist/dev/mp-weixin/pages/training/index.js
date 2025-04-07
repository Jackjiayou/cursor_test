"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      employeeInfo: {
        name: "张经理",
        avatar: "/static/avatar-other.png",
        stats: {
          times: 12,
          duration: "3.5h",
          scenarios: 3
        }
      }
    };
  },
  methods: {
    // 查看排行榜
    viewRanking() {
      common_vendor.index.showToast({
        title: "查看排行榜",
        icon: "none"
      });
    },
    // 查看练习记录
    viewHistory() {
      common_vendor.index.showToast({
        title: "查看练习记录",
        icon: "none"
      });
    },
    // 开始培训
    startTraining(scenario) {
      let title = "";
      switch (scenario) {
        case "attract":
          title = "吸引客户到现场";
          break;
        case "referral":
          title = "请老客户转介绍新客户";
          break;
        case "culture":
          title = "向客户介绍公司文化";
          break;
      }
      setTimeout(() => {
        common_vendor.index.navigateTo({
          url: "/pages/index/index?scenario=" + encodeURIComponent(title),
          success: () => {
            common_vendor.index.__f__("log", "at pages/training/index.vue:133", "跳转成功");
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/training/index.vue:136", "跳转失败:", err);
            common_vendor.index.showToast({
              title: "跳转失败，请重试",
              icon: "none"
            });
          }
        });
      }, 100);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_assets._imports_1,
    c: common_vendor.o((...args) => $options.viewRanking && $options.viewRanking(...args)),
    d: common_assets._imports_2,
    e: common_vendor.o((...args) => $options.viewHistory && $options.viewHistory(...args)),
    f: common_vendor.o(($event) => $options.startTraining("attract")),
    g: common_vendor.o(($event) => $options.startTraining("referral")),
    h: common_vendor.o(($event) => $options.startTraining("culture"))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/training/index.js.map
