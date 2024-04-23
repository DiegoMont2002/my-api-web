
// Importar dependencias y modulos 
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
const User = require("../models/user")

//Importar servicios
const jwt = require("../services/jwt");

//Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "MEnsaje enviado desde: comtrollers/user.js",
        usuario: req.user
    });
}



// Registro de Usuarios
// Control de usuarios duplicados
const register = async (req, res) => {
    // Recoger datos de la peticion
    const params = req.body;

    // Comprobacion de que lleguen bien (+ validacion)
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    try {
        const users = await User.find({ $or: [{ email: params.email.toLowerCase() }, { nick: params.nick.toLowerCase() }] });

        if (users && users.length >= 1) {
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

const login = async (req, res) => {
    try {
        // Recoger parametros
        let params = req.body;

        if (!params.email || !params.password) {
            return res.status(400).send({
                status: "error",
                message: "Faltan datos por enviar"
            });
        }

        // Buscar en la bbdd si existe
        const user = await User.findOne({ email: params.email });

        if (!user) {
            return res.status(404).send({ status: "error", message: "No existe el usuario" });
        }

        // Comprobar su contraseña
        const pwd = bcrypt.compareSync(params.password, user.password);

        if (!pwd) {
            return res.status(400).send({
                status: "error",
                message: "No te has identificado correctamente"
            });
        }

        // DevolverToken
        const token = jwt.createToken(user);

        // Eliminar password del objeto
        user.password = undefined;

        // Devolver datos del usuario
        return res.status(200).send({
            status: "success",
            message: "Te has identificado correctamentea",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick
            },
            token
        });
    } catch (error) {
        return res.status(500).send({ status: "error", message: "Error en el servidor" });
    }
};

const profile = (req, res) => {
    //Recibir parametrso del id de usuario por una url
    const id = req.params.id;

    //Consulta para sacra los datos del usuario
    User.findById(id)
    .select({password: 0, rol: 0})
    .exec()
     .then(userProfile => {
        if(!userProfile){
            return res.status(404).send({
                status: "error",
                message: "El usuario no existe"
            });
        }

        //Devolver el resultado 
        return res.status(200).send({
            status: "success",
            user: userProfile
        });

    })
    .catch(error => {
        return res.status(500).send({
            status: "error",
            message: "Hubo un error al procesar la solicitud"
        });
    }); 

}

/*const list = (req, res) => {

    //Controlar en pagina estamos
    let page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    page = parseInt(page);

    //Consulta con mongoose paginate
    let itemsPerPage = 5;

    User.find()
        .sort('_id')
        .paginate(page, itemsPerPage)
        .then((users, total) => {
        if(!users){
            return res.status(404).send({
                status: "error",
                message: "No hay usuarios disponibles",
            });
        }
        //Devolver el resultado(follows)
            return res.status(200).send({
                status: "success",
                users,
                page,
                itemsPerPage,
                total,
                pages: Math.ceil(total/itemsPerPage)
            });

        })
    .catch(error =>{
        return res.status(404).send({
            status: "error",
            message: "Error al procesar la peticion"
        });
    })

    
}*/
const list = async (req, res) => {
    // Controlar en qué página estamos
    let page = 1;
    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    // Cantidad de usuarios por página
    const itemsPerPage = 5;

    try {
        // Contar el total de usuarios
        const total = await User.countDocuments();

        // Consulta con Mongoose paginate
        const users = await User.find()
            .sort('_id')
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        if (!users || users.length === 0) {
            return res.status(404).send({
                status: "error",
                message: "No hay usuarios disponibles",
            });
        }

        // Devolver el resultado
        return res.status(200).send({
            status: "success",
            users,
            page,
            itemsPerPage,
            total,
            pages: Math.ceil(total / itemsPerPage)
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al procesar la petición"
        });
    }
};



//Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list

};
