// «سجل الأداء الوظيفي» (2026-11-12): يحلّ محل «ملفاتي (سجلات الإنجاز)». مرتّب على عناصر تقييم الأداء الوظيفي الـ11 بأوزانها
// ومؤشراتها (من ملف «سجل توثيق شواهد الأداء الوظيفي» الذي أرسلته المستخدمة)، بتصميم Figma «Task management» البنفسجي.
// المرحلة 1: الشواهد تأتي من مجلدات «ملفاتي» الأربعة عشر (FMAP: مجلد → عنصر/مؤشر)؛ المؤشر «نفّذ» تلقائيًا إذا له شاهد.
// المرحلة 2 (لاحقًا): مجلدات العناصر الجديدة + الرفع عبر Drive (actschool28) ثم نقلها إلى OneDrive من الكمبيوتر.
// يعتمد على دوال index.html: D، esc، wFileUrl، thumbsFill، upOn، uploadCard، bind.
(function () {
  'use strict';
  if (!document.getElementById('pr-font')) document.head.insertAdjacentHTML('beforeend',
    '<link id="pr-font" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700&display=swap">');
  document.head.insertAdjacentHTML('beforeend', `<style id="pr-css">
.pr{--pri:#5f33e1;--pri-d:#4a22c4;--pri-soft:#eee9ff;--ink:#24252c;--mut:#6e6a7c;--ln:#eeeaf0;--wh:#fff;
  --t1:#ffe4f2;--t1i:#d6418f;--t2:#ede4ff;--t2i:#7a45e8;--t3:#ffe6d4;--t3i:#e0701c;--t4:#e7f3ff;--t4i:#0072d6;--ok:#e3f6ea;--oki:#1d8a4a;
  position:relative;overflow:hidden;isolation:isolate;background:var(--wh);border-radius:28px;border:1px solid var(--ln);padding:22px 24px 28px;color:var(--ink);
  font-family:"Readex Pro","IBM Plex Sans Arabic",system-ui,sans-serif;line-height:1.6}
/* 2026-11-12 «بالضبط مثل التصميم» (artifact JP7k1LqSQ1domCoJwXQ5Ek): الضبابات الثلاث كما في التصميم، لكن خلف المحتوى (z-index:-1) حتى لا تبهت البطاقات */
.pr::before,.pr::after,.pr .bl{content:"";position:absolute;z-index:-1;border-radius:50%;filter:blur(60px);pointer-events:none}
.pr::before{width:320px;height:320px;top:-80px;left:-60px;background:#e6defe}
.pr::after{width:300px;height:300px;bottom:6%;right:-80px;background:#f2fbd4}
.pr .bl{width:260px;height:260px;top:40%;left:30%;background:#dfeffe}
.pr>*{position:relative}
.pr h2,.pr h3,.pr h4{margin:0;font-family:inherit;font-weight:600}
.pr button{font:inherit;color:inherit}
.pr svg.i,.pr-sh svg.i{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}
.pr .cols{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:24px;align-items:start}
.pr .col{min-width:0;display:flex;flex-direction:column;gap:20px}
.pr .top{display:flex;align-items:center;gap:12px}
.pr .ava{width:48px;height:48px;border-radius:50%;background:var(--pri-soft);color:var(--pri);display:grid;place-items:center;font-weight:700;font-size:20px;flex:none}
.pr .top small{display:block;color:var(--mut);font-size:13px}
.pr .top h2{font-size:19px;line-height:1.3}
.pr .top .yr{margin-inline-start:auto;background:var(--pri-soft);color:var(--pri-d);border-radius:999px;padding:4px 12px;font-size:12.5px;white-space:nowrap}
.pr .hero{background:var(--pri);color:#fff;border-radius:26px;padding:22px;display:flex;align-items:center;gap:16px;box-shadow:0 14px 30px -12px var(--pri)}
.pr .hero .tx{flex:1;min-width:0}
.pr .hero h3{font-size:18px;line-height:1.45;font-weight:500;color:#fff}
.pr .hero .sub{color:rgba(255,255,255,.88);font-size:13px;margin:4px 0 14px}
.pr .hero .acts{display:flex;gap:8px;flex-wrap:wrap}
.pr .go{border:0;background:#fff;color:var(--pri-d);border-radius:12px;height:40px;padding:0 16px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;white-space:nowrap}
.pr .go.gh{background:rgba(255,255,255,.18);color:#fff}
.pr .ring{width:100px;height:100px;border-radius:50%;flex:none;display:grid;place-items:center;background:conic-gradient(#fff calc(var(--v)*1%),rgba(255,255,255,.28) 0)}
.pr .ring b{width:80px;height:80px;border-radius:50%;background:var(--pri);display:grid;place-items:center;text-align:center;font-size:20px;font-weight:600;line-height:1.1;color:#fff}
.pr .ring b small{display:block;font-size:10.5px;font-weight:400;opacity:.85}
.pr .h{display:flex;align-items:center;gap:8px}
.pr .h h3{font-size:18px}
.pr .c{background:var(--pri-soft);color:var(--pri);border-radius:999px;min-width:24px;height:22px;padding:0 7px;font-size:12px;display:grid;place-items:center}
.pr .more{margin-inline-start:auto;color:var(--mut);font-size:12.5px}
.pr .bars{display:flex;flex-direction:column;gap:8px;background:var(--wh);border-radius:20px;padding:14px 16px;box-shadow:0 4px 18px rgba(36,37,44,.06);margin-top:10px}
.pr .bar-r{display:grid;grid-template-columns:minmax(0,1fr) 110px 40px;gap:10px;align-items:center;font-size:13px;border:0;background:none;padding:0;text-align:start;cursor:pointer}
.pr .bar-r span:first-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pr .trk{height:8px;background:var(--ln);border-radius:99px;overflow:hidden}
.pr .trk i{display:block;height:100%;border-radius:99px;background:var(--pri)}
.pr .bar-r em{font-style:normal;color:var(--mut);text-align:end}
.pr .oth{display:flex;flex-direction:column;gap:8px;margin-top:10px}
.pr .chips{display:flex;gap:8px;overflow-x:auto;padding-bottom:2px}
.pr .chips button{flex:none;border:0;background:var(--pri-soft);color:var(--pri-d);border-radius:12px;height:38px;padding:0 16px;cursor:pointer;font-weight:500}
.pr .chips button[aria-pressed=true]{background:var(--pri);color:#fff}
.pr .els{display:flex;flex-direction:column;gap:10px}
.pr .el{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:4px 12px;width:100%;border:0;background:var(--wh);border-radius:20px;padding:14px 16px;text-align:start;cursor:pointer;box-shadow:0 4px 18px rgba(36,37,44,.06);transition:transform .15s}
.pr .el:hover{transform:translateY(-2px)}
.pr .fu{background:var(--wh);border-radius:20px;padding:14px 16px;box-shadow:0 4px 18px rgba(36,37,44,.06);display:flex;flex-direction:column;gap:10px;margin-top:10px}
.pr .fu-r{display:flex;gap:12px;align-items:flex-start}
.pr .fu-r .dot{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;flex:none}
.pr .fu-r b{display:block;font-weight:500;font-size:14.5px}
.pr .fu-r p{margin:2px 0 0;color:var(--mut);font-size:13px}
.pr .sig{margin-inline-start:auto;font-size:12px;border-radius:8px;padding:1px 10px;white-space:nowrap}
.pr-sh .ind{display:flex;flex-direction:column;gap:8px}
.pr-sh .ir2{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 10px;align-items:center;padding:10px 12px;border-radius:14px;background:#fdfcfd;border:1px solid #eeeaf0}
.pr-sh .ir2>span:first-child{font-size:14px}
.pr-sh .tog{display:flex;background:#fff;border:1px solid #eeeaf0;border-radius:10px;padding:3px}
.pr-sh .tog button{border:0;background:transparent;border-radius:8px;height:30px;padding:0 10px;font:inherit;font-size:12.5px;cursor:pointer;color:#6e6a7c}
.pr-sh .tog button[aria-pressed=true].y{background:#e3f6ea;color:#1d8a4a;font-weight:600}
.pr-sh .tog button[aria-pressed=true].n{background:#ffe4f2;color:#d6418f;font-weight:600}
.pr-sh .ev{grid-column:1/3;display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:12px;color:#6e6a7c}
.pr-sh .ev .fth{margin:0}
.pr-sh .ev .th-i{width:40px;height:52px;border-radius:7px}
.pr-sh .ev .add{border:1px dashed #c9bdf6;background:#fff;color:#4a22c4;border-radius:8px;height:30px;padding:0 10px;font:inherit;font-size:12px;cursor:pointer}
.pr-sh .qrbox{display:grid;grid-template-columns:auto minmax(0,1fr);gap:16px;align-items:center;background:#eee9ff;border-radius:18px;padding:14px}
.pr-sh .qr{background:#fff;padding:8px;border-radius:12px;width:112px;height:112px}
.pr-sh .qr svg{display:block;width:96px;height:96px}
.pr-sh .qrbox b{display:block;font-weight:600}
.pr-sh .qrbox p{margin:4px 0 0;color:#6e6a7c;font-size:13px}
.pr-sh .acts2{display:flex;gap:8px;flex-wrap:wrap}
.pr-sh .btn3{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;border:0;border-radius:14px;padding:0 16px;font:inherit;font-weight:600;background:#5f33e1;color:#fff;cursor:pointer;text-decoration:none}
.pr-sh .btn3.gh{background:#eee9ff;color:#4a22c4}
.pr-sh .note2{font-size:12px;color:#6e6a7c;text-align:center;margin:0}
.pr-sh .ev label.add{border:1px dashed #c9bdf6;background:#fff;color:#4a22c4;border-radius:8px;height:34px;padding:0 12px;font-size:12.5px;cursor:pointer;display:inline-flex;align-items:center}
.pr-sh .ev label.add:hover{background:#f6f3ff}
.pr-sh label.btn3{cursor:pointer}
.pr-sh .uq{flex-basis:100%;font-size:12.5px;padding:4px 10px;border-radius:8px;background:#f6f3ff;color:#4a22c4}
.pr-sh .uq.ok{background:#e3f6ea;color:#1d8a4a}.pr-sh .uq.fail{background:#ffe4f2;color:#c2185b}
.pr .bar1{grid-column:2/4;height:5px;border-radius:99px;background:#f0eef4;overflow:hidden;margin-top:4px}
.pr .bar1 i{display:block;height:100%;border-radius:99px;background:var(--pri)}
.pr .none-t{color:#9a96a8}
.pr .upw[hidden]{display:none}
.pr .no,.pr-sh .no{grid-row:1/3;width:44px;height:44px;border-radius:13px;display:grid;place-items:center;font-weight:700;font-size:17px;flex:none}
.pr .el b{font-weight:500;font-size:15.5px;line-height:1.4;align-self:center}
.pr .w{align-self:start;background:var(--pri-soft);color:var(--pri-d);border-radius:8px;padding:1px 9px;font-size:12.5px;font-weight:600;white-space:nowrap}
.pr .meta{grid-column:2/4;display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;font-size:12.5px;color:var(--mut)}
.pr .src{border-radius:8px;padding:1px 8px;font-size:11.5px;white-space:nowrap}
.pr .src.auto{background:var(--ok);color:var(--oki)}
.pr .src.man{background:var(--t3);color:#b5520b}
.pr .pg{grid-column:2/4;display:flex;gap:4px;margin-top:2px}
.pr .pg i{flex:1;height:6px;border-radius:99px;background:var(--ln)}
.pr .pg i.on{background:var(--pri)}
.pr .el .fth{grid-column:2/4;margin-top:6px;gap:6px}
.pr .th-i{width:40px;height:52px;border-radius:7px}
.pr .upw{margin-top:22px}
.pr .upw .up{border-radius:20px}
.pr-bd{position:fixed;inset:0;z-index:29;background:rgba(36,37,44,.35)}
.pr-sh{position:fixed;z-index:30;left:0;right:0;bottom:0;margin:auto;width:min(620px,100%);max-height:90vh;display:flex;flex-direction:column;background:#fff;color:#24252c;
  border-radius:28px 28px 0 0;box-shadow:0 -10px 40px rgba(36,37,44,.18);font-family:"Readex Pro","IBM Plex Sans Arabic",system-ui,sans-serif;padding-bottom:env(safe-area-inset-bottom,0px)}
.pr-sh .grab{width:44px;height:5px;border-radius:3px;background:#eeeaf0;margin:10px auto 2px;flex:none}
.pr-sh .sh-h{display:flex;align-items:center;gap:12px;padding:10px 20px 12px}
.pr-sh h2{margin:0;font-size:18px;font-weight:600;font-family:inherit}
.pr-sh .sh-h p{margin:0;color:#6e6a7c;font-size:13px}
.pr-sh .x{margin-inline-start:auto;width:40px;height:40px;border-radius:50%;border:0;background:#eee9ff;color:#4a22c4;cursor:pointer;display:grid;place-items:center;flex:none}
.pr-sh .b{overflow:auto;padding:4px 20px 22px;display:flex;flex-direction:column;gap:10px}
.pr-sh h4{margin:4px 0 0;font-size:14.5px;color:#4a22c4;font-family:inherit}
.pr-sh .ir{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:14px;background:#fdfcfd;border:1px solid #eeeaf0}
.pr-sh .ir-h{display:flex;align-items:center;gap:10px}
.pr-sh .ir-h span:first-child{flex:1;font-size:14.5px}
.pr-sh .stt{font-size:12px;border-radius:8px;padding:1px 10px;white-space:nowrap}
.pr-sh .stt.y{background:#e3f6ea;color:#1d8a4a}.pr-sh .stt.n{background:#ffe4f2;color:#c2185b}
.pr-sh .fold{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12.5px;color:#6e6a7c}
.pr-sh .fold a,.pr-sh .fold button{border:0;background:#eee9ff;color:#4a22c4;border-radius:8px;height:30px;padding:0 10px;font:inherit;font-size:12.5px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
.pr-sh .fth{gap:6px}
.pr-sh .th-i{width:60px;height:78px;border-radius:9px}
.pr-sh .soon{font-size:12.5px;color:#b5520b;background:#ffe6d4;border-radius:10px;padding:8px 10px}
.pr .scroll{display:flex;gap:10px;overflow-x:auto;padding:2px 2px 8px;margin-top:10px;scroll-snap-type:x mandatory}
.pr .pc{flex:0 0 150px;scroll-snap-align:start;border:0;border-radius:18px;padding:12px 14px;text-align:start;cursor:pointer;display:flex;flex-direction:column;gap:8px;min-height:104px}
.pr .pc .ic{width:30px;height:30px;border-radius:9px;background:#fff;display:grid;place-items:center}
.pr .pc .ic svg.i{width:17px;height:17px}
.pr .pc b{font-weight:500;font-size:14px;line-height:1.4}
.pr .pc small{color:var(--mut);font-size:12px;margin-top:auto}
.pr-sh .txt{font-size:14.5px;line-height:1.95;margin:0}
.pr-sh .ayah{background:#eee9ff;border-radius:14px;padding:12px 14px;text-align:center;font-size:15.5px;line-height:2}
.pr-sh ul.li{margin:0;padding-inline-start:20px;display:flex;flex-direction:column;gap:6px;font-size:14.5px;line-height:1.8}
.pr-sh .vm{display:grid;gap:8px}
.pr-sh .vm div{border-radius:14px;padding:12px 14px}
.pr-sh .vm b{display:block;font-size:13px;color:#4a22c4;margin-bottom:2px}
.pr-sh .cv{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.pr-sh .cv label{display:flex;flex-direction:column;gap:4px;font-size:13px;color:#6e6a7c}
.pr-sh .cv label.w2{grid-column:1/3}
.pr-sh .cv input,.pr-sh textarea{font:inherit;font-size:14.5px;color:#24252c;border:1px solid #e2dcf3;border-radius:12px;padding:10px 12px;background:#fff;width:100%}
.pr-sh textarea{min-height:170px;line-height:1.8;resize:vertical}
.pr-sh .cv input:focus,.pr-sh textarea:focus{outline:2px solid #5f33e1;border-color:transparent}
.pr-sh .save{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.pr-sh .save button{border:0;background:#5f33e1;color:#fff;border-radius:12px;height:46px;padding:0 22px;font:inherit;font-weight:600;cursor:pointer}
.pr-sh .save span{font-size:13px;color:#6e6a7c}
.pr-sh .save span.err{color:#c2185b}
@media (max-width:560px){.pr-sh .cv{grid-template-columns:1fr}.pr-sh .cv label.w2{grid-column:auto}}
@media (max-width:820px){.pr{padding:18px 14px 22px}.pr .cols{grid-template-columns:1fr}.pr .ring{width:88px;height:88px}.pr .ring b{width:70px;height:70px;font-size:18px}.pr .top .yr{display:none}}
@media (prefers-reduced-motion:reduce){.pr .el{transition:none}}
</style>`);

  const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const HJ = iso => { if (!iso) return ''; try { const P = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(new Date(iso + 'T12:00:00')), g = k => (P.find(q => q.type === k) || {}).value;
    return AR([g('day'), g('month'), g('year')].join('/')) + 'هـ'; } catch { return iso; } };
  const I = p => `<svg class="i" viewBox="0 0 24 24">${p}</svg>`;
  // عناصر تقييم الأداء الوظيفي ومؤشراتها (سلالم التقدير) كما في الملف؛ c = لون البطاقة
  const EL = [
    { t: 'أداء الواجبات الوظيفية', w: 10, c: 4, ind: ['التقيد بالدوام الرسمي', 'تأدية الحصص الدراسية وفق الجدول الدراسي', 'المشاركة في الإشراف والمناوبة', 'إعداد ومتابعة الدروس والواجبات'] },
    { t: 'التفاعل مع المجتمع المهني', w: 10, c: 2, ind: ['المشاركة في مجتمعات التعلم المهنية', 'تبادل الزيارات', 'الدروس التطبيقية', 'حضور الدورات والورش التدريبية'] },
    { t: 'التفاعل مع أولياء الأمور', w: 10, c: 1, ind: ['التواصل مع أولياء الأمور', 'تزويد أولياء الأمور بمستويات الطالبات', 'إيصال الملاحظات المهمة لأولياء الأمور', 'تفعيل الخطة الأسبوعية للمدرسة', 'المشاركة الفاعلة في الجمعية العمومية'] },
    { t: 'التنويع في استراتيجيات التدريس', w: 10, c: 3, ind: ['استخدام استراتيجيات متنوعة', 'مراعاة الفروق الفردية'] },
    { t: 'تحسين نتائج المتعلمين', w: 10, c: 2, ind: ['معالجة الفاقد التعليمي', 'وضع الخطط العلاجية للطالبات الضعيفات', 'وضع الخطط الإثرائية للطالبات المتميزات', 'تكريم الطالبات المتميزات'] },
    { t: 'إعداد وتنفيذ خطة التعلم', w: 10, c: 4, ind: ['توزيع المنهج وإعداد الدروس', 'إعداد الواجبات والاختبارات', 'تنفيذ الدروس'] },
    { t: 'توظيف تقنيات ووسائل التعلم', w: 10, c: 1, ind: ['دمج التقنية في التعليم', 'التنويع في الوسائل التعليمية'] },
    { t: 'تهيئة البيئة التعليمية', w: 5, c: 3, ind: ['مراعاة حاجات الطالبات', 'التهيئة النفسية للطالبات', 'التحفيز المادي والمعنوي', 'توفير متطلبات الدرس'] },
    { t: 'الإدارة الصفية', w: 5, c: 2, ind: ['ضبط سلوك الطالبات', 'شد انتباه الطالبات', 'متابعة الحضور والغياب والتأخر'] },
    { t: 'تحليل نتائج المتعلمين وتشخيص مستوياتهم', w: 10, c: 4, ind: ['تحليل نتائج الاختبارات', 'تصنيف الطالبات حسب النتائج', 'معالجة الفاقد التعليمي', 'تحديد نقاط القوة والضعف'] },
    { t: 'تنوع أساليب التقويم', w: 10, c: 1, ind: ['تطبيق الاختبارات الورقية والإلكترونية', 'المشاريع الطلابية', 'المهام الأدائية', 'ملفات إنجاز الطالبات'] }
  ];
  const PF_DIR = 'سجل الأداء الوظيفي', PF_N = k => String(k + 1).padStart(2, '0') + ' - ' + EL[k].t;   // نفس أسماء tools/inbox.js
  // مجلدات «ملفاتي» → [العنصر، المؤشر]؛ «البرامج» و«المبادرات» تظهر في «ملفات أخرى من سجلك»
  const FMAP = { 'الحلقات التنشيطية': [1, 0], 'زيارات تبادلية': [1, 1], 'دروس تطبيقية': [1, 2], 'الدورات': [1, 3], 'ورش العمل': [1, 3],
    'انماط التعلم': [3, 1], 'الخطة العلاجية': [4, 1], 'الخطة الإثرائية': [4, 2],
    'توزيع المنهج': [5, 0], 'الخطة الفصلية': [5, 0], 'الخطة الأسبوعية': [5, 0], 'الإنتاج المعرفي': [6, 0] };
  // «التعريف بالمعلمة»: نصوص ثابتة من ملف «سجل توثيق شواهد الأداء الوظيفي» (مُصحّحة الإملاء) + سيرة ذاتية ومقدمة تحفظها المعلمة
  const INTRO = 'بسم الله أبتدئ، وبكتابه أقتدي، وبسنة رسوله أهتدي، والحمد لله ذي الفضل والمنة والعطاء، الذي خلق فأبدع، وأعطى فأكرم وأجزل.\nأما بعد: تحية طيبة مشرقة لكل من يقرأ هذا الملف، الذي خصصته ليكون حقيبة مرجعية لأعمالي وإنجازاتي في مجال مهنتي التعليمية للعام الدراسي ١٤٤٨هـ. أسأل المولى عز وجل أن يبارك لي في عملي، ويجعله شاهدًا لي عنده.';
  const GOALS = ['تقييم أعمالي ذاتيًا لتحسينها ومعالجة القصور', 'إبراز شخصيتي المهنية والأكاديمية للآخرين', 'تنظيم أعمالي وتوثيقها', 'توظيف الأساليب والاستراتيجيات الحديثة', 'مرجع للتطوير الذاتي'];
  const POLICY = ['تعهّد العقيدة الإسلامية الصحيحة في نفس الطفل، ورعايته بتربية إسلامية متكاملة في خُلقه وجسمه وعقله ولغته وانتمائه إلى أمة الإسلام.', 'تدريبه على إقامة الصلاة، وأخذه بآداب السلوك والفضائل.',
    'تنمية المهارات الأساسية المختلفة، وخاصة المهارات اللغوية والمهارات العددية والمهارات الحركية.', 'تزويده بالقدر المناسب من المعلومات في مختلف الموضوعات.',
    'تعريفه بنعم الله عليه في نفسه وفي بيئته الاجتماعية والجغرافية؛ ليُحسن استخدام النعم وينفع نفسه وبيئته.', 'تربية ذوقه البديعي، وتعهّد نشاطه الابتكاري، وتنمية تقدير العمل اليدوي لديه.',
    'تنمية وعيه ليدرك ما عليه من الواجبات وما له من الحقوق في حدود سنّه وخصائص المرحلة التي يمر بها، وغرس حب وطنه والإخلاص لولاة أمره.', 'توليد الرغبة لديه في الازدياد من العلم النافع والعمل الصالح، وتدريبه على الاستفادة من أوقات فراغه.',
    'إعداد الطالب لما يلي هذه المرحلة من مراحل حياته.'];
  const CHARTER = [['المادة الأولى: التعريفات', ['أخلاقيات مهنة التعليم: السجايا الحميدة والسلوكيات الفاضلة التي يتعين أن يتحلى بها المعلمون في حقل التعليم العام فكرًا وسلوكًا، أمام ولاة الأمر وأمام أنفسهم والآخرين، وتترتب عليهم واجبات أخلاقية.',
      'المعلم: المعلم والمعلمة والقائمون على العملية التربوية من مشرفين ومشرفات ومديرين ومديرات ومرشدين ونحوهم.', 'الطالب: الطالب والطالبة في مدارس التعليم العام وما في مستواها.']],
    ['المادة الثانية: أهداف الميثاق', ['يهدف الميثاق إلى تعزيز انتماء المعلم لرسالته ومهنته والارتقاء بها، والإسهام في تطوير المجتمع الذي يعيش فيه وتقدّمه، وذلك من خلال:', 'توعية المعلم بأهمية المهنة ودورها في بناء مستقبل وطنه.',
      'الإسهام في تعزيز مكانة المعلم العلمية والاجتماعية.', 'حفز المعلم على أن يتمثل قيم مهنته وأخلاقياتها سلوكًا في حياته.']],
    ['المادة الثالثة: رسالة التعليم', ['التعليم رسالة تستمد أخلاقياتها من هدي شريعتنا ومبادئ حضارتنا، وتوجب على القائمين بها أداء حق الانتماء إليها إخلاصًا في العمل، وصدقًا مع النفس والناس، وعطاءً مستمرًا لنشر العلم وفضائله.',
      'المعلم صاحب رسالة يستشعر عظمتها ويؤمن بأهميتها، ويؤدي حقها بمهنية عالية.', 'اعتزاز المعلم بمهنته وإدراكه المستمر لرسالته يدعوانه إلى الحرص على نقاء السيرة وطهارة السريرة؛ حفاظًا على شرف مهنة التعليم.']]];
  const CV = [['name', 'الاسم', 1], ['title', 'المسمى الوظيفي'], ['qual', 'المؤهل'], ['major', 'التخصص'], ['grad', 'تاريخ التخرج'], ['start', 'تاريخ المباشرة'], ['email', 'البريد الإلكتروني', 1]];
  // كل بطاقة صفحة مستقلة فيها خانة كتابة (طلب المستخدمة 2026-11-12)؛ النص المقترح من ملفها يظهر أولًا وتعدّله المعلمة. [مفتاح، العنوان، الأيقونة، اللون، النص المقترح]
  const PROFILE = [['cv', 'السيرة الذاتية', '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>', 1],
    ['intro', 'المقدمة', '<path d="M4 5h16M4 10h16M4 15h10"/>', 2, INTRO],
    ['goals', 'أهداف الملف', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', 3, GOALS.map(g => '• ' + g).join('\n')],
    ['vision', 'الرؤية', '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', 4, 'متعلم معتز بدينه، منتمٍ لوطنه، منتج للمعرفة، منافس عالميًا.'],
    ['mission', 'الرسالة', '<path d="M4 4h16v12H8l-4 4z"/>', 1, 'توفير فرص التعلم في بيئة آمنة وجذابة، ورفع جودة مخرجاته، وتشجيع الإبداع، وتنمية الشراكة المجتمعية، والارتقاء بقدرات منسوبي إدارة التعليم.'],
    ['values', 'القيم', '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>', 2, '• التميز المؤسسي\n• الإبداع\n• التكامل\n• الشفافية'],
    ['policy', 'سياسة التعليم في المملكة', '<path d="M12 3 3 8l9 5 9-5z"/><path d="M5 10v6l7 4 7-4v-6"/>', 3, 'التعليم في المملكة هو الركيزة الأساسية التي نحقق بها تطلعات شعبنا نحو التقدم والرقي في العلوم والمعارف.\n' + POLICY.map(x => '• ' + x).join('\n')],
    ['charter', 'ميثاق أخلاقيات المهنة', '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/>', 4, CHARTER.map(([h, L]) => h + '\n' + L.map(x => '• ' + x).join('\n')).join('\n\n')],
    ['certs', 'الشهادات والدورات', '<circle cx="12" cy="9" r="5"/><path d="m9 13-2 8 5-3 5 3-2-8"/>', 1]];
  // الحفظ في Supabase (نفس مشروع «سجل إنجازي»): pf_get_by_pid / pf_save_by_pid بمعرّف المعلمة في المنصة
  const SB = 'https://bynymxmjzaeoyikuuwen.supabase.co';
  const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5bnlteG1qemFlb3lpa3V1d2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MzMyNzEsImV4cCI6MjEwNzQwOTI3MX0.lL2cNc0Q_rGOaSy8rtSLPSOU9dZ57Yw1C4MoMmd9jjo';
  const rpc = async (fn, body) => { const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const x = await r.text(); if (!r.ok) { let m = x; try { m = JSON.parse(x).message || x; } catch {} throw new Error(m); } return x ? JSON.parse(x) : null; };
  let PF = null, PFS = '', PFERR = '';   // PFS = جلسة الدخول التي حُمّل لها التعريف
  async function pfLoad() {
    const sc = sessionCode; if (PF && PFS === sc) return;
    try { const d = await rpc('pf_get_by_pid', { p_pid: await teacherId(phoneOf(sc)) }); if (sc !== sessionCode) return; PF = d || {}; PFS = sc; PFERR = ''; }
    catch (x) { PF = {}; PFS = sc; PFERR = 'حفظ التعريف لم يُفعَّل بعد'; }
    redraw();
    const m = location.hash.match(/^#pr\/e(\d+)$/); if (m && +m[1] >= 1 && +m[1] <= EL.length) openEl(+m[1] - 1);   // من باركود العنصر
  }
  const pfDone = k => k === 'cv' ? !!(PF && PF.cv && PF.cv.qual && PF.cv.major) : k === 'certs' ? me().cells.some(c => c.f.label === 'الدورات' && c.info && c.info.count) : true;
  // بطاقات «التعريف بالمعلمة» الست كما في التصميم؛ البطاقة المركّبة تفتح صفحة فيها خانة لكل جزء. [مفتاح البطاقة، العنوان، الأيقونة، اللون، الحقول]
  const PCARDS = [['cv', 'السيرة الذاتية', PROFILE[0][2], 1, ['cv']], ['g-intro', 'المقدمة وأهداف الملف', PROFILE[1][2], 2, ['intro', 'goals']],
    ['policy', 'سياسة التعليم في المملكة', PROFILE[6][2], 3, ['policy']], ['g-vision', 'الرؤية والرسالة والقيم', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>', 4, ['vision', 'mission', 'values']],
    ['charter', 'ميثاق أخلاقيات المهنة', PROFILE[7][2], 1, ['charter']], ['certs', 'الشهادات والدورات', PROFILE[8][2], 2, ['certs']]];
  // «نفّذ / لم ينفّذ» يدويًا (طلب المستخدمة: «بالضبط» كالتصميم): يُحفظ في PF.ind["k.j"]؛ إن لم تختر المعلمة فالحالة من الشاهد (له ملف = نفّذ)
  const indState = (k, j, auto) => { const v = PF && PF.ind && PF.ind[k + '.' + j]; return v === 1 || v === 0 ? v : auto ? 1 : null; };
  let F = 'all';
  const me = () => D.teachers[0];
  const keyOf = (t, c, x) => t.name + '|' + c.f.key + '|' + x.n;
  const thumbs = (t, cells, n) => { const L = cells.flatMap(c => c.info.files.map(x => ({ c, x }))).sort((a, b) => (b.x.d || '').localeCompare(a.x.d || '')).slice(0, n);
    return L.length ? `<div class="fth">${L.map(({ c, x }) => `<span class="th-i" role="button" tabindex="0" data-n="${esc(x.n)}" data-url="${esc(c.info.url ? wFileUrl(c.info.url, x.n.split(' / ').join('/')) : '')}" data-key="${esc(keyOf(t, c, x))}" data-x="${esc(x.x || '')}"></span>`).join('')}</div>` : ''; };

  // لكل عنصر: مجلداته، وحالة كل مؤشر (نفّذ = له شاهد)
  function model(t) {
    const cells = t.cells.filter(c => c.info);
    const E = EL.map((e, k) => {
      const ind = e.ind.map((name, j) => ({ name, cells: cells.filter(c => { const m = FMAP[c.f.label]; return m && m[0] === k && m[1] === j; }) }));
      // + ما رُفع من هذه الصفحة للمؤشرات: <المعلمة>\سجل الأداء الوظيفي\<NN - العنصر>\«م<j> - …» (t.pf من export.js)
      const pfE = (t.pf || {})[k], pfCell = files => ({ f: { key: PF_DIR + '\\' + PF_N(k), label: e.t, group: PF_DIR, i: -1 }, info: { url: pfE.url, files, count: files.length } });
      ind.forEach((x, j) => { const pff = pfE ? pfE.files.filter(f => f.j === j) : [];
        x.all = [...x.cells, ...(pff.length ? [pfCell(pff)] : [])];
        x.n = x.all.reduce((a, c) => a + c.info.count, 0); x.st = indState(k, j, x.n > 0); x.done = x.st === 1; });
      const loose = pfE ? pfE.files.filter(f => f.j < 0 || f.j >= e.ind.length) : [];
      const all = ind.flatMap(x => x.cells), shown = [...ind.flatMap(x => x.all), ...(loose.length ? [pfCell(loose)] : [])], done = ind.filter(x => x.done).length;
      return { ...e, k, ind, all, shown, pfUrl: pfE && pfE.url, done, files: shown.reduce((a, c) => a + c.info.count, 0), full: done === ind.length, auto: all.length > 0 };
    });
    const other = cells.filter(c => !FMAP[c.f.label]);
    const score = Math.round(E.reduce((a, e) => a + e.w * e.done / e.ind.length, 0));
    return { E, other, score };
  }

  function render() {
    const t = me(); if (!t) return '<div class="empty card">لا توجد بيانات</div>';
    if (!PF || PFS !== sessionCode) { PF = null; setTimeout(pfLoad); }
    const { E, other, score } = model(t), fullN = E.filter(e => e.full).length;
    const L = E.filter(e => F === 'all' || (F === 'full' ? e.full : F === 'need' ? !e.full : !e.auto));
    const title = score >= 80 ? 'سجلك قارب على الاكتمال!' : score >= 40 ? 'تقدّم جيد، أكملي العناصر الناقصة' : 'ابدئي بتوثيق عناصر التقييم';
    // ترتيب التصميم بالضبط: (يمين) التحية، البطاقة البنفسجية، التعريف بالمعلمة (شريط)، توزيع الأوزان، متابعة التوثيق | (يسار) عناصر التقييم
    const fu = (PF && PF.fu) || {};
    const fuRow = (x, who, wait) => x && x.at ? `<div class="fu-r"><span class="dot" style="background:var(--ok);color:var(--oki)">${I('<path d="m5 12 5 5L20 7"/>')}</span><div><b>${who[0]}</b><p>${esc(who[1])}: «${esc(x.note || '')}»</p></div><span class="sig" style="background:var(--ok);color:var(--oki)">وُقّعت ${esc(x.at)}</span></div>`
      : `<div class="fu-r"><span class="dot" style="background:var(--pri-soft);color:var(--pri)">${I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}</span><div><b>${who[0]}</b><p>${who[1]}${wait}</p></div><span class="sig" style="background:var(--pri-soft);color:var(--pri-d)">لم تبدأ</span></div>`;
    return `<div class="pr" id="prRoot"><i class="bl"></i><div class="cols">
      <div class="col">
        <div class="top"><span class="ava">${esc(t.short.trim()[0] || '')}</span><div><small>مرحبًا</small><h2>أ. ${esc(t.short)}</h2></div><span class="yr">العام الدراسي ١٤٤٨هـ</span></div>
        <div class="hero"><div class="tx"><h3>${title}</h3><p class="sub">${AR(fullN)} من ${AR(E.length)} عناصر مكتملة الشواهد</p><button class="go" type="button" data-pr-need>عرض العناصر الناقصة</button></div>
          <div class="ring" style="--v:${score}"><b>${AR(score)}٪<small>من الأوزان</small></b></div></div>
        <div><div class="h"><h3>التعريف بالمعلمة</h3><span class="c">${AR(PCARDS.length)}</span><span class="more">تُعبّأ مرة واحدة</span></div>
          <div class="scroll">${PCARDS.map(([k, l, p, c, fs]) => { const ok = k === 'cv' || k === 'certs' ? pfDone(k) : fs.some(f => PF && PF[f]);
            return `<button class="pc" type="button" data-pr-p="${k}" style="background:var(--t${c})"><span class="ic" style="color:var(--t${c}i)">${I(p)}</span><b>${l}</b><small>${ok ? '✓ مكتمل' : 'لم يُعبّأ بعد'}</small></button>`; }).join('')}</div></div>
        <div><div class="h"><h3>توزيع الأوزان</h3><span class="more">نسبة المؤشرات الموثّقة في كل عنصر</span></div>
          <div class="bars">${E.map(e => `<button class="bar-r" type="button" data-pr-k="${e.k}"><span>${AR(e.k + 1)}. ${esc(e.t)}</span><span class="trk"><i style="width:${Math.round(e.done / e.ind.length * 100)}%"></i></span><em>${AR(e.w)}٪</em></button>`).join('')}</div></div>
        <div><div class="h"><h3>متابعة التوثيق</h3></div>
          <div class="fu">${fuRow(fu.a, ['المتابعة الأولى', 'وكيلة الشؤون التعليمية'], '، عند المراجعة.')}${fuRow(fu.b, ['المتابعة الثانية', 'مديرة المدرسة'], '، بعد اكتمال العناصر.')}</div></div>
      </div>
      <div class="col">
        <div class="h"><h3>عناصر التقييم</h3><span class="c">${AR(L.length)}</span><span class="more">مجموع الأوزان ١٠٠٪</span></div>
        <div class="chips">${[['all', 'الكل'], ['full', 'مكتمل'], ['need', 'ناقص'], ['man', 'بلا مجلد في المنصة']].map(([k, l]) => `<button type="button" data-pr-st="${k}" aria-pressed="${F === k}">${l}</button>`).join('')}</div>
        <div class="els">${L.map(e => `<button class="el" type="button" data-pr-k="${e.k}"><span class="no" style="background:var(--t${e.c});color:var(--t${e.c}i)">${AR(e.k + 1)}</span><b>${esc(e.t)}</b><span class="w">${AR(e.w)}٪</span>
          <span class="meta"><span>${AR(e.done)} من ${AR(e.ind.length)} مؤشرات، ${AR(e.files)} شاهد</span>${e.auto ? `<span class="src auto">تلقائي من: ${esc([...new Set(e.all.map(c => c.f.group || c.f.label))].join('، '))}</span>` : '<span class="src man">ترفعينه هنا</span>'}</span>
          <span class="pg">${e.ind.map(x => `<i class="${x.done ? 'on' : ''}"></i>`).join('')}</span>${thumbs(t, e.shown, 6)}</button>`).join('') || '<div style="text-align:center;color:var(--mut);padding:18px">لا توجد عناصر هنا</div>'}</div>
      </div></div>
      ${upOn(t) ? `<div class="upw" id="prUp" hidden>${uploadCard(t)}</div>` : ''}</div>`;
  }

  function redraw() { const r = document.getElementById('prRoot'); if (!r) return; r.outerHTML = render(); bind(document.getElementById('prRoot')); }
  function closeSheet() { document.querySelectorAll('.pr-sh,.pr-bd').forEach(x => x.remove()); }
  const foldActs = (t, c) => `<span class="fold"><span>${esc(c.f.group ? c.f.group + ' / ' + c.f.label : c.f.label)}: ${AR(c.info.count)} ملف</span>
    ${upOn(t) && D.inbox ? `<button type="button" data-pr-up="f:${c.f.i}">+ رفع ملف</button>` : ''}<a href="${esc(c.info.url)}" target="_blank" rel="noopener">فتح في OneDrive</a></span>`;
  const sheetHtml = (head, title, sub, color, body) => `<div class="grab"></div><div class="sh-h"><span class="no" style="${color}">${head}</span><div><h2>${title}</h2><p>${sub}</p></div>
      <button class="x" type="button" data-pr-x aria-label="إغلاق">${I('<path d="M6 6l12 12M18 6 6 18"/>')}</button></div><div class="b">${body}</div>`;
  function openSheet(html, label) {
    closeSheet();
    const bd = Object.assign(document.createElement('div'), { className: 'pr-bd' }), sh = Object.assign(document.createElement('div'), { className: 'pr-sh' });
    sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.setAttribute('aria-label', label);
    sh.innerHTML = html; bd.addEventListener('click', closeSheet); document.body.append(bd, sh);
    const root = document.getElementById('prRoot'); const P0 = { '--t1': '#ffe4f2', '--t1i': '#d6418f', '--t2': '#ede4ff', '--t2i': '#7a45e8', '--t3': '#ffe6d4', '--t3i': '#e0701c', '--t4': '#e7f3ff', '--t4i': '#0072d6' }; if (!root) Object.entries(P0).forEach(([v, x]) => sh.style.setProperty(v, x)); if (root) { const cs = getComputedStyle(root); ['1', '2', '3', '4'].forEach(n => ['--t' + n, '--t' + n + 'i'].forEach(v => sh.style.setProperty(v, cs.getPropertyValue(v)))); }
    thumbsFill(sh); sh.querySelector('[data-pr-x]').focus();
  }
  // نافذة العنصر كما في التصميم: سلالم التقدير (نفّذ / لم ينفّذ + الشواهد + «إرفاق شاهد»)، باركود العنصر، زرّا الرفع وOneDrive
  const QR_BASE = 'https://learnixto-coder.github.io/wakeela-platform/#pr/e';
  let openK = null, togMsg = '';
  // الرفع السريع لكل مؤشر (طلب المستخدمة 2026-11-12: «افتح المؤشر وارفع كل شاهد بصورة سريعة على حدة»): لكل المعلمات.
  // المؤشر الذي له مجلد بين مجلدات «ملفاتي» يُرفع إلى مجلده، وغيره إلى «سجل الأداء الوظيفي\NN - العنصر» باسم «م<j> - …» (tools/inbox.js).
  const QUP = {};   // ما رُفع في هذه الجلسة لكل مؤشر "k.j": [{n, st: 'up'|'ok'|'fail', err}]
  const upBtn = (k, j, label, cls) => D.inbox ? `<label class="${cls}">${label}<input type="file" multiple hidden data-pr-in="${k}.${j}" accept="${UP_ACCEPT}"></label>` : '';
  const upList = (k, j) => (QUP[k + '.' + j] || []).map(f => `<span class="uq ${f.st}">${f.st === 'up' ? '⏳' : f.st === 'ok' ? '✓' : '✗'} ${esc(f.n)}${f.st === 'ok' ? '، يظهر هنا خلال دقائق' : f.err ? '، ' + esc(f.err) : ''}</span>`).join('');
  async function quickUp(k, j, list) {
    const t = me(), x = model(t).E[k].ind[j], key = x.cells[0] ? x.cells[0].f.key : `pf:${k}.${j}`, q = QUP[k + '.' + j] ||= [];
    const items = [...list].map(file => ({ file, n: file.name, st: 'up', err: !UP_EXT.test(file.name) ? 'نوع غير مدعوم' : file.size > UP_MAX ? 'أكبر من ٢٠ م.ب' : '' }));
    items.forEach(it => { if (it.err) it.st = 'fail'; q.push(it); }); openEl(k);
    for (const it of items.filter(it => it.st === 'up')) {
      try { await sealUpload(it.file, key, t); it.st = 'ok'; pendSet([...pendGet(), { to: t.name, n: it.n, f: EL[k].t, at: Date.now() }]); }
      catch (e) { it.st = 'fail'; it.err = e.message === 'gh401' || e.message === 'gh403' ? 'الرفع غير متاح حاليًا' : 'تحقّقي من الاتصال'; }
      if (openK === k) openEl(k);
    }
  }
  function openEl(k) {
    const t = me(), e = model(t).E[k]; openK = k;
    const f0 = e.all[0], next = Math.max(0, e.ind.findIndex(x => !x.done));
    const body = `<h4>سلالم التقدير</h4><div class="ind">${e.ind.map((x, j) => `<div class="ir2"><span>${AR(j + 1)}. ${esc(x.name)}</span>
        <span class="tog"><button type="button" class="y" data-pr-t="${j}:1" aria-pressed="${x.st === 1}">نفّذ</button><button type="button" class="n" data-pr-t="${j}:0" aria-pressed="${x.st === 0}">لم ينفّذ</button></span>
        <span class="ev">${x.n ? thumbs(t, x.all, 5) + `<span>${AR(x.n)} شاهد</span>` : '<span>لا يوجد شاهد</span>'}${upBtn(k, j, '+ إرفاق شاهد', 'add')}${upList(k, j)}</span></div>`).join('')}</div>
      ${togMsg ? `<p class="note2">${togMsg}</p>` : ''}
      <div class="qrbox"><div class="qr" data-qr="${QR_BASE}${k + 1}"></div><div><b>باركود شواهد العنصر</b><p>يُطبع في ملفك الورقي، ومن يمسحه يرى كل شواهد «${esc(e.t)}».</p></div></div>
      <div class="acts2">${upBtn(k, next, 'رفع شاهد لهذا العنصر', 'btn3')}<a class="btn3 gh" href="${esc(f0 ? f0.info.url : e.pfUrl || t.url)}" target="_blank" rel="noopener">فتح في OneDrive</a></div>`;
    openSheet(sheetHtml(AR(k + 1), esc(e.t), `الوزن ${AR(e.w)}٪، ${AR(e.done)} من ${AR(e.ind.length)} مؤشرات منفّذة`, `background:var(--t${e.c});color:var(--t${e.c}i)`, body), e.t);
    document.querySelectorAll('.pr-sh [data-qr]').forEach(drawQr);
  }
  async function toggle(j, v) {
    const k = openK, key = k + '.' + j, ind = { ...((PF && PF.ind) || {}) }, e = model(me()).E[k], cur = e.ind[j].st;
    if (cur === v) delete ind[key]; else ind[key] = v;   // الضغط على الزر المختار يلغي الاختيار اليدوي (ترجع الحالة من الشاهد)
    PF = { ...(PF || {}), ind }; togMsg = '';
    try { await rpc('pf_save_by_pid', { p_pid: await teacherId(phoneOf(sessionCode)), p_data: PF }); }
    catch (x) { togMsg = 'تغيّرت الحالة في هذه الصفحة فقط، الحفظ لم يُفعَّل بعد'; }
    redraw(); openEl(k);
  }
  function openOther(fi) {
    const t = me(), c = t.cells.find(x => x.f.i === fi); if (!c || !c.info) return;
    openSheet(sheetHtml(I('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'), esc(c.f.label), `${AR(c.info.count)} ملف${c.info.last ? '، آخر رفع ' + HJ(c.info.last) : ''}`, 'background:var(--t2);color:var(--t2i)',
      `<div class="ir">${thumbs(t, [c], 40)}${foldActs(t, c)}</div>`), c.f.label);
  }

  function openProfile(k) {
    const card = PCARDS.find(x => x[0] === k);
    if (card && card[4].length > 1) return openGroup(card);   // «المقدمة وأهداف الملف» و«الرؤية والرسالة والقيم»: صفحة بخانة لكل جزء
    const t = me(), [, l, p, c] = PROFILE.find(x => x[0] === k), v = (PF && PF.cv) || {};
    let body = '';
    if (k === 'cv') body = `<div class="cv">${CV.map(([f, lab, w]) => `<label class="${w ? 'w2' : ''}">${lab}<input id="pf-${f}" data-cv="${f}" value="${esc(v[f] ?? (f === 'name' ? t.name : f === 'title' ? 'معلمة' : ''))}"${f === 'email' ? ' type="email" dir="ltr"' : ''}></label>`).join('')}</div>`
      + `<div class="save"><button type="button" data-pr-save="cv">حفظ السيرة الذاتية</button><span id="pfMsg" class="${PFERR ? 'err' : ''}">${PFERR ? esc(PFERR) + '، ستُحفظ بعد التفعيل' : ''}</span></div>`;
    else if (k !== 'certs') { const def = PROFILE.find(x => x[0] === k)[4];
      body = `${k === 'intro' ? '<div class="ayah">﴿وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ﴾<br><small style="color:#6e6a7c">التوبة: ١٠٥</small></div>' : ''}
        <textarea id="pf-text" data-k="${k}" aria-label="${esc(l)}" style="min-height:${k === 'policy' || k === 'charter' ? 360 : 200}px">${esc((PF && PF[k]) || def)}</textarea>
        <div class="save"><button type="button" data-pr-save="${k}">حفظ</button><span id="pfMsg" class="${PFERR ? 'err' : ''}">${PFERR ? esc(PFERR) + '، سيُحفظ بعد التفعيل' : PF && PF[k] ? 'آخر نسخة حفظتِها' : 'هذا نص مقترح من ملف السجل، اكتبي بأسلوبك'}</span></div>`; }
    else { const cs = t.cells.filter(x => x.f.label === 'الدورات' && x.info); body = cs.length ? `<div class="ir">${thumbs(t, cs, 40)}${cs.map(x => foldActs(t, x)).join('')}</div>` : '<span class="soon">لا يوجد مجلد «الدورات» في سجلك</span>'; }
    openSheet(sheetHtml(I(p), l, k === 'cv' ? 'تكتبها المعلمة مرة واحدة وتظهر في سجلها' : k === 'certs' ? 'من مجلد «المجتمع المهني / الدورات»' : 'اكتبي في الخانة ثم اضغطي «حفظ»', `background:var(--t${c});color:var(--t${c}i)`, body), l);
  }
  function openGroup([, l, p, c, fs]) {
    const body = fs.map(f => { const d = PROFILE.find(x => x[0] === f);
      return `${f === 'intro' ? '<div class="ayah">﴿وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ﴾<br><small style="color:#6e6a7c">التوبة: ١٠٥</small></div>' : ''}
        <h4>${d[1]}</h4><textarea data-k="${f}" aria-label="${esc(d[1])}" style="min-height:${f === 'intro' || f === 'goals' ? 170 : 110}px">${esc((PF && PF[f]) || d[4])}</textarea>`; }).join('')
      + `<div class="save"><button type="button" data-pr-save="multi">حفظ</button><span id="pfMsg" class="${PFERR ? 'err' : ''}">${PFERR ? esc(PFERR) + '، سيُحفظ بعد التفعيل' : 'هذا نص مقترح من ملف السجل، اكتبي بأسلوبك'}</span></div>`;
    openSheet(sheetHtml(I(p), l, 'اكتبي في الخانات ثم اضغطي «حفظ»', `background:var(--t${c});color:var(--t${c}i)`, body), l);
  }
  async function pfSave(kind, btn) {
    const msg = document.getElementById('pfMsg'), next = { ...(PF || {}) };
    if (kind === 'cv') { const cv = {}; document.querySelectorAll('.pr-sh [data-cv]').forEach(i => cv[i.dataset.cv] = i.value.trim()); next.cv = cv; }
    else if (kind === 'multi') document.querySelectorAll('.pr-sh textarea[data-k]').forEach(a => next[a.dataset.k] = a.value.trim());
    else next[kind] = document.getElementById('pf-text').value.trim();
    btn.disabled = true; msg.className = ''; msg.textContent = 'جارٍ الحفظ…';
    try { await rpc('pf_save_by_pid', { p_pid: await teacherId(phoneOf(sessionCode)), p_data: next }); PF = next; PFERR = ''; msg.textContent = 'تم الحفظ ✓'; redraw(); }
    catch (x) { msg.className = 'err'; msg.textContent = 'ما تم الحفظ: حفظ التعريف لم يُفعَّل بعد'; }
    btn.disabled = false;
  }

  document.addEventListener('change', e => { const i = e.target.closest('input[data-pr-in]'); if (!i || !i.files.length) return;
    const [k, j] = i.dataset.prIn.split('.').map(Number); quickUp(k, j, i.files); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.querySelector('.pr-sh') && !document.querySelector('.wv-lb')) closeSheet(); });
  window.addEventListener('hashchange', closeSheet);
  document.addEventListener('click', e => {
    if (e.target.closest('.th-i')) return;   // الصورة المصغّرة تفتح المعاينة (thumbsFill)
    if (e.target.closest('[data-pr-x]')) return closeSheet();
    const sv = e.target.closest('[data-pr-save]'); if (sv) return pfSave(sv.dataset.prSave, sv);
    const tg = e.target.closest('[data-pr-t]'); if (tg) { const [j, v] = tg.dataset.prT.split(':').map(Number); return toggle(j, v); }
    const pp = e.target.closest('[data-pr-p]'); if (pp) return openProfile(pp.dataset.prP);
    const up = e.target.closest('[data-pr-up]');
    if (up) { const v = up.dataset.prUp; closeSheet(); const w = document.getElementById('prUp'); if (w) w.hidden = false;   // بطاقة الرفع مخفية حتى تُطلب
      const s = document.getElementById('upF'); if (s) s.value = v;
      document.getElementById('up')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.getElementById('upI')?.click(); return; }
    if (!e.target.closest('#prRoot')) return;
    const k = e.target.closest('[data-pr-k]'); if (k) return openEl(+k.dataset.prK);
    const o = e.target.closest('[data-pr-o]'); if (o) return openOther(+o.dataset.prO);
    const s = e.target.closest('[data-pr-st]'); if (s) { F = s.dataset.prSt; return redraw(); }
    if (e.target.closest('[data-pr-need]')) { F = 'need'; redraw(); document.querySelector('#prRoot .els')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
  // نموذج أ يفتح صفحات «التعريف بالمعلمة» نفسها من هنا (PR.profile(k)، ثم PR.PROFILE للعناوين)
  window.PR = { render, PROFILE, profile: async k => { await pfLoad(); openProfile(k); } };
})();
