require('./configs/config');

const _ = require('lodash');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const ObjectId = require('mongoose').Types.ObjectId;
const Log = require('log');

const User = require('./models/user');
const Business = require('./models/business');
const authenticate = require('./middleware/authenticate');

const port = process.env.PORT || 8000;

const log = new Log('info');
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(ignoreFavicon);
app.use(cors({
    'allowedHeaders': [
        'x-auth',
        'Content-Type',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
    ],
    'exposedHeaders': ['x-auth'],
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false,
}));

/**
 * Ignore Favicon requests
 * @param {Array} req
 * @param {String} res
 * @param {String} next
 */
function ignoreFavicon(req, res, next) {
    if (req.originalUrl === '/favicon.ico') {
        res.status(204).json();
    } else {
        next();
    }
}

app.get('/businesses', async (req, res) => {
    try {
        const businesses = await Business.find();
        res.status(200).json(businesses);
    } catch (e) {
        log.error(`Failed to get /businesses with error: ${e.message}`);
        res.status(400).json({errorMessage: e.message});
    }
});

app.get('/businesses/:id', async (req, res) => {
    const businessId = req.params.id;
    if (typeof businessId != 'string') {
        const errorMessage = `Bad request. Business _id must be a string.`;
        log.error(errorMessage);
        return res.status(400).json({errorMessage});
    }
    try {
        const business = await Business.findById(businessId);
        if (!business) {
            log.error(`No business found with _id: ${businessId}`);
            return res.status(404).json({});
        }
        return res.status(200).json(business);
    } catch (e) {
        log.error(`Failed to get business.id: ${businessId}, ${e.message}`);
        return res.status(500).json({errorMessage: e.message});
    }
});

app.post('/users', async (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    let user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.post('/users/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);

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
    const body = _.pick(req.body, [
        'alumName',
        'alumTitle',
        'alumClass',
        'alumDegree',
        'alumField',
        'name',
        'description',
        'url',
        'locations',
    ]);
    const business = new Business(body);
    business.save().then((result) => {
        res.status(200).send(result);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.put('/businesses/:id', authenticate, async (req, res) => {

});

app.delete('/businesses/:id', authenticate, async (req, res) => {
    let id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }
    const _id = await Business.findById(id).remove();
    if (!_id) {
        return res.status(404).send();
    }
    res.send({_id});
});

app.listen(port, async () => {
    log.info(`Server is running on port: ${port}`);
});

// module.exports = app;
