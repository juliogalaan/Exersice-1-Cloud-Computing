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
        ref: "users"
    },
    completed: {
        type: Boolean,
        default: false // Por defecto, la tarea no está completada
    }
});

const Task = mongoose.model("tasks", taskSchema);

module.exports = Task;
