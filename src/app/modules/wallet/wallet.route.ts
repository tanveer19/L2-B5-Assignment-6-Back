import { Router } from "express";
import { WalletController } from "./wallet.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

// All users with 'USER' or 'AGENT' role can use wallet functions
router.post(
  "/add-money",
  checkAuth(Role.USER, Role.AGENT),
  WalletController.addMoney
);

router.post(
  "/withdraw",
  checkAuth(Role.USER, Role.AGENT),
  WalletController.withdrawMoney
);

router.post(
  "/send",
  checkAuth(Role.USER, Role.AGENT),
  WalletController.sendMoney
);

router.get(
  "/transactions",
  checkAuth(Role.USER, Role.AGENT),
  WalletController.getTransactionHistory
);

router.get("/me", checkAuth(Role.USER, Role.AGENT), WalletController.getWallet);

export const WalletRoutes = router;
