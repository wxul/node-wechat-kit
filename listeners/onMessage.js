const {
    Message,
    log,
} = require('wechaty');
const path = require('path');
const config = require('../config');
const moment = require('moment');

let senders = [];
let admins = config.admins;

// const talk = require('../bots/apiai.free');
const talk = require('../bots/wx');

async function onMessage(message) {
    try {
        log.info('Bot', '(message) %s', message.toString());

        // 初始化发送人
        if (!senders || senders.length == 0) {
            for (var k in admins) {
                let find = await bot.Contact.find({
                    name: admins[k]
                });
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

        log.info('Message', 'from: %s, %s; to: %s, %s', contact.id, contact.name(), to.id, to.name());

        // 群聊
        if (room) {
            let topic = await room.topic();
            log.info('Room', 'info: %s, %s', room.id, topic);
        }

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
                if (reg.test(text)) {
                    text = text.replace(reg, '');

                    let ssid = room ? room.id : contact.id;

                    var result = await talk(text, ssid);

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
                        await say(text);
                    }
                }
                break;
            case Message.Type.Video:
                await saveMediaFile(message);
                console.log('video:');
                break;
            case Message.Type.Image:
                await saveMediaFile(message);
                console.log('Image:');
                break;
            case Message.Type.Audio:
                await saveMediaFile(message);
                console.log('Audio:');
                break;
            case Message.Type.Money:
                console.log('Money:', message.text());
                break;
            case Message.Type.Url:
                console.log('Url:', message.text());
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
    } catch (error) {

    }
}

async function saveMediaFile(message) {
    try {
        const file = await message.toFileBox();
        const contact = message.from();
        const room = message.room();
        const date = message.date();
        let name = file.name;
        name = contact.name() + '_' + name;
        if (room) {
            let topic = room.topic();
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

module.exports = onMessage;