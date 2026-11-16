#!/usr/bin/env python3
"""يجلب مقاطع قناة الشيخ من يوتيوب ويكتب data/youtube.js الذي يقرؤه الموقع.

    python3 tools/update_youtube.py          # تحديث سريع: يضيف المقاطع الجديدة فقط
    python3 tools/update_youtube.py --full   # إعادة جلب القناة كاملة

لا يحتاج مفتاح API ولا مكتبات خارجية. القواعد (الاستبعاد، الكتب، البرامج) في data/youtube-rules.json.
"""
import json, re, sys, time, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RULES_F = ROOT / "data" / "youtube-rules.json"
OUT_F = ROOT / "data" / "youtube.js"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
CFG = {"ver": "2.20261112.10.00"}

# ---------------------------------------------------------------- http
def http(url, body=None, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None,
                                         headers={"User-Agent": UA, "Accept-Language": "ar,en;q=0.8", "Content-Type": "application/json"})
            return urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
        except Exception as e:
            if i == tries - 1: raise
            time.sleep(2 + i * 3)

def initial(html):
    m = re.search(r'"INNERTUBE_CLIENT_VERSION":"([^"]+)"', html)
    if m: CFG["ver"] = m.group(1)
    m = re.search(r'"externalId":"(UC[^"]+)"', html)
    if m: CFG.setdefault("channel", m.group(1))
    m = re.search(r"var ytInitialData = (\{.*?\});</script>", html, re.S)
    return json.loads(m.group(1)) if m else {}

def browse(token):
    body = {"context": {"client": {"clientName": "WEB", "clientVersion": CFG["ver"], "hl": "ar", "gl": "SA"}}, "continuation": token}
    return json.loads(http("https://www.youtube.com/youtubei/v1/browse?prettyPrint=false", body))

def walk(o, key):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == key: yield v
            yield from walk(v, key)
    elif isinstance(o, list):
        for v in o: yield from walk(v, key)

def txt(t):
    if not t: return ""
    if "simpleText" in t: return t["simpleText"]
    if "runs" in t: return "".join(r.get("text", "") for r in t["runs"])
    return t.get("content", "")

def items_from(data):
    out = []
    for v in walk(data, "lockupViewModel"):
        if v.get("contentType") != "LOCKUP_CONTENT_TYPE_VIDEO": continue
        meta = v.get("metadata", {}).get("lockupMetadataViewModel", {})
        badges = [b.get("text", "") for b in walk(v, "thumbnailBadgeViewModel")]
        out.append({"id": v["contentId"], "title": meta.get("title", {}).get("content", ""), "dur": badges[0] if badges else ""})
    for v in walk(data, "videoRenderer"):
        out.append({"id": v["videoId"], "title": txt(v.get("title")), "dur": txt(v.get("lengthText"))})
    for v in walk(data, "playlistVideoRenderer"):
        out.append({"id": v["videoId"], "title": txt(v.get("title")), "dur": txt(v.get("lengthText"))})
    for v in walk(data, "shortsLockupViewModel"):
        vid = (v.get("onTap", {}).get("innertubeCommand", {}).get("reelWatchEndpoint", {}) or {}).get("videoId")
        if vid: out.append({"id": vid, "title": v.get("overlayMetadata", {}).get("primaryText", {}).get("content", ""), "short": True})
    return out

def tokens(data):
    return [c["continuationCommand"]["token"] for c in walk(data, "continuationEndpoint") if "continuationCommand" in c]

def crawl(url, pages=10 ** 6):
    data = initial(http(url))
    res, toks, seen, n = items_from(data), tokens(data), set(), 0
    while toks and n < pages:
        t = toks.pop(0)
        if t in seen: continue
        seen.add(t); n += 1
        d = browse(t); res += items_from(d); toks += tokens(d)
        time.sleep(0.3)
    u, out = set(), []
    for x in res:
        if x["id"] not in u: u.add(x["id"]); out.append(x)
    return out

