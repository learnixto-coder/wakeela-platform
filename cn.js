/* «الأنشطة اللاصفية» للمعلمة — بطاقة تنفيذ الفترات اللاصفية لكل أسبوع (طلب المستخدمة 2026-10-19).
   الرئيسية: أسابيع فصلها من جدول الإذاعة أزرارًا + أنشطتها اليدوية + «إنشاء نشاط يدوي».
   صفحة الأسبوع: إن صدر التقرير ← معاينته مباشرة (صورة مصغرة، الحالة، الشواهد، معاينة/تنزيل/تعديل)، وإلا ← بطاقة التنفيذ.
   الخادم: Apps Script NonClass.gs (a=n…) برمز المعلمة. التقرير يُرسم هنا (html2canvas + jsPDF) ويُحفظ بمعرّف ثابت؛ التعديل يحدّث الملف نفسه.
   التكرار: SHA-256 للملف الأصلي + MD5 (مطابق تمامًا) ← لا يُرفع؛ dHash ٢٥٦ بت: المصغّر/المضغوط من الصورة نفسها يُستبعد تلقائيًا،
   والمتشابه فقط يُعرض للمراجعة ولا يُستبعد إلا باختيارها. لا يُحذف شيء من جهازها أو مجلدها (الجلب نسخ). */
