//Importar modelos y dependencias
const Follow = require("../models/follow");
const User = require("../models/user");
const mongoosePaginate = require("mongoose-pagination");

//Importar servicio
const followService = require("../services/followService")


//Acciones de prueba
const pruebaFollow = (req, res) => {

    return res.status(200).send({
        message: "MEnsaje enviado desde: comtrollers/folows.js"
    });
}

//Accion de guardar un follow (accion de seguir)
const save = async (req, res) => {
    try {

        //Consegiir datos por body
        const params = req.body;


        //Sacra id del usuario identificado 
        const identity = req.user

        //Crear objeto con modelo de follow 
        let userToFollow = new Follow({
            user: identity.id,
            followed: params.followed
        });

        //Guardar objeto en bbdd
        const followStored = await userToFollow.save()

        if (!followStored) {
            return res.status(500).send({
                status: "error",
                message: "No se ha podido seguir el usuario"
            });
        }

        return res.status(200).send({
            status: "success",
            identity: req.user,
            follow: followStored
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error",
            error: error.message
        });

    }

};

//Accion de seguir un follow (accion de dejar de seguir)
const unfollow = async (req, res) => {
    try {
        //Recoger el id del usuario indentificado
        const userId = req.user.id;

        //Reciger el id del usuario que sigo y quiero dejar de seguir
        const followedId = req.params.id;

        //Find de las coincidencias y hacer remove
        const followDeleted = await Follow.findOneAndDelete({
            "user": userId,
            "followed": followedId

        });

        if (!followDeleted) {
            return res.status(500).send({
                status: "success",
                message: "Dejaste de seguir al usuario correctamente"
            });

        }
        return res.status(200).send({
            status: "success",
            message: "Follow eliminado correctamente",
            followDeleted
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al dejar de seguir el usuario"
        });

    }


};

//Accion de listado de usuarios que cualquier usuario esta seguiendo (siguiendo)
const following = async (req, res) => {
    try {
        //Sacra el id del usurio identificado
        let userId = req.user.id;

        //Comprobar si me llega el id por parametro en url
        if (req.params.id) userId = req.params.id;

        //Comprobar si me llega la pagina, si no la pagina 1
        let page = 1;

        if (req.params.page) page = req.params.page;

        //Usuarios por pagina que quiero mostrar
        const itemsPerPage = 5;

        //Find a follow, popular datos de los usuarios y paginar con mongoose paginate
        const follows = await Follow.find({ user: userId })
        .populate("user followed", "-password -rol -role -__v")
        .exec();

          // Paginar los resultados
          const total = follows.length;
          const totalPages = Math.ceil(total / itemsPerPage);
          const paginatedFollows = follows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

           //Sacra un array de los ids de los usuarios que me siguen y los que sigo
        let followUserIds = await followService.followUserIds(req.user.id);

  

        //Listado de usuarios de un seguidor
        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que estoy siguiendo",
            follows: paginatedFollows,
            total,
            totalPages,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al devolver el listado de usuarios que sigues"
        });

       

    }

}

//Accion lisrado de usuarios que me siguen a cualquier otro usuario (seguidores)
const followers = async (req, res) => {
    try {  

    //Sacra el id del usurio identificado
    let userId = req.user.id;

    //Comprobar si me llega el id por parametro en url
    if (req.params.id) userId = req.params.id;

    //Comprobar si me llega la pagina, si no la pagina 1
    let page = 1;

    if (req.params.page) page = req.params.page;

    //Usuarios por pagina que quiero mostrar
    const itemsPerPage = 5;

    const follows = await Follow.find({ followed: userId })
        .populate("user followed", "-password -rol -role -__v")
        .exec();

          // Paginar los resultados
          const total = follows.length;
          const totalPages = Math.ceil(total / itemsPerPage);
          const paginatedFollows = follows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

           //Sacra un array de los ids de los usuarios que me siguen y los que sigo
        let followUserIds = await followService.followUserIds(req.user.id);

        //Listado de usuarios de un seguidor
        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que me siguen",
            follows: paginatedFollows,
            total,
            totalPages,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al devolver el listado de usuarios que sigues"
        });

       

    }

}

//Exportar acciones
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers,
    
}