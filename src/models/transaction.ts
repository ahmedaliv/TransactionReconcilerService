// src/models/transaction.ts

// Define interfaces for transactions and reconciliation report

// Source transaction (external provider)
export interface SourceTransaction {
  providerTransactionId: string;
  email: string;
  userId: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  transactionType: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  providerReference: string;
  fraudRisk: string;
  details_invoiceId: string;
  details_customerName: string;
  details_description: string;
}

// System transaction (internal)
export interface SystemTransaction {
  transactionId: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  referenceId: string;
  metadata_orderId: string;
  metadata_description: string;
}

// Normalized transaction for comparison only
export interface NormalizedTransaction {
  id: string;          // providerTransactionId or transactionId  
  amount: number;
  currency: string;
  status: string;
  userId: string;
}

// Discrepancy details for mismatched transactions
export interface Discrepancies {
  amount?: { source: number; system: number };
  status?: { source: string; system: string };
}

// Mismatched transaction entry
export interface MismatchedTransaction {
  transactionId: string;
  discrepancies: Discrepancies;
}

// Reconciliation report structure
export interface MissingInInternalTransaction {
  providerTransactionId: string;
  amount: number;
  currency: string;
  status: string;
}
// Transactions present in the system but missing in the source
export interface MissingInSourceTransaction {
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
}

// Final reconciliation report
export interface ReconciliationReport {
  missing_in_internal: MissingInInternalTransaction[];
  missing_in_source: MissingInSourceTransaction[];
  mismatched_transactions: MismatchedTransaction[];
}
