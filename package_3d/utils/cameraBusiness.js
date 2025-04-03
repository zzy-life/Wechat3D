const { createScopedThreejs } = require('threejs-miniprogram');
const { registerGLTFLoader } = require('../../utils/GLTFLoader.js');
const { GetOrbitControls } = require('orbitControls');
import { registerDRACOLoader } from "../../utils//DRACOLoader";
const TWEEN = require('@tweenjs/tween.js');
import Animations from 'animations';
import Common from 'common';
import Utlis from '../../utils/utlis';
var camera, scene, renderer;
var canvas;
var THREE;
var mainModel, requestId;
var modelsize;
var modelposition;
var mixer;
var clock;
//模型加载进度
let loadingProcess = 0;
//照相机配置
var controls;
//交互点
var interactablePoints = [
    { key: '1', value: '摩天大楼', location: { x: -2, y: 5, z: 0 }, lmageurl: getApp().globalData.StaticURL + '/assets/1.png' },
    { key: '2', value: '双子大楼', location: { x: 5, y: 5, z: -5 }, lmageurl: getApp().globalData.StaticURL + '/assets/2.png' },
];
var cityGroup;
var interactableMeshes = [];
//音频
var innerAudioContext;
//获取应用实例
const app = getApp()
let page;
function initThree(canvasId, modelUrl, modelmusic, size, position, interactions, _this) {

    modelsize = size
    modelposition = position
    page = _this;
    console.log(interactions);
    // interactablePoints = interactions;
    interactablePoints = interactions.map((node) => {
        return {
            key: node.interactionId,
            value: node.interactionId,
            location: JSON.parse(node.interactionPosition),
            interactionW: node.interactionW,
            lmageurl: node.interactionSequence
        }
    })
    wx.createSelectorQuery()
        .select('#' + canvasId)
        .node()
        .exec((res) => {
            canvas = res[0].node;
            let [width, height] = [app.globalData.systeminfo.width, app.globalData.systeminfo.height];
            canvas.width = width;
            canvas.height = height;
            //获取threejs
            THREE = createScopedThreejs(canvas);
            //注册时间管理器
            clock = new THREE.Clock();
            //交互点组
            cityGroup = new THREE.Group();
            innerAudioContext = wx.createInnerAudioContext({
                useWebAudioImplement: false // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
            })
            innerAudioContext.obeyMuteSwitch = false
            //模型声音
            innerAudioContext.src = modelmusic
            //循环播放
            innerAudioContext.loop = true

            initScene();
            loadModel(modelUrl);
        });
}

/**
 * @description: 初始化透视摄影机
 * @return {*}
 */
function initScene() {
    //视野角度,长宽比,近截面,远截面
    camera = new THREE.PerspectiveCamera(65,
        canvas.width / canvas.height,
        1,
        1000);
    // 摄像机位置初始位置
    camera.position.set(0, 5, 21);
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // Set look at coordinate like this

    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({
        //抗锯齿
        antialias: true,
        alpha: true,
    });
    // options are THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
    renderer.shadowMapType = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene();
    //环境图
    // scene.background = new THREE.TextureLoader().load('https://wechat-3d-1305513514.cos.ap-shanghai.myqcloud.com/model/elephant_animation/123.jpg');
    // threejs中采用的是右手坐标系，红线是X轴，绿线是Y轴，蓝线是Z轴
    //在非正式版中显示xyz轴辅助线
    if (wx.getAccountInfoSync().miniProgram.envVersion != 'release') {
        var axes = new THREE.AxisHelper(30);
        scene.add(axes);
    }

    // 环境光
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xfffc00);
    hemisphereLight.intensity = .3;
    scene.add(hemisphereLight);
    // 直射光
    const cubeGeometry = new THREE.BoxGeometry(0.001, 0.001, 0.001);
    const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0, 0);
    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.intensity = 1;
    light.position.set(0, 5, 5);
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
    // 半球光
    const ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.intensity = .8;
    scene.add(ambientLight);
    // 网格
    // const grid = new THREE.GridHelper(200, 200, 0xffffff, 0xffffff);
    // //第二参数是高
    // grid.position.set(0, -2, -50);
    // grid.material.transparent = true;
    // grid.material.opacity = 1;
    // scene.add(grid);

    // 创建地面
    var planeGeometry = new THREE.PlaneGeometry(200, 200);
    // 透明材质显示阴影
    var planeMaterial = new THREE.ShadowMaterial({ opacity: .5 });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(0, -2, -50);
    //地面接收阴影
    plane.receiveShadow = true;
    scene.add(plane);
    const devicePixelRatio = wx.getSystemInfoSync().pixelRatio;
    console.log('devicePixelRatio', devicePixelRatio);
    //预编译
    renderer.compile(scene, camera)
    //像素比，可能会影响性能
    renderer.setPixelRatio(devicePixelRatio * 0.6);
    renderer.setSize(canvas.width, canvas.height);
    //渲染器开启阴影
    renderer.shadowMap.enabled = true;
    // gamma色彩空间校正，以适应人眼对亮度的感觉。
    renderer.gammaOutput = true
    renderer.gammaFactor = 1.8

    //镜头控制
    initControl(renderer.domElement, THREE);

    animate();
}


