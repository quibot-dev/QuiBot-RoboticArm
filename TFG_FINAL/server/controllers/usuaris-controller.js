// Import database
const { request } = require('express')
const knex = require('../db_usuaris')
const EV3_knex = require('../db_EV3')



exports.vincular = async (req, res) => {
    knex.from('Usuaris').select('*').where('id', req.body.id).update({
        'Vinculat': 1
    })
        .then(() => {
            console.log('Usuari Vinculat')
            EV3_knex.from('EV3').select('*').where('Usuari_Id', req.body.EV3_id).update({
                'Disponible': 0,
                'Usuari_Id': req.body.id
            })
                .then(() => {
                    console.log("EV3 Linquejat")
                    knex.from('Historial_Usuaris').insert({
                        Accio: 'Vinculació amb robot: ' + req.body.nom_robot,
                        Correu: req.body.correu_estudiant,
                    })
                        .then(() => {
                            console.log('Historic Usuaris Actualitzat')
                            EV3_knex.from('Historic_EV3').insert({
                                Accio: 'Vinculació amb estudiant: ' + req.body.correu_estudiant,
                                Correu: req.body.user_email,
                                Nom: req.body.nom_robot
                            })
                                .then(() => {
                                    console.log('Actualitzat histori EV3')
                                })
                                .catch(err => {
                                    console.log({ message: 'Error actualitzant historic usuaris', error: err })

                                })

                        })
                        .catch(err => {
                            console.log({ message: 'Error actualitzant historic usuaris', error: err })
                        })

                })

                .catch(err => {
                    console.log({ message: 'Error afagat historic', error: err })
                })


        })
        .catch(err => {
            console.log({ message: 'Error cercant usuaris amb permis', error: err })
        })
}

exports.desvincular = async (req, res) => {
    console.log('Desvincular')
    knex.from('Usuaris').select('*').where('id', req.body.id).update({
        'Vinculat': null,
        'EV3_id': null,
        'Permis': 0,
    })
        .then(() => {
            console.log('Usuari Desvinculat')
            EV3_knex.from('EV3').select('*').where('Usuari_Id', req.body.EV3_id).update({
                'Disponible': 1,
                'Usuari_Id': null,
            })
                .then(() => {
                    console.log("EV3 Deslinquejat")

                    knex.from('Historial_Usuaris').insert({
                        Accio: 'Desvinculació amb robot: ' + req.body.nom_robot,
                        Correu: req.body.correu_estudiant,
                    })
                        .then(() => {
                            console.log('Historic Usuaris Actualitzat')
                            EV3_knex.from('Historic_EV3').insert({
                                Accio: 'Desvinculació amb estudiant: ' + req.body.correu_estudiant,
                                Correu: req.body.user_email,
                                Nom: req.body.nom_robot
                            })
                                .then(() => {
                                    console.log('Actualitzat histori EV3')

                                })
                                .catch(err => {
                                    console.log({ message: 'Error actualitzant historic usuaris', error: err })

                                })

                        })
                        .catch(err => {
                            console.log({ message: 'Error actualitzant historic usuaris', error: err })
                        })

                })

                .catch(err => {
                    console.log({ message: 'Error afagat historic', error: err })
                })


        })
        .catch(err => {
            console.log({ message: 'Error cercant usuaris amb permis', error: err })
        })
}


exports.vinculats = async (req, res) => {
    knex.from('Usuaris').select('*').where({ 'Permis': 1, 'Vinculat': true }).whereNotNull('EV3_id')
        .then(userData => {
            res.json(userData)
        })
        .catch(err => {
            console.log({ message: 'Error cercant usuaris amb permis', error: err })
        })
}


// Accedir sistema

