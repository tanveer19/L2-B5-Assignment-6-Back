import { Schema, model, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  type: "SEND" | "DEPOSIT" | "WITHDRAW";
  from?: Types.ObjectId; // optional if deposit
  to?: Types.ObjectId; // optional if withdraw
  amount: number;
  timestamp: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: ["SEND", "DEPOSIT", "WITHDRAW"],
      required: true,
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "Wallet", // ✅ points to Wallet
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "Wallet", // ✅ points to Wallet
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
  { timestamps: true }
);

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
