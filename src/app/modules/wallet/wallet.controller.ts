import { Request, Response } from "express";
import { Wallet } from "./wallet.model";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";

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
const sendMoney = async (req: Request, res: Response) => {
  try {
    const { recipientIdentifier, amount } = req.body; // phone/email
    const senderId = req.user._id;

    const senderWallet = await Wallet.findOne({ user: senderId });
    if (!senderWallet)
      return res.status(404).json({ message: "Wallet not found" });

    if (senderWallet.balance < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    // find recipient by phone or email
    const recipient = await User.findOne({
      $or: [{ phone: recipientIdentifier }, { email: recipientIdentifier }],
    });
    if (!recipient)
      return res.status(404).json({ message: "Recipient not found" });

    const recipientWallet = await Wallet.findOne({ user: recipient._id });
    if (!recipientWallet)
      return res.status(404).json({ message: "Recipient wallet not found" });

    // transfer
    senderWallet.balance -= Number(amount);
    recipientWallet.balance += Number(amount);

    await senderWallet.save();
    await recipientWallet.save();

    // log transactions
    await Transaction.create({
      user: senderId,
      type: "SEND",
      amount,
      status: "SUCCESS",
      to: recipient._id,
    });

    res.json({ success: true, balance: senderWallet.balance });
  } catch (error) {
    res.status(500).json({ message: "Failed to send money", error });
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