def playlists(handle):
    data = initial(http(f"https://www.youtube.com/@{handle}/playlists?view=1&sort=dd&hl=ar"))
    found = {}
    def collect(d):
        for v in walk(d, "lockupViewModel"):
            if v.get("contentType") == "LOCKUP_CONTENT_TYPE_PLAYLIST":
                found[v["contentId"]] = v.get("metadata", {}).get("lockupMetadataViewModel", {}).get("title", {}).get("content", "")
        for v in walk(d, "gridPlaylistRenderer"):
            found[v["playlistId"]] = txt(v.get("title"))
    collect(data)
    toks, seen = tokens(data), set()
    while toks:
        t = toks.pop(0)
        if t in seen: continue
        seen.add(t); d = browse(t); collect(d); toks += tokens(d)
    return found

def player(vid):
    body = {"context": {"client": {"clientName": "WEB", "clientVersion": CFG["ver"], "hl": "ar"}}, "videoId": vid}
    x = json.loads(http("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", body))
    mf = x.get("microformat", {}).get("playerMicroformatRenderer", {}); vd = x.get("videoDetails", {})
    return {"title": vd.get("title", ""), "date": (mf.get("publishDate") or "")[:10], "secs": int(vd.get("lengthSeconds") or 0), "desc": vd.get("shortDescription", "")}

def rss(channel):
    """أحدث 15 مقطعًا — احتياط موثوق إن تعذّر جلب صفحة القناة."""
    ns = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015", "media": "http://search.yahoo.com/mrss/"}
    root = ET.fromstring(http(f"https://www.youtube.com/feeds/videos.xml?channel_id={channel}"))
    out = []
    for e in root.findall("a:entry", ns):
        out.append({"id": e.find("yt:videoId", ns).text, "title": e.find("a:title", ns).text or "",
                    "date": (e.find("a:published", ns).text or "")[:10],
                    "desc": (e.find("media:group/media:description", ns).text or "") if e.find("media:group/media:description", ns) is not None else ""})
    return out

# ---------------------------------------------------------------- text helpers
BIDI = re.compile(r"[‎‏⁦-⁩‪-‮️]")
EMOJI = re.compile(r"[\U0001F300-\U0001FAFF☀-➿]")
def clean_title(t):
    t = EMOJI.sub("", BIDI.sub("", t or "")).replace("_", " ").replace("#", "")
    t = re.sub(r"\s+", " ", t).strip(" -|/،")
    # drop a trailing "| أ.د. عاصم القريوتي" style signature (never the whole title)
    m = re.search(r"\s*(?:[|\-–/]\s*|\s)(?:ألقاها\s*)?(?:لل?|ل\s)?(?:فضيلة\s*)?(?:الشيخ\s*)?(?:ال?أستاذ\s*)?(?:ال?دكتور\s*)?(?:أ\.?\s*د\.?\s*/?\s*)?عاصم\s*(?:بن\s*عبد\s*الله\s*)?القريوتي.*$", t)
    if m and m.start() > 8: t = t[:m.start()].strip(" -|/،")
    t = re.sub(r"(?:[\s,،\-–/|]+(?:للأستاذ|الأستاذ|للدكتور|الدكتور|أ\.\s*د\.?|لفضيلة|ألقاها))+[\s,،\-–/|.]*$", "", t)
    return t.strip(" ,،-–/|")

def norm(s):
    s = re.sub(r"[ً-ْـ]", "", BIDI.sub("", s or ""))
    s = s.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ٱ", "ا").replace("ة", "ه").replace("ى", "ي").replace("_", " ").replace("#", " ")
    return re.sub(r"[^\w\s]", " ", re.sub(r"\s+", " ", s)).strip()

def clean_desc(d, title=""):
    """وصف المقطع كما كتبه الشيخ، بلا روابط ولا وسوم ولا تكرار للعنوان."""
    lines = []
    for ln in BIDI.sub("", d or "").splitlines():
        ln = re.sub(r"https?://\S+", "", ln).strip(" *-–_|")
        ln = re.sub(r"(تويتر|يوتيوب|تيليجرام|تلغرام|انستقرام|فيسبوك|twitter|youtube|telegram)\s*:?\s*$", "", ln, flags=re.I).strip()
        if not ln or re.fullmatch(r"(#\S+\s*)+", ln) or "المصدر" in ln and len(ln) < 20: continue
        if norm(ln) == norm(title): continue
        lines.append(EMOJI.sub("", ln).strip())
    out = "\n".join(lines).strip()
    return out[:700] + ("…" if len(out) > 700 else "")

