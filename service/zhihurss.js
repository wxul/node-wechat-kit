const axios = require('axios');
const { zhihurss } = require('../keys');
const { parseString } = require('xml2js');
const parser = require('../lib/xml2json');

// var feedparser = new FeedParser([options]);

module.exports = async function (count = 10) {
    let r = await getRss();

    // console.log('rss', typeof r.data, r.data.length);
    let xml = await parse(r.data);
    let items = xml.rss.channel[0].item;
    items = items.map(t => {
        return {
            title: t.title,
            link: t.link[0],
            pubDate: new Date(t.pubDate).toLocaleString()
        }
    }).slice(0, count);
    // console.log('xml', items);
    // title, link, description, item
    return itemsFormat(items);
}

async function getRss() {
    return axios.get(zhihurss.prefix);
}

function parse(xmlstr) {
    return new Promise((resolve, reject) => {
        parseString(xmlstr, function (err, result) {
            if (err) {
                return reject(err);
            }
            // console.dir(result);
            return resolve(result);
        });
    });
}

function itemsFormat(items) {
    return '知乎RSS \r\n' + items.map(t => {
        let l = t.link.split('?')[0];
        // console.log(t.link, typeof t.link);
        return `${t.title}\r\n${l}`;
    }).join('\r\n');
}
