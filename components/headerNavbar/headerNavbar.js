/*
 * @Author: 时不待我 790002517@qq.com
 * @Date: 2023-03-20 16:35:47
 * @LastEditors: 时不待我 790002517@qq.com
 * @LastEditTime: 2023-03-26 15:40:54
 */
// components/Goindex/Goindex.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    navbarData: { // 由父页面传递的数据
      type: Object,
      value: {},
      observer: function (newVal, oldVal) {
      }
    }
  },
  data: {
    haveBack: true, // 是否有返回按钮，true 有 false 没有 若从分享页进入则为 false
    navbarBtn: { // 胶囊位置信息
      height: 0,
      width: 0,
      top: 0,
      bottom: 0,
      right: 0
    },
    showMenu: true, // 菜单的显示状态
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    goHome() {
      wx.redirectTo({
        url: '/pages/card/card',
      })
    },
    goBack: function () {
      wx.navigateBack({
        delta: 1
      });
    },



  },
  // 微信7.0.0支持wx.getMenuButtonBoundingClientRect()获得胶囊按钮高度
  attached: function () {
    let statusBarHeight = app.globalData.systeminfo.statusBarHeight  // 状态栏高度
    let headerPosi = app.globalData.systeminfo.headerBtnPosi // 胶囊位置信息

    let btnPosi = { // 胶囊实际位置，坐标信息不是左上角原点
      height: statusBarHeight + 44,
      width: headerPosi.width,
      // 胶囊top
      top: statusBarHeight * 1.09,
      // 屏幕宽度 - 胶囊right
      right: app.globalData.systeminfo.screenWidth - headerPosi.right
    }
    let haveBack;
    if (getCurrentPages().length === 1) { // 当只有一个页面时
      haveBack = false;
    } else {
      haveBack = true;
    }
    this.setData({
      haveBack: haveBack, // 获取是否是通过分享进入的小程序
      navbarBtn: btnPosi
    })


  },

  lifetimes: {
    ready() {

    },
  }



})
