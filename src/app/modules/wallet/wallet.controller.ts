import { NextFunction, Request, Response } from "express";
import { Wallet } from "./wallet.model";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

// Add money (deposit)
const addMoney = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    const userId = req.user?.userId;

    if (!userId) throw new AppError(401, "Unauthorized");

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) throw new AppError(404, "Wallet not found");

    wallet.balance += Number(amount);
    await wallet.save();

    await Transaction.create({
      user: userId,
      type: "DEPOSIT",
      amount,
      status: "SUCCESS",
    });

    res.json({ success: true, data: { balance: wallet.balance } });
  } catch (error) {
    next(error);
  }
};

// Withdraw money
const withdrawMoney = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount } = req.body;
    const userId = req.user?.userId;

    if (!userId) throw new AppError(401, "Unauthorized");

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) throw new AppError(404, "Wallet not found");

    if (wallet.balance < amount)
      throw new AppError(400, "Insufficient balance");

    wallet.balance -= Number(amount);
    await wallet.save();

    await Transaction.create({
      user: userId,
      type: "WITHDRAW",
      amount,
      status: "SUCCESS",
    });

    res.json({ success: true, data: { balance: wallet.balance } });
  } catch (error) {
    next(error);
  }
};

// Send money to another user
const sendMoney = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { to, amount } = req.body;
    const senderId = req.user?.userId;

    if (!senderId) throw new AppError(401, "Unauthorized");
    if (!to || !amount)
      throw new AppError(400, "Recipient and amount are required");

    const senderWallet = await Wallet.findOne({ user: senderId });
    if (!senderWallet) throw new AppError(404, "Sender wallet not found");

    const recipientUser = await User.findOne({
      $or: [{ phone: to }, { email: to }],
    });
    if (!recipientUser) throw new AppError(404, "Recipient not found");

    const recipientWallet = await Wallet.findOne({ user: recipientUser._id });
    if (!recipientWallet) throw new AppError(404, "Recipient wallet not found");

    if (senderWallet.balance < amount)
      throw new AppError(400, "Insufficient balance");

    // Transfer money
    senderWallet.balance -= Number(amount);
    recipientWallet.balance += Number(amount);

    await senderWallet.save();
    await recipientWallet.save();

    await Transaction.create({
      user: senderId,
      type: "SEND",
      amount,
      to: recipientUser._id,
      status: "SUCCESS",
    });

    res
      .status(200)
      .json({ success: true, data: { balance: senderWallet.balance } });
  } catch (error) {
    next(error);
  }
};

// Get wallet details
const getWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(401, "Unauthorized");

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) throw new AppError(404, "Wallet not found");

    res.json({
      success: true,
      data: {
        _id: wallet._id,
        balance: wallet.balance,
        user: wallet.user,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Transaction history
const getTransactionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const { page = 1, limit = 10, type, fromDate, toDate, search } = req.query;

    // Build query for user's transactions
    const query: any = {
      $or: [
        { from: user._id }, // User sent money
        { to: user._id }, // User received money
      ],
    };

    // Add filters
    if (type) query.type = type;
    if (fromDate) query.createdAt = { $gte: new Date(fromDate as string) };
    if (toDate) {
      query.createdAt = query.createdAt || {};
      query.createdAt.$lte = new Date(toDate as string);
    }

    // Search functionality (if needed)
    if (search) {
      // You might need to implement search logic here
    }

    const transactions = await Transaction.find(query)
      .populate("from", "phone name") // Populate sender info
      .populate("to", "phone name") // Populate receiver info
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Transaction.countDocuments(query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Transaction history retrieved successfully",
      data: {
        data: transactions,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
        },
      },
    });
  }
);

// Export
export const WalletController = {
  addMoney,
  withdrawMoney,
  sendMoney,
  getWallet,
  getTransactionHistory,
};
