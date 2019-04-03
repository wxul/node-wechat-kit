const {
    log
} = require('wechaty');

async function onLogin(user) {
    log.info(`${user} login`);
}

module.exports = onLogin;