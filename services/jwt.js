//Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

//Clave secreta
const secret = "CLAVE_SECRETA_de_la_RED_SOCIAL_16042024";

//Crear una funcion para generar tokens
exports.createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        imagen: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix
    };

    //Devolver jwt token codificado
    return jwt.encode(payload, secret);
}

