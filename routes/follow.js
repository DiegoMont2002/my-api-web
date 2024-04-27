const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follows");
const auth = require("../middlewares/auth");

// Definir Rutas
router.get("/prueba-follow", FollowController.pruebaFollow);
router.post("/save", auth.auth, FollowController.save);
router.delete("/unfollow/:id", auth.auth, FollowController.unfollow);


// Exportar Ruta
module.exports = router;