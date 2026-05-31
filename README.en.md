# What If Buffett

Drag the bars to rewrite history — see the butterfly effect across Warren Buffett's 60-year investment journey.

→ Live: [what-if-buffett.vercel.app](https://what-if-buffett.vercel.app/)

*[中文](README.md)*

## What Is This

An interactive investment simulator. It displays Warren Buffett's actual annual returns from 1965 to 2025 (61 years). **Drag any bar** on the chart to change a year's return, and the system instantly recalculates all subsequent asset values — revealing the power of compounding and how a single decision reshapes the final outcome.

Three curves, side by side:

- **Buffett Actual** (blue) — his real returns
- **S&P 500** (gray) — the benchmark
- **Your Scenario** (orange) — your alternate universe

## Why This Exists

- Understand compounding: "What if Buffett lost 50% in the 1970s?"
- See the cost of fees: "How much does a 2% annual management fee eat away over 60 years?"
- Test your intuition: "If you removed the worst years, how much richer would you be?"

## Data

Berkshire Hathaway Annual Reports (1965–2025). All return figures are sourced from Buffett's annual shareholder letters.

## Feedback

Questions, ideas, or just curious? Join the discussion at [GitHub Issues](https://github.com/bright-zhou/what-if-buffett/issues).

## Tech Stack

React 19 + TypeScript + Vite + Recharts + Vitest. Pure frontend. No backend, no database.

## License

MIT
