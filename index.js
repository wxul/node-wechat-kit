const {
    IoClient,
    Wechaty,
    config,
    log,
} = require('wechaty');
const {
    PuppetWechat4u
} = require('wechaty-puppet-wechat4u');
// const {
//     PuppetWechat4u
// } = require('../wechaty-puppet-wechat4u/dist/src/index');
// const {
//     PuppetIoscat
// } = require('wechaty-puppet-ioscat');
// import onMessage from './listeners/onMessage';
// import onScan from './listeners/onScan';
// import onLogin from './listeners/onLogin';
// import onLogout from './listeners/onLogout';

// Object.prototype.filter = function () {
//     return [].filter.call(Object.values(this), ...arguments);
// }

// Object.prototype.isRoomContact = function () {
//     return this.UserName ? /^@@|@chatroom$/.test(this.UserName) : false;
// }

const bot = Wechaty.instance({
    profile: "default",
    puppet: new PuppetWechat4u()
})

global.bot = bot;

bot
    .on('scan', './listeners/onScan')
    .on('login', './listeners/onLogin')
    .on('message', './listeners/onMessage')
    .on('logout', './listeners/onLogout')
    .on('error', './listeners/onError')
    .start()
    .catch(async function (e) {
        log(`Init() fail: ${e}.`);
        await bot.stop();
        process.exit(1)
    })