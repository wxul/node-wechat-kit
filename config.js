const {
    resolve
} = require('path');

const admins = require('./admins');

module.exports = {
    path: resolve(__dirname, 'files'),
    admins
}