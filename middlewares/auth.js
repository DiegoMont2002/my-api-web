//Importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

//Importar clave secreta
const libjwt = require("../services/jwt");
const secret = libjwt.secret;

//MIDDLEWARE de autenticacion
exports.auth = (req, res, next) => {

    //Comprobar si llega la cebecera de auth
    if(!req.headers.authorization){
        return res.status(403).send({
            status: "error",
            message: "La peticion no tiene la cabecera de autenticacion"
        });
    }

    //Limpiar el token 
    const token = req.headers.authorization.replace(/['"]+/g, '');

    //Codificar el token
    try{
        const payload = jwt.decode(token, secret);

        //Comprobar expiracion del token
        if(payload.exp <= moment().unix()){
            return res.status(404).send({
                status: "error",
                message: "Token expirado"
            });
        }

        //Agregar datos de usuario o request
        req.user = payload;

    }catch(error){
        return res.status(404).send({
            status: "error",
            message: "Token invalido",
            error
        });
    }


    //Pasar a ejecucion de accion
    next();

}