def parse_dur(s):
    try: return sum(int(p) * 60 ** i for i, p in enumerate(reversed(s.split(":"))))
    except Exception: return 0

def other_speaker(title, desc, rules):
    """True إذا دلّ العنوان أو أول الوصف على متكلم غير الشيخ."""
    t = BIDI.sub("", title or ""); first = BIDI.sub("", (desc or "").split("\n")[0])
    if any(k in x for x in (t, first) for k in ("القريوتي", "عاصم", "Qaryoot", "Qaryoti")): return False
    for p in rules.get("other_speaker_patterns", []):
        if re.search(p, t) or re.search(p, first): return True
    return any(w in t for w in rules.get("other_speaker_title_words", []))

# ---------------------------------------------------------------- state
def load_state():
    if OUT_F.exists():
        raw = OUT_F.read_text("utf-8")
        return json.loads(raw[raw.index("{"): raw.rindex("}") + 1])
    return {"videos": {}, "playlists": {}}

def collect(state, rules, full):
    handle = rules["channel_handle"]
    V, PL = state.setdefault("videos", {}), state.setdefault("playlists", {})
    listing = []
    try:
        listing += crawl(f"https://www.youtube.com/@{handle}/videos?hl=ar", pages=10 ** 6 if full else 1)
        listing += crawl(f"https://www.youtube.com/@{handle}/shorts?hl=ar", pages=10 ** 6 if full else 0)
    except Exception as e:
        print("channel page failed:", e, file=sys.stderr)
    state["channel"] = CFG.get("channel") or state.get("channel")
    if state.get("channel"):
        try:
            for r in rss(state["channel"]): listing.append({"id": r["id"], "title": r["title"], "rss": r})
        except Exception as e:
            print("rss failed:", e, file=sys.stderr)
    # playlists (cheap: ~25 lists)
    try:
        for pid, title in playlists(handle).items():
            vids = [x["id"] for x in crawl(f"https://www.youtube.com/playlist?list={pid}&hl=ar")]
            PL[pid] = {"t": title, "v": vids}
            listing += [{"id": v, "title": ""} for v in vids]
    except Exception as e:
        print("playlists failed:", e, file=sys.stderr)
    added = 0
    for it in listing:
        vid = it["id"]
        if vid in V and not full: continue
        if vid in V and full and V[vid].get("d"): continue
        info = None
        try: info = player(vid)
        except Exception as e: print("player failed", vid, e, file=sys.stderr)
        r = it.get("rss") or {}
        title = (info or {}).get("title") or it.get("title") or r.get("title", "")
        date = (info or {}).get("date") or r.get("date", "")
        secs = (info or {}).get("secs") or parse_dur(it.get("dur", ""))
        desc = (info or {}).get("desc") or r.get("desc", "")
        if not title: continue
        V[vid] = {"t": clean_title(title), "d": date, "s": secs}
        x = clean_desc(desc, title)
        if x: V[vid]["x"] = x
        if it.get("short"): V[vid]["sh"] = 1
        if other_speaker(title, desc, rules): V[vid]["auto_ex"] = 1
        added += 1
        time.sleep(0.15)
    return added

