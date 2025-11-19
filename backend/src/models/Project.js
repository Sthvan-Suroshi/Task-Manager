import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: String },
});

const columnSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  tasks: [taskSchema],
});

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    columns: [columnSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
