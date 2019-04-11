const axios = require('axios');
const { baidu } = require('../keys');

module.exports = async function(count = 10) {
    let r = await getHot();

    if (r.data.error_code == 0 && r.data.reason == 'success') {
        let data = r.data.data.slice(0, count);
        return itemsFormat(data);
    } else {
        return false;
    }
};

async function getHot() {
    return axios.get(baidu.prefix, {
        params: {
            appid: baidu.appid
        }
    });
}

function itemsFormat(items) {
    return (
        '百度热搜榜 \r\n' +
        items
            .map(t => {
                let key = t.keyword;
                let l = `https://www.baidu.com/s?wd=${encodeURIComponent(key)}`;
                // console.log(t.link, typeof t.link);
                return `${key}\r\n${l}`;
            })
            .join('\r\n')
    );
}
