
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const auth = require("../middlewares/auth");

// Definir Rutas
router.get("/prueba-usuario", auth.auth, UserController.pruebaUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", auth.auth, UserController.profile);
router.get("/list/:page?", auth.auth, UserController.list);
router.put("/update", auth.auth, UserController.update);

// Exportar Ruta
module.exports = router;