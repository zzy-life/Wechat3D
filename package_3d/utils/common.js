/*
 * @Author: 时不待我 790002517@qq.com
 * @Date: 2023-02-17 18:12:16
 * @LastEditors: 时不待我 790002517@qq.com
 * @LastEditTime: 2023-02-22 14:10:58
 */
// 创建文字
const Common = {
    //(真机有问题)
    makeTextSprite: (text, color, parameters, THREE) => {
        if (parameters === undefined) parameters = {};
        var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
        var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 32;
        var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
        var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };
        // 创建离屏 2D canvas 实例
        const canvas = wx.createOffscreenCanvas({ type: '2d' })
        var context = canvas.getContext('2d');
        context.font = fontsize + "px " + fontface;
        var metrics = context.measureText(text);
        var textWidth = metrics.width;
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";
        context.lineWidth = borderThickness;
        context.fillStyle = color ? color : "#ffffff";
        context.fillText(text, borderThickness, fontsize + borderThickness);
        context.font = 48 + "px " + fontface;
        context.width = textWidth;
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        var sprite = new THREE.Sprite(spriteMaterial);
        return sprite;
    },

    // 创建圆形文字(真机有问题)
    makeCycleTextSprite: (text, THREE, color = 'black', borderColor = 'white', textColor = 'white', W = 100, H = 100, borderWidth = 6) => {
        // 创建离屏 2D canvas 实例
        const canvas = wx.createOffscreenCanvas({ type: '2d', width: W, height: H })

        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc((W + borderWidth) / 2, (H + borderWidth) / 2, 40, 0, Math.PI * 2, true);
        ctx.closePath();
        // 填充背景颜色
        ctx.fillStyle = color;
        ctx.fill();
        // 填充边框颜色
        ctx.lineWidth = borderWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = borderColor;
        //绘画
        ctx.stroke();
        // 填充文字颜色
        ctx.font = "64px Arial";
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        var metrics = ctx.measureText(text);
        ctx.fillText(text, (W + borderWidth) / 2, (H + borderWidth * 2) / 2 + metrics.fontBoundingBoxDescent + metrics.actualBoundingBoxDescent * 4);
        var texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        var spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: .8,
        });
        var sprite = new THREE.Sprite(spriteMaterial);
        return sprite;
    },
    // 使用贴图创建圆形文字
    makeCycleLmageTextSprite: (interactablePoints, THREE) => {
        let sprites = []
        for (let index = 0; index < interactablePoints.length; index++) {
            const element = interactablePoints[index];
            const sprite = new THREE.Sprite(
                new THREE.SpriteMaterial({
                    map: new THREE.TextureLoader().load(
                        element.lmageurl
                    ), //设置精灵纹理贴图
                    transparent: true, //开启透明(纹理图片png有透明信息),
                    opacity: .8,
                })
            );
            sprite.name = element.value;
            sprite.scale.set(0.6, 0.6, 0.6);
            sprite.position.set(element.location.x, element.location.y, element.location.z);
            sprites.push(sprite);
        }

        return sprites;
    },

}
export default Common;