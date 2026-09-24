<style>
.ar-note { background: var(--color-paper-2); border-left: 3px solid var(--color-accent); border-radius: 0 var(--radius) var(--radius) 0; padding: 18px 22px; margin: 2em 0; font-size: 0.92em; line-height: 1.7; }
.ar-note p { margin-bottom: 0.8em; } .ar-note p:last-child { margin-bottom: 0; }
.ar-wrap { overflow-x: auto; margin: 2em 0; border: 1px solid var(--color-rule); border-radius: var(--radius); background: var(--color-surface); }
.ar-table { width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.4; font-variant-numeric: tabular-nums; min-width: 620px; }
.ar-table th { text-align: left; font-weight: 600; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: var(--color-muted); padding: 12px 10px; border-bottom: 1px solid var(--color-rule-strong); vertical-align: bottom; }
.ar-table td { padding: 9px 10px; border-bottom: 1px solid var(--color-rule); color: var(--color-body); }
.ar-table tr:last-child td { border-bottom: none; }
.ar-table td:nth-child(n+3), .ar-table th:nth-child(n+3) { text-align: right; }
.ar-table .ar-total { font-weight: 600; color: var(--color-ink); }
.ar-table tr.ar-us td { background: var(--color-accent-soft); }
.ar-table a { text-decoration: none; }
.ar-stats { list-style: none; padding: 0 !important; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 2em 0 !important; }
.ar-stats li { background: var(--color-surface); border: 1px solid var(--color-rule); border-radius: var(--radius); padding: 16px 18px; margin: 0 !important; font-size: 15px; line-height: 1.5; }
.ar-stats strong { display: block; font-family: var(--font-display); font-size: 30px; font-weight: 600; color: var(--color-ink); line-height: 1.1; margin-bottom: 4px; }
.ar-score { font-family: var(--font-body); font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--color-accent); margin: -0.2em 0 0.8em; }
@media (max-width: 560px) { .ar-stats { grid-template-columns: 1fr; } }
</style>

An agency that sells AI visibility should be easy for AI to read. So we checked. In September 2026 we audited the homepages of 24 agencies that sell answer engine optimization (AEO) or generative engine optimization (GEO) and scored each one out of 100 on five things AI systems depend on: crawler access, schema depth, entity markup, sitemaps and load speed.

**Soulcraft scored highest, at 96. Siege Media and Coalition Technologies tied for second at 91.** The median agency scored 80.5.

<div class="ar-note" markdown="1">

**We're the publisher, and we came first.** You should know that before reading further. Here's what we did to keep it honest: we wrote and locked the scoring rubric before scoring any site, including our own. Every agency, Soulcraft included, was measured by the same script on the same day. The rubric, the script and the raw results are public, so you can re-run any of it. Soulcraft also lost points: there's no breadcrumb markup on our homepage, and our organization markup doesn't state our areas of expertise.

This ranking measures one thing: how legible each agency's own website is to AI. It doesn't measure client results, team quality, price or fit. If you're choosing an agency, use it as one signal alongside [our evaluation scorecard](/learn/how-to-evaluate-an-aeo-agency/).

</div>

## The ranking at a glance

{{TABLE}}

Scores are from {{RUN}}-24. Download the full data, including word counts, schema types found and load timings: [aeo-agency-ai-readiness-{{RUN}}.csv](/data/aeo-agency-ai-readiness-{{RUN}}.csv).

## What the audit found

<ul class="ar-stats">
<li><strong>24 of 24</strong>let every AI crawler we tested read their homepage, and every one serves its text without JavaScript.</li>
<li><strong>8 / 20</strong>was the median entity-markup score, the weakest category by far.</li>
<li><strong>4 of 24</strong>connect their organization to a named person in structured data.</li>
<li><strong>1 of 24</strong>uses <code>knowsAbout</code> to tell AI systems what it's expert in.</li>
</ul>

