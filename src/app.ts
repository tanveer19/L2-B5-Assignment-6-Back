import cookieParser from "cookie-parser";
import { envVars } from "./app/config/env";
import express, { Request, Response } from "express";
import expressSession from "express-session";
import cors from "cors";
import { UserRoutes } from "./app/modules/user/user.route";
import { AuthRoutes } from "./app/modules/auth/auth.route";
import { WalletRoutes } from "./app/modules/wallet/wallet.route";
import { AgentRoutes } from "./app/modules/agent/agent.route";
import { AdminRoutes } from "./app/modules/admin/admin.route";

const app = express();

app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(
  cors({
    origin: envVars.FRONTEND_URL,
    credentials: true, // optional if you’re sending cookies or auth headers
  })
);

app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/wallet", WalletRoutes);
app.use("/api/v1/agent", AgentRoutes);
app.use("/api/v1/admin", AdminRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Digital Wallet it is",
  });
});

export default app;
