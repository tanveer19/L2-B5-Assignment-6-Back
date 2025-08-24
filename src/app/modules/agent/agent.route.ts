import express from "express";
import { AgentController } from "./agent.controller";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";

const router = express.Router();

router.post("/cash-in", checkAuth(Role.AGENT), AgentController.cashIn);
router.post("/cash-out", checkAuth(Role.AGENT), AgentController.cashOut);

export const AgentRoutes = router;
