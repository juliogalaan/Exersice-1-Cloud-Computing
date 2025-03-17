const express = require('express');
const pasth = require('path');
const bcrypt = require('bcrypt');
const collection=require("./config");

const app = express();

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
app.post("/login", async (req, res)=>{
try{
    const check = await collection.findOne({name: data.username});
    if(!check){
        res.send("user cannot be found")
    }
    //compare the hash password from the database with the plain text
    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
    if(isPasswordMatch){
        res.render("home");
    }else{
        req.send("wrong password")
    }

}catch{
    //res.render("home");
    res.send("wrong detail")

}
})








const port = 5000;
app.listen(port, ()=>{
    console.log(`Server running on Port: ${port}`)
})