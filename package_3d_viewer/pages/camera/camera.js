/*
 * @Author: 时不待我 790002517@qq.com
 * @Date: 2023-02-12 12:21:32
 * @LastEditors: 时不待我 790002517@qq.com
 * @LastEditTime: 2023-04-03 14:10:16
 */
import getBehavior from '../../utils/behavior'
import yuvBehavior from '../../utils/yuvBehavior'
import flip from '../../utils/flip'
const NEAR = 0.001
const FAR = 1000

//获取应用实例
const app = getApp()

Component({
  behaviors: [getBehavior(), yuvBehavior],
  data: {
    theme: 'light',
    infoflag: true,
    popupflag: true,
    modelmusic: app.globalData.StaticURL + '/model/tiger/Tiger.mp3',
    modelUrl: app.globalData.StaticURL + '/model/tiger/tiger.gltf',
    modelsize: {
      x: 0.8,
      y: 0.8,
      z: 0.8
    },
    //截图时进行锁帧
    isShare: false,

  },

  lifetimes: {
    detached() {
      console.log("页面detached")
      if (wx.offThemeChange) {
        wx.offThemeChange()
      }
    },

    ready() {
      console.log("页面准备完全")
      //监听从animalDetails传过来的数据
      const eventChannel = this.getOpenerEventChannel()
      //监听gotoURLData事件，获取上一页面通过eventChannel传送到当前页面的数据
      eventChannel.on('gotoURLData', (data) => {
        let modelData = JSON.parse(data.data)
        this.setData({
          modelmusic: modelData.soundUrl,
          modelUrl: modelData.modelUrl,
          modelsize: JSON.parse(modelData.modelSize),
          theme: wx.getSystemInfoSync().theme || 'light'
        })
      })


      if (wx.onThemeChange) {
        wx.onThemeChange(({ theme }) => {
          this.setData({ theme })
        })
      }
    },
  },

  methods: {
    init() {
      this.initGL()
    },
    infoOK() {
      this.setData({
        popupflag: !this.data.popupflag
      })
    },

    /**
     * @description: 分享按钮
     * @return {*}
     */
    share() {
      wx.showLoading({
        title: '正在生成图片..',
        mask: true
      })
      this.setData({
        isShare: true
      })
      const frame = this.canvas
      const gl = this.gl;

      const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
      const pixels = new Uint8Array(width * height * 4);

      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
      flip(pixels, width, height, 4);
      wx.canvasPutImageData(
        {
          canvasId: 'myCanvas',
          data: new Uint8ClampedArray(this.typedArrayToBuffer(pixels)),
          x: 0,
          y: 0,
          width: frame.width,
          height: frame.height,
          success: (res) => {
            // 图片保存到 canvas
            this.save(frame)
          },
          fail(res) {
            console.log(res);
          }
        }
      )

    },
    typedArrayToBuffer(array) {
      return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset)
    },
    /**
     * @description: 保存图片
     * @param {*} frame
     * @return {*}
     */
    save(frame) {
      return wx
        .canvasToTempFilePath({
          x: 0,
          y: 0,
          width: frame.width,
          height: frame.height,
          canvasId: "myCanvas",
          fileType: "jpg",
          destWidth: frame.width,
          destHeight: frame.height,
        })
        .then(
          (res) => {
            console.log(res.tempFilePath);
            wx.hideLoading()
            this.setData({
              isShare: false
            })
            wx.showShareImageMenu({
              path: res.tempFilePath
            })

          },
          (tempError) => {
            console.log(tempError);
            wx.showToast({
              title: "图片生成失败，重新检测",
              icon: "none",
              duration: 1000
            });
          }
        );
    },

    //逐帧渲染
    render(frame) {
      this.renderGL(frame)

      const camera = frame.camera
      const dt = this.clock.getDelta()
      if (this.mixers) {
        this.mixers.forEach(mixer => mixer.update(dt))
      }

      // 相机
      if (camera) {
        this.camera.matrixAutoUpdate = false
        // 用AR帧frame的相机，更新three.js的相机的视图矩阵
        this.camera.matrixWorldInverse.fromArray(camera.viewMatrix)
        this.camera.matrixWorld.getInverse(this.camera.matrixWorldInverse)

        const projectionMatrix = camera.getProjectionMatrix(NEAR, FAR)
        // 用AR帧frame的相机，更新three.js的相机的投影矩阵
        this.camera.projectionMatrix.fromArray(projectionMatrix)
        this.camera.projectionMatrixInverse.getInverse(this.camera.projectionMatrix)
      }

      this.renderer.autoClearColor = false
      this.renderer.render(this.scene, this.camera)
      // 保留模型的正面和背面
      this.renderer.state.setCullFace(this.THREE.CullFaceNone)
    },
  },
})
