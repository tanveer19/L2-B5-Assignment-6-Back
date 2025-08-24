import { Schema, model, Types, Document } from "mongoose";

export interface IWallet extends Document {
  balance: number;
  user: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    balance: {
      type: Number,
      default: 0,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Wallet = model<IWallet>("Wallet", walletSchema);
