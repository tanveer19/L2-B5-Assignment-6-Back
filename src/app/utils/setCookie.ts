import { Response } from "express";
import { envVars } from "../config/env";

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}
export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  const isProd = envVars.NODE_ENV === "production";

  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
      expires: new Date(Date.now() + 15 * 60 * 1000), // explicit expiry
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // explicit expiry
    });
  }
};
