---
# fleet-fk0s
title: Fix wave line and separator alignment in title
status: completed
type: bug
priority: high
created_at: 2026-02-13T11:45:30Z
updated_at: 2026-02-13T11:49:12Z
---

Wave line (~🌊~) is misaligned vs SCHIFFE text because it has different displayWidth (32 vs 34). Separator line missing space before final ⚓. Fix: pad wave to match title width, add space before trailing anchor.
