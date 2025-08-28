import { NextFunction, Request, Response } from "express";
import { Wallet } from "./wallet.model";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";

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
const getTransactionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(401, "Unauthorized");

    const limit = Number(req.query.limit) || 5;

    const transactions = await Transaction.find({
      $or: [{ from: userId }, { to: userId }],
    })
      .populate("to", "phone email")
      .populate("from", "phone email")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

// Export
export const WalletController = {
  addMoney,
  withdrawMoney,
  sendMoney,
  getWallet,
  getTransactionHistory,
};
