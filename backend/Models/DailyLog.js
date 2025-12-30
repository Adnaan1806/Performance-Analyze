import mongoose from "mongoose";

const dailyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tasks: { type: String, required: true, trim: true },

    learnings: { type: String, required: true, trim: true },

    challenges: { type: String, required: true, trim: true },

    logDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    managerFeedback: { type: String, trim: true, default: "" },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("DailyLog", dailyLogSchema);
