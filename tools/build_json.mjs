/* يولّد ملفات JSON لتطبيق الجوال من ملفات بيانات الموقع — لا تعدّل data/json يدويًا.
     المصدر (يُعدَّل باليد):   data/content.js · data/articles.js
     المصدر (يُولَّد آليًا):   data/youtube.js
     الناتج:                   data/json/{content,articles,youtube,index}.json
   الصيغة موثقة في docs/data-format.md. يعمل آليًا في .github/workflows/youtube.yml،
   وللتشغيل اليدوي:  node tools/build_json.mjs
   إن وُجد خطأ (معرّف مكرر أو ناقص، ملف كتاب مفقود…) يتوقف بلا كتابة، فيتوقف النشر ويبقى الموقع الحالي. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const SCHEMA = 1;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "json");
const errors = [], warnings = [];
const fail = m => errors.push(m), warn = m => warnings.push(m);

/* يقرأ ملف بيانات كما يقرؤه المتصفح: يشغّله في بيئة معزولة فيها window فقط */
function load(rel, name) {
  const file = path.join(ROOT, rel);
  const ctx = { window: {} };
  vm.createContext(ctx);
  try { vm.runInContext(fs.readFileSync(file, "utf8"), ctx, { filename: rel, timeout: 5000 }); }
  catch (e) { fail(`${rel}: تعذّرت قراءته — ${e.message}`); return null; }
  if (!ctx.window[name]) fail(`${rel}: لا يحتوي window.${name}`);
  return ctx.window[name] ? JSON.parse(JSON.stringify(ctx.window[name])) : null;
}

const SITE = load("data/content.js", "SITE") || {};
const ART = load("data/articles.js", "ART") || { cats: [], posts: [] };
const YT = load("data/youtube.js", "YT") || {};

const BASE = String(SITE.base || "https://asim-al-qaryuti.github.io").replace(/\/+$/, "");
const page = route => `${BASE}/#/${route}`;
/* رابط مطلق: الكامل يبقى كما هو، و«#/…» صفحة في الموقع، وغيره مسار ملف في المستودع */
const abs = u => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("#")) return `${BASE}/${u}`;
  return `${BASE}/${encodeURI(u.replace(/^\.?\//, ""))}`;
};
const ytWatch = id => `https://www.youtube.com/watch?v=${id}`;
const ytThumb = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const ID_RE = /^[A-Za-z0-9_-]+$/;
function checkIds(list, what) {
  const seen = new Set();
  for (const x of list) {
    if (!x.id) { fail(`${what}: عنصر بلا id — «${x.title || x.t || "?"}»`); continue; }
    if (!ID_RE.test(x.id)) fail(`${what}: المعرّف "${x.id}" فيه أحرف غير مسموحة (المسموح: حروف إنجليزية وأرقام و - و _)`);
    if (seen.has(x.id)) fail(`${what}: المعرّف "${x.id}" مكرر`);
    seen.add(x.id);
  }
}

/* ---------- youtube.json: ما يظهر في الموقع فقط ---------- */
const YV = YT.videos || {}, YL = YT.lib || {};
const TOPIC_OF = YL.topic_of || {};
const shown = new Set();
const series = (YL.series || []).map(s => {
  const items = (s.items || []).filter(v => YV[v]);
  items.forEach(v => shown.add(v));
  return { id: s.id, kind: s.kind, title: s.title, author: s.author || null, category: s.cat || null,
           description: s.desc || null, items, url: page(`program/${s.id}`) };
}).filter(s => s.items.length);
checkIds(series, "youtube.json · series");
const lists = {};
for (const k of ["khutab", "lectures", "clips"]) {
  lists[k] = (YL[k] || []).filter(v => YV[v]);
  lists[k].forEach(v => shown.add(v));
}
const videos = [...shown].map(id => {
  const v = YV[id];
  return { id, title: v.t, date: v.d || null, duration: v.s || 0, short: !!v.sh, description: v.x || null,
           channel: v.ext || null, topic: TOPIC_OF[id] || null,
           youtube_url: ytWatch(id), thumbnail: ytThumb(id), url: page(`lesson/${id}`) };
}).sort((a, b) => (b.date || "").localeCompare(a.date || "") || a.id.localeCompare(b.id));
const youtube = {
  schema: SCHEMA,
  updated: YT.updated || null,
  channel_url: YT.channel ? `https://www.youtube.com/channel/${YT.channel}` : null,
  categories: (SITE.categories || []).map(c => ({ id: c.id, title: c.title, color: c.color || null })),
  topics: (YL.topics || []).map(t => ({ id: t.id, title: t.title, url: page(`topic/${t.id}`) })),
  series,
  khutab: lists.khutab, lectures: lists.lectures, clips: lists.clips,
  videos,
};
for (const k of ["books", "courses", "khutab", "lectures", "clips"])
  if ((SITE[k] || []).length) warn(`content.js: ${k} فيه مواد يدوية لا تُصدَّر إلى JSON بعد`);

