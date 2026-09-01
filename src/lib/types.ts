export interface UserSession {
  name: string;
  email: string;
  role: "freelancer" | "admin";
  avatar?: string;
}

export interface Invoice {
  id: string;
  client: string;
  amount: number;
  currency: string;
  status: "pending" | "active" | "paid" | "disputed";
  createdAt: string;
  dueDate: string;
  vaultHash: string;
  ephemeralAddress: string;
  description: string;
}

export type PayoutMethod = "mobile_money" | "wise" | "sepa" | "paypal" | "crypto";

export interface Notification {
  id: string;
  message: string;
  type: "broadcast" | "payment" | "system";
  timestamp: string;
  read: boolean;
}

export interface AppState {
  user: UserSession | null;
  invoices: Invoice[];
  adminFeePercent: number;
  notifications: Notification[];
  broadcastMessages: string[];
  payoutMethod: PayoutMethod;
  telemetry: {
    totalPlatformVolume: number;
    totalInvoiceCount: number;
    activeUsers: number;
    pendingPayouts: number;
  };
}

export type AppAction =
  | { type: "LOGIN"; payload: UserSession }
  | { type: "LOGOUT" }
  | { type: "CREATE_INVOICE"; payload: Invoice }
  | { type: "UPDATE_INVOICE_STATUS"; payload: { id: string; status: Invoice["status"] } }
  | { type: "SET_ADMIN_FEE"; payload: number }
  | { type: "BROADCAST_MESSAGE"; payload: string }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "DISMISS_NOTIFICATION"; payload: string }
  | { type: "SET_PAYOUT_METHOD"; payload: PayoutMethod };