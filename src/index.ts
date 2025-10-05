import path from "path";
import { OUTPUT_DIR, SOURCE_CSV_PATH, SYSTEM_CSV_PATH } from "./config/constants.js";
import type { MismatchedTransaction, MissingInInternalTransaction, MissingInSourceTransaction, ReconciliationReport, SourceTransaction, SystemTransaction } from "./models/transaction.js";
import { ReconciliationService } from "./services/reconciliationService.js";
import { readSourceCSV, readSystemCSV } from "./utils/csvReaders.js";
import fs from "fs";
import chalk from 'chalk';

async function readTransactions(): Promise<{
  sourceTransactions: SourceTransaction[];
  systemTransactions: SystemTransaction[];
}> {
  const [sourceTransactions, systemTransactions] = await Promise.all([
    readSourceCSV(SOURCE_CSV_PATH),
    readSystemCSV(SYSTEM_CSV_PATH),
  ]);

  console.log(`✓ Read ${sourceTransactions.length} source transactions`);
  console.log(`✓ Read ${systemTransactions.length} system transactions`);

  return { sourceTransactions, systemTransactions };
}

function runReconciliation(
  sourceTransactions: SourceTransaction[],
  systemTransactions: SystemTransaction[]
): ReconciliationReport {
  console.log('\n⏳ Starting reconciliation...');
  const reconciliationService = new ReconciliationService();
  const report = reconciliationService.reconcile(sourceTransactions, systemTransactions);
  console.log('✅ Reconciliation completed.\n');
  return report;
}

function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function saveReport(report: ReconciliationReport): string {
  ensureOutputDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(OUTPUT_DIR, `reconciliation-report-${timestamp}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  return outputPath;
}

function printSummary(
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

function printSamples(report: ReconciliationReport): void {
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