import chalk from 'chalk';
import type { MismatchedTransaction, MissingInInternalTransaction, MissingInSourceTransaction, ReconciliationReport, SourceTransaction, SystemTransaction } from '../models/transaction.js';


export function printSummary(
  report: ReconciliationReport,
  sourceTransactions: SourceTransaction[],
  systemTransactions: SystemTransaction[]
): void {
  const totalSource = sourceTransactions.length;
  const totalSystem = systemTransactions.length;
  const matchedCount =
    totalSource - report.missing_in_internal.length - report.mismatched_transactions.length;

  console.log(chalk.cyan('=== TRANSACTION RECONCILIATION SUMMARY ==='));
  console.table([
    { Metric: 'Total Source', Count: totalSource },
    { Metric: 'Total System', Count: totalSystem },
    { Metric: 'Matched', Count: `${matchedCount} (${((matchedCount / totalSource) * 100).toFixed(2)}%)` },
    {
      Metric: 'Missing in Internal',
      Count: `${report.missing_in_internal.length} (${((report.missing_in_internal.length / totalSource) * 100).toFixed(2)}%)`,
    },
    {
      Metric: 'Missing in Source',
      Count: `${report.missing_in_source.length} (${((report.missing_in_source.length / totalSystem) * 100).toFixed(2)}%)`,
    },
    {
      Metric: 'Mismatched',
      Count: `${report.mismatched_transactions.length} (${((report.mismatched_transactions.length / totalSource) * 100).toFixed(2)}%)`,
    },
  ]);
}

export function printSamples(report: ReconciliationReport): void {
  const { mismatched_transactions, missing_in_internal, missing_in_source } = report;

  if (mismatched_transactions.length > 0) {
    console.log(chalk.magenta('\nSample mismatched transactions:'));
    console.table(
      mismatched_transactions.slice(0, 5).map((tx: MismatchedTransaction) => ({
        transactionId: tx.transactionId,
        amount: `${tx.discrepancies.amount?.source ?? 'N/A'} → ${tx.discrepancies.amount?.system ?? 'N/A'}`,
        status: `${tx.discrepancies.status?.source ?? 'N/A'} → ${tx.discrepancies.status?.system ?? 'N/A'}`,
      }))
    );
  }

  if (missing_in_internal.length > 0) {
    console.log(chalk.red('\nSample transactions missing in internal system:'));
    console.table(
      missing_in_internal.slice(0, 5).map((tx: MissingInInternalTransaction) => ({
        providerTransactionId: tx.providerTransactionId,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
      }))
    );
  }

  if (missing_in_source.length > 0) {
    console.log(chalk.yellow('\nSample transactions missing in source system:'));
    console.table(
      missing_in_source.slice(0, 5).map((tx: MissingInSourceTransaction) => ({
        transactionId: tx.transactionId,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
      }))
    );
  }
}
