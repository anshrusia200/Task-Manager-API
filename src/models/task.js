const mongoose = require("mongoose");
const validator = require("validator");

const taskSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    taskId: { type: String, required: true },
    title: { type: String, required: true },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    status: {
      type: String,
      default: "Not Started",
      required: true,
    },
    progress: { type: Number, required: true },
    createdDate: { type: String, required: true },
    dueDate: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
