---
# fleet-usb8
title: Fix quit confirmation dialog rendering
status: completed
type: bug
priority: high
created_at: 2026-02-13T11:33:02Z
updated_at: 2026-02-13T11:34:11Z
---

Dialog box borders are misaligned because centerText doesn't account for emoji double-width in terminals. Fix by using a fixed margin approach: calculate margin once from box width, apply same margin to all lines. Remove emojis from inside the box or account for their width.
