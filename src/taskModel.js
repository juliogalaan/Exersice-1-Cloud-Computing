const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Referencia al usuario
        required: true,
        ref: "users" // Esto indica que "userId" es una referencia a la colección "users"
    }
});

// Crear el modelo de la colección "tasks"
const Task = mongoose.model("tasks", taskSchema);

module.exports = Task;