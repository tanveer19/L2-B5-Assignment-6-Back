import { NextFunction, Request, Response } from "express";
import { Wallet } from "./wallet.model";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";

// Add money (deposit)
const addMoney = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id; // from checkAuth middleware

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    wallet.balance += Number(amount);
    await wallet.save();

    // log transaction
    await Transaction.create({
      user: userId,
      type: "DEPOSIT",
      amount,
      status: "SUCCESS",
    });

    res.json({ success: true, balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: "Failed to deposit money", error });
  }
};

// Withdraw money
const withdrawMoney = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    if (wallet.balance < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    wallet.balance -= Number(amount);
    await wallet.save();

    await Transaction.create({
      user: userId,
      type: "WITHDRAW",
      amount,
      status: "SUCCESS",
    });

    res.json({ success: true, balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: "Failed to withdraw money", error });
  }
};

// Send money to another user
const sendMoney = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("📩 sendMoney controller hit", req.body);
    const { to, amount } = req.body;

    if (!to || !amount) {
      throw new AppError(400, "Recipient and amount are required");
    }

    // senderId from req.user (if using checkAuth)
    const senderId = req.user?.userId;
    if (!senderId) {
      throw new AppError(401, "Unauthorized. Please log in again.");
    }

    // find sender & recipient wallets
    const senderWallet = await Wallet.findOne({ user: senderId });
    const recipientWallet = await Wallet.findOne({ phone: to }); // or use userId/email

    if (!senderWallet || !recipientWallet) {
      throw new AppError(404, "Sender or recipient wallet not found");
    }

    if (senderWallet.balance < amount) {
      throw new AppError(400, "Insufficient balance");
    }

    // deduct & add
    senderWallet.balance -= amount;
    recipientWallet.balance += amount;

    await senderWallet.save();
    await recipientWallet.save();

    // optional: create transaction record
    await Transaction.create({
      from: senderId,
      to,
      amount,
      date: new Date(),
      type: "TRANSFER",
    });

    res.status(200).json({
      success: true,
      message: "Money sent successfully",
      senderBalance: senderWallet.balance,
    });
  } catch (error) {
    next(error);
  }
};

// Get wallet details
const getWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    res.json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wallet", error });
  }
};

// Transaction history
const getTransactionHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error });
  }
};

// 👇 Export as an object so your routes can use WalletController.addMoney etc.
export const WalletController = {
  addMoney,
  withdrawMoney,
  sendMoney,
  getWallet,
  getTransactionHistory,
};
