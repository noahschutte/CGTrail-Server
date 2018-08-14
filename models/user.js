const mongoose = require('../db/mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email.',
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    tokens: [{
        access: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
    }],
});

UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = async function() {
    const user = this;
    const access = 'auth';
    const token = jwt.sign(
        {
            _id: user._id.toHexString(),
            access,
        },
        process.env.JWT_SECRET
    ).toString();

    user.tokens.push({access, token});

    await user.save();
    return token;
};

UserSchema.methods.removeToken = function(token) {
    const user = this;

    return user.update({
        $pull: {
            tokens: {token},
        },
    });
};

UserSchema.statics.findByToken = function(token) {
    const User = this;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return User.findOne({
            '_id': decoded._id,
            'tokens.token': token,
            'tokens.access': 'auth',
        });
    } catch (error) {
        return Promise.reject(error);
    }
};

UserSchema.statics.findByCredentials = async function(email, password) {
    const User = this;

    const user = await User.findOne({email});
    if (!user) {
        return Promise.reject();
    }

    return new Promise((resolve, reject) => {
        // Use bcrypt.compare to compare password and user.password
        bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
                resolve(user);
            } else {
                reject();
            }
        });
    });
};

UserSchema.pre('save', function(next) {
    const user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
