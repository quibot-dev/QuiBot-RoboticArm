const express = require('express')
const usersRoutes = require('../controllers/usuaris-controller.js')

const router = express.Router()

router.post('/accedir', usersRoutes.accedir)
router.post('/historialUsuari', usersRoutes.HistorialUsuari) 
router.get('/get/historial', usersRoutes.HistoricTotal)
router.get('/get/total', usersRoutes.total)
router.get('/get/administradors', usersRoutes.administradors)
router.get('/get/estudiants', usersRoutes.estudiants)
router.post('/infoUsuari', usersRoutes.individual)
router.post('/editarUsuari', usersRoutes.editarInformacio)
router.post('/eliminarUsuari', usersRoutes.eliminarUsuari)
router.post('/permis', usersRoutes.permis_EV3)
router.get('/get/vinculats', usersRoutes.vinculats)
router.get('/get/esperant_vinculacio', usersRoutes.esperant_vinculacio)
router.post('/vincular', usersRoutes.vincular)
router.post('/desvincular', usersRoutes.desvincular)
router.post('/nouUsuari', usersRoutes.nouUsuari)
router.post('/sortir', usersRoutes.sortir)


















module.exports = router