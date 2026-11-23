# صيغة بيانات الموقع (JSON) — لتطبيق الجوال

يقرأ تطبيق الجوال محتوى الموقع من ملفات JSON منشورة مع الموقع:

```
https://asim-al-qaryuti.github.io/data/json/index.json
https://asim-al-qaryuti.github.io/data/json/content.json
https://asim-al-qaryuti.github.io/data/json/articles.json
https://asim-al-qaryuti.github.io/data/json/youtube.json
```

## من أين تأتي هذه الملفات

| المصدر | يعدَّل | الناتج |
|---|---|---|
| `data/content.js` | باليد | `content.json` |
| `data/articles.js` | باليد | `articles.json` |
| `data/youtube.js` | آليًا من يوتيوب (`tools/update_youtube.py`) | `youtube.json` |

- الأداة `tools/build_json.mjs` تولّد الملفات الأربعة من المصادر أعلاه، **ولا تُعدَّل ملفات `data/json` يدويًا أبدًا**.
- تعمل الأداة آليًا في `.github/workflows/youtube.yml`:
  - كل ٦ ساعات بعد جلب مقاطع يوتيوب؛
  - عند كل رفع إلى المستودع (فأي تعديل على `content.js` أو `articles.js` يحدّثها خلال دقائق)؛
  - ويمكن تشغيلها يدويًا: تبويب **Actions** ← «تحديث يوتيوب ونشر الموقع» ← **Run workflow**.
- إن وجدت الأداة خطأ في البيانات (ملف لا يُقرأ، معرّف ناقص أو مكرر، ملف كتاب غير موجود) **تتوقف بلا كتابة**، فلا يُنشر شيء ويبقى الموقع والملفات السابقة كما هي، ويظهر سبب الخطأ في سجل التشغيل في تبويب Actions.
- تشغيلها على الجهاز (يحتاج Node 18 فأحدث): `node tools/build_json.mjs`

## قواعد عامة

- **الترميز** UTF-8، والنصوص عربية كما هي.
- **`schema`** في كل ملف: رقم إصدار الصيغة، الآن `1`. يزيد فقط عند تغيير يكسر التوافق (حذف حقل أو تغيير معناه). إضافة حقل جديد لا تغيّره، فليتجاهل التطبيق الحقول التي لا يعرفها.
- **المعرّفات (`id`) ثابتة لا تتغير**، فيصح أن يحفظها التطبيق (للمفضلة وسجل المشاهدة والقراءة):
  - الكتاب: `id` المكتوب في `content.js` (مثل `w5` و`ithaf`).
  - المقال: `id` المكتوب في `articles.js` (مثل `a4b47612` و`x19990528`).
  - المقطع: معرّف يوتيوب نفسه (مثل `tk3Y1XFG37w`).
  - البرنامج أو الكتاب المشروح: معرّفه في `youtube-rules.json` (مثل `riyad`).
  - المسموح في المعرّف: حروف إنجليزية وأرقام و`-` و`_`.
- **كل الروابط مطلقة كاملة** (تبدأ بـ `https://`). الحقل `url` في أي عنصر هو صفحته في الموقع.
- **القيمة الغائبة** `null` (لا تُحذف المفاتيح)، والقوائم الفارغة `[]`.
- **التواريخ** ميلادية بصيغة `YYYY-MM-DD`، و`null` إن لم تُعرف.

## index.json — فهرس للتحقق من التحديث

```json
{
  "schema": 1,
  "base_url": "https://asim-al-qaryuti.github.io",
  "youtube_updated": "2026-11-23 10:19 UTC",
  "files": {
    "content":  { "url": "https://…/data/json/content.json",  "sha256": "…", "bytes": 29640 },
    "articles": { "url": "https://…/data/json/articles.json", "sha256": "…", "bytes": 812540 },
    "youtube":  { "url": "https://…/data/json/youtube.json",  "sha256": "…", "bytes": 449598 }
  }
}
```

يُنزّل التطبيق `index.json` (صغير) ويقارن `sha256` لكل ملف بما عنده، فلا يُنزّل إلا الملف الذي تغيّر.

## content.json

| الحقل | النوع | المعنى |
|---|---|---|
| `site` | كائن | `name` اسم الموقع، `short_name` الاسم المختصر، `base_url` عنوانه، `footer` سطر الحقوق |
| `person` | كائن | `pre` اللقب («فضيلة الشيخ…»)، `name`، `cred` الصفة العلمية، `role`، `lede` سطر التعريف، `photo` رابط الصورة أو `null` |
| `about` | قائمة نصوص | فقرات التعريف بالشيخ |
| `cv` | قائمة | محطات السيرة بالترتيب — انظر أدناه |
| `book_types` | قائمة نصوص | أنواع الكتب بترتيب العرض: `تأليف`، `بحث محكّم`، `تحقيق`، `تقديم ومراجعة` |
| `books` | قائمة | الكتب — انظر أدناه |
| `accounts` | قائمة | حسابات الشيخ: `label`، `sub` (نص قصير)، `url`، `icon` |

**محطة السيرة (`cv[]`)**

| الحقل | المعنى |
|---|---|
| `year` | عنوان قصير للمحطة: سنة هجرية مثل «١٣٧٤ هـ» أو كلمة مثل «مشايخه» |
| `title`، `place`، `text` | العنوان والمكان والنص |
| `image` | رابط صورة أو `null` |
| `links` | روابط مرتبطة: `{ title, type: "video", video_id, youtube_url, url }` لمقطع، أو `{ title, type: "page", url }` لصفحة في الموقع |

