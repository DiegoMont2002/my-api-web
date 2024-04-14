const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follows");

// Definir Rutas
router.get("/prueba-follow", FollowController.pruebaFollow);

// Exportar Ruta
module.exports = router;