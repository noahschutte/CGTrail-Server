require('dotenv').config()
const _ = require('lodash')
const env = process.env.NODE_ENV || 'development';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const cors = require('cors');

const Log = require('log');
const log = new Log('info');

const { ObjectID } = require('mongodb');
const MongoClient = require('./MongoClient')
let mongoUri
if (env === 'production') {
    mongoUri = process.env.PRODUCTION_MONGO_URI
} else if (env === 'staging') {
    mongoUri = process.env.STAGING_MONGO_URI
} else {
    mongoUri = process.env.LOCAL_MONGO_URI
}
const dbName = 'cgtrail'

let mongoClient = new MongoClient(mongoUri, dbName)
let mongoConnection
const BusinessesRepository = require('./BusinessesRepository')
let businessesRepository

const User = require('./models/user')
var { authenticate } = require('./middleware/authenticate');

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
app.use(cors({
    'allowedHeaders': ['x-auth', 'Content-Type'],
    'exposedHeaders': ['x-auth'],
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}));

app.get('/businesses', async (req, res) => {
    try {
        const businesses = await businessesRepository.findAll()
        res.status(200).json(businesses);
    } catch (e) {
        log.error(`Failed to get /businesses with error: ${e.message}`);
        res.status(400).json({errorMessage: e.message});
    }
});

app.get('/businesses/:id', async (req, res) => {
    const businessId = req.params.id
    if (typeof businessId != "string") {
        const errorMessage = `Bad request. Business _id must be a string.`
        log.error(errorMessage);
        return res.status(400).json({errorMessage});
    }
    try {
        const business = await businessesRepository.findById(businessId)
        if (!business) {
            log.error(`No business found with _id: ${businessId}`);
            return res.status(404).json({});
        }
        return res.status(200).json(business);
    } catch (e) {
        log.error(`Failed to get /business _id: ${businessId} with error: ${e.message}`);
        return res.status(500).json({errorMessage: e.message});
    }
});

app.post('/users', async (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.delete('/users/logout', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.post('/businesses', authenticate, async (req, res) => {
    
})

app.put('/businesses/:id', authenticate, async (req, res) => {

})

app.delete('/businesses/:id', authenticate, async (req, res) => {
    console.log('1')
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    const _id = await businessesRepository.deleteById(id)
    if (!_id) {
        return res.status(404).send();
    }
    res.send({_id});
})

app.listen(port, async () => {
    log.info('App is starting up...')
    mongoConnection = await mongoClient.init()
    businessesRepository = new BusinessesRepository(mongoConnection)
    log.info(`Server is running on port: ${port}`);
});

// module.exports = app;
