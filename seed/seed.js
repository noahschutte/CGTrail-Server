require('../configs/config');
const businesses = require('./businesses');
const Business = require('../models/business');

/**
 * Seeds db with businesses
 * @return {Promise<boolean>}
 * @private
 */
async function _main() {
    console.log('Starting to seed mongo db...');

    await new Promise(async (resolve, reject) => {
        let count = 0;
        await businesses.forEach(async (businessInfo) => {
            const business = new Business(businessInfo);
            await business.save();
            count ++;
            console.log(`Uploaded ${count}`);
            if (count === businesses.length) {
                resolve(true);
            }
        });
    });

    console.log('Done seeding db.');
    return true;
}

_main().then(() => {
    process.exit(0);
}, (err) => {
    console.error(err);
});
