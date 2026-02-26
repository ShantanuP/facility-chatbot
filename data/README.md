# Corrigo tables and sample data

This folder contains table definitions and sample data derived from the **Cursor of CD and ReactBI Tables and fields.xlsx** document.

## Files

| File | Description |
|------|-------------|
| `corrigo_schema.sql` | SQLite DDL for a subset of Corrigo tables. Column names are normalized to `snake_case`. |
| `corrigo_sample_data.sql` | Sample rows for portfolio, properties, customers, users, providers, assets, work orders, check-in/out, incidents, PMRM schedules, invoices, and related tables. |
| `corrigo_tables_schema.json` | Full list of 55 tables and their columns as extracted from the Excel (for reference). |

## Tables in the schema

The Excel document defines **55 tables**. The SQL schema implements the following (with a practical subset of columns):

- **portfolio** – Portfolio hierarchy
- **properties** – WorkZones / sites (WorkZone Name, Address, etc.)
- **billing_accounts** – Billing accounts
- **customers** – Customers and links to property/billing
- **users** – Facility managers, technicians
- **providers** – Service providers/vendors
- **labor_codes** – Labor codes and rates
- **assets** – Assets (HVAC, elevator, etc.) with spend and PM flags
- **workorders** – Work orders (key columns only; full table has 198 columns in the doc)
- **checkinouts** – Check-in/check-out records
- **incidents** – Incidents and links to work orders
- **pmrm_schedules** – PMRM (preventive/recurring) schedules
- **customer_invoices** – Customer invoices
- **approval_templates** – Approval templates
- **asset_actions** – Asset action log

## How to run

Using SQLite:

```bash
cd facility-chatbot/data
sqlite3 corrigo.db < corrigo_schema.sql
sqlite3 corrigo.db < corrigo_sample_data.sql
```

Then query from the chatbot or any app by connecting to `corrigo.db`.

## Column naming

The Excel uses display names (e.g. "Work Order Number", "WorkZone Name"). In the SQL schema these are stored as snake_case identifiers (e.g. `work_order_number`, `workzone_name`) for compatibility with SQL and the chatbot.
