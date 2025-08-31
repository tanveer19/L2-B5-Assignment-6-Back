// src/app/modules/transaction/transaction.model.ts
import { Schema, model, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  type: "SEND" | "DEPOSIT" | "WITHDRAW";
  from?: Types.ObjectId;
  to?: Types.ObjectId;
  amount: number;
  timestamp: Date;
  createdAt: Date; // ✅ Add this (added by timestamps: true)
  updatedAt: Date; // ✅ Add this (added by timestamps: true)
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
      ref: "Wallet",
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
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
  { timestamps: true } // This adds createdAt and updatedAt automatically
);

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
