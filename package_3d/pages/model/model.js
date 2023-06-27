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
const modelUrl =  app.globalData.StaticURL + '/model/cxz/YinXingJie_glb.gltf';
const soundUrl = app.globalData.StaticURL + '/model/tiger/Tiger.mp3';
//模型大小
const modelSize = "{\"x\":\"3.5\",\"y\":\"3.5\",\"z\":\"3.5\"}"
const modelPosition =  "{\"x\": 0,\"y\": -2,\"z\": 2}"
const interactions =  [
  {
      "createTime": "2023-03-11 15:10:38",
      "updateTime": "2023-04-01 22:33:58",
      "interactionId": 1,
      "interactionPosition": "{\"x\":-2,\"y\":5,\"z\":0}",
      "interactionW": "<p>\r\n    你是<strong style=\"color: #FFFC00;text-shadow: 0px 1px 1px rgb(0 0 0 / 25%);font-weight: normal;\">「嘿嘿嘿侦探社」</strong>的实习侦探 \u200d，接到上级指派任务，到<strong style=\"color: #FFFC00;text-shadow: 0px 1px 1px rgb(0 0 0 / 25%);font-weight: normal;\">「甄开心小镇」</strong>调查市民<strong style=\"color: #FFFC00;text-shadow: 0px 1px 1px rgb(0 0 0 / 25%);font-weight: normal;\">「甄不戳」</strong>宝石 失窃案，根据线人<strong style=\"color: #FFFC00;text-shadow: 0px 1px 1px rgb(0 0 0 / 25%);font-weight: normal;\">「流浪汉老石」</strong>提供的线索，小偷就躲在小镇，快把他找出来，帮甄不戳寻回失窃的宝石吧！\r\n</p>",
      "interactionSequence": "https://wechat-3d-1305513514.cos.ap-shanghai.myqcloud.com/assets/1.png"
  },
  {
      "createTime": "2023-03-11 15:11:03",
      "updateTime": "2023-04-01 22:34:54",
      "interactionId": 2,
      "interactionPosition": "{\"x\":5,\"y\":5,\"z\":-5}",
      "interactionW": "<p>\r\n    我是<strong style=\"color: #FFFC00;text-shadow: 0px 1px 1px rgb(0 0 0 / 25%);font-weight: normal;\">「动物知识派对小程序」</strong>的动物 \u200d，更多信息等待后续开发吧！\r\n</p>",
      "interactionSequence": "https://wechat-3d-1305513514.cos.ap-shanghai.myqcloud.com/assets/2.png"
  }
]
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
    //本地测试
    // const modelsize = JSON.parse(modelSize)
    // const modelposition = JSON.parse(modelPosition)
    // cameraBusiness.initThree(canvasId, modelUrl, soundUrl, modelsize, modelposition, interactions, this);

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
