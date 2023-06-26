/*
 * @Author: 时不待我 790002517@qq.com
 * @Date: 2023-02-12 12:21:32
 * @LastEditors: 时不待我 790002517@qq.com
 * @LastEditTime: 2023-03-26 15:28:04
 */
//app.js
App({
  onLaunch: function () {
    wx.getSystemInfo({
      success: (res) => {
        console.log(res);
        // 获取可使用窗口宽度
        this.globalData.systeminfo.height = res.windowHeight;
        // 获取可使用窗口高度
        this.globalData.systeminfo.width = res.windowWidth;
        // 获取状态栏高度
        this.globalData.systeminfo.statusBarHeight = res.statusBarHeight;
      }
    })
    // 获得胶囊按钮位置信息
    this.globalData.systeminfo.headerBtnPosi = wx.getMenuButtonBoundingClientRect()
    //设置音频播放不受静音开关控制
    wx.setInnerAudioOption({
      obeyMuteSwitch: false,
      success: function (e) {
        console.log(e)
        console.log('play success')
      },
      fail: function (e) {
        console.log(e)
        console.log('play fail')
      }
    })
  },
  globalData: {
    systeminfo:{
      height: 0, width: 0, statusBarHeight: 0 // 状态栏高度
    },
  
    headerBtnPosi: null,
    StaticURL: 'https://.com',

  },
})