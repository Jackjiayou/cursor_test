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
      },
      scenarios: [
        { id: "attract", icon: "🎯", title: "吸引客户到现场", description: "学习如何有效吸引客户到店参观" },
        { id: "referral", icon: "🤝", title: "请老客户转介绍新客户", description: "学习如何获取老客户推荐新客户" },
        { id: "culture", icon: "🏢", title: "向客户介绍公司文化", description: "学习如何向客户展示公司文化和价值观" }
      ]
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
    // 开始训练
    startTraining(scenario) {
      common_vendor.index.navigateTo({
        url: `/pages/index/index?scenario=${encodeURIComponent(scenario.id)}`
      });
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
    f: common_vendor.f($data.scenarios, (item, index, i0) => {
      return {
        a: common_vendor.t(item.icon),
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.description),
        d: index,
        e: common_vendor.o(($event) => $options.startTraining(item), index)
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/training/index.js.map
