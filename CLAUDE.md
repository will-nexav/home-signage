# Home Signage: Agent Instructions

## What this is
Digital signage for Will's home. It runs on an Apple TV through OptiSign. The first screen is a fitness tracker. Later screens will cover other personal goals.

## Who you're working with
- Will is not a coder. Use plain English and skip jargon, or explain it in one line.
- Don't just accept Will's ideas. Push back when something won't work well, and suggest a better option. Give one recommendation, not a list of choices.
- Keep replies short. Say what changed and what Will needs to do, if anything.

## Defaults
- **Time zone:** America/New_York for every date, time, schedule and "today" calculation.
- **Screen:** 1920×1080 TV at a 10-foot viewing distance. Use large text, high contrast and no small detail. Nothing should need a tap or a click.
- **Updates:** pages refresh themselves. Show a clear fallback if the data fails to load, never a blank screen.
- **Privacy:** fitness data is personal. Never commit private data to a public place.

## Before you finish a change
Check the page at TV size, then tell Will the URL to load in OptiSign.

## How it works now
- Each slide is its own folder with a single `index.html` (no build step). OptiSign rotates them in a playlist. The root `index.html` just forwards to `fitness/`.
- Every slide reads its own Google Sheet, published as a CSV. The sheet link goes in the page address (`?sheet=...`), never in the code. Columns are found by header name.
- `fitness/`: Fitness Journey. Columns: Date, Workout (Yes / No / "TBD - Soccer" for a planned workout), Notes, Diet (Yes/No). `&goal=3` sets the weekly goal. Look: an original medieval RPG style; don't copy any real game's art, names or UI.
- `finance/`: Finance. Columns: Item, Group, Current, Goal, Last Month. Rows with the same Group are added into one card (5 cards max). Group "Revenue" rows go in the business panel and are never added to net worth. Group "Goal" sets the net worth goal. `&private=1` hides dollar amounts. Look: dark, techy fintech. Money data belongs in Will's personal Google account, not the work one.
