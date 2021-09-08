const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const jwtCheck = require('express-jwt')
const bcrypt = require('bcrypt')
const randomize = require('randomatic')
const config = require('../config');
const utilities = require('../utilities')
const {sendToken} = require('./auth')
const { loadSql, handleSqlError } = require('../utilities');

module.exports = function(app, db, exceptions = []) {

    console.log([/^\/auth\/.*/, ...exceptions])
    
    const SQL = loadSql(db)

    app.use(cookieParser())

    app.use(jwtCheck({ secret: config.privateKey, algorithms: ['HS256'], getToken: req => req.cookies.token }).unless({ path: [/^\/auth\/.*/, ...exceptions] }) )

    app.use(function (err, req, res, next) {
        if (err.name === 'UnauthorizedError') {
            return res.status(401).send({
                msg: 'Token not valid'
            });
        } else {
            next(err);
        }
    });

    app.post('/auth/register', utilities.validate(['username', 'password', 'phone', 'email', 'address', 'complete_name']), async (req, res) => {
        const verificationCode = randomize('000000')
        const passwordHash = await bcrypt.hash( req.body.password, 10)
        try {
            await SQL`
                INSERT INTO 
                    users
                VALUES
                    (
                        NULL,
                        ${req.body.username},
                        ${passwordHash},
                        ${req.body.phone},
                        ${verificationCode},
                        0,
                        ${req.body.email},
                        ${req.body.address},
                        ${req.body.complete_name},
                        NULL
                    )
            `
        } catch (err) {
            return handleSqlError(res, err, {
                ER_DUP_ENTRY: res => res.status(409).send({ msg: 'Username or number taken' })
            })
        }
        const tokenSent = await sendToken(req.body, verificationCode)
        if (!tokenSent) {
            return res.status(500).send('verification_token_not_sent')
        }
        return res.send({
            username: req.body.username,
            complete_name: req.body.complete_name,
            address: req.body.address
        })
    })

    app.post('/auth/activate', utilities.validate(['username', 'verificationCode']), async (req, res) => {
        let result
        try {
            result = await SQL`
                UPDATE users
                SET active = 1
                WHERE 1=1
                    AND username = ${req.body.username} 
                    AND verification_token = ${req.body.verificationCode}
            `
        } catch (err) {
            return handleSqlError(res, err)
        }
        if (result.affectedRows === 0) {
            res.status(404).send({
                msg: "Username or verification code not found"
            })
        } else {
            res.send({
                msg: "User activated"
            })
        }
    })

    app.post('/auth/login', utilities.validate(['username', 'password']), async (req, res) => {
        let result
        try {
            result = await SQL`
                SELECT 
                    u.*,
                    IF(su.user_id is not null, true, false) as subscribed
                FROM users u
                LEFT JOIN subscriptions_users su ON u.id = su.user_id
                WHERE 
                    username = ${req.body.username}
            `
        } catch (err) {
            return handleSqlError(res, err)
        }
        if (result.length === 0) {
            return res.status(404).send({
                msg: "Username not found"
            })
        }

        let user = result[0]
        if (user.active === 0) {
            return res.status(403).send({
                msg: "User not active",
                type: "NOT_ACTIVE"
            })
        }
        if( bcrypt.compareSync( req.body.password, user.password ) ) {
            const token = jwt.sign({ username: user.username, id: user.id }, config.privateKey, { expiresIn: 60 * 60 * 24 * 365 });
            delete user.password
            delete user.verification_token
            res.cookie('token', token, { httpOnly: true });
            return res.send({ user })
        } else {
            return res.status(401).send({
                msg: "Pasword sbagliata"
            })
        }
    })

    app.post('/auth/logout', async (req, res) => {
        res.cookie('token', null, { httpOnly: true });
        return res.send()
    })

    app.get('/user', async (req, res) => {
        let result
        try {
            result = await SQL`
                SELECT *
                FROM users
                WHERE 
                    id = ${req.user.id}
            `
        } catch (err) {
            switch(err.code) {
                default:
                    return res.status(500).send({
                        msg: 'Unknown error'
                    })
            }
        }
        if (result.length === 0) {
            return res.status(404).send({
                msg: "Username not found"
            })
        }

        let user = result[0]
        delete user.password
        delete user.verification_token
        return res.send({user})
    })

    app.post('/auth/askReset', utilities.validate(['phone']), async (req, res) => {
        const verificationCode = randomize('000000')
        const tokenSent = await sendToken(req.body, verificationCode)
        if (!tokenSent) {
            return res.status(500).send('verification_token_not_sent')
        }
        let result
        try {
            result = await SQL`
                UPDATE users
                SET reset_code = ${verificationCode}
                WHERE 
                    phone = ${req.body.phone}
            `
        } catch (err) {
            return handleSqlError(res, err)
        }
        if (result.affectedRows === 0) {
            res.status(404).send({
                msg: "Phone not found"
            })
        } else {
            res.send({
                msg: "Reset code sent"
            })
        }
    })

    app.post('/auth/reset', utilities.validate(['phone', 'reset_code', 'password']), async (req, res) => {
        let result
        try {
            result = await SQL`
                UPDATE users
                SET 
                    reset_code = NULL,
                    password = ${await bcrypt.hash( req.body.password, 10)}
                WHERE 
                    phone = ${req.body.phone}
                    AND reset_code = ${req.body.reset_code}
            `
        } catch (err) {
            return handleSqlError(res, err)
        }
        if (result.affectedRows === 0) {
            res.status(404).send({
                msg: "Phone not found"
            })
        } else {
            res.send({
                msg: "Password reset succesfully"
            })
        }
    })
}