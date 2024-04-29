
// Importar dependencias y modulos 
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path")
const User = require("../models/user")

//Importar servicios
const jwt = require("../services/jwt");
const followService = require("../services/followService");
const { following } = require("./follows");

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
        .select({ password: 0, role: 0 })
        .exec()
        .then(async (userProfile) => {
            if (!userProfile) {
                return res.status(404).send({
                    status: "error",
                    message: "El usuario no existe"
                });
            }

            //Info de seguimiento
            const followInfo = await followService.followThisUser(req.user.id, id);

            //Devolver el resultado 
            return res.status(200).send({
                status: "success",
                user: userProfile,
                following: followInfo.following,
                follower: followInfo.follower
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

        //Sacra un array de los ids de los usuarios que me siguen y los que sigo
        let followUserIds = await followService.followUserIds(req.user.id);

        // Devolver el resultado
        return res.status(200).send({
            status: "success",
            users,
            page,
            itemsPerPage,
            total,
            pages: Math.ceil(total / itemsPerPage),
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al procesar la petición"
        });
    }
};

const update = async (req, res) => {
    try {
        // Recoger info del usuario a actualizar
        let userIdentity = req.user;
        let userToUpdate = req.body;

        delete userToUpdate.iat;
        delete userToUpdate.exp;
        delete userToUpdate.image;
        delete userToUpdate.role;

        // Comprobar si el usuario existe
        const users = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() }
            ]
        });

        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true;
        });

        if (userIsset) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
        }

        // Cifrar la password
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        }

        // Buscar y actualizar
        const userUpdate = await User.findByIdAndUpdate({_id: userIdentity.id}, userToUpdate, { new: true });

        if (!userUpdate) {
            return res.status(404).json({ status: "error", message: "Error en la consulta de usuarios" });
        }

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Método de actualización de usuario",
            user: userUpdate
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al actualizar el usuario",
            error: error.message
        });
    }
};

const upload = async (req, res) => {
    try {
        // Recoger el fichero de imagen y comprobar si existe
        if (!req.file) {
            return res.status(404).send({
                status: "error",
                message: "La petición no incluye la imagen"
            });
        }

        // Conseguir el nombre del archivo
        let image = req.file.originalname;

        // Sacar la extensión del archivo
        const imageSplit = image.split(".");
        const extension = imageSplit[1];

        // Comprobar la extensión 
        if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {
            // Borrar archivo subido
            const filePath = req.file.path;
            const fileDeleted = fs.unlinkSync(filePath);

            // Devolver respuesta negativa
            return res.status(400).json({
                status: "error",
                message: "Extensión del fichero inválida"
            });
        }

        // Si la extensión es correcta, guardar la imagen en la base de datos
        const userUpdate = await User.findByIdAndUpdate({_id:req.user.id}, { image: req.file.filename }, { new: true });

        if (!userUpdate) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida del avatar"
            });
        }

        // Devolver respuesta    
        return res.status(200).send({
            status: "success",
            user: userUpdate,
            file: req.file
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en la subida del avatar",
            error: error.message
        });
    }
};

const avatar = (req, res) => {
    //Sacar el parametro de la url
    const file = req.params.file;

    //Montar un path real para la imagen 
    const filePath = "./uploads/avatars/"+file;

    //Comprobar que existe
    fs.stat(filePath, (error, exist) => {
        if(!exist){ 
            return res.status(404).send({
                status: "error", 
                message: "No existe la imagen"
            });
        }

        //Devolver un file
        return res.sendFile(path.resolve(filePath))
    });

    
}

//Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar

};
