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
- `index.html` is the whole fitness screen, a single file with no build step.
- Data comes from a Google Sheet that's published as a CSV. Columns: Date, Workout, Diet (Y/N). The sheet link goes in the page address (`?sheet=...&goal=4`), never in the code.
- Game look: an original medieval RPG style with skills, levels and XP. Don't copy any real game's art, names or UI.
