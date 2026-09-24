// AEO Agency AI-Readiness Audit v1.0 — run in the browser console on an agency's homepage.
// Returns raw measurements; score.py turns them into points per rubric.md.
(async () => {
  const UAS = ['GPTBot','OAI-SearchBot','ChatGPT-User','ClaudeBot','Claude-SearchBot','Claude-User','PerplexityBot','Perplexity-User','Google-Extended','Applebot-Extended'];
  const O = location.origin;
  const get = async (u) => { try { const r = await fetch(u, {cache:'no-store', redirect:'follow', credentials:'omit'}); return {s:r.status, t:await r.text()}; } catch (e) { return {s:0, t:''}; } };

  // robots.txt
  const rb = await get(O + '/robots.txt');
  const isHtml = /<(!doctype|html)/i.test(rb.t.slice(0, 600));
  const groups = []; let cur = null, lastUA = false; const sitemaps = [];
  if (rb.s === 200 && !isHtml) {
    for (let line of rb.t.split(/\r?\n/)) {
      line = line.replace(/#.*/, '').trim();
      const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/); if (!m) continue;
      const k = m[1].toLowerCase(), v = m[2].trim();
      if (k === 'user-agent') { if (!cur || !lastUA) { cur = {uas:[], rules:[]}; groups.push(cur); } cur.uas.push(v.toLowerCase()); lastUA = true; }
      else { lastUA = false; if (k === 'sitemap') sitemaps.push(v); else if ((k === 'allow' || k === 'disallow') && cur) cur.rules.push([k, v]); }
    }
  }
  const pathMatch = (p, path) => { let re = '^' + p.replace(/[.+?^{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*'); if (re.endsWith('$')) {} return new RegExp(re).test(path); };
  const robotsState = (rb.s === 200 && !isHtml) ? 'ok' : (rb.s >= 500 || rb.s === 0) ? 'error' : 'none';
  const allowed = (ua) => {
    if (robotsState === 'none') return true;
    if (robotsState === 'error') return false;
    const u = ua.toLowerCase(); let best = null, bestLen = -1;
    for (const g of groups) for (const t of g.uas) if (t !== '*' && u.includes(t) && t.length > bestLen) { best = t; bestLen = t.length; }
    const token = best || '*';
    const rules = groups.filter(g => g.uas.includes(token)).flatMap(g => g.rules);
    if (!rules.length) return true;
    let dec = true, len = -1;
    for (const [k, p] of rules) { if (p === '') continue; if (pathMatch(p, '/')) { const l = p.length; if (l > len || (l === len && k === 'allow')) { len = l; dec = (k === 'allow'); } } }
    return dec;
  };
  const bots = Object.fromEntries(UAS.map(u => [u, allowed(u)]));

  // raw homepage HTML
  const hp = await get(location.href);
  const doc = new DOMParser().parseFromString(hp.t, 'text/html');
  const ld = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent);
  doc.querySelectorAll('script,style,noscript,template,svg').forEach(n => n.remove());
  const words = (doc.body ? doc.body.textContent : '').split(/\s+/).filter(w => /[A-Za-z]{2,}/.test(w)).length;

  // JSON-LD
  let validBlocks = 0; const nodes = [];
  const walk = (x) => { if (Array.isArray(x)) return x.forEach(walk); if (x && typeof x === 'object') { if (x['@type']) nodes.push(x); Object.values(x).forEach(walk); } };
  for (const raw of ld) { try { walk(JSON.parse(raw.replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, ''))); validBlocks++; } catch (e) {} }
  const tn = (n) => [].concat(n['@type']).map(t => String(t).replace(/^.*[\/:]/, ''));
  const types = [...new Set(nodes.flatMap(tn))];
  const ORG = ['Organization','Corporation','ProfessionalService','LocalBusiness','OnlineBusiness','NGO','EducationalOrganization','NewsMediaOrganization'];
  const has = (n, k) => n[k] !== undefined && n[k] !== null && n[k] !== '' && !(Array.isArray(n[k]) && !n[k].length);
  const orgs = nodes.filter(n => tn(n).some(t => ORG.includes(t))).map(n => ({
    name: has(n,'name'), url: has(n,'url'), logo: has(n,'logo'), id: has(n,'@id'), description: has(n,'description'),
    foundingDate: has(n,'foundingDate'), knowsAbout: has(n,'knowsAbout'),
    sameAs: has(n,'sameAs') ? [].concat(n.sameAs).length : 0,
    people: ['founder','employee','employees','member','members'].some(k => has(n,k)),
    place: has(n,'address') || has(n,'areaServed'),
    contact: has(n,'email') || has(n,'telephone') || has(n,'contactPoint')
  }));
  const personSameAs = nodes.some(n => tn(n).includes('Person') && has(n,'sameAs'));

  // sitemap
  const cands = [...sitemaps, O + '/sitemap.xml', O + '/sitemap_index.xml'];
  let sm = {url:null, valid:false, lastmod:false, root:null};
  for (const u of cands) {
    const r = await get(u); if (r.s !== 200) continue;
    const x = new DOMParser().parseFromString(r.t, 'application/xml');
    if (x.getElementsByTagName('parsererror').length) continue;
    const root = x.documentElement.localName;
    if (root === 'urlset' || root === 'sitemapindex') { sm = {url:u, valid:true, lastmod:/<(\w+:)?lastmod/i.test(r.t), root}; break; }
  }
  return {site: location.host, fetched: new Date().toISOString(), homeStatus: hp.s, robots: robotsState, bots, sitemapsDeclared: sitemaps.length, words, ldBlocks: ld.length, validBlocks, types, orgs, personSameAs, sitemap: sm};
})()
