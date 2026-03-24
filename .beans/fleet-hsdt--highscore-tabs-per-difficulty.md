---
# fleet-hsdt
title: Highscore tabs per difficulty
status: completed
type: feature
priority: normal
created_at: 2026-03-24T12:00:00Z
updated_at: 2026-03-24T12:00:00Z
---

Replace the single mixed highscore list with a tabbed view per difficulty level (Easy / Medium / Hard). Navigate tabs with left/right arrow keys.

## Details

- Horizontal tab bar at the top: `[ Easy | Medium | Hard ]`, active tab highlighted
- Each tab shows the top scores for that difficulty only
- Left/right arrows switch tabs, any other key returns to title
- Data model: bump the cap from 10 total to 10 per difficulty (filter on save/load or on render)
- Default tab: Medium (matches the default difficulty selection)

## Motivation

Currently all difficulty levels are mixed into one leaderboard, making scores hard to compare — an Easy win in 30 turns outranks a Hard win in 40, which feels wrong.
