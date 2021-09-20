const crypto = require('crypto');

const randomHsh = () => {
    return crypto.createHash('md5')
        .update((new Date().valueOf().toString()) + (Math.random().toString()))
        .digest('hex');
}

module.exports = randomHsh;
