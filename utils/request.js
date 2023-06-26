/*
 * @Author: 时不待我 790002517@qq.com
 * @Date: 2023-03-11 18:13:46
 * @LastEditors: 时不待我 790002517@qq.com
 * @LastEditTime: 2023-03-24 17:00:05
 */
const API = require('api.js')

/**
 * @description: 查询动物列表
 * @param {*} data
 * @return {*}
 */

export function animalList(data) {
    return API.request('/system/animal/list', data, API.method.GET)
}

/**
 * @description: 随机获取5条动物信息
 * @param {*} data
 * @return {*}
 */

 export function animalListRandom() {
    return API.request('/system/animal/random', API.method.GET)
}