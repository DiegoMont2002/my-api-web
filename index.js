/*// importar dependencias 
const {connection} = require("./database/connection");
const express = require("express");
const cors = require("cors");

// mensaje de bievenida
console.log("API NODE para MI RED SOCIAL ARRANCADA !!");

// conexion a la base de datos 
connection();

// crear servidor node 
const app = express();
const puerto = 4000;

// configurar cors
app.use(cors());

// convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlenconded({extends: true}));

// cargar configuracion rutas
const UserRoutes = require("./routes/user");
const PublicationRoute = require("./routes/publication");
const FollowRoute = require("./routes/follow");

app.use("/api", UserRoutes);
app.use("/api", PublicationRoute);
app.use("/api", FollowRoute);

//ruta de prueba
app.get("/ruta-prueba", (req, res) => {
    return res.status(200).json(
        {
            "id": 1,
            "nombre": "hotel",
            "direccion": "periferico norte",

        }
    );
})

// poner servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log("El servidor de node correindo en el puerto: ", puerto);
})*/



// importar dependencias 

const {connection} = require("./database/connection");
const express = require("express");
const cors = require("cors");


// mensaje de bievenida
console.log("API NODE para MI RED SOCIAL ARRANCADA !!");




// conexion a la base de datos 
connection();



// crear servidor node
const port = process.env.PORT || 4000; 
const app = express();
const puerto = 4000;

app.set("port", process.env.PORT || 4000);


  

// configurar cors
app.use(cors());

// convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extends: true}));

// cargar configuracion rutas
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");


app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);


//ruta de prueba
app.get("/ruta-prueba", (req, res) => {
    return res.status(200).json(
        {
            "id": 1,
            "nombre": "hotel",
            "direccion": "periferico norte",

        }
    );
})

// poner servidor a escuchar peticiones http
app.listen(app.get("port"), () => {
    console.log("Escuchando en el port:" + app.get("port"));
});


