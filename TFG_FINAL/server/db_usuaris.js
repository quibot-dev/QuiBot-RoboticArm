const path = require('path')
const dbPath = path.resolve(__dirname, 'db/usuaris.sqlite')
const usuaris_knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: dbPath,
        user: "quibot",
        password: "quibot",
    },

    useNullAsDefault: true
})


usuaris_knex.schema.hasTable('Usuaris')
    .then((exists) => {
        if (!exists) {
            return usuaris_knex.schema.createTable('Usuaris', (table) => {
                table.increments('id').primary()
                table.string('Nom')
                table.string('Primer_Cognom')
                table.string('Segon_Cognom')
                table.string('Contrassenya')
                table.string('Correu').unique()
                table.enu('Rol', ['Administrador', 'Estudiant'])
                table.boolean('Permis')
                table.boolean('Vinculat')
                table.int('EV3_id')

            })
                .then(() => {
                    console.log('Taula Usuaris creada')
                    usuaris_knex.from('Usuaris')
                        .insert({
                            'Nom': "Administrador",
                            'Primer_Cognom': "Cognom 1",
                            'Segon_Cognom': "Cognom 2",
                            'Contrassenya': "d4584547c7f6a01a40bb8d863ab2c134e0c51ce353c0ca2fd93857961d750658",
                            'Correu': "Administrador@Administrador.com",
                            'Rol': 'Administrador',
                            'Permis': 0,
                            'Vinculat':0
                        })
                        .then(() => {
                            console.log('Administrador creat.')
                        })
                        .catch(err => { console.log(`Error creant Administrador: ${err}`) })
                })
                .catch((error) => { console.error(`Error creant Usuaris: ${error}`) })
        }
    })
    .catch((error) => { console.error(`Error setting up the database: ${error}`) })

usuaris_knex.schema.hasTable('Historial_Usuaris')
    .then((exists) => {
        if (!exists) {
            return usuaris_knex.schema.createTable('Historial_Usuaris', (table) => {
                table.timestamp('Hora').defaultTo(usuaris_knex.fn.now())
                table.string('Accio')
                table.string('Correu')
            })
                .then(() => {
                    console.log('Taula Usuaris creada')
                })
                .catch((error) => { console.error(`Error creant Historic: ${error}`) })
        }
    })
    .catch((error) => { console.error(`Error setting up the database: ${error}`) })

module.exports = usuaris_knex

