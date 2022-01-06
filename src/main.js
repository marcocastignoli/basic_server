const mysql = require('promise-mysql');
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')

const config = require('./config');


async function load() {
    const app = express()
    app.use(cors({
        origin: [
            'http://localhost',
            'http://localhost:8080',
            config.origin
        ],
        credentials:  true
    }))
    app.use(bodyParser.json());

    const db = await mysql.createPool({
        host: config.mysql.host,
        user: config.mysql.user,
        port: config.mysql.port,
        password: config.mysql.password,
        database: config.mysql.database
    });

    require('./auth/routes')(app, db)
    require('./users/routes')(app, db)
    
    app.listen(config.port)
}

load()