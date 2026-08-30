/* Soulcrafter: the AEO strategy game. Rules + state. */
'use strict';

// ---------- Seeded RNG ----------
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed >>> 0; return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- Hex geometry (axial q,r; pointy top) ----------
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
function ringCoords(n) { if (n === 0) return [[0, 0]]; const out = []; let q = -n, r = n; // start at direction 4 * n
  for (let side = 0; side < 6; side++) for (let i = 0; i < n; i++) { out.push([q, r]); q += DIRS[side][0]; r += DIRS[side][1]; } return out; }
function hexDist(a, b) { const dq = a.q - b.q, dr = a.r - b.r; return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2; }

// ---------- Definitions ----------
const MAX_TURNS = 20;

const FOUNDATIONS = [
  { key: 'robots', name: 'Robots Gate', icon: '🚪', cost: 1, weight: 1, real: 'robots.txt', why: 'The gate to your capital. No robots.txt means every crawler guesses. A Disallow: / means nobody gets in.', fix: 'Publish a robots.txt that allows crawling and points to your sitemap.' },
  { key: 'ai', name: 'AI Access', icon: '🤖', cost: 1, weight: 2, real: 'AI crawler rules', why: 'GPTBot, OAI-SearchBot, ClaudeBot, Google-Extended, and the scrapers behind them. Block them and you are invisible in ChatGPT, Claude, and Google AI answers, whatever else you build. Bing matters too: ChatGPT leans on its index.', fix: 'Remove Disallow rules for the AI search crawlers you want citing you. Make sure Bingbot is welcome.' },
  { key: 'sitemap', name: 'Sitemap Roads', icon: '🛣️', cost: 1, weight: 1, real: 'sitemap.xml', why: 'Roads between your cities. A sitemap with lastmod tells crawlers what changed and where to spend their budget.', fix: 'Generate an XML sitemap with lastmod dates and declare it in robots.txt.' },
  { key: 'schema', name: 'Entity Temple', icon: '🏛️', cost: 1, weight: 0.5, real: 'Organization schema (JSON-LD)', why: 'A name card for machines: who you are, where you live, which profiles are yours. Cheap and worth doing, but do not expect it to move citations. Ahrefs tested 1,885 pages that added schema: roughly no change.', fix: 'Add Organization JSON-LD with name, url, logo, sameAs, and description. Then move on.' },
  { key: 'render', name: 'Stone Walls', icon: '🧱', cost: 2, weight: 3, real: 'Text in the HTML response', why: 'The heaviest stone in the ring. ChatGPT fetches your page and uses only what is in the response. Pricing in JavaScript, specs in an image, a homepage that is an empty shell until a script runs: invisible. Walls made of air.', fix: 'Server-side render or pre-render every page that matters. Every claim you want quoted must be plain text in the HTML.' },
  { key: 'meta', name: 'Signposts', icon: '🪧', cost: 1, weight: 1, real: 'Title, description, canonical', why: 'The title is the sign on the gate. The canonical says which gate is the real one.', fix: 'Set a unique title, a real meta description, and a self-referencing canonical on every page.' },
];

const CONTENT = [
  { key: 'guides', name: 'Pillar Guides', icon: '📜', cost: 2, value: 5, aeo: 1.2, real: 'Long-form guides / learn hub', why: 'The library. One authoritative page per claim, kept current, beats ten thin variants chasing keywords. Definitive guides get quoted for years.' },
  { key: 'answers', name: 'Answer Wells', icon: '💧', cost: 1, value: 4, aeo: 1.6, real: 'Direct-answer blocks in plain HTML', why: 'A clear question as a heading, a short quotable answer under it, the detail after. This is what answer engines lift verbatim. FAQ rich results are gone; the schema was never the point, the answer was.' },
  { key: 'compare', name: 'Comparison Arena', icon: '⚔️', cost: 1, value: 4, aeo: 1.5, real: 'Honest "X vs Y" and alternatives pages', why: 'People ask AI to compare, and if you do not write the comparison an aggregator will. But write it straight. Lily Ray tracked 100 "best software" queries: in 69% of cases Google cited a brand\'s self-ranked listicle and recommended a competitor from it.' },
  { key: 'faq', name: 'Help Halls', icon: '❓', cost: 1, value: 3, aeo: 1.3, real: 'FAQ / help center', why: 'Every support question is a search query someone else will ask an AI.' },
  { key: 'blog', name: 'Town Crier', icon: '📣', cost: 1, value: 3, aeo: 0.9, real: 'Blog / news', why: 'Freshness signals and topical breadth. Less citable per post, but the volume adds up.' },
  { key: 'pricing', name: 'Market Square', icon: '💰', cost: 1, value: 3, aeo: 1.7, real: 'Public pricing page, in text', why: 'ChatGPT runs site:yourdomain.com/pricing probes while it thinks. If the page exists and the numbers are in the HTML, you are the source. Hide pricing, or render it in JavaScript, and the answer comes from a competitor or a guess.' },
  { key: 'about', name: 'Hall of Records', icon: '🏰', cost: 1, value: 3, aeo: 1.3, real: 'About, team, and author pages (E-E-A-T)', why: 'Who wrote this, what have they done, where else are they cited. Experience and credentials an engine can check against other sources. Anonymous content is a rumor.' },
  { key: 'cases', name: 'Trophy Room', icon: '🏆', cost: 2, value: 4, aeo: 1.2, real: 'Case studies / customers', why: 'Named outcomes with numbers. Proof that survives being summarized.' },
  { key: 'glossary', name: 'Scriptorium', icon: '📖', cost: 1, value: 3, aeo: 1.5, real: 'Glossary / definitions', why: '"What is X" prompts are enormous. Definitions are the cheapest citations you will ever earn.' },
  { key: 'docs', name: 'Workshop', icon: '🔧', cost: 2, value: 3, aeo: 1.3, real: 'Docs / API reference', why: 'Developer questions get asked to AI first. Docs that render as HTML get cited; docs behind an app do not.' },
  { key: 'landing', name: 'Guild Houses', icon: '🏘️', cost: 1, value: 3, aeo: 1.0, real: 'Solution / use-case landing pages', why: 'One page per problem you solve, in the words the buyer uses.' },
  { key: 'research', name: 'Observatory', icon: '🔭', cost: 3, value: 6, aeo: 1.8, real: 'Original research / data study', why: 'Original numbers are the rarest thing on the web, and the only asset no platform can revoke. Every AI answer that uses your stat is a citation you own.' },
];