/* ---------- content.json ---------- */
const WTYPES = ["تأليف", "بحث محكّم", "تحقيق", "تقديم ومراجعة"];
const works = (SITE.works || []).map(w => typeof w === "string" ? { title: w } : w);
checkIds(works, "content.js · works");
const books = works.map(w => {
  const file = w.href || w.pdf || "";
  if (file && !/^https?:\/\//i.test(file) && !fs.existsSync(path.join(ROOT, file)))
    fail(`content.js · works: ملف الكتاب «${w.title}» غير موجود: ${file}`);
  if (w.type && !WTYPES.includes(w.type)) warn(`content.js · works: نوع غير معروف "${w.type}" في «${w.title}»`);
  return { id: w.id, title: w.title, type: w.type || "تأليف", note: w.note || null,
           href: abs(file), url: file ? page(`read/${w.id}`) : page("books") };
});
const cvLink = l => l.id
  ? { title: l.t, type: "video", video_id: l.id, youtube_url: ytWatch(l.id), url: shown.has(l.id) ? page(`lesson/${l.id}`) : ytWatch(l.id) }
  : { title: l.t, type: "page", url: abs(l.href) };
const content = {
  schema: SCHEMA,
  site: { name: SITE.brand || null, short_name: SITE.short || null, base_url: BASE, footer: SITE.footer || null },
  person: { ...(SITE.person || {}), photo: abs(SITE.person?.photo) },
  about: (SITE.about?.paragraphs) || [],
  cv: (SITE.cv || []).map(c => ({ year: c.year || null, title: c.title, place: c.place || null, text: c.text || "",
                                 image: abs(c.img), links: (c.links || []).map(cvLink) })),
  book_types: WTYPES,
  books,
  accounts: (SITE.accounts || []).map(a => ({ label: a.label, sub: a.sub || null, url: a.href, icon: a.icon || null })),
};

/* ---------- articles.json ---------- */
const blocks = paras => (paras || []).map(p => {
  const s = String(p);
  if (s.startsWith("## ")) return { type: "heading", text: s.slice(3) };
  if (s.startsWith("> ")) return { type: "quote", text: s.slice(2) };
  return { type: "paragraph", text: s };
});
const rawPosts = [...(SITE.blog || []), ...(ART.posts || [])];
checkIds(rawPosts, "articles.js · posts");
const catIds = new Set((ART.cats || []).map(c => c.id));
const posts = rawPosts.map(p => {
  if (p.cat && !catIds.has(p.cat)) warn(`articles.js: التصنيف "${p.cat}" في المقال ${p.id} غير معرّف في cats`);
  return { id: p.id, title: p.title || p.t, category: p.cat || null, date: p.date || p.d || null,
           source: p.src || null, source_url: p.url || null, blocks: blocks(p.body || p.b), url: page(`post/${p.id}`) };
});
const articles = {
  schema: SCHEMA,
  categories: (ART.cats || []).map(c => ({ id: c.id, title: c.title, count: posts.filter(p => p.category === c.id).length, url: page(`blog/${c.id}`) })),
  posts,
};

/* ---------- write ---------- */
for (const w of warnings) console.warn("تنبيه:", w);
if (errors.length) {
  for (const e of errors) console.error("خطأ:", e);
  console.error(`\nتوقف التوليد: ${errors.length} خطأ. لم يُكتب أي ملف.`);
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });
const files = {};
for (const [name, data] of Object.entries({ content, articles, youtube })) {
  const text = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(path.join(OUT, `${name}.json`), text);
  files[name] = { url: `${BASE}/data/json/${name}.json`, sha256: crypto.createHash("sha256").update(text).digest("hex"), bytes: Buffer.byteLength(text) };
}
const index = { schema: SCHEMA, base_url: BASE, youtube_updated: YT.updated || null, files };
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(index, null, 2) + "\n");
console.log(`كُتبت ملفات JSON: ${books.length} كتابًا، ${posts.length} مقالًا، ${videos.length} مقطعًا، ${series.length} برنامجًا وشرحًا.`);
