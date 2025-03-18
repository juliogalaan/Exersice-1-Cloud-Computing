const express = require('express');
const pasth = require('path');
const bcrypt = require('bcrypt');
const bcrypt2 = require('bcryptjs');
const collection=require("./config");

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

app.get("/todo", async (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/"); // Redirigir si no está logueado
    }

    const user = await collection.findById(req.session.userId);
    res.render("index", { tasks: user.tasks });
});

//agregar tareas 
app.post("/add", async (req, res) => {
    if (!req.session.userId) return res.redirect("/");

    const user = await collection.findById(req.session.userId);
    user.tasks.push({ text: req.body.task });
    await user.save();

    res.redirect("/todo");
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