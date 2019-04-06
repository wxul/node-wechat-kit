const {
    log
} = require('wechaty');

async function onError(err) {
    log.error('Error', err.message);
}

module.exports = onError;