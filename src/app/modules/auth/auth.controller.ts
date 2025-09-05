import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";
import { createUserTokens } from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { IUser } from "../user/user.interface";
import { envVars } from "../../config/env";

const credentialsLogin = catchAsync(async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  // Basic input validation
  if (!phone || !password) {
    throw new AppError(400, "Phone number and password are required");
  }

  // Find user by phone number
  const user = await AuthServices.findUserByPhone(phone);
  if (!user) {
    throw new AppError(401, "User not found");
  }
  // Ensure password field is available
  if (!user.password) {
    throw new AppError(500, "User password is missing");
  }

  // Check if password matches
  const isMatch = await AuthServices.comparePasswords(password, user.password);
  if (!isMatch) {
    throw new AppError(401, "Invalid credentials");
  }

  // Generate access + refresh tokens
  const userTokens = await createUserTokens(user.toObject() as IUser);

  // Remove password from response
  const { password: _, ...rest } = user.toObject();

  // Set cookies
  setAuthCookie(res, userTokens);

  // Send success response
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: {
      accessToken: userTokens.accessToken,
      refreshToken: userTokens.refreshToken,
      user: rest,
    },
  });
});

const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received");
  }
  const tokenInfo = await AuthServices.getNewAccessToken(
    refreshToken as string
  );

  setAuthCookie(res, tokenInfo);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "new access token retrieved successfully",
    data: tokenInfo,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const isProd = envVars.NODE_ENV === "production";

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Logged out successfully",
    data: null,
  });
});
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;
  const decodedToken = req.user;

  await AuthServices.resetPassword(
    oldPassword,
    newPassword,
    decodedToken as JwtPayload
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "password changed successfully",
    data: null,
  });
});

export const AuthControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPassword,
};
