#!/usr/bin/env python3
"""Regenerate sitemap.xml from the repo.

Rules (see .claude/skills/page-factory/SKILL.md):
  - live, indexable URLs only
  - anything with a noindex robots meta is excluded
  - _posts entries with `sitemap: false` (redirect stubs) are excluded
  - lastmod comes from the last git commit that touched the source file;
    files with uncommitted edits get today's date

Run from the repo root:  python3 _ops/build-sitemap.py
"""
import os, re, subprocess, datetime, glob, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://soulcraftagency.com"
TODAY = datetime.date.today().isoformat()

SKIP_DIRS = ('_to_delete', 'Claude outputs', 'case-studies', '_layouts', '_includes',
             'soulcraft', 'games', 'demo', 'opensoul', 'industries', 'solutions',
             'blog', '_posts', 'assets', 'images', '.git', '.claude', '_ops', '.well-known')

PRIORITY = {"/": "1.0", "/services/": "0.9", "/about/": "0.9",
            "/tools/ai-visibility-check/": "0.9", "/services/agentic-seo/": "0.8",
            "/learn/": "0.8", "/notslop/": "0.8", "/media/": "0.8", "/contact/": "0.7"}
DEFAULT_PRIORITY = "0.7"


def git_lastmod(path):
    rel = os.path.relpath(path, ROOT)
    dirty = subprocess.run(["git", "status", "--porcelain", "--", rel],
                           cwd=ROOT, capture_output=True, text=True).stdout.strip()
    if dirty:
        return TODAY
    out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", rel],
                         cwd=ROOT, capture_output=True, text=True).stdout.strip()
    return out or TODAY


def is_noindex(path):
    with open(path, encoding='utf-8', errors='ignore') as fh:
        head = fh.read(8000)
    m = re.search(r'<meta[^>]+name=["\']robots["\'][^>]*>', head, re.I)
    return bool(m and 'noindex' in m.group(0).lower())


def static_pages():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith('.')]
        for fn in filenames:
            if not fn.endswith('.html'):
                continue
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, ROOT)
            if rel.split(os.sep)[0] in SKIP_DIRS or rel in ('404.html',):
                continue
            if is_noindex(full):
                continue
            if fn == 'index.html':
                d = os.path.dirname(rel)
                url = "/" if d in ('', '.') else "/%s/" % d.replace(os.sep, '/')
            else:
                url = "/%s" % rel.replace(os.sep, '/')
            yield url, full


def post_pages():
    for md in sorted(glob.glob(os.path.join(ROOT, '_posts', '*'))):
        with open(md, encoding='utf-8', errors='ignore') as fh:
            fm = fh.read(2000)
        if re.search(r'^sitemap:\s*false', fm, re.M):
            continue
        if re.search(r'^layout:\s*redirect', fm, re.M):
            continue
        m = re.search(r'^permalink:\s*(\S+)', fm, re.M)
        if m:
            yield m.group(1), md


def main():
    pages = dict(static_pages())
    pages.update(dict(post_pages()))
    rows = []
    for url in sorted(pages, key=lambda u: (u != "/", u)):
        rows.append((url, git_lastmod(pages[url]),
                     PRIORITY.get(url, DEFAULT_PRIORITY)))

    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, lastmod, prio in rows:
        out += ['  <url>', '    <loc>%s%s</loc>' % (SITE, url),
                '    <lastmod>%s</lastmod>' % lastmod,
                '    <changefreq>monthly</changefreq>',
                '    <priority>%s</priority>' % prio, '  </url>']
    out.append('</urlset>')
    with open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8') as fh:
        fh.write("\n".join(out) + "\n")
    print("wrote sitemap.xml with %d urls" % len(rows))
    for url, lastmod, prio in rows:
        print("  %-58s %s  p%s" % (url, lastmod, prio))


if __name__ == '__main__':
    sys.exit(main())
