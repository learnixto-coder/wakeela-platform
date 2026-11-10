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
  const HIJ = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' });
  const hijri = s => { if (!s) return '—'; const o = {}; HIJ.formatToParts(new Date(s + 'T12:00:00')).forEach(p => o[p.type] = p.value);
    return ar(o.day) + '‏/' + ar(o.month) + '‏/' + ar(String(o.year).replace(/\D/g, '')) + 'هـ'; };   // اليوم أقصى اليمين
  const TODAY = new Date().toISOString().slice(0, 10);
  let R = null, ERR = '', TAB = 'all', OPEN = null, PID = null, poll = null, busy = false, UPMSG = '';
  const UP = {};   // ما رُفع في هذه الجلسة (العدد في قاعدة البيانات يتحدث بعد مزامنة الجسر)

  async function rpc(fn, body) {
    const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const t = await r.text(); if (!r.ok) { let m = t; try { m = JSON.parse(t).message || t; } catch (x) {} throw new Error(m); }
    return t ? JSON.parse(t) : null;
  }
  async function load() {
    try { PID ||= await teacherId(phoneOf(sessionCode)); R = await rpc('act_record_by_pid', { p_pid: PID }); ERR = R ? '' : 'رقمك غير مربوط بسجل الأنشطة بعد، راجعي الوكيلة'; }
    catch (x) { ERR = x.message || 'تعذّر الاتصال'; }
    paint();
    const waiting = (R?.executions || []).some(x => x.status === 'requested');
    clearTimeout(poll); if (waiting && location.hash.startsWith('#rec')) poll = setTimeout(load, 20000);   // متابعة الطلب حتى يصدر
  }

  /* عناصر الصفحة: برامج صفية + أسابيع لاصفية */
  function items() {
    const ex = R.executions || [], exOf = (k, id) => ex.find(x => x.kind === k && x.target === id);
    const a = (R.assignments || []).map(x => ({ k: 'class', id: x.id, title: x.program, sub: ar(x.class || ''), from: x.from ?? x.start_date, to: x.to ?? x.end_date, partners: x.partners || [], ev: x.evidence || 0, survey: x.responses ?? x.survey ?? 0, ex: exOf('class', x.id) }));
    const w = (R.weeks || []).map(x => ({ k: 'nonclass', id: x.id, week: x.week, title: 'الأسبوع ' + ar(x.week), sub: ar(x.class || ''), from: x.from ?? x.start_date, to: x.to ?? x.end_date, radio: x.radio_title, prayer: x.prayer_title, partners: x.partners || [], ev: x.evidence || 0, ex: exOf('nonclass', x.id) }));
    return [...a, ...w].map(it => (it.st = stat(it), it)).sort((p, q) => String(p.from || '9').localeCompare(String(q.from || '9')));
  }
  function stat(it) {
    const s = it.ex?.status;
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
  .rc-kind{font-size:.74em;background:#6c5ce7;color:#fff;border-radius:6px;padding:1px 7px;margin-inline-end:6px}.rc-kind.n{background:#0e8a6a}
  .rc-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:12px 0}.rc-meta div{background:#f6f4fd;border-radius:10px;padding:8px 10px}.rc-meta small{display:block;opacity:.65;font-size:.78em}
  .rc-pair{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}.rc-pair div{border:1px solid #e5e2f0;border-radius:10px;padding:8px 10px}.rc-pair b{display:block;font-size:.8em;opacity:.7}
  .rc-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:10px 0}.rc-form label{display:grid;gap:4px;font-size:.9em}
  .rc-form input,.rc-form textarea{font:inherit;padding:8px 10px;border:1px solid #d9d4ee;border-radius:10px;background:#fff;color:#222}.rc-chk{display:flex;flex-wrap:wrap;gap:6px 14px;grid-column:1/-1}
  .rc-btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.rc-err{color:#a1300b;margin:8px 0}
  @media (prefers-color-scheme:dark){.rc-meta div{background:#2a2640}.rc-chip{background:#3a3456}.rc-form input,.rc-form textarea{background:#1e1b2e;color:#eee;border-color:#3a3456}}
  </style>`;

  const DOMAINS = ['بنك الإثراءات', 'التطوير الذاتي', 'قيمنا الغالية', 'نادي القراءة'];
  function form(it) {
    const f = it.ex?.form || {}, v = k => e(f[k] ?? ''), num = (k, l) => `<label>${l}<input data-f="${k}" type="number" min="0" inputmode="numeric" value="${v(k)}"></label>`;
    if (it.k === 'class') return `<div class="rc-form">${num('parents', 'عدد أولياء الأمور المشاركين')}${num('disability', 'عدد الطالبات ذوات الإعاقة')}${num('partners_count', 'عدد الشراكات')}
      <label>أسماء الشراكات<input data-f="partners_names" value="${v('partners_names')}"></label>
      <div class="rc-chk"><span class="muted">المجالات:</span>${DOMAINS.map(d => `<label><input type="checkbox" data-dom value="${e(d)}"${(f.domains || []).includes(d) ? ' checked' : ''}> ${e(d)}</label>`).join('')}</div></div>`;
    return `<div class="rc-form">${num('students', 'عدد الطالبات المشاركات')}${num('dis', 'عدد الطالبات ذوات الإعاقة')}<label style="grid-column:1/-1">ملاحظات<textarea data-f="notes" rows="2">${v('notes')}</textarea></label></div>`;
  }
  function readForm(box) {
    const o = {}; box.querySelectorAll('[data-f]').forEach(i => { if (i.value !== '') o[i.dataset.f] = i.type === 'number' ? +i.value : i.value.trim(); });
    const d = [...box.querySelectorAll('[data-dom]:checked')].map(i => i.value); if (box.querySelector('[data-dom]')) o.domains = d;
    return o;
  }

  function page(it) {
    const x = it.ex, s = x?.status;
    let h = `<div class="card pad"><button class="btn sm ghost" data-rc="back">→ رجوع</button>
      <h2 style="margin:10px 0 4px"><span class="rc-kind${it.k === 'class' ? '' : ' n'}">${it.k === 'class' ? 'نشاط صفي' : 'نشاط لاصفي'}</span>${e(it.title)}</h2>
      <div class="rc-meta"><div><small>الفصل</small>${e(it.sub || '—')}</div><div><small>البداية</small>${hijri(it.from)}</div><div><small>النهاية</small>${hijri(it.to)}</div>
      <div><small>${it.partners.length > 1 ? 'زميلاتك' : 'زميلتك'}</small>${e(it.partners.join('، ') || '—')}</div><div><small>الشواهد</small>${ar(it.ev)}</div>${it.k === 'class' ? `<div><small>ردود الاستبانة</small>${ar(it.survey)}</div>` : ''}</div>`;
    if (it.k === 'nonclass') h += `<div class="rc-pair"><div><b>الاصطفاف الصباحي</b>${e(it.radio || '—')}</div><div><b>الصلاة</b>${e(it.prayer || '—')}</div></div>`;
    h += upBox(it);
    if (s === 'issued') {
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
        <p class="muted" style="font-size:.85em">تقرير واحد لكل ${it.k === 'class' ? 'برنامج في الفصل' : 'أسبوع'}؛ إذا أصدرته زميلتك يظهر هنا لكما معًا.</p>`;
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
    const ok = it.k === 'class' ? !!clsTarget(it) : nonTargets(it).length > 0;
    const sel = it.k === 'nonclass' ? `<label class="rc-form" style="margin:6px 0"><span>الشاهد عن</span><select id="rc-kind" style="font:inherit;padding:8px;border-radius:10px;border:1px solid #d9d4ee">${nonTargets(it).map((x, i) => `<option value="${i}">${x.kind === 'الصلاة' ? 'الصلاة' : 'الاصطفاف الصباحي (الإذاعة)'}${x.prog ? ': ' + e(x.prog) : ''}</option>`).join('')}</select></label>` : '';
    return `<div class="rc-ev"><h3 style="margin:14px 0 4px">الشواهد</h3>
      <p class="muted" style="margin:0">${ar(it.ev)} شاهدًا محفوظًا${n ? ' · رفعتِ الآن ' + ar(n) : ''}. ${it.k === 'class' ? 'صور أو فيديو أو PDF (الصور تُصغَّر قبل الرفع، والفيديو حتى ٥٠٠ م.ب).' : 'صور فقط، تصل إلى مجلد الفصل المشترك.'}</p>
      ${ok ? sel + `<label class="btn" style="margin-top:8px;display:inline-flex;cursor:pointer">إرفاق الشواهد<input type="file" id="rc-file" multiple accept="${it.k === 'class' ? 'image/*,video/*,application/pdf' : 'image/*'}" hidden></label>`
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
    paint();
  }

  function body() {
    if (ERR) return `<div class="card pad"><p class="rc-err">تعذّر تحميل سجلك: ${e(ERR)}</p><button class="btn sm" data-rc="reload">إعادة المحاولة</button></div>`;
    if (!R) return '<div class="card pad"><p class="muted" style="margin:0">جارٍ تحميل سجلك…</p></div>';
    const L = items();
    if (OPEN) { const it = L.find(i => i.k + ':' + i.id === OPEN); if (it) return page(it); OPEN = null; }
    const done = L.filter(i => i.st[0] === 'done').length, need = L.filter(i => i.st[0] === 'need' || i.st[0] === 'fail');
    const vis = L.filter(i => TAB === 'all' || i.k === TAB);
    return `<div class="card hero th-hero"><div class="grow"><h2>سجل إنجازي</h2><p class="muted">أ. ${e(R.teacher?.name || '')} · الأنشطة الصفية واللاصفية · الفصل الدراسي الأول ١٤٤٨هـ · ${ar(done)} من ${ar(L.length)} تقريرًا صدر</p></div></div>
      ${need.length ? `<div class="warn" style="margin-top:10px"><b>يحتاج منك:</b> ${need.map(i => e(i.title)).join('، ')}</div>` : ''}
      <nav class="rc-tabs">${[['all', 'الكل'], ['class', 'الأنشطة الصفية'], ['nonclass', 'الأنشطة اللاصفية']].map(([k, l]) => `<button data-rct="${k}" aria-pressed="${TAB === k}">${l}</button>`).join('')}</nav>
      <div class="rc-list">${vis.map(i => `<button class="rc-it ${i.st[0]}" data-rco="${i.k}:${e(i.id)}"><div class="rc-h"><b><span class="rc-kind${i.k === 'class' ? '' : ' n'}">${i.k === 'class' ? 'صفية' : 'لاصفية'}</span>${e(i.title)}</b><span class="rc-chip ${i.st[0]}">${i.st[1]}</span></div>
        <div class="rc-d">${hijri(i.from)} إلى ${hijri(i.to)} · ${e(i.sub)} · ${ar(i.ev)} شاهدًا</div></button>`).join('') || '<p class="muted">لا يوجد شيء في هذا القسم.</p>'}</div>`;
  }
  function paint() { const el = document.getElementById('rc-root'); if (el) el.innerHTML = body(); }

  document.addEventListener('click', async ev => {
    const root = document.getElementById('rc-root'); if (!root || !root.contains(ev.target)) return;
    const t = ev.target.closest('[data-rct]'); if (t) { TAB = t.dataset.rct; return paint(); }
    const o = ev.target.closest('[data-rco]'); if (o) { OPEN = o.dataset.rco; paint(); return root.scrollIntoView({ block: 'start' }); }
    const b = ev.target.closest('[data-rc]'); if (!b) return;
    if (b.dataset.rc === 'back') { OPEN = null; return paint(); }
    if (b.dataset.rc === 'reload') { R = null; paint(); return load(); }
    if (b.dataset.rc === 'issue' && !busy) {
      const [k, id] = OPEN.split(':'); busy = true; b.disabled = true; b.textContent = 'جارٍ الإرسال…';
      try { await rpc('act_request_report_by_pid', { p_pid: PID, p_kind: k, p_target: id, p_form: readForm(b.closest('.card')) }); busy = false; await load(); }
      catch (x) { busy = false; b.disabled = false; b.textContent = 'إصدار التقرير'; alert('تعذّر إرسال الطلب: ' + x.message); }
    }
  });

  document.addEventListener('change', ev => {
    if (ev.target.id !== 'rc-file' || !ev.target.files.length || !OPEN) return;
    const it = items().find(i => i.k + ':' + i.id === OPEN), files = [...ev.target.files]; ev.target.value = '';
    if (it) upload(it, files);
  });

  window.REC = { render() { if (!R && !ERR) load(); return CSS + '<div id="rc-root">' + body() + '</div>'; } };
})();
