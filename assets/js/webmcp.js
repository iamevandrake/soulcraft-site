/*
 * Soulcraft WebMCP tools.
 * Exposes a few read-only tools to AI agents running in the visitor's browser
 * (WebMCP: navigator.modelContext / document.modelContext). Does nothing in
 * browsers without the API. The contact form exposes itself declaratively
 * (toolname attributes in /contact/), so sending an inquiry always goes through
 * the visible form and the visitor's own browser.
 *
 * Keep the facts below in step with the homepage pricing section and /services/.
 * Listed in /.well-known/mcp/server-card.json — update both together.
 */
(function () {
  'use strict';
  var mc = (typeof navigator !== 'undefined' && navigator.modelContext) ||
           (typeof document !== 'undefined' && document.modelContext);
  if (!mc) return;
  if (window.__soulcraftWebMCP) return;
  window.__soulcraftWebMCP = true;

  var ORIGIN = 'https://soulcraftagency.com';

  var OVERVIEW = {
    name: 'Soulcraft',
    url: ORIGIN + '/',
    summary: 'Soulcraft is an SEO agency that puts businesses in the answers their customers are looking for, ' +
      'in Google and in AI assistants such as ChatGPT, Claude and Gemini. Every engagement is led personally by ' +
      'founder Evan Drake, who has twenty years in technology marketing (Apple to Chainlink Labs, where he was Head of Growth). ' +
      'The work is handcrafted, with AI used for leverage, and starts from the soul file: a structured document that ' +
      'captures a company\'s voice, values, positioning, audience and competitive context.',
    location: 'San Francisco Bay Area, working with teams in the United States and globally',
    founder: { name: 'Evan Drake', about: ORIGIN + '/about/' },
    contact: { email: 'hello@soulcraftagency.com', form: ORIGIN + '/contact/', responseTime: 'within one business day' },
    keyPages: {
      services: ORIGIN + '/services/',
      seo: ORIGIN + '/services/seo/',
      caseStudies: ORIGIN + '/case-studies/',
      learn: ORIGIN + '/learn/',
      about: ORIGIN + '/about/',
      media: ORIGIN + '/media/',
      sitemap: ORIGIN + '/sitemap/'
    }
  };

  var SERVICES = {
    services: [
      { name: 'SEO', url: ORIGIN + '/services/seo/',
        description: 'Search and answers: site audits, buyer-question research across engines, technical fixes so machines can read the site, ' +
          'and pages that earn rankings in Google and citations in ChatGPT, Claude and Gemini. Soulcraft calls it Superintelligence Engine Optimization, and still calls it SEO.' },
      { name: 'Demand Generation', url: ORIGIN + '/services/',
        description: 'Intent signals, lead scoring, outbound sequences, CRM integration and nurture flows, designed by hand.' },
      { name: 'Content & Identity', url: ORIGIN + '/services/',
        description: 'An editorial program anchored to the soul file: blog posts, landing pages, social and email, written and edited by a person.' },
      { name: 'Marketing Strategy', url: ORIGIN + '/services/',
        description: 'Audience mapping, positioning and a go-to-market motion the team can run.' }
    ],
    method: [
      'Map the identity (build the soul file)',
      'Baseline the answers engines give to buyer questions',
      'Make the site legible to machines',
      'Publish the answers',
      'Earn citations, then measure the lift'
    ],
    pricing: {
      currency: 'USD',
      core: { name: 'Core Engagement', pricePerMonth: 5000,
        includes: ['A content engine and hub', 'AI visibility and share of voice monitoring', 'Technical SEO auditing and website advisory',
          'Weekly reporting, analysis and strategy', 'Weekly calls, Slack in between', 'Ideation on PR and thought leadership'] },
      addOns: [
        { name: 'Distribution Engine', pricePerMonth: 2500, description: 'Channel-tailored posting on LinkedIn, Medium, Reddit, Substack and X.' },
        { name: 'Citation Engine', pricePerMonth: 2500, description: 'Outreach to Wikipedia, directories and industry publications.' }
      ],
      terms: 'No long-term contracts. Add or drop add-ons month to month.',
      source: ORIGIN + '/#investment'
    }
  };

  function json(obj) {
    return { content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }] };
  }

  function sameOriginPath(p) {
    try {
      var u = new URL(p || '/', location.origin);
      if (u.origin !== location.origin) return null;
      return u.pathname + u.search;
    } catch (e) { return null; }
  }

  var tools = [
    {
      name: 'get_site_info',
      description: 'Overview of Soulcraft: what it does, who leads the work, where it is based, how to get in touch, and the main pages.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function () { return Promise.resolve(json(OVERVIEW)); }
    },
    {
      name: 'get_services',
      description: 'Soulcraft services, its five-step method, and published monthly pricing (core engagement and add-ons).',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function () { return Promise.resolve(json(SERVICES)); }
    },
    {
      name: 'get_page_markdown',
      description: 'Return a page on soulcraftagency.com as markdown, for reading without the page chrome. Pass a site path such as "/services/seo/" or "/learn/".',
      inputSchema: {
        type: 'object',
        properties: { path: { type: 'string', description: 'Path on soulcraftagency.com, e.g. "/about/". Defaults to the current page.' } },
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: function (args) {
        var path = sameOriginPath((args && args.path) || location.pathname);
        if (!path) return Promise.resolve({ content: [{ type: 'text', text: 'Only paths on soulcraftagency.com are supported.' }], isError: true });
        return fetch(path, { headers: { Accept: 'text/markdown' }, credentials: 'omit' })
          .then(function (r) {
            return r.text().then(function (t) {
              if (!r.ok) throw new Error('HTTP ' + r.status);
              var ct = r.headers.get('content-type') || '';
              if (ct.indexOf('text/markdown') === -1) {
                // Fallback when markdown negotiation is unavailable: readable text of the page.
                var doc = new DOMParser().parseFromString(t, 'text/html');
                doc.querySelectorAll('script,style,noscript,svg,nav,footer,header').forEach(function (n) { n.remove(); });
                var main = doc.querySelector('main') || doc.body;
                t = '# ' + (doc.title || path) + '\n\n' + (main ? main.textContent.replace(/\s+\n/g, '\n').replace(/[ \t]+/g, ' ').trim() : '');
              }
              return { content: [{ type: 'text', text: t }] };
            });
          })
          .catch(function (e) { return { content: [{ type: 'text', text: 'Could not load ' + path + ': ' + e.message }], isError: true }; });
      }
    }
  ];

  try {
    if (typeof mc.registerTool === 'function') {
      tools.forEach(function (t) {
        try {
          var p = mc.registerTool(t);
          if (p && typeof p.catch === 'function') p.catch(function () {});
        } catch (e) { /* tool already registered or unsupported shape */ }
      });
    } else if (typeof mc.provideContext === 'function') {
      mc.provideContext({ tools: tools });
    }
  } catch (e) { /* never break the page */ }
})();
