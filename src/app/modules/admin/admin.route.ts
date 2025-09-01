// src/app/modules/admin/admin.route.ts
import express from "express";
import { AdminController } from "./admin.controller";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";

const router = express.Router();

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

export const AdminRoutes = router;
