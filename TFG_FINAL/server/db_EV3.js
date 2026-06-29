const path = require('path')
const dbPath = path.resolve(__dirname, 'db/EV3.sqlite')
const EV3_knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: dbPath,
        user: "quibot",
        password: "quibot",
    },

    useNullAsDefault: true
})

EV3_knex.schema.hasTable('EV3')
    .then((exists) => {
        if (!exists) {
            return EV3_knex.schema.createTable('EV3', (table) => {
                table.increments('id').primary()
                table.string('Nom').unique()
                table.boolean('Connectat')
                table.boolean('Disponible')
                table.integer('Usuari_Id')
                table.time('Ultima_Petició')
            })
                .then(() => {
                    console.log('Taula EV3 creada')
                })
                .catch((error) => { console.error(`Error creant taula EV3 : ${error}`) })
        }
    })
    .catch((error) => { console.error(`Error setting up the database: ${error}`) })

EV3_knex.schema.hasTable('Historic_EV3')
    .then((exists) => {
        if (!exists) {
            return EV3_knex.schema.createTable('Historic_EV3', (table) => {
                table.timestamp('Hora').defaultTo(EV3_knex.fn.now())
                table.string('Accio')
                table.string('Correu')
                table.string('Nom')
            })
                .then(() => {
                    console.log('Taula Historic EV3 creada')
                })
                .catch((error) => { console.error(`Error creant taula EV3 : ${error}`) })
        }
    })
    .catch((error) => { console.error(`Error setting up the database: ${error}`) })

EV3_knex.schema.hasTable('Moviments_EV3')
    .then((exists) => {
        if (!exists) {
            return EV3_knex.schema.createTable('Moviments_EV3', (table) => {
                table.string('Nom').unique()
                table.boolean('Manual') 
                table.boolean('Automatic')
                table.boolean('Pinça')
                table.string('tipus')
                table.string('color').defaultTo('red')
                table.string('manual_cmd').defaultTo('STOP')
                table.text('sequencia_colors').defaultTo('[]')
                table.integer('sequencia_completada').defaultTo(0)
            })
                .then(() => {
                    console.log('Taula Moviments EV3 creada')
                })
                .catch((error) => { console.error(`Error creant taula EV3 : ${error}`) })
        }
    })
    .catch((error) => { console.error(`Error setting up the database: ${error}`) })


module.exports = EV3_knex

