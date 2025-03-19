const express = require('express');
const bcrypt = require('bcrypt');
const collection=require("./config");
const Task = require('./taskModel');
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");

app.use(session({
    secret: "tuClaveSecreta",  // Clave secreta para firmar la cookie de sesión
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/Login', //conexion a la base de datos
        collectionName: "sessions"
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 día por ejemplo
}));


//Convert data into json format
app.use(express.json());

app.use(express.urlencoded({extended: false}));

app.use(express.static('public'));


//render things and endpoints
app.set('view engine','ejs' )

app.get("/", (req, res)=> {
    res.render("login")
});
app.get("/login", (req, res) => {
    res.render("login"); 
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
    //hash de password unsing bcrypt
    const saltRounds =10; //number of salt rounds for bcrypy
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    data.password = hashedPassword //replace the hash password with the original password


    const userData = await collection.insertMany(data);
    res.redirect("/login");
  //  console.log(userData)

}  
})

//login
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await collection.findOne({ name: username });

        if (!user) {
            return res.send("Usuario no encontrado");
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.send("Contraseña incorrecta");
        }

        // Guardar el ID del usuario en la sesión
        req.session.userId = user._id;

        console.log("Sesión después de asignar userId:", req.session);

        // 🔹 Obtener las tareas del usuario desde la colección "tasks"
        const tasks = await Task.find({ userId: user._id });

        // Redirigir al To-Do List con las tareas cargadas
        res.render("home", { tasks });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).send("Error en el servidor.");
    }
});





// PARTE TODO LIST 
app.get("/home", async (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    try {
        // Convertir userId en un ObjectId válido
        const userId = new mongoose.Types.ObjectId(req.session.userId);

        // Obtener las tareas del usuario desde MongoDB
        const tasks = await Task.find({ userId });

        // Mostrar las tareas en la vista
        res.render("home", { tasks });
    } catch (error) {
        console.error("Error al obtener tareas:", error);
        res.status(500).send("Error al obtener tareas");
    }
});

// Agregar tareas
app.post("/add", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send("No autorizado");
    }

    try {
        // Crear y guardar la nueva tarea en MongoDB
        const newTask = new Task({
            text: req.body.task,
            userId: new mongoose.Types.ObjectId(req.session.userId) // Asegura que sea un ObjectId válido
        });

        await newTask.save();

        res.redirect("/home"); // Redirige para actualizar la lista
    } catch (error) {
        console.error("Error al agregar tarea:", error);
        res.status(500).send("Error al agregar tarea");
    }
});


//eliminar tareas
app.post("/delete", async (req, res) => {
    try {
        const { taskId } = req.body;

        // Eliminar la tarea de la base de datos
        await Task.findByIdAndDelete(taskId);

        // Redirigir nuevamente a /home
        res.redirect("/home");
    } catch (error) {
        console.error("Error al eliminar tarea:", error);
        res.status(500).send("Error al eliminar tarea");
    }
});

app.post("/complete", async (req, res) => {
    try {
        const { taskId } = req.body;

        // Buscar la tarea y cambiar su estado (de true a false y viceversa)
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).send("Tarea no encontrada");
        }

        task.completed = !task.completed; // Cambia el estado de completado
        await task.save();

        // Redirigir nuevamente a /home
        res.redirect("/home");
    } catch (error) {
        console.error("Error al actualizar la tarea:", error);
        res.status(500).send("Error al actualizar la tarea");
    }
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