const CITATIONS = [
  { key: 'linkedin', name: 'LinkedIn Fort', icon: '💼', cost: 1, value: 3, social: 'linkedin', why: 'Underrated. Around 14% of ChatGPT and Google AI Mode citations in 2026 aggregates point at LinkedIn. Company page, founder profiles, and posts that state facts plainly.' },
  { key: 'wikidata', name: 'Wikidata Vault', icon: '🗝️', cost: 1, value: 3, prereq: { foundation: 'schema' }, why: 'The structured-data source most AI systems ingest. Almost nobody claims it. Requires an entity to point at.' },
  { key: 'crunchbase', name: 'Crunchbase Tower', icon: '🗼', cost: 1, value: 2, social: 'crunchbase', why: 'Funding, founders, dates. Entity facts that answer engines trust.' },
  { key: 'github', name: 'GitHub Forge', icon: '⚙️', cost: 1, value: 2, social: 'github', why: 'For technical brands, the forge is where developers (and their AI assistants) look first.' },
  { key: 'youtube', name: 'YouTube Amphitheater', icon: '🎬', cost: 2, value: 2, social: 'youtube', why: 'Google cites it. ChatGPT fetches it constantly and almost never cites it: it only gets the metadata, not the transcript. Worth holding, priced honestly.' },
  { key: 'x', name: 'X Outpost', icon: '🐦', cost: 1, value: 1, social: 'x', why: 'Low value on its own, but Grok reads it and it feeds the entity graph.' },
  { key: 'reddit', name: 'Reddit Commons', icon: '🔥', cost: 2, value: 5, contest: true, why: 'The most cited third-party source across the engines, earned in the threads, never bought. Also the most volatile: in August 2026 a ChatGPT fan-out change cut its citations 86% in four days. Hold it, but do not build on it alone.' },
  { key: 'quora', name: 'Quora Well', icon: '🗣️', cost: 1, value: 2, contest: true, why: 'Old questions, still ranking, still cited. Answer them properly.' },
  { key: 'g2', name: 'Review Bazaar', icon: '⭐', cost: 2, value: 2, social: 'g2', why: 'G2, Capterra, Trustpilot. Vendors quote big numbers; independent data says a modest lift, and only for software queries. Even G2\'s own analysis found review volume explains under 2% of citation variance. Priced accordingly.' },
  { key: 'producthunt', name: 'Product Hunt Camp', icon: '🐱', cost: 1, value: 2, social: 'producthunt', why: 'A launch page that stays indexed forever. Small, permanent citation.' },
  { key: 'industry', name: 'Trade Press Keep', icon: '📰', cost: 2, value: 4, press: true, why: 'Industry publications are the mid-tier authority that unlocks the top tier.' },
  { key: 'press', name: 'Tier-1 Press Citadel', icon: '🏯', cost: 3, value: 5, press: true, prereq: { citation: 'industry' }, why: 'Forbes, Reuters, the trade titles everyone reads. Expensive, slow, and the citation weight both Google and the licensed-publisher feeds inside ChatGPT lean on hardest.' },
  { key: 'wikipedia', name: 'Wikipedia Citadel', icon: '📚', cost: 3, value: 6, prereq: { citation: 'press', foundation: 'schema' }, why: 'The capital of the entity graph and a licensed source inside ChatGPT. Requires notability: press that already exists. Never write it yourself; that is how you lose it.' },
  { key: 'podcast', name: 'Podcast Circle', icon: '🎙️', cost: 2, value: 3, why: 'Show notes and transcripts get indexed. Guest spots put your name next to the topic.' },
  { key: 'newsletter', name: 'Newsletter Caravan', icon: '✉️', cost: 1, value: 2, social: 'substack', why: 'Substack and Beehiiv archives are public and indexed. Every issue is a page.' },
  { key: 'directory', name: 'Directory Waystation', icon: '🪧', cost: 1, value: 1, contest: true, why: 'Clutch, GoodFirms, niche directories. Low value each, but they confirm NAP facts.' },
  { key: 'partners', name: 'Allied Banners', icon: '🤝', cost: 2, value: 3, why: 'Partner pages, integrations directories, co-marketing. Links from brands that already have authority.' },
  { key: 'community', name: 'Community Guild', icon: '🏕️', cost: 2, value: 3, contest: true, why: 'Slack groups, Discord, niche forums, Stack Overflow. Where the real recommendations get made.' },
];

