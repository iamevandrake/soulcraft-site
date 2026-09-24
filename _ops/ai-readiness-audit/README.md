# AEO Agency AI-Readiness Audit

Repeatable audit behind /learn/best-aeo-agencies-ai-readiness/.

Files
- rubric.md — scoring rules. Lock a version before each run; never re-weight after seeing results.
- audit.js — structural pass (robots.txt, raw-HTML text, JSON-LD, entity fields, sitemap). Paste into the
  browser console on each agency homepage (or run via the Claude browser pane); it returns one JSON line.
- results-YYYY-MM.jsonl — one line per agency from audit.js.
- speed-YYYY-MM.csv — LCP / TTFB / load per homepage (browser pane must be visible for LCP to report).
- score.py RUN — scores results + speed into scores-RUN.csv.
- build_post.py RUN — rebuilds the _posts listicle from scores-RUN.csv, and copies the CSV to /data/.
  Hand-written copy lives in post_body.md (the top-10 write-ups must be re-checked against new data).

Run history
- 2026-09 (rubric v1.1): 24 agencies. PageSpeed Insights was quota-limited and throttled on the run date, so
  speed used in-browser LCP. For the next run, get a free PSI API key and restore the Lighthouse measure.

Next-run ideas: add BreadcrumbList + knowsAbout to the Soulcraft homepage (the 4 points we lost).
