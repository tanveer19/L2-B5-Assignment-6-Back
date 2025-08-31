import { Types } from "mongoose";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
  AGENT = "AGENT",
}

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
  SUSPENDED = "SUSPENDED",
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email?: string;
  password?: string;
  phone?: string;
  picture?: string;
  address?: string;
  isDeleted?: boolean;
  isActive?: IsActive;
  isVerified?: boolean;
  role: Role;
  auths: IAuthProvider[];
  bookings?: Types.ObjectId[];
  guides?: Types.ObjectId[];
  wallet?: Types.ObjectId;
}
// agent.types.ts
export interface IAgentSummary {
  totalCashIn: number;
  totalCashOut: number;
  totalTransactions: number;
  totalCommission: number;
  todayCashIn: number;
  todayCashOut: number;
  todayTransactions: number;
}

export interface IAgentActivity {
  _id: string;
  type: "CASH_IN" | "CASH_OUT";
  amount: number;
  userPhone: string;
  timestamp: Date;
  status: "SUCCESS" | "PENDING" | "FAILED";
}
