#!/usr/bin/env python3
"""Copy the canonical footer (_includes/site-footer.html) into every page that has one.
Run from the repo root: python3 _ops/sync-footer.py
entitymap.html is generated from entitymap.json and is skipped on purpose."""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
canon = (root / '_includes/site-footer.html').read_text(encoding='utf-8').strip()
MOUNT = '<div data-notslop-mount></div>'
SCRIPT = '<script src="/notslop/v1.js" data-notslop data-to="hello@soulcraftagency.com"></script>'
PAGES = ['index.html', 'about/index.html', 'brand/index.html', 'contact/index.html',
         'developers/index.html', 'learn/index.html', 'media/index.html', 'notslop/index.html',
         'services/index.html', 'services/agentic-seo/index.html', 'sitemap/index.html',
         'tools/index.html', 'tools/ai-visibility-check/index.html',
         'case-studies/us-sports-camps/index.html', '_layouts/post.html']
block_re = re.compile(r'(<!-- SITE FOOTER:.*?<!-- /SITE FOOTER -->|<footer\b.*?</footer>)', re.S)
for rel in PAGES:
    p = root / rel
    s = p.read_text(encoding='utf-8')
    # the Not Slop page mounts its own badge in the hero, so the footer skips it there
    footer = canon.replace('<!--NOTSLOP-->', '' if rel == 'notslop/index.html' else MOUNT)
    new, n = block_re.subn(lambda m: footer, s, count=1)
    if n != 1:
        print('SKIP (no footer found):', rel); continue
    if rel != 'notslop/index.html' and 'notslop/v1.js" data-notslop' not in new:
        new = new.replace('</body>', SCRIPT + '\n</body>', 1)
    if new != s:
        p.write_text(new, encoding='utf-8'); print('updated', rel)
    else:
        print('unchanged', rel)
