# Transaction Reconciliation Service

A TypeScript-based service that reconciles transactions between external payment providers and internal systems by comparing CSV files and generating detailed discrepancy reports.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ahmedaliv/TransactionReconcilerService.git
cd TransactionReconcilerService
```

2. Install dependencies:
```bash
npm install
```

This installs the required packages: `chalk` (terminal styling), `fast-csv` (CSV parsing), TypeScript, and type definitions.  

### Input Data Setup

Place your CSV files in the `./data/` directory:
- `./data/source_transactions.csv` - External provider transactions
- `./data/system_transactions.csv` - Internal system transactions 

### Running the Service

**Production Mode:**
```bash
npm run build
npm start
```

**Development Mode:**
```bash
npm run dev
```  

### Output

The service generates:
- **Console output**: Summary statistics and sample discrepancies with color-coded formatting
- **JSON report**: Timestamped file in `./output/reconciliation-report-{timestamp}.json` 

### Example Output
```
🚀 Starting Transaction Reconciliation Service...

Parsed 91 source transactions
Parsed 122 system transactions
✓ Read 91 source transactions
✓ Read 122 system transactions

⏳ Starting reconciliation...
✅ Reconciliation completed.

=== TRANSACTION RECONCILIATION SUMMARY ===
┌─────────┬───────────────────────┬───────────────┐
│ (index) │        Metric         │     Count     │
├─────────┼───────────────────────┼───────────────┤
│    0    │    'Total Source'     │      91       │
│    1    │    'Total System'     │      122      │
│    2    │       'Matched'       │ '49 (53.85%)' │
│    3    │ 'Missing in Internal' │ '28 (30.77%)' │
│    4    │  'Missing in Source'  │ '59 (48.36%)' │
│    5    │     'Mismatched'      │ '14 (15.38%)' │
└─────────┴───────────────────────┴───────────────┘

Sample mismatched transactions:
┌─────────┬────────────────────────────────────────┬───────────────────┬───────────────────────┐
│ (index) │             transactionId              │      amount       │        status         │
├─────────┼────────────────────────────────────────┼───────────────────┼───────────────────────┤
│    0    │ 'd013dd63-415d-46f3-b06e-491416cd5d59' │ '837.3 → 830.77'  │ 'disputed → refunded' │
│    1    │ 'a135faf1-b2be-422b-8c86-ae0e0834b9ed' │ '907.16 → 842.21' │ 'disputed → pending'  │
│    2    │ 'dd8c0fb8-63e7-4231-bbf4-cccc1b3a6ad0' │  '30.26 → 28.11'  │  'failed → pending'   │
│    3    │ 'e1520e0d-cc66-421e-a07d-d3ebcae2dc00' │ '377.66 → 364.4'  │ 'disputed → refunded' │
│    4    │ '19991d1f-ddd7-4df0-a021-815257afefb9' │ '147.55 → 141.57' │ 'disputed → refunded' │
└─────────┴────────────────────────────────────────┴───────────────────┴───────────────────────┘

Sample transactions missing in internal system:
┌─────────┬────────────────────────────────────────┬─────────┬──────────┬────────────┐
│ (index) │         providerTransactionId          │ amount  │ currency │   status   │
├─────────┼────────────────────────────────────────┼─────────┼──────────┼────────────┤
│    0    │ 'e281781a-1fcb-49e4-8a61-2824d634f8df' │ 450.14  │  'USD'   │ 'pending'  │
│    1    │ 'a619ba16-c331-48ab-a099-314a96d56e57' │ 625.05  │  'USD'   │ 'refunded' │
│    2    │ '3b9b8a00-995b-4598-a96d-e9a9017d4ca2' │ 1052.17 │  'USD'   │ 'refunded' │
│    3    │ '81d2d2a5-992d-4763-92d3-c7144d12f699' │ 613.17  │  'USD'   │ 'refunded' │
│    4    │ '3715b16e-186b-4fe5-814b-efa0b6d9e303' │ 349.77  │  'USD'   │ 'refunded' │
└─────────┴────────────────────────────────────────┴─────────┴──────────┴────────────┘

