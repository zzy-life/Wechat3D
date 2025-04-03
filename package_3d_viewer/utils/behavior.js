
const { createScopedThreejs } = require('threejs-miniprogram');

const { registerGLTFLoader } = require('../../utils/GLTFLoader.js');
import { registerDRACOLoader } from "../../utils//DRACOLoader";
import cloneGltf from 'gltf-clone.js'
import Utlis from '../../utils/utlis';
//获取应用实例
const app = getApp()
//音频
var innerAudioContext;
export default function getBehavior() {
    return Behavior({
        data: {
            width: 1,
            height: 1,
            pixelRatioWidth: 1,
            pixelRatioHeight: 1,
            fps: 0,
            memory: 0,
            cpu: 0,
        },
        methods: {
            onReady() {
                wx.createSelectorQuery()
                    .select('#webgl')
                    .node()
                    .exec(res => {
                        this.canvas = res[0].node

                        const info = wx.getSystemInfoSync()
                        const pixelRatio = info.pixelRatio
                        const calcSize = (width, height) => {
                            console.log(`canvas size: width = ${width} , height = ${height}`)
                            this.canvas.width = width * pixelRatio / 2
                            this.canvas.height = height * pixelRatio / 2
                            this.setData({
                                width,
                                height,
                                pixelRatioWidth: width * pixelRatio,
                                pixelRatioHeight: height * pixelRatio,
                            })
                        }
                        calcSize(app.globalData.systeminfo.width, app.globalData.systeminfo.height)
                        //模型声音
                        innerAudioContext = wx.createInnerAudioContext({
                            useWebAudioImplement: false // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
                        })
                        innerAudioContext.obeyMuteSwitch = false
                        //模型声音
                        innerAudioContext.src = this.data.modelmusic
                        //循环播放
                        innerAudioContext.loop = true
                        this.initVK()
                    })
            },
            /**
             * @description: 销毁变量
             * @return {*}
             */
            onUnload() {
                if (this._texture) {
                    this._texture.dispose()
                    this._texture = null
                }
                if (this.renderer) {
                    this.renderer.dispose()
                    this.renderer = null
                }
                if (this.scene) {
                    this.scene.dispose()
                    this.scene = null
                }
                if (this.camera) this.camera = null
                if (this.model) this.model = null
                if (this._insertModel) this._insertModel = null
                if (this._insertModels) this._insertModels = null
                if (this.planeBox) this.planeBox = null
                if (this.mixers) {
                    this.mixers.forEach(mixer => mixer.uncacheRoot(mixer.getRoot()))
                    this.mixers = null
                }
                if (this.clock) this.clock = null

                if (this.THREE) this.THREE = null
                if (this._tempTexture && this._tempTexture.gl) {
                    this._tempTexture.gl.deleteTexture(this._tempTexture)
                    this._tempTexture = null
                }
                if (this._fb && this._fb.gl) {
                    this._fb.gl.deleteFramebuffer(this._fb)
                    this._fb = null
                }
                if (this._program && this._program.gl) {
                    this._program.gl.deleteProgram(this._program)
                    this._program = null
                }
                if (this.canvas) this.canvas = null
                if (this.gl) this.gl = null

                if (this.session) this.session = null
                if (innerAudioContext) {
                    innerAudioContext.stop() // 停止
                    innerAudioContext.destroy() // 销毁
                    innerAudioContext = null
                }
                if (this.anchor2DList) this.anchor2DList = []
            },
            initVK() {
                // 初始化 threejs
                this.initTHREE()
                const THREE = this.THREE

                // 自定义初始化
                if (this.init) this.init()

                console.log('this.gl', this.gl)
                //优先使用V2版本，如果不支持则使用V1版本
                let version = 'v1';
                if (Utlis.compareVersion(wx.getSystemInfoSync().SDKVersion, '2.23.4') != -1) {
                    const isSupportV2 = wx.isVKSupport('v2')
                    const isSupportV1 = wx.isVKSupport('v1')
                    console.log(isSupportV1);
                    if (!isSupportV1) {
                        this.setData({
                            popupflag: !this.data.popupflag
                        })
                        wx.showModal({
                            title: '提示',
                            content: '您的设备不支持AR功能',
                            success(res) {
                                wx.navigateTo({ url: '/pages/card/card' })
                            }
                        })
                    }
                    version = isSupportV2 ? 'v2' : 'v1'
                }
                const session = this.session = wx.createVKSession({
                    track: {
                        plane: {
                            mode: 1
                        },
                    },
                    version: version,
                    gl: this.gl
                })
                session.start(err => {

                    if (err) {
                        let info;
                        switch (err) {
                            case 2000001:
                                info = '参数错误'
                                break;
                            case 2003000:
                                info = '会话不可用'
                                break;
                            case 2000000:
                                info = '系统错误'
                                break;
                            case 2000002:
                                info = '设备不支持'
                                break;
                            case 2000003:
                                info = '系统不支持'
                                break;
                            case 2000004:
                                info = '设备不支持'
                                break;
                            case 2003001:
                                info = '未开启系统相机权限'
                                break;
                            case 2003002:
                                info = '未开启小程序相机权限'
                                break;

                            default:
                                info = err
                                break;
                        }
                        this.setData({
                            popupflag: !this.data.popupflag
                        })
                        wx.showModal({
                            title: '提示',
                            content: info,
                            success(res) {
                                wx.navigateTo({ url: '/pages/card/card' })
                            }
                        })


                        return console.error('VK error: ', info)
                    }


                    console.log('@@@@@@@@ VKSession.version', session.version)

                    const canvas = this.canvas

                    const calcSize = (width, height, pixelRatio) => {
                        console.log(`canvas size: width = ${width} , height = ${height}`)
                        this.canvas.width = width * pixelRatio / 2
                        this.canvas.height = height * pixelRatio / 2
                        this.setData({
                            width,
                            height,
                        })
                    }

                    session.on('resize', () => {
                        const info = wx.getSystemInfoSync()
                        calcSize(app.globalData.systeminfo.width, app.globalData.systeminfo.height * 0.8, info.pixelRatio)
                    })


                    const loader = new THREE.GLTFLoader();
                    // 设置gltfloader解压loader
                    const dracoLoader = new THREE.DRACOLoader();
                    //设置解码库，请将解码库放置本地项目库路径/draco/文件夹中，其他文件夹会报错
                    dracoLoader.setDecoderPath(
                        app.globalData.StaticURL + "/assets/draco/"
                    );
                    dracoLoader.setDecoderConfig({ type: 'js' });
                    dracoLoader.preload();
                    loader.setDRACOLoader(dracoLoader);
                    loader.load(this.data.modelUrl, gltf => {
                        this.model = {
                            scene: gltf.scene,
                            animations: gltf.animations,
                        }
                        this.setData({
                            infoflag: !this.data.infoflag
                        })

                    })

                    this.clock = new THREE.Clock()


                    //限制调用帧率
                    let fps = 30
                    let fpsInterval = 1000 / fps
                    let last = Date.now()

                    // 逐帧渲染
                    const onFrame = timestamp => {
                        let now = Date.now()
                        const mill = now - last
                        // 经过了足够的时间
                        if (mill > fpsInterval && !this.data.isShare) {
                            last = now - (mill % fpsInterval); //校正当前时间
                            const frame = session.getVKFrame(canvas.width, canvas.height)
                            if (frame) {
                                this.render(frame)

                            }
                        }
                        session.requestAnimationFrame(onFrame)
                    }
                    session.requestAnimationFrame(onFrame)
                })
            },
            initTHREE() {
                const THREE = this.THREE = createScopedThreejs(this.canvas)
                registerGLTFLoader(THREE)
                // 注册DRACOLoader
                registerDRACOLoader(THREE);
                // 相机
                this.camera = new THREE.Camera()

                // 场景
                const scene = this.scene = new THREE.Scene()
                // 环境光
                const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xfffc00);
                hemisphereLight.intensity = .3;
                scene.add(hemisphereLight);
                // 光源
                // 半球光
                const ambientLight = new THREE.AmbientLight(0xffffff);
                ambientLight.position.set(0, 0.2, 0)
                ambientLight.intensity = .8;
                scene.add(ambientLight);
                // 平行光
                const cubeGeometry = new THREE.BoxGeometry(0.001, 0.001, 0.001);
                const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
                const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                cube.position.set(0, 0, 0);
                let light = new THREE.DirectionalLight(0xffffff, 1);
                light.intensity = 1;
                light.position.set(0, 0.2, 0.1)
                //光源开启阴影
                light.castShadow = true;
                light.target = cube;
                //这两个值决定使用多少像素生成阴影 默认512
                light.shadow.mapSize.width = 2048;
                light.shadow.mapSize.height = 2048;
                //这四个值会影响模型阴影像素？
                light.shadow.camera.top = 5;
                light.shadow.camera.bottom = -5;
                light.shadow.camera.left = -5;
                light.shadow.camera.right = 5;
                scene.add(light);
                //ios开启抗锯齿会导致无法截屏
                let isAntialias = wx.getSystemInfoSync().platform == 'ios' ? false : true
                // 渲染层
                const renderer = this.renderer = new THREE.WebGLRenderer({
                    antialias: isAntialias,
                    alpha: true
                })
                renderer.shadowMapType = THREE.PCFSoftShadowMap;
                const devicePixelRatio = wx.getSystemInfoSync().pixelRatio;
                //预编译
                renderer.compile(scene, this.camera)
                //像素比，可能会影响性能
                renderer.setPixelRatio(devicePixelRatio * 0.6);
                //渲染器开启阴影
                renderer.shadowMap.enabled = true;
                renderer.gammaOutput = true
                renderer.gammaFactor = 1.8
            },

            copyRobot() {
                const THREE = this.THREE
                const {
                    scene,
                    animations
                } = cloneGltf(this.model, THREE)
                //模型大小
                scene.scale.set(this.data.modelsize.x, this.data.modelsize.y, this.data.modelsize.z)

                // 动画混合器
                let meshAnimation = animations[0];
                const mixer = new THREE.AnimationMixer(scene)
                mixer.clipAction(meshAnimation).play()

                this.mixers = this.mixers || []
                this.mixers.push(mixer)

                scene._mixer = mixer
                return scene
            },
            getRobot() {
                const THREE = this.THREE

                const model = new THREE.Object3D()
                model.add(this.copyRobot())

                this._insertModels = this._insertModels || []
                this._insertModels.push(model)
                // 限制模型数量
                if (this._insertModels.length > 1) {
                    const needRemove = this._insertModels.splice(0, this._insertModels.length - 1)
                    needRemove.forEach(item => {
                        if (item._mixer) {
                            const mixer = item._mixer
                            this.mixers.splice(this.mixers.indexOf(mixer), 1)
                            mixer.uncacheRoot(mixer.getRoot())
                        }
                        if (item.parent) item.parent.remove(item)
                    })
                }

                return model
            },
            onTouchEnd(evt) {
                // 点击位置放一个机器人
                const touches = evt.changedTouches.length ? evt.changedTouches : evt.touches
                if (touches.length === 1) {
                    const touch = touches[0]
                    if (this.session && this.scene && this.model) {
                        const hitTestRes = this.session.hitTest(touch.pageX / this.data.width, touch.pageY / this.data.height, this.resetPanel)
                        this.resetPanel = false
                        console.log(hitTestRes.length);
                        if (hitTestRes.length) {
                            //播放音频
                            innerAudioContext.seek(0.5)
                            let paused = innerAudioContext.paused;
                            //脑残腾讯，2.26.2版本之后，音频播放状态不准确，需要自己判断
                            if (Utlis.compareVersion(wx.getSystemInfoSync().SDKVersion, '2.26.2') != 1) {
                                innerAudioContext.paused == false ? paused = true : paused = false
                            }
                            if (paused) {
                                innerAudioContext.play() // 播放音频
                            }

                            innerAudioContext.onError((res) => {
                                console.log(res.errMsg)
                                console.log(res.errCode)
                            })

                            const model = this.getRobot()
                            model.matrixAutoUpdate = false
                            model.matrix.fromArray(hitTestRes[0].transform)
                            this.scene.add(model)
                        } else {
                            wx.showToast({
                                title: '请点击远处平面或移动手机初始化算法',
                                icon: 'none',
                                duration: 2000,
                                mask: true
                            })
                        }
                    }
                }
            }
        },
    })
}