exports.accedir = async (req, res) => {
    knex.from('Usuaris').where('Correu', req.body.email)
        .then((user) => {
            if (user.length > 0) {
                if (req.body.contrassenya === user[0].Contrassenya) {
                    knex.from('Historial_Usuaris')
                        .insert({
                            Accio: 'Accedeix al sistema',
                            Correu: req.body.email,
                        })
                        .then(() => {
                            res.json({
                                acces: true,
                                correu: user[0].Correu,
                                nom: user[0].Nom,
                                cognom1: user[0].Primer_Cognom,
                                cognom2: user[0].Segon_Cognom,
                                rol: user[0].Rol,
                                ev3_id: user[0].EV3_id,
                                permis: user[0].Permis,
                                id: user[0].id,
                                Vinculat: user[0].Vinculat
                            })
                        })
                        .catch(err => {
                            console.log({ message: 'Error actualitzant historic usuaris', error: err })
                        })
                } else {
                    res.json({ message: 'Contrassenya erronia', acces: false })
                }
            } else {
                res.json({ message: "No s'ha trobat cap usuari amb aquest correu", acces: false })
            }
        })
        .catch(err => {
            console.log({ message: `Error crecant taula usuaris`, error: err, acces: false })
        })
}

// Historial Usuari (Adiministrador)


exports.HistorialUsuari = async (req, res) => {
    knex.from('Usuaris').select('*').where('id', req.body.id)
        .then(userData => {
            knex.from('Historial_Usuaris').where({ Correu: userData[0].Correu })
                .then(userInfo => {
                    res.json(userInfo)
                })
                .catch(err => {
                    console.log({ message: 'Error afagat historic', error: err })
                })
        })
        .catch(err => {
            res.json({ message: 'Error cercant Usuaris', error: err })
        })

}


exports.HistoricTotal = async (req, res) => {
    knex.from('Historial_Usuaris').select('*')
        .then(Historic => {
            res.json(Historic)
        })
        .catch(err => {
            res.json({ message: 'Error cercant Usuaris', error: err })
        })
}

//Pagina Usuaris (Administrador)

exports.total = async (req, res) => {
    knex.from('Usuaris').select('*')
        .then(userData => {
            res.json(userData)
        })
        .catch(err => {
            console.log({ message: 'Error retrieving users', error: err })
        })
}

exports.administradors = async (req, res) => {
    knex.from('Usuaris').select('*').where('Rol', 'Administrador')
        .then(userData => {
            res.json(userData)
        })
        .catch(err => {
            console.log({ message: 'Error retrieving admins', error: err })
        })
}

exports.estudiants = async (req, res) => {
    knex.from('Usuaris').select('*').where('Rol', 'Estudiant')
        .then(userData => {
            res.json(userData)
        })
        .catch(err => {
            console.log({ message: 'Error retrieving students', error: err })
        })
}


// Informació usuari

exports.individual = async (req, res) => {
    knex.from('Usuaris').select('*').where('id', req.body.id)
        .then(userData => {
            res.json(userData)
        })
        .catch(err => {
            res.json({ message: 'Error cercant Usuaris', error: err })
        })
}

exports.editarInformacio = async (req, res) => {
    console.log(req.body)
    knex.from('Usuaris').select('*').where('id', req.body.id).update({
        'Nom': req.body.Nom,
        'Primer_Cognom': req.body.Primer_Cognom,
        'Segon_Cognom': req.body.Segon_Cognom,
        'Correu': req.body.Correu,
        'Contrassenya': req.body.Contrassenya,
        'Rol': req.body.Rol,
    })
        .then(() => {
            console.log('Informació Usuari Actualitzada')
            knex.from('Historial_Usuaris')
                .insert({
                    Accio: 'Nova configuració al usuari: ' + req.body.Correu,
                    Correu: req.body.user_email,
                })
                .then(() => {
                    console.log(' Usuari editat + Update Historic')
                    res.json({ message: 'Usuari Editat' })
                })
                .catch(err => {
                    res.json({ message: 'Error cercant Usuaris', error: err })
                })

        })
        .catch(err => {
            res.json({ message: 'Error cercant Usuaris', error: err })
        })
}

