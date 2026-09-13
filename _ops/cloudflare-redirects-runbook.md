# Cloudflare 301 runbook

Replaces the Jekyll `layout: redirect` stubs with real HTTP 301s at the edge.

## Why

GitHub Pages cannot return a 301. The stubs return **HTTP 200** with a meta refresh,
a JS `location.replace`, and a canonical. Google treats a 0-second meta refresh as a
soft permanent redirect and usually consolidates. AI crawlers (GPTBot, PerplexityBot,
ClaudeBot) largely fetch raw HTML — they don't run JS and don't follow meta refresh.
To them every stub is a live page titled "Redirecting...".

Ahrefs confirms it: it crawls `/blog/agentic-marketing-systems-build-vs-buy-guide/`
(9 referring domains, 26 links — the second most-linked URL on the site),
`/opensoul/` (3 refdomains) and `/demo/` as **200 OK**, not as redirects. That equity
is sitting on stub pages instead of consolidating into `/learn/` and `/services/`.

## Files

- `cloudflare-bulk-redirects.csv` — 35 rows, ready to upload. 29 exact mappings
  (one per retired URL, generated from the stub front matter) plus 6 subpath
  catch-alls. No header row — Cloudflare requires none.
  Columns: `SOURCE,TARGET,STATUS,PRESERVE_QUERY_STRING,INCLUDE_SUBDOMAINS,SUBPATH_MATCHING,PRESERVE_PATH_SUFFIX`

Verified before shipping: every target is a 200, self-canonical URL in `sitemap.xml`,
and no target is itself a redirect source (no chains).

## Current DNS (before the move)

- Nameservers: `ns-cloud-c1..c4.googledomains.com` (Google Cloud DNS)
- Apex A: 185.199.108.153, .109.153, .110.153, .111.153 (GitHub Pages)
- `www` CNAME: `iamevandrake.github.io`

## Steps

1. **Add the zone** at Cloudflare (free plan). It imports the existing records —
   check all four apex A records and the `www` CNAME came across intact.

2. **Set every record to DNS-only (grey cloud) first.** Nothing about serving changes
   yet; GitHub keeps renewing its own certificate.

3. **Change nameservers at the registrar** to the pair Cloudflare assigns. Leave the
   Google Cloud DNS zone in place for a week in case of rollback. Wait for Cloudflare
   to report the zone active, then confirm the site still serves normally.

4. **SSL/TLS → Full.** Not Flexible (causes a redirect loop against GitHub Pages),
   and not Full (strict) — once proxied, GitHub can no longer complete the Let's Encrypt
   HTTP challenge, so its origin cert will eventually lapse and strict would hard-fail.
   Turn on **Always Use HTTPS**.

5. **Flip the apex and `www` records to Proxied (orange).** Confirm HTTPS still serves.
   From here Cloudflare terminates TLS; if the GitHub Pages settings screen later shows
   a certificate error, that is expected and harmless.

6. **Bulk Redirects** — Cloudflare account home (not the zone) → Bulk Redirects →
   Create a list → upload `cloudflare-bulk-redirects.csv` → then create a Bulk Redirect
   Rule that applies the list to all incoming requests. The rule is what activates it;
   the list alone does nothing.

7. **Verify before touching the repo:**
   ```
   curl -sSI https://soulcraftagency.com/blog/agentic-marketing-systems-build-vs-buy-guide/
   curl -sSI https://soulcraftagency.com/opensoul/
   curl -sSI https://soulcraftagency.com/blog/some-url-that-was-never-listed/
   ```
   Each should return `301` with a `Location:` header. The third proves the catch-all works.

8. **Only then, clean the repo:** delete the 29 `layout: redirect` files, change the
   global `permalink:` in `_config.yml` from `/blog/:slug/` to `/learn/:slug/`, push,
   and purge the Cloudflare cache. The live posts all carry explicit permalinks, so
   changing the global setting does not move them.

9. **Search Console:** resubmit the sitemap and run URL Inspection on two or three
   redirected URLs. Then re-run the AI Visibility Check against the domain.

## Constraints worth knowing

- **Do not add a `/blog/*` Single Redirect.** Single Redirects run in the
  `http_request_dynamic_redirect` phase, which executes *before* `http_request_redirect`
  (Bulk Redirects). A wildcard Single Redirect would preempt the per-post mappings and
  dump every old post on `/learn/`.
- **Free plan quota.** Documented as 10,000 Bulk Redirect items, but a batch of accounts
  is still capped at 20 from an incomplete 2025 migration, and the dashboard does not show
  which you have. If the upload fails around item 21, open a ticket. Interim: upload the
  6 catch-alls plus the exact rows for the URLs that actually have links —
  `/blog/agentic-marketing-systems-build-vs-buy-guide/`,
  `/blog/marketing-ai-agents-complete-guide-implementation/`, `/opensoul/`, `/demo/`.
- **Single Redirects** are 10 per zone on free, if you want one for `www` → apex.
- Keep the Bulk Redirect list permanently. Once the stubs are deleted it is the only
  thing standing between those URLs and a 404.

## Alternative

Hosting the site on Cloudflare Pages instead of GitHub Pages gives a native `_redirects`
file with real 301s, no proxy/certificate interaction at all, and keeps the redirect map
in the repo. Bigger move; worth it if the GitHub Pages certificate behaviour becomes annoying.
