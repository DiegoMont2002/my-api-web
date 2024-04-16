const mongoose = require("mongoose");
require("dotenv").config();

const connection = async() => {


    try{
        await mongoose.connect("mongodb://localhost:27017/mi_redsocial");

        console.log("Conectado correctamente a la bd: mi_redsocial");

    } 
    catch(error){
        console.log(error);
        throw new Error("No se ha podido conectar a ña base de datos !!");
    }

}

module.exports = {
    connection
}
