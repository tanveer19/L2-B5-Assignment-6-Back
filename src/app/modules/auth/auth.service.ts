import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";

const findUserByPhone = async (phone: string) => {
  return await User.findOne({ phone });
};

const comparePasswords = async (inputPassword: string, storedHash: string) => {
  return await bcryptjs.compare(inputPassword, storedHash);
};

const getNewAccessToken = async (refreshToken: string) => {
  const { accessToken } = await createNewAccessTokenWithRefreshToken(
    refreshToken
  );

  return {
    accessToken, // just a string now
    refreshToken, // optionally include this if needed elsewhere
  };
};
const resetPassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user!.password as string
  );

  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "old password does not match");
  }

  user!.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  user!.save();
};

export const AuthServices = {
  findUserByPhone,
  comparePasswords,
  getNewAccessToken,
  resetPassword,
};
