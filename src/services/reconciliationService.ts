// src/services/reconciliationService.ts

// Service to reconcile source and system transactions

import type {
    SourceTransaction,
    SystemTransaction,
    NormalizedTransaction,
    ReconciliationReport,
    MissingInInternalTransaction,
    MissingInSourceTransaction
} from '../models/transaction.js';

export class ReconciliationService {
    private normalizeSourceTransaction(source: SourceTransaction): NormalizedTransaction {
        return {
            id: source.providerTransactionId,
            amount: source.amount,
            currency: source.currency,
            status: source.status,
            userId: source.userId
        };
    }

    private normalizeSystemTransaction(system: SystemTransaction): NormalizedTransaction {
        return {
            id: system.transactionId,
            amount: system.amount,
            currency: system.currency,
            status: system.status,
            userId: system.userId
        };
    }

    public reconcile(
        sourceTransactions: SourceTransaction[],
        systemTransactions: SystemTransaction[]
    ): ReconciliationReport {
        // Create maps for transaction matching
        const sourceMap = new Map<string, { original: SourceTransaction; normalized: NormalizedTransaction }>();
        const systemMap = new Map<string, { original: SystemTransaction; normalized: NormalizedTransaction }>();

        // Process transactions into maps
        sourceTransactions.forEach(tx => {
            const normalized = this.normalizeSourceTransaction(tx);
            sourceMap.set(normalized.id, { original: tx, normalized });
        });

        systemTransactions.forEach(tx => {
            const normalized = this.normalizeSystemTransaction(tx);
            systemMap.set(normalized.id, { original: tx, normalized });
        });
        // Find missing transactions
        const missing_in_internal: MissingInInternalTransaction[] = [];
        const missing_in_source: MissingInSourceTransaction[] = [];

        sourceMap.forEach((value, id) => {
            if (!systemMap.has(id)) {
                missing_in_internal.push({
                    providerTransactionId: value.original.providerTransactionId,
                    amount: value.original.amount,
                    currency: value.original.currency,
                    status: value.original.status
                });
            }
        });

        systemMap.forEach((value, id) => {
            if (!sourceMap.has(id)) {
                missing_in_source.push({
                    transactionId: value.original.transactionId,
                    amount: value.original.amount,
                    currency: value.original.currency,
                    status: value.original.status
                });
            }
        });

        return {
            missing_in_internal,
            missing_in_source,
            mismatched_transactions: []  // Still empty for now
        };
    }
}