const mongoose = require('../db/mongoose');

const BusinessSchema = new mongoose.Schema({
    alumName: {
        type: String,
    },
    alumTitle: {
        type: String,
    },
    alumClass: {
        type: String,
    },
    alumDegree: {
        type: String,
    },
    alumField: {
        type: String,
    },
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    url: {
        type: String,
    },
    locations: [{
        name: {
            type: String,
        },
        phone: {
            type: String,
        },
        address: {
            street: {
                type: String,
            },
            suite: {
                type: String,
            },
            city: {
                type: String,
            },
            state: {
                type: String,
            },
            zip: {
                type: String,
            },
        },
        coordinates: [],
    }],
});

const Business = mongoose.model('Business', BusinessSchema);

module.exports = Business;
