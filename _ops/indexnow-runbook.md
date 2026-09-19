# IndexNow runbook

IndexNow pushes changed URLs straight to Bing, Copilot, Yandex and Naver instead of
waiting to be recrawled. Google does not consume IndexNow; this is for the others.

## Setup (done once, already committed)

- Key file: `99294e4edf9a6f1b3b78eae824819954.txt` in the repo root, served at
  `https://soulcraftagency.com/99294e4edf9a6f1b3b78eae824819954.txt`.
  The file contains the key and nothing else. Do not rename or reformat it.
- Submitter: `_ops/indexnow-submit.py`.

## Normal use

After pushing a change and confirming it is live:

```
python3 _ops/build-sitemap.py        # refresh lastmod dates
python3 _ops/indexnow-submit.py --changed   # submit only what changed today
```

Other modes:

```
python3 _ops/indexnow-submit.py                        # every URL in the sitemap
python3 _ops/indexnow-submit.py /learn/some-page/      # specific paths
```

## Expected responses

| Code | Meaning |
|------|---------|
| 200  | Accepted. |
| 202  | Accepted, key validation pending. Normal on the first submission. |
| 400  | Malformed payload. |
| 403  | Key file not reachable at the stated location. Check it is live and pushed. |
| 422  | A URL does not belong to `soulcraftagency.com`, or the key does not match. |
| 429  | Too many submissions. Back off; do not resubmit the whole sitemap repeatedly. |

## Rules

- Submit only URLs that actually changed. Submitting the full sitemap on every push
  is what gets a site rate limited.
- Never submit a redirecting, noindexed or 404 URL. `build-sitemap.py` already
  excludes those, which is why the submitter reads from the sitemap.
- The first run after deploy should return 200 or 202. If it returns 403, the key
  file is not live yet, so wait for the deploy and retry.
