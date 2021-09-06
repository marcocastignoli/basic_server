module.exports = {
    validate(properties) {
        return function(req, res, next) {
            let missing = []
            properties.forEach(prop => {
                if (!req.body.hasOwnProperty(prop) || req.body[prop] === '') {
                    missing.push(prop)
                }
            });
            if (missing.length > 0) {
                return res.status(400).send({msg: `Missing fields: ${missing.join(',')}`})
            }
            return next()
        }
    },
    loadSql(db) {
        return async function SQL(strings, ...keys) {
            const query = strings.join(" ? ")
            return await db.query(query, keys);
        }
    },
    handleSqlError(res, err, handlers) {
        console.log(err)
        if (typeof handlers === 'object' && handlers !== null && err.code in handlers) {
            handlers[err.code](res)
        } else {
            switch(err.code) {
                case 'ER_DUP_ENTRY': 
                    return res.status(409).send({ msg: 'Duplicate entry' })
                case 'ER_BAD_TABLE_ERROR':
                    return res.status(500).send({ msg: 'Server error' })
                default:
                    return res.status(500).send({ msg: 'Unknown error' })
            }
        }
    }
}