const RIVALS = [
  { key: 'incumbent', name: 'The Incumbent', color: '#e5484d', icon: '🦁', style: 'Holds the old fortresses. Slow, but heavy.', base: 34, growth: 0.8 },
  { key: 'aggregator', name: 'The Aggregator', color: '#f5a524', icon: '🦊', style: 'Lives in Reddit threads and listicles. Contests everything.', base: 20, growth: 1.1 },
  { key: 'challenger', name: 'The Challenger', color: '#7c5cff', icon: '🐺', style: 'Ships content weekly. Fast, thin, relentless.', base: 8, growth: 1.7 },
];

const EVENTS = [
  { key: 'core', name: 'Core Update', icon: '🌪️', text: 'A core update rolls through. Thin content loses ground; refreshed pages hold.', apply: (s) => { s.mods.contentL1 = Math.max(0.6, s.mods.contentL1 - 0.15); } },
  { key: 'redditlove', name: 'The Engines Love Reddit', icon: '🔥', text: 'A new model version cites Reddit threads twice as often. The Commons just got more valuable.', apply: (s) => { s.mods.hexValue.reddit = (s.mods.hexValue.reddit || 0) + 2; } },
  { key: 'fanout', name: 'The Fanout Shift', icon: '🌀', text: 'OpenAI changed how ChatGPT search fans out. Reddit citations fall 86% in four days. Nobody says why. Whatever you held there is worth a fifth of what it was.', apply: (s) => { s.mods.hexValue.reddit = -4; const h = s.hexes.find(h => h.key === 'reddit'); if (h && h.status === 'owned') s.log.push({ t: 'Your Reddit Commons still stands, but the engines stopped looking. Owned depth survives; granted visibility does not.', bad: true }); } },
  { key: 'listicle', name: 'The Listicle Trap', icon: '🪤', text: 'Someone on the team shipped \'Top 10 tools in our category\' with you at #1. Google cites the page and recommends the competitors you listed. A citation is not a recommendation.', apply: (s) => { const h = s.hexes.find(h => h.key === 'compare'); if (h && h.status === 'built' && h.level < 2) { s.mods.hexValue.compare = -3; s.rivals[1].bonus += 5; } else if (h && h.level >= 2) s.log.push({ t: 'Your Comparison Arena was already written straight. The trap found nothing to bite.', good: true }); else s.rivals[1].bonus += 3; } },
  { key: 'canonical', name: 'CMS Update Broke Canonicals', icon: '💥', text: 'A plugin update rewrote your canonical tags. Your Signposts fell over.', apply: (s) => { const h = s.hexes.find(h => h.key === 'meta'); if (h && h.status === 'built') { h.status = 'ruin'; h.note = 'Knocked down by a CMS update.'; } } },
  { key: 'journalist', name: 'A Journalist Calls', icon: '📞', text: 'A reporter wants a quote on your category. Your next press citation costs 1 less.', apply: (s) => { s.mods.pressDiscount = 1; } },
  { key: 'rivalcompare', name: 'Rival Publishes "Alternatives" Page', icon: '⚔️', text: 'The Aggregator published "Top 10 alternatives to ' + '{brand}' + '". It ranks. It is not flattering.', apply: (s) => { s.rivals[1].bonus += 6; } },
  { key: 'crawlbudget', name: 'Crawl Budget Squeeze', icon: '🐌', text: 'Crawlers are spending less time on you. Without Sitemap Roads, new pages wait weeks to be seen.', apply: (s) => { const h = s.hexes.find(h => h.key === 'sitemap'); if (h && h.status !== 'built') s.mods.contentL1 = Math.max(0.5, s.mods.contentL1 - 0.2); else s.log.push({ t: 'Your Sitemap Roads held. No damage.' }); } },
  { key: 'aiblock', name: 'Security Team Blocks Bots', icon: '🛡️', text: 'Someone in IT added a WAF rule that blocks "unknown bots". Your AI Access is down until you fix it.', apply: (s) => { const h = s.hexes.find(h => h.key === 'ai'); if (h && h.status === 'built') { h.status = 'ruin'; h.note = 'Blocked by a WAF rule. Whitelist the AI crawlers.'; } } },
  { key: 'quoted', name: 'Your Stat Gets Quoted', icon: '📈', text: 'A number from your Observatory shows up in an AI answer. Authority rises.', apply: (s) => { const h = s.hexes.find(h => h.key === 'research'); if (h && h.status === 'built') s.mods.hexValue.research = (s.mods.hexValue.research || 0) + 3; else s.log.push({ t: 'You have no Observatory yet. The quote went to a rival.' }); } },
  { key: 'challenger', name: 'Challenger Raises a Round', icon: '💸', text: 'The Challenger just raised. They are hiring three writers.', apply: (s) => { s.rivals[2].growth += 0.6; } },
];


