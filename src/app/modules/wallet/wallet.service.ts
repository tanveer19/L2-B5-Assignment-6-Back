import { Wallet } from "./wallet.model";
import { Transaction } from "../transaction/transaction.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import mongoose from "mongoose";
import { IUser } from "../user/user.interface";

const addMoney = async (userId: string, amount: number) => {
  if (amount <= 0) throw new AppError(httpStatus.BAD_REQUEST, "Invalid amount");

  const wallet = await Wallet.findOneAndUpdate(
    { user: userId },
    { $inc: { balance: amount } },
    { new: true }
  );

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  await Transaction.create({
    type: "ADD", // ✅ Fix: match enum
    to: userId,
    amount,
    timestamp: new Date(),
  });

  return wallet;
};

const withdrawMoney = async (userId: string, amount: number) => {
  if (amount <= 0) throw new AppError(httpStatus.BAD_REQUEST, "Invalid amount");

  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet || wallet.balance < amount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }

  wallet.balance -= amount;
  await wallet.save();

  await Transaction.create({
    type: "WITHDRAW",
    from: userId,
    amount,
    timestamp: new Date(),
  });

  return wallet;
};

const sendMoney = async (fromId: string, toPhone: string, amount: number) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid transfer amount");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const senderWallet = await Wallet.findOne({ user: fromId }).session(
      session
    );
    if (!senderWallet || senderWallet.balance < amount) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    const recipientWallet = await Wallet.findOne()
      .populate<{ user: IUser }>({
        path: "user",
        match: { phone: toPhone },
      })
      .session(session);

    if (!recipientWallet || !recipientWallet.user) {
      throw new AppError(httpStatus.NOT_FOUND, "Recipient not found");
    }

    senderWallet.balance -= amount;
    recipientWallet.balance += amount;

    await senderWallet.save({ session });
    await recipientWallet.save({ session });

    await Transaction.create(
      [
        {
          type: "SEND",
          from: fromId,
          to: recipientWallet.user._id,
          amount,
          timestamp: new Date(),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { senderWallet, recipientWallet };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getTransactionHistory = async (userId: string) => {
  return Transaction.find({
    $or: [{ from: userId }, { to: userId }],
  })
    .populate("from", "phone")
    .populate("to", "phone")
    .sort({ createdAt: -1 });
};

export const WalletServices = {
  addMoney,
  withdrawMoney,
  sendMoney,
  getTransactionHistory,
};
