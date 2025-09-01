// src/app/modules/admin/admin.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import { Transaction } from "../transaction/transaction.model";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../errorHelpers/AppError";
import { sendResponse } from "../../utils/sendResponse";
import { Role } from "../user/user.interface";
import { IAdminSummary } from "./admin.interface";

const getAdminSummary = catchAsync(async (req: Request, res: Response) => {
  // Get today's date for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all counts in parallel for better performance
  const [
    totalUsers,
    totalAgents,
    totalAdmins,
    totalTransactions,
    totalTransactionVolume,
    todayTransactions,
    todayTransactionVolume,
    activeUsers,
    inactiveUsers,
  ] = await Promise.all([
    User.countDocuments({ role: Role.USER }),
    User.countDocuments({ role: Role.AGENT }),
    User.countDocuments({ role: { $in: [Role.ADMIN, Role.SUPER_ADMIN] } }),
    Transaction.countDocuments(),
    Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.countDocuments({ createdAt: { $gte: today } }),
    Transaction.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
  ]);

  const summary: IAdminSummary = {
    totalUsers,
    totalAgents,
    totalAdmins,
    totalTransactions,
    totalTransactionVolume: totalTransactionVolume[0]?.total || 0,
    todayTransactions,
    todayTransactionVolume: todayTransactionVolume[0]?.total || 0,
    activeUsers,
    inactiveUsers,
  };

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Admin summary retrieved successfully",
    data: summary,
  });
});

const getAdminActivity = catchAsync(async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  const activities = await Transaction.find()
    .populate("from", "phone name")
    .populate("to", "phone name")
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  const formattedActivities = activities.map((transaction) => ({
    _id: transaction._id,
    type: transaction.type,
    amount: transaction.amount,
    userPhone:
      (transaction.from as any)?.phone ||
      (transaction.to as any)?.phone ||
      "System",
    timestamp: transaction.createdAt,
    status: "SUCCESS",
  }));

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Admin activity retrieved successfully",
    data: formattedActivities,
  });
});

export const AdminController = {
  getAdminSummary,
  getAdminActivity,
};
