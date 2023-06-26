/*
 * @Author: 时不待我 790002517@qq.com
 * @Date: 2023-02-17 18:12:16
 * @LastEditors: 时不待我 790002517@qq.com
 * @LastEditTime: 2023-03-23 10:36:02
 */

/**
 * @description: 方法类
 * @return {*}
 */
const Utlis = {
    
    /**
     * @description: 判断版本号, v1>v2 return 1, v1<v2 return -1, v1=v2 return 0
     * @param {*} v1当前版本
     * @param {*} v2需要判断的版本
     * @return {*} 
     */
    compareVersion: (v1, v2) => {
        v1 = v1.split('.')
        v2 = v2.split('.')
        const len = Math.max(v1.length, v2.length)

        while (v1.length < len) {
            v1.push('0')
        }
        while (v2.length < len) {
            v2.push('0')
        }

        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i])
            const num2 = parseInt(v2[i])

            if (num1 > num2) {
                return 1
            } else if (num1 < num2) {
                return -1
            }
        }

        return 0

    },

    /**
     * @description: 判断字符串是否为json
     * @param {*} str
     * @return {*} false 不是 or true 是
     */
    checkIsJSON: function (str) {
        if (typeof str == 'string') {
          try {
            var obj = JSON.parse(str);
            if (typeof obj == 'object' && obj) {
              return true;
            } else {
              return false;
            }
          } catch (e) {
            return false;
          }
        }
        return false;
    }
    


}
export default Utlis;