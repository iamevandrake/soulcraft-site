#!/usr/bin/env python3
"""Submit soulcraftagency.com URLs to IndexNow (Bing, Copilot, Yandex, Naver).

Usage:
  python3 _ops/indexnow-submit.py                 # submit every URL in sitemap.xml
  python3 _ops/indexnow-submit.py /learn/foo/ /   # submit specific paths or full URLs
  python3 _ops/indexnow-submit.py --changed       # submit URLs whose sitemap lastmod is today

The key file must already be live at https://soulcraftagency.com/<key>.txt
before submitting, so push first, then run this.
"""
import os, re, sys, json, glob, datetime, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://soulcraftagency.com"
HOST = "soulcraftagency.com"
ENDPOINT = "https://api.indexnow.org/indexnow"


def find_key():
    keys = [os.path.basename(p)[:-4] for p in glob.glob(os.path.join(ROOT, '*.txt'))
            if re.fullmatch(r'[0-9a-f]{8,128}\.txt', os.path.basename(p))]
    if not keys:
        sys.exit("No IndexNow key file found in the repo root.")
    return keys[0]


def sitemap_urls(changed_only=False):
    xml = open(os.path.join(ROOT, 'sitemap.xml'), encoding='utf-8').read()
    today = datetime.date.today().isoformat()
    out = []
    for block in re.findall(r'<url>(.*?)</url>', xml, re.S):
        loc = re.search(r'<loc>(.*?)</loc>', block)
        mod = re.search(r'<lastmod>(.*?)</lastmod>', block)
        if not loc:
            continue
        if changed_only and (not mod or mod.group(1) != today):
            continue
        out.append(loc.group(1))
    return out


def main():
    args = [a for a in sys.argv[1:] if a != '--changed']
    if args:
        urls = [a if a.startswith('http') else SITE + a for a in args]
    else:
        urls = sitemap_urls(changed_only='--changed' in sys.argv[1:])

    if not urls:
        print("Nothing to submit.")
        return 0

    key = find_key()
    payload = {"host": HOST, "key": key,
               "keyLocation": "%s/%s.txt" % (SITE, key),
               "urlList": urls}
    req = urllib.request.Request(
        ENDPOINT, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print("IndexNow %s for %d URL(s)" % (resp.status, len(urls)))
    except urllib.error.HTTPError as e:
        print("IndexNow error %s: %s" % (e.code, e.read().decode()[:400]))
        return 1
    for u in urls:
        print("  " + u)
    return 0


if __name__ == '__main__':
    sys.exit(main())
