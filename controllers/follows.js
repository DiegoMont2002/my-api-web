//Importar modelos
const Follow = require("../models/follow");
const User = require("../models/user");


//Acciones de prueba
const pruebaFollow = (req, res) =>{
    
    return res.status(200).send({
        message: "MEnsaje enviado desde: comtrollers/folows.js"
    });
}

//Accion de guardar un follow (accion de seguir)
const save = async (req, res) =>{
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

    if(!followStored){
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

        if(!followDeleted){
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


module.exports = {
    pruebaFollow,
    save,
    unfollow
}