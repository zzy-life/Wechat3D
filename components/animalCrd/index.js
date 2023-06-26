/*
 * @Author: 时不待我 790002517@qq.com
 * @Date: 2023-03-12 21:03:10
 * @LastEditors: 时不待我 790002517@qq.com
 * @LastEditTime: 2023-04-01 22:27:02
 */


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cardData: {
      type: Object,
      value: {},
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 是否已经收藏
    getStart: false,
    getList: []


  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击收藏
     */
    collectStart() {
      this.setData({
        getStart: !this.data.getStart
      })

    },
    /**
  * @description: 跳转到AR展示页(camera)
  * @param {*} event
  * @return {*}
  */
    gotoARURL(event) {
      console.log(event);

      const model = {
        // modelSize: event.currentTarget.dataset.modelsize,
        modelSize: '{"x":"0.8","y":"0.8","z":"0.8"}',
        modelUrl: event.currentTarget.dataset.modelurl,
        soundUrl: event.currentTarget.dataset.soundurl,
      }

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

    /**
     * @description: 跳转到详情页(animalDetails)或者3D展示页(model)
     * @param {*} event
     * @return {*}
     */
    gotoURL(event) {
      let modelStr = JSON.stringify(event.currentTarget.dataset.modeldata)
      wx.navigateTo({
        url: event.currentTarget.dataset.path,
        events: {},
        success: function (res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('gotoURLData', { data: modelStr })
        }
      })
    },


  },
  attached() {

  },
  ready() {
  }


})
