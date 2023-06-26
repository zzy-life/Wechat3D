// pages/animalDetails/animalDetails.js
import Utlis from '../../utils/utlis.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    animalData: {
      animalDetailed: '暂无数据',
    },
    Ary: [{
      key: "暂无数据",
      value: "暂无数据"
    }],
    imageiserror: false,
  },
  /**
   * @description: 跳转到AR展示页(camera)
   * @param {*} event
   * @return {*}
   */
  gotoURL(event) {
    console.log(event);

    const model = {
      // modelSize: event.currentTarget.dataset.modelsize,
      modelSize: '{"x":"0.8","y":"0.8","z":"0.8"}',
      modelUrl: event.currentTarget.dataset.modelurl,
      soundUrl: event.currentTarget.dataset.soundurl,
    }
    // const model = {
    //   modelSize: '{"x":"0.8","y":"0.8","z":"0.8"}',
    //   modelUrl: "https://wechat-3d-1305513514.cos.ap-shanghai.myqcloud.com/model/Africa_lion/model.gltf",
    //   soundUrl: "https://wechat-3d-1305513514.cos.ap-shanghai.myqcloud.com/model/Africa_lion/Feline_Lion_Male_Adult.mp3",
    // }
    let arr = JSON.stringify(model);
    wx.navigateTo({
      url: event.currentTarget.dataset.path,
      events: {},
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('gotoURLData', { data: arr })
      }
    })
  },
  _animate() {
    //跨组件元素选择器
    this.animate('.animalDetails>>>.header', [{
      backgroundColor: 'transparent',

    }, {
      backgroundColor: '#FFF',
    }], 1000, {
      scrollSource: '#headers',
      timeRange: 1000,
      startScrollOffset: 0,
      endScrollOffset: 44,
    })

    //跨组件元素选择器
    this.animate('.animalDetails>>>.floatL>>>.van-icon', [{
      color: '#FFF',

    }, {
      color: '#000',
    }], 1000, {
      scrollSource: '#headers',
      timeRange: 1000,
      startScrollOffset: 0,
      endScrollOffset: 44,
    })

  },
  /**
   * @description: 图片加载发生错误就调用视频组件显示
   * @return {*}
   */
  imagebinderror() {
    this.setData({
      imageiserror: true
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

    //监听从animalCrd组件传过来的数据
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('gotoURLData', (data) => {
      let modelData = JSON.parse(data.data)
      if (Utlis.checkIsJSON(modelData.animalGenus)) {
        modelData.animalGenus = JSON.parse(modelData.animalGenus)
        let Ary = []
        for (var key in modelData.animalGenus) {
          let obj = {
            key: key,
            value: modelData.animalGenus[key]
          }
          Ary.push(obj)
        }
        this.setData({
          Ary: Ary
        })
      }

      this.setData({
        animalData: modelData,
      })
      this._animate()
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})