const express = require('express')
const EV3Routes = require('../controllers/EV3-controller.js')
const router = express.Router()

router.get('/get/total', EV3Routes.total)
router.get('/get/connectats', EV3Routes.connectats)
router.get('/get/desconnectats', EV3Routes.desconnectats)
router.get('/get/disponibles', EV3Routes.disponibles)
router.get('/get/disponibles_connectats', EV3Routes.disponibles_connectats)


router.get('/get/historial', EV3Routes.HistoricTotal)
router.post('/historialEV3', EV3Routes.HistoricEV3)


router.post('/infoEV3', EV3Routes.infoEV3)
router.post('/eliminarEV3', EV3Routes.eliminarEV3)
router.post('/editarEV3', EV3Routes.editarEV3)

router.get('/esperantVincularse', EV3Routes.esperantVincularse)
router.get('/get/vinculats', EV3Routes.vinculats)

router.post('/nouEstat', EV3Routes.nouEstat)
router.post('/treballant', EV3Routes.treballant)

router.post('/nou', EV3Routes.nou) 
router.post('/Estat', EV3Routes.Estat)
router.post('/fi', EV3Routes.Fi)
router.post('/getVision', EV3Routes.getVision)
router.post('/updateVision', EV3Routes.updateVision)
router.post('/setColor', EV3Routes.setColor)
router.post('/getColor',EV3Routes.getColor)
router.post('/vision/start', EV3Routes.startVision)
router.post('/vision/stop', EV3Routes.stopVision)
router.get('/vision/status', EV3Routes.statusVision)
router.post('/manualMove', EV3Routes.manualMove)
router.post('/getManualCmd', EV3Routes.getManualCmd)
router.post('/desconnectar', EV3Routes.desconnectar)
router.post('/getSequencia', EV3Routes.getSequencia)
router.post('/marcarSequenciaCompletada', EV3Routes.marcarSequenciaCompletada)
router.post('/setManualMode', EV3Routes.setManualMode)
router.post('/setSequencia', EV3Routes.setSequencia)
// Testing
router.post('/nullUser', EV3Routes.nullUser)




module.exports = router