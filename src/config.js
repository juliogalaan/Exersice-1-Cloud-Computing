const mongoose = require("mongoose");
//const connect = mongoose.connect("mongodb://localhost:27017/Login")
const uri = process.env.MONGO_URI || 'mongodb://myuser:mypassword@mongodb:27017/Login?authSource=admin';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin', // importante cuando usas MONGO_INITDB_ROOT_*
}).then(() => {
  console.log('✅ Conectado a MongoDB');
}).catch((err) => {
  console.error('❌ Error al conectar a MongoDB:', err);
});
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