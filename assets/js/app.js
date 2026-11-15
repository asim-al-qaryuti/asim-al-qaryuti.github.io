/* مكتبة الشيخ عاصم القريوتي — الواجهة (ملفات ثابتة تعمل على GitHub Pages) */
const S = window.SITE || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AR = "٠١٢٣٤٥٦٧٨٩";
const arD = s => String(s).replace(/\d/g, d => AR[d]);
const arN = n => Number(n).toLocaleString("ar-EG");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- icons ---------- */
const P = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8 7h8"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  minbar: '<path d="M4 21h16M6 21V10l6-6 6 6v11"/><path d="M10 21v-5h4v5"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m14 6 4 4"/>',
  play: '<path d="M8 5.5v13l11-6.5-11-6.5Z"/>',
  clip: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
  audio: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  file: '<path d="M6 3h8l5 5v13H6V3Z"/><path d="M14 3v5h5"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  send: '<path d="M21 3 3 10.5l7 2.5 2.5 7L21 3Z"/><path d="m10 13 4-4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  cap: '<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2Z"/><path d="M10 21h4"/>',
  arrow: '<path d="M15 6l-6 6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  timeline: '<path d="M12 3v18"/><circle cx="12" cy="7" r="2.5"/><circle cx="12" cy="17" r="2.5"/><path d="M14.5 7H20M4 17h5.5"/>'
};
const ico = (n, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ""}</svg>`;

/* ---------- store ---------- */
const KEY = "qaryuti:v1";
const store = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {} };
store.heard ||= {};

/* ---------- dates ---------- */
const parseDate = s => { if (!s) return null; const [y, m, d] = String(s).split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1, 12); };
const mk = o => { try { return new Intl.DateTimeFormat(o[0], o[1]); } catch { return new Intl.DateTimeFormat("ar", o[1]); } };
const fH = mk(["ar-SA-u-ca-islamic-umalqura-nu-arab", { day: "numeric", month: "long", year: "numeric" }]);
const fHy = mk(["ar-SA-u-ca-islamic-umalqura-nu-arab", { year: "numeric" }]);
const fG = mk(["ar-EG-u-nu-arab", { day: "numeric", month: "long", year: "numeric" }]);
const fGd = mk(["ar-EG-u-nu-arab", { day: "numeric" }]);
const fGm = mk(["ar-EG-u-nu-arab", { month: "long" }]);
const hijri = d => { try { return fH.format(d).replace(/\s*هـ$/, "") + " هـ"; } catch { return ""; } };
const hYear = d => { try { return fHy.format(d).replace(/\s*هـ$/, ""); } catch { return ""; } };
const secs = dur => !dur ? 0 : String(dur).split(":").map(Number).reduce((a, b) => a * 60 + b, 0);
const hours = list => Math.round(list.reduce((a, it) => a + secs(it.dur), 0) / 3600);

/* ---------- data model ---------- */
const CATS = S.categories || [];
const CAT = Object.fromEntries(CATS.map(c => [c.id, c]));
const KIND = { lesson: "درس", course: "دورة", khutbah: "خطبة جمعة", lecture: "محاضرة", clip: "مقطع" };
const series = (list, kind) => (list || []).map(s => {
  const lessons = (s.lessons || []).map((l, i) => ({ ...l, id: l.id || `${s.id}-${i + 1}`, kind: kind === "book" ? "lesson" : "course", parent: s.id, _d: parseDate(l.date) }));
  const ds = lessons.map(l => l._d).filter(Boolean).sort((a, b) => a - b);
  return { ...s, type: kind, lessons, _first: ds[0], _last: ds[ds.length - 1] };
});
const BOOKS = series(S.books, "book");
const COURSES = series(S.courses, "course").sort((a, b) => (b._first || 0) - (a._first || 0));
const SERIES = Object.fromEntries([...BOOKS, ...COURSES].map(s => [s.id, s]));
const singles = (list, kind) => (list || []).map(x => ({ ...x, kind, _d: parseDate(x.date) })).sort((a, b) => (b._d || 0) - (a._d || 0));
const KHUTAB = singles(S.khutab, "khutbah"), LECTURES = singles(S.lectures, "lecture"), CLIPS = singles(S.clips, "clip");
const ALL = [...BOOKS.flatMap(b => b.lessons), ...COURSES.flatMap(c => c.lessons), ...KHUTAB, ...LECTURES, ...CLIPS].sort((a, b) => (b._d || 0) - (a._d || 0));
const BY_ID = Object.fromEntries(ALL.map(it => [it.id, it]));
const POSTS = (S.blog || []).map(p => ({ ...p, _d: parseDate(p.date) })).sort((a, b) => (b._d || 0) - (a._d || 0));

/* ---------- shared pieces ---------- */
const titleOf = it => it.parent ? SERIES[it.parent]?.title + " — " + it.title : it.title;
const isNew = it => it._d && (Date.now() - it._d) / 864e5 < 8;
const mediaBtn = it => {
  const m = { youtube: ["video", "مرئي"], audio: ["audio", "صوتي"], pdf: ["file", "قراءة"], link: ["link", "رابط"] }[it.media?.type] || ["arrow", "تفاصيل"];
  return `<a class="btn" href="#/lesson/${esc(it.id)}">${ico(m[0])}<span>${m[1]}</span></a>`;
};
const hl = (txt, q) => {
  const e = esc(txt); if (!q) return e;
  const n = esc(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return e.replace(new RegExp(n, "gi"), m => `<mark>${m}</mark>`);
};
const norm = s => (s || "").replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").toLowerCase();
function row(it, { chip = true, q = "", plain = false } = {}) {
  const sr = it.parent && SERIES[it.parent], heard = !!store.heard[it.id];
  const label = plain || !sr ? hl(it.title, q) : `${hl(sr.title, q)} <span class="sub">— ${hl(it.title, q)}</span>`;
  return `<li class="row${heard ? " heard" : ""}" data-id="${esc(it.id)}">
    <button class="mk" type="button" data-heard="${esc(it.id)}" aria-pressed="${heard}" aria-label="علِّم «${esc(titleOf(it))}» كمسموع" title="علِّم كمسموع">${ico("check")}</button>
    <div class="rb">
      <a class="rt" href="#/lesson/${esc(it.id)}">${label}</a>
      <div class="rm">${!it.parent ? `<span class="rk">${KIND[it.kind]}</span>` : ""}${it._d ? `<span>${hijri(it._d)}</span><span>${fG.format(it._d)}</span>` : ""}${it.dur ? `<span class="rdur" dir="ltr">${arD(it.dur)}</span>` : ""}${isNew(it) ? `<span class="new">جديد</span>` : ""}</div>
      ${chip && sr ? `<div class="rc"><a class="chip" href="#/${sr.type}/${esc(sr.id)}">${ico(sr.type === "book" ? "book" : "layers")}${esc(sr.title)}</a></div>` : ""}
    </div>
    <div class="ra">${mediaBtn(it)}</div>
  </li>`;
}
function cover(s) {
  if (s.type === "course") return `<span class="cover" style="--c:#2A2416">${s.cover ? `<img src="${esc(s.cover)}" alt="" loading="lazy">` : `<span class="cc">دورة علمية</span><span class="ct">${esc(s.title)}</span>${s.place ? `<span class="ca">${esc(s.place)}</span>` : ""}`}</span>`;
  const c = CAT[s.cat];
  return `<span class="cover" style="--c:${esc(c?.color || "#1E4A78")}">${s.cover ? `<img src="${esc(s.cover)}" alt="" loading="lazy">` : `<span class="cc">${esc(c?.title || "")}</span><span class="ct">${esc(s.title)}</span>${s.author ? `<span class="ca">${esc(s.author)}</span>` : ""}`}</span>`;
}
const yearSpan = s => s._first ? (s._first.getFullYear() === s._last.getFullYear() ? arN(s._first.getFullYear()).replace(/٬/g, "") : `${arD(s._first.getFullYear())}–${arD(s._last.getFullYear())}`) : "";
const nSessions = n => `${arN(n)} ${n === 1 ? "مجلس" : n === 2 ? "مجلسان" : n <= 10 ? "مجالس" : "مجلسًا"}`;
const bcard = b => `<a class="bcard" href="#/book/${esc(b.id)}">${cover(b)}<span class="bt">${esc(b.title)}</span><span class="bm">${nSessions(b.lessons.length)}${b._first ? " · " + yearSpan(b) : ""}</span></a>`;
const ccard = c => `<a class="ccard" href="#/course/${esc(c.id)}">${cover(c)}<span class="cbody"><span class="c-pre">${esc(c.book || "دورة علمية")}</span><span class="c-t">${esc(c.title)}</span>
  ${c.place ? `<span class="c-m">${ico("pin")}${esc(c.place)}</span>` : ""}${c._first ? `<span class="c-m">${ico("cal")}${fG.format(c._first)}${+c._last !== +c._first ? " – " + fG.format(c._last) : ""}</span>` : ""}<span class="c-m">${nSessions(c.lessons.length)}</span></span></a>`;

