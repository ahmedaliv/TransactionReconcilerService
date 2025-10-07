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
Dependencies are declared in `package.json`. The most relevant runtime/dev packages are:
- `fast-csv` — streaming CSV parsing
- `chalk` — colored console output
- `typescript` & `ts-node` — build/dev tooling

See `package.json` for exact versions.

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

Here's how I approached the implementation:  

### Architecture  
  
I split the code into four layers:  
  
- **Orchestration** (`index.ts`): Main workflow - read files, reconcile, save report  
- **Business Logic** (`reconciliationService.ts`): The actual reconciliation algorithm  
- **Data Ingestion** (`csvReaders.ts`): CSV parsing  
- **Config** (`constants.ts`): File paths


### Technical Design 
  
### Why Map-Based Lookups?  
I used `Map<string, Transaction>` for O(1) lookups instead of nested loops (which would be O(n×m)).
  
### Normalization  
Source and system transactions have different schemas (16 vs 11 fields). I normalize both to 5 common fields (id, amount, currency, status, userId) before comparison to keep the logic simple.  
  
### Concurrent Reading  
Reading both CSVs in parallel with `Promise.all()` cuts I/O time in half.  
  
### What Gets Detected  
- **Missing in Internal**: Transactions in source but not in system  
- **Missing in Source**: Transactions in system but not in source    
- **Mismatched**: Same ID but different amount or status  
  
## Code Review Notes  
  
### What I'm Happy With  
- TypeScript catches bugs at compile time  
- Map lookups are way faster than nested loops    
- Clean separation between reading CSVs and reconciliation logic  
- Color-coded console output makes it easy to spot issues  
  
### What I'd Improve Next  
- Stream-based processing for very large files (currently loads everything into memory)
- Add unit tests (didn't have time for this task, but would test edge cases like duplicate IDs)  
- Make file paths configurable via env vars (currently hardcoded in constants.ts)  
- Better error messages for malformed CSV rows

## License

ISC

## Author

Ahmed Ali

## Repository

https://github.com/ahmedaliv/TransactionReconcilerService