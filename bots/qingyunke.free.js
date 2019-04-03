const axios = require('axios');

module.exports = async function (text) {
    try {
        var result = await axios.get(`http://api.qingyunke.com/api.php?key=free&appid=0&msg=${encodeURIComponent(text)}`)
        return result.data.result;
    } catch (error) {
        console.log(error);
        return '';
    }
}