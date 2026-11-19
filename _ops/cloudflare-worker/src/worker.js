/**
 * soulcraft-agent-edge — Cloudflare Worker in front of soulcraftagency.com (GitHub Pages origin).
 *
 * 1. Markdown for agents: a GET/HEAD for an HTML page whose Accept header prefers text/markdown
 *    gets the page's main content as markdown (Content-Type: text/markdown, x-markdown-tokens).
 *    Browsers keep getting HTML. (Cloudflare's built-in "Markdown for Agents" needs a Pro plan;
 *    this does the same on the free plan.)
 * 2. Link headers (RFC 8288) on HTML responses that point agents at the discovery files.
 * 3. CORS and correct content types on /.well-known/ discovery files.
 *
 * Fails open: if anything here throws, the visitor gets the untouched origin response.
 * Source of truth: _ops/cloudflare-worker/src/worker.js. Build: see _ops/cloudflare-worker/README.md.
 */
import { NodeHtmlMarkdown } from 'node-html-markdown';

const CONTENT_SIGNAL = 'ai-train=yes, search=yes, ai-input=yes'; // keep in step with robots.txt

const LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</.well-known/ard.json>; rel="ard"; type="application/json"',
  '</.well-known/ai-catalog.json>; rel="ai-catalog"; type="application/json"',
  '</.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json"',
  '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
];

const ASSET_EXT = /\.(css|js|mjs|json|xml|txt|png|jpe?g|gif|webp|avif|svg|ico|pdf|zip|gz|tgz|woff2?|ttf|mp4|webm|mp3|csv)$/i;

const nhm = new NodeHtmlMarkdown(
  { bulletMarker: '-', codeBlockStyle: 'fenced', maxConsecutiveNewlines: 2, useLinkReferenceDefinitions: false },
);

/** q-value of a media range in an Accept header (0 when absent). */
function qFor(accept, type) {
  let best = 0;
  for (const part of accept.toLowerCase().split(',')) {
    const [range, ...params] = part.trim().split(';').map((s) => s.trim());
    if (range !== type) continue;
    const q = params.find((p) => p.startsWith('q='));
    best = Math.max(best, q ? parseFloat(q.slice(2)) || 0 : 1);
  }
  return best;
}

function wantsMarkdown(request) {
  const accept = request.headers.get('accept') || '';
  const md = qFor(accept, 'text/markdown');
  return md > 0 && md >= qFor(accept, 'text/html');
}

function attr(html, re) {
  const m = html.match(re);
  const v = m && (m[1] ?? m[2]);
  return v ? v.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim() : '';
}

function yamlStr(s) {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

export function htmlToMarkdown(html, url) {
  const title = attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = attr(html, /<meta\s+name=["']description["']\s+content=(?:"([^"]*)"|'([^']*)')/i);
  const canonical = attr(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) || url;

  // Main content only: drop chrome and non-content elements before converting.
  let body = html;
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (main) body = main[1];
  else {
    const b = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
    if (b) body = b[1];
  }
  body = body
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|noscript|template|svg|iframe|canvas|form|button|select|nav|header|footer)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<(input|textarea|img)\b[^>]*>/gi, (tag) => {
      if (!/^<img/i.test(tag)) return '';
      const alt = (tag.match(/\balt=["']([^"']*)["']/i) || [])[1];
      return alt ? `<span>${alt}</span>` : '';
    });

  let md = nhm.translate(body).replace(/\n{3,}/g, '\n\n').trim();
  // Make site-relative links absolute so the markdown stands on its own.
  const origin = new URL(url).origin;
  md = md.replace(/\]\((\/[^)\s]*)\)/g, (_, p) => `](${origin}${p})`);

  const front = ['---', `title: ${yamlStr(title)}`];
  if (description) front.push(`description: ${yamlStr(description)}`);
  front.push(`url: ${canonical}`, '---', '');
  const hasH1 = /^# /m.test(md);
  return front.join('\n') + (hasH1 || !title ? '' : `# ${title}\n\n`) + md + '\n';
}

async function serveMarkdown(request, url) {
  const headers = new Headers(request.headers);
  headers.set('accept', 'text/html');
  const res = await fetch(new Request(url.toString(), { method: 'GET', headers, redirect: 'manual' }));
  const ct = res.headers.get('content-type') || '';
  if (res.status !== 200 || !ct.includes('text/html')) return null; // let normal handling pass it through
  const md = htmlToMarkdown(await res.text(), url.toString());
  const out = new Headers({
    'content-type': 'text/markdown; charset=utf-8',
    'x-markdown-tokens': String(Math.ceil(md.length / 4)),
    'content-signal': CONTENT_SIGNAL,
    vary: 'Accept',
    'cache-control': 'public, max-age=300',
    'access-control-allow-origin': '*',
    link: [`<${url.origin}${url.pathname}>; rel="canonical"; type="text/html"`, ...LINKS].join(', '),
  });
  return new Response(request.method === 'HEAD' ? null : md, { status: 200, headers: out });
}

function decorate(res, url) {
  const ct = res.headers.get('content-type') || '';
  const path = url.pathname;
  const isHtml = ct.includes('text/html');
  const isWellKnown = path.startsWith('/.well-known/');
  if (!isHtml && !isWellKnown) return res;

  const out = new Response(res.body, res);
  if (isHtml && res.status === 200) {
    out.headers.append('link', LINKS.join(', '));
    out.headers.append('link', `<${path}>; rel="alternate"; type="text/markdown"`);
    out.headers.append('vary', 'Accept');
  }
  if (isWellKnown && res.status === 200) {
    out.headers.set('access-control-allow-origin', '*');
    if (path.endsWith('.tar.gz')) out.headers.set('content-type', 'application/gzip');
    else if (path === '/.well-known/api-catalog') out.headers.set('content-type', 'application/linkset+json');
  }
  return out;
}

export default {
  async fetch(request, env, ctx) {
    ctx.passThroughOnException();
    const url = new URL(request.url);
    const method = request.method;

    if (method === 'OPTIONS' && url.pathname.startsWith('/.well-known/')) {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, HEAD, OPTIONS',
          'access-control-allow-headers': 'Accept, Content-Type',
          'access-control-max-age': '86400',
        },
      });
    }

    if ((method === 'GET' || method === 'HEAD') && !ASSET_EXT.test(url.pathname) &&
        !url.pathname.startsWith('/.well-known/') && wantsMarkdown(request)) {
      try {
        const md = await serveMarkdown(request, url);
        if (md) return md;
      } catch (e) { /* fall through to HTML */ }
    }

    const res = await fetch(request);
    try { return decorate(res, url); } catch (e) { return res; }
  },
};
