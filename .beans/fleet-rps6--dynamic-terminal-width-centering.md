---
# fleet-rps6
title: Dynamic terminal width centering
status: completed
type: task
priority: high
created_at: 2026-02-13T09:38:11Z
updated_at: 2026-02-13T09:39:58Z
---

Replace hardcoded WIDTH=80 with dynamic terminal width detection using process.stdout.columns. Update centerText() and all layout functions to use dynamic width. This is foundational — other visual improvements depend on proper centering.
