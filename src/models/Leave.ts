import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  document: {
    type: String,
    required: [true, "document is required"],
  },
});

leaveSchema.index({ name: 1, department: 1, date: 1 }, { unique: true });
export const Leave = mongoose.model("Leave", leaveSchema);
