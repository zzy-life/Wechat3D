/*
 * @Author: yeyao 969658798@qq.com
 * @Date: 2023-03-07 22:43:20
 * @LastEditors: 时不待我 790002517@qq.com
 * @LastEditTime: 2023-03-24 17:05:19
 */
const API = require('../../utils/request.js')

Page({
  data: {
    cardList: [],
    nextPageData: [],

    infoflag: true,
  },
  onShareAppMessage: function () {
    // return custom share data when user share.
  },
  cardChange(e) {
    const { direction, index } = e.detail;
    if (direction == 'left') {
    
    }
    if (index == 3) {
      API.animalListRandom().then(res => {
        this.setData({
          nextPageData: res.data
        })
      })
    }

  },
  infoOK() {
    this.setData({
      infoflag: false
    })
  },
  onLoad() {
    API.animalListRandom().then(res => {
      this.setData({
        cardList: res.data
      })
    })

    API.animalListRandom().then(res => {
      this.setData({
        nextPageData: res.data
      })
    })

  }
})