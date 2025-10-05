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
npm install # Install all required dependencies
```

This installs the required packages: `chalk` (terminal styling), `fast-csv` (CSV parsing), TypeScript, and type definitions.  

### Input Data Setup

Place your CSV files in the `./data/` directory:
- `./data/source_transactions.csv` - External provider transactions
- `./data/system_transactions.csv` - Internal system transactions 

### Running the Service

**Production Mode:**
```bash
npm run build # Compile TypeScript to JavaScript
npm start # Run the compiled code
```

**Development Mode:**
```bash 
npm run dev # Run in development mode with ts-node
```  
**Docker Support**

```bash
# Using npm scripts:
npm run docker:build  # Build Docker image
npm run docker:run    # Run with volume mounting

# Or using raw Docker commands:
docker build -t transaction-reconciler .  # Build image
docker run -v ./output:/app/output -v ./data:/app/data:ro transaction-reconciler  # Run container
```
### Output

The service generates:
- **Console output**: Summary statistics and sample discrepancies with color-coded formatting
- **JSON report**: Timestamped file in `./output/reconciliation-report-{timestamp}.json` 

### Example Output
```
🚀 Starting Transaction Reconciliation Service...

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
...

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