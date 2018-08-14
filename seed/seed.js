require('../configs/config');
const businesses = require('./businesses');
const Business = require('../models/business');
const Log = require('log');
const log = new Log('info');

/**
 * Seeds db with businesses
 * @return {Promise<boolean>}
 * @private
 */
async function _main() {
    log.info('Starting to seed mongo db...');

    await new Promise(async (resolve, reject) => {
        let count = 0;
        await businesses.forEach(async (businessInfo) => {
            const business = new Business(businessInfo);
            await business.save();
            count ++;
            log.info(`Uploaded ${count}`);
            if (count === businesses.length) {
                resolve(true);
            }
        });
    });

    log.info('Done seeding db.');
    return true;
}

_main().then(() => {
    process.exit(0);
}, (err) => {
    log.error(err);
});
