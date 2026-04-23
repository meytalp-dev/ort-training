"""
מחלק את צ'אטי האמהות ל-chunks שסוכנים יכולים לעבד.
- מסנן הודעות מערכת + מדיה
- משאיר רק הודעות עם 'סיגנל' (שם ספציפי, טלפון, URL, או המלצה)
- שומר כל chunk כ-TXT נפרד
"""
import re, os, sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

TMP = os.environ.get('TEMP', 'C:/Users/meyta/AppData/Local/Temp').replace('\\', '/')
CHATS = [
    ('m', f'{TMP}/autism-chats/mothers/chat.txt'),
    ('j', f'{TMP}/autism-chats/jerusalem/chat.txt'),
]

OUT_DIR = f'{TMP}/autism-chats/chunks'
os.makedirs(OUT_DIR, exist_ok=True)

# Patterns to skip (system messages, media, trivial)
SKIP_PATTERNS = [
    r'הצטרפ',
    r'יצאה? מהקבוצה',
    r'שינית את',
    r'יצרת את הקבוצה',
    r'ההודעות והשיחות מוצפנות',
    r'<המדיה לא נכללה>',
    r'מדבקה מושמטת',
    r'וידאו מושמט',
    r'אודיו מושמט',
    r'תמונה מושמטת',
    r'GIF מושמט',
    r'קובץ מצורף',
    r'נוצרה הודעה קולית',
    r'הוסר',
    r'ההודעה נמחקה',
    r'העברת בעלות',
]
SKIP_RE = re.compile('|'.join(SKIP_PATTERNS))

# Signal patterns — keep messages that match
PHONE_RE = re.compile(r'0\d[-\s]?\d{7,8}|05\d[-\s]?\d{7}|\*\d{4}|\+972')
URL_RE = re.compile(r'https?://|www\.')
SIGNAL_KEYWORDS = [
    'ממליצ', 'מומלצ', 'עזר', 'עזרה', 'טיפול', 'קלינא', 'פסיכו', 'פסיכיא',
    'רפא', 'ריפוי', 'מרפא', 'אבחון', 'התפתחות', 'קשב', 'קלינאי', 'מטפל',
    'מסגרת', 'גן תקשורת', 'כיתת תקשורת', 'שילוב', 'חינוך מיוחד',
    'דיור', 'הוסטל', 'תעסוק', 'שיקום', 'סל שיקום',
    'עלה', 'אלו"ט', 'אלוט', 'אקים', 'איזי שפירא', 'קשת', 'שלווה',
    'רופא', 'דר ', 'ד"ר', 'ד״ר', 'פרופ', 'עו"ס', 'עו״ס',
    'ביה"ס', 'בית ספר', 'תיכון', 'חטיבה', 'יסודי',
    'ABA', 'PECS', 'DIR', 'Floortime',
    'רעננה', 'ירושלים', 'תל אביב', 'פתח תקווה', 'חיפה',
    'נופשון', 'קייטנ', 'חוג', 'פעילות',
    'יעוץ', 'הדרכה', 'הכוונה', 'שאלון',
]
SIG_RE = re.compile('|'.join(re.escape(k) for k in SIGNAL_KEYWORDS))

MSG_RE = re.compile(r'^(\d{1,2}\.\d{1,2}\.\d{4}), (\d{1,2}:\d{2}) - ([^:]+?): (.*)$')

def parse_chat(path, src_tag):
    """Parse WhatsApp chat, return list of (line_idx, date, time, sender, text)."""
    messages = []
    current = None
    with open(path, encoding='utf-8', errors='ignore') as f:
        for i, raw in enumerate(f, 1):
            line = raw.rstrip('\n')
            m = MSG_RE.match(line)
            if m:
                if current:
                    messages.append(current)
                current = {
                    'src': src_tag, 'line': i,
                    'date': m.group(1), 'time': m.group(2),
                    'sender': m.group(3).strip().lstrip('\u200f'),
                    'text': m.group(4)
                }
            elif current:
                current['text'] += '\n' + line
        if current:
            messages.append(current)
    return messages


def is_signal(msg):
    t = msg['text']
    if SKIP_RE.search(t): return False
    if len(t.strip()) < 15: return False
    if PHONE_RE.search(t): return True
    if URL_RE.search(t) and 'chat.whatsapp.com' not in t: return True
    if SIG_RE.search(t): return True
    return False


def main():
    all_signal = []
    for tag, path in CHATS:
        msgs = parse_chat(path, tag)
        sig = [m for m in msgs if is_signal(m)]
        print(f'{tag}: {len(msgs)} total, {len(sig)} signal')
        all_signal.extend(sig)

    # Chunk
    CHUNK_SIZE = 500  # messages per chunk — tuned for agent context
    chunks = [all_signal[i:i+CHUNK_SIZE] for i in range(0, len(all_signal), CHUNK_SIZE)]
    print(f'Total signal: {len(all_signal)}, chunks: {len(chunks)}')

    for idx, chunk in enumerate(chunks):
        path = os.path.join(OUT_DIR, f'chunk_{idx:03d}.txt')
        with open(path, 'w', encoding='utf-8') as f:
            for m in chunk:
                f.write(f"[{m['src']}:{m['line']}] {m['date']} {m['sender']}: {m['text']}\n\n")
    print(f'Wrote {len(chunks)} chunks to {OUT_DIR}')

    # Manifest
    with open(os.path.join(OUT_DIR, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump({'total_messages': len(all_signal), 'chunks': len(chunks), 'chunk_size': CHUNK_SIZE}, f)


if __name__ == '__main__':
    main()
