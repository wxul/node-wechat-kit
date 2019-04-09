const { Message, log, Contact } = require('wechaty');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const moment = require('moment');
const Eventemitter3 = require('eventemitter3');
const weatherServ = require('../service/weather');
const rss = require('../service/zhihurss');
const { FileBox } = require('file-box');

let event = new Eventemitter3();

let senders = [];
let admins = config.admins;

let watchList = [];

event.on('remove-watch', message => {
    console.log('remove-watch-begin', watchList.length);
    clearTimeout(message.timer);
    message.timer = null;
    message.message = null;
    let index = watchList.indexOf(message);
    if (index >= 0) {
        watchList.splice(index, 1);
    }

    console.log('remove-watch-end', watchList.length);
});

event.on('recall', async opt => {
    try {
        let message = opt.msg;
        let name = opt.name;
        console.log('recall', message.toString());

        // const contact = message.from();
        const room = message.room();
        const type = message.type();

        // if (!room) return;
        let topic = room ? await room.topic() : '单聊';
        switch (type) {
            case Message.Type.Text:
                say(`[${name}]于[${topic}]中撤回了一条消息: ${message.text()}`);
                break;
            case Message.Type.Video:
            case Message.Type.Audio:
            case Message.Type.Image:
                let file = await saveMediaFile2(message);
                if (file) {
                    const fb = FileBox.fromFile(file);
                    await say(`[${name}]于[${topic}]中撤回了一条媒体消息`);
                    await say(fb);
                }
                break;
            default:
                break;
        }
    } catch (error) {
        console.log('recall error', error);
    }
});

const apiai = require('../bots/apiai.free');
const talk = require('../bots/wx');

