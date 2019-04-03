const {
    log
} = require('wechaty');

async function onLogout(user) {
    log.info('Bot', `${user.name()} logouted`);
}

module.exports = onLogout;