// ---------- Live evaluation of the Code ring (used at start and by Verify) ----------
function evalFoundations(scout) {
  const rb = scout.robots || {}, pg = scout.page, sm = scout.sitemap || {};
  const out = {};
  out.robots = { built: !!(rb.found && !rb.blocksEverything), detail: !rb.found ? 'No robots.txt found (HTTP ' + (rb.status || 0) + ').' : rb.blocksEverything ? 'robots.txt has Disallow: / for all crawlers.' : 'robots.txt found, ' + (rb.groups || 0) + ' user-agent group' + (rb.groups === 1 ? '' : 's') + (rb.sitemaps?.length ? ', declares a sitemap.' : ', no Sitemap: line.') };
  const bots = rb.bots || {}; const blocked = Object.entries(bots).filter(([k, v]) => v === 'blocked' && ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'OAI-SearchBot', 'Google-Extended'].includes(k)).map(([k]) => k);
  out.ai = { built: blocked.length === 0, detail: blocked.length ? 'Blocked: ' + blocked.join(', ') + '.' : rb.found ? 'GPTBot, ClaudeBot, OAI-SearchBot, Google-Extended all allowed.' : 'No robots.txt, so AI crawlers are allowed by default.' };
  if (!out.robots.built && out.ai.built) out.ai.detail += ' Build the Robots Gate to make it explicit.';
  out.sitemap = { built: !!sm.found, detail: sm.found ? (sm.count + ' URLs' + (sm.isIndex ? ' across ' + sm.children + ' child sitemaps' : '') + (sm.lastmod ? ', lastmod present.' : ', no lastmod dates.')) : 'No sitemap.xml at the usual paths or in robots.txt.' };
  const types = (pg?.schemaTypes || []);
  const entity = types.some(t => /^(Organization|Corporation|LocalBusiness|ProfessionalService|SoftwareApplication|Brand)$/i.test(t) || /Business$/i.test(t));
  out.schema = { built: entity, detail: entity ? 'Entity schema found: ' + types.filter(t => t !== 'Answer' && t !== 'Question').slice(0, 6).join(', ') + '.' : types.length ? 'JSON-LD present (' + types.slice(0, 4).join(', ') + ') but no Organization entity.' : 'No JSON-LD structured data on the homepage.' };
  out.render = { built: !!pg && !pg.spaSuspect && pg.h1s >= 1, detail: !pg ? 'Homepage did not return HTML (status ' + scout.home?.status + ').' : pg.spaSuspect ? 'Only ' + pg.words + ' words in the HTML response. Looks like a client-rendered app.' : pg.h1s < 1 ? pg.words + ' words rendered but no H1.' : pg.words + ' words in the HTML, ' + pg.h1s + ' H1, ' + pg.h2s + ' H2s. Renders server-side.' };
  out.meta = { built: !!(pg && pg.title && pg.description && pg.canonical), detail: !pg ? 'No page to read.' : [pg.title ? null : 'missing title', pg.description ? null : 'missing meta description', pg.canonical ? null : 'missing canonical'].filter(Boolean).join(', ') || 'Title, description, and canonical all present.' };
  return out;
}
function applyFoundationEval(s, ev) {
  for (const h of s.hexes.filter(h => h.kind === 'foundation')) { const e = ev[h.key]; h.status = e.built ? 'built' : 'ruin'; h.detail = e.detail; h.verified = e.built; h.simulated = false; }
}
// Verify one Code hex against a fresh live scout. Returns a log line.
function verifyHex(s, h, scout) {
  const e = evalFoundations(scout)[h.key]; if (!e) return null;
  h.detail = e.detail; h.checkedAt = Date.now();
  let line;
  if (e.built && h.status !== 'built') { h.status = 'built'; h.note = null; h.verified = true; h.simulated = false; line = { t: '✅ ' + h.name + ' confirmed live. Rebuilt for free. ' + e.detail, good: true }; }
  else if (e.built) { h.verified = true; h.simulated = false; h.note = null; line = { t: '✅ ' + h.name + ' verified live. ' + e.detail, good: true }; }
  else if (h.status === 'built') { h.verified = false; h.simulated = true; line = { t: '⚠️ ' + h.name + ' is standing in the game but not live yet. ' + e.detail, bad: true }; }
  else { h.verified = false; line = { t: '✗ ' + h.name + ' still not live. ' + e.detail, bad: true }; }
  s.log.push(line); recompute(s); return line;
}

