// transaction.model.ts
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["SEND", "ADD", "WITHDRAW"],
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // THIS MUST MATCH your User model name
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // SAME HERE
    },
    amount: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