exports.eliminarUsuari = async (req, res) => {
    if (req.body.id !== '1') {
        knex.from('Usuaris').where('id', req.body.id)
            .del()
            .then(() => {
                console.log('Informació Usuari Actualitzada')
                knex.from('Historial_Usuaris')
                    .insert({
                        Accio: 'Usuari eliminat: ' + req.body.Correu,
                        Correu: req.body.user_email,
                    })
                    .then(() => {
                        console.log(' Usuari eliminat + Update Historic')
                        res.json({ message: 'Usuari Editat' })
                    })
                    .catch(err => {
                        res.json({ message: 'Error cercant Usuaris', error: err })
                    })


            })
            .catch(err => {
                console.log({ message: `Error eliminant usuari`, error: err })
            })
    }
}

// Permis 

exports.permis_EV3 = async (req, res) => {
    console.log('permis')
    knex.from('Usuaris').select('*').where('id', req.body.id).update({
        'Permis': true,
        'EV3_id': req.body.id_EV3
    })
        .then(() => {
            console.log('Informació Usuari Actualitzada')
            knex.from('Historial_Usuaris')
                .insert({
                    Accio: 'Usuari demana permis per utilitzar el robot: ' + req.body.Nom,
                    Correu: req.body.user_email,
                })
                .then(() => {
                    console.log(' Permis actualitzat + Update Historic')

                    EV3_knex.from('EV3').select('*').where('id', req.body.id_EV3).update({
                        'Usuari_Id': req.body.id,
                    })
                        .then(() => {
                            console.log('Informació EV3 Actualitzada')
                            EV3_knex.from('Historic_EV3')
                                .insert({
                                    Accio: req.body.user_email + ' demana vincular-se al robot',
                                    Correu: req.body.user_email,
                                    Nom: req.body.Nom,
                                })
                                .then(() => {
                                    console.log(' EV3 editat + Update Historic')
                                    res.json({ message: 'EV3 Editat' })
                                })
                                .catch(err => {
                                    res.json({ message: 'Error cercant ev3', error: err })
                                })

                        })
                        .catch(err => {
                            res.json({ message: 'Error cercant EV3', error: err })
                        })

                })
                .catch(err => {
                    res.json({ message: 'Error cercant usuari', error: err })
                })
        })
        .catch(err => {
            res.json({ message: 'Error cercant Usuaris', error: err })
        })
}



// Nou Usuari

exports.nouUsuari = async (req, res) => {

    knex.from('Usuaris').insert({
        'Nom': req.body.Nom,
        'Primer_Cognom': req.body.Primer_Cognom,
        'Segon_Cognom': req.body.Segon_Cognom,
        'Correu': req.body.Correu,
        'Contrassenya': req.body.Contrassenya,
        'Rol': req.body.Rol,
        'Permis': 0
    })
        .then(() => {
            knex.from('Historial_Usuaris')
                .insert({
                    Accio: 'Nou usuari al sistema',
                    Correu: req.body.Correu,
                })
                .then(() => {

                    console.log('Creacio nou Usuari + Update Historic')
                    res.json({ message: 'Usuari creat' })
                })
                .catch(err => {
                    res.json({ message: 'Error cercant Usuaris', error: err })
                })
        })
        .catch(err => {
            res.json({ message: 'Error cercant Usuaris', error: err })
        })
}


exports.sortir = async (req, res) => {

    knex.from('Historial_Usuaris').insert({ 'Accio': "Usuari surt del sistema", 'Correu': req.body.user_correu })
        .then(userInfo => {
            console.log('Historial Actualitzat')
            res.json({ msg: "Surt" })
        })
        .catch(err => {
            console.log({ message: 'Error afagat historic', error: err })
        })

}

exports.esperant_vinculacio = async (req, res) => {


    knex.from('Usuaris').select('*').where({ 'Permis': true, 'Vinculat': null }).whereNotNull('EV3_id')
        .then(userData => {
            res.json(userData)
        })
        .catch(err => {
            console.log({ message: 'Error retrieving students', error: err })
        })

}

