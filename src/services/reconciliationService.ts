// src/services/reconciliationService.ts

// Service to reconcile source and system transactions

import type {
    SourceTransaction,
    SystemTransaction,
    NormalizedTransaction,
    ReconciliationReport,
    MissingInInternalTransaction,
    MissingInSourceTransaction,
    Discrepancies,
    MismatchedTransaction
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
        // Find mismatched transactions 
        const mismatched_transactions: MismatchedTransaction[] = [];

        sourceMap.forEach((sourceItem, id) => {
            const systemItem = systemMap.get(id);

            if (systemItem) {
                const discrepancies: Discrepancies = {};

                // Check amount mismatch
                if (sourceItem.normalized.amount !== systemItem.normalized.amount) {
                    discrepancies.amount = {
                        source: sourceItem.normalized.amount,
                        system: systemItem.normalized.amount
                    };
                }

                // Check status mismatch
                if (sourceItem.normalized.status !== systemItem.normalized.status) {
                    discrepancies.status = {
                        source: sourceItem.normalized.status,
                        system: systemItem.normalized.status
                    };
                }

                // Only include if there are discrepancies
                if (Object.keys(discrepancies).length > 0) {
                    mismatched_transactions.push({
                        transactionId: id,
                        discrepancies
                    });
                }
            }
        });

        // Return the final reconciliation report
        return {
            missing_in_internal,
            missing_in_source,
            mismatched_transactions
        };
    }
}