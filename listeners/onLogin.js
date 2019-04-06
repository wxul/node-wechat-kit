const {
    log
} = require('wechaty');
const schedule = require('node-schedule');
const rss = require('../service/zhihurss');

async function onLogin(user) {
    log.info(`${user} login`);

    let rooms = await bot.Room.findAll('');
    console.log(rooms);

    schedule.scheduleJob('* 10 * * *', async function () {
        try {
            let l = await rss();
            for (var k in rooms) {
                await rooms[k].say(l);
            }
        } catch (error) {

        }
    });
}

module.exports = onLogin;