// ---------- State ----------
function niceBrand(b) { if (!b) return b; const t = b.replace(/[.,]+$/, '').trim(); if (t.length > 3 && t === t.toUpperCase()) return t.toLowerCase().replace(/(^|[\s\-])([a-z])/g, (m, p, c) => p + c.toUpperCase()).replace(/\b(Llc|Plc|Gmbh)\b/g, (m) => m.toUpperCase()); return t; }
function buildState(scout) {
  scout.brand = niceBrand(scout.brand);
  const seed = hashStr(scout.host);
  const R = rng(seed);
  const s = { brand: scout.brand, host: scout.host, scout, seed, turn: 1, ap: 3, apMax: 3, selected: null, log: [], over: false,
    mods: { contentL1: 1, hexValue: {}, pressDiscount: 0 }, rivals: RIVALS.map(r => ({ ...r, bonus: 0 })), history: [], R };

  const hexes = [];
  hexes.push({ id: 'capital', q: 0, r: 0, ring: 0, kind: 'capital', key: 'capital', name: scout.brand, icon: '👑', status: 'built', real: scout.host, why: 'Your capital: the homepage. Everything radiates from here.' });

  const r1 = ringCoords(1), r2 = ringCoords(2), r3 = ringCoords(3);
  FOUNDATIONS.forEach((f, i) => hexes.push({ ...f, id: f.key, q: r1[i][0], r: r1[i][1], ring: 1, kind: 'foundation', status: 'ruin' }));
  CONTENT.forEach((c, i) => hexes.push({ ...c, id: c.key, q: r2[i][0], r: r2[i][1], ring: 2, kind: 'content', status: 'empty', level: 0 }));
  CITATIONS.forEach((c, i) => hexes.push({ ...c, id: c.key, q: r3[i][0], r: r3[i][1], ring: 3, kind: 'citation', status: 'fog', owner: null, hidden: 'neutral' }));
  s.hexes = hexes;
  const H = (k) => hexes.find(h => h.key === k);

  // ----- Code ring from the real scout -----
  applyFoundationEval(s, evalFoundations(scout));
  const pg = scout.page, sm = scout.sitemap || {};
  const types = (pg?.schemaTypes || []);

  // ----- Content from the sitemap -----
  const p = sm.paths || {};
  const seedContent = (k, cond, detail) => { const h = H(k); if (cond) { h.status = 'built'; h.level = 1; h.detail = detail + ' Found in the sitemap; paste the page URL and verify to prove it renders.'; h.seeded = true; } else h.detail = detail; };
  seedContent('guides', p.guides > 0, p.guides ? p.guides + ' guide/learn URLs in the sitemap.' : 'No guides, learn, or resources URLs in the sitemap.');
  seedContent('blog', p.blog > 0, p.blog ? p.blog + ' blog/news URLs in the sitemap.' : 'No blog or news URLs found.');
  seedContent('faq', p.faq > 0, p.faq ? p.faq + ' help/FAQ URLs.' : 'No FAQ or help URLs found.');
  seedContent('compare', p.compare > 0, p.compare ? p.compare + ' comparison/alternatives URLs.' : 'No "vs" or "alternatives" pages found.');
  seedContent('pricing', p.pricing > 0, p.pricing ? 'Pricing page in the sitemap.' : 'No pricing URL in the sitemap.');
  seedContent('about', p.about > 0, p.about ? 'About/company page found.' : 'No about or team URL found.');
  seedContent('cases', p.cases > 0, p.cases ? p.cases + ' case study/customer URLs.' : 'No case studies found.');
  seedContent('glossary', p.glossary > 0, p.glossary ? p.glossary + ' glossary/definition URLs.' : 'No glossary found.');
  seedContent('docs', p.docs > 0, p.docs ? p.docs + ' docs/API URLs.' : 'No docs URLs found.');
  seedContent('landing', p.landing > 0, p.landing ? p.landing + ' solution/product landing URLs.' : 'No solution or use-case pages found.');
  seedContent('answers', types.includes('FAQPage') || (pg && pg.h2s >= 6 && pg.words >= 800), types.includes('FAQPage') ? 'FAQPage schema on the homepage, so direct answers exist somewhere.' : (pg && pg.h2s >= 6 && pg.words >= 800) ? pg.h2s + ' H2 sections on the homepage: structured enough to quote.' : 'No question headings with short answers detected.');
  seedContent('research', false, 'Original research cannot be detected from a crawl. Assume none until you build it.');
  if (!sm.found) hexes.filter(h => h.kind === 'content').forEach(h => { if (h.status === 'empty') h.detail = 'No sitemap, so the land is unmapped. ' + h.detail; });

  // ----- Citations: what the homepage already links to -----
  const socials = new Set(pg?.socials || []);
  for (const h of hexes.filter(h => h.kind === 'citation')) {
    if (h.social && socials.has(h.social)) { h.hidden = 'owned'; h.verified = true; h.detail = 'Your homepage links to it (sameAs or footer). Already held, verified by entity link.'; }
  }
  const wiki = scout.wikipedia;
  if (wiki?.exact) { H('wikipedia').hidden = 'owned'; H('wikipedia').detail = 'A Wikipedia article titled "' + wiki.top + '" exists. Verify it is actually about you.'; H('wikipedia').verify = true; }
  else if (wiki?.likely) { H('wikipedia').hidden = 'rival'; H('wikipedia').owner = 'incumbent'; H('wikipedia').detail = 'Closest article is "' + wiki.top + '". Not clearly yours. The Incumbent holds the name.'; }
  if (socials.has('wikipedia') && H('wikipedia').hidden !== 'owned') { H('wikipedia').hidden = 'owned'; H('wikipedia').detail = 'Your homepage links to a Wikipedia page.'; }

  // ----- Rivals seize territory -----
  const claim = (k, owner) => { const h = H(k); if (h.hidden === 'neutral') { h.hidden = 'rival'; h.owner = owner; } };
  const incumbentPicks = ['press', 'industry', 'g2', 'podcast', 'partners', 'wikipedia'].filter(() => R() < 0.75);
  incumbentPicks.slice(0, 4).forEach(k => claim(k, 'incumbent'));
  ['reddit', 'quora', 'directory', 'community'].filter(() => R() < 0.8).slice(0, 3).forEach(k => claim(k, 'aggregator'));
  ['producthunt', 'newsletter', 'youtube', 'x'].filter(() => R() < 0.5).slice(0, 2).forEach(k => claim(k, 'challenger'));

  // Owned citations are visible from the start, and reveal their neighbors
  for (const h of hexes.filter(h => h.kind === 'citation' && h.hidden === 'owned')) revealHex(s, h);
  revealNeighborsOf(s, hexes.filter(h => h.kind === 'content' && h.status === 'built'));

  s.log.push({ t: 'The fog lifts around ' + scout.brand + '. ' + hexes.filter(h => h.kind === 'foundation' && h.status === 'built').length + ' of 6 code hexes stand. ' + hexes.filter(h => h.kind === 'content' && h.status === 'built').length + ' content districts mapped.' });
  recompute(s);
  s.apMax = apFor(s); s.ap = s.apMax;
  s.history.push(snapshot(s));
  return s;
}

