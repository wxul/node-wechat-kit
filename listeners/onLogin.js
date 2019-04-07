const {
    log
} = require('wechaty');
const schedule = require('node-schedule');
const rss = require('../service/zhihurss');
const admins = require('../admins');

async function onLogin(user) {
    log.info(`${user} login`);

    schedule.scheduleJob('0 0 10 * * *', async function () {
        try {
            let senders = [];
            // let senders = await bot.Room.findAll('');
            for (var k in admins) {
                let find = await bot.Contact.find({
                    name: admins[k]
                });
                // console.log('find user:', find);
                find && senders.push(find);
            }
            let l = await rss();
            for (var k in senders) {
                await senders[k].say(l);
            }

        } catch (error) {

        }
    });
}

module.exports = onLogin;