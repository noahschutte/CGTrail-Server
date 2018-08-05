const express = require('express');
const app = express();
const cors = require('cors');

const Log = require('log');
const log = new Log('info');

const MongoClient = require('./MongoClient')
const hosts = [{ ip: 'localhost', port: '27017' }]
const replicaSet = ''
const dbName = 'cgtrail'
const mongoClient = new MongoClient(hosts, replicaSet, dbName)
const BusinessesRepository = require('./BusinessesRepository')

const port = process.env.PORT || 8000;

/**
 * Ignore Favicon requests
 * @param {Array} req
 * @param {String} res
 * @param {String} next
 */
function ignoreFavicon(req, res, next) {
    if (req.originalUrl === '/favicon.ico') {
        res.status(204).json({nope: true});
    } else {
        next();
    }
}

app.use(ignoreFavicon);

app.use(cors());

app.get('/businesses', async (req, res) => {
    try {
        const mongoConnection = await mongoClient.init()
        const businessesRepository = new BusinessesRepository(mongoConnection)
        const businesses = await businessesRepository.findAll()
        res.status(200).json(businesses);
    } catch (e) {
        log.error(`Failed get /businesses with error: ${e.message}`);
        res.status(400).json({errorMessage: e.message});
    }
});

app.get('/business/:id', async (req, res) => {
    try {
        const businessId = req.params.id
        const mongoConnection = await mongoClient.init()
        const businessesRepository = new BusinessesRepository(mongoConnection)
        const business = await businessesRepository.findById(businessId)
        res.status(200).json(business);
    } catch (e) {
        log.error(`Failed get /business _id: ${businessId} with error: ${e.message}`);
        res.status(400).json({errorMessage: e.message});
    }
});

app.listen(port, () => {
    log.info(`Server is running on port: ${port}`);
});

module.exports = app;
