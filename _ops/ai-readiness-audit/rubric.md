# AEO Agency AI-Readiness Audit — scoring rubric (v1.1)

Locked 2026-09-24, before any site was scored. Change the version number if the rubric changes;
never re-score an old run with a new rubric without saying so.

Scope: each agency's homepage (the URL its domain resolves to), its /robots.txt, and its sitemap.
Everything is measured from the raw server HTML (what a non-JS crawler receives), not the rendered DOM.

## 1. Crawler access — 25 pts
- 2 pts for each of 10 AI user agents allowed to fetch "/" under robots.txt rules (20):
  GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User,
  PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended.
  No robots.txt (404) = allowed. robots.txt that errors (5xx) = 0 for this line.
- 5 pts if the raw homepage HTML contains >= 300 words of visible text (readable without JavaScript).

## 2. Schema depth — 20 pts
Parsed from JSON-LD blocks in the raw homepage HTML (types nested inside @graph and properties count).
- 2 pts: at least one JSON-LD block parses as valid JSON.
- 1 pt per distinct schema.org @type, max 10.
- Key types: Organization or a subtype (e.g. ProfessionalService, LocalBusiness) 2, WebSite 2,
  WebPage 1, Service or OfferCatalog 1, FAQPage 1, BreadcrumbList 1.

## 3. Entity markup — 20 pts
Scored on the best Organization-type node and any Person node in the homepage JSON-LD.
- name 1, url 1, logo 2, @id 2, description 1, foundingDate 1, knowsAbout 2
- sameAs: 3 or more URLs 3; 1–2 URLs 1.5
- founder / employee / member linking a Person 2
- address or areaServed 1; email, telephone or contactPoint 1
- a Person node that has its own sameAs 3

## 4. Sitemaps — 15 pts
- 5 pts: robots.txt declares at least one Sitemap: line.
- 6 pts: the declared sitemap (or /sitemap.xml, then /sitemap_index.xml) returns valid XML
  with a <urlset> or <sitemapindex> root.
- 4 pts: that file contains <lastmod> values.

## 5. Load speed — 20 pts
- v1.0 specified Google PageSpeed Insights. On 2026-09-24 the public PSI API returned quota errors and the
  web UI failed with render-server throttling, so v1.1 (changed before any speed data was collected) measures
  in the browser instead.
- Each homepage is loaded in the same Chromium browser, same machine and network, back to back, on its
  second visit (all sites equally warm-cached from the structural pass). Largest Contentful Paint (LCP)
  comes from the browser's PerformanceObserver; TTFB and total transfer size are recorded for reference.
- Points: 20 if LCP <= 1.0 s, 0 if LCP >= 4.0 s (Google's "poor" threshold), linear in between.
- Lab-style, single-run numbers. Re-run with a PSI API key (see README) for Lighthouse scores.

Total: 100.
