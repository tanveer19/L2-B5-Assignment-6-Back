import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "../transaction/transaction.model";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../errorHelpers/AppError";
import { sendResponse } from "../../utils/sendResponse";
import { Role } from "../user/user.interface";

// 🔹 Cash-in: Agent adds money to a user's wallet
const cashIn = catchAsync(async (req: Request, res: Response) => {
  const agent = req.user;
  const { phone, amount } = req.body;

  if (agent?.role !== Role.AGENT) {
    throw new AppError(httpStatus.FORBIDDEN, "Only agents can perform cash-in");
  }

  if (!phone || !amount || amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid phone or amount");
  }

  const user = await User.findOne({ phone }).populate("wallet");
  if (!user || !user.wallet) {
    console.log("Found user:", user);

    throw new AppError(httpStatus.NOT_FOUND, "User or wallet not found");
  }

  await Wallet.findByIdAndUpdate(user.wallet._id, {
    $inc: { balance: amount },
  });

  await Transaction.create({
    type: "ADD",
    from: agent._id,
    to: user._id,
    amount,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `৳${amount} added to user (${phone})`,
    data: null,
  });
});

// 🔹 Cash-out: Agent withdraws money from a user's wallet
const cashOut = catchAsync(async (req: Request, res: Response) => {
  const agent = req.user;
  const { phone, amount } = req.body;

  if (agent?.role !== Role.AGENT) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only agents can perform cash-out"
    );
  }

  if (!phone || !amount || amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid phone or amount");
  }

  const user = await User.findOne({ phone }).populate("wallet");
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
    from: user._id,
    to: agent._id,
    amount,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `৳${amount} withdrawn from user (${phone})`,
    data: null,
  });
});

export const AgentController = {
  cashIn,
  cashOut,
};
