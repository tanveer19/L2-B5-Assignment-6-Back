import { Router } from "express";
import { AdminController } from "./admin.controller";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.get("/users", checkAuth("ADMIN"), AdminController.getAllUsers);
router.get("/agents", checkAuth("ADMIN"), AdminController.getAllAgents);
router.get("/wallets", checkAuth("ADMIN"), AdminController.getAllWallets);
router.get(
  "/transactions",
  checkAuth("ADMIN"),
  AdminController.getAllTransactions
);

router.patch(
  "/wallets/:walletId/block",
  checkAuth("ADMIN"),
  AdminController.blockWallet
);
router.patch(
  "/wallets/:walletId/unblock",
  checkAuth("ADMIN"),
  AdminController.unblockWallet
);

router.patch(
  "/agents/:agentId/approve",
  checkAuth("ADMIN"),
  AdminController.approveAgent
);
router.patch(
  "/agents/:agentId/suspend",
  checkAuth("ADMIN"),
  AdminController.suspendAgent
);

export const AdminRoutes = router;
