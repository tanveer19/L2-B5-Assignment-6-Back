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
      secure: envVars.NODE_ENV === "production", // false in dev
      sameSite: envVars.NODE_ENV === "production" ? "none" : "lax", // "lax" works for localhost
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
  }
};
