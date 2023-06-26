/*
 * @Author: 时不待我 790002517@qq.com
 * @Date: 2023-03-02 08:14:41
 * @LastEditors: 时不待我 790002517@qq.com
 * @LastEditTime: 2023-03-20 12:02:57
 */

const API_BASE_URL = 'https://www.s.top';
const method = {
    GET: 'get',
    POST: 'post'
}
//云托管配置
const env = ''
const headerSERVICE = 'study1'
/**
 * @description: 请求封装
 * @param {*} url 请求地址
 * @param {*} data 请求参数
 * @param {*} method 请求方式
 * @param {*} type 1云托管，2服务器后端，默认为2
 * @return {*}
 */
const request = (url, data, method, type = 2) => {
    // get请求映射参数
    let _url = url;
    if (method === 'get' && data) {
        let paramsArray = [];
        //url拼接参数
        Object.keys(data).forEach(key => paramsArray.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key])))
        if (url.search(/\?/) === -1) {
            _url += '?' + paramsArray.join('&')
        } else {
            _url += '&' + paramsArray.join('&')
         
        }
    } else {
       
        _url = url;
    }
    //云托管
    if (type == 1) {
        return new Promise((resolve, reject) => {
            wx.cloud.callContainer({
                config: {
                    env: env, // 微信云托管的环境ID
                },
                header: {
                    'X-WX-SERVICE': headerSERVICE, // xxx中填入服务名称（微信云托管 - 服务管理 - 服务列表 - 服务名称）
                },
                path: _url,
                method: method,
                data: data
            }).then(res => {
                resolve(res.data)
            }).catch((err) => {
                reject(err)
            });
        });
    }
    //服务器后端
    if (type == 2) {
        return new Promise((resolve, reject) => {
            wx.request({
                url: API_BASE_URL + _url,
                method: method,
                data: data,
                success(request) {
                    resolve(request.data)

                },
                fail(error) {
                    reject(error)
                }
            })
        });
    }

}

module.exports = {
    request,
    method
}