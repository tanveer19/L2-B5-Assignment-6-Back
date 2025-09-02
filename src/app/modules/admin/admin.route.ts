import express from "express";
import { AdminController } from "./admin.controller";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";

const router = express.Router();

// Summary and activity
router.get(
  "/summary",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AdminController.getAdminSummary
);
router.get(
  "/activity",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AdminController.getAdminActivity
);

// User management
router.get(
  "/users",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AdminController.getAllUsers
);
router.get(
  "/users/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AdminController.getUserById
);
router.patch(
  "/users/:id/status",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AdminController.updateUserStatus
);
router.delete(
  "/users/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AdminController.deleteUser
);

export const AdminRoutes = router;
