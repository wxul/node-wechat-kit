const {
    resolve
} = require('path');
const fs = require('fs');

const filepath = resolve(__dirname, 'files');

if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath);
}

const admins = require('./admins');

module.exports = {
    path: filepath,
    admins
}