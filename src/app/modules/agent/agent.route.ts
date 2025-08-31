import express from "express";
import { AgentController } from "./agent.controller";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";

const router = express.Router();

router.post("/cash-in", checkAuth(Role.AGENT), AgentController.cashIn);
router.post("/cash-out", checkAuth(Role.AGENT), AgentController.cashOut);
router.get("/summary", checkAuth(Role.AGENT), AgentController.getAgentSummary);
router.get(
  "/activity",
  checkAuth(Role.AGENT),
  AgentController.getAgentActivity
);
export const AgentRoutes = router;
