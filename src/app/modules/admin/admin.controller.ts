import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import { Transaction } from "../transaction/transaction.model";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../errorHelpers/AppError";
import { sendResponse } from "../../utils/sendResponse";
import { Role, IsActive } from "../user/user.interface";
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
    User.countDocuments({ isActive: IsActive.ACTIVE }),
    User.countDocuments({ isActive: { $ne: IsActive.ACTIVE } }),
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

// ✅ ADD: Get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await User.find()
    .populate("wallet")
    .select("-password")
    .sort({ createdAt: -1 });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    data: users,
  });
});

// ✅ ADD: Update user status
const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  // Validate the status
  if (!Object.values(IsActive).includes(isActive)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid status value");
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  )
    .populate("wallet")
    .select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `User status updated to ${isActive}`,
    data: user,
  });
});

// ✅ ADD: Get user by ID
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id).populate("wallet").select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User retrieved successfully",
    data: user,
  });
});

// ✅ ADD: Delete user (soft delete)
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { isDeleted: true, isActive: IsActive.INACTIVE },
    { new: true }
  )
    .populate("wallet")
    .select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User deleted successfully",
    data: user,
  });
});

// ✅ ADD: Get all agents
const getAllAgents = catchAsync(async (req: Request, res: Response) => {
  const agents = await User.find({ role: Role.AGENT })
    .populate("wallet")
    .select("-password")
    .sort({ createdAt: -1 });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Agents retrieved successfully",
    data: agents,
  });
});

// ✅ ADD: Update agent status
const updateAgentStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  // Validate the status
  if (!Object.values(IsActive).includes(isActive)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid status value");
  }

  const agent = await User.findOneAndUpdate(
    { _id: id, role: Role.AGENT }, // Ensure we're only updating agents
    { isActive },
    { new: true, runValidators: true }
  )
    .populate("wallet")
    .select("-password");

  if (!agent) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Agent status updated to ${isActive}`,
    data: agent,
  });
});

export const AdminController = {
  getAdminSummary,
  getAdminActivity,
  getAllUsers,
  updateUserStatus,
  getUserById,
  deleteUser,
  getAllAgents,
  updateAgentStatus,
};