Sample transactions missing in source system:
┌─────────┬────────────────────────────────────────┬────────┬──────────┬─────────────┐
│ (index) │             transactionId              │ amount │ currency │   status    │
├─────────┼────────────────────────────────────────┼────────┼──────────┼─────────────┤
│    0    │ '592dbb3c-5a8f-49b5-a210-7e79e1417a85' │ 678.34 │  'USD'   │ 'completed' │
│    1    │ '35839b0b-f5f1-4d89-b97c-d70bd4db0dc7' │ 184.62 │  'USD'   │  'failed'   │
│    2    │ 'f741569f-2fad-40ea-ab36-ed9618a0603c' │ 123.17 │  'USD'   │  'failed'   │
│    3    │ '0f079583-4a68-4666-966c-a796959c010b' │ 380.01 │  'USD'   │  'failed'   │
│    4    │ 'c7eccd8d-06e6-43c7-9f16-96447fff4286' │ 1193.1 │  'USD'   │ 'completed' │
└─────────┴────────────────────────────────────────┴────────┴──────────┴─────────────┘

✅ Full detailed report saved to: /home/ahmedali/Desktop/tr/output/reconciliation-report-2025-10-05T07-41-58-979Z.json

```
### JSON Report Excerpt
```
{
  "missing_in_internal": [
    {
      "providerTransactionId": "e281781a-1fcb-49e4-8a61-2824d634f8df",
      "amount": 450.14,
      "currency": "USD",
      "status": "pending"
    }
  ],
  "missing_in_source": [
    {
      "transactionId": "592dbb3c-5a8f-49b5-a210-7e79e1417a85", 
      "amount": 678.34,
      "currency": "USD",
      "status": "completed"
    }
  ],
  "mismatched_transactions": [
    {
      "transactionId": "d013dd63-415d-46f3-b06e-491416cd5d59",
      "discrepancies": {
        "amount": {
          "source": 837.3,
          "system": 830.77
        },
        "status": {
          "source": "disputed", 
          "system": "refunded"
        }
      }
    }
  ]
}
```
## Technical Design Rationale

### Architecture Overview

The service implements a four-layer architecture with clear separation of concerns:

1. **Orchestration Layer** (`index.ts`): Coordinates workflow execution
2. **Business Logic Layer** (`reconciliationService.ts`): Performs reconciliation
3. **Data Ingestion Layer** (`csvReaders.ts`): Parses CSV files
4. **Configuration Layer** (`constants.ts`): Manages file paths


### Key Design Decisions

#### 1. Map-Based Reconciliation Algorithm

The service uses hash maps for O(1) lookup performance when matching transactions: 

This enables efficient reconciliation even with large datasets by avoiding nested loops.

#### 2. Normalization Strategy

Heterogeneous transaction formats are normalized into a common schema with 5 key fields (`id`, `amount`, `currency`, `status`, `userId`) 


This isolates comparison logic from the full transaction schemas (16 fields for `SourceTransaction`, 11 for `SystemTransaction`).

#### 3. Concurrent I/O Operations

Both CSV files are read concurrently using `Promise.all()` to minimize total I/O time

#### 4. Stream-Based Parsing

The service uses Node.js streams via `fast-csv` for memory-efficient processing of large CSV files

This prevents loading entire files into memory.

### Discrepancy Detection

The reconciliation engine detects three types of discrepancies:

1. **Missing in Internal**: Source transactions not found in the system 
2. **Missing in Source**: System transactions not found in the source 
3. **Mismatched Transactions**: Transactions with field-level differences (amount or status) 

## Code Review Notes

### Strengths

- **Type Safety**: Full TypeScript with explicit interfaces and compile-time checking

- **Performance**: O(n) reconciliation algorithm using Map lookups vs naive O(n×m)

- **Architecture**: Clean separation of concerns with four-layer design

- **User Experience** : Dual JSON + console output with colors and summary tables

- **Code Quality**: Modular functions with single responsibilities and clear naming



### Potential Improvements
- **Testing**: Add Jest unit tests for reconciliation service edge cases
- **Configuration**: Support environment variables for file paths  
- **Scalability**: Implement stream processing for larger datasets
- **Error Handling**: Add validation for malformed CSV data and missing files

## License

ISC

## Author

Ahmed Ali

## Repository

https://github.com/ahmedaliv/TransactionReconcilerService