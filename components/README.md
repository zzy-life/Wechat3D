# 组件介绍


## 滑动卡片

**components文件夹下的card组件是cardSwipe组件的[抽象节点](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/generics.html)，放置卡片内容和自定义样式，需要调用者自己实现。而cardSwipe组件为卡片功能的具体实现**

### 功能介绍

##### 亮点：

- 动态新增
- 卡片的wxml节点数不受卡片列表的大小影响，只等于卡片展示数，如果每次只展示三张卡片，那么卡片所代表的节点数只有三个
- 支持调节各种属性（滑动速度，旋转角度，卡片展示数...等等）
- 支持点击切换

### 优化

##### 由于组件支持动态的删除以及替换，这使得我们可以以很小的卡片列表来展示超多（or 无限）的卡片

场景1：实现一个超多的卡片展示（比如1000张）

原本实现思路：利用wx:if,只渲染当前展示的card和后面两张card,然后监听cardChange回调函数，再切换到比如最后三张的时候请求下一页数据，直接push到渲染的数组中，因为有wx:if的控制，虽然数据增多，但渲染的节点还是只有三个。具体的性能没有测试，但在手机测试时候，直观感觉没有多大的性能问题。

新的实现思路：首先要实现循环展示的逻辑，以分页的形式每次从后台获取数据，先获取第一页cardsData和第二页nextPageData的数据。每切换一张图片就从nextPageData拿到相同位置的数据替换cardsData的数据，当切换到第一页的最后showNum（一次性展示几个card）条数据时候，会进入到循环从头重新开始渲染cardsData的数据，这个时候cardsData里的数据实际是下一页nextPageData的数据，同时再请求第三页的数据赋值给nextPageData，循环往复。