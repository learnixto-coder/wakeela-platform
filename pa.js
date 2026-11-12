// «سجل توثيق الأداء الوظيفي — نموذج أ» (2026-11-12): ترتيب سجل أ. هدى بالضبط (الغلاف، ثم صف لكل مجموعة: عنوان ووصف وعدّاد + لوحة بطاقات،
// خط فاصل قبل الصف الثالث، ثم التذييل، والمجلد يفتح في نافذة سفلية) بتنسيق قالب «Flowers X» (أسود/وردي/رمادي، خط وردي قصير فوق العناوين)
// وبخط ثمانية (Thmanyah Serif Display للعناوين، Thmanyah Sans للنص؛ fonts/*.woff2). طلب المستخدمة: «ترتيبه مثل سجل هدى، الخط خط ثمانية»،
// و«الصور الكثيرة مشتتة وليس متجر ورد» → صورة واحدة فقط في الغلاف. صفحات «التعريف بالمعلمة» هي نفسها في نموذج ب (pr.js → PR.profile).
// النسخة السابقة (ترتيب الصفحة الرئيسية للقالب بـ٩ أقسام وصور كثيرة) محفوظة في scratch pa-flowers-home-version.js.
// بلا اسم المعلمة في التذييل، بلا الشريط العلوي، بلا زرّي «المطلوب» و«فتح مجلدي». يعتمد على: D، esc، S_LABEL، wFileUrl، thumbsFill، upOn، uploadCard.
(function () {
  'use strict';
  if (!document.getElementById('pa-css')) document.head.insertAdjacentHTML('beforeend', `<style id="pa-css">
@font-face{font-family:"Thmanyah Sans";src:url(fonts/thmanyahsans-Regular.woff2) format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:"Thmanyah Sans";src:url(fonts/thmanyahsans-Medium.woff2) format("woff2");font-weight:500;font-display:swap}
@font-face{font-family:"Thmanyah Sans";src:url(fonts/thmanyahsans-Bold.woff2) format("woff2");font-weight:700;font-display:swap}
@font-face{font-family:"Thmanyah Serif Display";src:url(fonts/thmanyahserifdisplay-Bold.woff2) format("woff2");font-weight:700;font-display:swap}
.pa{--acc:#ef9aa3;--acc-d:#b9475a;--ink:#141414;--mut:#5f5f5f;--ln:#e6e6e6;--gr:#f6f6f6;--pk:#fbe9eb;--wh:#fff;--g:clamp(16px,4vw,48px);
  position:relative;background:var(--wh);color:var(--ink);border:1px solid var(--ln);font-family:"Thmanyah Sans","IBM Plex Sans Arabic",system-ui,sans-serif;line-height:1.75;font-size:15px;padding-bottom:var(--g)}
.pa h2,.pa h3{font-family:"Thmanyah Serif Display","Thmanyah Sans",serif;font-weight:700;margin:0;color:var(--ink);text-wrap:balance;letter-spacing:0}
.pa em{font-style:normal;color:var(--acc-d)}
.pa button{font:inherit;color:inherit}
.pa .rule{display:block;width:34px;height:2px;background:var(--acc);margin:0 0 14px}
/* الغلاف: المدرسة، العنوان، المديرة، شريط الترحيب (كسجل هدى) + صورة واحدة */
.pa .cov{background:var(--gr);display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);margin:var(--g) var(--g) 0;min-height:360px;overflow:hidden}
.pa .cov .tx{padding:40px clamp(18px,4vw,48px);display:flex;flex-direction:column;justify-content:center}
.pa .cov .sch2{margin:0 0 8px;font-size:15px;font-weight:500}
.pa .cov h2{font-size:clamp(30px,4.2vw,46px);line-height:1.3}
.pa .cov .who{margin:12px 0 0;color:var(--mut);font-size:14px}
.pa .cov .pill{display:flex;align-items:center;margin-top:20px;background:var(--ink);color:#fff;min-height:56px;padding:6px 24px;font-family:"Thmanyah Serif Display",serif;font-weight:700;font-size:19px;width:min(440px,100%)}
.pa .cov .art{min-height:280px;background:#f7f7f7 url(img/fx-hero.jpg) center top/cover no-repeat}
/* الصفوف: نص + لوحة بطاقات (ترتيب سجل هدى) */
.pa .rows{padding:28px var(--g) 0}
.pa .prw{display:grid;grid-template-columns:minmax(220px,1fr) 1.6fr;gap:32px;align-items:center;padding:34px 0}
.pa .sep{height:1px;background:var(--ln)}
.pa .prw .ptx h2{font-size:clamp(25px,3vw,32px);line-height:1.35;margin-bottom:8px}
.pa .prw .ptx p{margin:0 0 10px;color:var(--mut)}
.pa .prw .ptx .lnk{font-size:13px;font-weight:500;text-decoration:underline;text-decoration-color:var(--acc);text-underline-offset:5px}
.pa .ppn{padding:18px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;align-content:center}
.pa .r0 .ppn,.pa .r2 .ppn{background:var(--gr)}
.pa .r1 .ppn,.pa .r3 .ppn{background:var(--pk)}
.pa .ptl{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--ln);padding:8px 10px;min-height:68px;text-align:start;cursor:pointer;min-width:0;transition:border-color .15s}
.pa .ptl:hover{border-color:var(--ink)}
.pa .ptl:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.pa .ptl .av{width:44px;height:54px;flex:none;background:var(--gr);overflow:hidden;display:grid;place-items:center;color:var(--acc-d)}
.pa .ptl .av svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.pa .ptl .av .th-i{width:100%;height:100%;border:0;border-radius:0;pointer-events:none}
.pa .ptl .tx{flex:1;min-width:0}
.pa .ptl b{display:block;font-family:"Thmanyah Serif Display",serif;font-weight:700;font-size:16px;line-height:1.4}
.pa .ptl small{color:var(--mut);font-size:12.5px}
.pa .ptl .pck{width:22px;height:22px;flex:none;border-radius:50%;display:grid;place-items:center;font-size:12px}
.pa .ptl .pck.ok{background:#e9f4ec;color:#2f6b43}.pa .ptl .pck.part{background:#fdf0e1;color:#9a5a12}.pa .ptl .pck.none{background:var(--pk);color:var(--acc-d)}
.pa .ptl.no b{color:var(--mut)}
.pa .upw{margin:36px var(--g) 0}
.pa .upw[hidden]{display:none}
.pa .pft{margin:28px var(--g) 0;padding-top:18px;border-top:1px solid var(--ln);color:var(--mut);font-size:13px}
/* النافذة السفلية */
.pa-bd{position:fixed;inset:0;z-index:29;background:rgba(20,20,20,.38)}
.pa-sh{position:fixed;z-index:30;left:0;right:0;bottom:0;margin:auto;width:min(600px,100%);max-height:88vh;display:flex;flex-direction:column;background:#fff;color:#141414;
  box-shadow:0 -10px 40px rgba(0,0,0,.18);font-family:"Thmanyah Sans","IBM Plex Sans Arabic",system-ui,sans-serif;padding-bottom:env(safe-area-inset-bottom,0px);border-top:3px solid #ef9aa3}
.pa-sh .sh-h{display:flex;align-items:flex-start;gap:12px;padding:20px 22px 12px}
.pa-sh .sh-h .rule{display:block;width:30px;height:2px;background:#ef9aa3;margin-bottom:8px}
.pa-sh h2{margin:0;font-size:23px;font-weight:700;font-family:"Thmanyah Serif Display",serif;line-height:1.35}
.pa-sh p{margin:2px 0 0;color:#5f5f5f;font-size:13px}
.pa-sh .x{margin-inline-start:auto;width:40px;height:40px;border:1px solid #141414;background:#fff;color:#141414;cursor:pointer;font-size:16px;flex:none}
.pa-sh .b{overflow:auto;padding:4px 22px 22px}
.pa-sh .fth{gap:8px;margin:0 0 14px}
.pa-sh .th-i{width:84px;height:110px;border-radius:0}
.pa-sh .fl{list-style:none;margin:0 0 16px;padding:0;display:flex;flex-direction:column}
.pa-sh .fl li{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #e6e6e6}
.pa-sh .fl .e{font-size:11px;font-weight:700;background:#fbe9eb;color:#b9475a;min-width:46px;height:28px;display:grid;place-items:center;flex:none;text-transform:uppercase}
.pa-sh .fl .n{flex:1;min-width:0;word-break:break-word;font-size:14px}
.pa-sh .fl .d{color:#5f5f5f;font-size:12px;white-space:nowrap}
.pa-sh .acts{display:flex;gap:10px;flex-wrap:wrap}
.pa-sh .btn2{flex:1;display:inline-flex;align-items:center;justify-content:center;height:48px;border:1px solid #141414;padding:0 18px;font:inherit;font-size:14px;font-weight:500;background:#141414;color:#fff;cursor:pointer;text-decoration:none}
.pa-sh .btn2.gh{background:#fff;color:#141414}
.pa-sh .emp{color:#5f5f5f;text-align:center;padding:18px;background:#f6f6f6;margin-bottom:14px}
/* صفحات «التعريف بالمعلمة» (pr.js) حين تُفتح من نموذج أ */
.pr-sh.pa-skin{border-radius:0;border-top:3px solid #ef9aa3;font-family:"Thmanyah Sans","IBM Plex Sans Arabic",sans-serif}
.pr-sh.pa-skin h2{font-family:"Thmanyah Serif Display",serif;font-size:23px}
.pr-sh.pa-skin .grab{display:none}
.pr-sh.pa-skin .sh-h .no{background:#fbe9eb!important;color:#b9475a!important;border-radius:0}
.pr-sh.pa-skin .x{border-radius:0;border:1px solid #141414;background:#fff;color:#141414}
.pr-sh.pa-skin .save button{border-radius:0;background:#141414}
.pr-sh.pa-skin .cv input,.pr-sh.pa-skin textarea{border-radius:0;border-color:#e6e6e6;font-family:inherit}
.pr-sh.pa-skin .cv input:focus,.pr-sh.pa-skin textarea:focus{outline-color:#ef9aa3}
.pr-sh.pa-skin .ayah{border-radius:0;background:#fbe9eb}
@media (max-width:760px){
  .pa .cov{grid-template-columns:1fr;margin:0}.pa .cov .art{order:-1;min-height:220px}.pa .cov .tx{padding:22px 18px 28px}
  .pa .prw{grid-template-columns:1fr;gap:14px;padding:26px 0}.pa .ppn{grid-template-columns:1fr;padding:12px}
  .pa .upw,.pa .pft{margin-inline:0}}
</style>`);

  const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const HJ = iso => { if (!iso) return ''; try { const P = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(new Date(iso + 'T12:00:00')), g = k => (P.find(q => q.type === k) || {}).value;
    return AR([g('day'), g('month'), g('year')].join('/')) + 'هـ'; } catch { return iso; } };
  const SV = p => `<svg viewBox="0 0 24 24">${p}</svg>`;
  // «التعريف بالمعلمة» أولًا كما في سجل هدى؛ صفحاتها من نموذج ب (pr.js)، والأيقونات خطوط بسيطة بلون القالب
  const PROF = [['cv', 'السيرة الذاتية', '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'], ['intro', 'المقدمة', '<path d="M4 5h16M4 10h16M4 15h10"/>'],
    ['goals', 'أهداف الملف', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'], ['vision', 'الرؤية', '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'],
    ['mission', 'الرسالة', '<path d="M4 4h16v12H8l-4 4z"/>'], ['values', 'القيم', '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'],
    ['policy', 'سياسة التعليم في المملكة', '<path d="M12 3 3 8l9 5 9-5z"/><path d="M5 10v6l7 4 7-4v-6"/>'], ['charter', 'ميثاق أخلاقيات المهنة', '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/>']];
  const GR = [
    { k: 'plans', g: 'الخطط والمنهج', d: 'توزيع المنهج والخطط الفصلية والأسبوعية والعلاجية والإثرائية.', test: f => /^الخطة|توزيع المنهج/.test(f.label) },
    { k: 'comm', g: 'المجتمع المهني', d: 'الحلقات التنشيطية والدورات والدروس التطبيقية والزيارات التبادلية وورش العمل.', test: f => f.group === 'المجتمع المهني' || /المجتمع المهني/.test(f.key) },
    { k: 'learn', g: 'التعلم والبرامج', d: 'أنماط التعلم والبرامج والمبادرات والإنتاج المعرفي.', test: () => true }
  ];
  const ORDER = ['plans', 'learn', 'comm'];
  let sheetKey = null, prLoading = null;
  const me = () => D.teachers[0];
  const grpOf = c => GR.find(x => x.test(c.f));
  const cellsOf = t => t.cells.filter(c => c.s !== 'na').map(c => ({ c, gr: grpOf(c) }));
  const keyOf = (t, c, x) => t.name + '|' + c.f.key + '|' + x.n;
  const newest = c => [...c.info.files].sort((a, b) => (b.d || '').localeCompare(a.d || ''));
  const thI = (t, c, x, attrs = '') => `<span class="th-i" ${attrs} data-n="${esc(x.n)}" data-url="${esc(c.info.url ? wFileUrl(c.info.url, x.n.split(' / ').join('/')) : '')}" data-key="${esc(keyOf(t, c, x))}" data-x="${esc(x.x || '')}"></span>`;
  const thumbs = (t, c, n) => c.info.files.length ? `<div class="fth">${c.info.files.slice(0, n).map(x => thI(t, c, x, 'role="button" tabindex="0"')).join('')}</div>` : '';
  const fileW = n => n === 1 ? 'ملف' : n === 2 ? 'ملفان' : n <= 10 ? 'ملفات' : 'ملفًا';
  const MARK = { ok: '✓', part: '…', none: '!' };
  const row = (i, title, desc, count, tiles) => `${i === 2 ? '<div class="sep"></div>' : ''}<section class="prw r${i}"><div class="ptx"><span class="rule"></span><h2>${title}</h2><p>${desc}</p><span class="lnk">${count}</span></div><div class="ppn">${tiles}</div></section>`;

  function render() {
    const t = me(); if (!t) return '<div class="empty card">لا توجد بيانات</div>';
    const L = cellsOf(t);
    const groups = ORDER.map(k => GR.find(g => g.k === k)).map(g => ({ g, L: L.filter(z => z.gr === g) })).filter(x => x.L.length);
    return `<div class="pa" id="paRoot">
      <div class="cov"><div class="tx"><p class="sch2">المتوسطة الحادية والعشرون</p><span class="rule"></span><h2>سجل توثيق<br><em>شواهد</em> الأداء الوظيفي</h2>
        <p class="who">مديرة المدرسة: أ. أمينة آل مشيط</p><div class="pill">مرحبًا ${esc(t.name || t.short)}</div></div>
        <div class="art" role="img" aria-label="ورود"></div></div>
      <div class="rows">
        ${row(0, 'التعريف بالمعلمة', 'السيرة الذاتية والمقدمة والأهداف والرؤية والرسالة والقيم ومواثيق المهنة، تكتبينها مرة واحدة.', `${AR(PROF.length)} صفحات للكتابة`,
          PROF.map(([k, l, p]) => `<button class="ptl" type="button" data-pa-p="${k}"><span class="av">${SV(p)}</span><span class="tx"><b>${l}</b><small>${k === 'cv' ? 'بياناتك الوظيفية' : 'خانة للكتابة'}</small></span></button>`).join(''))}
        ${groups.map(({ g, L: gl }, i) => row(i + 1, g.g, g.d, `${AR(gl.filter(z => z.c.s === 'ok').length)} من ${AR(gl.length)} مكتملة`,
          gl.map(({ c }) => { const f0 = newest(c)[0];
            return `<button class="ptl${c.info.count ? '' : ' no'}" type="button" data-pa-f="${c.f.i}"><span class="av">${f0 ? thI(t, c, f0) : SV('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>')}</span><span class="tx"><b>${esc(c.f.label)}</b><small>${AR(c.info.count)} ${fileW(c.info.count)}، المطلوب ${AR(c.f.min)}</small></span><span class="pck ${c.s}" title="${S_LABEL[c.s]}">${MARK[c.s] || ''}</span></button>`; }).join(''))).join('')}
      </div>
      ${upOn(t) ? `<div class="upw" id="paUp" hidden>${uploadCard(t)}</div>` : ''}
      <div class="pft">المتوسطة الحادية والعشرون، العام الدراسي ١٤٤٨هـ</div></div>`;
  }

  function closeSheet() { document.querySelectorAll('.pa-sh,.pa-bd').forEach(x => x.remove()); sheetKey = null; }
  function openSheet(fi) {
    closeSheet();
    const t = me(), c = t.cells.find(x => x.f.i === fi); if (!c || !c.info) return;
    const gr = grpOf(c), files = newest(c);
    sheetKey = fi;
    const bd = Object.assign(document.createElement('div'), { className: 'pa-bd' }), sh = Object.assign(document.createElement('div'), { className: 'pa-sh' });
    sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.setAttribute('aria-label', c.f.label);
    sh.innerHTML = `<div class="sh-h"><div><span class="rule"></span><h2>${esc(c.f.label)}</h2><p>${gr.g}، ${AR(c.info.count)} ${fileW(c.info.count)}، المطلوب ${AR(c.f.min)}، ${S_LABEL[c.s]}</p></div><button class="x" data-pa-x aria-label="إغلاق">✕</button></div>
      <div class="b">${files.length ? thumbs(t, { ...c, info: { ...c.info, files } }, 40) + `<ul class="fl">${files.map(x => `<li><span class="e">${esc(x.x || '—')}</span><span class="n">${esc(x.n)}</span><span class="d">${HJ(x.d)}</span></li>`).join('')}</ul>`
        : '<div class="emp">لا توجد ملفات بعد</div>'}
      <div class="acts">${upOn(t) && D.inbox ? `<button class="btn2" data-pa-up="f:${c.f.i}">رفع ملف هنا</button>` : ''}<a class="btn2 gh" href="${esc(c.info.url)}" target="_blank" rel="noopener">فتح في OneDrive</a></div></div>`;
    bd.addEventListener('click', closeSheet);
    document.body.append(bd, sh);
    thumbsFill(sh);
    sh.querySelector('[data-pa-x]').focus();
  }
  // صفحات «التعريف بالمعلمة»: تُفتح من pr.js (نموذج ب) فتُحفظ في المكان نفسه
  function openProfile(k) {
    const skin = () => document.querySelector('.pr-sh')?.classList.add('pa-skin');   // نفس الصفحة بألوان نموذج أ وخطه
    if (window.PR && PR.profile) return PR.profile(k).then(skin);
    prLoading ||= new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'pr.js?v=20261112e'; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
    prLoading.then(() => PR.profile(k).then(skin), () => { prLoading = null; });
  }

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheetKey != null && !document.querySelector('.wv-lb')) closeSheet(); });
  window.addEventListener('hashchange', closeSheet);
  document.addEventListener('click', e => {
    if (e.target.closest('.pa-sh .th-i')) return;   // الصورة المصغّرة في النافذة تفتح المعاينة (thumbsFill)
    if (e.target.closest('[data-pa-x]')) return closeSheet();
    const up = e.target.closest('[data-pa-up]');
    if (up) { const v = up.dataset.paUp; closeSheet(); const w = document.getElementById('paUp'); if (w) w.hidden = false;
      const s = document.getElementById('upF'); if (s && v) s.value = v;
      document.getElementById('up')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.getElementById('upI')?.click(); return; }
    if (!e.target.closest('#paRoot')) return;
    const p = e.target.closest('[data-pa-p]'); if (p) return openProfile(p.dataset.paP);
    const f = e.target.closest('[data-pa-f]'); if (f) return openSheet(+f.dataset.paF);
  });
  window.PA = { render };
})();
