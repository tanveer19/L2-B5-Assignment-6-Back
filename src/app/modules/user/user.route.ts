import { UserControllers } from "./user.controller";
import { updateUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { Router } from "express";

const router = Router();

router.post(
  "/register",
  validateRequest(updateUserZodSchema),
  UserControllers.createUser
);

router.get(
  "/all-users",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.getAllUsers
);

router.patch(
  "/:id",

  validateRequest(updateUserZodSchema),

  checkAuth(...Object.values(Role)),
  UserControllers.updateUser
);

export const UserRoutes = router;