window.CN = (() => {
  const AR = s => String(s ?? '').replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const hk = h => (String(h || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).match(/\d+/g) || []).map(Number).join('/');
  const HD = h => { const [y, m, d] = hk(h).split('/'); return d ? AR(d) + '‏/' + AR(m) + '‏/' + AR(y) + 'هـ' : ''; };   // اليوم أقصى اليمين
  const atH = s => { const m = String(s || '').match(/^(\d{4})-(\d\d)-(\d\d)[ T](\d\d):(\d\d)/); if (!m) return AR(s);
    const P = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' }).formatToParts(new Date(Date.UTC(+m[1], m[2] - 1, +m[3]))), g = t => P.find(x => x.type === t).value;
    return HD(g('year') + '/' + g('month') + '/' + g('day')) + ' ' + AR(m[4] + ':' + m[5]); };
  const ORD = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر',
    'الثالث عشر', 'الرابع عشر', 'الخامس عشر', 'السادس عشر', 'السابع عشر', 'الثامن عشر', 'التاسع عشر'];
  const pics = n => !n ? 'لا صور' : n === 1 ? 'صورة واحدة' : n === 2 ? 'صورتان' : n >= 3 && n <= 10 ? AR(n) + ' صور' : AR(n) + ' صورة';
  const n0 = v => Number(v) || DUR;
  const DUR = 15, AUTO = 6, FINE = 0.30, REVIEW = 10;
  // مقيسة على ٢١٨ صورة شواهد حقيقية (2026-10-19): الصورة نفسها بعد تصغير/ضغط شديد ← pHash ≤ ٤ وفرق المربعات ≤ ٠٫٣٤؛
  // بطاقات مختلفة بالقالب نفسه ← pHash ٢–١٠ لكن فرق المربعات ≥ ٠٫٤٠. فالاستبعاد التلقائي يشترط الاثنين معًا (ونسبة الأبعاد نفسها)،
  // وما دون ذلك (pHash ≤ ١٠) يُعرض للمراجعة فقط
  const same = (p, q) => dist(p, q) <= AUTO && Math.abs(p.ar - q.ar) / Math.max(p.ar, q.ar) < 0.02 && fineD(p, q) <= FINE;
  const TEST = () => !!(window.NC_TEST || D.cn.test);   // المعاينة المحلية: الحفظ في مجلد اختبار لا يراه أحد
  const S = { mine: null, mineErr: '', A: null, slot: {}, F: {}, ui: {}, ph: {}, big: {}, busy: '' };
  const FATAL = /غير مصرح|ليس من|غير معروف|غير موجود|تعذّر الوصول إلى المجلد|الرابط|أدخلي|حدّدي|اكتبي|ليس يومًا|غير صالح|أكبر|تُقبل|فقط|غير صحيح|كثيرة/;

  // ───────────── الاتصال بالنظام ─────────────
  async function api(a, x = {}, ms = 120000, tries = 3) {
    let last = 'تعذر الاتصال';
    for (let i = 0; i < tries; i++) {
      try {
        const r = await fetch(D.ct.api, { method: 'POST', signal: AbortSignal.timeout ? AbortSignal.timeout(ms) : undefined, headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ a, tok: D.cn.tok, ...x }) });
        const t = await r.text(); if (t[0] !== '{') throw new Error('رد غير متوقع من النظام');
        const j = JSON.parse(t); if (!j.ok) { last = j.error || 'خطأ'; if (FATAL.test(last)) break; throw new Error(last); }
        return j;
      } catch (e) { last = e.name === 'TimeoutError' ? 'انتهت مهلة الاتصال، أعيدي المحاولة' : e.message; if (FATAL.test(last)) break; await new Promise(o => setTimeout(o, 900 * (i + 1))); }
    }
    throw new Error(last);
  }

  // ───────────── الأسابيع والأنشطة اليدوية ─────────────
  // اسم البرنامج كما في أدلة الوزارة (مكتبة «07 الفترات اللاصفية»، طلب المستخدمة 2026-10-19): عنوان الإذاعة + عنوان أسبوعها،
  // والصلاة «على وقتها — موضوع الأسبوع». أسبوع بلا دليل بعد ← موضوع إذاعة الفصل (تعدّله المعلمة إن شاءت)
  const LIB_R = { 1: 'حياكم — معًا لوطنٍ يسوده العدل والوفاء', 2: 'رحلة نجاح — التخطيط يصنع النجاح', 3: 'سفراء الاستدامة والوعي البيئي — قادة الاستدامة البيئية',
    4: 'صحتي مسؤوليتي — موهبة تُصقل… وهوية نعتز بها', 5: 'الإرث والأمجاد — مسيرة وطن… وطموح جيل', 6: 'الإرث والأمجاد — أمن وطن… وعطاء رجال',
    7: 'صانع الأثر — ما وراء الظواهر الفلكية', 8: 'مهارات المستقبل — الذكاء الاصطناعي.. قدرات وتطبيقات', 9: 'مهارات المستقبل — الإحصاء.. قراءة للواقع',
    10: 'سفراء الاستدامة والوعي البيئي — الغطاء النباتي… ثروة ومسؤولية' };
  const progName = x => x.kind === 'الصلاة' ? (x.prog ? 'على وقتها — ' + x.prog : '') : LIB_R[x.w] || x.prog || x.topic || '';
  function weeks() {
    const m = new Map();
    (D.cn.weeks || []).forEach(x => { const k = x.w + '|' + x.topic;
      if (!m.has(k)) m.set(k, { w: x.w, topic: x.topic, days: (x.days || [x.from, x.to]).filter((v, i, a) => v && a.indexOf(v) === i), radio: '', prayer: '' });
      const o = m.get(k); if (x.kind === 'الصلاة') o.prayer = progName(x); else o.radio = progName(x); });
    return [...m.values()].sort((a, b) => a.w - b.w || (a.days[0] < b.days[0] ? -1 : 1))
      .map((o, i) => ({ ...o, key: 'w' + i, type: 'w', sid: 'w|' + String(o.w).padStart(2, '0') + '|' + o.topic, title: 'الأسبوع ' + (ORD[o.w] || AR(o.w)), sub: o.topic }));
  }
  const manuals = () => (S.mine || []).filter(x => x.sid.startsWith('m|'))
    .map(x => ({ key: 'm' + x.sid.slice(2), type: 'm', sid: x.sid, title: x.name || 'نشاط يدوي', sub: 'نشاط يدوي', days: [], radio: '', prayer: '', mname: x.name }));
  const slotOf = key => weeks().find(x => x.key === key) || manuals().find(x => x.key === key) || null;
  const mineOf = sid => (S.mine || []).find(x => x.sid === sid);
  async function loadMine() {
    S.mineLoading = true;
    try { S.mine = (await api('nmine')).items; S.mineErr = ''; } catch (e) { S.mineErr = e.message; S.mine = S.mine || null; }
    S.mineLoading = false; paint();
  }

  // ───────────── الرسم ─────────────
  function render(a) {
    css();
    return `<div id="ncRoot" data-k="${esc(a || '')}">${body(a || '')}</div>`;
  }
  function paint() {
    const root = document.getElementById('ncRoot'); if (!root) return;
    const y = window.scrollY; root.innerHTML = body(root.dataset.k); bind(root); after(root); window.scrollTo(0, y);
  }
  function body(k) {
    if (!k) return landing();
    if (k === 'new') return newManual();
    if (/^m[0-9a-f]{8}$/.test(k) && !S.mine) { if (!S.mineLoading) loadMine(); return back() + '<div class="card pad"><p class="muted" style="margin:0">جارٍ التحميل…</p></div>'; }
    return weekPage(k);
  }
  const back = () => `<div class="homebar"><button class="btn sm ghost" data-go="cn">→ كل الأسابيع</button></div>`;
  const chip = it => !S.mine ? '<span class="chip s-na">…</span>' : it && it.st && it.st !== 'مسودة'
    ? `<span class="chip s-ok">✓ صدر التقرير${it.ver > 1 ? ' · محدّث' : ''}</span>` : '<span class="chip s-none">لم يصدر التقرير</span>';
  const span = days => days.length ? (days.length === 1 ? HD(days[0]) : `${HD(days[0])} – ${HD(days[days.length - 1])}`) : '';

  function landing() {
    if (!S.mine && !S.mineLoading && !S.mineErr) loadMine();
    const W = weeks(), M = manuals();
    const btn = s => { const it = mineOf(s.sid), days = it && it.days && it.days.length ? it.days : s.days;
      return `<button class="nc-wk" data-go="cn/${s.key}"><span class="nc-wt">${esc(s.title)}</span><span class="nc-ws">${esc(s.sub)}</span>
        <span class="nc-wd">${span(days) || '—'}</span>${chip(it)}</button>`; };
    return `<div class="card hero th-hero"><div class="grow"><h2>الأنشطة اللاصفية</h2><p class="muted">${esc(D.cn.cls)} · بطاقة تنفيذ الفترات اللاصفية (الاصطفاف الصباحي والصلاة) لكل أسبوع من أسابيع فصلك.
      اختاري الأسبوع: ترفقين الشواهد وتصدرين التقرير مرة واحدة، ويبقى محفوظًا.</p></div></div>
    ${S.mineErr ? `<div class="card pad nc-err" style="margin-top:12px">تعذّر جلب حالة التقارير: ${esc(S.mineErr)} <button class="btn sm ghost" data-nc="mine">إعادة المحاولة</button></div>` : ''}
    <div class="nc-wks">${W.map(btn).join('')}${M.map(btn).join('')}
      <button class="nc-wk nc-new" data-go="cn/new"><span class="nc-wt">＋ إنشاء نشاط يدوي</span><span class="nc-ws">إذا استجد نشاط ليس في أسابيعك المحددة</span></button></div>
    ${W.length ? '' : `<p class="muted">لا توجد أسابيع لفصلك (${esc(D.cn.cls)}) في جدول الإذاعة بعد.</p>`}`;
  }
  function newManual() {
    return `${back()}<div class="card pad"><h2 style="margin:0 0 4px">إنشاء نشاط يدوي</h2>
      <p class="muted" style="margin:0 0 10px">لنشاط لاصفي استجد وليس ضمن أسابيعك المحددة. يُنشأ له مجلد شواهد وبطاقة تنفيذ مثل الأسابيع.</p>
      <label class="nc-l">اسم النشاط<input type="text" id="ncMName" maxlength="80" placeholder="مثال: الاحتفاء باليوم العالمي للمعلم"></label>
      <div class="toolbar" style="margin-top:10px"><button class="btn" data-nc="mk">إنشاء النشاط</button><span class="muted" id="ncMsg"></span></div></div>`;
  }

  function weekPage(k) {
    const s = slotOf(k);
    if (!s) return back() + '<div class="card pad"><p class="muted" style="margin:0">هذا النشاط غير موجود.</p></div>';
    const L = S.slot[s.sid];
    const head = `${back()}<div class="card pad nc-head"><div class="nc-t1">بطاقة تنفيذ الفترات اللاصفية بالنشاط الطلابي</div>
      <h2 style="margin:2px 0 0">${esc(s.title)}${s.type === 'w' ? ` — ${esc(s.topic)}` : ''}</h2><p class="muted" style="margin:2px 0 0">${esc(D.cn.cls)} · ${esc(D.cn.name || '')}</p></div>`;
    if (!L) { load(s); return head + '<div class="card pad" style="margin-top:12px"><p class="muted" style="margin:0">جارٍ فتح الأسبوع وجلب الشواهد…</p></div>'; }
    if (L.err) return head + `<div class="card pad nc-err" style="margin-top:12px">تعذّر الفتح: ${esc(L.err)} <button class="btn sm ghost" data-nc="reload">إعادة المحاولة</button></div>`;
    return head + (L.rec && !(S.ui[s.sid] || {}).edit ? preview(s, L) : form(s, L));
  }
  async function load(s) {
    if (S.slot[s.sid] && !S.slot[s.sid].err) return;
    S.slot[s.sid] = null; delete S.slot[s.sid];
    if (load.on === s.sid) return; load.on = s.sid;
    try {
      const [L] = await Promise.all([api('nget', { sid: s.sid }), S.A ? 0 : api('nassets').then(a => { S.A = a; })]);
      S.slot[s.sid] = L; initF(s, L); hashAll(L);
    } catch (e) { S.slot[s.sid] = { err: e.message }; }
    load.on = ''; paint();
  }

  // ───────────── نموذج البطاقة ─────────────
  function initF(s, L) {
    const r = L.rec || L.draft || {};
    S.F[s.sid] = { mname: r.mname || s.mname || '', progs: r.progs ? r.progs.map(p => p.n) : [s.radio, s.prayer],
      days: (r.days && r.days.length ? r.days : s.days).map(hk), took: !!(r.partner && r.partner.took),
      students: r.students ?? D.cn.students ?? '', dur: r.dur ?? DUR, dis: r.dis ?? 0, pcount: r.pcount ?? 0, pnames: r.pnames || '', notes: r.notes || '', ex: new Set(r.ex || []), keep: new Set(r.keep || []) };
  }
  const isImg = f => /^image\//.test(f.m);
  /** تحليل التكرار بين شواهدها: المطابق تمامًا/المصغّر من الصورة نفسها ← مستبعد تلقائيًا؛ المتشابه ← للمراجعة */
  function dups(L, F) {
    const auto = new Map(), pairs = [], I = L.files.filter(isImg);
    for (let j = 0; j < I.length; j++) for (let i = 0; i < j; i++) {
      const a = I[i], b = I[j]; if (auto.has(a.id) || auto.has(b.id) || F.keep.has(a.id + '~' + b.id)) continue;
      if (a.sha && a.sha === b.sha || a.md5 && a.md5 === b.md5) { auto.set(b.id, { of: a, why: 'مطابقة تمامًا' }); continue; }
      const pa = S.ph[a.id], pb = S.ph[b.id]; if (!pa || !pb) continue;
      const d = dist(pa, pb);
      if (same(pa, pb)) auto.set(b.id, { of: a, why: 'نسخة مصغرة أو مضغوطة من الصورة نفسها' });
      else if (d <= REVIEW && !F.ex.has(a.id) && !F.ex.has(b.id)) pairs.push({ a, b, d });
    }
    const ev = I.filter(f => !auto.has(f.id) && !F.ex.has(f.id));
    return { auto, pairs, ev, other: L.files.filter(f => !isImg(f)) };
  }
  function form(s, L) {
    const F = S.F[s.sid], A = S.A || {}, X = dups(L, F), hashing = L.files.some(f => isImg(f) && f.tb && !S.ph[f.id]);
    const dayOpts = cur => { const G = new Map(); (A.cal || []).forEach(r => { if (!G.has(r[0])) G.set(r[0], []); G.get(r[0]).push(r); });
      return [...G].map(([w, R]) => `<optgroup label="الأسبوع ${esc(R[0][1] || AR(w))}">${R.map(r => `<option value="${esc(hk(r[3]))}"${hk(r[3]) === cur ? ' selected' : ''}${r[5] === 'إجازة' ? ' disabled' : ''}>${esc(r[2])} ${HD(r[3])}${r[5] === 'إجازة' ? ' (إجازة)' : ''}</option>`).join('')}</optgroup>`).join(''); };
    const known = new Set((A.cal || []).map(r => hk(r[3])));
    const tile = f => { const au = X.auto.get(f.id), ex = F.ex.has(f.id), cls = au ? ' dup' : ex ? ' off' : '';
      return `<div class="nc-tile${cls}" title="${esc(f.n)}">${f.tb ? `<img alt="" src="data:image/jpeg;base64,${f.tb}" data-nc="zoom" data-id="${esc(f.id)}">` : `<span class="nc-ft">${/pdf/.test(f.m) ? 'PDF' : /video/.test(f.m) ? 'فيديو' : 'ملف'}</span>`}
        ${au ? `<span class="nc-badge">مكررة</span>` : ex ? '<span class="nc-badge">مستبعدة</span>' : ''}
        <div class="nc-tb">${isImg(f) && !au ? `<button data-nc="${ex ? 'inc' : 'exc'}" data-id="${esc(f.id)}" title="${ex ? 'إرجاعها إلى التقرير' : 'استبعادها من التقرير (تبقى في المجلد)'}">${ex ? '↺' : '⊘'}</button>` : ''}<button data-nc="del" data-id="${esc(f.id)}" title="حذف من الشواهد">✕</button></div></div>`; };
    const autoN = X.auto.size;
    return `${L.rec ? `<div class="card pad nc-note" style="margin-top:12px">تعدّلين تقريرًا صادرًا (الإصدار ${AR(L.ver)}). يبقى التقرير الحالي كما هو حتى تضغطي «حفظ وتحديث التقرير»، ثم يُحدَّث الملف نفسه ولا يُنشأ تقرير جديد.
      <button class="btn sm ghost" data-nc="cancel">إلغاء التعديل</button></div>` : ''}
    <div class="card pad nc-form" style="margin-top:12px">
      <div class="nc-sec">١. البرامج</div>
      ${s.type === 'm' ? `<label class="nc-l">اسم النشاط<input type="text" maxlength="80" data-f="mname" value="${esc(F.mname)}"></label>` : ''}
      <div class="nc-two"><label class="nc-l">برنامج الاصطفاف الصباحي (الإذاعة)<input type="text" maxlength="90" data-f="p0" value="${esc(F.progs[0])}" placeholder="${s.type === 'm' ? 'اختياري' : 'اسم برنامج الأسبوع'}"></label>
        <label class="nc-l">برنامج الصلاة<input type="text" maxlength="90" data-f="p1" value="${esc(F.progs[1])}" placeholder="${s.type === 'm' ? 'اختياري' : 'اسم برنامج الأسبوع'}"></label></div>
      ${s.type === 'w' ? `<p class="muted nc-hint">جاهزة من مكتبة النشاط لأسبوعك، وموضوع إذاعة فصلك: <b>${esc(s.topic)}</b>.</p>` : ''}

      <div class="nc-sec">٢. تاريخ التنفيذ</div>
      <div class="nc-days">${F.days.map((h, i) => `<div class="nc-day"><select data-day="${i}">${known.has(h) ? '' : `<option value="${esc(h)}" selected>${HD(h)}</option>`}${dayOpts(h)}</select>
        ${F.days.length > 1 ? `<button class="btn sm ghost" data-nc="dayx" data-i="${i}" title="حذف اليوم">✕</button>` : ''}</div>`).join('') || '<p class="muted nc-hint">لم يُحدَّد يوم بعد.</p>'}</div>
      <button class="btn sm ghost" data-nc="day+">＋ إضافة يوم</button>
      <p class="muted nc-hint">${s.type === 'w' ? 'أُدرجت أيام إذاعة فصلك في هذا الأسبوع تلقائيًا، ويمكنك تعديلها أو إضافة يوم. يُحفظ ما تعدّلينه ويُعتمد في التقرير.' : 'اختاري يوم التنفيذ (ويمكن إضافة أكثر من يوم).'}</p>

      <div class="nc-sec">٣. الشواهد</div>
      <div class="nc-evb"><label class="btn"><input type="file" id="ncUpI" multiple accept="image/*,video/*,application/pdf" hidden>رفع الشواهد</label>
        <button class="btn ghost" data-nc="linkT">ربط مجلد الشواهد</button></div>
      <div id="ncLink" ${(S.ui[s.sid] || {}).link ? '' : 'hidden'} class="nc-link"><label class="nc-l">رابط مجلد الشواهد في Google Drive<input type="url" dir="ltr" id="ncLinkU" placeholder="https://drive.google.com/drive/folders/…" value="${esc(lsGet('nc-link') || '')}"></label>
        <p class="muted nc-hint">يجلب النظام نسخة من الصور والملفات التي في المجلد دفعة واحدة، ولا يحذف شيئًا من مجلدك. يجب أن تكون مشاركة المجلد «أي شخص لديه الرابط».</p>
        <button class="btn sm" data-nc="link">جلب الشواهد من المجلد</button></div>
      <div class="muted nc-msg" id="ncEvMsg">${esc((S.ui[s.sid] || {}).evMsg || '')}</div>
      ${L.files.length ? `<div class="nc-tiles">${L.files.map(tile).join('')}</div>` : '<p class="muted nc-hint">لم تُرفق شواهد بعد.</p>'}
      <p class="muted nc-hint">الشواهد المعتمدة: ${pics(X.ev.length)}${autoN ? ` · استُبعدت ${AR(autoN)} مكررة تلقائيًا` : ''}${F.ex.size ? ` · ${AR([...F.ex].filter(id => L.files.some(f => f.id === id)).length)} استبعدتِها` : ''}${X.other.length ? ` · ${AR(X.other.length)} ملف آخر (PDF/فيديو) في المجلد يظهر عبر رمز QR` : ''}${hashing ? ' · جارٍ فحص التشابه…' : ''}</p>
      ${X.pairs.length ? `<div class="nc-rev"><b>صور متشابهة للمراجعة (${AR(X.pairs.length)})</b><p class="muted nc-hint">قد تكون لقطتين مختلفتين للتنفيذ، فلا تُستبعد إلا باختيارك.</p>
        ${X.pairs.map(p => `<div class="nc-pair"><img alt="" src="data:image/jpeg;base64,${p.a.tb}" data-nc="zoom" data-id="${esc(p.a.id)}"><img alt="" src="data:image/jpeg;base64,${p.b.tb}" data-nc="zoom" data-id="${esc(p.b.id)}">
          <div class="nc-pb"><button class="btn sm" data-nc="exc" data-id="${esc(p.b.id)}">استبعاد الثانية من التقرير</button><button class="btn sm ghost" data-nc="keep" data-k="${esc(p.a.id + '~' + p.b.id)}">إبقاء الاثنتين</button></div></div>`).join('')}</div>` : ''}

      <div class="nc-sec">٤. مدة الفترة اللاصفية</div>
      <div class="nc-dur"><input type="number" min="1" max="120" inputmode="numeric" data-f="dur" value="${esc(F.dur)}" class="nc-num"> <b>دقيقة</b></div>
      <p class="muted nc-hint">${AR(DUR)} دقيقة تلقائيًا، ويمكنك تعديلها إن تغيّر وقت الفترة، فتُحفظ في التقرير.</p>

      <div class="nc-sec">٥. المعلمة المشاركة</div>
      ${D.cn.partner ? `<label class="nc-chk"><input type="checkbox" data-f="took"${F.took ? ' checked' : ''}> <span><b>${esc(D.cn.partner)}</b></span></label>
        <p class="muted nc-hint">حدّديه إن شاركت في التنفيذ فيُكتب اسمها مع اسمك في التقرير، وإلا فلا يُكتب عنها شيء.</p>` : '<p class="muted" style="margin:0">لا توجد معلمة مشاركة لفصلك في التكليف.</p>'}

      <div class="nc-sec">٦. عدد الطالبات المشاركات</div>
      <input type="number" min="0" max="999" inputmode="numeric" data-f="students" value="${esc(F.students)}" class="nc-num">
      <details class="nc-more"${F.dis || F.notes || F.pcount ? ' open' : ''}><summary>حقول اختيارية: ذوات الإعاقة والشراكات والملاحظات</summary>
        <div class="nc-two"><label class="nc-l">منهن من ذوات الإعاقة<input type="number" min="0" max="999" inputmode="numeric" data-f="dis" value="${esc(F.dis)}"></label>
          <label class="nc-l">عدد الشراكات المجتمعية<input type="number" min="0" max="999" inputmode="numeric" data-f="pcount" value="${esc(F.pcount)}"></label></div>
        <label class="nc-l">أسماء الشراكات (إن وُجدت)<input type="text" maxlength="300" data-f="pnames" value="${esc(F.pnames)}" placeholder="مثال: جمعية البر بخميس مشيط"></label>
        <label class="nc-l">ملاحظات (التحديات ـ المقترحات)<textarea maxlength="400" data-f="notes" rows="2">${esc(F.notes)}</textarea></label></details>
    </div>
    <div class="card pad nc-act"><button class="btn" data-nc="save"${S.busy ? ' disabled' : ''}>${L.rec ? 'حفظ وتحديث التقرير' : 'حفظ وإصدار التقرير'}</button>
      <span class="nc-msg" id="ncSaveMsg">${esc(S.busy || (S.ui[s.sid] || {}).saveMsg || '')}</span></div>`;
  }

  // ───────────── المعاينة بعد الإصدار ─────────────
  function preview(s, L) {
    const r = L.rec, F = S.F[s.sid], ids = new Set(r.ev || []), shown = L.files.filter(f => ids.has(f.id));
    const fresh = L.files.filter(f => isImg(f) && !ids.has(f.id) && !(r.ex || []).includes(f.id));
    return `<div class="card pad nc-rep" style="margin-top:12px">
      ${L.thumb ? `<img class="nc-rth" alt="صورة مصغرة للتقرير" src="data:image/jpeg;base64,${L.thumb}" data-nc="open" title="معاينة التقرير">` : ''}
      <div class="grow"><b class="nc-rn">${esc(r.pdf.name.replace(/\.pdf$/i, ''))}</b>
        <div style="margin:4px 0"><span class="chip s-ok">✓ ${esc(L.status || 'صادر')} ومحفوظ</span> <span class="muted" style="font-size:13px">الإصدار ${AR(L.ver)} · آخر حفظ ${atH(r.pdf.at || L.at)}</span></div>
        <div class="muted" style="font-size:13.5px">${span(r.days)} (${r.days.length === 1 ? 'يوم واحد' : r.days.length === 2 ? 'يومان' : r.days.length <= 10 ? AR(r.days.length) + ' أيام' : AR(r.days.length) + ' يومًا'}) · ${AR(r.dur)} دقيقة · ${AR(r.students)} طالبة
          ${r.partner && r.partner.n ? ` · ${esc(r.partner.n)}: ${r.partner.took ? 'شاركت ✓' : 'لم تشارك'}` : ''}</div>
        <div class="nc-mini">${shown.map(f => f.tb ? `<img alt="" src="data:image/jpeg;base64,${f.tb}" data-nc="zoom" data-id="${esc(f.id)}">` : '').join('')}</div>
        <div class="muted" style="font-size:12.5px">الشواهد المعتمدة: ${pics(shown.length)}${(r.ex || []).length ? ` · ${AR(r.ex.length)} مستبعدة (مكررة أو باختيارك)` : ''}</div>
        <div class="toolbar nc-tools"><button class="btn sm" data-nc="open">معاينة التقرير</button><button class="btn sm" data-nc="dl">تنزيل PDF</button>
          <button class="btn sm ghost" data-nc="edit">تعديل البيانات</button><button class="btn sm ghost" data-nc="addev">إضافة شواهد</button></div>
        <span class="nc-msg" id="ncPrevMsg">${esc((S.ui[s.sid] || {}).saveMsg || '')}</span>
      </div></div>
    ${fresh.length ? `<div class="card pad nc-note" style="margin-top:12px">في مجلد الشواهد ${fresh.length === 1 ? 'صورة جديدة لم تدخل' : pics(fresh.length) + ' جديدة لم تدخل'} التقرير بعد. اضغطي «تعديل البيانات» ثم «حفظ وتحديث التقرير» لإضافتها.</div>` : ''}`;
  }

  // ───────────── البصمة البصرية (dHash ٢٥٦ بت) ─────────────
  async function phOf(src) {   // src: Blob أو data URL
    const blob = typeof src === 'string' ? await (await fetch(src)).blob() : src;
    const bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' });
    // pHash: تصغير على مرحلتين إلى ٣٢×٣٢ رمادي ← DCT ← معاملات ٨×٨ المنخفضة (دون الأول) ← ٦٤ بت حول الوسيط
    const k = Math.min(1, 128 / Math.max(bmp.width, bmp.height)), c1 = document.createElement('canvas');
    c1.width = Math.max(32, Math.round(bmp.width * k)); c1.height = Math.max(32, Math.round(bmp.height * k));
    const g1 = c1.getContext('2d'); g1.imageSmoothingQuality = 'high'; g1.drawImage(bmp, 0, 0, c1.width, c1.height);
    const ar = bmp.width / bmp.height; bmp.close && bmp.close();
    const c2 = document.createElement('canvas'); c2.width = c2.height = 32;
    const g2 = c2.getContext('2d'); g2.imageSmoothingQuality = 'high'; g2.drawImage(c1, 0, 0, 32, 32);
    const p = g2.getImageData(0, 0, 32, 32).data, G = new Float64Array(1024);
    for (let i = 0; i < 1024; i++) G[i] = p[i * 4] * 0.299 + p[i * 4 + 1] * 0.587 + p[i * 4 + 2] * 0.114;
    const C = phOf.cos ||= Float64Array.from({ length: 256 }, (_, i) => Math.cos((2 * (i % 32) + 1) * Math.floor(i / 32) * Math.PI / 64));   // [u][x], u<8
    const R = new Float64Array(32 * 8);   // صفوف: لكل y، المعاملات u<8
    for (let y = 0; y < 32; y++) for (let u = 0; u < 8; u++) { let s = 0; for (let x = 0; x < 32; x++) s += G[y * 32 + x] * C[u * 32 + x]; R[y * 8 + u] = s; }
    const V = [];
    for (let v = 0; v < 8; v++) for (let u = 0; u < 8; u++) { let s = 0; for (let y = 0; y < 32; y++) s += R[y * 8 + u] * C[v * 32 + y]; V.push(s); }
    const med = V.slice(1).sort((a, b) => a - b)[31], bits = new Uint8Array(64);
    for (let i = 1; i < 64; i++) bits[i] = V[i] > med ? 1 : 0;
    // فحص أدق للتطابق: ١٢٨×١٢٨ رمادي موحّد (متوسط ٠ وانحراف ١) من الصورة نفسها قبل التصغير الكبير؛ يُقارن كل مربع ١٦×١٦ على حدة،
    // فاسم مختلف في زاوية شهادة بالقالب نفسه يكفي لعدّهما صورتين مختلفتين
    const c3 = document.createElement('canvas'); c3.width = c3.height = 128;
    const g3 = c3.getContext('2d'); g3.imageSmoothingQuality = 'high'; g3.drawImage(c1, 0, 0, 128, 128);
    const q = g3.getImageData(0, 0, 128, 128).data, N = 16384, fine = new Float32Array(N); let m = 0, v = 0;
    for (let i = 0; i < N; i++) { fine[i] = q[i * 4] * 0.299 + q[i * 4 + 1] * 0.587 + q[i * 4 + 2] * 0.114; m += fine[i]; }
    m /= N; for (let i = 0; i < N; i++) v += (fine[i] - m) ** 2; const sd = Math.sqrt(v / N) || 1;
    for (let i = 0; i < N; i++) fine[i] = (fine[i] - m) / sd;
    return { bits, ar, fine };
  }
  const dist = (a, b) => { let n = 0; for (let i = 0; i < 64; i++) n += a.bits[i] !== b.bits[i]; return n; };
  /** أكبر فرق متوسط بين مربعين متقابلين (٨×٨ مربعات): صغير جدًا للصورة نفسها بعد التصغير/الضغط، وكبير إن اختلف جزء منها */
  const fineD = (a, b) => { let worst = 0;
    for (let by = 0; by < 8; by++) for (let bx = 0; bx < 8; bx++) { let s = 0;
      for (let y = by * 16; y < by * 16 + 16; y++) for (let x = bx * 16; x < bx * 16 + 16; x++) s += Math.abs(a.fine[y * 128 + x] - b.fine[y * 128 + x]);
      worst = Math.max(worst, s / 256); }
    return worst; };
  async function hashAll(L) {
    for (const f of L.files) if (isImg(f) && f.tb && !S.ph[f.id]) { try { S.ph[f.id] = await phOf('data:image/jpeg;base64,' + f.tb); } catch { } }
    paint();
  }
  const sha256 = async buf => [...new Uint8Array(await crypto.subtle.digest('SHA-256', buf))].map(b => b.toString(16).padStart(2, '0')).join('');
  async function tinyB64(blob) {   // مصغرة محلية (٢٢٠ بكسل) للعرض والبصمة قبل أن يعيدها النظام
    const bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' }), k = Math.min(1, 220 / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k); c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height); bmp.close && bmp.close();
    return c.toDataURL('image/jpeg', 0.8).split(',')[1];
  }
  /** هل الصورة الجديدة مكررة لشاهد موجود؟ ← { of, why } أو null؛ أو متشابهة ← { near } */
  function matchOf(L, sha, ph) {
    for (const f of L.files) { if (sha && f.sha === sha) return { of: f, why: 'مطابقة تمامًا' }; }
    if (!ph) return null;
    let near = null;
    for (const f of L.files) { const q = S.ph[f.id]; if (!q) continue; const d = dist(ph, q);
      if (same(ph, q)) return { of: f, why: 'نسخة مصغرة أو مضغوطة من صورة موجودة' };
      if (d <= REVIEW) near = f; }
    return near ? { near } : null;
  }

  // ───────────── الرفع والجلب ─────────────
  const b64Of = blob => new Promise((o, x) => { const fr = new FileReader(); fr.onload = () => o(String(fr.result).split(',')[1]); fr.onerror = x; fr.readAsDataURL(blob); });
  function evMsg(s, t, err) { (S.ui[s.sid] ||= {}).evMsg = t; const m = document.getElementById('ncEvMsg'); if (m) { m.textContent = t; m.style.color = err ? 'var(--none)' : ''; } }
  async function upload(s, files) {
    const L = S.slot[s.sid]; let ok = 0, dup = 0, near = 0; const errs = [];
    for (const [k, f0] of files.entries()) {
      evMsg(s, `جارٍ فحص ورفع ${AR(k + 1)} من ${AR(files.length)}…`);
      try {
        if (!/^(image|video)\/|^application\/pdf$/.test(f0.type)) throw new Error('تُقبل الصور والفيديو وملفات PDF فقط');
        const sha = await sha256(await f0.arrayBuffer());
        let ph = null, tb = '';
        if (/^image\//.test(f0.type)) { try { ph = await phOf(f0); tb = await tinyB64(f0); } catch { } }
        const m = matchOf(L, sha, ph);
        if (m && m.of) { dup++; continue; }   // مكررة: لا تُرفع، والأصل في جهازها لا يُمس
        const f = /^image\//.test(f0.type) ? await shrinkImage(f0) : f0;
        if (f.size > 25 * 1048576) throw new Error('الملف أكبر من ٢٥ م.ب');
        const uid = (TEST() ? 'nctest' : 'nc') + (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Date.now() + '' + k).slice(0, 30);
        const j = await api('nput', { sid: s.sid, uid, name: f.name, mime: f.type || 'image/jpeg', b64: await b64Of(f), sha }, f.size > 3e6 ? 240000 : 90000);
        if (j.dup) { dup++; continue; }
        const nf_ = { ...j.file, tb }; L.files.push(nf_); if (ph) S.ph[nf_.id] = ph; ok++; if (m && m.near) near++;
      } catch (e) { errs.push(`«${f0.name}»: ${e.message}`); }
    }
    evMsg(s, [ok ? `أُضيف ${AR(ok)}` : '', dup ? `استُبعد ${AR(dup)} مكرر ولم يُرفع (الملف نفسه أو نسخة منه)` : '', near ? `${AR(near)} متشابهة تظهر للمراجعة` : '', errs.length ? 'تعذّر: ' + errs.join('، ') : ''].filter(Boolean).join(' · ') || 'لم يُضف شيء', !!errs.length);
    paint();
  }
  async function linkFolder(s, url) {
    const L = S.slot[s.sid]; lsSet('nc-link', url);
    evMsg(s, 'جارٍ قراءة المجلد…');
    const j = await api('nlink', { sid: s.sid, url }, 180000, 2);
    const items = j.items || []; let dup = items.filter(x => x.dup).length;
    const todo = [], local = [];
    for (const it of items.filter(x => !x.dup)) {
      let ph = null; if (/^image\//.test(it.m) && it.tb) { try { ph = await phOf('data:image/jpeg;base64,' + it.tb); } catch { } }
      const m = matchOf({ files: L.files.concat(local) }, '', ph) || (ph && local.some(o => o.ph && same(o.ph, ph)) ? { of: 1 } : null);
      if (m && m.of) { dup++; continue; }
      todo.push(it); local.push({ ...it, ph });
    }
    if (!todo.length) { evMsg(s, items.length ? `كل ما في المجلد (${AR(items.length)}) موجود مسبقًا في شواهدك — لم يُجلب شيء` : 'المجلد لا يحوي صورًا أو ملفات PDF أو فيديو'); return; }
    let ok = 0; const errs = [];
    for (let i = 0; i < todo.length; i += 10) {
      evMsg(s, `جارٍ جلب ${AR(Math.min(i + 10, todo.length))} من ${AR(todo.length)}…`);
      const part = todo.slice(i, i + 10), r = await api('nimport', { sid: s.sid, src: j.src.id, rk: j.src.rk, ids: part.map(x => x.id) }, 240000, 2);
      (r.added || []).forEach(f => { const it = local.find(x => x.id === f.src) || {}; f.tb = it.tb || ''; L.files.push(f); if (it.ph) S.ph[f.id] = it.ph; ok++; });
      dup += (r.dups || []).length; (r.errors || []).forEach(e => errs.push((e.n ? '«' + e.n + '» ' : '') + e.e));
    }
    evMsg(s, [`جُلب ${AR(ok)} من مجلد «${j.src.name}»`, dup ? `استُبعد ${AR(dup)} مكرر` : '', errs.length ? 'تعذّر: ' + errs.slice(0, 3).join('، ') : ''].filter(Boolean).join(' · '), !!errs.length);
    paint();
  }

  // ───────────── التقرير: رسم A4 ثم PDF ─────────────
  let libs = null;
  const script = src => new Promise((ok, no) => { const x = document.createElement('script'); x.src = src; x.onload = ok; x.onerror = () => no(new Error('تعذّر تحميل أداة إنشاء PDF')); document.head.append(x); });
  const pdfLibs = () => libs ||= Promise.all([window.html2canvas ? 0 : script('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
    window.jspdf ? 0 : script('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')]).catch(e => { libs = null; throw e; });
  async function cardFont() {
    if (!document.getElementById('ncFont')) { const l = document.createElement('link'); l.id = 'ncFont'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&display=swap'; document.head.append(l);
      await new Promise(o => { l.onload = o; l.onerror = o; setTimeout(o, 6000); }); }
    try { await Promise.all(['400', '700'].map(w => document.fonts.load(w + ' 18px "Noto Naskh Arabic"'))); } catch { }
  }
  const toData = async url => { const b = await (await fetch(url)).blob(); return 'data:' + b.type + ';base64,' + await b64Of(b); };
  async function bigs(s, ids) {   // صور الشواهد بحجم مناسب للطباعة (٩٠٠ بكسل) — من النظام، ١٢ في الطلب
    const need = ids.filter(id => !S.big[id]);
    for (let i = 0; i < need.length; i += 12) { const r = await api('nthumbs', { sid: s.sid, ids: need.slice(i, i + 12), sz: 900 }, 180000);
      Object.entries(r.th || {}).forEach(([id, v]) => { S.big[id] = 'data:' + (v.m || 'image/jpeg') + ';base64,' + v.b64; }); }
    return ids.map(id => S.big[id]).filter(Boolean);
  }
  const ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const words = n => { n = Number(n); if (!n) return 'لا يوجد'; if (n >= 100) return AR(n); if (n < 20) return ONES[n]; const o = n % 10, t = Math.floor(n / 10); return o ? ONES[o] + ' و' + TENS[t] : TENS[t]; };
  const girls = n => { n = Number(n); return !n ? 'لا يوجد' : words(n) + (n >= 3 && n <= 10 ? ' طالبات' : ' طالبة'); };
  const calOf = h => (S.A.cal || []).find(r => hk(r[3]) === hk(h));
  const box = (on, t) => `<span><i class="box${on ? ' on' : ''}"></i>${esc(t)}</span>`;
  const dayCell = h => { const c = calOf(h); return `<div class="dates"><div><span class="k">اليوم:</span>${esc(c ? c[2] : '')}</div><div><span class="k">الأسبوع:</span>${esc(c ? String(c[1]).replace(/^الأسبوع\s+/, '') : '')}</div><div><span class="k">التاريخ:</span>${HD(h)}</div></div>`; };

  function pageCard(s, F, X, photo, qr, logo) {
    const A = S.A, P = F.progs, took = !!(D.cn.partner && F.took), days = F.days.slice().sort((a, b) => (S.A.cal || []).indexOf(calOf(a)) - (S.A.cal || []).indexOf(calOf(b)));
    const progA = P[0] ? P[0] + (s.type === 'w' ? ' (موضوع الإذاعة: ' + s.topic + ')' : '') : '', progB = P[1];
    const prog = s.type === 'm' && !P[0] && !P[1] ? `<div>${esc(F.mname)}</div>` : `<div class="stack sm"><div><span class="k">الاصطفاف الصباحي:</span>${esc(progA || '—')}</div><div><span class="k">الصلاة:</span>${esc(progB || '—')}</div></div>`;
    const sig = src => src ? `<img src="${src}" alt="">` : '';
    return `<div class="ncp">
      <div class="s-head"><div class="s-org">المملكة العربية السعودية<br>وزارة التعليم<br>الإدارة العامة للتعليم بمنطقة عسير<br>مدرسة ${esc(A.school || '')}</div><img class="s-logo" src="${logo}" alt=""></div>
      <div class="s-title">بطاقة تنفيذ الفترات اللاصفية بالنشاط الطلابي</div>
      <table class="s-tab">
        <tr class="kind"><td class="l">نوع الفترة اللاصفية</td><td><div class="kinds">${box(!!P[0] || s.type === 'w', 'الاصطفاف الصباحي')}${box(false, 'الفسحة')}${box(!!P[1] || s.type === 'w', 'الصلاة')}</div></td></tr>
        <tr><td class="l">اسم البرنامج</td><td>${prog}</td></tr>
        <tr><td class="l">مدة الفترة اللاصفية</td><td>${AR(n0(F.dur))} دقيقة</td></tr>
        <tr><td class="l">الفصل الدراسي</td><td>${esc(A.sem || 'الفصل الدراسي الأول')} <span class="k" style="margin-right:18px">الفصل:</span>${esc(AR(D.cn.cls))}</td></tr>
        <tr><td class="l">بداية التنفيذ</td><td>${dayCell(days[0])}</td></tr>
        <tr><td class="l">نهاية التنفيذ</td><td>${dayCell(days[days.length - 1])}</td></tr>
        <tr><td class="l">أيام التنفيذ</td><td class="sm">${days.map(h => { const c = calOf(h); return esc(c ? c[2] : '') + ' ' + HD(h); }).join('، ')}</td></tr>
        <tr><td class="l">${took ? 'المعلمتان المنفذتان' : 'المعلمة المنفذة'}</td><td>${took ? `<div class="dates halves"><div>${esc(D.cn.name)}</div><div>${esc(D.cn.partner)}</div></div>` : esc(D.cn.name)}</td></tr>
        <tr><td class="l">عدد الطالبات المشاركات</td><td>${girls(F.students)}</td></tr>
        <tr><td class="l" style="font-size:15.5px">عدد الطالبات المشاركات<br>من ذوي الإعاقة</td><td>${girls(F.dis)}</td></tr>
        <tr><td class="l" style="font-size:15.5px">ملاحظات (التحديات ـ المقترحات)</td><td class="tall multi">${esc(AR(F.notes))}</td></tr>
        <tr><td class="l">الشواهد</td><td class="tall"><div class="ev">${photo ? `<img class="ncph" src="${photo.src}" style="width:${photo.w}px;height:${photo.h}px" alt="">` : '<span></span>'}
          <span class="ncqrb"><img class="ncqr" src="${qr}" alt=""><span class="nccap">امسحي الرمز<br>لعرض الشواهد</span></span></div></td></tr>
      </table>
      <div class="s-sign">
        <div class="b"><b>المعلمة المنفذة:</b> ${esc(D.cn.name)}<br><b>التاريخ:</b> ${HD(days[days.length - 1])}<br><b>التوقيع/</b><div class="sig">${sig(A.sig)}</div></div>
        <div class="stamp"><span class="lab">الختم</span><div class="ell${A.stamp ? ' has' : ''}">${A.stamp ? `<img src="${A.stamp}" alt="">` : ''}</div></div>
        <div class="b"><b>رائدة النشاط:</b> ${esc(A.leader || '')}<br><b>التاريخ:</b> ${HD(days[days.length - 1])}<br><b>التوقيع/</b><div class="sig">${sig(A.leaderSig)}</div></div>
        ${took ? `<div class="b partner"><b>المعلمة المنفذة:</b> ${esc(D.cn.partner)}<br><b>التاريخ:</b> ${HD(days[days.length - 1])}<br><b>التوقيع/</b><div class="sig">${sig(A.partnerSig)}</div></div>` : ''}
        <div class="b principal"><b>مدير المدرسة:</b> ${esc(A.principal || '')}<br><b>التوقيع/</b><div class="sig">${sig(A.principalSig)}</div></div>
      </div>
      <div class="s-note">• يتم تعبئة هذه البطاقة عند استكمال المدة المخصصة للفترة اللاصفية وفق ما ورد في دليل الخطط الدراسية / الإصدار الخامس.</div>
      <div class="s-bar">WWW.MOE.GOV.SA</div></div>`;
  }
  function pageAnnex(s, imgs, n, of) {
    return `<div class="ncp annex"><div class="a-head"><b>ملحق صور الشواهد</b> — ${esc(s.title)}${s.type === 'w' ? ' — ' + esc(s.topic) : ''} · ${esc(AR(D.cn.cls))} · ${esc(D.cn.name)}<span>صفحة ${AR(n)} من ${AR(of)}</span></div>
      <div class="a-grid">${imgs.map(i => `<div class="a-cell"><img src="${i.src}" style="width:${i.w}px;height:${i.h}px" alt=""></div>`).join('')}</div><div class="s-bar">WWW.MOE.GOV.SA</div></div>`;
  }
  const fit = (src, W, H) => new Promise(o => { const im = new Image(); im.onload = () => { const k = Math.min(W / im.naturalWidth, H / im.naturalHeight); o({ src, w: Math.round(im.naturalWidth * k), h: Math.round(im.naturalHeight * k) }); }; im.onerror = () => o(null); im.src = src; });
  async function makePdf(s, L, F, X, say) {
    say('جارٍ تجهيز أدوات التقرير…'); await Promise.all([pdfLibs(), cardFont(), loadQr()]);
    say('جارٍ تجهيز صور الشواهد…');
    const big = await bigs(s, X.ev.slice(0, 1).map(f => f.id));   // صورة واحدة في خانة الشواهد (لا ملحق صور)
    const logo = await toData('moe-logo.png').catch(() => '');
    const q = qrcode(0, 'M'); q.addData(L.folder); q.make(); const qr = q.createDataURL(6, 2);
    const cardPh = big[0] ? await fit(big[0], 300, 118) : null, pages = [pageCard(s, F, X, cardPh, qr, logo)];
    const host = document.createElement('div'); host.className = 'ncs'; host.style.cssText = 'position:fixed;top:0;right:-4000px;width:794px;z-index:-1';
    host.innerHTML = pages.join(''); document.body.append(host);
    try {
      await Promise.all([...host.querySelectorAll('img')].map(im => im.decode ? im.decode().catch(() => { }) : 0));
      // إن طال المحتوى (أسماء طويلة، أيام كثيرة) تتقلص المقاسات معًا حتى يبقى الختم والتواقيع داخل الصفحة
      const card = host.querySelector('.ncp'), sign = card.querySelector('.s-sign');
      for (const k of [1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7]) { card.style.setProperty('--k', k); if (sign.getBoundingClientRect().bottom - card.getBoundingClientRect().top <= 1123 - 62) break; }
      const doc = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true }); let thumb = '';
      const sheets = [...host.querySelectorAll('.ncp')];
      for (const [k, el] of sheets.entries()) {
        say(`جارٍ إنشاء التقرير… صفحة ${AR(k + 1)} من ${AR(sheets.length)}`);
        const cv = await window.html2canvas(el, { scale: k ? 1.6 : 2.2, backgroundColor: '#ffffff', width: 794, height: 1123, windowWidth: 1200, useCORS: true, logging: false });
        if (k) doc.addPage();
        doc.addImage(cv.toDataURL('image/jpeg', 0.86), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        if (!k) { const t = document.createElement('canvas'); t.width = 240; t.height = Math.round(240 * cv.height / cv.width); t.getContext('2d').drawImage(cv, 0, 0, t.width, t.height); thumb = t.toDataURL('image/jpeg', 0.72).split(',')[1]; }
      }
      return { b64: doc.output('datauristring').split(',')[1], thumb };
    } finally { host.remove(); }
  }
  async function save(s) {
    const L = S.slot[s.sid], F = S.F[s.sid], X = dups(L, F), msg = t => { S.busy = t; const m = document.getElementById('ncSaveMsg'); if (m) { m.textContent = t; m.style.color = ''; } };
    const n = v => v === '' || v == null ? NaN : Number(v);
    const miss = [];
    if (s.type === 'm' && F.mname.trim().length < 2) miss.push('اسم النشاط');
    if (!F.progs[0].trim() && !F.progs[1].trim() && s.type === 'w') miss.push('اسم البرنامج');
    if (!F.days.length) miss.push('يوم التنفيذ');
    if (!(Number.isInteger(n(F.dur)) && n(F.dur) >= 1 && n(F.dur) <= 120)) miss.push('مدة الفترة (١–١٢٠ دقيقة)');
    if (!(Number.isInteger(n(F.students)) && n(F.students) >= 0 && n(F.students) < 1000)) miss.push('عدد الطالبات المشاركات');
    if (!(Number.isInteger(n(F.dis || 0)) && n(F.dis || 0) >= 0)) miss.push('عدد ذوات الإعاقة');
    if (!(Number.isInteger(n(F.pcount || 0)) && n(F.pcount || 0) >= 0)) miss.push('عدد الشراكات');
    else if (n(F.pcount || 0) > 0 && !(F.pnames || '').trim()) miss.push('أسماء الشراكات');
    if (!X.ev.length && !X.other.length) miss.push('شاهد واحد على الأقل');
    if (miss.length) { const m = document.getElementById('ncSaveMsg'); if (m) { m.textContent = 'أكملي: ' + miss.join('، '); m.style.color = 'var(--none)'; } return; }
    const btn = document.querySelector('[data-nc="save"]'); if (btn) btn.disabled = true;
    try {
      const pdf = await makePdf(s, L, F, X, msg);
      msg(L.rec ? 'جارٍ تحديث التقرير المحفوظ…' : 'جارٍ حفظ التقرير…');
      const ex = [...new Set([...F.ex, ...X.auto.keys()])].filter(id => L.files.some(f => f.id === id));
      const data = { mname: F.mname, progs: F.progs.map(n => ({ n })), days: F.days, dur: n(F.dur), partner: { took: !!F.took }, students: n(F.students), dis: n(F.dis || 0), pcount: n(F.pcount || 0), pnames: (F.pnames || '').trim(), notes: F.notes,
        ev: X.ev.map(f => f.id), ex, keep: [...F.keep], ...(TEST() && { test: true }) };
      const r = await api('nsave', { sid: s.sid, data, pdf: pdf.b64, thumb: pdf.thumb }, 300000, 1);   // طلب واحد (الخادم يقفل ويحدّث الملف نفسه عند الإعادة)
      Object.assign(L, { rec: r.rec, status: r.status, ver: r.ver, thumb: r.thumb, at: r.rec.pdf.at });
      S.ui[s.sid] = { saveMsg: r.updated ? `✓ حُدِّث التقرير المحفوظ (الإصدار ${AR(r.ver)}) — الملف نفسه، دون نسخة جديدة` : '✓ صدر التقرير وحُفظ. يظهر هنا كلما فتحتِ الأسبوع.' };
      const it = mineOf(s.sid); if (it) Object.assign(it, { st: r.status, ver: r.ver, days: r.rec.days }); else if (S.mine) S.mine.push({ sid: s.sid, st: r.status, ver: r.ver, days: r.rec.days, name: r.rec.mname || '' });
      S.busy = ''; paint();
    } catch (e) { S.busy = ''; if (btn) btn.disabled = false; const m = document.getElementById('ncSaveMsg'); if (m) { m.textContent = 'تعذّر الحفظ: ' + e.message; m.style.color = 'var(--none)'; } }
  }
  async function openPdf(s, download) {
    const L = S.slot[s.sid], w = download ? null : window.open('', '_blank');
    if (w) w.document.write('<p dir="rtl" style="font-family:sans-serif;padding:20px">جارٍ فتح التقرير…</p>');
    try {
      const j = await api('nfile', { sid: s.sid, id: L.rec.pdf.id }, 120000);
      const bin = atob(j.b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([u8], { type: 'application/pdf' }));
      if (w) w.location.href = url; else { const a = document.createElement('a'); a.href = url; a.download = j.n; document.body.append(a); a.click(); a.remove(); }
      setTimeout(() => URL.revokeObjectURL(url), 180000);
    } catch (e) { if (w) w.close(); alert('تعذّر فتح التقرير: ' + e.message); }
  }
  async function zoom(s, id) {
    const L = S.slot[s.sid], f = L && L.files.find(x => x.id === id); if (!f) return;
    const lb = document.createElement('div'); lb.className = 'nc-lb'; lb.innerHTML = `<div class="nc-lbb"><img alt="" src="data:image/jpeg;base64,${f.tb || ''}"><div class="nc-lbc">${esc(f.n)} <button class="btn sm ghost">إغلاق</button></div></div>`;
    lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('button')) lb.remove(); }); document.body.append(lb);
    try { if (!S.big[id]) await bigs(s, [id]); const im = lb.querySelector('img'); if (S.big[id] && im) im.src = S.big[id]; } catch { }
  }

  // ───────────── الأحداث ─────────────
  const cur = () => { const root = document.getElementById('ncRoot'); return root ? slotOf(root.dataset.k) : null; };
  document.addEventListener('click', async ev => {
    const b = ev.target.closest('[data-nc]'); if (!b || !document.getElementById('ncRoot')) return;
    const a = b.dataset.nc, s = cur(), F = s && S.F[s.sid], L = s && S.slot[s.sid];
    if (a === 'mine') { S.mineErr = ''; return loadMine(); }
    if (a === 'mk') { const name = (document.getElementById('ncMName').value || '').trim(), m = document.getElementById('ncMsg');
      if (name.length < 2) { m.textContent = 'اكتبي اسم النشاط'; return; } b.disabled = true; m.textContent = 'جارٍ الإنشاء…';
      try { const j = await api('nmanual', { name }, 90000, 1); (S.mine ||= []).push({ sid: j.sid, st: 'مسودة', ver: 0, name, days: [] }); go('cn/m' + j.sid.slice(2)); }
      catch (e) { m.textContent = 'تعذّر: ' + e.message; b.disabled = false; } return; }
    if (!s) return;
    if (a === 'reload') { delete S.slot[s.sid]; return paint(); }
    if (a === 'zoom') return zoom(s, b.dataset.id);
    if (a === 'open' || a === 'dl') return openPdf(s, a === 'dl');
    if (a === 'edit' || a === 'addev') { S.ui[s.sid] = { edit: true }; initF(s, L); paint(); if (a === 'addev') document.getElementById('ncUpI')?.closest('.nc-evb')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (a === 'cancel') { S.ui[s.sid] = {}; initF(s, L); return paint(); }
    if (a === 'save') return save(s);
    if (a === 'linkT') { (S.ui[s.sid] ||= {}).link = !(S.ui[s.sid].link); return paint(); }
    if (a === 'link') { const u = (document.getElementById('ncLinkU').value || '').trim(); if (!u) return evMsg(s, 'ضعي رابط المجلد أولًا', true);
      b.disabled = true; try { await linkFolder(s, u); } catch (e) { evMsg(s, e.message, true); } b.disabled = false; return; }
    if (!F) return;
    if (a === 'day+') { const C = (S.A.cal || []).filter(r => r[5] !== 'إجازة'), last = F.days[F.days.length - 1], i = C.findIndex(r => hk(r[3]) === last);
      const nx = C.slice(i + 1).find(r => !F.days.includes(hk(r[3]))) || C.find(r => !F.days.includes(hk(r[3]))); if (nx) F.days.push(hk(nx[3])); return paint(); }
    if (a === 'dayx') { F.days.splice(+b.dataset.i, 1); return paint(); }
    if (a === 'exc') { F.ex.add(b.dataset.id); return paint(); }
    if (a === 'inc') { F.ex.delete(b.dataset.id); return paint(); }
    if (a === 'keep') { F.keep.add(b.dataset.k); return paint(); }
    if (a === 'del') { if (!confirm('حذف هذا الشاهد من مجلد الشواهد؟ (ينتقل إلى سلة المحذوفات، ولا يُحذف من جهازك أو مجلدك)')) return;
      b.disabled = true; try { await api('ndel', { sid: s.sid, id: b.dataset.id }, 90000, 2); L.files = L.files.filter(f => f.id !== b.dataset.id); F.ex.delete(b.dataset.id); paint(); }
      catch (e) { alert('تعذّر الحذف: ' + e.message); b.disabled = false; } }
  });
  document.addEventListener('change', ev => {
    if (!document.getElementById('ncRoot')) return;
    const s = cur(), F = s && S.F[s.sid]; if (!F) return;
    const t = ev.target;
    if (t.id === 'ncUpI' && t.files.length) { const files = [...t.files]; t.value = ''; return upload(s, files); }
    if (t.dataset.day != null) { const v = t.value; if (F.days.includes(v) && F.days.indexOf(v) !== +t.dataset.day) { alert('هذا اليوم مضاف مسبقًا'); return paint(); } F.days[+t.dataset.day] = v; return paint(); }
    if (t.dataset.f === 'took') { F.took = t.checked; return; }
  });
  document.addEventListener('input', ev => {
    if (!document.getElementById('ncRoot')) return;
    const s = cur(), F = s && S.F[s.sid], t = ev.target, k = t.dataset && t.dataset.f; if (!F || !k) return;
    if (k === 'p0' || k === 'p1') F.progs[+k[1]] = t.value; else if (k !== 'took') F[k] = t.value;
  });
  const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { } };
  function after() { }

  // ───────────── التنسيق (الواجهة + صفحة البطاقة كما في PeriodsForm) ─────────────
  function css() {
    if (document.getElementById('ncCss')) return;
    const st = document.createElement('style'); st.id = 'ncCss';
    st.textContent = `
.nc-wks{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;margin-top:12px}
.nc-wk{display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:right;background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:16px;cursor:pointer;box-shadow:var(--shadow);min-height:118px}
.nc-wk:hover{border-color:var(--brand)}.nc-wt{font-weight:700;font-size:17px}.nc-ws{color:var(--muted);font-size:14px}.nc-wd{font-size:13px;color:var(--ink)}
.nc-new{border-style:dashed;background:var(--soft);justify-content:center}
.nc-head .nc-t1{font-size:13px;color:var(--muted);font-weight:600}
.nc-sec{font-weight:700;color:var(--brand);margin:16px 0 6px;padding-bottom:4px;border-bottom:1px solid var(--line)}.nc-sec:first-child{margin-top:0}
.nc-l{display:block;font-size:13.5px;color:var(--muted);margin:6px 0}.nc-l input,.nc-l textarea,.nc-day select,.nc-num{display:block;width:100%;margin-top:4px;padding:9px 11px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink);font:inherit;font-size:15px}
.nc-num{max-width:160px}.nc-dur{display:flex;gap:8px;align-items:center}.nc-dur .nc-num{margin:0;width:110px}.nc-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:560px){.nc-two{grid-template-columns:1fr}}
.nc-hint{font-size:12.5px;margin:4px 0 0}.nc-days{display:flex;flex-direction:column;gap:6px;margin-bottom:6px}.nc-day{display:flex;gap:6px;align-items:center}.nc-day select{margin:0;flex:1;min-width:0}
.nc-evb{display:flex;gap:8px;flex-wrap:wrap}.nc-evb label.btn{cursor:pointer}.nc-link{margin-top:8px;padding:10px;border:1px dashed var(--line);border-radius:10px}
.nc-msg{font-size:13px;margin-top:6px;display:block}
.nc-tiles{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.nc-tile{position:relative;width:64px;height:64px;border-radius:8px;overflow:hidden;border:1px solid var(--line);background:var(--soft);display:grid;place-items:center}
.nc-tile img{width:100%;height:100%;object-fit:cover;cursor:zoom-in}.nc-tile.off img,.nc-tile.dup img{opacity:.35}.nc-ft{font-size:11px;color:var(--muted)}
.nc-badge{position:absolute;bottom:0;right:0;left:0;background:#000a;color:#fff;font-size:10px;text-align:center}
.nc-tb{position:absolute;top:2px;left:2px;display:flex;gap:2px}.nc-tb button{width:20px;height:20px;border-radius:6px;border:0;background:#000b;color:#fff;font-size:11px;line-height:20px;padding:0;cursor:pointer}
.nc-rev{margin-top:10px;padding:10px;border-radius:10px;background:var(--part-bg);color:var(--ink)}.nc-pair{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:8px}
.nc-pair img{width:64px;height:64px;object-fit:cover;border-radius:8px;cursor:zoom-in}.nc-pb{display:flex;gap:6px;flex-wrap:wrap}
.nc-chk{display:flex;gap:8px;align-items:center;font-size:15px}.nc-chk input{width:20px;height:20px}
.nc-more{margin-top:10px}.nc-more summary{cursor:pointer;color:var(--muted);font-size:13.5px}
.nc-act{margin-top:12px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;position:sticky;bottom:0;z-index:3}.nc-act .nc-msg{margin:0}
.nc-note{background:var(--part-bg)}.nc-err{color:var(--none)}
.nc-rep{display:flex;gap:14px;align-items:flex-start}.nc-rth{width:84px;border:1px solid var(--line);border-radius:6px;cursor:zoom-in;flex:none;background:#fff}
.nc-rn{display:block;font-size:14.5px;line-height:1.5}.nc-mini{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0 4px}.nc-mini img{width:36px;height:36px;object-fit:cover;border-radius:6px;cursor:zoom-in;border:1px solid var(--line)}
.nc-tools{margin:10px 0 0;display:flex;gap:6px;flex-wrap:wrap}
@media(max-width:480px){.nc-rep{flex-direction:column}.nc-rth{width:110px}}
.nc-lb{position:fixed;inset:0;background:#000c;z-index:50;display:grid;place-items:center;padding:16px}.nc-lbb{max-width:min(96vw,900px);background:var(--card);border-radius:12px;padding:8px}
.nc-lbb img{display:block;max-width:100%;max-height:78vh;margin:0 auto;border-radius:6px}.nc-lbc{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 4px 0;font-size:13px;color:var(--muted)}
/* صفحة البطاقة A4 (خارج الشاشة عند إنشاء PDF) — ألوان القالب الرسمي */
.ncs{--green:#00B050;--row1:#C5E0B3;--row2:#E2EFD9;--lbl:#1F3864;--val:#003845;--line:#7f8f86;color-scheme:light}
.ncs .ncp{width:794px;max-width:none;max-height:none;border-radius:0;height:1123px;--k:1;background:#fff;position:relative;font-family:"Noto Naskh Arabic","Sakkal Majalla","Traditional Arabic",serif;color:var(--val);padding:34px 42px 0;direction:rtl;overflow:hidden;box-sizing:border-box}
.ncs *{box-sizing:border-box}
.ncs .s-head{display:flex;justify-content:space-between;align-items:flex-start}.ncs .s-org{font-size:14px;font-weight:700;line-height:1.75;color:#000}.ncs .s-logo{height:84px}
.ncs .s-title{text-align:center;font-size:25px;font-weight:700;color:var(--val);margin:0 0 12px}
.ncs table.s-tab{width:100%;border-collapse:collapse;table-layout:fixed}
.ncs .s-tab td{border:1px solid var(--line);padding:calc(3px * var(--k)) 10px;height:calc(38px * var(--k));vertical-align:middle;font-size:calc(16px * var(--k));line-height:1.4}
.ncs .s-tab td.l{width:27%;background:var(--green);color:var(--lbl);font-weight:700;text-align:center;font-size:calc(16px * var(--k));line-height:1.3}
.ncs .s-tab tr:nth-child(even) td:not(.l){background:var(--row1)}.ncs .s-tab tr:nth-child(odd) td:not(.l){background:var(--row2)}
.ncs .s-tab tr.kind td{background:var(--green)!important;color:var(--lbl);font-weight:700}.ncs .s-tab td.sm,.ncs .s-tab td .sm{font-size:calc(14.5px * var(--k))}.ncs .stack>div+div{margin-top:2px}
.ncs .kinds{display:flex;justify-content:space-around;font-size:18px}.ncs .kinds span{white-space:nowrap}
.ncs .box{display:inline-block;width:15px;height:15px;border:1.6px solid var(--lbl);background:#fff;margin-left:6px;vertical-align:-2px;position:relative}
.ncs .box.on::after{content:"";position:absolute;left:3.5px;top:0;width:5px;height:9px;border:solid var(--lbl);border-width:0 2.4px 2.4px 0;transform:rotate(45deg)}
.ncs .dates{display:flex}.ncs .dates>div{flex:1;padding:0 4px}.ncs .dates>div+div{border-right:1px solid var(--line);padding-right:10px}
.ncs .k{color:var(--lbl);font-weight:600;margin-left:4px}.ncs .multi{white-space:pre-wrap;line-height:1.55}.ncs .s-tab td.tall{height:calc(64px * var(--k))}
.ncs b.yes{color:#0b6b2e}.ncs b.no{color:#9b1c1c}
.ncs .ev{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px}.ncs .ev img.ncph{grid-column:1;justify-self:start;border:1px solid var(--line)}
.ncs .ev .ncqrb{grid-column:2;display:flex;align-items:center;gap:10px}.ncs .ev img.ncqr{width:88px;height:88px}.ncs .ev .nccap{font-size:13px;color:var(--lbl);line-height:1.5}
.ncs .s-sign{display:grid;grid-template-columns:1fr 1fr 1fr;margin-top:10px;font-size:15px;color:#000}.ncs .s-sign .b{line-height:1.55}
.ncs .s-sign .sig{height:48px;display:flex;align-items:center}.ncs .s-sign .sig img{max-height:46px;max-width:190px}
.ncs .stamp{display:flex;flex-direction:column;align-items:center}.ncs .stamp .lab{font-size:11px;color:#445}
.ncs .stamp .ell{width:200px;height:96px;border:1.5px solid #4472C4;border-radius:50%;margin-top:2px}.ncs .stamp .ell.has{border-color:transparent;display:flex;align-items:center;justify-content:center;height:auto;min-height:96px}
.ncs .stamp .ell img{max-width:170px;max-height:118px;transform:rotate(-4deg)}
.ncs .principal{grid-column:3;grid-row:2;margin-top:2px}.ncs .s-sign .partner{grid-column:1;grid-row:2;margin-top:2px}
.ncs .s-note{position:absolute;bottom:34px;right:42px;left:42px;font-size:12.5px;color:#333}
.ncs .s-bar{position:absolute;bottom:0;right:0;left:0;height:26px;border-radius:26px 0 0 0;background:linear-gradient(90deg,#3a82be,#46a69a 55%,#55bb7a);color:#fff;font:600 10px/26px Tahoma,sans-serif;letter-spacing:2px;text-align:center;direction:ltr}
.ncs .a-head{display:flex;justify-content:space-between;gap:10px;font-size:15px;color:var(--lbl);border-bottom:2px solid var(--green);padding-bottom:8px;margin-bottom:14px}.ncs .a-head span{font-size:13px;color:#555;white-space:nowrap}
.ncs .a-grid{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:300px;gap:14px}.ncs .a-cell{border:1px solid #c9d3cc;border-radius:6px;display:flex;align-items:center;justify-content:center;background:#fafcfa}
`;
    document.head.append(st);
  }
  // للاختبار المحلي فقط: نفس الدوال دون واجهة
  return { render, _t: { phOf, dist, fineD, dups, weeks, S, pdfLibs, cardFont } };
})();
