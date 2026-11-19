#!/usr/bin/env python3
"""Package the agent skills in _ops/agent-skills/<name>/ and write the discovery index.

Run from the repo root after editing any SKILL.md:  python3 _ops/agent-skills/build.py

Why archives: Jekyll rewrites any .md file that starts with front matter, which would
change the bytes (and break the sha256 digest). A .tar.gz is copied byte for byte.
The archive is deterministic (fixed mtime, no gzip timestamp), so rebuilding an unchanged
skill gives the same digest.
Spec: https://github.com/cloudflare/agent-skills-discovery-rfc (v0.2.0)
"""
import gzip, hashlib, io, json, pathlib, re, tarfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / '_ops' / 'agent-skills'
OUT = ROOT / '.well-known' / 'agent-skills'
OUT.mkdir(parents=True, exist_ok=True)

entries = []
for skill_dir in sorted(p for p in SRC.iterdir() if p.is_dir()):
    md = skill_dir / 'SKILL.md'
    if not md.exists():
        continue
    text = md.read_text(encoding='utf-8')
    fm = re.match(r'^---\n(.*?)\n---\n', text, re.S)
    meta = dict(re.findall(r'^(\w+):\s*(.+)$', fm.group(1), re.M)) if fm else {}
    name, desc = meta.get('name', skill_dir.name), meta.get('description', '')
    assert re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', name) and len(name) <= 64, name
    assert desc and len(desc) <= 1024, f'{name}: description missing or too long'

    tar_buf = io.BytesIO()
    with tarfile.open(fileobj=tar_buf, mode='w', format=tarfile.USTAR_FORMAT) as tar:
        for f in sorted(skill_dir.rglob('*')):
            if f.is_file() and f.name != '.DS_Store':
                data = f.read_bytes()
                info = tarfile.TarInfo(str(f.relative_to(skill_dir)))  # SKILL.md at archive root
                info.size, info.mtime, info.mode = len(data), 0, 0o644
                info.uname = info.gname = ''
                tar.addfile(info, io.BytesIO(data))
    gz_buf = io.BytesIO()
    with gzip.GzipFile(fileobj=gz_buf, mode='wb', mtime=0, filename='') as gz:
        gz.write(tar_buf.getvalue())
    archive = OUT / f'{name}.tar.gz'
    archive.write_bytes(gz_buf.getvalue())
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    entries.append({
        'name': name,
        'type': 'archive',
        'description': desc,
        'url': f'/.well-known/agent-skills/{name}.tar.gz',
        'digest': f'sha256:{digest}',
    })
    print(f'{name}: {archive.relative_to(ROOT)} sha256:{digest}')

index = {'$schema': 'https://schemas.agentskills.io/discovery/0.2.0/schema.json', 'skills': entries}
(OUT / 'index.json').write_text(json.dumps(index, indent=2) + '\n', encoding='utf-8')
print('wrote', (OUT / 'index.json').relative_to(ROOT))
