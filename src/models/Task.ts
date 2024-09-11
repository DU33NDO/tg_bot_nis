import mongoose from "mongoose";

const taskScheme = new mongoose.Schema({
    creator_id: { type: Number, required: true },
    description: { type: String, required: true },
    solution: { type: String, required: true },
    explanation: { type: String, required: true },
    grade: { type: Number, required: false },
    razdel: { type: String, required: false },
    difficulty: { type: String, required: false },
    name: { type: String },
    school_work: { type: String }
});

const Task = mongoose.model("Task", taskScheme);

export default Task;