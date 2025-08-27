import { Request, Response, NextFunction } from "express";
import { Wallet } from "./wallet.model"; // assuming you have a wallet model
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import { IWallet } from "./wallet.interface";
import { HydratedDocument } from "mongoose";

export const WalletController = {
  addMoney: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as { userId: string }).userId;

      const user = await User.findById(userId);
      if (!user || !user.wallet) {
        throw new AppError(httpStatus.NOT_FOUND, "User or wallet not found");
      }

      const wallet = await Wallet.findById(user.wallet);
      if (!wallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
      }

      const amount = Number(req.body.amount);
      if (!amount || amount <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid amount");
      }

      wallet.balance += amount;
      await wallet.save();

      await Transaction.create({
        type: "ADD",
        from: null,
        to: userId,
        amount,
        timestamp: new Date(),
      });

      res.status(httpStatus.OK).json({
        success: true,
        message: "Money added successfully",
        data: {
          balance: wallet.balance,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  withdrawMoney: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as { userId: string }).userId;

      const user = await User.findById(userId);
      if (!user || !user.wallet) {
        throw new AppError(httpStatus.NOT_FOUND, "User or wallet not found");
      }

      const wallet = await Wallet.findById(user.wallet);
      if (!wallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
      }

      const amount = Number(req.body.amount);
      if (!amount || amount <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid amount");
      }

      wallet.balance -= amount;
      await wallet.save();

      await Transaction.create({
        type: "WITHDRAW",
        from: userId,
        to: null,
        amount,
        timestamp: new Date(),
      });

      res.status(httpStatus.OK).json({
        success: true,
        message: "Money added successfully",
        data: {
          balance: wallet.balance,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  sendMoney: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { toPhone, amount } = req.body;
      const user = req.user;

      if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
      }

      // Populate sender wallet as IWallet
      const sender = await User.findById(user.userId).populate<{
        wallet: HydratedDocument<IWallet>;
      }>("wallet");

      if (!sender || !sender.wallet) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          "Sender or sender wallet not found"
        );
      }

      const receiver = await User.findOne({ phone: toPhone }).populate<{
        wallet: HydratedDocument<IWallet>;
      }>("wallet");

      if (!receiver || !receiver.wallet) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          "Receiver or receiver wallet not found"
        );
      }
      const transferAmount = Number(amount);
      if (!transferAmount || transferAmount <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid transfer amount");
      }

      if (sender.wallet.balance < transferAmount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
      }

      // Perform balance updates
      sender.wallet.balance -= transferAmount;
      receiver.wallet.balance += transferAmount;

      // Save updated wallets
      await sender.wallet.save();
      await receiver.wallet.save();

      // Record the transaction
      await Transaction.create({
        type: "SEND",
        from: sender._id,
        to: receiver._id,
        amount: transferAmount,
        timestamp: new Date(),
      });

      res.status(httpStatus.OK).json({
        success: true,
        message: "Money sent successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  getTransactionHistory: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req.user as { userId: string }).userId;

      // Find all transactions where the user is either the sender or receiver
      const transactions = await Transaction.find({
        $or: [{ from: userId }, { to: userId }],
      })
        .populate("from", "phone") // Optional: populate phone number of sender
        .populate("to", "phone") // Optional: populate phone number of receiver
        .sort({ createdAt: -1 }); // Newest first

      res.status(httpStatus.OK).json({
        success: true,
        message: "Transaction history fetched successfully",
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  },
  getWallet: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as { userId: string }).userId;
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
      }
      res.status(httpStatus.OK).json({
        success: true,
        message: "Wallet fetched successfully",
        data: wallet,
      });
    } catch (error) {
      next(error);
    }
  },
};
