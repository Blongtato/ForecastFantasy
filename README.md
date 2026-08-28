# The Ledger — Forecast Fantasy

A browser-based stock-trading game set on the docks of a fantasy trading port. Read the news, decide which way a market will move, and buy or sell shares to grow your fortune.

**[▶ Play the game](https://blongtato.github.io/ForecastFantasy/)**

## How to play

1. **Pick a market.** Each shift you get three markets to trade (Moonberry, Wyrm Oil, Mana Dust). Each has its own price and its own level of risk.
2. **Read the news.** Market news arrives from people around the quay. A bumper harvest usually means prices will drop — sell. A supply shortage usually means prices will rise — buy. More tools unlock as you settle markets.
3. **Place your trade.** Type how many shares you want, then click **BUY** if you think the price will go up or **SELL** if you think it will go down.
4. **Settle the market.** When you're ready, settle a market and its price moves up or down. If you bought and it went up, you make money. If it went down, you lose.
5. **Sell to bank your gains.** Selling realizes your profit or loss. You can hold shares after a market settles and sell them whenever you're ready.
6. **Survive the shift.** If you run out of cash and have no shares left, the game is over. All three markets must be settled to start a new shift.

## Features

- **Three markets per shift** with randomized prices and volatility
- **Buy and sell mechanics** — go long if you think a price will rise, sell if you think it will fall
- **Sell after settlement** — you decide when to realize your gains
- **Market news** that hints at which way prices are likely to move
- **Upgrades** that unlock as you play:
  - **Oracle Lens (₱300)** — shows an estimated price range on each market before you trade
  - **Ether Ticker (₱600)** — unlocks a second news source for each market
  - **Fate Simulator (₱1000)** — shows how risky each market is before you commit
- **Trade history** — review every closed position, entry and exit price, and profit or loss

## Tech

A single-page vanilla HTML/CSS/JavaScript game with no frameworks or build tools. All state lives in memory for the current session.

## Running locally

Open `ForecastFantasy/index.html` in any modern browser. No dependencies or server required.