/**
 * @description: 镜头控制
 * @param {*} domElement
 * @param {*} THREE
 * @return {*}
 */
function initControl(domElement, THREE) {
    const OrbitControls = GetOrbitControls(camera, domElement, THREE);
    controls = new OrbitControls(camera, domElement);
    controls.target.set(0, 0, 0);
    //阻尼，请注意，如果它被启用，你必须在你的动画循环里调用.update()。
    controls.enableDamping = true;
    controls.maxDistance = 160;

    //最大仰视角和俯视角，范围是0到Math.PI
    controls.minPolarAngle = 0.9;
    controls.maxPolarAngle = 1.8;
    //是否可旋转，旋转速度
    controls.enableRotate = true;
    controls.rotateSpeed = 3.5;
    //鼠标控制是否可用
    controls.enabled = true;
    //滚轮是否可控制zoom，zoom速度默认1
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;
    // 当fps为60时每转30s
    // controls.autoRotateSpeed = 2.0;
    // 自动围绕目标旋转。请注意，如果它被启用，你必须在你的动画循环里调用.update()。
    // controls.autoRotate = true;
    controls.update();
}

/**
 * @description: 模型加载过程
 * @return {*}
 */
function createLoaderManager() {
    var loaderManager = new THREE.LoadingManager(onLoad, onProgress, onError);
    function onLoad(e) {
        console.log('加载完成')
    }
    function onProgress(e, loaded, total) {
        let tArr = e.split('/');
        let t = tArr[tArr.length - 1];
        if (Math.floor(loaded / total * 100) === 100) {
            setTimeout(() => {
                loadingProcess = Math.floor(loaded / total * 100)
                //使用动画切换到近距离

                Animations.animateCamera(camera, controls, { x: 0, y: 1, z: 10 }, { x: 0, y: 0, z: 0 }, 1200, () => { });
            }, 800);
        } else {
            loadingProcess = Math.floor(loaded / total * 100)
        }
        console.log('正在加载', t)
    }
    function onError(e) {
        let tArr = e.split('/');
        let t = tArr[tArr.length - 1];
        console.log('onError', t)
    }
    return loaderManager;
}
/**
 * @description: 模型加载
 * @param {*} modelUrl
 * @return {*}
 */
function loadModel(modelUrl) {
    registerGLTFLoader(THREE);
    // 注册DRACOLoader
    registerDRACOLoader(THREE);
    var loaderManager = createLoaderManager();
    var loader = new THREE.GLTFLoader(loaderManager);
    // 设置gltfloader解压loader
    const dracoLoader = new THREE.DRACOLoader();
    //设置解码库，请将解码库放置本地项目库路径/draco/文件夹中，其他文件夹会报错,解码库也要放置服务器上
    dracoLoader.setDecoderPath(
        app.globalData.StaticURL + "/assets/draco/"
    );
    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoader.preload();
    loader.setDRACOLoader(dracoLoader);

    wx.showLoading({
        title: 'Loading Model...',
    });
    loader.load(modelUrl,
        gltf => {
            console.log('loadModel', 'success');
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    //开启阴影
                    child.castShadow = true;
                    child.receiveShadow = true;
                }

            });

            // save model
            var model = gltf.scene;

            model.position.set(modelposition.x, modelposition.y, modelposition.z);//调整模型位置
            model.scale.set(modelsize.x, modelsize.y, modelsize.z);//调整模型大小

            //调整方位
            // model.rotateY(-Math.PI * 0.3)

            // 模型动画
            let meshAnimation = gltf.animations[0];
            mixer = new THREE.AnimationMixer(gltf.scene);
            let animationClip = meshAnimation;
            if (animationClip == undefined) {
                console.log('模型没有动画');
            } else {
                let clipAction = mixer.clipAction(animationClip).play();
                //动画有多少秒
                animationClip = clipAction.getClip();
                console.log('动画时间', animationClip.duration);
            }

            let paused = innerAudioContext.paused;
            //脑残腾讯，2.26.2版本之后，音频播放状态不准确，需要自己判断
            if (Utlis.compareVersion(wx.getSystemInfoSync().SDKVersion, '2.26.2') != 1) {
                innerAudioContext.paused == false ? paused = true : paused = false
            }
            if (paused) {
                console.log('准备播放音频');
                innerAudioContext.seek(0.5)
                innerAudioContext.play() // 播放音频
                innerAudioContext.onError((res) => {
                    console.log(res.errMsg)
                    console.log(res.errCode)
                })
            }

            //加入交互点
            if (interactablePoints.length) {
                let point = Common.makeCycleLmageTextSprite(interactablePoints, THREE);
                point.forEach(element => {
                    cityGroup.add(element);
                    interactableMeshes.push(element);
                });
            }


            //文字交互点真机有问题
            // interactablePoints.map(item => {
            //     let point = Common.makeCycleLmageTextSprite(item.key,THREE);
            //     point.name = item.value;
            //     point.scale.set(0.6, 0.6, 0.6);
            //     point.position.set(item.location.x, item.location.y, item.location.z);
            //     cityGroup.add(point);
            //     interactableMeshes.push(point);
            // })
            scene.add(cityGroup);
            //将模型加入到交互点中
            // interactableMeshes.push(model);
            mainModel = model;
            scene.add(model);

            wx.hideLoading();
        },
        null,
        function (error) {
            console.log('loadModel', error);
            wx.hideLoading();
            wx.showToast({
                title: 'Loading model failed.',
                icon: 'none',
                duration: 3000,
            });
        });

}


