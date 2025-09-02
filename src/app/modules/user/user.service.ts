import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "../transaction/transaction.model";
import mongoose from "mongoose";

const createUser = async (payload: Partial<IUser>) => {
  // ✅ ADD DEBUG LOGGING HERE
  console.log("🔍 [Service] Received payload:", payload);
  console.log("🔍 [Service] Payload keys:", Object.keys(payload));

  const { phone, password, email, role, ...rest } = payload;

  console.log("🔍 [Service] Extracted values:", {
    phone,
    password,
    role,
    email,
  });

  if (!phone || !password || !role) {
    console.log("❌ [Service] Missing fields:", {
      hasPhone: !!phone,
      hasPassword: !!password,
      hasRole: !!role,
      fullPayload: payload,
    });

    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Phone, password, and role are required"
    );
  }

  // ✅ Validate role with better error message
  if (![Role.USER, Role.AGENT].includes(role)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Role must be either "${Role.USER}" or "${Role.AGENT}". Received: "${role}"`
    );
  }

  // ... rest of your code

  // ✅ Only USER or AGENT allowed
  if (![Role.USER, Role.AGENT].includes(role)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only USER or AGENT role can register via API"
    );
  }

  const existingUser = await User.findOne({ phone });

  if (existingUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User with phone already exists"
    );
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email ? email : phone,
  };

  const user = await User.create({
    phone,
    role,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  // ✅ Create wallet with initial balance ৳50
  const wallet = await Wallet.create({ user: user._id, balance: 50 });
  user.wallet = wallet._id as mongoose.Types.ObjectId;
  await user.save();

  // ✅ Optional: Log top-up transaction
  await Transaction.create({
    type: "DEPOSIT",
    to: user._id,
    amount: 50,
  });

  const createdUser = await User.findById(user._id).populate("wallet");
  return createdUser;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(httpStatus.FORBIDDEN, "you are not authorized");
    }
    if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "you are not authorized");
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(httpStatus.FORBIDDEN, "you are not authorized");
    }
  }

  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      envVars.BCRYPT_SALT_ROUND
    );
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

const getAllUsers = async () => {
  const users = await User.find({}).populate({
    path: "wallet",
    select: "balance createdAt updatedAt", // show what you need
  });

  const totalUsers = await User.countDocuments();

  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};
const getUserById = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return user;
};
const updateUserStatus = async (
  userId: string,
  status: "ACTIVE" | "BLOCKED"
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: status },
    { new: true }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
export const UserServices = {
  createUser,
  getAllUsers,
  updateUser,
  getUserById,
  updateUserStatus,
};
