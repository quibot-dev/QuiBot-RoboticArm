// Funcions que s'executaran segons la peticio a la url de la api (definides a routes)
const EV3_knex = require('../db_EV3')
const usuaris_knex = require('../db_usuaris')


// Communicacio EV3
exports.nou = async (req, res) => {

    //EV3 envia al servidor el seu nom (unic)

    EV3_knex.from('EV3').where('Nom', req.body.Nom)
        .then((EV3) => {
            console.log(req.body.Nom)
            if (EV3.length === 0) //Nou EV3, crear record EV3, extreure id i crear moviments_id + Historial_EV3__id
            {
                EV3_knex('EV3')
                    .insert({
                        'Connectat': 1,
                        'Nom': req.body.Nom,
                        'Disponible': 1,
                        'Ultima_Petició': EV3_knex.fn.now()
                    })
                    .then(() => {
                        console.log('Creacio EV3 correctament')
                        EV3_knex('Historic_EV3')
                            .insert({
                                'Accio': 'Nou EV3 detectat al sistema',
                                'Correu': 'Servidor',
                                'Nom': req.body.Nom,
                            })
                            .then(() => {
                                console.log('Historic EV3 creat correctament')
                                EV3_knex('Moviments_EV3')
                                    .insert({
                                        'Nom': req.body.Nom,
                                        'Manual': 0,
                                        'Automatic': 0,
                                        'Pinça': 0,
                                        'color':'red'
                                    })
                                    .then(() => {
                                        console.log({ message: 'Creacio Moviments EV3' })
                                        EV3_knex('EV3').where('Nom', req.body.Nom).first().then(ev3 => { res.json({ msg: 'OK', id: ev3.id })  })
                                    })
                                    .catch(err => {
                                        console.log({ message: 'Error Taula Moviments EV3', error: err })
                                    })

                            })
                            .catch(err => {
                                console.log({ message: 'Error Taula Historic EV3', error: err })
                            })
                    })
                    .catch(err => {
                        console.log({ message: 'Error inserint EV3 a la taula', error: err })
                    })
            }
            else { //ja tenim un EV3 amb aquest nom
                console.log('Ja existeix un EV3 amb aquest nom, no es poden repetir els noms dels robots')
                EV3_knex('EV3').where('Nom', req.body.Nom).update({ 
                    Connectat: 1, 
                    Disponible: 1, 
                    Usuari_Id: null,
                    'Ultima_Petició': EV3_knex.fn.now()
                }).then(() => { 
                    EV3_knex('EV3').where('Nom', req.body.Nom).first().then(ev3 => { 
                        res.json({ msg: 'OK', id: ev3.id }) 
                    }) 
                })}

        })
        .catch(err => {
            console.log(err)
        })

}

// Pagina EV3 
exports.desconnectats = async (req, res) => {
    EV3_knex.from('EV3').select('*').where('Connectat', 0)
        .then(EV3data => {
            res.json(EV3data.length)
        })
        .catch(err => {
            console.log({ message: 'Error counting students', error: err })
        })
}

exports.connectats = async (req, res) => {
    EV3_knex.from('EV3').select('*').where('Connectat', 1)
        .then(EV3data => {
            res.json(EV3data.length)
        })
        .catch(err => {
            console.log({ message: 'Error counting students', error: err })
        })
}

exports.total = async (req, res) => {
    EV3_knex.from('EV3').select('*')
        .then(EV3data => {
            res.json(EV3data)
        })
        .catch(err => {
            console.log({ message: 'Error counting students', error: err })
        })
}

exports.disponibles = async (req, res) => {
    EV3_knex.from('EV3').select('*').where('Disponible', 1)
        .then(EV3data => {
            res.json(EV3data.length)
        })
        .catch(err => {
            console.log({ message: 'Error counting students', error: err })
        })
}

exports.disponibles_connectats = async (req, res) => {
    EV3_knex.from('EV3').select('*').where({ 'Disponible': 1, 'Connectat': 1, 'Usuari_Id': null })
        .then(EV3data => {
            res.json(EV3data)
        })
        .catch(err => {
            console.log({ message: 'Error counting students', error: err })
        })
}


//Historic EV3

