# TradeLab Demo

A practice binary-options simulator. Virtual money and randomly simulated prices only.
No deposits, withdrawals or real trades.

## Run it
Open `index.html` in any browser. No build step or server needed.

## Files
- `index.html`: page structure
- `css/style.css`: styling (light and dark themes)
- `js/app.js`: simulated price engine, chart, trades, activity feed, demo account, AI coach hook

## Notes
- Balance, history and name are saved in the browser's localStorage.
- The AI coach panel only appears when the page is hosted on claude.ai as a published artifact. Elsewhere it stays hidden and everything else works.
- Keep the demo labels and risk disclaimer visible if you publish this.
