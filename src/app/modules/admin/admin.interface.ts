export interface IAdminSummary {
  totalUsers: number;
  totalAgents: number;
  totalAdmins: number;
  totalTransactions: number;
  totalTransactionVolume: number;
  todayTransactions: number;
  todayTransactionVolume: number;
  activeUsers: number;
  inactiveUsers: number;
}

export interface IAdminActivity {
  _id: string;
  type: string;
  amount: number;
  userPhone: string;
  timestamp: Date;
  status: string;
}
