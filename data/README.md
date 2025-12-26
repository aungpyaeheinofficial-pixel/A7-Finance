# Myanmar Finance RAG Data Files

This directory contains sample data files for testing the RAG (Retrieval Augmented Generation) system with Myanmar finance-related content.

## Available Data Files

1. **finance_data.txt** - General CBM guidelines and financial regulations
2. **myanmar_banking_regulations.txt** - Comprehensive banking sector regulations and policies
3. **myanmar_forex_market.txt** - Foreign exchange market analysis and exchange rate mechanisms
4. **myanmar_gold_market.txt** - Gold market regulations, trading practices, and price trends
5. **myanmar_inflation_economy.txt** - Economic indicators, inflation analysis, and GDP data
6. **myanmar_tax_regulations.txt** - Tax laws, compliance requirements, and incentives

## How to Ingest Data

### Option 1: Using the Admin Page (Recommended)
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/admin`
3. Login with password: `admin123`
4. Copy and paste the content from any data file into the text area
5. Click "Upload & Train"
6. Wait for success message confirming chunks were uploaded

### Option 2: Using the Ingestion Script
1. Ensure your `.env` file has all required variables:
   - `SUPABASE_URL`
   - `SUPABASE_PRIVATE_KEY` (service_role key)
   - `GOOGLE_API_KEY`
2. Run the ingestion script:
   ```bash
   npx ts-node scripts/ingest.ts
   ```
   Note: This script currently only processes `finance_data.txt`. To ingest other files, modify the `DATA_FILE_PATH` in `scripts/ingest.ts`.

### Option 3: Combine All Files
You can combine all data files into one large file and ingest it:
```bash
# On Windows PowerShell:
Get-Content data\*.txt | Out-File data\combined_finance_data.txt -Encoding utf8

# Then ingest the combined file or use admin page
```

## Testing the RAG System

After ingesting data, test with questions like:
- "What are the mobile banking transaction limits?"
- "What is the current exchange rate policy?"
- "How does the gold market work in Myanmar?"
- "What are the tax rates for corporations?"
- "What is the inflation rate in Myanmar?"

The system should retrieve relevant context from the ingested documents and provide accurate answers.

## File Contents Summary

- **Banking Regulations**: Covers CBM policies, bank licensing, digital payments, AML requirements
- **Forex Market**: Exchange rate mechanisms, currency pairs, import/export rules, remittances
- **Gold Market**: Trading regulations, price determination, YGEA rules, investment products
- **Inflation & Economy**: CPI data, GDP growth, employment, poverty, trade balance
- **Tax Regulations**: Corporate tax, personal income tax, withholding tax, customs duties

## Notes

- All data files contain sample/example information for testing purposes
- Ensure your Supabase database schema is set up correctly (run `supabase/schema.sql`)
- The system chunks text into ~1000 character segments with 200 character overlap
- Each chunk is embedded using Google's `text-embedding-004` model