function revealHex(s, h) { if (h.kind !== 'citation' || h.status !== 'fog') return; h.status = h.hidden; }
function revealNeighborsOf(s, list) { for (const c of list) for (const h of s.hexes) if (h.kind === 'citation' && h.status === 'fog' && hexDist(c, h) === 1) revealHex(s, h); }

// ---------- Derived stats ----------
function crawlability(s) { let got = 0, tot = 0; for (const h of s.hexes.filter(h => h.kind === 'foundation')) { tot += h.weight; if (h.status === 'built') got += h.weight; } return Math.round(100 * got / tot); }
function gate(c) { return 0.12 + 0.88 * Math.pow(c / 100, 1.6); }
function contentScore(s) { let v = 0; for (const h of s.hexes.filter(h => h.kind === 'content' && h.status === 'built')) v += Math.max(0, h.value + (s.mods.hexValue[h.key] || 0)) * h.aeo * (h.level >= 2 ? 1.6 : s.mods.contentL1); return v; }
function contentMax() { return CONTENT.reduce((a, c) => a + c.value * c.aeo * 1.6, 0); }
function authorityScore(s) { let v = 0; for (const h of s.hexes.filter(h => h.kind === 'citation' && h.status === 'owned')) v += Math.max(0, h.value + (s.mods.hexValue[h.key] || 0)); return v; }
function authorityMax() { return CITATIONS.reduce((a, c) => a + c.value, 0); }
function aiGateMult(s) { const ai = s.hexes.find(h => h.key === 'ai'); return ai.status === 'built' ? 1 : 0.35; }
function visibility(s) { const c = crawlability(s); const cov = 100 * contentScore(s) / contentMax(); const auth = 100 * authorityScore(s) / authorityMax(); return 1.8 * gate(c) * aiGateMult(s) * (0.45 * cov + 0.55 * auth); }
function rivalVisibility(s, r) { const held = s.hexes.filter(h => h.kind === 'citation' && h.owner === r.key && h.status !== 'owned').reduce((a, h) => a + Math.max(0, h.value + (s.mods.hexValue[h.key] || 0)), 0); return r.base + r.bonus + r.growth * (s.turn - 1) + held * 1.6; }
// ---------- Verified-only view: the same formula, counting only hexes proven live ----------
function vCrawl(s) { let got = 0, tot = 0; for (const h of s.hexes.filter(h => h.kind === 'foundation')) { tot += h.weight; if (h.status === 'built' && h.verified) got += h.weight; } return Math.round(100 * got / tot); }
function vContent(s) { let v = 0; for (const h of s.hexes.filter(h => h.kind === 'content' && h.status === 'built' && h.verified)) v += Math.max(0, h.value + (s.mods.hexValue[h.key] || 0)) * h.aeo * ((h.verifiedLevel || 1) >= 2 ? 1.6 : s.mods.contentL1); return v; }
function vAuthority(s) { let v = 0; for (const h of s.hexes.filter(h => h.kind === 'citation' && h.status === 'owned' && h.verified)) v += Math.max(0, h.value + (s.mods.hexValue[h.key] || 0)); return v; }
function vVisibility(s) { const c = vCrawl(s); const ai = s.hexes.find(h => h.key === 'ai'); const aiMult = ai.status === 'built' && ai.verified ? 1 : 0.35; return 1.8 * gate(c) * aiMult * (0.45 * 100 * vContent(s) / contentMax() + 0.55 * 100 * vAuthority(s) / authorityMax()); }
function recompute(s) {
  const me = visibility(s); const rv = s.rivals.map(r => rivalVisibility(s, r)); const total = me + rv.reduce((a, b) => a + b, 0);
  const vme = vVisibility(s); const vtotal = vme + rv.reduce((a, b) => a + b, 0);
  const all = s.hexes.filter(h => h.kind !== 'capital'); const built = all.filter(h => (h.kind === 'citation' ? h.status === 'owned' : h.status === 'built'));
  s.stats = { crawl: crawlability(s), coverage: Math.min(100, Math.round(100 * contentScore(s) / contentMax())), authority: Math.min(100, Math.round(100 * authorityScore(s) / authorityMax())), visibility: Math.min(100, Math.round(me / 1.8)), sov: total ? Math.round(100 * me / total) : 0, rivalSov: rv.map(v => total ? Math.round(100 * v / total) : 0),
    vcrawl: vCrawl(s), vcoverage: Math.min(100, Math.round(100 * vContent(s) / contentMax())), vauthority: Math.min(100, Math.round(100 * vAuthority(s) / authorityMax())), vsov: vtotal ? Math.round(100 * vme / vtotal) : 0,
    built: built.length, verified: built.filter(h => h.verified).length, simulated: built.filter(h => !h.verified).length };
  return s.stats;
}
// Apply a /api/verify result to a Content or Citation hex. Real evidence beats the simulation, in both directions.
function applyProof(s, h, r) {
  h.proof = r.url || h.proof; h.checkedAt = Date.now(); let line;
  if (r.status === 'verified') {
    const was = h.kind === 'citation' ? h.status === 'owned' : h.status === 'built';
    if (h.kind === 'content') { h.status = 'built'; h.verifiedLevel = r.level || 1; h.level = Math.max(h.level || 0, h.verifiedLevel); }
    else { if (h.status === 'fog') h.hidden = 'owned'; h.status = 'owned'; h.owner = null; h.weakened = false; }
    h.verified = true; h.simulated = false; h.note = null; h.detail = r.detail;
    line = { t: '✅ ' + h.name + (was ? ' verified live. ' : ' confirmed live and ' + (h.kind === 'content' ? 'built' : 'claimed') + ' for free. ') + r.detail, good: true };
    if (!was) revealNeighborsOf(s, [h]);
  } else if (r.status === 'unconfirmed') {
    h.verified = false; if (h.kind === 'content' ? h.status === 'built' : h.status === 'owned') h.simulated = true;
    h.note = r.detail; line = { t: '⚠️ ' + h.name + ' not confirmed. ' + r.detail, bad: true };
  } else { h.verified = false; h.note = r.detail; line = { t: '✗ ' + h.name + ': ' + r.detail, bad: true }; }
  s.log.push(line); recompute(s); return line;
}
function apFor(s) { const owned = s.hexes.filter(h => (h.kind === 'foundation' && h.status === 'built') || (h.kind === 'content' && h.status === 'built') || (h.kind === 'citation' && h.status === 'owned')).length; return 3 + Math.floor(owned / 9); }
function snapshot(s) { return { turn: s.turn, sov: s.stats.sov, vis: s.stats.visibility, rivals: s.stats.rivalSov.slice() }; }

