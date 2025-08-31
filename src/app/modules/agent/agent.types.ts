// src/app/modules/agent/agent.types.ts
export interface IAgentSummary {
  totalCashIn: number;
  totalCashOut: number;
  totalTransactions: number;
  totalCommission: number;
  todayCashIn: number;
  todayCashOut: number;
  todayTransactions: number;
}

export interface IAgentActivity {
  _id: string;
  type: "CASH_IN" | "CASH_OUT";
  amount: number;
  userPhone: string;
  timestamp: Date;
  status: "SUCCESS" | "PENDING" | "FAILED";
}

export type TTransactionType =
  | "DEPOSIT"
  | "WITHDRAW"
  | "SEND"
  | "RECEIVE"
  | "AGENT_CASHIN";

export interface ITransaction {
  _id: string;
  amount: number;
  type: TTransactionType;
  status: "PENDING" | "SUCCESS" | "FAILED";
  from: any; // Can be ObjectId or populated object
  to: any; // Can be ObjectId or populated object
  createdAt: Date;
  updatedAt?: Date;
  narrative?: string;
}
