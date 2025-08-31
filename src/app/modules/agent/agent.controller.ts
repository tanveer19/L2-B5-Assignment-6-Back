import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "../transaction/transaction.model";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../errorHelpers/AppError";
import { sendResponse } from "../../utils/sendResponse";
import { Role } from "../user/user.interface";
import { IAgentSummary } from "./agent.interface";

const cashIn = catchAsync(async (req: Request, res: Response) => {
  const agent = req.user;
  const { phoneNumber, amount } = req.body;

  if (agent?.role !== Role.AGENT) {
    throw new AppError(httpStatus.FORBIDDEN, "Only agents can perform cash-in");
  }

  if (!phoneNumber || !amount || amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid phone or amount");
  }

  const user = await User.findOne({ phone: phoneNumber }).populate("wallet");
  if (!user || !user.wallet) {
    console.log("Found user:", user);

    throw new AppError(httpStatus.NOT_FOUND, "User or wallet not found");
  }

  await Wallet.findByIdAndUpdate(user.wallet._id, {
    $inc: { balance: amount },
  });

  await Transaction.create({
    type: "DEPOSIT",
    from: agent._id,
    to: user.wallet._id,
    amount,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `৳${amount} added to user (${phoneNumber})`,
    data: null,
  });
});

// 🔹 Cash-out: Agent withdraws money from a user's wallet
const cashOut = catchAsync(async (req: Request, res: Response) => {
  const agent = req.user;
  const { phoneNumber, amount } = req.body;

  if (agent?.role !== Role.AGENT) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only agents can perform cash-out"
    );
  }

  if (!phoneNumber || !amount || amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid phone or amount");
  }

  const user = await User.findOne({ phone: phoneNumber }).populate("wallet");
  if (!user || !user.wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "User or wallet not found");
  }

  const wallet = user.wallet as typeof Wallet.prototype;

  if (wallet.balance < amount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }

  await Wallet.findByIdAndUpdate(wallet._id, {
    $inc: { balance: -amount },
  });

  await Transaction.create({
    type: "WITHDRAW",
    from: user.wallet._id,
    to: agent._id,
    amount,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `৳${amount} withdrawn from user (${phoneNumber})`,
    data: null,
  });
});
// agent.controller.ts
const getAgentSummary = catchAsync(async (req: Request, res: Response) => {
  const agent = req.user;

  if (agent?.role !== Role.AGENT) {
    throw new AppError(httpStatus.FORBIDDEN, "Only agents can access summary");
  }

  // Get today's date for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate summary data
  const totalCashIn = await Transaction.countDocuments({
    type: "DEPOSIT",
    from: agent._id,
  });

  const totalCashOut = await Transaction.countDocuments({
    type: "WITHDRAW",
    to: agent._id,
  });

  const totalTransactions = totalCashIn + totalCashOut;

  const todayCashIn = await Transaction.countDocuments({
    type: "DEPOSIT",
    from: agent._id,
    createdAt: { $gte: today },
  });

  const todayCashOut = await Transaction.countDocuments({
    type: "WITHDRAW",
    to: agent._id,
    createdAt: { $gte: today },
  });

  const todayTransactions = todayCashIn + todayCashOut;

  // Calculate commission (optional)
  const commissionRate = 0.015; // 1.5% commission
  const totalCommission = totalTransactions * commissionRate;

  const summary: IAgentSummary = {
    totalCashIn,
    totalCashOut,
    totalTransactions,
    totalCommission,
    todayCashIn,
    todayCashOut,
    todayTransactions,
  };

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Agent summary retrieved successfully",
    data: summary,
  });
});

const getAgentActivity = catchAsync(async (req: Request, res: Response) => {
  const agent = req.user;
  const { limit = 10 } = req.query;

  if (agent?.role !== Role.AGENT) {
    throw new AppError(httpStatus.FORBIDDEN, "Only agents can access activity");
  }

  const activities = await Transaction.find({
    $or: [{ from: agent._id }, { to: agent._id }],
  })
    .populate("from", "phone name")
    .populate("to", "phone name")
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  const formattedActivities = activities.map((transaction) => ({
    _id: transaction._id,
    type:
      transaction.from?.toString() === agent._id.toString()
        ? "CASH_IN"
        : "CASH_OUT",
    amount: transaction.amount,
    userPhone:
      transaction.from?.toString() === agent._id.toString()
        ? (transaction.to as any)?.phone
        : (transaction.from as any)?.phone,
    timestamp: transaction.createdAt,
    status: "SUCCESS", // You can add status logic based on your business rules
  }));

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Agent activity retrieved successfully",
    data: formattedActivities,
  });
});

const getAgentTransactions = catchAsync(async (req: Request, res: Response) => {
  const agent = req.user;
  const { page = 1, limit = 10, type, fromDate, toDate, search } = req.query;

  if (agent?.role !== Role.AGENT) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only agents can access transactions"
    );
  }

  // Build query for agent's transactions
  const query: any = {
    $or: [
      { from: agent._id, type: "DEPOSIT" }, // Agent cash-in transactions
      { to: agent._id, type: "WITHDRAW" }, // Agent cash-out transactions
    ],
  };

  // Add filters
  if (type) query.type = type;
  if (fromDate) query.createdAt = { $gte: new Date(fromDate as string) };
  if (toDate) {
    query.createdAt = query.createdAt || {};
    query.createdAt.$lte = new Date(toDate as string);
  }

  const transactions = await Transaction.find(query)
    .populate("from", "phone name")
    .populate("to", "phone name")
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Transaction.countDocuments(query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Agent transactions retrieved successfully",
    data: {
      data: transactions,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    },
  });
});
export const AgentController = {
  cashIn,
  cashOut,
  getAgentSummary,
  getAgentActivity,
  getAgentTransactions,
};
