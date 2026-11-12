// «سجل إنجازي» الجديد (المرحلة ٦، 2026-11-10): داخل منصة المعلمات نفسها، الدخول برقم الجوال كما هو.
// البيانات من Supabase عبر دوال مفتاحها معرّف المعلمة في المنصة teacherId(phone) — لا حساب Supabase للمعلمة.
// «إصدار التقرير» = act_request_report_by_pid → جهاز المستخدمة (worker.cjs + Word) يصدر PDF → يظهر رابطه هنا.
// تقرير واحد لكل برنامج/أسبوع: إن أصدرته الزميلة يظهر لهما معًا. لكل المعلمات (recOn في index.html، 2026-11-10).
(() => {
  const SB = 'https://bynymxmjzaeoyikuuwen.supabase.co';
  const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5bnlteG1qemFlb3lpa3V1d2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MzMyNzEsImV4cCI6MjEwNzQwOTI3MX0.lL2cNc0Q_rGOaSy8rtSLPSOU9dZ57Yw1C4MoMmd9jjo';
  const SURVEY = 'https://learnixto-coder.github.io/wakeela-platform/s2/';
  const AR = '٠١٢٣٤٥٦٧٨٩', ar = s => String(s == null ? '' : s).replace(/\d/g, d => AR[d]);
  const e = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const HIJ = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura-nu-latn',   // en: أرقام دائمًا (آيفون كان يكتب اسم الشهر مع ar-SA)
    { day: 'numeric', month: 'numeric', year: 'numeric' });
  const hijri = s => { if (!s) return '—'; const o = {}; HIJ.formatToParts(new Date(s + 'T12:00:00')).forEach(p => o[p.type] = p.value);
    return ar(o.day) + '‏/' + ar(o.month) + '‏/' + ar(String(o.year).replace(/\D/g, '')) + 'هـ'; };   // اليوم أقصى اليمين
  const TODAY = (d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'))(new Date());   // التاريخ المحلي (كان UTC فيتأخر يومًا بعد منتصف الليل)
  let SC = null;   // جلسة الدخول التي يخص السجلُّ صاحبتَها: عند تغيّر الرقم يُمسح كل شيء (إصلاح 2026-11-11: كان يظهر سجل المعلمة السابقة)
  let R = null, ERR = '', TAB = 'all', CT = 's', OPEN = null, PID = null, poll = null, busy = false, UPMSG = '';
  const UP = {};   // ما رُفع في هذه الجلسة (العدد في قاعدة البيانات يتحدث بعد مزامنة الجسر)

  async function rpc(fn, body) {
    const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const t = await r.text(); if (!r.ok) { let m = t; try { m = JSON.parse(t).message || t; } catch (x) {} throw new Error(m); }
    return t ? JSON.parse(t) : null;
  }
  async function load() {
    const sc = sessionCode;
    try { const pid = await teacherId(phoneOf(sc)); const r = await rpc('act_record_by_pid', { p_pid: pid }); if (sc !== sessionCode) return; await localFolders(r); PID = pid; R = r; ERR = R ? '' : 'رقمك غير مربوط بسجل الأنشطة بعد، راجعي الوكيلة'; }
    catch (x) { if (sc !== sessionCode) return; ERR = x.message || 'تعذّر الاتصال'; }
    paint();
    const waiting = (R?.executions || []).some(x => x.status === 'requested');
    clearTimeout(poll); if (waiting && location.hash.startsWith('#rec')) poll = setTimeout(load, 20000);   // متابعة الطلب حتى يصدر
  }

  // معاينة محلية فقط (localhost): روابط المجلدات من folders.local.json حتى تُطبَّق migration 0015 — لا أثر في الموقع المنشور
  async function localFolders(r) {
    if (!r || !/^(localhost|127.0.0.1)$/.test(location.hostname)) return;
    try { const m = await (await fetch('folders.local.json', { cache: 'no-store' })).json();
      [...(r.assignments || []), ...(r.weeks || [])].forEach(x => { if (!x.folder && m[x.id]) x.folder = m[x.id]; }); } catch (x) {}
  }
  /* عناصر الصفحة: برامج صفية + أسابيع لاصفية */
  function items() {
    // 2026-11-12: تقرير صدر من النظام السابق = منجز (legacy_reports من القاعدة)، ما لم يصدر تقرير جديد
    const ex = R.executions || [], lg = R.legacy_reports || [], exOf = (k, id) => ex.find(x => x.kind === k && x.target === id)
      || (l => l && { status: 'issued', legacy: true, issued_at: l.issued_at })(lg.find(x => x.kind === k && x.target === id));
    const a = (R.assignments || []).map(x => ({ k: 'class', id: x.id, title: x.program, sub: ar(x.class || ''), from: x.from ?? x.start_date, to: x.to ?? x.end_date, partners: x.partners || [], folder: x.folder || x.folder_id || '', ev: x.evidence || 0, survey: x.responses ?? x.survey ?? 0, ex: exOf('class', x.id) }));
    const w = (R.weeks || []).map(x => ({ k: 'nonclass', id: x.id, week: x.week, title: 'الأسبوع ' + ar(x.week), sub: ar(x.class || ''), from: x.from ?? x.start_date, to: x.to ?? x.end_date, radio: x.radio_title, prayer: x.prayer_title, partners: x.partners || [], folder: x.folder || x.folder_id || '', ev: x.evidence || 0, ex: exOf('nonclass', x.id) }));
    // مناسبات المعلمة (2026-11-11): خاصة بفصلها، إدخال يدوي، نفس نموذج تقرير المناسبات المعتمد — لا تظهر لرائدة النشاط
    const o = (R.occasions || []).map(x => ({ k: 'occasion', id: x.id, title: x.name, sub: ar(x.class || ''), from: x.date, to: x.date, partners: x.partners || [], folder: x.folder || x.folder_id || '', ev: x.evidence || 0, ex: exOf('occasion', x.id) }));
    return [...a, ...w, ...o].map(it => (it.st = stat(it), it)).sort((p, q) => String(p.from || '9').localeCompare(String(q.from || '9')));
  }
  function stat(it) {
    const s = it.ex?.status;
    if (it.k === 'occasion' && !s) return ['opt', it.ev ? 'بلا تقرير (اختياري)' : 'مفعّلة'];
    if (s === 'issued' && it.ex.legacy) return ['done', 'منجز سابقًا'];
    if (s === 'issued') return ['done', it.ex.mine === false ? 'أصدرته زميلتك' : 'صدر التقرير'];
    if (s === 'requested') return ['wait', 'جارٍ الإصدار…'];
    if (s === 'failed') return ['fail', 'تعذّر الإصدار'];
    if (it.from && TODAY < it.from) return ['soon', 'قادم'];
    if (it.to && TODAY <= it.to) return ['now', 'جارٍ'];
    return ['need', it.ev ? 'بانتظار التقرير' : 'بلا شواهد'];
  }

  const CSS = `<style>
  .rc-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}.rc-tabs button{border:1px solid var(--line,#ddd);background:var(--card,#fff);color:inherit;border-radius:999px;padding:6px 14px;font:inherit;cursor:pointer}
  .rc-tabs button[aria-pressed=true]{background:var(--brand,#6c5ce7);color:#fff;border-color:transparent}
  .rc-list{display:grid;gap:10px}.rc-it{display:block;width:100%;text-align:right;font:inherit;color:inherit;background:var(--card,#fff);border:1px solid var(--line,#e5e2f0);border-inline-start:5px solid #b8b2d9;border-radius:14px;padding:12px 14px;cursor:pointer}
  .rc-it.done{border-inline-start-color:#22a06b}.rc-it.need,.rc-it.fail{border-inline-start-color:#e5793a}.rc-it.wait,.rc-it.now{border-inline-start-color:#6c5ce7}
  .rc-h{display:flex;justify-content:space-between;gap:8px;align-items:center}.rc-h b{font-weight:600}.rc-d{font-size:.86em;opacity:.75;margin-top:4px}
  .rc-chip{font-size:.78em;padding:2px 10px;border-radius:999px;background:#eeeafc;white-space:nowrap}.rc-chip.done{background:#dcf5e8;color:#11683f}.rc-chip.need,.rc-chip.fail{background:#fde9dc;color:#8a3a0e}
  .rc-kind{font-size:.74em;background:#6c5ce7;color:#fff;border-radius:6px;padding:1px 7px;margin-inline-end:6px}.rc-kind.n{background:#0e8a6a}.rc-kind.o{background:#c0712a}
  .rc-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:12px 0}.rc-meta div{background:#f6f4fd;border-radius:10px;padding:8px 10px}.rc-meta small{display:block;opacity:.65;font-size:.78em}
  .rc-pair{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}.rc-pair div{border:1px solid #e5e2f0;border-radius:10px;padding:8px 10px}.rc-pair b{display:block;font-size:.8em;opacity:.7}
  .rc-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:10px 0}.rc-form label{display:grid;gap:4px;font-size:.9em}
  .rc-form input,.rc-form textarea{font:inherit;padding:8px 10px;border:1px solid #d9d4ee;border-radius:10px;background:#fff;color:#222}.rc-chk{display:flex;flex-wrap:wrap;gap:6px 14px;grid-column:1/-1}
  .rc-btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.rc-err{color:#a1300b;margin:8px 0}
  .rc-seg{display:grid;grid-template-columns:repeat(3,1fr);background:#f1eefc;border-radius:14px;padding:5px;gap:5px;margin:14px 0 4px}
  .rc-seg button{font:inherit;border:0;background:none;color:inherit;border-radius:10px;padding:10px 4px;cursor:pointer;display:grid;justify-items:center;gap:3px;font-weight:600}
  .rc-seg button span{display:flex;align-items:center;gap:6px}.rc-seg svg{width:20px;height:20px;flex:none}.rc-seg small{font-weight:400;font-size:.74em;opacity:.75}
  .rc-seg button[aria-pressed=true]{background:#6c5ce7;color:#fff;box-shadow:0 4px 12px #6c5ce755}.rc-seg button[aria-pressed=true] small{opacity:.9}
  .rc-pane{padding-top:8px}.rc-srv{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin:10px 0}
  .rc-hero2{background:linear-gradient(135deg,#6c5ce7,#8e7cf8);color:#fff;border-radius:18px;padding:14px;margin-top:10px;display:grid;gap:8px}
  .rc-hero2 b{font-size:1.02em}.rc-st3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.rc-st3 div{background:#ffffff22;border-radius:12px;padding:6px;text-align:center}.rc-st3 strong{display:block;font-size:1.4em}.rc-st3 span{font-size:.75em;opacity:.92}
  .rc-bar{height:8px;background:#ffffff33;border-radius:9px;overflow:hidden}.rc-bar i{display:block;height:100%;background:#f5a524;border-radius:9px;transition:width 1.2s ease}
  .rc-rings{display:flex;gap:12px;overflow-x:auto;padding:12px 2px 6px;scrollbar-width:none}.rc-rings::-webkit-scrollbar{display:none}
  .rc-ring{flex:none;display:grid;justify-items:center;gap:5px;width:78px;background:none;border:0;font:inherit;color:inherit;cursor:pointer;padding:0}
  .rc-ring .o{width:70px;height:70px;border-radius:50%;padding:3px;background:conic-gradient(#f5a524,#6c5ce7,#ff7eb3,#f5a524)}.rc-ring.seen .o{background:#d6d2e8}
  .rc-ring .c{width:100%;height:100%;border-radius:50%;border:3px solid var(--card,#fff);background:#ece9fb center/cover;display:grid;place-items:center;font-weight:700;color:#6c5ce7;font-size:.8em;overflow:hidden}
  .rc-ring small{font-size:.7em;line-height:1.25;text-align:center;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .rc-st{position:fixed;inset:0;background:#0b0914b3;z-index:9999;display:grid;place-items:center;direction:rtl;padding:16px}
  .rc-st-in{position:relative;width:min(270px,78vw);height:min(420px,56vh);overflow:hidden;background:#000;border-radius:18px;box-shadow:0 12px 40px #0008}
  .rc-st-in>img{width:100%;height:100%;object-fit:contain;background:transparent;padding:58px 14px 74px;box-sizing:border-box}.rc-st-bg{position:absolute;inset:0;background:center/cover;filter:blur(24px) brightness(.55);transform:scale(1.2)}
  .rc-st-in>img{position:relative}
  .rc-st-p{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));inset-inline:10px;display:flex;gap:3px;z-index:3}.rc-st-p i{flex:1;height:3px;background:#fff5;border-radius:3px;overflow:hidden}.rc-st-p i b{display:block;height:100%;width:0;background:#fff}
  .rc-st-h{position:absolute;top:calc(22px + env(safe-area-inset-top,0px));inset-inline:12px;color:#fff;z-index:4;display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:.9em;text-shadow:0 1px 4px #000a}
  .rc-st-h button{background:#0007;color:#fff;border:0;border-radius:50%;width:36px;height:36px;font-size:18px;cursor:pointer;flex:none}
  .rc-st-f{position:absolute;bottom:0;inset-inline:0;padding:40px 16px calc(18px + env(safe-area-inset-bottom,0px));background:linear-gradient(transparent,#000c);color:#fff;z-index:4}
  .rc-cheer{display:inline-block;background:#f5a524;color:#3a2600;font-weight:800;border-radius:99px;padding:4px 12px;margin-bottom:6px;animation:rcpop .4s ease}
  @keyframes rcpop{from{transform:scale(.6);opacity:0}}
  .rc-st-tap{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;z-index:2}.rc-st-tap button{background:none;border:0;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}.rc-st{touch-action:manipulation}
  .rc-st-msg{position:absolute;inset:0;display:grid;place-items:center;color:#fff;z-index:1;text-align:center;padding:20px;pointer-events:none}
  .rc-spin{width:34px;height:34px;border-radius:50%;border:3px solid rgba(255,255,255,.35);border-top-color:#fff;animation:rcsp .8s linear infinite}@keyframes rcsp{to{transform:rotate(360deg)}}
  .rc-st-end{position:absolute;inset:0;z-index:5;display:grid;place-content:center;gap:12px;text-align:center;color:#fff;padding:24px;background:radial-gradient(circle at 50% 30%,#8e7cf8,#2d2363)}
  .rc-st-end h3{margin:0;font-size:1.5em}.rc-st-end .rc-btns{justify-content:center}
  .rc-confetti{position:fixed;inset:0;pointer-events:none;z-index:10000}
  @media (prefers-reduced-motion:reduce){.rc-bar i,.rc-cheer{transition:none;animation:none}}
  @media (max-width:420px){.rc-seg button span{flex-direction:column;gap:2px}}
  @media (prefers-color-scheme:dark){.rc-seg{background:#2a2640}.rc-meta div{background:#2a2640}.rc-chip{background:#3a3456}.rc-form input,.rc-form textarea{background:#1e1b2e;color:#eee;border-color:#3a3456}}
  </style>`;

  const DOMAINS = ['بنك الإثراءات', 'التطوير الذاتي', 'قيمنا الغالية', 'نادي القراءة'];
  function form(it) {
    const f = it.ex?.form || {}, v = k => e(f[k] ?? ''), num = (k, l) => `<label>${l}<input data-f="${k}" type="number" min="0" inputmode="numeric" value="${v(k)}"></label>`;
    if (it.k === 'class') return `<div class="rc-form">${num('parents', 'عدد أولياء الأمور المشاركين')}${num('disability', 'عدد الطالبات ذوات الإعاقة')}${num('partners_count', 'عدد الشراكات')}
      <label>أسماء الشراكات<input data-f="partners_names" value="${v('partners_names')}"></label>
      <div class="rc-chk"><span class="muted">المجالات:</span>${DOMAINS.map(d => `<label><input type="checkbox" data-dom value="${e(d)}"${(f.domains || []).includes(d) ? ' checked' : ''}> ${e(d)}</label>`).join('')}</div></div>`;
    if (it.k === 'occasion') return `<div class="rc-form">${num('students', 'عدد الطالبات المشاركات')}${num('disability', 'عدد الطالبات ذوات الإعاقة')}${num('parents', 'عدد أولياء الأمور المشاركين')}
      ${num('partners_count', 'عدد الشراكات')}<label>أسماء الشراكات<input data-f="partners_names" value="${v('partners_names')}"></label>${num('periods', 'عدد الحصص (إن وُجدت)')}</div>`;
    return `<div class="rc-form">${num('students', 'عدد الطالبات المشاركات')}${num('dis', 'عدد الطالبات ذوات الإعاقة')}<label style="grid-column:1/-1">ملاحظات<textarea data-f="notes" rows="2">${v('notes')}</textarea></label></div>`;
  }
  function readForm(box) {
    const o = {}; box.querySelectorAll('[data-f]').forEach(i => { if (i.value !== '') o[i.dataset.f] = i.type === 'number' ? +i.value : i.value.trim(); });
    const d = [...box.querySelectorAll('[data-dom]:checked')].map(i => i.value); if (box.querySelector('[data-dom]')) o.domains = d;
    return o;
  }

  const ICO = { s: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>', u: '<rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="9" cy="11" r="2"/><path d="m21 17-5-5-8 8"/>', r: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>' };
  const ico = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[k]}</svg>`;
  /* النشاط الصفي (2026-11-11، نموذج أ «شريط مقسّم»): ٣ تبويبات أعلى الصفحة — الاستبانة · رفع الصور · التقرير، والبيانات تحتها */
  function classPage(it) {
    const x = it.ex, s = x?.status, url = SURVEY + '?a=' + it.id;
    const rs = s === 'issued' && x.legacy ? 'منجز سابقًا' : s === 'issued' ? (x.mine === false ? 'أصدرته زميلتك' : 'صدر') : s === 'requested' ? 'جارٍ الإصدار…' : s === 'failed' ? 'تعذّر الإصدار' : 'لم يصدر';
    const T = [['s', 'الاستبانة', ar(it.survey) + ' ردًّا'], ['u', 'رفع الصور', ar(it.ev) + ' شاهدًا'], ['r', 'التقرير', rs]];
    let h = `<div class="card pad"><button class="btn sm ghost" data-rc="back">→ رجوع</button>
      <h2 style="margin:10px 0 4px"><span class="rc-kind">نشاط صفي</span>${e(it.title)}</h2>
      <nav class="rc-seg">${T.map(([k, l, n]) => `<button data-rcp="${k}" aria-pressed="${CT === k}"><span>${ico(k)}${l}</span><small>${n}</small></button>`).join('')}</nav><div class="rc-pane">`;
    if (CT === 's') h += `<p class="muted" style="margin:0">اعرضي الباركود للطالبات بعد تنفيذ البرنامج، أو انسخي الرابط وأرسليه لهن.</p>
      <div class="rc-srv"><div class="qr" data-qr="${e(url)}"></div><div><p style="margin:0 0 8px">ردود الطالبات: <b>${ar(it.survey)}</b></p>
      <div class="rc-btns" style="margin:0"><a class="btn" href="${e(url)}" target="_blank" rel="noopener">فتح الاستبانة</a><button class="btn ghost" data-rc="copy" data-u="${e(url)}">نسخ الرابط</button></div></div></div>`;
    else if (CT === 'u') h += upBox(it);
    else if (s === 'issued' && x.legacy) h += legacyBox(it);
    else if (s === 'issued') h += `<div class="ok" style="margin:10px 0">✓ صدر التقرير${x.issued_at ? ' في ' + hijri(x.issued_at.slice(0, 10)) : ''}${x.mine === false ? ' (أصدرته زميلتك ويُحسب لكما معًا)' : ''}.</div>
        <div class="rc-btns">${x.pdf_url ? `<a class="btn" href="${e(x.pdf_url)}" target="_blank" rel="noopener">فتح التقرير PDF</a>` : ''}${x.impact_url ? `<a class="btn ghost" href="${e(x.impact_url)}" target="_blank" rel="noopener">فتح قياس الأثر PDF</a>` : ''}</div>
        <details style="margin-top:12px"><summary>تعديل البيانات وإعادة الإصدار</summary>${form(it)}<div class="rc-btns"><button class="btn ghost" data-rc="issue">إعادة الإصدار</button></div></details>`;
    else if (s === 'requested') h += `<p class="muted">⏳ طلبك وصل، والتقرير وقياس الأثر يُجهَّزان الآن (عادةً خلال دقائق). تتحدث هذه الصفحة تلقائيًا.</p>`;
    else { if (s === 'failed') h += `<p class="rc-err">تعذّر الإصدار: ${e(x.error || '')} — صحّحي البيانات واضغطي مرة ثانية.</p>`;
      h += oldRepBox(it) + `<p class="muted" style="margin:0">اسم البرنامج والتواريخ والفصل والتوقيعات تُعبّأ تلقائيًا. أكملي الباقي ثم أصدري.</p>${form(it)}
        <div class="rc-btns"><button class="btn" data-rc="issue"${busy ? ' disabled' : ''}>إصدار التقرير</button><button class="btn ghost" data-rc="issue"${busy ? ' disabled' : ''}>إصدار قياس الأثر</button></div>
        <p class="muted" style="font-size:.85em">تقرير واحد لكل برنامج في الفصل؛ إذا أصدرته زميلتك يظهر هنا لكما معًا.</p>`; }
    return h + `</div><div class="rc-meta"><div><small>الفصل</small>${e(it.sub || '—')}</div><div><small>البداية</small>${hijri(it.from)}</div><div><small>النهاية</small>${hijri(it.to)}</div>
      <div><small>${it.partners.length > 1 ? 'زميلاتك' : 'زميلتك'}</small>${e(it.partners.join('، ') || '—')}</div></div></div>`;
  }

  function page(it) {
    if (it.k === 'class') return classPage(it);
    const x = it.ex, s = x?.status;
    let h = `<div class="card pad"><button class="btn sm ghost" data-rc="back">→ رجوع</button>
      <h2 style="margin:10px 0 4px"><span class="rc-kind${it.k === 'occasion' ? ' o' : ' n'}">${it.k === 'occasion' ? 'مناسبة' : 'نشاط لاصفي'}</span>${e(it.title)}</h2>
      <div class="rc-meta"><div><small>الفصل</small>${e(it.sub || '—')}</div>${it.k === 'occasion' ? `<div><small>التاريخ</small>${hijri(it.from)}</div>` : `<div><small>البداية</small>${hijri(it.from)}</div><div><small>النهاية</small>${hijri(it.to)}</div>`}
      <div><small>${it.partners.length > 1 ? 'زميلاتك' : 'زميلتك'}</small>${e(it.partners.join('، ') || '—')}</div><div><small>الشواهد</small>${ar(it.ev)}</div>${it.k === 'class' ? `<div><small>ردود الاستبانة</small>${ar(it.survey)}</div>` : ''}</div>`;
    if (it.k === 'nonclass') h += `<div class="rc-pair"><div><b>الاصطفاف الصباحي</b>${e(it.radio || '—')}</div><div><b>الصلاة</b>${e(it.prayer || '—')}</div></div>`;
    h += upBox(it) + (x?.legacy ? '' : oldRepBox(it));
    if (s === 'issued' && x.legacy) h += legacyBox(it);
    else if (s === 'issued') {
      h += `<div class="ok" style="margin:10px 0">✓ صدر التقرير${x.issued_at ? ' في ' + hijri(x.issued_at.slice(0, 10)) : ''}${x.mine === false ? ' (أصدرته زميلتك ويُحسب لكما معًا)' : ''}.</div>
        <div class="rc-btns">${x.pdf_url ? `<a class="btn" href="${e(x.pdf_url)}" target="_blank" rel="noopener">فتح التقرير PDF</a>` : ''}${x.impact_url ? `<a class="btn ghost" href="${e(x.impact_url)}" target="_blank" rel="noopener">تقرير قياس الأثر PDF</a>` : ''}</div>
        <details style="margin-top:12px"><summary>تعديل البيانات وإعادة الإصدار</summary>${form(it)}<div class="rc-btns"><button class="btn ghost" data-rc="issue">إعادة الإصدار</button></div></details>`;
    } else if (s === 'requested') {
      h += `<p class="muted">⏳ طلبك وصل، والتقرير يُجهَّز الآن (عادةً خلال دقائق). تتحدث هذه الصفحة تلقائيًا.</p>`;
    } else {
      if (s === 'failed') h += `<p class="rc-err">تعذّر الإصدار: ${e(x.error || '')} — صحّحي البيانات واضغطي مرة ثانية.</p>`;
      h += `<h3 style="margin:14px 0 4px">بيانات التقرير</h3><p class="muted" style="margin:0">اسم البرنامج والتواريخ والفصل والتوقيعات تُعبّأ تلقائيًا. أكملي الباقي ثم اضغطي «إصدار التقرير».</p>${form(it)}
        <div class="rc-btns"><button class="btn" data-rc="issue"${busy ? ' disabled' : ''}>إصدار التقرير${it.k === 'class' ? ' + قياس الأثر' : ''}</button>
        ${it.k === 'class' ? `<a class="btn ghost" href="${SURVEY}?a=${e(it.id)}" target="_blank" rel="noopener">استبانة الطالبات</a>` : ''}</div>
        <p class="muted" style="font-size:.85em">تقرير واحد لكل ${it.k === 'class' ? 'برنامج في الفصل' : it.k === 'occasion' ? 'مناسبة (بنموذج الأيام والمناسبات المعتمد)' : 'أسبوع'}؛ إذا أصدرته زميلتك يظهر هنا لكما معًا.</p>`;
      if (it.k === 'occasion' && !it.ev && !x && !UP['occasion:' + it.id]) h += `<p style="margin-top:14px"><button class="btn sm ghost" data-rc="odel">حذف هذه المناسبة (أُضيفت خطأً)</button></p>`;
    }
    return h + '</div>';
  }

  /* ───── إرفاق الشواهد: عبر مسارات الرفع نفسها في المنصة (tupload/tustart للصفي، nupload للاصفي) فتصل لنفس مجلدات درايف */
  const nrm = s => String(s || '').replace(/^\s*برنامج\s+/, '').replace(/[٠-٩]/g, c => AR.indexOf(c)).replace(/[إأآ]/g, 'ا').replace(/ة/g, 'ه').replace(/\s+/g, ' ').trim();
  function clsTarget(it) {
    if (!D.ct) return null;
    const L = cpList().filter(x => nrm(x.p.n) === nrm(it.title));
    return L.find(x => nrm(x.p.cls || x.it.cls).replace(/\D/g, '') === nrm(it.sub).replace(/\D/g, '') && nrm(x.p.cls || x.it.cls).slice(0, 4) === nrm(it.sub).slice(0, 4)) || (L.length === 1 ? L[0] : null);
  }
  const nonTargets = it => (D.cn?.weeks || []).filter(x => +x.w === +it.title.replace(/\D/g, '').replace(/[٠-٩]/g, c => AR.indexOf(c)) || +x.w === it.week);
  function upBox(it) {
    const k = it.k + ':' + it.id, n = UP[k] || 0;
    const ok = it.k === 'class' ? !!clsTarget(it) : it.k === 'occasion' ? !!(D.cn?.tok && D.cn?.cls) : nonTargets(it).length > 0;
    const sel = it.k === 'nonclass' ? `<label class="rc-form" style="margin:6px 0"><span>الشاهد عن</span><select id="rc-kind" style="font:inherit;padding:8px;border-radius:10px;border:1px solid #d9d4ee">${nonTargets(it).map((x, i) => `<option value="${i}">${x.kind === 'الصلاة' ? 'الصلاة' : 'الاصطفاف الصباحي (الإذاعة)'}${x.prog ? ': ' + e(x.prog) : ''}</option>`).join('')}</select></label>` : '';
    return `<div class="rc-ev"><h3 style="margin:14px 0 4px">الشواهد</h3>
      <p class="muted" style="margin:0">${ar(it.ev)} شاهدًا محفوظًا${n ? ' · رفعتِ الآن ' + ar(n) : ''}. ${it.k === 'class' ? 'صور أو فيديو أو PDF (الصور تُصغَّر قبل الرفع، والفيديو حتى ٥٠٠ م.ب).' : 'صور فقط، تصل إلى مجلد الفصل المشترك.'}</p>${storyBtn(it)}
      ${ok ? sel + `<label class="btn" style="margin-top:8px;display:inline-flex;cursor:pointer">إرفاق الشواهد<input type="file" id="rc-file" multiple accept="${it.k === 'class' ? 'image/*,video/*,application/pdf' : 'image/*'}" hidden></label>`
        : it.k === 'occasion' ? '<p class="rc-err">تعذّر ربط حسابك بمجلد فصلك، راجعي الوكيلة.</p>'
        : '<p class="rc-err">تعذّر ربط هذا البرنامج بمجلد شواهده، ارفعي من زر «' + (it.k === 'class' ? 'الأنشطة الصفية' : 'الأنشطة اللاصفية') + '» مؤقتًا.</p>'}
      <div id="rc-upmsg" class="muted" style="margin-top:6px">${e(UPMSG)}</div></div>`;
  }
  const b64of = f => new Promise((o, x) => { const fr = new FileReader(); fr.onload = () => o(String(fr.result).split(',')[1]); fr.onerror = x; fr.readAsDataURL(f); });
  async function post(body, ms) { let last = 'تعذر الاتصال';
    for (let i = 0; i < 4; i++) { try { const r = await fetch(D.ct.api, { method: 'POST', signal: AbortSignal.timeout ? AbortSignal.timeout(ms) : undefined, headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
      const t = await r.text(); if (t[0] !== '{') throw new Error('رد غير متوقع'); const x = JSON.parse(t); if (!x.ok) { last = x.error; if (/غير مصرح|غير معروف|ليس من|فقط|أكبر/.test(x.error)) break; throw new Error(x.error); } return x; }
      catch (er) { last = er.message; await new Promise(o => setTimeout(o, 900)); } }
    throw new Error(last); }
  async function upload(it, files) {
    const k = it.k + ':' + it.id, msg = t => { UPMSG = t; const m = document.getElementById('rc-upmsg'); if (m) m.textContent = t; };
    let ok = 0, err = '';
    for (const [i, f0] of files.entries()) {
      msg(`جارٍ رفع ${ar(i + 1)} من ${ar(files.length)}…`);
      try {
        const uid = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + i;
        if (it.k === 'class') {
          const one = clsTarget(it);
          if (!/^(image|video)\/|^application\/pdf$/.test(f0.type)) throw new Error('يُقبل الصور والفيديو وملفات PDF فقط');
          const f = /^image\//.test(f0.type) ? await shrinkImage(f0) : f0;
          if (f.size > 500 * 1048576) throw new Error('الملف أكبر من ٥٠٠ م.ب');
          const fl = f.size > 20 * 1048576 ? await cpBig(one, f, p => msg(`جارٍ رفع ${ar(i + 1)} من ${ar(files.length)}… ${ar(p)}٪`))
            : (await post({ a: 'tupload', uid, tok: one.it.tok, key: one.p.key, name: f.name, mime: f.type || 'image/jpeg', b64: await b64of(f) }, f.size > 3e6 ? 240000 : 45000)).file;
          one.p.files && one.p.files.push(fl);
        } else if (it.k === 'occasion') {
          if (!/^image\//.test(f0.type)) throw new Error('تُقبل الصور فقط');
          const f = await shrinkImage(f0); if (f.size > 25 * 1048576) throw new Error('الصورة أكبر من ٢٥ م.ب');
          const x = await post({ a: 'oupload', uid, tok: D.cn.tok, cls: D.cn.cls, occ: it.title, name: f.name, mime: f.type || 'image/jpeg', b64: await b64of(f) }, 45000);
          await rpc('act_add_occasion_evidence_by_pid', { p_pid: PID, p_event: it.id, p_drive_id: x.file.id, p_name: x.file.n, p_mime: x.file.m || f.type, p_size: x.file.s || f.size, p_folder_id: x.file.folder || null });
        } else {
          const w = nonTargets(it)[+(document.getElementById('rc-kind')?.value || 0)];
          if (!/^image\//.test(f0.type)) throw new Error('تُقبل الصور فقط');
          const f = await shrinkImage(f0); if (f.size > 25 * 1048576) throw new Error('الصورة أكبر من ٢٥ م.ب');
          const x = await post({ a: 'nupload', uid, tok: D.cn.tok, cls: D.cn.cls, w: w.w, kind: w.kind, prog: w.prog, from: w.from, to: w.to, topic: w.topic, name: f.name, mime: f.type || 'image/jpeg', b64: await b64of(f) }, 45000);
          w.files && w.files.push({ n: x.file.n, t: x.file.t, id: x.file.id });
        }
        ok++; UP[k] = (UP[k] || 0) + 1;
      } catch (er) { err = `تعذّر رفع «${f0.name}»: ${er.message}`; }
    }
    UPMSG = (ok ? `✓ رُفع ${ar(ok)} من ${ar(files.length)} ووصلت إلى مجلد الشواهد` : '') + (err ? ' · ' + err : '');
    if (it.k === 'occasion' && ok) { Object.keys(UP).forEach(k => k === 'occasion:' + it.id && delete UP[k]); return load(); }   // العدد من القاعدة مباشرة (لا جسر للمناسبات)
    paint();
  }

  /* إضافة مناسبة يدويًا: من قائمة المناسبات الرسمية أو «أخرى» + التاريخ (يظهر هجريًا) */
  let ADD = false, ADDMSG = '';
  /* «الأيام والمناسبات» (2026-11-11): قائمة المكتبة كاملة، تفعّل المعلمة ما نفّذته فقط، + «مناسبة أخرى» يدويًا */
  function addBox() {
    if (!ADD) return `<div class="rc-btns" style="margin:4px 0 10px"><button class="btn ghost" data-rc="oadd">＋ مناسبة أخرى (ليست في القائمة)</button></div>`;
    return `<div class="card pad" id="rc-add" style="margin-bottom:10px"><h3 style="margin:0 0 6px">مناسبة أخرى</h3><div class="rc-form">
      <label>اسم المناسبة<input id="rc-otext" maxlength="80" placeholder="اكتبي اسم المناسبة"></label>
      <label>التاريخ<input id="rc-odate" type="date" value="${e(TODAY)}"><small id="rc-ohij" class="muted">${hijri(TODAY)}</small></label></div>
      <div class="rc-btns"><button class="btn" data-rc="osave"${busy ? ' disabled' : ''}>حفظ المناسبة</button><button class="btn ghost" data-rc="ocancel">إلغاء</button></div>
      ${ADDMSG ? `<p class="rc-err">${e(ADDMSG)}</p>` : ''}</div>`;
  }
  function occBox(mine) {
    const by = n => mine.find(i => i.title === n);
    return `<div class="ok" style="margin:0 0 10px">ليس ضروريًا إصدار التقرير ولا تفعيل جميع المناسبات — فعّلي فقط ما نفّذتِه مع طالباتك.</div>
      <div class="rc-list">${(R.occasion_list || []).map(x => { const it = by(x.name);
        return it ? `<button class="rc-it ${it.st[0]}" data-rco="occasion:${e(it.id)}"><div class="rc-h"><b><span class="rc-kind o">مفعّلة</span>${e(x.name)}</b><span class="rc-chip ${it.st[0]}">${it.st[1]}</span></div><div class="rc-d">${hijri(it.from)} · ${ar(it.ev)} صورة</div></button>`
          : `<div class="rc-it" style="cursor:default"><div class="rc-h"><b>${e(x.name)}</b><button class="btn sm" data-rc="oon" data-n="${e(x.name)}" data-d="${e(x.date || TODAY)}"${busy ? ' disabled' : ''}>تفعيل</button></div><div class="rc-d">${x.date ? hijri(x.date) : '—'}</div></div>`; }).join('')}</div>
      ${addBox()}`;
  }
  /* ───── «قصص سريعة» (2026-11-12): صور كل نشاط سابق أو جديد تُعرض كقصة بملء الشاشة + التقرير القديم.
     تُجلب من مجلداتها بالمسارات القديمة نفسها (صفي: tthumb/tfile، لاصفي: nget/nthumbs/nfile) — لا يُخزَّن شيء في الموقع */
  const SP = {};   // key → { st: 'load'|'ok'|'err', ph: [{id,n,src}], rep: {...}|null, sid?, err }
  const imgF = f => /^image\//.test(f.m || '') || /\.(jpe?g|png|webp|heic|gif)$/i.test(f.n || '');
  const pad2 = n => String(n).padStart(2, '0');
  const storyable = it => it.k === 'class' ? !!clsTarget(it) : it.k === 'nonclass' ? nonTargets(it).length > 0 : false;
  function photos(it) {
    const key = it.k + ':' + it.id; if (SP[key] && SP[key].st !== 'err') return SP[key].p || Promise.resolve(SP[key]);
    const o = SP[key] = { st: 'load', ph: [], rep: null };
    o.p = (async () => {
      try {
        if (it.k === 'class') {
          const one = clsTarget(it); o.one = one;
          o.ph = cpAll(one.p).filter(f => f.id && imgF(f)).sort((a, b) => String(a.t).localeCompare(String(b.t))).map(f => ({ id: f.id, n: f.n }));
          const r = (one.p.rep || []).find(f => f.id); if (r) o.rep = { k: 'c', id: r.id, n: r.n };
        } else {
          const sids = [...new Set(nonTargets(it).map(x => 'w|' + pad2(x.w) + '|' + x.topic))];
          for (const sid of sids) {
            const L = await post({ a: 'nget', tok: D.cn.tok, sid }, 120000);
            (L.files || []).filter(imgF).forEach(f => o.ph.push({ id: f.id, n: f.n, sid, src: f.tb ? 'data:image/jpeg;base64,' + f.tb : '' }));
            if (!o.rep && L.rec?.pdf?.id) o.rep = { k: 'n', sid, id: L.rec.pdf.id, n: L.rec.pdf.name };
          }
        }
        o.st = 'ok';
      } catch (x) { o.st = 'err'; o.err = x.message; }
      delete o.p; return o;
    })();
    return o.p;
  }
  // صورة بحجم مناسب للشاشة (٩٠٠ بكسل)، تُحفظ في الذاكرة فقط
  const BIG = {}, BIGV = {};   // BIGV = الصور الجاهزة (تُعرض فورًا بلا انتظار)
  // 2026-11-12 «ليست سريعة»: كل صور النشاط تُجلب معًا (٤ في وقت واحد) لحظة فتح القصة، لا صورة صورة
  function preload(o, from = 0) {
    const q = o.ph.slice(from).filter(f => !BIG[f.id]);
    return Promise.all([0, 1, 2, 3].map(async () => { while (q.length) await bigOf(o, q.shift()); }));
  }
  function bigOf(o, f) {
    return BIG[f.id] ||= (async () => {
      if (o.one) { const j = await ctGet(o.one, 'tthumb', f.id, { sz: 600 }); return j.b64 ? `data:${j.m || 'image/jpeg'};base64,${j.b64}` : ''; }
      const r = await post({ a: 'nthumbs', tok: D.cn.tok, sid: f.sid, ids: [f.id], sz: 900 }, 120000), v = (r.th || {})[f.id];
      return v ? `data:${v.m || 'image/jpeg'};base64,${v.b64}` : f.src;
    })().then(v => (v && (BIGV[f.id] = v), v)).catch(() => { delete BIG[f.id]; return f.src || ''; });
  }
  async function openOldRep(o, btn) {
    const w = window.open('', '_blank'); if (w) w.document.write('<p dir="rtl" style="font-family:sans-serif;padding:20px">جارٍ فتح التقرير…</p>');
    const t0 = btn && btn.textContent; if (btn) { btn.disabled = true; btn.textContent = 'جارٍ الفتح…'; }
    try {
      const j = o.rep.k === 'c' ? await ctGet(o.one, 'tfile', o.rep.id) : await post({ a: 'nfile', tok: D.cn.tok, sid: o.rep.sid, id: o.rep.id }, 120000);
      const bin = atob(j.b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([u8], { type: j.m || 'application/pdf' }));
      if (w) w.location.href = url; setTimeout(() => URL.revokeObjectURL(url), 180000);
    } catch (x) { if (w) w.close(); alert('تعذّر فتح التقرير: ' + x.message); }
    if (btn) { btn.disabled = false; btn.textContent = t0; }
  }
  const seenKey = () => 'rc-seen-' + (PID || '');
  const SEEN = () => { try { return new Set(JSON.parse(localStorage.getItem(seenKey()) || '[]')); } catch (x) { return new Set(); } };
  const markSeen = k => { try { const s = SEEN(); s.add(k); localStorage.setItem(seenKey(), JSON.stringify([...s])); } catch (x) {} };
  // عبارات التشجيع (2026-11-12): عربية لكل المعلمات، وإنجليزية لمعلمات اللغة الإنجليزية (طلبها)
  const CHEER_AR = ["رائع! 👏","إنجاز مميز ✨","طالباتك مبدعات 💜","استمري 🚀","عمل يُفتخر به 🌟","بصمة جميلة 💫","أحسنتِ 👌","مبدعة كعادتك ✨","لمستك واضحة 🎨","فخورون بك 💐","عطاؤك لا يُنسى 💜","تميّزٌ يليق بك 👑","جهد يستحق التقدير 🌷","أنتِ قدوة 🌿","استمري في التألق 💫","طالباتك نجوم 🌟","تفاعل رائع 👏","إبداع طالباتك ملهم 💡","فريق رائع 🤝","حماس يُلهم 🔥","مواهب تتألق 🌟","تعلّمن واستمتعن 😊","لحظة فخر 🥇","أثرك باقٍ 💜","ذكرى جميلة 📸","خطوة نحو التميز 🚀","بصمة تستحق الفخر 🏅","هنا تُصنع الذكريات ✨","نجاح يُروى 📖","يوم من أيام الإنجاز 🗓️","تعليم بروح جميلة 💜","ما شاء الله تبارك الله 🌸","بارك الله في جهدك 🤲","جزاك الله خيرًا 💐","سلمت يداك 🌷","يعطيك العافية 💪","الله يسعدك كما أسعدتِ طالباتك 💜","عمل متقن 👌","إبداع بلا حدود 🌈","روعة! 😍","قمة في التميز 🏔️","أداء استثنائي ⭐","رسالة سامية 🕊️","غرسٌ طيّب 🌱","ثمرة جهدك 🍃","تألّق مستمر 💫","مدرستنا تفخر بك 🏫","وطننا يفخر بكن 💚","جيلٌ واعد 🌟","بناة المستقبل 🚀","عقول مبدعة 🧠","أيادٍ ماهرة ✋","ابتسامات صادقة 😊","بيئة تعلّم ملهمة 💡","شغف واضح ❤️","تعلّم ممتع 🎈","نشاط مثمر 🌿","عمل جماعي رائع 🤝","قيادة واعية 🧭","همّة عالية 🔝","أنتِ تصنعين الفرق ✨","أثر لا يُمحى 💜","صورة تحكي إنجازًا 📸","لحظة تستحق التوثيق 📷","مستوى رائع 📈","تفوّق وتميز 🏆","نجمة اليوم 🌟","بالتوفيق دائمًا 🌷","إلى الأمام 🚀","دمتِ متألقة ✨","كل الشكر لك 💐","عطاء متجدد 🔄","إتقان يُحتذى 👌","روح المبادرة 💡","بصمة معلمة مبدعة 🖋️","نفخر بطالباتك 💜","نجاح مشترك 🤝","ذكرى لا تُنسى 📸"];
  const CHEER_EN = ["Amazing work! 👏","Well done! 🌟","Outstanding! ✨","Brilliant! 💡","Keep shining! 💫","You inspire us! 💜","Fantastic job! 🎉","Superb! 👌","Proud of you! 💐","Great teaching! 🍎","Your students shine! 🌟","Creative minds at work! 🧠","Learning made fun! 🎈","What a moment! 📸","Making memories! ✨","Excellent effort! 💪","Truly inspiring! 🕊️","Top-notch work! 🏆","You make a difference! 💜","Bravo! 👏","Simply wonderful! 🌷","Impressive! ⭐","Keep it up! 🚀","Star teacher! 🌟","Star students! ⭐","Teamwork at its best! 🤝","Great energy! 🔥","Pure talent! 🎨","A proud moment! 🥇","Knowledge in action! 📚","Future leaders! 🚀","Bright minds! 💡","Excellence in action! 🏅","Beautiful work! 🌸","So creative! 🌈","Nailed it! 🎯","Above and beyond! 🔝","Hard work pays off! 💪","Learning never stops! 📖","Great vibes! 😊","Inspiring teacher! 🍎","Remarkable! ✨","Keep up the great work! 🌟","Making us proud! 💚","Shine on! 💫","Way to go! 🚀","Magnificent! 👑","A job well done! ✅","Engaged and excited! 🎉","Moments that matter! 📷","Leaving a mark! 🖋️","Growing every day! 🌱","You rock! 🎸","Unstoppable! ⚡","Smart and creative! 🧠","Dream big! 🌙","English stars! 🌟","Speaking with confidence! 🗣️","Words that inspire! 📝","Little steps, big wins! 👣","Passion for learning! ❤️","Wow! 😍"];
  const EN_T = /شريفة|ابتسام|أحلام|احلام/;
  // كل صورة عبارة: مجموعة مخلوطة عشوائيًا، لا تتكرر عبارة حتى تمر كلها، ثم تُخلط من جديد (طلبها: التنوع، والتكرار مقبول عند كثرة الصور)
  const DECK = { ar: [], en: [] };
  const cheer = () => { const en = EN_T.test(R?.teacher?.name || ''), D2 = DECK[en ? 'en' : 'ar'];
    if (!D2.length) { const L = (en ? CHEER_EN : CHEER_AR).slice(); for (let i = L.length - 1; i > 0; i--) { const r = Math.random() * (i + 1) | 0; [L[i], L[r]] = [L[r], L[i]]; } D2.push(...L); }
    return `<span class="rc-cheer"${en ? ' dir="ltr"' : ''}>${D2.pop()}</span>`; };
  // أغلفة الدوائر: أول صورة من كل نشاط، اثنتان في وقت واحد
  const COVER = {};
  async function covers() {
    const q = [...document.querySelectorAll('[data-rcs] .c:not([data-done])')];
    q.forEach(c => c.dataset.done = 1);
    const one = async c => {
      const k = c.closest('[data-rcs]').dataset.rcs, it = items().find(i => i.k + ':' + i.id === k); if (!it) return;
      try { if (!(k in COVER)) { const o = await photos(it), f = o.ph[0]; COVER[k] = f ? (f.src || await bigOf(o, f)) : ''; }
        if (SP[k]?.st === 'ok' && !SP[k].ph.length) { document.querySelectorAll(`[data-rcs="${k}"]`).forEach(x => x.remove()); return; }
        document.querySelectorAll(`[data-rcs="${k}"] .c`).forEach(x => { if (COVER[k]) { x.style.backgroundImage = `url("${COVER[k]}")`; x.textContent = ''; } }); } catch (x) {}
    };
    await Promise.all([0, 1].map(async () => { while (q.length) await one(q.shift()); }));
  }
  function rings(L) {
    const S = SEEN(), R2 = L.filter(i => i.ev > 0 && storyable(i) && !(SP[i.k + ':' + i.id]?.st === 'ok' && !SP[i.k + ':' + i.id].ph.length)).sort((a, b) => S.has(a.k + ':' + a.id) - S.has(b.k + ':' + b.id));
    if (!R2.length) return '';
    return `<div class="rc-rings" role="list" aria-label="قصص أنشطتي">${R2.map(i => { const k = i.k + ':' + i.id;
      return `<button class="rc-ring${S.has(k) ? ' seen' : ''}" data-rcs="${e(k)}" role="listitem" title="${e(i.title)}"><span class="o"><span class="c">${ar(i.ev)}</span></span><small>${e(i.k === 'nonclass' ? i.title : i.title)}</small></button>`; }).join('')}</div>`;
  }
  // عارض القصة: صورة كل ٣٫٥ ثانية، اللمس يسارًا/يمينًا للتنقل، وفي النهاية بطاقة تهنئة + التقرير ثم النشاط التالي
  let STM = null, SQ = [];   // SQ = ترتيب القصص لحظة فتحها (لا يتغير أثناء المشاهدة)
  function storyList() { const S = SEEN(); return items().filter(i => i.ev > 0 && storyable(i) && !(SP[i.k + ':' + i.id]?.st === 'ok' && !SP[i.k + ':' + i.id].ph.length)).sort((a, b) => S.has(a.k + ':' + a.id) - S.has(b.k + ':' + b.id)); }
  async function story(key, j = 0, only) {
    clearTimeout(STM);
    const it = items().find(i => i.k + ':' + i.id === key); if (!it) return;
    let d = document.getElementById('rc-st');
    if (!d) { d = document.createElement('div'); d.id = 'rc-st'; d.className = 'rc-st'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'قصة النشاط'); document.body.append(d); document.body.style.overflow = 'hidden'; }
    d.dataset.k = key; d.dataset.j = j; d.dataset.only = only ? 1 : '';
    const head = (n, of) => `<div class="rc-st-h"><span><b>${e(it.title)}</b>${of ? ' · ' + ar(n) + ' من ' + ar(of) : ''}<br><small>${e(it.sub)} · ${hijri(it.from)}</small></span><button data-st="x" aria-label="إغلاق">✕</button></div>`;
    const o = SP[key]?.st === 'ok' ? SP[key] : null;
    if (!o) { d.innerHTML = `<div class="rc-st-in">${head()}<div class="rc-st-msg">جارٍ جلب صورك…</div></div>`; const r = await photos(it); if (d.dataset.k !== key || !d.isConnected) return;
      if (r.st === 'err') { d.innerHTML = `<div class="rc-st-in">${head()}<div class="rc-st-msg">تعذّر جلب الصور: ${e(r.err)}</div></div>`; return; } return story(key, j, only); }
    markSeen(key);
    const N = o.ph.length;
    if (j >= N) {   // القصة صور فقط (طلبها 2026-11-12): بعد آخر صورة ← صور النشاط التالي مباشرة، وبعد الأخير تُغلق
      if (!only) { const nx = SQ[SQ.indexOf(key) + 1]; if (nx) return story(nx, 0); }
      return stClose();
    }
    const f = o.ph[j], ready = BIGV[f.id] || f.src, prev = d.querySelector('.rc-st-in > img:not([hidden])')?.src || '';
    if (j === 0) { preload(o); const nx = SQ[SQ.indexOf(key) + 1], ni = nx && items().find(i => i.k + ':' + i.id === nx); if (ni) photos(ni).then(p => p.ph[0] && bigOf(p, p.ph[0])); }
    d.innerHTML = `<div class="rc-st-in"><div class="rc-st-bg"${ready || prev ? ` style="background-image:url('${ready || prev}')"` : ''}></div><div class="rc-st-p">${o.ph.map((_, k) => `<i><b style="width:${k < j ? 100 : 0}%"></b></i>`).join('')}</div>${head(j + 1, N)}
      <div class="rc-st-msg">${BIGV[f.id] ? '' : '<span class="rc-spin" aria-label="جارٍ التحميل"></span>'}</div><img alt="${e(f.n)}"${ready || prev ? ` src="${ready || prev}"` : ' hidden'}><div class="rc-st-tap"><button data-st="nx" aria-label="التالية"></button><button data-st="pv" aria-label="السابقة"></button></div>
      <div class="rc-st-f">${cheer()}</div></div>`;
    const im = d.querySelector('img'), bar = d.querySelectorAll('.rc-st-p b')[j];
    if (f.src) { im.src = f.src; im.hidden = false; d.querySelector('.rc-st-bg').style.backgroundImage = `url("${f.src}")`; }
    // 2026-11-12 طلبها: الصورة التي لا يمكن عرضها لا تظهر أبدًا (لا نقاط ولا رسالة) — تُحذف من القصة ويُنتقل للتالية فورًا
    const skip = () => { if (d.dataset.k !== key || +d.dataset.j !== j) return; const x = o.ph.indexOf(f); if (x >= 0) o.ph.splice(x, 1); delete BIGV[f.id]; story(key, j, only); };
    im.onerror = skip;
    // مهلة ١٠ ثوانٍ (ctGet قد يعيد المحاولة دقائق): إن تأخرت الصورة ← التالية فورًا دون حذفها، أو تبقى المصغّرة إن وُجدت
    const TO = {}, src = await Promise.race([bigOf(o, f), new Promise(ok => setTimeout(() => ok(TO), 10000))]); if (d.dataset.k !== key || +d.dataset.j !== j) return;
    if (src === TO) { if (!f.src) return story(key, j + 1, only); d.querySelector('.rc-st-msg').textContent = ''; }
    else if (src) { im.src = src; im.hidden = false; d.querySelector('.rc-st-bg').style.backgroundImage = `url("${src}")`; d.querySelector('.rc-st-msg').textContent = ''; }
    else return skip();
    if (o.ph[j + 1] && !BIG[o.ph[j + 1].id]) preload(o, j + 1);   // تجهيز ما بعدها
    requestAnimationFrame(() => { bar.style.transition = 'width 3.5s linear'; bar.style.width = '100%'; });
    STM = setTimeout(() => story(key, j + 1, only), 3500);
  }
  function stClose() { clearTimeout(STM); document.getElementById('rc-st')?.remove(); document.body.style.overflow = ''; paint(); }
  function burst() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas'); c.className = 'rc-confetti'; c.width = innerWidth; c.height = innerHeight; document.body.append(c); const x = c.getContext('2d');
    const C = ['#6c5ce7', '#f5a524', '#ff7eb3', '#00b894', '#0984e3'], ps = Array.from({ length: 130 }, () => ({ x: innerWidth / 2, y: innerHeight / 3, vx: (Math.random() - .5) * 13, vy: Math.random() * -11 - 2, c: C[Math.random() * 5 | 0], s: 4 + Math.random() * 5 }));
    let t = 0; (function f() { x.clearRect(0, 0, c.width, c.height); ps.forEach(p => { p.vy += .35; p.x += p.vx; p.y += p.vy; x.fillStyle = p.c; x.fillRect(p.x, p.y, p.s, p.s * 1.6); }); if (++t < 120) requestAnimationFrame(f); else c.remove(); })();
  }
  document.addEventListener('click', ev => {
    const d = document.getElementById('rc-st'); if (!d || !d.contains(ev.target)) return;
    if (ev.target === d) return stClose();   // الضغط خارج نافذة القصة يغلقها
    const b = ev.target.closest('[data-st]'); if (!b) return;
    const k = d.dataset.k, j = +d.dataset.j, only = !!d.dataset.only, a = b.dataset.st;
    if (a === 'x') return stClose();
    // 2026-11-12 (تصحيح طلبها): الضغط ← الصورة التالية/السابقة فورًا، وكل ضغطة سريعة = صورة واحدة (بعد آخر صورة ← النشاط التالي)
    if (a === 'nx') return story(k, j + 1, only);
    if (a === 'pv') { if (j > 0) return story(k, j - 1, only); const pv = only ? null : SQ[SQ.indexOf(k) - 1]; return story(pv || k, 0, only); }
    if (a === 'next') return story(b.dataset.k, 0);
    if (a === 'rep') return openOldRep(SP[k], b);
    if (a === 'open') { clearTimeout(STM); d.remove(); document.body.style.overflow = ''; OPEN = k; CT = 'u'; paint(); document.getElementById('rc-root')?.scrollIntoView({ block: 'start' }); }
  });
  document.addEventListener('keydown', ev => { const d = document.getElementById('rc-st'); if (!d) return;
    if (ev.key === 'Escape') stClose(); else if (ev.key === 'ArrowLeft') story(d.dataset.k, +d.dataset.j + 1, !!d.dataset.only); else if (ev.key === 'ArrowRight') story(d.dataset.k, Math.max(0, +d.dataset.j - 1), !!d.dataset.only); });
  // زر التقرير السابق داخل صفحة النشاط (إن لم يصدر تقرير جديد)
  // منجز في النظام السابق: يُحسب منجزًا، ويُفتح تقريره القديم، وإصدار تقرير بالنموذج المعتمد اختياري
  function legacyBox(it) {
    return `<div class="ok" style="margin:10px 0">✓ هذا النشاط منجز سابقًا — صدر تقريره من النظام السابق${it.ex.issued_at ? ' في ' + hijri(it.ex.issued_at.slice(0, 10)) : ''}، ويُحسب لك.</div>
      ${oldRepBox(it, true)}<details style="margin-top:12px"><summary>إصدار تقرير جديد بالنموذج المعتمد (اختياري)</summary>${form(it)}<div class="rc-btns"><button class="btn ghost" data-rc="issue"${busy ? ' disabled' : ''}>إصدار التقرير${it.k === 'class' ? ' + قياس الأثر' : ''}</button></div></details>`;
  }
  function oldRepBox(it, any) {
    if ((it.ex?.status === 'issued' && !any) || !storyable(it)) return '';
    const o = SP[it.k + ':' + it.id];
    if (!o) { photos(it).then(() => { if (OPEN === it.k + ':' + it.id) paint(); }); return ''; }
    return o.rep ? `<div class="card pad" style="margin:10px 0;border:1px dashed #b8b2d9"><b>التقرير السابق</b><p class="muted" style="margin:4px 0 8px">صدر من النظام السابق: ${e(String(o.rep.n || '').replace(/\.pdf$/i, ''))}</p><button class="btn sm" data-rc="oldrep">فتح التقرير السابق</button></div>` : '';
  }
  // 2026-11-12 طلبها: بدل «شاهدي صورك كقصة» ← زر يفتح مجلد النشاط في درايف (المفتاح folder من act_record_by_pid، migration 0015)
  const storyBtn = it => it.folder ? `<a class="btn sm" href="https://drive.google.com/drive/folders/${encodeURIComponent(it.folder)}" target="_blank" rel="noopener" style="margin-top:8px;display:inline-flex">📁 فتح مجلدي في Drive</a>` : '';

  function body() {
    if (ERR) return `<div class="card pad"><p class="rc-err">تعذّر تحميل سجلك: ${e(ERR)}</p><button class="btn sm" data-rc="reload">إعادة المحاولة</button></div>`;
    if (!R) return '<div class="card pad"><p class="muted" style="margin:0">جارٍ تحميل سجلك…</p></div>';
    const L = items();
    if (OPEN) { const it = L.find(i => i.k + ':' + i.id === OPEN); if (it) return page(it); OPEN = null; }
    const Q = L.filter(i => i.k !== 'occasion');   // المناسبات اختيارية: لا تدخل في «يحتاج منك» ولا في العدّ
    const done = Q.filter(i => i.st[0] === 'done').length, need = Q.filter(i => i.st[0] === 'need' || i.st[0] === 'fail');
    const libN = new Set((R.occasion_list || []).map(x => x.name)), mine = L.filter(i => i.k === 'occasion');
    const vis = TAB === 'occasion' ? mine.filter(i => !libN.has(i.title)) : L.filter(i => TAB === 'all' || i.k === TAB);
    return `<div class="card hero th-hero"><div class="grow"><h2>سجل إنجازي</h2><p class="muted">أ. ${e(R.teacher?.name || '')} · الأنشطة الصفية واللاصفية والأيام والمناسبات · الفصل الدراسي الأول ١٤٤٨هـ · ${ar(done)} من ${ar(Q.length)} تقريرًا صدر</p></div></div>
      ${(() => { const ph = L.reduce((a, i) => a + (i.ev || 0), 0), pct = Q.length ? Math.round(done * 100 / Q.length) : 0;
        return `<div class="rc-hero2"><b>أحسنتِ يا أ. ${e(String(R.teacher?.name || '').split(' ')[0])}! 🌟 هذا ما أنجزتِه</b><div class="rc-st3"><div><strong>${ar(ph)}</strong><span>صورة وشاهد</span></div><div><strong>${ar(Q.length)}</strong><span>برنامجًا وأسبوعًا</span></div><div><strong>${ar(done)}</strong><span>تقريرًا صدر</span></div></div>
          <div class="rc-bar"><i style="width:${pct}%"></i></div></div>`; })()}
      ${rings(L)}
      ${need.length ? `<div class="warn" style="margin-top:10px"><b>يحتاج منك:</b> ${need.map(i => e(i.title)).join('، ')}</div>` : ''}
      <nav class="rc-tabs">${[['all', 'الكل'], ['class', 'الأنشطة الصفية'], ['nonclass', 'الأنشطة اللاصفية'], ['occasion', 'الأيام والمناسبات']].map(([k, l]) => `<button data-rct="${k}" aria-pressed="${TAB === k}">${l}</button>`).join('')}</nav>
      ${TAB === 'occasion' ? occBox(mine) + (vis.length ? '<h3 style="margin:14px 0 6px">مناسبات أضفتِها</h3>' : '') : ''}
      <div class="rc-list">${vis.map(i => `<button class="rc-it ${i.st[0]}" data-rco="${i.k}:${e(i.id)}"><div class="rc-h"><b><span class="rc-kind${i.k === 'class' ? '' : i.k === 'occasion' ? ' o' : ' n'}">${i.k === 'class' ? 'صفية' : i.k === 'occasion' ? 'مناسبة' : 'لاصفية'}</span>${e(i.title)}</b><span class="rc-chip ${i.st[0]}">${i.st[1]}</span></div>
        <div class="rc-d">${i.k === 'occasion' ? hijri(i.from) : hijri(i.from) + ' إلى ' + hijri(i.to)} · ${e(i.sub)} · ${ar(i.ev)} شاهدًا</div></button>`).join('') || (TAB === 'occasion' ? '' : '<p class="muted">لا يوجد شيء في هذا القسم.</p>')}</div>`;
  }
  function paint() { const el = document.getElementById('rc-root'); if (!el) return; el.innerHTML = body(); if (typeof drawQr === 'function') el.querySelectorAll('[data-qr]').forEach(drawQr); setTimeout(covers, 0); }

  document.addEventListener('click', async ev => {
    const root = document.getElementById('rc-root'); if (!root || !root.contains(ev.target)) return;
    const t = ev.target.closest('[data-rct]'); if (t) { TAB = t.dataset.rct; return paint(); }
    const p = ev.target.closest('[data-rcp]'); if (p) { CT = p.dataset.rcp; return paint(); }
    const sr = ev.target.closest('[data-rcs]'); if (sr) { const L = storyList().map(i => i.k + ':' + i.id), k = sr.dataset.rcs; SQ = L.slice(L.indexOf(k)); return story(k, 0); }
    const o = ev.target.closest('[data-rco]'); if (o) { OPEN = o.dataset.rco; CT = 's'; paint(); return root.scrollIntoView({ block: 'start' }); }
    const b = ev.target.closest('[data-rc]'); if (!b) return;
    if (b.dataset.rc === 'back') { OPEN = null; return paint(); }
    if (b.dataset.rc === 'story' && OPEN) return story(OPEN, 0, true);
    if (b.dataset.rc === 'oldrep' && OPEN) return openOldRep(SP[OPEN], b);
    if (b.dataset.rc === 'copy') { try { await navigator.clipboard.writeText(b.dataset.u); b.textContent = '✓ نُسخ'; } catch (x) { prompt('انسخي الرابط:', b.dataset.u); } return; }
    if (b.dataset.rc === 'reload') { R = null; paint(); return load(); }
    if (b.dataset.rc === 'oadd') { ADD = true; ADDMSG = ''; return paint(); }
    if (b.dataset.rc === 'ocancel') { ADD = false; ADDMSG = ''; return paint(); }
    if (b.dataset.rc === 'oon' && !busy) {   // تفعيل مناسبة من المكتبة بتاريخها
      busy = true; b.disabled = true; b.textContent = 'جارٍ التفعيل…';
      try { const r = await rpc('act_add_occasion_by_pid', { p_pid: PID, p_name: b.dataset.n, p_date: b.dataset.d }); busy = false; await load(); OPEN = 'occasion:' + r.id; paint(); }
      catch (x) { busy = false; paint(); alert('تعذّر التفعيل: ' + x.message); }
      return;
    }
    if (b.dataset.rc === 'osave' && !busy) {
      const name = document.getElementById('rc-otext').value.trim(), d = document.getElementById('rc-odate').value;
      if (name.length < 3) { ADDMSG = 'اكتبي اسم المناسبة'; return paint(); }
      if (!d) { ADDMSG = 'اختاري التاريخ'; return paint(); }
      busy = true; b.disabled = true; b.textContent = 'جارٍ الحفظ…';
      try { const r = await rpc('act_add_occasion_by_pid', { p_pid: PID, p_name: name, p_date: d }); busy = false; ADD = false; ADDMSG = ''; await load(); OPEN = 'occasion:' + r.id; CT = 's'; paint(); }
      catch (x) { busy = false; ADDMSG = x.message; paint(); }
      return;
    }
    if (b.dataset.rc === 'odel' && !busy) {
      if (!confirm('حذف هذه المناسبة؟')) return;
      const id = OPEN.split(':')[1]; busy = true;
      try { await rpc('act_del_occasion_by_pid', { p_pid: PID, p_id: id }); busy = false; OPEN = null; await load(); }
      catch (x) { busy = false; alert('تعذّر الحذف: ' + x.message); }
      return;
    }
    if (b.dataset.rc === 'issue' && !busy) {
      const [k, id] = OPEN.split(':'); busy = true; b.disabled = true; b.textContent = 'جارٍ الإرسال…';
      try { await rpc('act_request_report_by_pid', { p_pid: PID, p_kind: k, p_target: id, p_form: readForm(b.closest('.card')) }); busy = false; await load(); }
      catch (x) { busy = false; b.disabled = false; paint(); alert('تعذّر إرسال الطلب: ' + x.message); }
    }
  });

  document.addEventListener('change', ev => {
    if (ev.target.id === 'rc-odate') { document.getElementById('rc-ohij').textContent = hijri(ev.target.value); return; }
    if (ev.target.id !== 'rc-file' || !ev.target.files.length || !OPEN) return;
    const it = items().find(i => i.k + ':' + i.id === OPEN), files = [...ev.target.files]; ev.target.value = '';
    if (it) upload(it, files);
  });

  const sync = () => { if (SC !== sessionCode) { SC = sessionCode; R = null; ERR = ''; PID = null; OPEN = null; TAB = 'all'; UPMSG = ''; Object.keys(UP).forEach(k => delete UP[k]); clearTimeout(poll); LP = null; ADD = false; ADDMSG = ''; [SP, BIG, COVER].forEach(o => Object.keys(o).forEach(k => delete o[k])); clearTimeout(STM); document.getElementById('rc-st')?.remove(); } };
  let LP = null;   // تحميل واحد مشترك بين الصفحة و«لوحتي»
  const ensure = () => (R || ERR) ? Promise.resolve() : (LP ||= load().finally(() => { LP = null; }));
  window.REC = { render() { sync(); ensure(); return CSS + '<div id="rc-root">' + body() + '</div>'; },
    // «لوحتي» (2026-11-11): نفس بيانات «سجل إنجازي» ونفس الحالة، وزر يفتح البرنامج/الأسبوع نفسه
    async data() { sync(); await ensure(); if (ERR) throw new Error(ERR); return items().filter(i => i.k !== 'occasion').map(i => ({ key: i.k + ':' + i.id, k: i.k, title: i.title, sub: i.sub, from: i.from, to: i.to, ev: i.ev, st: i.st[0], stl: i.st[1], radio: i.radio, prayer: i.prayer })); },
    open(key) { sync(); OPEN = key; CT = 's'; } };
})();
