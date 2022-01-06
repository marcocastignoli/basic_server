const { loadSql, handleSqlError } = require('../utilities');

module.exports = function(app, db) {

    const SQL = loadSql(db)

    app.post('/user/update', utilities.validateBody(['address', 'complete_name']), async (req, res) => {
        let results
        try {
            results = await SQL`
                UPDATE users
                SET
                    address = ${req.body.address},
                    complete_name = ${req.body.complete_name}
                WHERE
                    id = ${req.user.id}
            `
        } catch (err) {
            return handleSqlError(res, err)
        }

        return res.send({
            msg: 'Utente aggiornato con successo'
        })
    })
}