import { Transaction } from "../transaction/transaction.model";
import { Request, Response } from "express";

export const deposit = async (req: Request, res: Response) => {
  const { amount } = req.body;
  const userId = req.user._id;

  const wallet = await Wallet.findOne({ user: userId });
  wallet.balance += amount;
  await wallet.save();

  await Transaction.create({ type: "DEPOSIT", to: userId, amount });

  res.json({ success: true, balance: wallet.balance });
};

export const withdraw = async (req: Request, res: Response) => {
  const { amount } = req.body;
  const userId = req.user._id;

  const wallet = await Wallet.findOne({ user: userId });
  if (wallet.balance < amount)
    return res.status(400).json({ message: "Insufficient balance" });

  wallet.balance -= amount;
  await wallet.save();

  await Transaction.create({ type: "WITHDRAW", from: userId, amount });

  res.json({ success: true, balance: wallet.balance });
};

export const sendMoney = async (req: Request, res: Response) => {
  const { recipient, amount } = req.body;
  const userId = req.user._id;

  const senderWallet = await Wallet.findOne({ user: userId });
  if (senderWallet.balance < amount)
    return res.status(400).json({ message: "Insufficient balance" });

  const recipientUser = await User.findOne({
    $or: [{ email: recipient }, { phone: recipient }],
  });
  if (!recipientUser)
    return res.status(404).json({ message: "Recipient not found" });

  const recipientWallet = await Wallet.findOne({ user: recipientUser._id });

  senderWallet.balance -= amount;
  recipientWallet.balance += amount;

  await senderWallet.save();
  await recipientWallet.save();

  await Transaction.create({
    type: "SEND",
    from: userId,
    to: recipientUser._id,
    amount,
  });

  res.json({ success: true, balance: senderWallet.balance });
};
