
//Acciones de prueba
const pruebaFollow = (req, res) =>{
    return res.status(200).send({
        message: "MEnsaje enviado desde: comtrollers/folows.js"
    })
}

//Exportar acciones
module.exports = {
    pruebaFollow
}