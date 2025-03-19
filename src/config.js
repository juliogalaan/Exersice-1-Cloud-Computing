const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/Login")

// check database connected or not

//Create a schema
const loginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

//Collection part
const collection = new mongoose.model("users", loginSchema)

module.exports =collection;