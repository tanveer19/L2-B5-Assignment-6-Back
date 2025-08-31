import { model, Schema, Types, Document } from "mongoose";
import { IAuthProvider, IsActive, Role } from "./agent.interface";

export interface IUser extends Document {
  name: string;
  email?: string;
  password: string;
  role: Role;
  phone: string;
  picture?: string;
  address?: string;
  isDeleted: boolean;
  isActive: IsActive;
  isVerified: boolean;
  auths: IAuthProvider[];
  wallet?: Types.ObjectId; // or populated Wallet type
  createdAt?: Date;
  updatedAt?: Date;
}

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: false },
    providerId: { type: String, required: false },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    phone: { type: String, required: true, unique: true },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    auths: [authProviderSchema],
    wallet: { type: Schema.Types.ObjectId, ref: "Wallet" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", userSchema);
