const mongoose = require("mongoose");

// Usar variables de entorno para mayor flexibilidad
const username = process.env.MONGO_INITDB_ROOT_USERNAME || 'username';
const password = process.env.MONGO_INITDB_ROOT_PASSWORD || 'password';

// Nombre del host del servicio expuesto por el deployment de MongoDB (debe coincidir con el `metadata.name` del Service)
const host = 'mongodb';
const port = '27017';
const dbname = 'Login';

const uri = `mongodb://${username}:${password}@${host}:${port}/${dbname}?authSource=admin`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Conectado a MongoDB');
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err);
  });

// Esquema simple para ejemplo
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

// Exporta la colección
const collection = new mongoose.model("users", loginSchema);

module.exports = collection;