// ---------- Unlocks / doctrine ----------
function foundationsBuilt(s) { return s.hexes.filter(h => h.kind === 'foundation' && h.status === 'built').length; }
function contentBuilt(s) { return s.hexes.filter(h => h.kind === 'content' && h.status === 'built').length; }
function phase(s) { if (foundationsBuilt(s) < 3) return 1; if (contentBuilt(s) < 3) return 2; return 3; }
function prereqMissing(s, h) {
  if (!h.prereq) return null; const miss = [];
  if (h.prereq.foundation) { const f = s.hexes.find(x => x.key === h.prereq.foundation); if (f.status !== 'built') miss.push(f.name); }
  if (h.prereq.citation) { const c = s.hexes.find(x => x.key === h.prereq.citation); if (c.status !== 'owned') miss.push(c.name); }
  return miss.length ? miss : null;
}

// ---------- Actions ----------
function actionFor(s, h) {
  if (s.over) return null;
  if (h.kind === 'capital') return null;
  if (h.kind === 'foundation') { if (h.status === 'built') return { label: 'Standing', done: true }; return { label: 'Rebuild', cost: h.cost, verb: 'rebuild', ok: s.ap >= h.cost }; }
  if (h.kind === 'content') {
    if (foundationsBuilt(s) < 3) return { label: 'Locked: fix 3 code hexes first', locked: true };
    if (h.status === 'built' && h.level >= 2) return { label: 'Refreshed', done: true };
    if (h.status === 'built') return { label: 'Rewrite for answers', cost: 1, verb: 'refresh', ok: s.ap >= 1 };
    return { label: 'Build', cost: h.cost, verb: 'build', ok: s.ap >= h.cost };
  }
  if (h.kind === 'citation') {
    if (h.status === 'fog') return { label: 'In the fog. Build adjacent content or send a scout.', locked: true };
    if (h.status === 'owned') return { label: 'Held', done: true };
    if (contentBuilt(s) < 3) return { label: 'Locked: build 3 content districts first', locked: true };
    const miss = prereqMissing(s, h); if (miss) return { label: 'Requires ' + miss.join(' + '), locked: true };
    let cost = h.cost; if (h.press && s.mods.pressDiscount) cost = Math.max(1, cost - 1);
    if (h.status === 'rival') { const c = cost + 1; return { label: 'Contest', cost: c, verb: 'contest', ok: s.ap >= c, chance: contestChance(s, h) }; }
    return { label: 'Claim', cost, verb: 'claim', ok: s.ap >= cost };
  }
  return null;
}
function contestChance(s, h) { const adj = s.hexes.filter(x => hexDist(x, h) === 1 && ((x.kind === 'citation' && x.status === 'owned') || (x.kind === 'content' && x.status === 'built'))).length; const r = s.rivals.find(r => r.key === h.owner); const base = 0.35 + (s.stats.authority - 30) * 0.008 + adj * 0.08 - (r.key === 'incumbent' ? 0.1 : 0) + (h.weakened ? 0.2 : 0); return Math.max(0.15, Math.min(0.9, base)); }

function doAction(s, h) {
  const a = actionFor(s, h); if (!a || !a.verb || !a.ok) return false;
  s.ap -= a.cost;
  if (a.verb === 'rebuild') { h.status = 'built'; h.note = null; h.simulated = true; h.verified = false; s.log.push({ t: h.icon + ' ' + h.name + ' rebuilt. ' + h.fix, good: true }); }
  if (a.verb === 'build') { h.status = 'built'; h.level = 1; h.simulated = true; h.verified = false; s.log.push({ t: h.icon + ' ' + h.name + ' built (' + h.real + ').', good: true }); revealNeighborsOf(s, [h]); }
  if (a.verb === 'refresh') { h.level = 2; if (h.verifiedLevel !== 2) h.refreshSim = true; s.log.push({ t: h.icon + ' ' + h.name + ' rewritten: question headings, direct answers, fresh dates.', good: true }); }
  if (a.verb === 'claim') { h.status = 'owned'; h.owner = null; h.simulated = true; h.verified = false; if (h.press && s.mods.pressDiscount) s.mods.pressDiscount = 0; s.log.push({ t: h.icon + ' ' + h.name + ' claimed. +' + h.value + ' authority.', good: true }); revealNeighborsOf(s, [h]); }
  if (a.verb === 'contest') {
    const roll = s.R(); const rival = s.rivals.find(r => r.key === h.owner);
    if (roll < a.chance) { h.status = 'owned'; h.owner = null; h.weakened = false; h.simulated = true; h.verified = false; s.log.push({ t: h.icon + ' You took ' + h.name + ' from ' + rival.name + '! +' + h.value + ' authority.', good: true }); revealNeighborsOf(s, [h]); }
    else { h.weakened = true; s.log.push({ t: h.icon + ' ' + rival.name + ' held ' + h.name + '. Their grip weakened (+20% next attempt).', bad: true }); }
  }
  recompute(s); return true;
}

