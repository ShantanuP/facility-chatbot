# Facility Manager Chatbot

A facility-manager web app with a chatbot that answers questions using **Corrigo** data. The chatbot reads from **sample data** in a local SQLite database (`data/corrigo.db`) when you run the included API server.

## Features

- **Left sidebar**: User profile (connection status) and chat history
- **Main area**: Three suggested prompts above the chat; chat window below
- **Intent detection**: Classifies questions (work orders, assets by cost, status breakdown, locations, maintenance) and fetches the right data
- **Sample data**: When the server is running, answers are based on the tables and sample data in `data/corrigo.db` (from the Corrigo CD/ReactBI schema)
- **Charts**: Work orders by status and top assets by cost are shown with bar charts
- **Follow-up prompts**: After each answer, suggests clickable follow-up questions

## Run with sample data (no npm install)

The server uses **only Node.js built-ins**—no `npm install` and no external packages (avoids certificate or registry issues).

1. **Start the server**:

   ```bash
   cd facility-chatbot
   node server.js
   ```

   Or: `npm start` (same as `node server.js`).

2. Open **http://localhost:3001** in your browser.

The chatbot will show "Connected" and answer questions using the sample data. If you open the app without the server (e.g. by opening `index.html` directly), it will ask you to start the server.

## Data and API

- **Sample data**: Pre-built JSON in `data/api/` (e.g. `work-orders.json`, `assets-by-cost.json`) matches the Corrigo-style sample data. The server serves these at `/api/work-orders`, `/api/work-orders-by-status`, `/api/assets`, `/api/assets-by-cost`, `/api/locations`, `/api/maintenance`, and `/api/health`.
- **SQL schema/data** (optional): `data/corrigo_schema.sql` and `data/corrigo_sample_data.sql` are the original table definitions and sample rows; the app does not use them at runtime. You can load them into SQLite for other tools if needed.

## Files

| File | Description |
|------|-------------|
| `index.html` | Layout: sidebar, prompts, chat, credentials modal |
| `styles.css` | Dark theme and layout |
| `app.js` | Intent detection, API calls, response text, charts, follow-ups |
| `server.js` | Node server (no deps); serves app and `data/api/*.json` |
| `data/api/*.json` | Sample data for work orders, assets, locations, maintenance |
| `data/corrigo_schema.sql` | SQL schema (optional reference) |
| `data/corrigo_sample_data.sql` | Sample rows (optional reference) |

## Connecting to Databricks (command line or .env)

Set the connection from the **command line** (no browser):

```bash
cd facility-chatbot
SERVER_HOSTNAME=adb-xxxx.azuredatabricks.net HTTP_PATH=/sql/1.0/warehouses/xxxxx ACCESS_TOKEN=dapi... node server.js
```

Or create a **.env** file in the project folder with `SERVER_HOSTNAME`, `HTTP_PATH`, and `ACCESS_TOKEN` (one per line), then run `node server.js`. Do not commit `.env`; it is in `.gitignore`.

**Parameters:**

1. **Server hostname** – Your Databricks workspace host (e.g. `adb-xxxx.azuredatabricks.net` or `your-workspace.cloud.databricks.com`).
2. **HTTP path** – SQL warehouse path (e.g. `/sql/1.0/warehouses/<warehouse_id>` from the JDBC/ODBC settings).
3. **Access token** – Databricks personal access token.

The server then runs SQL against your Databricks SQL warehouse for work orders, assets, locations, and maintenance. Table and column names are expected to match the Corrigo-style schema (`workorders`, `assets`, `properties`, `pmrm_schedules`, etc.). Edit `DATABRICKS_QUERIES` in `server.js` if your schema differs. When using env or .env, no browser input is needed. Credentials are stored in the server’s memory and in the browser’s localStorage so they can be restored after a refresh or server restart.
