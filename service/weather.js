const { heweather } = require('../keys');
const axios = require('axios');

const instance = axios.create({
    baseURL: heweather.prefix,
    timeout: 2000,
    headers: { 'content-type': 'application/json' }
});

module.exports = async function (params) {
    try {
        let result;
        // 实时气候
        if (!params.date) {
            result = await getNow(params);

            let wdata = result.weather.data.HeWeather6[0];
            let adata = result.air.data.HeWeather6[0];
            if (wdata.status != 'ok' || adata.status != 'ok') return false;
            let w = wdata.now;
            let a = adata.air_now_city;
            return `${wdata.basic.admin_area}/${wdata.basic.location}实时温度${w.tmp}℃, 体感温度${w.fl}℃, ${w.cond_txt}, ${w.wind_dir}, 湿度${w.hum}%, 空气质量:${a.qlty}, 主要污染物:${a.main}, PM2.5:${a.pm25}`;
        }

        // 预报
        let forecast = await getForecast(params);
        let fdata = forecast.data.HeWeather6[0];
        if (fdata.status != 'ok') return false;
        let flist = fdata.daily_forecast;

        let find = flist.find(f => isSameDate(params.date, f.date));
        if (!find) return '没有那天的天气情况';

        return `${fdata.basic.admin_area}/${fdata.basic.location}于${find.date}的温度${find.tmp_min}℃-${find.tmp_max}℃, 白天${find.cond_txt_d}, 晚上${find.cond_txt_n}, 日出:${find.sr}, 日落:${find.ss}, 相对湿度:${find.hum}%`;
    } catch (error) {
        console.log('get heweather error', error);
        return false;
    }

}

module.exports.valid = function (params) {
    return ['天气', '温度', '湿度', '空气'].indexOf(params.weather) >= 0 && params['geo-city'];
}

async function getForecast(params) {
    return await instance.get('/weather/forecast', {
        params: {
            location: params['geo-city'],
            key: heweather.key
        }
    })
}

async function getNow(params) {
    return {
        weather: await getWeatherNow(params),
        air: await getAirNow(params)
    }
}

async function getWeatherNow(params) {
    return await instance.get('/weather/now', {
        params: {
            location: params['geo-city'],
            key: heweather.key
        }
    })
}

async function getAirNow(params) {
    return await instance.get('/air/now', {
        params: {
            location: params['geo-city'],
            key: heweather.key
        }
    })
}

function isSameDate(str1, str2) {
    var d1 = new Date(str1);
    var d2 = new Date(str2);
    return d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate();
}