//Importar modulos
const fs = require("fs");
const path = require("path");

//importar modelos
const Publication = require("../models/publication");
const followService = require("../services/followService");

//Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "MEnsaje enviado desde: comtrollers/publicaction.js"
    })
}

//Guardar publicacion 
const save = async (req, res) => {

    //Recoger datos del body
    const params = req.body;

    //Si no me llegan dar respuesta negativa
    if (!params.text) return res.status(400).send({ status: "error", message: "Debes enviar el texto de la publiacacion" });


    //Crear y rellenar el objeto del modelo 
    let newPublication = new Publication(params);
    newPublication.user = req.user.id;

    try {

        //Guardar objeto en bbdd
        const publicationStored = await newPublication.save()

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Publicación guardada",
            publicationStored
        });
    } catch (error) {
        // Manejar errores
        return res.status(400).send({ status: "error", message: "No se ha guardado la publicación" });
    }
};


//Sacar una publicacion 
const detail = (req, res) => {
    // Sacar id de la publicacion de la URL
    const publicationId = req.params.id;

    // Utilizar Promesa para encontrar la publicación por su ID
    Publication.findById(publicationId)
        .then(publicationStored => {
            if (!publicationStored) {
                return res.status(404).send({
                    status: "error",
                    message: "No existe la publicacion"
                });
            }

            // Devolver respuesta
            return res.status(200).send({
                status: "success",
                message: "Mostrar publicacion",
                publication: publicationStored
            });
        })
        .catch(error => {
            // Manejar errores
            return res.status(500).send({
                status: "error",
                message: "Error al buscar la publicacion"
            });
        });
};


//Eliminar publicaciones
const remove = async (req, res) => {
    try {
        // Sacar el id de la publicacion a eliminar
        const publicacionId = req.params.id;

        // Eliminar la publicacion
        const result = await Publication.deleteOne({ _id: publicacionId, user: req.user.id });

        // Verificar si se eliminó correctamente
        if (result.deletedCount === 0) {
            return res.status(404).send({
                status: "error",
                message: "La publicación no fue encontrada o no tienes permisos para eliminarla."
            });
        }

        // Devolver respuesta de éxito
        return res.status(200).send({
            status: "success",
            message: "Publicación eliminada exitosamente",
            publicationId: publicacionId
        });
    } catch (error) {
        // Manejar cualquier error
        return res.status(500).send({
            status: "error",
            message: "Error al intentar eliminar la publicación",
            error: error.message
        });
    }
};


//Listar todas las publicaciones 
const user = async (req, res) => {
    try {
        // Sacar el id de un usuario
        const userId = req.params.id;

        // Controlar la página
        let page = 1;
        if (req.params.page) page = parseInt(req.params.page);

        const itemsPerPage = 5;

        // Utilizar await para esperar la ejecución de la consulta
        const countPromise = Publication.countDocuments({ "user": userId }).exec();
        const publicationsPromise = Publication.find({ "user": userId })
            .sort("-created_at")
            .populate('user', '-password -__v -role -rol -email')
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .exec();

        const [total, publications] = await Promise.all([countPromise, publicationsPromise]);

        // Devolver respuesta de éxito
        return res.status(200).send({
            status: "success",
            message: "Publicaciones del perfil de un usuario",
            page,
            total,
            pages: Math.ceil(total / itemsPerPage),
            publications,
        });
    } catch (error) {
        // Manejar errores
        return res.status(500).send({
            status: "error",
            message: "Error al obtener las publicaciones del usuario",
            error: error.message
        });
    }
}

//Subir ficheros
const upload = async (req, res) => {
    try {
        //Sacar publication id 
        const publicationId = req.params.id

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
        const publicationUpdate = await Publication.findByIdAndUpdate({ "user": req.user.id, "_id": publicationId }, { file: req.file.filename }, { new: true });

        if (!publicationUpdate) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida del avatar"
            });
        }

        // Devolver respuesta    
        return res.status(200).send({
            status: "success",
            publication: publicationUpdate,
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

//Devolver archivos multimendia
const media = (req, res) => {
    //Sacar el parametro de la url
    const file = req.params.file;

    //Montar un path real para la imagen 
    const filePath = "./uploads/publications/" + file;

    //Comprobar que existe
    fs.stat(filePath, (error, exist) => {
        if (!exist) {
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"
            });
        }

        //Devolver un file
        return res.sendFile(path.resolve(filePath))
    });


}

//Listar publicaciones de un usuario(feed)
const feed = async (req, res) => {
    try {
        //Sacar la pagina actual
        let page = 1;

        if (req.params.page) {
            page = parseInt(req.params.page);
        }

        //Establecer numero de elementos por pagina
        let itemsPerPage = 5;

        //Sacar un array de identificadores de usuarios que yo sigo como un usuario logeado

        const myFollows = await followService.followUserIds(req.user.id);

        //Find a publicaciones in, ordenar, popular, paginar
        const publications = await Publication.find({ user: { $in: myFollows.following } })
            .populate("user", "-password -role -rol -__v -email")
            .sort("-created_at")
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const total = await Publication.countDocuments({user: { $in: myFollows.following }});

        if(!publications){
            return res.status(500).send({
                status: "error",
                message: "No hay publicaciones para mostrar"
            })
        }

    return res.status(200).send({
        status: "success",
        message: "Feed de publicaciones",
        following: myFollows.following,
        total,
        page,
        pages: Math.ceil(total / itemsPerPage),
        publications
    });


} catch (error) {
    return res.status(500).send({
        status: "error",
        message: "No se han listado las publicacciones del feed"
    })

}


}


//Exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed

}