/**
 * @description: 动画事件，会周期律调用
 * @return {*}
 */
function animate() {
    //使用setTimeout来控制动画的帧率,这里设置为30帧
    // setTimeout(() => {
    requestId = canvas.requestAnimationFrame(animate);
    // 动画更新
    let time = clock.getDelta();
    mixer && mixer.update(time);
    TWEEN && TWEEN.update();
    // }, 1000 / 30);

    controls && controls.update();
    // 透视摄影机的渲染
    renderer.render(scene, camera);
}


/**
 * @description: 处理点击事件
 * @param {*} event
 * @return {*}
 */
function handleMouseClick(event) {
    // 增加点击事件，声明raycaster和mouse变量
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    // 通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
    mouse.x = (event.changedTouches[0].clientX / app.globalData.systeminfo.width) * 2 - 1;
    mouse.y = - (event.changedTouches[0].clientY / app.globalData.systeminfo.height) * 2 + 1;
    // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
    raycaster.setFromCamera(mouse, camera);
    // 获取raycaster直线和所有模型相交的数组集合
    var intersects = raycaster.intersectObjects(interactableMeshes, true);

    if (intersects.length > 0) {
        Animations.animateCamera(camera, controls, { x: 0, y: 1, z: 10 }, { x: 0, y: 0, z: 0 }, 1200, () => {
            console.log(intersects[0].object);
            //如果点击了交互点
            if (intersects[0].object.type == "Sprite") {
                for (var i = 0; i < interactablePoints.length; i++) {
                    if (interactablePoints[i]['key'] === intersects[0].object.name) {
                        //增加页面文案
                        page.setData({
                            interactionW: interactablePoints[i].interactionW,
                        })
                    }
                }
                page.setData({
                    infoflag: true,
                })

            } else {

            }

        });
    } else {
        page.setData({
            infoflag: false
        })
    }
}



/**
 * @description: 取消动画帧
 * @return {*}
 */
function stopAnimate() {
    if (canvas && requestId) {
        canvas.cancelAnimationFrame(requestId);
    }
}

/**
 * @description: 销毁变量
 * @return {*}
 */
function dispose() {
    if (renderer) {
        renderer.dispose()
        renderer = null
    }
    if (scene) {
        scene.dispose()
        scene = null
    }
    if (camera) {
        camera = null
    }
    if (mainModel) {
        mainModel = null
    }

    if (mixer) {
        mixer.uncacheRoot(mixer.getRoot())
        mixer = null
    }
    if (clock) {
        clock = null
    }
    if (THREE) {
        THREE = null
    }

    if (canvas) {
        canvas = null
    }


    if (loadingProcess) {
        loadingProcess = 0
    }
    if (interactableMeshes) {
        interactableMeshes = []
    }
    if (cityGroup) {
        cityGroup = null
    }
    if (innerAudioContext) {
        innerAudioContext.stop() // 停止
        innerAudioContext.destroy() // 销毁
        innerAudioContext = null
    }

}



/**
 * @description: 以下三个是触摸事件
 * @param {*} event
 * @return {*}
 */
function onTouchstart(event) {
    if (controls) controls.onTouchStart(event)
}
function onTouchend(event) {
    if (controls) controls.onTouchEnd(event)
}

function onTouchmove(event) {
    if (controls) controls.onTouchMove(event)

}



module.exports = {
    initThree,
    handleMouseClick,
    onTouchstart,
    onTouchmove,
    onTouchend,
    stopAnimate,
    dispose
}