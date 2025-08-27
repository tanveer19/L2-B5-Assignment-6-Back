import { Schema, model, Document, Types } from "mongoose";

export type TransactionType = "DEPOSIT" | "WITHDRAW" | "SEND" | "RECEIVE";

export interface ITransaction extends Document {
  from?: Types.ObjectId;
  to?: Types.ObjectId;
  type: TransactionType;
  amount: number;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User" },
    to: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["DEPOSIT", "WITHDRAW", "SEND", "RECEIVE"],
      required: true,
    },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
