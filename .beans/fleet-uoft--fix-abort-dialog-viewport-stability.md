---
# fleet-uoft
title: Fix abort dialog viewport stability
status: completed
type: bug
priority: high
created_at: 2026-02-13T11:45:31Z
updated_at: 2026-02-13T11:49:51Z
---

Quit dialog appends ~9 lines to content, changing total height and causing vertical centering to shift everything up. On cancel, content flows over. Fix: replace bottom lines of content with dialog instead of appending, keeping total line count stable.
