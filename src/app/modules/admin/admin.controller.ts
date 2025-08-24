import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "../transaction/transaction.model"; // Update path as needed
import AppError from "../../errorHelpers/AppError";
import { IsActive, Role } from "../user/user.interface";

// View all users
const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await User.find({ role: Role.USER });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Fetched all users",
    data: users,
  });
});

// View all agents
const getAllAgents = catchAsync(async (_req: Request, res: Response) => {
  const agents = await User.find({ role: Role.AGENT });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Fetched all agents",
    data: agents,
  });
});

// View all wallets
const getAllWallets = catchAsync(async (_req: Request, res: Response) => {
  const wallets = await Wallet.find().populate("user");
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Fetched all wallets",
    data: wallets,
  });
});

// View all transactions
const getAllTransactions = catchAsync(async (_req: Request, res: Response) => {
  const transactions = await Transaction.find().populate("from to");
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Fetched all transactions",
    data: transactions,
  });
});

// Block wallet
const blockWallet = catchAsync(async (req: Request, res: Response) => {
  const wallet = await Wallet.findById(req.params.walletId);
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }
  const user = await User.findById(wallet.user);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  user.isActive = IsActive.BLOCKED;
  await user.save();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wallet blocked",
    data: user,
  });
});

// Unblock wallet
const unblockWallet = catchAsync(async (req: Request, res: Response) => {
  const wallet = await Wallet.findById(req.params.walletId);
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }
  const user = await User.findById(wallet.user);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  user.isActive = IsActive.ACTIVE;
  await user.save();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wallet unblocked",
    data: user,
  });
});

// Approve agent
const approveAgent = catchAsync(async (req: Request, res: Response) => {
  const agent = await User.findOne({
    _id: req.params.agentId,
    role: Role.AGENT,
  });
  if (!agent) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }
  agent.isActive = IsActive.ACTIVE;
  await agent.save();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Agent approved",
    data: agent,
  });
});

// Suspend agent
const suspendAgent = catchAsync(async (req: Request, res: Response) => {
  const agent = await User.findOne({
    _id: req.params.agentId,
    role: Role.AGENT,
  });
  if (!agent) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }
  agent.isActive = IsActive.BLOCKED;
  await agent.save();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Agent suspended",
    data: agent,
  });
});

export const AdminController = {
  getAllUsers,
  getAllAgents,
  getAllWallets,
  getAllTransactions,
  blockWallet,
  unblockWallet,
  approveAgent,
  suspendAgent,
};
