
//Acciones de prueba
const pruebaPublication = (req, res) =>{
    return res.status(200).send({
        message: "MEnsaje enviado desde: comtrollers/publicaction.js"
    })
}

//Exportar acciones
module.exports = {
    pruebaPublication
}