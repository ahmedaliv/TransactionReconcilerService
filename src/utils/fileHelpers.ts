import fs from 'fs';
import path from 'path';
import type { ReconciliationReport } from '../models/transaction.js';
import { OUTPUT_DIR } from '../config/constants.js';

export function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export function saveReport(report: ReconciliationReport): string {
  ensureOutputDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(OUTPUT_DIR, `reconciliation-report-${timestamp}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  return outputPath;
}