The basics are solved. No agency in the sample blocks GPTBot, ClaudeBot, PerplexityBot, Google-Extended or the other AI user agents we tested, and none hides its homepage copy behind client-side rendering. Load speed didn't separate anyone either: every homepage painted its largest element in about a second or less in our test.

The differences are in the harder layer: whether the page tells AI systems *who* the agency is. Twenty of the 24 sites publish an Organization node, but most stop at a name, URL and logo, usually the defaults an SEO plugin writes. Only 9 link that organization to three or more of its profiles elsewhere (the `sameAs` property that lets AI systems match a site to its LinkedIn, Crunchbase or Wikipedia entries). Only 4 connect it to a founder or team member, and only 3 publish a Person node with that person's own linked profiles. Two agencies have no structured data at all in their homepage's raw HTML.

Four sites have a working sitemap but don't declare it in robots.txt, and three sitemap files carry no `lastmod` dates at the top level, which crawlers use to decide what to re-fetch.

## The top 10, in detail

### 1. Soulcraft

<p class="ar-score">96 / 100 &middot; soulcraftagency.com</p>

Soulcraft is a Bay Area AEO, GEO and SEO agency for growth-stage companies. Its homepage scored full marks for crawler access, sitemaps and speed (largest paint in 0.43 seconds). It carries 16 distinct schema types, including ProfessionalService, WebSite, WebPage, FAQPage, Service and OfferCatalog. Its entity markup scored 17 of 20, the highest in the audit: the organization has a stable `@id`, a logo, a founding date and three `sameAs` profiles, and it links to its founder, whose Person node carries his own profiles. Robots.txt names each major AI crawler explicitly rather than relying on a default allow.

**Where it lost points:** no BreadcrumbList on the homepage, no `knowsAbout`, and the service area sits on a separate node rather than the main organization entry.

### 2 (tie). Siege Media

<p class="ar-score">91 / 100 &middot; siegemedia.com</p>

Siege Media describes itself as a full-service GEO agency for brands. Its homepage was one of the fastest in the audit (largest paint in 0.36 seconds) and a clean schema graph of 13 types, including WebSite, WebPage and BreadcrumbList. Its organization node carries five `sameAs` links, a founding date, a postal address and a contact point. It lost most of its points on entity markup: there's no link from the organization to a named person, and no `knowsAbout`.

### 2 (tie). Coalition Technologies

<p class="ar-score">91 / 100 &middot; coalitiontechnologies.com</p>

Coalition Technologies publishes the richest schema of any site in the audit, 17 distinct types, including LocalBusiness, Service, OfferCatalog, Review, AggregateRating and FAQPage. It's also the only agency of the 24 that uses `knowsAbout`. Its business node has eight `sameAs` links and connects to a person. It lost points for having no `@id` on that node (which makes it harder for other pages to reference the same entity), no WebSite node, and no founding date.

### 4. Grow and Convert

<p class="ar-score">88.5 / 100 &middot; growandconvert.com</p>

Grow and Convert calls itself a content-focused SEO and GEO agency. It's the only agency besides Soulcraft whose organization markup links to a person and also gives a person their own `sameAs` profiles, which lifted its entity score to 13.5. It lost ground on schema breadth, and its organization lists two external profiles, one short of full marks.

### 5. SeoProfy

<p class="ar-score">87 / 100 &middot; seoprofy.com</p>

SeoProfy scored the second-highest entity markup in the audit (15 of 20): its organization has a founding date, an address, contact details, four `sameAs` links and a connected person. Its homepage is also one of the most text-heavy in the audit, with more than 4,500 words in the raw HTML. It lost points on schema breadth, with seven types and no WebSite or WebPage node.

### 6 (tie). WebFX

<p class="ar-score">85 / 100 &middot; webfx.com</p>

WebFX links its organization to nine external profiles, more than any other agency in the audit, and includes a founding date and contact point. Its schema graph is broad at 12 types. It lost five points because its robots.txt doesn't declare a sitemap (the sitemap itself exists and is valid), and more on entity markup for having no person link or `knowsAbout`.