exports.HistoricTotal = async (req, res) => {
    EV3_knex.from('Historic_EV3').select('*')
        .then(Historic => {
            res.json(Historic)
        })
        .catch(err => {
            res.json({ message: 'Error cercant Usuaris', error: err })
        })
}

exports.HistoricEV3 = async (req, res) => {
    EV3_knex.from('Historic_EV3').where('Nom', req.body.Nom)
        .then(Historic => {
            res.json(Historic)
        })
        .catch(err => {
            res.json({ message: 'Error cercant Usuaris', error: err })
        })
}

exports.infoEV3 = async (req, res) => {
    EV3_knex.from('EV3').where('id', req.body.id)
        .then(Info => {
            res.json(Info)
        })
        .catch(err => {
            res.json({ message: 'Error cercant Usuaris', error: err })
        })
}

exports.editarEV3 = async (req, res) => {
    EV3_knex.from('EV3').select('*').where('id', req.body.id).update({
        'Nom': req.body.Nom,
        'Connectat': req.body.Connectat,
        'Disponible': req.body.Disponible,
        'Usuari_Id': req.body.Usuari_Id,
        'Ultima_Peticio': req.body.Ultima_Peticio,
    })
        .then(() => {
            console.log('Informació EV3 Actualitzada')
            EV3_knex.from('Historic_EV3')
                .insert({
                    Accio: 'Nova configuració al EV3: ' + req.body.Nom,
                    Correu: req.body.user_email,
                    Nom: req.body.Nom,
                })
                .then(() => {
                    console.log(' EV3 editat + Update Historic')
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

exports.eliminarEV3 = async (req, res) => {
    EV3_knex.from('EV3').where('id', req.body.id)
        .del()
        .then(() => {
            console.log('Informació Usuari Actualitzada')
            EV3_knex.from('Historic_EV3')
                .insert({
                    Accio: 'EV3 eliminat: ' + req.body.Nom,
                    Correu: req.body.user_email,
                    Nom: req.body.Nom
                })
                .then(() => {
                    console.log(' EV3 eliminat + Update Historic')
                    EV3_knex.from('Moviments_EV3').where('Nom', req.body.Nom)
                        .del()
                        .then(() => {
                            console.log('Moviments eliminats')
                            res.json({ message: 'EV3 Editat' })
                        })

                })
                .catch(err => {
                    res.json({ message: 'Error cercant EV3', error: err })
                })


        })
        .catch(err => {
            console.log({ message: `Error eliminant EV3`, error: err })
        })

}




exports.esperantVincularse = async (req, res) => {
    EV3_knex.from('EV3').where('Disponible', true).whereNotNull('Usuari_Id')
        .then(Info => {
            res.json(Info)
        })
        .catch(err => {
            res.json({ message: 'Error cercant Usuaris', error: err })
        })
}


exports.vinculats = async (req, res) => {
    EV3_knex.from('EV3').select('*').where('Disponible', false).whereNotNull('Usuari_Id')
        .then(EV3data => {
            res.json(EV3data)
        })
        .catch(err => {
            console.log({ message: 'Error counting students', error: err })
        })
}

exports.nullUser = async (req, res) => {

    EV3_knex.from('EV3').select('*').where({ 'Nom': req.body.Nom }).update({
        'Usuari_Id': null
    })
        .then(userData => {
            res.json(userData)
        })
        .catch(err => {
            console.log({ message: 'Error retrieving students', error: err })
        })

}


exports.nouEstat = async (req, res) => {
    EV3_knex.from('EV3').where('id', req.body.id_EV3)
        .then(Info => {
            const Nom = Info[0].Nom
            EV3_knex.from('Moviments_EV3').select('*').where({ 'Nom': Nom }).update({
                'Manual': req.body.Manual,
                'Automatic': req.body.Automatic,
                'Pinça': req.body.Pinça,
            })
                .then(() => {
                    usuaris_knex.from('Historial_Usuaris').insert({
                        Accio: 'Esta jugant amb el robot: ' + Nom,
                        Correu: req.body.user_email,
                    })
                        .then(() => {
                            EV3_knex.from('Historic_EV3').insert({
                                Accio: 'Estudiant: ' + req.body.user_email + 'Jugant amb el robot',
                                Correu: req.body.user_email,
                                Nom: Nom
                            })
                                .then(() => {
                                    console.log('Actualitzat histori EV3')
                                    res.json('Updated')
                                })
                                .catch(err => {
                                    console.log({ message: 'Error actualitzant historic usuaris', error: err })

                                })

                        })
                        .catch(err => {
                            console.log({ message: 'Error retrieving students', error: err })
                        })
                })
                .catch(err => {
                    console.log({ message: 'Error retrieving students', error: err })
                })

        })
        .catch(err => {
            res.json({ message: 'Error cercant Usuaris', error: err })
        })
}

exports.Estat = async (req, res) => {

    EV3_knex.from('Moviments_EV3').select('*').where({ 'Nom': req.body.Nom })
        .then(EV3Data => {
            res.json(EV3Data)
        })
        .catch(err => {
            console.log({ message: 'Error retrieving students', error: err })
        })
}

exports.Fi = async (req, res) => {
    console.log('fi')
    EV3_knex.from('Moviments_EV3').select('*').where({ 'Nom': req.body.Nom }).update({
        'Manual': 0,
        'Automatic': 0,
        'Pinça': 0,
    })
        .onConflict('Nom').ignore()
        .then(EV3Data => {
            res.json(EV3Data)
        })
        .catch(err => {
            console.log({ message: 'Error retrieving students', error: err })
        })

}

exports.treballant = async (req, res) => {
    EV3_knex.from('EV3').where('id', req.body.id_EV3)
        .then(Info => {
            const Nom = Info[0].Nom
            EV3_knex('EV3').where('id', req.body.id_EV3).update({ 'Ultima_Petició': EV3_knex.fn.now() }) 
            EV3_knex.from('Moviments_EV3').select('*').where({ 'Nom': Nom })
                .then(Info => {
                    let resposta = { Manual: Info[0].Manual, Automatic: Info[0].Automatic }
                    res.json(resposta)
                })
                .catch(err => {
                    console.log({ message: 'Error retrieving students', error: err })
                })
        })
        .catch(err => {
            res.json({ message: 'Error cercant Usuaris', error: err })
        })
}

exports.updateVision = async (req, res) => {
    const { Nom, tipus} = req.body

    await EV3_knex('Moviments_EV3')
        .where({ Nom })
        .update({
            tipus: tipus,
        })

    res.json({ msg: "OK" })
        
}

exports.getVision = async (req, res) => {
    const { Nom } = req.body

    //Actualitzar ultima petició per detectar desconnexions
    await EV3_knex('EV3').where({ Nom }).update({ 'Ultima_Petició': EV3_knex.fn.now() })


    const data = await EV3_knex('Moviments_EV3')
        .select('tipus')
        .where({ Nom })
        .first()

    res.json(data || { tipus: "SEARCH" })
}

exports.setColor = async (req, res) => {
    const { Nom, color } = req.body
 
    const COLORS_VALIDS = ['red', 'blue', 'yellow']
    if (!COLORS_VALIDS.includes(color)) {
        return res.status(400).json({ msg: 'Color no valid. Usa: red, blue, yellow' })
    }
 
    await EV3_knex('Moviments_EV3')
        .where({ Nom })
        .update({ color })
 
    res.json({ msg: 'OK', color })
}
 
exports.getColor = async (req, res) => {
    const { Nom } = req.body
 
    const data = await EV3_knex('Moviments_EV3')
        .select('color')
        .where({ Nom })
        .first()
 
    res.json(data || { color: 'red' })
}

const { spawn } = require('child_process')
let visionProcess = null
 
exports.startVision = (req, res) => {
    if (visionProcess) {
        return res.json({ msg: 'Ja en execució' })
    }
    try {
        visionProcess = spawn('python3', ['/home/pi/TFG/raspickfull.py'], {
            detached: false,
            stdio: 'ignore',
            env: { ...process.env, DISPLAY: ':0' }
        })
        visionProcess.on('exit', (code) => {
            console.log('raspickfull.py aturat, codi:', code)
            visionProcess = null
        })
        visionProcess.on('error', (err) => {
            console.error('Error arrencant raspickfull.py:', err)
            visionProcess = null
        })
        res.json({ msg: 'Iniciat' })
    } catch (err) {
        res.status(500).json({ msg: 'Error', error: err.message })
    }
}
 
exports.stopVision = (req, res) => {
    if (!visionProcess) {
        return res.json({ msg: 'No en execució' })
    }
    visionProcess.kill('SIGTERM')
    visionProcess = null
    res.json({ msg: 'Aturat' })
}
 
exports.statusVision = (req, res) => {
    res.json({ running: visionProcess !== null })
}


exports.manualMove = async (req, res) => {
    const { Nom, cmd } = req.body
    const CMDS_VALIDS = [
        'base_left', 'base_right',
        'shoulder_up', 'shoulder_down',
        'elbow_up', 'elbow_down',
        'gripper_open', 'gripper_close',
        'STOP'
    ]
    if (!CMDS_VALIDS.includes(cmd)) {
        return res.status(400).json({ msg: 'Comanda no vàlida' })
    }
    await EV3_knex('Moviments_EV3').where({ Nom }).update({ manual_cmd: cmd })
    res.json({ msg: 'OK', cmd })
}
 
exports.getManualCmd = async (req, res) => {
    const { Nom } = req.body
    const data = await EV3_knex('Moviments_EV3')
        .select('manual_cmd')
        .where({ Nom })
        .first()
    res.json(data || { manual_cmd: 'STOP' })
}

exports.setManualMode = async (req, res) => {
    const { Nom, actiu } = req.body
    await EV3_knex('Moviments_EV3')
        .where({ Nom })
        .update({ Manual: actiu ? 1 : 0 })
    res.json({ msg: 'OK', Manual: actiu ? 1 : 0 })
}


exports.desconnectar = async (req, res) => {
    const { Nom } = req.body
    await EV3_knex('EV3').where({ Nom }).update({
        Connectat: 0,
        Disponible: 0,
        Usuari_Id: null
    })
    res.json({ msg: 'OK' })
}

setInterval(async () => {
    try {
        const inactius = await EV3_knex('EV3')
            .where({ Connectat: 1 })
            .whereNotNull('Ultima_Petició')
            .whereRaw('datetime("Ultima_Petició") < datetime("now", "-70 seconds")')
 
        for (const ev3 of inactius) {
            await EV3_knex('EV3').where({ id: ev3.id }).update({
                Connectat: 0,
                Disponible: ev3.Usuari_Id ? 0 : 1,
            })
            console.log(`EV3 ${ev3.Nom} marcat com a desconnectat (timeout)`)
        }
    } catch (err) {
        console.error('Error job desconnexió:', err)
    }
}, 5000)

exports.setSequencia = async (req, res) => {
    const { Nom, sequencia } = req.body
    // sequencia: array de colors, ex: ["red","blue","yellow"]
    if (!Array.isArray(sequencia) || sequencia.length === 0 || sequencia.length > 3) {
        return res.status(400).json({ msg: 'Seqüència invàlida. Ha de tenir entre 1 i 3 colors.' })
    }
    const COLORS_VALIDS = ['red', 'blue', 'yellow']
    if (!sequencia.every(c => COLORS_VALIDS.includes(c))) {
        return res.status(400).json({ msg: 'Color no vàlid. Usa: red, blue, yellow' })
    }
    await EV3_knex('Moviments_EV3')
        .where({ Nom })
        .update({
            sequencia_colors: JSON.stringify(sequencia),
            color: sequencia[0],  // primer color actiu
            sequencia_completada: 0
        })
    res.json({ msg: 'OK', sequencia })
}
 
exports.getSequencia = async (req, res) => {
    const { Nom } = req.body
    const data = await EV3_knex('Moviments_EV3')
        .select('sequencia_colors', 'color', 'sequencia_completada')
        .where({ Nom })
        .first()
    const sequencia = JSON.parse(data?.sequencia_colors || '[]')
    res.json({ sequencia, color: data?.color || 'red', completada: data?.sequencia_completada === 1 })
}
 
exports.marcarSequenciaCompletada = async (req, res) => {
    const { Nom } = req.body
    await EV3_knex('Moviments_EV3')
        .where({ Nom })
        .update({ sequencia_completada: 1 })
    res.json({ msg: 'OK' })
}



