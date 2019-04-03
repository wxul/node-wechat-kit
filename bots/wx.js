const {
    wx
} = require('../keys');
const axios = require('axios');
const md5 = require('md5');
const querystring = require('querystring');

const session = ~~(Math.random() * 10000) + '';
test();
module.exports = async function (text) {
    try {

        let params = {
            app_id: wx.appid,
            time_stamp: ~~(Date.now() / 1000),
            nonce_str: ~~(Math.random() * 1000000) + '',
            session: session,
            question: text
        }
        let sign = getSign(params);
        console.log(params, sign);
        let data = {
            sign,
            ...params
        };
        console.log(data);
        let result = await axios.post(wx.prefix, querystring.stringify(data), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        console.log(result.data);

        return result.data.data.answer;
    } catch (error) {
        console.log(error);
        return '';
    }
}

function getSign(params, key) {
    let keys = Object.keys(params);
    keys = keys.sort();
    let sign = '';
    console.log(123, keys);
    keys.forEach(k => {
        if (params[k]) {
            sign += `${k}=${encodeURI(params[k])}&`;
        }
    })
    sign += `app_key=${key || wx.appkey}`;
    console.log(sign);

    return md5(sign).toUpperCase();
}

// test 
function test() {
    let testsign = getSign({
        'app_id': '10000',
        'time_stamp': '1493449657',
        'nonce_str': '20e3408a79',
        'key1': '腾讯AI开放平台',
        'key2': '示例仅供参考',
    }, 'a95eceb1ac8c24ee28b70f7dbba912bf');

    console.log(testsign, 'BE918C28827E0783D1E5F8E6D7C37A61');
}