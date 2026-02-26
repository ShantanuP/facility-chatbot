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

## Connecting to live Corrigo

The UI includes a "Connect to Corrigo" modal. Submitting it sets the app as "connected" and uses the same API (sample data when the server is running). To use the real Corrigo API instead, replace the `fetchCorrigoData` logic in `app.js` with calls to the [Corrigo Developer API](https://developer.corrigopro.com/).
