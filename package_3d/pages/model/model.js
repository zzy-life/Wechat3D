/*
 * @Author: 时不待我 790002517@qq.com
 * @Date: 2023-02-12 12:21:32
 * @LastEditors: 时不待我 790002517@qq.com
 * @LastEditTime: 2023-04-01 13:47:50
 */
const cameraBusiness = require('../../utils/cameraBusiness.js')
const canvasId = 'canvas1';
//获取应用实例
const app = getApp()
// a gltf model url
// const modelUrl =  app.globalData.StaticURL + '/model/tiger/tiger.gltf';
// const modelmusic = app.globalData.StaticURL + '/model/tiger/Tiger.mp3';
// //模型大小
// const modelsize = {
//   x: 2.8,
//   y: 2.8,
//   z: 2.8
// }
Page({
  data: {
    infoflag: false,
    interactionW: '',
  },
  onLoad() {
    //监听从animalCrd组件传过来的数据
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('gotoURLData', (data) => {
      let modelData = JSON.parse(data.data)
      const { modelUrl, soundUrl, modelSize, modelPosition, interactions } = modelData.sysModel;
      const modelsize = JSON.parse(modelSize)
      const modelposition = JSON.parse(modelPosition)
      cameraBusiness.initThree(canvasId, modelUrl, soundUrl, modelsize, modelposition, interactions, this);
    })


  },
  onUnload() {
    cameraBusiness.stopAnimate();
    cameraBusiness.dispose()

  },
  handleMouseClick(event) {
    cameraBusiness.handleMouseClick(event);

  },
  bindtouchstart_callback(event) {
    cameraBusiness.onTouchstart(event);
  },
  bindtouchmove_callback(event) {
    cameraBusiness.onTouchmove(event);
  },
  bindtouchEnd_callback(event) {
    cameraBusiness.onTouchend(event);


  },


});