function groupByYear(items, desc = true) {
  const g = new Map();
  items.forEach(it => { const y = it._d ? it._d.getFullYear() : 0; if (!g.has(y)) g.set(y, []); g.get(y).push(it); });
  return [...g.entries()].sort((a, b) => desc ? b[0] - a[0] : a[0] - b[0]);
}
function yearGroups(items, opts = {}, desc = true) {
  return groupByYear(items, desc).map(([y, list]) => {
    const hs = [...new Set(list.map(it => it._d && hYear(it._d)).filter(Boolean))].sort();
    return `<section class="ygrp" id="y-${y}"><div class="ygrp-h"><b>${y ? arD(y) : "بلا تاريخ"}</b>${hs.length ? `<span>${hs.length > 1 ? hs[0] + "–" + hs[hs.length - 1] : hs[0]} هـ</span>` : ""}<small>${arN(list.length)} ${list.length > 10 ? "مادةً" : "مواد"}</small></div>
      <ol class="rows">${list.map(it => row(it, opts)).join("")}</ol></section>`;
  }).join("");
}

/* ---------- view plumbing ---------- */
let cleanups = [];
const onCleanup = f => cleanups.push(f);
const V = h => { $("#view").innerHTML = h; };
function pageHead(title, desc, crumbs = [], extra = "") {
  return `<header class="page-h"><div class="wrap">
    <nav class="crumb" aria-label="مسار"><a href="#/">الرئيسية</a>${crumbs.map(([h, t]) => `<span>/</span><a href="${h}">${esc(t)}</a>`).join("")}</nav>
    <h1>${esc(title)}</h1>${desc ? `<p>${desc}</p>` : ""}${extra}</div></header>`;
}

