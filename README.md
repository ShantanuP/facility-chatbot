# Facility Manager Chatbot

A facility-manager web app with a chatbot that answers questions using **Corrigo**-style data (work orders, assets, locations, maintenance). When not connected to Corrigo, the app asks for credentials; once “connected,” it uses simulated data and can draw charts and suggest follow-up questions.

## Features

- **Left sidebar**: User profile (with Corrigo connection status) and chat history
- **Main area**: Three suggested prompts above the chat; chat window below
- **Intent detection**: Classifies questions (work orders, assets by cost, status breakdown, locations, maintenance) to decide what data to fetch
- **Corrigo flow**: If the question needs Corrigo data and the app is not connected, a credentials modal is shown
- **Responses**: Describes results in plain language, optionally draws a chart (e.g. work orders by status, top assets by cost)
- **Follow-up prompts**: After each answer, suggests 3 clickable follow-up questions

## Run locally

Open `index.html` in a browser, or serve the folder with any static server:

```bash
cd facility-chatbot
npx serve .
# or: python3 -m http.server 8080
```

Then open the URL shown (e.g. http://localhost:3000).

## Connecting to Corrigo

The UI includes a “Connect to Corrigo” modal (username, password, region). This is a **simulated** connection: submitting the form sets the app as “connected” and stores a preference in `localStorage`. Data is generated locally. To use the real Corrigo API, replace the `fetchCorrigoData` logic in `app.js` with calls to the [Corrigo Developer API](https://developer.corrigopro.com/).

## Files

- `index.html` – Layout: sidebar (profile, chat history), main (prompts + chat), credentials modal
- `styles.css` – Dark theme and layout
- `app.js` – Intent detection, connection state, simulated Corrigo data, response building, Chart.js rendering, follow-up chips
