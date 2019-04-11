const axios = require('axios');
const { parseString } = require('xml2js');
const { people } = require('../keys');

module.exports = async function(type = '国内') {
    let tType = type in people.types ? type : '国内';
    let t = people.types[tType];
    let r = await getRss(t);

    let xml = await parse(r.data);

    let items = xml.rss.channel[0].item;
    items = items.slice(0, 10).map(item => {
        return {
            title: item.title,
            link: item.link
        };
    });

    return itemsFormat(items, tType);
};

async function getRss(type) {
    return axios.get(people.prefix.replace('{type}', type));
}

function parse(xmlstr) {
    return new Promise((resolve, reject) => {
        parseString(xmlstr, function(err, result) {
            if (err) {
                return reject(err);
            }
            // console.dir(result);
            return resolve(result);
        });
    });
}

function itemsFormat(items, type) {
    return (
        '人民网 ' +
        type +
        ' \r\n' +
        items
            .map(t => {
                // let l = t.link.split('?')[0];
                // console.log(t.link, typeof t.link);
                return `${t.title}\r\n${t.link}`;
            })
            .join('\r\n')
    );
}