function scoutAction(s) {
  if (s.over || s.ap < 1) return false; const fog = s.hexes.filter(h => h.kind === 'citation' && h.status === 'fog'); if (!fog.length) return false;
  s.ap -= 1; const n = Math.min(4, fog.length);
  for (let i = 0; i < n; i++) { const idx = Math.floor(s.R() * fog.length); revealHex(s, fog.splice(idx, 1)[0]); }
  s.log.push({ t: '🔭 Scouts return. ' + n + ' sources revealed beyond the fog.' }); recompute(s); return true;
}

// ---------- Turn end: rivals + events ----------
function endTurn(s) {
  if (s.over) return;
  const R = s.R; const notes = [];
  // Rivals move
  for (const r of s.rivals) {
    const wants = r.key === 'incumbent' ? 0.35 : r.key === 'aggregator' ? 0.5 : 0.45;
    if (R() < wants) {
      const pool = s.hexes.filter(h => h.kind === 'citation' && (h.status === 'neutral' || (h.status === 'fog' && h.hidden === 'neutral')) && !(h.prereq && h.prereq.citation === 'press'));
      const pref = r.key === 'aggregator' ? pool.filter(h => h.contest) : r.key === 'incumbent' ? pool.filter(h => h.value >= 3) : pool.filter(h => h.cost <= 2);
      const pick = (pref.length ? pref : pool)[Math.floor(R() * (pref.length ? pref : pool).length)];
      if (pick) { pick.owner = r.key; if (pick.status === 'fog') pick.hidden = 'rival'; else pick.status = 'rival'; notes.push({ t: r.icon + ' ' + r.name + ' planted a banner on ' + pick.name + '.', bad: true }); }
    }
  }
  // Event
  if (s.turn >= 2 && R() < 0.38) {
    const used = new Set(s.usedEvents || []); const pool = EVENTS.filter(e => !used.has(e.key));
    if (pool.length) { const e = pool[Math.floor(R() * pool.length)]; (s.usedEvents = s.usedEvents || []).push(e.key); e.apply(s); s.event = { ...e, text: e.text.replace('{brand}', s.brand) }; notes.push({ t: e.icon + ' ' + e.name + ': ' + s.event.text, event: true }); }
  } else s.event = null;
  s.turn += 1; recompute(s); s.history.push(snapshot(s));
  s.log.push({ t: '— Turn ' + (s.turn - 1) + ' ends. Share of voice ' + s.stats.sov + '%.' }); notes.forEach(n => s.log.push(n));
  if (s.turn > MAX_TURNS) { s.over = true; s.turn = MAX_TURNS; return; }
  s.apMax = apFor(s); s.ap = s.apMax;
}

// ---------- Field report (the real payoff) ----------
function fieldReport(s) {
  const items = [];
  for (const h of s.hexes.filter(h => h.kind === 'foundation')) items.push({ icon: h.icon, name: h.real, ok: h.status === 'built' && !h.note, detail: h.detail, fix: h.fix, note: h.note });
  const missing = s.hexes.filter(h => h.kind === 'content' && (h.status !== 'built' || h.level < 2) && ['answers', 'compare', 'glossary', 'pricing', 'guides', 'about', 'research'].includes(h.key));
  const held = s.hexes.filter(h => h.kind === 'citation' && h.status === 'owned').map(h => h.name.replace(/ (Fort|Vault|Tower|Forge|Amphitheater|Outpost|Commons|Well|Bazaar|Camp|Keep|Citadel|Circle|Caravan|Waystation|Banners|Guild)$/, ''));
  const rank = s.stats.sov >= 50 ? 'Sovereign' : s.stats.sov >= 35 ? 'Citadel' : s.stats.sov >= 20 ? 'Outpost' : 'Lost in the Fog';
  const vs = s.stats.vsov; const vrank = vs >= 50 ? 'Sovereign' : vs >= 35 ? 'Citadel' : vs >= 20 ? 'Outpost' : 'Lost in the Fog';
  const owned = (h) => h.kind === 'citation' ? h.status === 'owned' : h.status === 'built';
  const simulated = s.hexes.filter(h => h.kind !== 'capital' && owned(h) && !h.verified);
  const verified = s.hexes.filter(h => h.kind !== 'capital' && owned(h) && h.verified);
  return { rank, vrank, items, missing, held, simulated, verified };
}

window.Citadel = { buildState, verifyHex, evalFoundations, applyProof, actionFor, doAction, scoutAction, endTurn, recompute, phase, fieldReport, hexDist, MAX_TURNS, RIVALS, FOUNDATIONS, CONTENT, CITATIONS, foundationsBuilt, contentBuilt, prereqMissing, contestChance };
