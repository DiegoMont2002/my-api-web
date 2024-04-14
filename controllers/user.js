/*// Importar dependencias y modulos 
const bcrypt = require("bcrypt");
const User = require("../models/user")

//Acciones de prueba
const pruebaUser = (req, res) =>{
    return res.status(200).send({
        message: "MEnsaje enviado desde: comtrollers/user.js"
    });
}

// Registro de Usuarios
const register = (req, res) => {
    // Recoger datos de la peticion
    const params = req.body;
    

    // Comprobacion de que lleguen bien (+ validacion)
    if(!params.name || !params.email || !params.password || !params.nick){
       return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        });   
    }

    

    // Control de usuarios duplicados
    User.find({ $or: [
            {email: params.email.toLowerCase()},
            {nick: params.nick.toLowerCase()}

    ]}).exec(async(error, users) => {
        
        if(error) return res.status(500).json({
            status: "error",
            message: "Error en la consulta de usuarios"});

        if(users && users.length >= 1){
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
        }
            // Cifrar la Contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd; 

        // Crear objeto de usuario
        let user_to_save = new User(params);
    
        // Guardar Usuario en la bbdd
        user_to_save.save((error, userStored) => {
            if(error || !userStored) return res.status(500).send({status: "error", "message": "Error al guardar el usuario"});

    
            //Devolver Resultado
            return res.status(200).json({
                status: "success",
                message: "Usuario registardo correctamente",
                user: userStored
            });
        
            
        
        });
    });

}


//Exportar acciones
module.exports = {
    pruebaUser,
    register
}*/

// Importar dependencias y modulos 
const bcrypt = require("bcrypt");
const User = require("../models/user")

//Acciones de prueba
const pruebaUser = (req, res) =>{
    return res.status(200).send({
        message: "MEnsaje enviado desde: comtrollers/user.js"
    });
}

// Registro de Usuarios
    

    // Control de usuarios duplicados
    const register = async (req, res) => {
        // Recoger datos de la peticion
        const params = req.body;

        // Comprobacion de que lleguen bien (+ validacion)
        if(!params.name || !params.email || !params.password || !params.nick){
            return res.status(400).json({
                status: "error",
                message: "Faltan datos por enviar"
            });   
        }
     
     try {
        const users = await User.find({ $or: [{email: params.email.toLowerCase()}, {nick: params.nick.toLowerCase()}]});

        if(users && users.length >= 1){
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
        }

            // Cifrar la Contraseña
        const pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd; 

        // Crear objeto de usuario
        const user_to_save = new User(params);
    
        // Guardar Usuario en la bbdd
        const userStored = await user_to_save.save();
        
            //Devolver Resultado
        return res.status(200).json({
            status: "success",
            message: "Usuario registardo correctamente",
            user: userStored

        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al registrar el usuario",
            error: error.message
        
        
        });
    };

}

const login =(req, res) => {
    return res.status(200).send({
        statues: "success",
        message: "Accion de login"
    });
}


//Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login
    
}