/* ---------- home ---------- */
function viewHome() {
  const p = S.person || {};
  const stats = [[ALL.length, "تسجيلًا"], [hours(ALL), "ساعة"], [BOOKS.length, "كتابًا"], [COURSES.length, "دورات"], [KHUTAB.length, "خطبة"]];
  const quick = (S.quick || []).map(id => SERIES[id]).filter(Boolean);
  const ups = (S.upcoming || []).map(u => {
    const d = parseDate(u.date), e = parseDate(u.end), days = d ? Math.ceil((d - Date.now()) / 864e5) : null;
    return `<a class="ucard" href="${esc(u.href || "#/")}"><span class="u-date">${d ? `<b>${fGd.format(d)}</b><span>${fGm.format(d)}</span>` : ""}</span>
      <span class="u-body"><span class="u-pre">${esc(u.pre || "")}</span><span class="u-t">${esc(u.title)}</span>
      ${u.place ? `<span class="u-m">${ico("pin")}${esc(u.place)}</span>` : ""}${d ? `<span class="u-m">${ico("cal")}${fG.format(d)}${e ? " – " + fG.format(e) : ""}</span>` : ""}
      ${days != null && days >= 0 ? `<span class="u-c">بعد ${arN(days)} يومًا</span>` : ""}</span></a>`;
  }).join("");
  const topBooks = [...BOOKS].sort((a, b) => b.lessons.length - a.lessons.length).slice(0, 6);
  const cv = S.cv || [];
  V(`
  <section class="hero"><div class="wrap">
    ${p.pre ? `<p class="m-pre">${esc(p.pre)}</p>` : ""}
    <h1 class="m-name">${esc(p.name || "")}</h1>
    ${p.cred ? `<p class="m-cred">${esc(p.cred)}</p>` : ""}
    ${p.role ? `<p class="m-role">${esc(p.role)}</p>` : ""}
    ${p.lede ? `<p class="m-lede">${esc(p.lede)}</p>` : ""}
    <form class="m-search" id="home-search" role="search">
      <label class="field"><span class="sr">ابحث في المكتبة</span>${ico("search")}<input id="home-q" type="search" autocomplete="off" enterkeyhint="search" placeholder="ابحث عن درس أو كتاب أو خطبة…"></label>
      <button type="submit">ابحث</button>
    </form>
    <ul class="m-stats">${stats.map(([n, l]) => `<li><b>${arN(n)}</b><span>${l}</span></li>`).join("")}</ul>
  </div></section>
  <div class="sheet"><div class="wrap">
    ${S.notice ? `<a class="m-alert" href="${esc(S.notice.href || "#/")}">${ico("bell")}<span>${esc(S.notice.text)}</span>${ico("arrow", "i end")}</a>` : ""}
    <div class="split">
      <section class="sec"><div class="sec-h"><h2>أحدث التسجيلات</h2><a class="more" href="#/archive">الأرشيف كاملًا${ico("arrow")}</a></div>
        <ol class="rows">${ALL.slice(0, 7).map(it => row(it)).join("")}</ol></section>
      <div>
        ${ups ? `<section class="sec"><div class="sec-h"><h2>قادم</h2></div><div class="ups">${ups}</div></section>` : ""}
        <section class="sec"><div class="sec-h"><h2>أحدث الدورات</h2><a class="more" href="#/courses">الكل${ico("arrow")}</a></div>
          <div class="dgrid">${COURSES.slice(0, 3).map(ccard).join("")}</div></section>
      </div>
    </div>
    <section class="sec"><div class="sec-h"><h2>الكتب والشروح</h2><p>أكثر الكتب مجالس</p><a class="more" href="#/books">كل الكتب${ico("arrow")}</a></div>
      <div class="bgrid">${topBooks.map(bcard).join("")}</div>
      ${quick.length ? `<nav class="m-quick" style="margin-top:18px" aria-label="روابط سريعة">${quick.map(b => `<a href="#/book/${esc(b.id)}">${esc(b.title)}</a>`).join("")}</nav>` : ""}</section>
  </div></div>
  ${cv.length ? cvSection(cv) : ""}`);
  $("#home-search").addEventListener("submit", e => { e.preventDefault(); location.hash = "#/search?q=" + encodeURIComponent($("#home-q").value.trim()); });
  if (cv.length) bootCV();
}

/* ---------- CV (3D) ---------- */
function cvSection(cv) {
  const n = cv.length, e = cv[0];
  return `<section class="cv" id="cv" style="height:${Math.round(n * 42 + 40)}svh" aria-labelledby="cv-title">
    <div class="cv-pin">
      <canvas aria-hidden="true"></canvas>
      <div class="cv-head"><h2 id="cv-title">السيرة الذاتية</h2></div>
      <div class="cv-panel" aria-live="polite"><div class="in"><div class="y">${esc(e.year)}</div><h3>${esc(e.title)}</h3><div class="pl"${e.place ? "" : " hidden"}>${ico("pin")}<span>${esc(e.place || "")}</span></div><p>${esc(e.text || "")}</p></div></div>
      <ol class="cv-rail" aria-label="محطات السيرة">${cv.map((x, i) => `<li><button type="button" data-go="${i}" aria-current="${i === 0}" aria-label="${esc(x.year + " — " + x.title)}"><span class="yr">${esc(x.year)}</span></button></li>`).join("")}</ol>
      <div class="cv-count" aria-hidden="true"><span><b id="cv-n">١</b> / ${arN(n)}</span><span class="cv-bar"><i id="cv-bar"></i></span><span>مرّر للأسفل</span></div>
    </div>
  </section>`;
}
function cvFallback(root, cv) {
  root.classList.add("static"); root.style.height = "auto";
  $(".cv-pin", root).innerHTML = `<div class="wrap"><div class="cv-head" style="position:static;padding-top:40px"><h2>السيرة الذاتية</h2></div>
   <ol class="cv-fallback">${cv.map(e => `<li><b>${esc(e.year)}</b><h3>${esc(e.title)}</h3>${e.place ? `<p>${esc(e.place)}</p>` : ""}<p>${esc(e.text || "")}</p></li>`).join("")}</ol></div>`;
}
function bootCV() {
  const root = $("#cv"), cv = S.cv;
  let destroyed = false, handle = null;
  onCleanup(() => { destroyed = true; handle?.destroy(); });
  const io = new IntersectionObserver(async ents => {
    if (!ents.some(e => e.isIntersecting)) return;
    io.disconnect();
    try {
      const mod = await import("./cv3d.js");
      if (destroyed) return;
      handle = await mod.mountCV(root, cv, { reduced });
      if (destroyed) handle?.destroy(); else if (!handle) cvFallback(root, cv);
    } catch (err) { console.warn(err); if (!destroyed) cvFallback(root, cv); }
  }, { rootMargin: "700px 0px" });
  io.observe(root);
  onCleanup(() => io.disconnect());
}

/* ---------- books ---------- */
function viewBooks() {
  const st = { cat: "all", view: store.bview || "covers" };
  const counts = Object.fromEntries(CATS.map(c => [c.id, BOOKS.filter(b => b.cat === c.id).length]));
  V(`${pageHead("الكتب والشروح", `${arN(BOOKS.length)} كتابًا في ${arN(CATS.filter(c => counts[c.id]).length)} فنون، مرتّبة حسب الفن ثم عدد المجالس.`)}
  <div class="wrap page">
    <div class="toolbar">
      <div class="pills" id="cats"><button class="pill" type="button" data-cat="all" aria-pressed="true">الكل <span class="n">${arN(BOOKS.length)}</span></button>${CATS.filter(c => counts[c.id]).map(c => `<button class="pill" type="button" data-cat="${c.id}" aria-pressed="false">${esc(c.title)} <span class="n">${arN(counts[c.id])}</span></button>`).join("")}</div>
      <div class="seg" style="margin-inline-start:auto" id="vw"><button type="button" data-v="covers">${ico("grid")}أغلفة</button><button type="button" data-v="list">${ico("list")}قائمة</button></div>
    </div>
    <div id="lst"></div>
  </div>`);
  const draw = () => {
    $$("#cats .pill").forEach(b => b.setAttribute("aria-pressed", b.dataset.cat === st.cat));
    $$("#vw button").forEach(b => b.setAttribute("aria-pressed", b.dataset.v === st.view));
    $("#lst").innerHTML = CATS.filter(c => counts[c.id] && (st.cat === "all" || st.cat === c.id)).map(c => {
      const list = BOOKS.filter(b => b.cat === c.id).sort((a, b) => b.lessons.length - a.lessons.length);
      return `<section class="sec"><div class="sec-h"><h2>${esc(c.title)}</h2><p>${c.desc ? esc(c.desc) + " · " : ""}${arN(list.length)} ${list.length > 10 ? "كتابًا" : "كتب"}</p></div>
        ${st.view === "covers" ? `<div class="bgrid">${list.map(bcard).join("")}</div>` :
          `<ol class="rows blist">${list.map(b => `<li class="row">${cover(b)}<div class="rb"><a class="rt" href="#/book/${esc(b.id)}">${esc(b.title)}</a><div class="rm">${b.author ? `<span>${esc(b.author)}</span>` : ""}<span>${nSessions(b.lessons.length)}</span><span>${hours(b.lessons)} ساعة</span>${b._first ? `<span>${yearSpan(b)}</span>` : ""}</div></div><div class="ra"><a class="btn" href="#/book/${esc(b.id)}">${ico("arrow")}المجالس</a></div></li>`).join("")}</ol>`}</section>`;
    }).join("");
  };
  $("#cats").addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (b) { st.cat = b.dataset.cat; draw(); } });
  $("#vw").addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (b) { st.view = store.bview = b.dataset.v; save(); draw(); } });
  draw();
}

/* ---------- book / course page ---------- */
function viewSeries(id) {
  const s = SERIES[id];
  if (!s) return viewNotFound();
  const isBook = s.type === "book", c = CAT[s.cat];
  const st = { asc: isBook };
  const crumbs = isBook ? [["#/books", "الكتب والشروح"], ...(c ? [["#/books", c.title]] : [])] : [["#/courses", "الدورات"]];
  const extra = `
    <div class="bstats">${s.author ? `<span>${ico("pen")}${isBook ? "تأليف: " : ""}${esc(s.author)}</span>` : ""}${s.book ? `<span>${ico("book")}${esc(s.book)}</span>` : ""}${s.place ? `<span>${ico("pin")}${esc(s.place)}</span>` : ""}
      <span>${ico("layers")}${nSessions(s.lessons.length)}</span><span>${ico("clock")}${arN(hours(s.lessons))} ساعة</span>
      ${s._first ? `<span>${ico("cal")}${fG.format(s._first)} – ${fG.format(s._last)}</span>` : ""}</div>
    ${s.desc ? `<p style="margin-top:10px">${esc(s.desc)}</p>` : ""}
    <div class="prog"><span id="pg-t"></span><span class="bar"><i id="pg-b"></i></span></div>`;
  V(`<header class="page-h"><div class="wrap bhead"><div>
      <nav class="crumb" aria-label="مسار"><a href="#/">الرئيسية</a>${crumbs.map(([h, t]) => `<span>/</span><a href="${h}">${esc(t)}</a>`).join("")}</nav>
      <h1>${esc(s.title)}</h1>${extra}</div>${cover(s)}</div></header>
  <div class="wrap page">
    <div class="toolbar"><div class="seg" id="ord"><button type="button" data-a="1">الأقدم أولًا</button><button type="button" data-a="0">الأحدث أولًا</button></div>
      <div class="pills" id="yrs"></div><span class="count" style="margin:0 auto 0 0">${nSessions(s.lessons.length)}</span></div>
    <div id="lst"></div>
  </div>`);
  const prog = () => { const h = s.lessons.filter(l => store.heard[l.id]).length; $("#pg-t").textContent = `سمعت ${arN(h)} من ${arN(s.lessons.length)}`; $("#pg-b").style.width = (h / s.lessons.length * 100) + "%"; };
  const draw = () => {
    $$("#ord button").forEach(b => b.setAttribute("aria-pressed", (b.dataset.a === "1") === st.asc));
    const list = [...s.lessons].sort((a, b) => st.asc ? (a._d || 0) - (b._d || 0) : (b._d || 0) - (a._d || 0));
    const g = groupByYear(list, !st.asc);
    $("#yrs").innerHTML = g.length > 1 ? g.map(([y]) => `<a class="pill" href="#y-${y}" data-y="${y}">${arD(y)}</a>`).join("") : "";
    $("#lst").innerHTML = yearGroups(list, { chip: false, plain: true }, !st.asc);
    prog();
  };
  $("#ord").addEventListener("click", e => { const b = e.target.closest("[data-a]"); if (b) { st.asc = b.dataset.a === "1"; draw(); } });
  $("#yrs").addEventListener("click", e => { const a = e.target.closest("[data-y]"); if (a) { e.preventDefault(); $("#y-" + a.dataset.y)?.scrollIntoView({ behavior: "smooth" }); } });
  const h = () => prog(); document.addEventListener("heard", h); onCleanup(() => document.removeEventListener("heard", h));
  draw();
}

/* ---------- courses ---------- */
function viewCourses() {
  const g = groupByYear(COURSES.map(c => ({ ...c, _d: c._first })));
  V(`${pageHead("الدورات العلمية", `${arN(COURSES.length)} دورة، مرتبة من الأحدث.`)}
  <div class="wrap page">${(S.upcoming || []).length ? `<section class="sec"><div class="sec-h"><h2>قادم</h2></div><div class="dgrid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))">${(S.upcoming || []).map(u => { const d = parseDate(u.date); return `<a class="ucard" href="${esc(u.href || "#/")}"><span class="u-date">${d ? `<b>${fGd.format(d)}</b><span>${fGm.format(d)}</span>` : ""}</span><span class="u-body"><span class="badge">قادم</span><span class="u-pre">${esc(u.pre || "")}</span><span class="u-t">${esc(u.title)}</span>${u.place ? `<span class="u-m">${ico("pin")}${esc(u.place)}</span>` : ""}</span></a>`; }).join("")}</div></section>` : ""}
    ${g.map(([y, list]) => `<section class="ygrp"><div class="ygrp-h"><b>${arD(y)}</b><small>${arN(list.length)} دورة</small></div><div class="dgrid" style="grid-template-columns:repeat(auto-fill,minmax(340px,1fr))">${list.map(c => ccard(SERIES[c.id])).join("")}</div></section>`).join("")}
  </div>`);
}

/* ---------- simple year-grouped lists (khutab / lectures / clips / archive) ---------- */
function viewList(items, title, desc, crumbs = [], opts = {}) {
  V(`${pageHead(title, desc, crumbs)}
  <div class="wrap page">
    <div class="toolbar"><label class="tfield">${ico("search")}<span class="sr">تصفية</span><input id="flt" type="search" placeholder="تصفية بالعنوان…" autocomplete="off"></label>
      ${opts.kinds ? `<div class="pills" id="kinds"><button class="pill" type="button" data-k="" aria-pressed="true">الكل</button>${Object.entries(KIND).filter(([k]) => items.some(i => i.kind === k)).map(([k, t]) => `<button class="pill" type="button" data-k="${k}" aria-pressed="false">${t}</button>`).join("")}</div>` : ""}</div>
    <p class="count" id="cnt"></p><div id="yrs" class="pills" style="margin-bottom:6px"></div><div id="lst"></div>
  </div>`);
  let kind = "";
  const draw = () => {
    const q = $("#flt").value.trim(), n = norm(q);
    const l = items.filter(it => (!kind || it.kind === kind) && (!n || norm(titleOf(it) + " " + (it.desc || "")).includes(n)));
    $("#cnt").textContent = `${arN(l.length)} من ${arN(items.length)}`;
    const ys = groupByYear(l).map(([y]) => y);
    $("#yrs").innerHTML = ys.length > 2 ? ys.map(y => `<a class="pill" href="#y-${y}" data-y="${y}">${arD(y)}</a>`).join("") : "";
    $("#lst").innerHTML = l.length ? yearGroups(l, { q }) : `<div class="empty">لا نتائج</div>`;
  };
  $("#flt").addEventListener("input", draw);
  $("#kinds")?.addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (!b) return; kind = b.dataset.k; $$("#kinds .pill").forEach(x => x.setAttribute("aria-pressed", x === b)); draw(); });
  $("#yrs").addEventListener("click", e => { const a = e.target.closest("[data-y]"); if (a) { e.preventDefault(); $("#y-" + a.dataset.y)?.scrollIntoView({ behavior: "smooth" }); } });
  draw();
}

/* ---------- lesson page ---------- */
function viewLesson(id) {
  const it = BY_ID[id];
  if (!it) return viewNotFound();
  const s = it.parent && SERIES[it.parent], m = it.media || {};
  let player = `<div class="player"><span class="pi">${ico("play")}</span><span>سيُضاف التسجيل قريبًا</span></div>`;
  if (m.type === "youtube") player = `<div class="player"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(m.id)}" title="${esc(titleOf(it))}" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
  else if (m.type === "audio") player = `<div class="player audio"><audio controls preload="none" src="${esc(m.src)}"></audio></div>`;
  else if (m.type === "pdf") player = `<div class="player" style="aspect-ratio:3/4"><iframe src="${esc(m.src)}" title="${esc(it.title)}"></iframe></div>`;
  else if (m.type === "link") player = `<div class="player"><a class="btn-acc" href="${esc(m.href)}" target="_blank" rel="noopener">${ico("link")} فتح الرابط</a></div>`;
  const listPage = { khutbah: ["#/khutab", "الخطب"], lecture: ["#/lectures", "المحاضرات"], clip: ["#/clips", "المقاطع"] }[it.kind];
  const crumbs = s ? [[s.type === "book" ? "#/books" : "#/courses", s.type === "book" ? "الكتب والشروح" : "الدورات"], [`#/${s.type}/${s.id}`, s.title]] : [listPage];
  const pool = s ? s.lessons : ALL.filter(x => x.kind === it.kind);
  const idx = pool.findIndex(x => x.id === id);
  const sib = s ? pool : pool.slice(Math.max(0, idx - 3), idx + 4);
  const heard = !!store.heard[id];
  V(`${pageHead(s ? s.title : it.title, s ? esc(it.title) : `<span style="color:var(--teal)">${KIND[it.kind]}</span>`, crumbs)}
  <div class="wrap page"><div class="item-wrap">
    <article>
      ${player}
      <div class="rm" style="font-size:13.5px;margin:14px 0">${it._d ? `<span>${ico("cal")} ${hijri(it._d)}</span><span>${fG.format(it._d)}</span>` : ""}${it.dur ? `<span dir="ltr">${arD(it.dur)}</span>` : ""}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">
        <button class="btn${heard ? " on" : ""}" type="button" data-heard="${esc(id)}" aria-pressed="${heard}">${ico("check")}<span>${heard ? "مسموع" : "علِّم كمسموع"}</span></button>
        ${idx > 0 ? `<a class="btn" href="#/lesson/${esc(pool[idx - 1].id)}">السابق</a>` : ""}${idx < pool.length - 1 ? `<a class="btn" href="#/lesson/${esc(pool[idx + 1].id)}">التالي</a>` : ""}
      </div>
      ${it.desc ? `<div class="prose"><p>${esc(it.desc).replace(/\n+/g, "</p><p>")}</p></div>` : ""}
    </article>
    <aside class="side"><div class="pane"><h3>${s ? "مجالس الكتاب" : "من " + esc(listPage[1])}</h3><ol class="rows">${sib.map(x => row(x, { chip: false, plain: true })).join("")}</ol></div></aside>
  </div></div>`);
  $(`.side .row[data-id="${CSS.escape(id)}"]`)?.style.setProperty("border-color", "var(--acc)");
}

/* ---------- blog ---------- */
function viewBlog() {
  V(`${pageHead("المدونة", "مقالات وفوائد مكتوبة.")}
  <div class="wrap page">${POSTS.length ? `<div class="posts">${POSTS.map(p => `<a class="post" href="#/post/${esc(p.id)}"><span class="date">${p._d ? fG.format(p._d) : ""}</span><h3>${esc(p.title)}</h3><p>${esc((p.body || [])[0] || "")}</p></a>`).join("")}</div>` : `<div class="empty">لا مقالات بعد</div>`}</div>`);
}
function viewPost(id) {
  const p = POSTS.find(x => x.id === id); if (!p) return viewNotFound();
  V(`${pageHead(p.title, p._d ? `${hijri(p._d)} · ${fG.format(p._d)}` : "", [["#/blog", "المدونة"]])}
  <div class="wrap page"><article class="prose article">${(p.body || []).map(t => `<p>${esc(t)}</p>`).join("")}</article></div>`);
}

/* ---------- more / about / search ---------- */
function viewMore() {
  const T = [
    ["#/about", "user", "عن الشيخ والسيرة", "نبذة عن الشيخ وسيرته الذاتية"],
    ["#/books", "book", "الكتب والشروح", `${arN(BOOKS.length)} كتابًا`],
    ["#/courses", "layers", "الدورات العلمية", `${arN(COURSES.length)} دورة`],
    ["#/khutab", "minbar", "الخطب", `${arN(KHUTAB.length)} خطبة`],
    ["#/lectures", "mic", "المحاضرات والكلمات", `${arN(LECTURES.length)} محاضرة`],
    ["#/clips", "clip", "مقاطع وفوائد", `${arN(CLIPS.length)} مقطعًا`],
    ["#/archive", "archive", "الأرشيف بالتاريخ", "كل التسجيلات مرتبة بالسنة"],
    ["#/search", "search", "البحث في المكتبة", "في العناوين والكتب والخطب"],
    ["#/blog", "pen", "المدونة", "مقالات وفوائد مكتوبة"]
  ];
  V(`${pageHead("المزيد", "")}
  <div class="wrap page">
    <div class="tiles">${T.map(([h, i, t, s]) => `<a class="tile" href="${h}"><span class="ti">${ico(i)}</span><span><b>${t}</b><span>${s}</span></span></a>`).join("")}</div>
    ${(S.accounts || []).length ? `<section class="sec" style="margin-top:40px"><div class="sec-h"><h2>حسابات الشيخ</h2></div><div class="tiles">${S.accounts.map(a => `<a class="tile" href="${esc(a.href)}" target="_blank" rel="noopener"><span class="ti">${ico(a.icon || "link")}</span><span><b>${esc(a.label)}</b><span dir="ltr">${esc(a.sub || "")}</span></span></a>`).join("")}</div></section>` : ""}
  </div>`);
}
function viewAbout() {
  const a = S.about || {}, p = S.person || {}, cv = S.cv || [];
  V(`${pageHead("عن الشيخ", esc((p.pre ? p.pre + " " : "") + (p.name || "")), [["#/more", "المزيد"]])}
  <div class="wrap page"><div class="prose" style="max-width:780px">${(a.paragraphs || []).map(t => `<p>${esc(t)}</p>`).join("")}</div></div>
  ${cv.length ? cvSection(cv) : ""}`);
  if (cv.length) bootCV();
}
function viewSearch(q) {
  V(`${pageHead("البحث في المكتبة", "ابحث في عناوين الدروس والكتب والخطب والمحاضرات.")}
  <div class="wrap page">
    <form class="toolbar" id="sf" role="search"><label class="tfield">${ico("search")}<span class="sr">ابحث</span><input id="sq" type="search" value="${esc(q)}" placeholder="اكتب كلمة…" autocomplete="off"></label><button class="btn-acc" style="height:44px">ابحث</button></form>
    <p class="count" id="cnt"></p><div id="bres"></div><ol class="rows" id="res"></ol></div>`);
  const run = () => {
    const v = $("#sq").value.trim(), n = norm(v);
    const res = !n ? [] : ALL.filter(it => norm([titleOf(it), it.desc, (SERIES[it.parent]?.author) || ""].join(" ")).includes(n));
    const bres = !n ? [] : [...BOOKS, ...COURSES].filter(s => norm(s.title + " " + (s.author || "")).includes(n));
    $("#cnt").textContent = n ? `${arN(res.length)} نتيجة${bres.length ? ` · ${arN(bres.length)} كتاب/دورة` : ""}` : "";
    $("#bres").innerHTML = bres.length ? `<div class="pills" style="margin-bottom:14px">${bres.map(s => `<a class="pill" href="#/${s.type}/${esc(s.id)}">${ico(s.type === "book" ? "book" : "layers")}${hl(s.title, v)}</a>`).join("")}</div>` : "";
    $("#res").innerHTML = n && !res.length && !bres.length ? `<div class="empty">لا نتائج لـ «${esc(v)}»</div>` : res.slice(0, 200).map(it => row(it, { q: v })).join("");
  };
  $("#sf").addEventListener("submit", e => { e.preventDefault(); history.replaceState(null, "", "#/search?q=" + encodeURIComponent($("#sq").value.trim())); run(); });
  $("#sq").addEventListener("input", run);
  run(); setTimeout(() => $("#sq").focus(), 50);
}
function viewNotFound() { V(`${pageHead("الصفحة غير موجودة", "ربما نُقلت أو حُذفت.")}<div class="wrap page"><a class="btn" href="#/">${ico("arrow")}العودة للرئيسية</a></div>`); }

/* ---------- chrome & router ---------- */
const NAV = [["#/", "الرئيسية", "home"], ["#/books", "الكتب", "books"], ["#/courses", "الدورات", "courses"], ["#/khutab", "الخطب", "khutab"], ["#/lectures", "المحاضرات", "lectures"], ["#/clips", "المقاطع", "clips"], ["#/archive", "الأرشيف", "archive"], ["#/blog", "المدونة", "blog"], ["#/more", "المزيد", "more"]];
const NAV_OF = { book: "books", course: "courses", post: "blog", about: "more", search: "" };
function chrome() {
  $("#brand").innerHTML = `<span>${esc(S.short || S.brand || "")}</span>`;
  $("#tnav").innerHTML = NAV.map(([h, t, k]) => `<a href="${h}" data-k="${k}">${t}</a>`).join("");
  $$("[data-ico]").forEach(el => el.innerHTML = ico(el.dataset.ico));
  $("#foot").innerHTML = `<div class="wrap foot-in"><a class="brand" href="#/">${esc(S.brand || "")}</a><span>${esc(S.footer || "")}</span><span>© ${arD(new Date().getFullYear())}</span></div>`;
  const top = $("#top"), mb = $("#menu-btn");
  mb.addEventListener("click", () => { const o = top.classList.toggle("nav-open"); mb.setAttribute("aria-expanded", o); });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-heard]"); if (!b) return;
    const id = b.dataset.heard, on = !store.heard[id];
    if (on) store.heard[id] = 1; else delete store.heard[id];
    save();
    $$(`[data-heard="${CSS.escape(id)}"]`).forEach(x => { x.setAttribute("aria-pressed", on); if (x.classList.contains("btn")) { x.classList.toggle("on", on); const sp = x.querySelector("span"); if (sp) sp.textContent = on ? "مسموع" : "علِّم كمسموع"; } });
    $$(`.row[data-id="${CSS.escape(id)}"]`).forEach(r => r.classList.toggle("heard", on));
    document.dispatchEvent(new Event("heard"));
  });
}
function route() {
  cleanups.forEach(f => { try { f(); } catch {} }); cleanups = [];
  const raw = location.hash.slice(1) || "/";
  const [path, qs] = raw.split("?");
  const parts = path.split("/").filter(Boolean).map(decodeURIComponent);
  const key = parts[0] || "home", arg = parts[1] || "";
  const top = $("#top");
  top.classList.remove("nav-open");
  const navKey = NAV_OF[key] ?? key;
  $$("#tnav a").forEach(a => a.dataset.k === navKey ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  window.scrollTo(0, 0);
  let title = "";
  switch (key) {
    case "home": viewHome(); break;
    case "books": viewBooks(); title = "الكتب والشروح"; break;
    case "book": case "course": viewSeries(arg); title = SERIES[arg]?.title; break;
    case "courses": viewCourses(); title = "الدورات"; break;
    case "khutab": viewList(KHUTAB, "الخطب", `${arN(KHUTAB.length)} خطبة جمعة، مرتبة من الأحدث.`); title = "الخطب"; break;
    case "lectures": viewList(LECTURES, "المحاضرات والكلمات", `${arN(LECTURES.length)} محاضرة.`); title = "المحاضرات"; break;
    case "clips": viewList(CLIPS, "المقاطع", `${arN(CLIPS.length)} مقطعًا قصيرًا منتقًى.`); title = "المقاطع"; break;
    case "archive": viewList(ALL, "الأرشيف", `كل التسجيلات (${arN(ALL.length)}) مرتبة بالسنة.`, [], { kinds: true }); title = "الأرشيف"; break;
    case "lesson": viewLesson(arg); title = BY_ID[arg] && titleOf(BY_ID[arg]); break;
    case "blog": viewBlog(); title = "المدونة"; break;
    case "post": viewPost(arg); title = POSTS.find(p => p.id === arg)?.title; break;
    case "more": viewMore(); title = "المزيد"; break;
    case "about": viewAbout(); title = "عن الشيخ"; break;
    case "search": viewSearch(new URLSearchParams(qs || "").get("q") || ""); title = "البحث"; break;
    default: viewNotFound();
  }
  document.title = title ? `${title} | ${S.short || S.brand}` : `${S.person?.pre || ""} ${S.person?.name || ""} — ${S.brand}`.trim();
  $("#view").focus({ preventScroll: true });
}
chrome();
addEventListener("hashchange", route);
route();
