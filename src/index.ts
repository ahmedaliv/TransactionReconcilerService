import { SOURCE_CSV_PATH, SYSTEM_CSV_PATH } from "./config/constants.js";
import type { ReconciliationReport, SourceTransaction, SystemTransaction } from "./models/transaction.js";
import { ReconciliationService } from "./services/reconciliationService.js";
import { readSourceCSV, readSystemCSV } from "./utils/csvReaders.js";
import chalk from 'chalk';
import { printSamples, printSummary } from "./utils/outputHelpers.js";
import { saveReport } from "./utils/fileHelpers.js";

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


async function main(): Promise<void> {
  try {
    console.log(chalk.cyan('🚀 Starting Transaction Reconciliation Service...\n'));

    const { sourceTransactions, systemTransactions } = await readTransactions();
    const report = runReconciliation(sourceTransactions, systemTransactions);

    const outputPath = saveReport(report);
    printSummary(report, sourceTransactions, systemTransactions);
    printSamples(report);

    console.log(chalk.green(`\n✅ Full detailed report saved to: ${outputPath}`));
  } catch (error) {
    console.error(chalk.red('❌ Error during reconciliation:'), error);
    process.exit(1);
  }
}

main();