async function onScan(url, code) {
    let loginUrl = url.replace('qrcode', 'l');
    console.log(code, url);

    if (code === 0) {
        require('qrcode-terminal').generate(loginUrl)
    }
}

module.exports = onScan;