import { Router } from "express";
import { WalletController } from "./wallet.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

// Get logged-in user's wallet
router.get("/my", checkAuth(Role.USER, Role.AGENT), WalletController.getWallet);

// Add money to wallet
router.post(
  "/deposit",
  checkAuth(Role.USER, Role.AGENT),
  WalletController.addMoney
);

// Withdraw money from wallet
router.post(
  "/withdraw",
  checkAuth(Role.USER, Role.AGENT),
  WalletController.withdrawMoney
);

// Send money to another user
router.post(
  "/send",
  checkAuth(Role.USER, Role.AGENT),
  WalletController.sendMoney
);

// Get logged-in user's transaction history
router.get(
  "/transactions",
  checkAuth(Role.USER, Role.AGENT),
  WalletController.getTransactionHistory
);

export const WalletRoutes = router;
