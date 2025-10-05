import { SOURCE_CSV_PATH, SYSTEM_CSV_PATH } from "./config/constants.js";
import type { SourceTransaction, SystemTransaction } from "./models/transaction.js";
import { readSourceCSV, readSystemCSV } from "./utils/csvReaders.js";



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