async function onMessage(message) {
    try {
        log.info('Bot', '(message) %s %s', message.id, message.toString());

        // 初始化发送人
        if (!senders || senders.length == 0) {
            for (var k in admins) {
                let find = await bot.Contact.find({
                    name: admins[k]
                });
                // console.log('find user:', find);
                find && senders.push(find);
            }
        }

        // 自己的消息不处理
        if (message.self()) {
            return;
        }

        const contact = message.from();
        const to = message.to();
        const room = message.room();
        const type = message.type();

        log.info('Message', 'from: %s, %s, %s;', contact.id, contact.name(), contact);
        // 消息推送
        if ('newsapp' == contact.id) return;

        // 群聊
        if (room) {
            let topic = await room.topic();
            log.info('Room', 'info: %s, %s, %s', room.id, topic, contact.name());
        }

        let isAdmin = admins.indexOf(contact.name()) >= 0;

        // rss test
        // if (isAdmin && /rss/.test(message.text())) {
        //     console.log('rss test');
        //     let r = await rss();
        //     // console.log('gett', r);
        // }

        // 是文件就保存
        // if (message instanceof MediaMessage) {
        //     await saveMediaFile(message);
        // }

        // @自己的消息
        // if (message.mentionSelf()) {
        //     console.log('mentionSelf');
        // }

        switch (type) {
            // 文本
            case Message.Type.Text:
                // await say('666');
                let text = message.text();
                let reg = /^\@女仆\s+/;
                console.log('文本:', message.text());

                let isxml = /<.+>.+<\/.+>/.test(text);
                // xml的未格式化消息
                if (isxml) {
                    let msg = text.replace(/\s/g, '');
                    let isrevoke = /revokemsg/.test(msg);
                    // 撤回的消息
                    if (isrevoke) {
                        msg = msg.match(/<msgid>(.+?)<\/msgid><replacemsg>(.+?)<\/replacemsg>/);
                        if (msg) {
                            console.log('isrevoke', msg[1], msg[2]);
                            let name = msg[2].match(/\"(.+)+\"/);
                            let m = bot.Message.load(msg[1]);
                            m.ready().then(() => {
                                event.emit('recall', { msg: m, name: name });
                            });
                            return;
                        }
                    } else {
                        return;
                    }
                }

                // 群聊里不是@自己的跳过
                if (room && !reg.test(text)) return;
                // 单聊的不是管理员跳过
                // if (!room && !isAdmin) return;

                if (room) text = text.replace(reg, '');

                if (text == '知乎') {
                    let r = await rss();
                    if (room) {
                        await room.say(r);
                    } else {
                        await contact.say(r);
                    }
                    // console.log(r);
                    return;
                }

                let ssid = room ? room.id : contact.id;

                // 先从google拿语义
                var apiresult = await apiai(text, ssid);
                var result = '';

                if (!apiresult) {
                    // 没有语义走腾讯聊天
                    result = await talk(text);
                } else {
                    // 天气语义
                    if (weatherServ.valid(apiresult)) result = await weatherServ(apiresult);
                    else result = JSON.stringify(apiresult);
                }

                if (result) {
                    text = result;
                    console.log('result', text);
                } else {
                    text = '';
                    return;
                }
                if (room) {
                    await room.say(text);
                } else {
                    await contact.say(text);
                }
                break;
            case Message.Type.Video:
                // if (!isAdmin) {
                //     saveMediaFile2(message);
                // }
                console.log('video:');
                break;
            case Message.Type.Image:
                // if (!isAdmin) {
                //     saveMediaFile2(message);
                // }
                console.log('Image:');
                break;
            case Message.Type.Audio:
                // if (!isAdmin) {
                //     saveMediaFile2(message);
                // }
                console.log('Audio:');
                break;
            case Message.Type.Money:
                console.log('Money:', message.text());
                break;
            case Message.Type.Url:
                console.log('Url:', message.text());
                break;
            case Message.Type.Recalled:
                console.log('Recalled', message);
                break;
            default:
                console.log('default type');
                break;
        }
    } catch (error) {
        console.log(error);
    }
}

async function say(p) {
    try {
        for (var k in senders) {
            await senders[k].say(p);
        }
    } catch (error) {}
}

// for default puppet
async function saveMediaFile(message) {
    try {
        const file = await message.toFileBox();
        console.log('filebox: ', file, file.toFile);
        const contact = message.from();
        const room = message.room();
        const date = message.date();
        let name = file.name;
        name = contact.name() + '_' + name;
        if (room) {
            let topic = await room.topic();
            name = topic + '_' + name;
        }
        name = moment(date).format('YYYY_MM_DD') + '_' + name;
        log.info('IMAGE local filename: ' + name);
        let filepath = path.resolve(config.path, name);
        file.toFile(filepath);
    } catch (error) {
        console.log(error);
    }
}

// for wechaty-puppet-wechat4u
async function saveMediaFile2(message) {
    const file = await message.toFileBox();
    let name = file.name;
    console.log('IMAGE local filename: ' + name);

    const contact = message.from();
    const room = message.room();
    const date = message.date();
    // let name = file.name;
    name = contact.name() + '_' + name;
    if (room) {
        let topic = await room.topic();
        name = topic + '_' + name;
    }
    name = moment(date).format('YYYY_MM_DD') + '_' + name;

    process.stdout.write('saving...');
    try {
        var filepath = path.resolve(config.path, name);
        // const netStream = await message.readyStream()
        // netStream
        //     .pipe(fileStream)
        //     .on('close', _ => {
        //         const stat = fs.statSync(filename)
        //         console.log(', saved as ', filename, ' size: ', stat.size)
        //     })
        let result = await saveFile(filepath, file.stream);
        console.log('save file result', filepath);
        return result ? filepath : false;
    } catch (e) {
        console.error('stream error:', e);
        return false;
    }
}

var saveFile = function(filePath, fileData) {
    return new Promise((resolve, reject) => {
        // 块方式写入文件
        const wstream = fs.createWriteStream(filePath);

        wstream.on('open', () => {
            const blockSize = 128;
            const nbBlocks = Math.ceil(fileData.length / blockSize);
            for (let i = 0; i < nbBlocks; i += 1) {
                const currentBlock = fileData.slice(blockSize * i, Math.min(blockSize * (i + 1), fileData.length));
                wstream.write(currentBlock);
            }

            wstream.end();
        });
        wstream.on('error', err => {
            reject(err);
        });
        wstream.on('finish', () => {
            resolve(true);
        });
    });
};

module.exports = onMessage;
