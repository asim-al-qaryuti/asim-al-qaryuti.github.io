# مكتبة الشيخ عاصم القريوتي

موقع ثابت (HTML + CSS + JavaScript) بلا أدوات بناء، يعمل على GitHub Pages مباشرة.

## الملفات

| الملف | ما فيه |
|---|---|
| `data/content.js` | **كل المحتوى**: الاسم، الكتب ومجالسها، الدورات، الخطب، المحاضرات، المقاطع، المدونة، السيرة، الحسابات |
| `index.html` | هيكل الصفحة |
| `assets/css/style.css` | التصميم والألوان (الداكن والفاتح) |
| `assets/js/app.js` | الصفحات والتبويبات والبحث والمشهد المرسوم في الواجهة |
| `assets/js/cv3d.js` | السيرة الذاتية ثلاثية الأبعاد (Three.js) |

## النشر على GitHub Pages (مرة واحدة)

1. ادخل https://github.com وسجّل الدخول (أو أنشئ حسابًا مجانيًا).
2. من الزر **+** أعلى الصفحة ← **New repository**.
   - الاسم: `qaryuti` (أو أي اسم إنجليزي قصير)
   - اختر **Public** ← **Create repository**.
3. في الصفحة التالية اضغط **uploading an existing file**.
4. افتح مجلد الموقع على جهازك، وحدد: `index.html` و`assets` و`data` و`README.md`، واسحبها كلها إلى صفحة الرفع ← **Commit changes**.
5. من تبويب **Settings** ← **Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main** و **/(root)** ← **Save**.
6. بعد دقيقة يصبح الموقع على الرابط الثابت:
   `https://اسم-حسابك.github.io/qaryuti/`

> إن سمّيت المستودع `اسم-حسابك.github.io` يصبح الرابط بلا لاحقة: `https://اسم-حسابك.github.io/`

### تحديث المحتوى لاحقًا
افتح المستودع ← `data` ← `content.js` ← أيقونة القلم ✏️ ← عدّل ← **Commit changes**. يتحدث الموقع خلال دقيقة.

## التشغيل على جهازك

```bash
cd "مكتبة سيدو" && python3 -m http.server 5178
```
ثم افتح http://localhost:5178
