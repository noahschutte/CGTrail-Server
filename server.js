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
        log.info(`Successful user login: ${body.email}`);
        res.header('x-auth', token).json(user);
    } catch (error) {
        log.error(`Failed user login: ${body.email}, ${error.message}`);
        res.status(404).send();
    }
});

app.post('/users', async (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        log.info(`Successful user creation: ${body.email}`);
        res.header('x-auth', token).json(user);
    } catch (error) {
        log.error(`Failed user creation: ${body.email}, ${error.message}`);
        res.status(400).json({errorMessage: error.message});
    }
});

app.delete('/users/logout', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token);
        log.info(`Successful user logout: ${req.token}`);
        res.status(200).send();
    } catch (error) {
        log.error(`Failed user logout: ${req.token}, ${error.message}`);
        res.status(400).json({errorMessage: error.message});
    }
});

app.get('/businesses', async (req, res) => {
    try {
        const businesses = await Business.find();
        log.info(`Successful businesses index.`);
        res.status(200).json(businesses);
    } catch (error) {
        log.error(`Failed businesses index, ${error.message}`);
        res.status(400).json({errorMessage: error.message});
    }
});

app.get('/businesses/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const business = await Business.findById(_id);
        if (!business) {
            log.error(`No business found with _id: ${_id}`);
            return res.status(404).send();
        }
        log.info(`Successful business show.`);
        return res.status(200).json(business);
    } catch (error) {
        log.error(`Failed business show with id: ${_id}, ${error.message}`);
        res.status(400).json({errorMessage: error.message});
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
        log.info(`Successful business creation.`);
        res.status(200).json(result);
    } catch (error) {
        log.error(`Failed business creation: ${body}, ${error.message}`);
        res.status(400).json({errorMessage: error.message});
    }
});

app.put('/businesses/:id', authenticate, async (req, res) => {
    const _id = req.params.id;
    if (!ObjectId.isValid(_id)) {
        log.error(`id is not a mongo ObjectId`);
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
        const business = await Business.findById(_id);
        if (!business) {
            log.error(`No business found in update with id: ${_id}`);
            return res.status(404).send();
        }
        const updatedBusiness = await Business.findOneAndUpdate(
            {_id},
            {$set: body},
            {new: true}
        );
        log.info(`Successful business update.`);
        res.status(200).json(updatedBusiness);
    } catch (error) {
        log.error(`Failed business update with id: ${_id}, ${error.message}`);
        res.status(400).json({errorMessage: error.message});
    }
});

app.delete('/businesses/:id', authenticate, async (req, res) => {
    const _id = req.params.id;
    if (!ObjectId.isValid(_id)) {
        log.error(`id is not a mongo ObjectId`);
        return res.status(400).send();
    }
    try {
        const business = await Business.findById(_id);
        if (!business) {
            log.error(`No business found in delete with id: ${_id}`);
            return res.status(404).send();
        }
        await Business.findByIdAndDelete(_id);
        log.info(`Successful business deletion.`);
        res.status(200).send();
    } catch (error) {
        log.error(`Failed business deletion with id: ${_id}, ${error.message}`);
        res.status(400).json({errorMessage: error.message});
    }
});

app.listen(port, async () => {
    log.info(`Server is running on port: ${port}`);
});

// module.exports = app;
