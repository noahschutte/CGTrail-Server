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
        res.status(204).send();
    } else {
        next();
    }
}

app.post('/users/login', async (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);

    try {
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post('/users', async (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.delete('/users/logout', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.get('/businesses', async (req, res) => {
    try {
        const businesses = await Business.find();
        res.status(200).json(businesses);
    } catch (error) {
        log.error(`Failed to get /businesses with error: ${error.message}`);
        res.status(400).json({errorMessage: error.message});
    }
});

app.get('/businesses/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const business = await Business.findById(_id);
        if (!business) {
            log.error(`No business found with _id: ${_id}`);
            return res.status(404).json({});
        }
        return res.status(200).json(business);
    } catch (e) {
        log.error(`Failed to get business.id: ${_id}, ${e.message}`);
        res.status(500).json({errorMessage: e.message});
    }
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
    try {
        const business = new Business(body);
        const result = await business.save();
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.put('/businesses/:id', authenticate, async (req, res) => {
    const _id = req.params.id;
    if (!ObjectId.isValid(_id)) {
        return res.status(404).send();
    }
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
    try {
        const business = await Business.findOneAndUpdate(
            {_id},
            {$set: body},
            {new: true}
        );
        res.status(200).send(business);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.delete('/businesses/:id', authenticate, async (req, res) => {
    const id = req.params.id;
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
