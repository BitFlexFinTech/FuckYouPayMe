import { AppState, AppAction, Invoice, Notification } from "@/lib/types";

const now = () => new Date().toISOString();

const generateVaultHash = (): string => {
  const chars = "abcdef0123456789";
  let hash = "0x";
  for (let i = 0; i < 40; i++) hash += chars[Math.floor(Math.random() * chars.length)];
  return hash;
};

const generateEphemeralAddress = (): string => {
  const chars = "abcdef0123456789";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * chars.length)];
  return addr;
};

const DEMO_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    client: "Nexus Studios",
    amount: 12500,
    currency: "USD",
    status: "paid",
    createdAt: "2026-08-15T10:00:00Z",
    dueDate: "2026-09-15T10:00:00Z",
    vaultHash: "0x7a3b…c9d2",
    ephemeralAddress: "0x1a2b…3c4d",
    description: "Q3 Brand Strategy — full campaign deck",
  },
  {
    id: "inv-002",
    client: "Tangent Capital",
    amount: 8400,
    currency: "USD",
    status: "active",
    createdAt: "2026-08-20T14:30:00Z",
    dueDate: "2026-09-20T14:30:00Z",
    vaultHash: generateVaultHash(),
    ephemeralAddress: generateEphemeralAddress(),
    description: "Financial dashboard UI — 3 sprint cycles",
  },
  {
    id: "inv-003",
    client: "Brutalist Systems",
    amount: 3200,
    currency: "EUR",
    status: "pending",
    createdAt: "2026-08-25T09:00:00Z",
    dueDate: "2026-09-25T09:00:00Z",
    vaultHash: generateVaultHash(),
    ephemeralAddress: generateEphemeralAddress(),
    description: "Component library audit & refactor",
  },
  {
    id: "inv-004",
    client: "Oscura Ventures",
    amount: 22000,
    currency: "USD",
    status: "pending",
    createdAt: "2026-08-28T11:00:00Z",
    dueDate: "2026-10-01T11:00:00Z",
    vaultHash: generateVaultHash(),
    ephemeralAddress: generateEphemeralAddress(),
    description: "Full-stack platform MVP — 8 weeks",
  },
];

export const initialState: AppState = {
  user: null,
  invoices: DEMO_INVOICES,
  adminFeePercent: 2.5,
  notifications: [
    {
      id: "notif-001",
      message: "Welcome to FuckYouPayMe. Invoices are protected by ephemeral vault escrow.",
      type: "system",
      timestamp: now(),
      read: false,
    },
  ],
  broadcastMessages: [],
  payoutMethod: "wise",
  telemetry: {
    totalPlatformVolume: 46100,
    totalInvoiceCount: 4,
    activeUsers: 187,
    pendingPayouts: 2,
  },
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload };

    case "LOGOUT":
      return { ...state, user: null };

    case "CREATE_INVOICE": {
      const newInvoice: Invoice = {
        ...action.payload,
        id: `inv-${Date.now()}`,
        vaultHash: generateVaultHash(),
        ephemeralAddress: generateEphemeralAddress(),
        createdAt: now(),
        status: "pending",
      };
      return {
        ...state,
        invoices: [newInvoice, ...state.invoices],
        telemetry: {
          ...state.telemetry,
          totalInvoiceCount: state.telemetry.totalInvoiceCount + 1,
          totalPlatformVolume: state.telemetry.totalPlatformVolume + action.payload.amount,
        },
      };
    }

    case "UPDATE_INVOICE_STATUS": {
      const updatedInvoices = state.invoices.map((inv) =>
        inv.id === action.payload.id ? { ...inv, status: action.payload.status } : inv
      );
      return { ...state, invoices: updatedInvoices };
    }

    case "SET_ADMIN_FEE":
      return {
        ...state,
        adminFeePercent: Math.min(Math.max(action.payload, 0), 25),
      };

    case "BROADCAST_MESSAGE": {
      const newNotif: Notification = {
        id: `broadcast-${Date.now()}`,
        message: action.payload,
        type: "broadcast",
        timestamp: now(),
        read: false,
      };
      return {
        ...state,
        broadcastMessages: [...state.broadcastMessages, action.payload],
        notifications: [newNotif, ...state.notifications],
      };
    }

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    case "DISMISS_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };

    case "SET_PAYOUT_METHOD":
      return { ...state, payoutMethod: action.payload };

    default:
      return state;
  }
}