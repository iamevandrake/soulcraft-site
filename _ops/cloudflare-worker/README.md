# soulcraft-agent-edge (Cloudflare Worker)

Runs in front of soulcraftagency.com and does three things GitHub Pages can't:

1. **Markdown for agents.** A request whose `Accept` header prefers `text/markdown` gets the page's main
   content as markdown (`Content-Type: text/markdown`, plus `x-markdown-tokens`). Browsers still get HTML.
   Cloudflare's own "Markdown for Agents" toggle needs a Pro plan; this does the same on Free.
2. **Link headers** (RFC 8288) on every HTML page, pointing agents at the API catalog, the ARD catalog, the MCP server card,
   the agent-skills index, the sitemap and the markdown version of the page.
3. **CORS and content types** on `/.well-known/` files (the ARD spec asks for `Access-Control-Allow-Origin: *`).

It fails open: if the Worker errors, visitors get the normal origin response.

## Deploy (CLI, recommended)

From this folder, with Node installed: `npx wrangler deploy`. The first run opens a browser to sign in to
Cloudflare. `wrangler.toml` holds the account, Worker name and the `soulcraftagency.com/*` route. Afterwards,
set Failure mode to Fail open in the dashboard (Worker → Settings → Domains & Routes).

## Deploy (dashboard, no CLI needed)

1. Cloudflare dashboard → Workers & Pages → Create → Create Worker. Name it `soulcraft-agent-edge`, Deploy.
2. Edit code → replace everything with the contents of `dist/worker.js` → Deploy.
3. Worker → Settings → Domains & Routes → Add → Route: `soulcraftagency.com/*`, zone `soulcraftagency.com`.
   Set **Failure mode: Fail open** (if the free 100k requests/day is ever used up, the site serves normally).
4. Check:
   - `curl -sI https://soulcraftagency.com/ | grep -i '^link'` shows the Link header.
   - `curl -s -H 'Accept: text/markdown' https://soulcraftagency.com/services/seo/ | head` returns markdown.
   - Re-run https://isitagentready.com/soulcraftagency.com

Nothing else in the zone changes: redirects, the Bulk Redirect list and the AI crawler settings stay as they are,
and robots.txt is still served straight from the repo.

## Change it

Edit `src/worker.js`, then from this folder: `npm install && npm run build`, and paste the new
`dist/worker.js` into the dashboard editor. Keep `CONTENT_SIGNAL` in step with robots.txt.
