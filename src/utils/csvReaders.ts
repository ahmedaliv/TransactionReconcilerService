import type { SourceTransaction, SystemTransaction } from '../models/transaction.js';
import fs from 'fs';
import fastCsv from 'fast-csv';

const csvOptions = {
  objectMode: true,
  delimiter: ',',
  quote: null,
  headers: true,
  renameHeaders: false,
};

export function readSourceCSV(filePath: string): Promise<SourceTransaction[]> {
  return new Promise((resolve, reject) => {
    const data: SourceTransaction[] = [];

    fs.createReadStream(filePath)
      .pipe(fastCsv.parse(csvOptions))
      .on('error', (error: Error) => reject(error))
      .on('data', (row: any) => {
        const tx: SourceTransaction = {
          providerTransactionId: row.providerTransactionId,
          email: row.email,
          userId: row.userId,
          provider: row.provider,
          amount: Number(row.amount),
          currency: row.currency,
          status: row.status,
          transactionType: row.transactionType,
          paymentMethod: row.paymentMethod,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          providerReference: row.providerReference,
          fraudRisk: row.fraudRisk,
          details_invoiceId: row.details_invoiceId,
          details_customerName: row.details_customerName,
          details_description: row.details_description,
        };

        data.push(tx);
      })
      .on('end', (rowCount: number) => {
        console.log(`Parsed ${rowCount} source transactions`);
        resolve(data);
      });
  });
}

export function readSystemCSV(filePath: string): Promise<SystemTransaction[]> {
  return new Promise((resolve, reject) => {
    const data: SystemTransaction[] = [];

    fs.createReadStream(filePath)
      .pipe(fastCsv.parse(csvOptions))
      .on('error', (error: Error) => reject(error))
      .on('data', (row: any) => {
        const tx: SystemTransaction = {
          transactionId: row.transactionId,
          userId: row.userId,
          amount: Number(row.amount),
          currency: row.currency,
          status: row.status,
          paymentMethod: row.paymentMethod,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          referenceId: row.referenceId,
          metadata_orderId: row.metadata_orderId,
          metadata_description: row.metadata_description,
        };

        data.push(tx);
      })
      .on('end', (rowCount: number) => {
        console.log(`Parsed ${rowCount} system transactions`);
        resolve(data);
      });
  });
}