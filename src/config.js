require('dotenv').config()

module.exports = {
    privateKey: process.env.PRIVATE_KEY,
    authMethod: process.env.AUTH_METHOD,
    sms: {
        auth: process.env.SMS_AUTH,
        from: process.env.SMS_FROM,
    },
    port: process.env.PORT,
    mysql: {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        port: process.env.MYSQL_PORT,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    },
    origin: process.env.ORIGIN,
}