### 6 (tie). Omniscient Digital

<p class="ar-score">85 / 100 &middot; beomniscient.com</p>

Omniscient Digital's homepage schema includes a Person with their own `sameAs` profiles, one of only three in the audit, and its organization links to three external profiles. Like WebFX, it lost five points for not declaring its sitemap in robots.txt, and more for a thin organization node with no description or founding date.

### 8 (tie). NoGood

<p class="ar-score">84 / 100 &middot; nogood.io</p>

NoGood, a growth marketing agency, has a well-formed schema graph of 10 types, including WebSite, WebPage and BreadcrumbList, and a declared sitemap with `lastmod` dates. Its entity score was 6 of 20: the organization node has a name, URL, logo and `@id`, but no description, no `sameAs` links and no connected people.

### 8 (tie). Go Fish Digital

<p class="ar-score">84 / 100 &middot; gofishdigital.com</p>

Go Fish Digital's result matches NoGood's almost exactly: a complete page-level schema graph, full sitemap marks, a fast homepage (0.35 seconds), and an organization node with no `sameAs` links, description or people behind it.

### 10. Single Grain

<p class="ar-score">82.4 / 100 &middot; singlegrain.com</p>

Single Grain marks up its homepage as a LocalBusiness with a postal address, a contact point and an FAQPage. It had the slowest largest paint in the audit, though still quick at 1.09 seconds. It lost most of its points on entity markup: no `sameAs` links and no connected people.

## How we scored it

We scored each agency's homepage, robots.txt and sitemap against a 100-point rubric, measuring the raw server HTML a crawler receives rather than the page after JavaScript runs.

- **Crawler access (25 points).** 2 points for each of 10 AI user agents that robots.txt allows to fetch the homepage: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended and Applebot-Extended. 5 more if the raw HTML contains at least 300 words of visible text.
- **Schema depth (20 points).** Valid JSON-LD, one point per distinct schema.org type (up to 10), plus points for the types that matter most: an Organization or subtype, WebSite, WebPage, Service or OfferCatalog, FAQPage and BreadcrumbList.
- **Entity markup (20 points).** How completely the best Organization node identifies the business: name, URL, logo, `@id`, description, founding date, `knowsAbout`, `sameAs` links, a link to a founder or team member, location or service area, and contact details. 3 more points if a Person node carries its own `sameAs` profiles.
- **Sitemaps (15 points).** A Sitemap line in robots.txt, a valid XML sitemap, and `lastmod` dates in it.
- **Load speed (20 points).** Largest Contentful Paint measured in the browser: full points at 1.0 second or less, none at 4.0 seconds or more (Google's "poor" threshold), scaled in between.

The full rubric, the audit script and the raw results for every site are published so anyone can reproduce the scores. We plan to re-run the audit and publish each run with its date.

**Limits worth knowing.** We scored homepages only, not whole sites. Robots.txt shows what a site *asks* crawlers to do; it can't show bot blocking at the CDN or firewall level. Speed is a single run per site from one browser and network, with every page loaded the same way; treat the speed column as a rough comparison, not a Lighthouse score. The agency list was drawn from agencies that appear in published AEO and GEO agency rankings and that offer an AEO or GEO service; it isn't exhaustive.

## How to use this ranking

A high score here tells you an agency's own site is built the way it says yours should be. That's worth knowing: an agency whose homepage doesn't identify its own founder to AI systems may not prioritise that work for you. But it's a floor, not a verdict. Ask any agency you're considering to walk you through its own structured data, then ask the harder questions in [our AEO agency scorecard](/learn/how-to-evaluate-an-aeo-agency/): how it measures AI visibility, what it changed for a client and what moved as a result. If you want to see how your own site reads to AI, [run the free AI visibility check](/tools/ai-visibility-check/).

## Frequently asked questions

{{FAQ}}
