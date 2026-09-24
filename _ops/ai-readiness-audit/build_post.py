#!/usr/bin/env python3
"""Build the /learn/ listicle from scores-<RUN>.csv. Usage: python3 build_post.py 2026-09"""
import csv, json, os, sys, shutil
RUN = sys.argv[1] if len(sys.argv) > 1 else '2026-09'
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(D))
S = list(csv.DictReader(open(os.path.join(D, f'scores-{RUN}.csv'))))
# competition ranking (ties share a rank)
prev, rank = None, 0
for i, s in enumerate(S, 1):
    if s['total'] != prev: rank = i
    s['r'] = rank; prev = s['total']
tied = {s['r'] for s in S if sum(1 for t in S if t['r'] == s['r']) > 1}
def rk(s): return f"{s['r']}{' (tie)' if s['r'] in tied else ''}"
def num(x): x = float(x); return str(int(x)) if x == int(x) else f"{x:g}"

os.makedirs(os.path.join(ROOT, 'data'), exist_ok=True)
shutil.copy(os.path.join(D, f'scores-{RUN}.csv'), os.path.join(ROOT, 'data', f'aeo-agency-ai-readiness-{RUN}.csv'))

US = ' class="ar-us"'
rows = "\n".join(
    f'<tr{US if s["agency"]=="Soulcraft" else ""}><td>{rk(s)}</td><td><a href="https://{s["site"]}/">{s["agency"]}</a></td>'
    f'<td class="ar-total">{num(s["total"])}</td><td>{num(s["crawler"])}</td><td>{num(s["schema"])}</td><td>{num(s["entity"])}</td>'
    f'<td>{num(s["sitemaps"])}</td><td>{num(s["speed"])}</td></tr>' for s in S)
table = f'''<div class="ar-wrap" role="region" aria-label="AI-readiness scores for 24 AEO agencies" tabindex="0">
<table class="ar-table">
<thead><tr><th>Rank</th><th>Agency</th><th>Total /100</th><th>Crawler access /25</th><th>Schema /20</th><th>Entity /20</th><th>Sitemaps /15</th><th>Speed /20</th></tr></thead>
<tbody>
{rows}
</tbody></table></div>'''

by = {s['agency']: s for s in S}
top = [s for s in S if s['r'] <= 10]

faq = [
 ("Which AEO agency has the most AI-ready website?",
  f"In Soulcraft's September 2026 audit of 24 AEO and GEO agencies, Soulcraft scored highest at {num(by['Soulcraft']['total'])} out of 100, followed by Siege Media and Coalition Technologies at 91 each. The audit scored each agency's homepage on crawler access, schema depth, entity markup, sitemaps and load speed."),
 ("What does AI-readiness mean for a website?",
  "AI-readiness is how easily AI systems can find, read and correctly identify a site. In this audit it means five things: AI crawlers are allowed in robots.txt and the page's text is in the raw HTML; the page carries structured data (schema.org JSON-LD); that data identifies the organization and the people behind it and links to their other profiles; the site publishes a sitemap; and the page loads quickly."),
 ("Do AEO agencies block AI crawlers on their own sites?",
  "No. All 24 agencies in the audit allowed all 10 AI user agents we tested, including GPTBot, ClaudeBot, PerplexityBot and Google-Extended, and all 24 served at least 300 words of text without JavaScript."),
 ("Where do most AEO agency websites fall short?",
  "Entity markup. The median agency scored 8 out of 20. Only 9 of 24 linked their organization to three or more external profiles, only 4 connected the organization to a named person, and only 1 used the knowsAbout property to state its areas of expertise. Two sites had no structured data at all."),
 ("Does a high AI-readiness score mean an agency does better client work?",
  "Not on its own. The score measures the agency's own homepage, not client results, team quality or price. It is a useful signal of whether an agency practises what it sells, and one input among several when choosing a partner."),
 ("Can an agency in the audit request a correction?",
  "Yes. Email hello@soulcraftagency.com with the agency name and what you believe is wrong. We will re-check against the published rubric and update the page and data file if the measurement was wrong."),
]
itemlist = {"@type": "ItemList", "name": "Best AEO agencies in 2026, ranked by AI-readiness", "itemListOrder": "https://schema.org/ItemListOrderDescending",
            "numberOfItems": len(top), "itemListElement": [{"@type": "ListItem", "position": i, "name": s['agency'], "url": f"https://{s['site']}/"} for i, s in enumerate(top, 1)]}
faqld = {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}
dataset = {"@type": "Dataset", "name": "AEO agency AI-readiness audit, September 2026", "description": "Scores for 24 AEO and GEO agency homepages on crawler access, schema depth, entity markup, sitemaps and load speed.",
           "creator": {"@id": "https://soulcraftagency.com/#organization"}, "dateCreated": "2026-09-24",
           "distribution": {"@type": "DataDownload", "encodingFormat": "text/csv", "contentUrl": f"https://soulcraftagency.com/data/aeo-agency-ai-readiness-{RUN}.csv"}}
schema = json.dumps({"@context": "https://schema.org", "@graph": [itemlist, faqld, dataset]}, ensure_ascii=False).replace("'", "''")

sc = by['Soulcraft']
body = open(os.path.join(D, 'post_body.md')).read()
body = body.replace('{{TABLE}}', table).replace('{{RUN}}', RUN).replace('{{FAQ}}', "\n\n".join(f"### {q}\n\n{a}" for q, a in faq))
front = f'''---
layout: post
title: "Best AEO Agencies in 2026, Ranked by AI-Readiness"
description: "We audited 24 AEO and GEO agencies' own websites for crawler access, schema, entity markup, sitemaps and speed. Soulcraft scored 96/100. Full data inside."
date: 2026-09-24
category: learn
content_type: Research
keywords: "best AEO agencies, best GEO agencies, AEO agency ranking 2026, AI-readiness audit, most AI-ready agency websites, generative engine optimization agencies"
permalink: /learn/best-aeo-agencies-ai-readiness/
schema_markup: '{schema}'
---
'''
out = os.path.join(ROOT, '_posts', '2026-09-24-best-aeo-agencies-ai-readiness.md')
open(out, 'w').write(front + body)
print('wrote', out, len(front + body))
