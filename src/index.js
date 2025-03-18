const express = require('express');
const pasth = require('path');
const bcrypt = require('bcrypt');
const bcrypt2 = require('bcryptjs');
const collection=require("./config");
const Task = require('./taskModel'); // Asegúrate de requerir el modelo de Task
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo");

app.use(session({
    secret: "tuClaveSecreta",  // Cambia esto por una clave segura
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/Login', // Tu conexión a MongoDB
        collectionName: "sessions"
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 día
}));


//Convert data into json format
app.use(express.json());

app.use(express.urlencoded({extended: false}));

app.use(express.static('public'));


app.set('view engine','ejs' )

app.get("/", (req, res)=> {
    res.render("login")
});

app.get("/signup", (req,res)=>{
    res.render("signup")
});

//Register user
app.post("/signup", async (req, res)=>{
    const data={
        name:req.body.username,
        password:req.body.password
    }

//Check if the user already exist
const existingUser= await collection.findOne({name: data.name});

if(existingUser){
    res.send("User already exists. Please choose a different username")
}else{
    res.send("User created")
    //hash de password unsing bcrypt
    const saltRounds =10; //number of salt rounds for bcrypy
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    data.password = hashedPassword //replace the hash password with the original password


    const userData = await collection.insertMany(data);
    console.log(userData)

}  
})


//Login User
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await collection.findOne({ name: username });

        if (!user) {
            return res.send("Usuario no encontrado");
        }
        // Asegúrate de que tasks sea un array vacío si no existe
        if (!user.tasks) {
            user.tasks = [];
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.send("Contraseña incorrecta");
        }

        // Guardar el ID del usuario en la sesión
        req.session.userId = user._id; 

        console.log("Sesión después de asignar userId:", req.session);

        // Redirigir al To-Do List (home.ejs)
        res.render("home", { tasks: user.tasks });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).send("Error en el servidor.");
    }
});




// PARTE TODO LIST 

app.get("/home", async (req, res) => {
    try {
        // Obtener todas las tareas del usuario
        const tasks = await Task.find({ userId: req.session.userId });

        // Renderizar la vista "home.ejs" con las tareas del usuario
        res.render("home", { tasks: tasks });
    } catch (error) {
        console.error("Error al obtener tareas:", error);
        res.status(500).send("Error al obtener tareas");
    }
});



//agregar tareas 
app.post("/add", async (req, res) => {
    try {
        // Obtén el usuario de la base de datos usando el userId almacenado en la sesión
        const user = await collection.findOne({ _id: req.session.userId });

        if (!user) {
            return res.status(404).send("Usuario no encontrado");
        }

        // Crear una nueva tarea
        const newTask = new Task({
            text: req.body.task,
            userId: req.session.userId // Asocia la tarea al usuario
        });

        // Guardar la nueva tarea en la base de datos
        await newTask.save();

        // Redirigir al usuario a la página de inicio con las tareas actualizadas
        res.redirect("/home"); //CUIDADO
    } catch (error) {
        console.error("Error al agregar tarea:", error);
        res.status(500).send("Error al agregar tarea");
    }
});

//eliminar tareas
app.post("/delete", async (req, res) => {
    if (!req.session.userId) return res.redirect("/");

    const user = await collection.findById(req.session.userId);
    user.tasks = user.tasks.filter(task => task._id.toString() !== req.body.taskId);
    await user.save();

    res.redirect("/todo");
});

 
// Cerrar sesion

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});






const port = 5000;
app.listen(port, ()=>{
    console.log(`Server running on Port: ${port}`)
})