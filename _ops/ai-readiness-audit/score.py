#!/usr/bin/env python3
"""Score results-*.jsonl + speed-*.csv per rubric.md (v1.1). Usage: python3 score.py 2026-09"""
import json, csv, sys, os
RUN = sys.argv[1] if len(sys.argv) > 1 else '2026-09'
D = os.path.dirname(os.path.abspath(__file__))
NAMES = {"soulcraftagency.com":"Soulcraft","www.webfx.com":"WebFX","www.siegemedia.com":"Siege Media","beomniscient.com":"Omniscient Digital",
 "firstpagesage.com":"First Page Sage","www.singlegrain.com":"Single Grain","nogood.io":"NoGood","ipullrank.com":"iPullRank",
 "gofishdigital.com":"Go Fish Digital","victorious.com":"Victorious","www.interodigital.com":"Intero Digital","seoprofy.com":"SeoProfy",
 "revenuezen.com":"RevenueZen","www.rocktherankings.com":"Rock The Rankings","www.animalz.co":"Animalz","foundationinc.co":"Foundation",
 "www.growandconvert.com":"Grow and Convert","www.seerinteractive.com":"Seer Interactive","growthx.ai":"GrowthX",
 "directiveconsulting.com":"Directive","coalitiontechnologies.com":"Coalition Technologies","thedigitalelevator.com":"Digital Elevator",
 "www.mintcopywritingstudios.com":"Mint Studios","skale.so":"Skale"}
ORG = {'Organization','Corporation','ProfessionalService','LocalBusiness','OnlineBusiness','NGO','EducationalOrganization','NewsMediaOrganization'}
speed = {r['site']: r for r in csv.DictReader(open(os.path.join(D, f'speed-{RUN}.csv')))}
def entity(o):
    f, same = o.split('|sameAs='); f = set(filter(None, f.split(','))); same = int(same)
    s = (1 if 'name' in f else 0) + (1 if 'url' in f else 0) + (2 if 'logo' in f else 0) + (2 if 'id' in f else 0) \
      + (1 if 'desc' in f else 0) + (1 if 'found' in f else 0) + (2 if 'knows' in f else 0) \
      + (3 if same >= 3 else 1.5 if same >= 1 else 0) + (2 if 'people' in f else 0) + (1 if 'place' in f else 0) + (1 if 'contact' in f else 0)
    return s
rows = []
for line in open(os.path.join(D, f'results-{RUN}.jsonl')):
    r = json.loads(line); t = set(r['types'])
    crawl = 2 * r['bots'] + (5 if r['words'] >= 300 else 0)
    schema = (2 if r['valid'] else 0) + min(10, len(t)) + (2 if t & ORG else 0) + (2 if 'WebSite' in t else 0) \
           + (1 if 'WebPage' in t else 0) + (1 if t & {'Service','OfferCatalog'} else 0) + (1 if 'FAQPage' in t else 0) + (1 if 'BreadcrumbList' in t else 0)
    ent = (max(entity(o) for o in r['orgs']) if r['orgs'] else 0) + (3 if r['personSameAs'] else 0)
    sm = (5 if r['smDecl'] else 0) + (6 if r['sm'] != 'none' else 0) + (4 if 'lastmod' in r['sm'] else 0)
    lcp = int(speed[r['site']]['lcp_ms']) / 1000
    spd = round(20 * max(0, min(1, (4.0 - lcp) / 3.0)), 1)
    tot = round(crawl + schema + ent + sm + spd, 1)
    rows.append(dict(agency=NAMES.get(r['site'], r['site']), site=r['site'], crawler=crawl, schema=schema, entity=ent, sitemaps=sm, speed=spd, total=tot,
                     types=len(t), words=r['words'], lcp_ms=int(lcp*1000)))
rows.sort(key=lambda x: -x['total'])
with open(os.path.join(D, f'scores-{RUN}.csv'), 'w', newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=['rank'] + list(rows[0].keys())); w.writeheader()
    for i, x in enumerate(rows, 1): w.writerow(dict(rank=i, **x))
for i, x in enumerate(rows, 1):
    print(f"{i:2} {x['agency']:24} {x['total']:6} | crawl {x['crawler']:>4} schema {x['schema']:>4} entity {x['entity']:>5} sitemap {x['sitemaps']:>3} speed {x['speed']:>5}")
