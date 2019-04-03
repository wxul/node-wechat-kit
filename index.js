const {
    IoClient,
    Wechaty,
    config,
    log,
} = require('wechaty');
// import onMessage from './listeners/onMessage';
// import onScan from './listeners/onScan';
// import onLogin from './listeners/onLogin';
// import onLogout from './listeners/onLogout';

const bot = Wechaty.instance({
    profile: "default"
})

global.bot = bot;

bot
    .on('scan', './listeners/onScan')
    .on('login', './listeners/onLogin')
    .on('message', './listeners/onMessage')
    .on('logout', './listeners/onLogout')
    .start()
    .catch(async function (e) {
        log(`Init() fail: ${e}.`);
        await bot.stop();
        process.exit(1)
    })