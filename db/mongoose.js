const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri, {useNewUrlParser: true});

module.exports = mongoose;
