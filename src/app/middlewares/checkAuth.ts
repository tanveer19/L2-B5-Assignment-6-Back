import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes";
import { IsActive } from "../modules/user/user.interface";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Get token from Authorization header
      const authHeader = req.headers.authorization || "";
      let accessToken = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      // 2. If no token in header, check cookies
      if (!accessToken && req.cookies?.accessToken) {
        accessToken = req.cookies.accessToken;
      }

      if (!accessToken) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or missing token");
      }

      // 3. Verify token
      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      // 4. Check user in DB
      const isUserExist = await User.findById(verifiedToken.userId);

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
      }

      if (
        isUserExist.isActive === IsActive.BLOCKED ||
        isUserExist.isActive === IsActive.INACTIVE
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExist.isActive}`
        );
      }

      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
      }

      // 5. Check role
      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You are not permitted to view this route"
        );
      }

      // 6. Attach user to req
      req.user = verifiedToken;
      next();
    } catch (error) {
      console.error("JWT Error:", error);
      next(new AppError(httpStatus.UNAUTHORIZED, "Unauthorized"));
    }
  };
