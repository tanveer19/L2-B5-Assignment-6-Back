import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { User } from "./user.model";
import AppError from "../../errorHelpers/AppError";
import { Role } from "./user.interface";
import { envVars } from "../../config/env";
import bcryptjs from "bcryptjs";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.createUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User created successfully",
    data: user,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;

  const verifiedToken = req.user;

  const payload = req.body;
  const user = await UserServices.updateUser(
    userId,
    payload,
    verifiedToken as JwtPayload
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User updated successfully",
    data: user,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsers();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "All users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});
const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId; // from checkAuth
  const user = await UserServices.getUserById(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User info retrieved",
    data: user,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId; // Get user ID from authenticated token
  const payload = req.body;

  console.log("Updating profile for user:", userId);
  console.log("Update payload:", payload);

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Only update fields that are provided
  const updateData: any = {};

  if (payload.name !== undefined && payload.name !== "") {
    updateData.name = payload.name;
  }

  if (payload.phone !== undefined && payload.phone !== "") {
    updateData.phone = payload.phone;
  }

  if (payload.email !== undefined && payload.email !== "") {
    updateData.email = payload.email;
  }

  if (payload.password) {
    updateData.password = await bcryptjs.hash(
      payload.password,
      Number(envVars.BCRYPT_SALT_ROUND)
    );
  }

  // Check if there's anything to update
  if (Object.keys(updateData).length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "No valid fields to update");
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});
export const UserControllers = {
  createUser,
  getAllUsers,
  updateUser,
  updateProfile,
  getMe,
};

// route matching > controller > service > model > DB
