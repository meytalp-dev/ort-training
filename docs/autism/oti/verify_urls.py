"""
בודק כל URL ב-all.json — פינג מקביל, מסמן תקין/שגוי.
ייצוא: all.json עם שדה url_status חדש.
"""
import json, re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib.request, urllib.error, socket, ssl

SRC = 'docs/autism/oti/data/all.json'
OUT = 'docs/autism/oti/data/all.json'
REPORT = 'docs/autism/oti/data/url-report.json'

TIMEOUT = 8
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
}


URL_PATTERN = re.compile(
    r'(https?://[^\s,;<>"\']+|(?<!@)(?:www\.|[a-z0-9-]+\.)[a-z0-9][a-z0-9-]*\.(?:co\.il|org\.il|gov\.il|ac\.il|com|org|net|io|info|me|app|ai)[^\s,;<>"\']*)',
    re.IGNORECASE
)


def extract_urls(val):
    """Pull URLs out of a cell — use regex so we don't split URLs with paths."""
    if not val: return []
    s = str(val)
    # Skip clearly-email strings
    matches = URL_PATTERN.findall(s)
    urls = []
    seen = set()
    for m in matches:
        u = m.strip().rstrip('.,;:)')
        if '@' in u: continue  # email
        if not u.startswith('http'):
            u = 'https://' + u
        # Require at least a dot in the host
        host_match = re.match(r'^https?://([^/]+)', u)
        if not host_match or '.' not in host_match.group(1): continue
        if u not in seen:
            seen.add(u)
            urls.append(u)
    return urls


def encode_url_path(u):
    """Encode Hebrew/non-ASCII characters in URL path (IDN hostname + urlquote path)."""
    from urllib.parse import urlsplit, urlunsplit, quote
    try:
        parts = urlsplit(u)
        netloc = parts.netloc.encode('idna').decode('ascii') if any(ord(c) > 127 for c in parts.netloc) else parts.netloc
        path = quote(parts.path, safe='/%:@')
        query = quote(parts.query, safe='=&%:/?+')
        return urlunsplit((parts.scheme, netloc, path, query, parts.fragment))
    except Exception:
        return u


def check_url(u):
    """Return (status_code, final_url, error). Try GET (no HEAD-only servers)."""
    u = encode_url_path(u)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    for method in ['HEAD', 'GET']:
        try:
            req = urllib.request.Request(u, headers=HEADERS, method=method)
            with urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx) as r:
                if method == 'GET':
                    r.read(1)
                return (r.status, r.url, None)
        except urllib.error.HTTPError as e:
            if method == 'HEAD' and e.code in (400, 403, 405, 406, 501):
                continue
            return (e.code, u, f'HTTP {e.code}')
        except (urllib.error.URLError, socket.timeout, ssl.SSLError) as e:
            if method == 'HEAD':
                continue
            return (0, u, str(e)[:100])
        except Exception as e:
            if method == 'HEAD':
                continue
            return (0, u, str(e)[:100])
    return (0, u, 'all methods failed')


def main():
    data = json.load(open(SRC, encoding='utf-8'))
    print(f'Loaded {len(data)} records')

    # Collect unique URLs
    url_to_rows = {}
    for idx, r in enumerate(data):
        urls = extract_urls(r.get('אתר', ''))
        for u in urls:
            url_to_rows.setdefault(u, []).append(idx)

    unique_urls = list(url_to_rows.keys())
    print(f'Unique URLs to check: {len(unique_urls)}')

    results = {}
    with ThreadPoolExecutor(max_workers=20) as pool:
        futures = {pool.submit(check_url, u): u for u in unique_urls}
        for i, fut in enumerate(as_completed(futures)):
            u = futures[fut]
            try:
                status, final, err = fut.result()
            except Exception as e:
                status, final, err = 0, u, str(e)[:100]
            results[u] = {'status': status, 'final_url': final, 'error': err}
            if (i+1) % 25 == 0:
                print(f'  checked {i+1}/{len(unique_urls)}')

    # Tally
    ok = sum(1 for r in results.values() if 200 <= r['status'] < 400)
    redirect = sum(1 for r in results.values() if 300 <= r['status'] < 400)
    err = sum(1 for r in results.values() if r['status'] == 0 or r['status'] >= 400)
    print(f'\nOK (2xx/3xx): {ok}/{len(results)}')
    print(f'Errors: {err}')

    # Enrich rows
    for r in data:
        urls = extract_urls(r.get('אתר', ''))
        if not urls:
            r['url_status'] = ''
            continue
        statuses = [results[u]['status'] for u in urls if u in results]
        def classify(s):
            if 200 <= s < 400: return 'ok'
            if s in (400, 401, 403): return 'blocked'  # anti-bot / login required
            return 'broken'
        cls = [classify(s) for s in statuses]
        if all(c == 'ok' for c in cls):
            r['url_status'] = 'ok'
        elif all(c in ('ok', 'blocked') for c in cls):
            r['url_status'] = 'uncertain'
        elif any(c == 'ok' for c in cls):
            r['url_status'] = 'partial'
        else:
            r['url_status'] = 'broken'
        r['url_details'] = [{'url': u, **results.get(u, {})} for u in urls]

    json.dump(data, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'\nWrote: {OUT}')

    # Report (sorted by problem severity)
    report = {
        'total_records': len(data),
        'records_with_urls': sum(1 for r in data if r.get('url_status')),
        'ok': sum(1 for r in data if r.get('url_status') == 'ok'),
        'uncertain': sum(1 for r in data if r.get('url_status') == 'uncertain'),
        'partial': sum(1 for r in data if r.get('url_status') == 'partial'),
        'broken': sum(1 for r in data if r.get('url_status') == 'broken'),
        'no_url': sum(1 for r in data if not r.get('url_status')),
        'broken_list': sorted([
            {'name': r['שם'], 'urls': [d['url'] for d in r.get('url_details', [])],
             'errors': [d.get('error') or f"HTTP {d.get('status')}" for d in r.get('url_details', [])]}
            for r in data if r.get('url_status') == 'broken'
        ], key=lambda x: x['name']),
    }
    json.dump(report, open(REPORT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'Report: {REPORT}')

    print(f'\nSummary:')
    print(f'  Records with URL: {report["records_with_urls"]}/{len(data)}')
    print(f'  OK:         {report["ok"]}')
    print(f'  Uncertain:  {report["uncertain"]} (400/403 — anti-bot, likely OK)')
    print(f'  Partial:    {report["partial"]} (some OK, some broken)')
    print(f'  Broken:     {report["broken"]} (404/DNS/timeout — real issues)')
    print(f'  No URL:     {report["no_url"]}')


if __name__ == '__main__':
    main()