**الكتاب (`books[]`)**

```json
{
  "id": "w39",
  "title": "قطف الثمر في بيان عقيدة أهل الأثر",
  "type": "تحقيق",
  "note": "لصديق حسن خان — على نسخة خطية",
  "href": "https://asim-al-qaryuti.github.io/books/qatf-althamar.pdf",
  "url": "https://asim-al-qaryuti.github.io/#/read/w39"
}
```

| الحقل | المعنى |
|---|---|
| `type` | واحد من `book_types` |
| `note` | سطر وصف (المؤلف الأصلي، الناشر، الاشتراك…) أو `null` |
| `href` | **رابط ملف الكتاب (PDF)** أو `null` إن لم يتوفر. قد يكون داخل الموقع أو في مكان آخر (مثل Cloudflare R2) — يتعامل معه التطبيق كرابط عادي ولا يفترض مكانه |
| `url` | صفحة قراءته في الموقع، أو صفحة الكتب إن لم يكن له ملف |

## articles.json

| الحقل | المعنى |
|---|---|
| `categories` | التصنيفات بترتيب العرض: `{ id, title, count, url }` — `count` عدد مقالاته (قد يكون ٠ فيُخفى) |
| `posts` | المقالات بترتيب ملف المصدر (يرتّبها التطبيق بالتاريخ إن شاء؛ كثير منها بلا تاريخ) |

**المقال (`posts[]`)**

```json
{
  "id": "a4b47612",
  "title": "التنبيه على عدم صحة حديث يوم الجوائز",
  "category": "hadith",
  "date": null,
  "source": "موقع الشيخ القديم",
  "source_url": null,
  "blocks": [
    { "type": "heading",   "text": "…" },
    { "type": "paragraph", "text": "…" },
    { "type": "quote",     "text": "…" }
  ],
  "url": "https://asim-al-qaryuti.github.io/#/post/a4b47612"
}
```

| الحقل | المعنى |
|---|---|
| `category` | `id` من `categories` |
| `source` | مصدر المقال: «موقع الشيخ القديم» أو «حساب الشيخ في إكس» |
| `source_url` | رابط المنشور الأصلي إن وُجد (منشورات إكس) |
| `blocks` | نص المقال قطعًا متتالية: `paragraph` فقرة، `heading` عنوان فرعي، `quote` اقتباس. داخل النص قد يوجد سطر جديد `\n` |

## youtube.json

يحتوي **ما يظهر في الموقع فقط** (المقاطع المخفية أو المستبعدة لا تُصدَّر).

| الحقل | المعنى |
|---|---|
| `updated` | وقت آخر تحديث من يوتيوب (UTC) |
| `channel_url` | رابط قناة الشيخ |
| `categories` | تصنيفات شروح الكتب: `{ id, title, color }` (`color` لون الغلاف بصيغة `#RRGGBB`) |
| `topics` | المواضيع: `{ id, title, url }` |
| `series` | البرامج وشروح الكتب والدورات — انظر أدناه |
| `khutab`، `lectures`، `clips` | معرّفات مقاطع الخطب والمحاضرات والمقاطع القصيرة، بترتيب العرض |
| `videos` | كل المقاطع الظاهرة، مرتبة من الأحدث |

**السلسلة (`series[]`)**

```json
{
  "id": "riyad",
  "kind": "book",
  "title": "شرح رياض الصالحين",
  "author": "الإمام النووي",
  "category": "adab",
  "description": null,
  "items": ["LcdN0iMlRdQ", "bKEInX-V8sA", "…"],
  "url": "https://asim-al-qaryuti.github.io/#/program/riyad"
}
```

| الحقل | المعنى |
|---|---|
| `kind` | `book` شرح كتاب (يظهر في الموقع تحت «شروح الكتب»)، `program` برنامج، `course` دورة |
| `author` | مؤلف الكتاب المشروح، أو `null` |
| `category` | `id` من `categories`، أو `null` |
| `items` | معرّفات الحلقات بالترتيب (الأول فالتالي) |

**المقطع (`videos[]`)**

```json
{
  "id": "tk3Y1XFG37w",
  "title": "المجلس الرابع من الحث على اجتماع كلمة المسلمين وذم التفرق والاختلاف",
  "date": "2026-10-12",
  "duration": 5178,
  "short": false,
  "description": null,
  "channel": null,
  "topic": null,
  "youtube_url": "https://www.youtube.com/watch?v=tk3Y1XFG37w",
  "thumbnail": "https://i.ytimg.com/vi/tk3Y1XFG37w/hqdefault.jpg",
  "url": "https://asim-al-qaryuti.github.io/#/lesson/tk3Y1XFG37w"
}
```

| الحقل | المعنى |
|---|---|
| `duration` | المدة بالثواني (٠ إن لم تُعرف) |
| `short` | `true` للمقطع القصير العمودي (Shorts) |
| `description` | سطر وصف إضافي أو `null` |
| `channel` | `null` إن كان من قناة الشيخ، وإلا اسم القناة التي نشرته (مثل «مصابيح الأمل») |
| `topic` | `id` من `topics` أو `null` |
| `thumbnail` | صورة مصغرة (480×360). توجد أحجام أخرى على النمط نفسه: `mqdefault` و`hq720` و`maxresdefault` |

> تشغيل المقطع داخل التطبيق يكون بمشغّل يوتيوب الرسمي المضمَّن بالمعرّف `id`، أو بفتح `youtube_url`.