# ---------------------------------------------------------------- build the library for the site
ORDINALS = ["الأولى?|الاول", "الثاني|الثانية|الثاتي", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"]
ORDINALS = [f"(?:{w})" for w in ORDINALS]
def build(state, rules):
    V, PL = state["videos"], state.get("playlists", {})
    ex, hold, inc = set(rules.get("exclude", [])), set(rules.get("hold", [])), set(rules.get("include", []))
    visible = lambda v: v in V and (v in inc or (v not in ex and v not in hold and not V[v].get("auto_ex")))
    series, owner = [], {}
    for s in rules.get("series", []):
        items = []
        for pid in s.get("playlists", []):
            for v in PL.get(pid, {}).get("v", []):
                if v not in owner and v not in items: items.append(v)
        pats = [norm(m) for m in s.get("match", []) if norm(m)]
        extra = [v for v in V if v not in owner and v not in items and any(p in norm(V[v]["t"]) for p in pats)]
        def epnum(v):
            t = V[v]["t"]
            m = re.search(r"(?:الحلقة|حلقة|المجلس|الدرس|\()\s*-?\s*(\d+)", t) or re.search(r"\b(\d{1,3})\b", t)
            if m: return int(m.group(1))
            for i, w in enumerate(ORDINALS, 1):
                if re.search(r"(?:الحلقة|المجلس|الدرس)\s+" + w, t): return i
            return 0
        items += sorted(extra, key=lambda v: (V[v].get("d", ""), epnum(v)))
        items = [v for v in items if visible(v)]
        if s["kind"] == "book" or s["id"] in ("hadith-fawaid", "aya", "rihab-quran"):
            items.sort(key=lambda v: (V[v].get("d", ""), epnum(v)))
        for v in items: owner[v] = s["id"]
        if items:
            series.append({k: s[k] for k in ("id", "kind", "title", "author", "cat", "desc") if s.get(k)} | {"items": items})
    khutab, lectures, clips = [], [], []
    lec_min = rules.get("lecture_min_minutes", 15) * 60
    for v, m in sorted(V.items(), key=lambda kv: kv[1].get("d", ""), reverse=True):
        if v in owner or not visible(v): continue
        k = rules.get("kinds", {}).get(v)
        if not k:
            k = "khutbah" if "خطبة" in m["t"] else ("lecture" if m.get("s", 0) >= lec_min and not m.get("sh") else "clip")
        {"khutbah": khutab, "lecture": lectures, "clip": clips}[k].append(v)
    # topics for the single videos (first matching topic wins)
    topics, topic_of = rules.get("topics", []), {}
    for v in khutab + lectures + clips:
        t = norm(V[v]["t"]); tid = None
        if len(re.findall(r"[A-Za-z]", V[v]["t"])) > len(re.findall(r"[\u0600-\u06FF]", V[v]["t"])) or re.search(r"[\u06A9\u06CC\u06C1\u06D2\u06BA\u0679\u0688]", V[v]["t"]):
            tid = rules.get("topic_english", {}).get("id")
        for tp in topics:
            if tid: break
            if any(f" {norm(w)} " in f" {t} " or (len(norm(w)) > 5 and norm(w) in t) for w in tp["words"]): tid = tp["id"]
        topic_of[v] = tid or rules.get("topic_other", {}).get("id", "other")
    tlist = [{"id": tp["id"], "title": tp["title"]} for tp in topics + [rules.get("topic_english", {}), rules.get("topic_other", {})] if tp.get("id")]
    return {"series": series, "khutab": khutab, "lectures": lectures, "clips": clips, "topics": tlist, "topic_of": topic_of}

def main():
    full = "--full" in sys.argv
    rules = json.loads(RULES_F.read_text("utf-8"))
    state = load_state()
    snap = lambda: json.dumps([state.get("videos", {}), state.get("lib", {})], sort_keys=True)
    before = snap()
    added = collect(state, rules, full)
    state["lib"] = build(state, rules)   # rules changes (exclude/include/series) apply on every run
    changed = snap() != before
    if changed or full or "--rebuild" in sys.argv or not OUT_F.exists():
        state["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        OUT_F.write_text("/* يُولَّد تلقائيًا من قناة يوتيوب — لا تعدّله يدويًا؛ عدّل data/youtube-rules.json بدلًا منه */\nwindow.YT = "
                         + json.dumps(state, ensure_ascii=False, separators=(",", ":")) + ";\n", "utf-8")
    lib = state["lib"]
    print(f"added/refreshed {added} · total {len(state['videos'])} · series {len(lib['series'])} · khutab {len(lib['khutab'])} · lectures {len(lib['lectures'])} · clips {len(lib['clips'])}")

if __name__ == "__main__":
    if "--rebuild" in sys.argv:   # rebuild from saved state + rules only (no network)
        rules = json.loads(RULES_F.read_text("utf-8")); state = load_state(); state["lib"] = build(state, rules)
        state["updated"] = state.get("updated") or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        OUT_F.write_text("/* يُولَّد تلقائيًا من قناة يوتيوب — لا تعدّله يدويًا؛ عدّل data/youtube-rules.json بدلًا منه */\nwindow.YT = "
                         + json.dumps(state, ensure_ascii=False, separators=(",", ":")) + ";\n", "utf-8")
        lib = state["lib"]; print(f"rebuilt · series {len(lib['series'])} · khutab {len(lib['khutab'])} · lectures {len(lib['lectures'])} · clips {len(lib['clips'])}")
    else:
        main()
