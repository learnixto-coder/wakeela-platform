// نسخة مطابقة داخل site/att.js (أولها) — أي تعديل هنا يُنسخ هناك
/* قراءة ملف «تقرير الحضور» من Teams (UTF-16، أعمدة مفصولة بـ Tab، أقسام: 1. الملخص / 2. المشاركون / 3. الأنشطة داخل الاجتماع).
   يعمل في المتصفح وفي Node. يعيد: العنوان، البداية والنهاية، والمشاركات (بلا المنظم) مع أول دخول ومجموع المدة بالثواني. */
(function (root) {
  const dec = buf => { const u = new Uint8Array(buf);
    if (u[0] === 0xFF && u[1] === 0xFE) return new TextDecoder('utf-16le').decode(u.subarray(2));
    if (u[0] === 0xFE && u[1] === 0xFF) return new TextDecoder('utf-16be').decode(u.subarray(2));
    return new TextDecoder('utf-8').decode(u).replace(/^\uFEFF/, ''); };
  // «9/17/26, 10:39:35 AM» → Date (محلي)
  const when = s => { const m = String(s).match(/(\d+)\/(\d+)\/(\d+),?\s+(\d+):(\d+)(?::(\d+))?\s*(AM|PM|ص|م)?/i); if (!m) return null;
    let [, mo, d, y, h, mi, se, ap] = m; y = +y < 100 ? 2000 + +y : +y; h = +h; if (/PM|م/i.test(ap || '') && h < 12) h += 12; if (/AM|ص/i.test(ap || '') && h === 12) h = 0;
    return new Date(y, mo - 1, +d, h, +mi, +(se || 0)); };
  const secs = s => { let t = 0; String(s).replace(/(\d+)\s*(س|د|ث|h|m|s)/g, (_, n, u) => { t += +n * ({ س: 3600, h: 3600, د: 60, m: 60, ث: 1, s: 1 }[u]); }); return t; };
  function parse(buf) {
    const L = dec(buf).split(/\r?\n/).map(l => l.split('\t').map(x => x.trim()));
    const sum = {}, people = new Map(); let sec = 0, head = null;
    for (const r of L) {
      if (/^\d\.\s/.test(r[0]) && r.length === 1) { sec = +r[0][0]; head = null; continue; }
      if (!r[0]) continue;
      if (sec === 1) { sum[r[0]] = r[1]; continue; }
      if (sec === 2 || sec === 3) {
        if (!head) { head = r; continue; }
        const o = Object.fromEntries(head.map((h, i) => [h, r[i] || '']));
        const name = o['الاسم'], role = o['الدور'] || '', mail = (o['البريد الإلكتروني'] || '').toLowerCase();
        if (sec === 2) people.set(mail || name, { name, mail, role, first: when(o['وقت الانضمام الأول']), last: when(o['وقت المغادرة الأخير']), dur: secs(o['مدة الاجتماع']), parts: 0 });
        else { const p = people.get(mail || name); if (p) { if (!p.parts) p.dur = 0; p.parts++; p.dur += secs(o['المدة']); } }
      }
    }
    const start = when(sum['وقت البدء']), end = when(sum['وقت الانتهاء']);
    const all = [...people.values()];
    return { title: sum['عنوان الاجتماع'] || '', start, end, organizer: (all.find(p => /المنظم|organizer/i.test(p.role)) || {}).name || '',
      students: all.filter(p => !/المنظم|organizer|مقدم|presenter/i.test(p.role) && !/^t\d/i.test(p.mail)) };
  }
  // التصنيف: حاضرة / متأخرة (دخلت بعد البداية بأكثر من LATE دقائق) / دخول لحظات (أقل من MIN دقائق كلها) — قيم قابلة للتعديل
  function classify(R, opt = {}) { const LATE = (opt.late ?? 10) * 60, MIN = (opt.min ?? 5) * 60;
    return R.students.map(p => ({ ...p, kind: p.dur < MIN ? 'flash' : p.first && R.start && (p.first - R.start) / 1000 > LATE ? 'late' : 'present' })); }
  root.TEAMS = { parse, classify };
})(typeof window !== 'undefined' ? window : globalThis);
/* «حضور حصص التيمز» (2026-10-26): المعلمة ترفع ملفات «تقرير الحضور» من Teams، ومسؤولة الغياب (أ. سالمة العماري) والوكيلة
   تتابعان الاكتمال وتطبعان «تقرير الغياب على مستوى حصة» لكل فصل (نموذج الوزارة). تُحمَّل عند أول فتح مثل cn.js.
   D.att = { mode: 'teacher' | 'admin', tt: جدول الحصص (keys/att/timetable.json؛ للمعلمة صفها وحدها)، roster: {"<الصف>-<الفصل>": [الأسماء]}،
             days: {"YYYY-MM-DD": {"<اسم المعلمة في الجدول>": [{file, r: ملف Teams مقروءًا (TEAMS.parse)}]}}، phones، url }
   القواعد كلها هنا (لا في tools/export.js): رقم الحصة من وقت البداية، الفصل من أسماء الطالبات، متأخرة بعد ١٠ دقائق،
   ومن مجموع حضورها أقل من ٥ دقائق «دخول لحظات» = غائبة. المطابقة تتسامح في الهمزات والتاء المربوطة والاسم الأوسط. */
(() => {
  const AR = '٠١٢٣٤٥٦٧٨٩', ad = n => String(n).replace(/\d/g, d => AR[d]);
  const GR = ['', 'الأول', 'الثاني', 'الثالث'], cls = (g, s) => `${GR[g]} متوسط ${ad(s)}`, ck = (g, s) => g + '-' + s;
  const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const gd = iso => new Date(iso + 'T12:00:00');
  const hijT = iso => { const P = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(gd(iso)), v = t => P.find(x => x.type === t).value;
    return `${ad(v('day'))}/${ad(v('month'))}/${ad(v('year'))}هـ`; };
  const hij = iso => `<span dir="rtl">${hijT(iso)}</span>`;
  const wday = iso => gd(iso).getDay();   // 0 = الأحد … 4 = الخميس
  const isoOf = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = () => isoOf(new Date());
  const hm = d => d ? `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}` : '';
  // أوقات الحصص عن بعد (من المستخدمة 2026-10-26): ٤٠ دقيقة وبينها ٥ دقائق، ح١ ٧:٠٠ … ح٧ ١١:٣٠–١٢:١٠
  const BELL = ['7:00', '7:45', '8:30', '9:15', '10:00', '10:45', '11:30'], BELL_END = ['7:40', '8:25', '9:10', '9:55', '10:40', '11:25', '12:10'],
    slot = p => `${ad(BELL[p - 1])} – ${ad(BELL_END[p - 1])}`, mins = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const periodAt = d => { const t = d.getHours() * 60 + d.getMinutes(); if (t < mins(BELL[0]) - 15 || t > mins('12:10')) return 0;
    let p = 1; BELL.forEach((b, i) => { if (t >= mins(b) - 10) p = i + 1; }); return p; };
  const wa = (phone, text) => `https://wa.me/966${String(phone).replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(text)}`;
  const chipOf = (ok, txt) => `<span class="chip s-${ok ? 'ok' : 'none'}">${txt}</span>`;
  const short = n => String(n).replace(/^أ\.\s*/, '');

  // --- مطابقة الأسماء: اسم Teams ← اسم في قائمة الفصل
  const norm = s => String(s).replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/[٠-٩]/g, c => AR.indexOf(c)).replace(/\(.*?\)|[^؀-ۿa-z0-9 ]/gi, ' ').replace(/\s+/g, ' ').trim();
  const toks = s => norm(s).split(' ').filter(w => !['بن', 'ابن', 'بنت', 'ال'].includes(w)).map(w => w.replace(/^ال(?=..)/, ''));
  const MC = new Map();
  function matcher(names) {
    if (MC.has(names)) return MC.get(names);
    const R = names.map(n => ({ n, t: toks(n), f: norm(n) }));
    const m = raw => {
      const f = norm(raw), t = toks(raw); if (!t.length) return null;
      let h = R.filter(r => r.f === f); if (h.length === 1) return h[0].n;
      // الاسم الأول + اسم العائلة (Teams يكتب غالبًا «دانه القحطاني»)
      h = R.filter(r => r.t[0] === t[0] && (t.length < 2 || r.t[r.t.length - 1] === t[t.length - 1])); if (h.length === 1) return h[0].n;
      h = R.filter(r => r.t[0] === t[0] && t.slice(1).every(w => r.t.includes(w))); if (h.length === 1) return h[0].n;
      // الاسم الأول وحده إذا لم يتكرر في الفصل (Teams: «نجلاء الشهراني»، نور: «نجلاء عبدالله سعيد …»)
      h = R.filter(r => r.t[0] === t[0]); if (h.length === 1) return h[0].n;
      return null;
    };
    MC.set(names, m); return m;
  }

  // --- ملف Teams مقروءًا ← حصة: {p, g, s, subj, file, start, end, present, late, flash}
  // رقم الحصة: ملفات كل فصل بترتيب وقت بدايتها ← حصص المعلمة لذلك الفصل في الجدول بالتتابع (المستخدمة 2026-10-26:
  // قد يبدأ الاجتماع متأخرًا عن الجرس، مثل ابتسام الاثنين ح١ وح٢ وملفاها ٧:٥٠ و٨:٣٩). وقت الجرس (ح١ ٧:٠٠–٧:٤٠) يرجّح فقط
  // أي حصة هي حين ترفع المعلمة ملفات أقل من حصص الفصل؛ فصل ليس في جدولها ذلك اليوم يبقى على وقت الجرس
  function assign(ttT, iso, L) {
    const exp = ttT ? (ttT.days[wday(iso)] || []) : [], by = {};
    L.forEach(f => { if (f.p0 === undefined) f.p0 = f.p; f.p = f.p0; (by[ck(f.g, f.s)] ||= []).push(f); });
    for (const [k, fs] of Object.entries(by)) {
      const ps = exp.map((c, i) => c && ck(c.g, c.s) === k ? i + 1 : 0).filter(Boolean); if (!ps.length) continue;
      fs.sort((a, b) => (a.t0 || 0) - (b.t0 || 0));
      // مطابقة تحفظ الترتيب بأقل بعد عن وقت الجرس؛ ملف زائد عن حصص الفصل يبقى على وقت الجرس
      const n = fs.length, m = ps.length, SKIP = 100, cost = (f, p) => f.p0 ? Math.abs(f.p0 - p) : 0;
      const D = [...Array(n + 1)].map(() => Array(m + 1).fill(Infinity)); D[0].fill(0);
      for (let i = 1; i <= n; i++) for (let j = 0; j <= m; j++)
        D[i][j] = Math.min(D[i - 1][j] + SKIP, j ? D[i][j - 1] : Infinity, j ? D[i - 1][j - 1] + cost(fs[i - 1], ps[j - 1]) : Infinity);
      for (let i = n, j = m; i > 0;) {
        if (j && D[i][j] === D[i][j - 1]) j--;
        else if (j && D[i][j] === D[i - 1][j - 1] + cost(fs[i - 1], ps[j - 1])) { fs[i - 1].p = ps[j - 1]; i--; j--; }
        else i--;
      }
    }
    return L;
  }
  function lessonOf(A, r, file) {
    const R = { ...r, start: r.start && new Date(r.start), end: r.end && new Date(r.end), students: (r.students || []).map(x => ({ ...x, first: x.first && new Date(x.first) })) };
    const C = TEAMS.classify(R), iso = R.start ? isoOf(R.start) : '';
    let best = null; for (const k of Object.keys(A.roster)) { const m = matcher(A.roster[k]), n = C.filter(x => m(x.name)).length; if (!best || n > best.n) best = { k, n }; }
    const [g, s] = best && best.n >= Math.min(3, C.length) && best.n > 0 ? best.k.split('-').map(Number) : [0, 0];
    const p = R.start ? periodAt(R.start) : 0;
    return { iso, p, p0: p, t0: R.start ? R.start.getTime() : 0, g, s, subj: R.title || '', file, start: hm(R.start), end: hm(R.end),
      present: C.filter(x => x.kind === 'present').map(x => x.name), late: C.filter(x => x.kind === 'late').map(x => ({ n: x.name, t: hm(x.first) })),
      flash: C.filter(x => x.kind === 'flash').map(x => ({ n: x.name, d: Math.round(x.dur) + 'ث' })) };
  }
  // مرة واحدة لكل تحميل: كل ملف مقروء ← حصة
  function ready(A) {
    if (A.__ok) return; A.__ok = 1;
    for (const [iso, byT] of Object.entries(A.days || {})) for (const [nm, list] of Object.entries(byT)) {
      byT[nm] = assign(A.tt.teachers.find(t => t.name === nm), iso, list.map(x => x.r ? lessonOf(A, x.r, x.file) : x));
    }
    if (A.mode === 'teacher') sentLocal(A);
  }
  // تقرير حصة: الحاضرات والغائبات بأسماء قائمة الفصل
  function lesson(A, x) {
    const names = A.roster[ck(x.g, x.s)] || [], m = matcher(names), got = new Map(), un = [];
    const take = (raw, kind, extra) => { const n = m(raw); if (n) { if (!got.has(n) || kind === 'present') got.set(n, { kind, extra }); } else un.push({ raw, kind, extra }); };
    (x.present || []).forEach(n => take(n, 'present')); (x.late || []).forEach(o => take(o.n, 'late', o.t)); (x.flash || []).forEach(o => take(o.n, 'flash', o.d));
    const here = names.filter(n => got.has(n) && got.get(n).kind !== 'flash');
    const absent = names.filter(n => !here.includes(n)).map(n => ({ n, flash: got.has(n) ? got.get(n).extra || true : null }));
    return { names, here, late: names.filter(n => got.get(n)?.kind === 'late'), absent, un, pct: names.length ? Math.round(here.length / names.length * 100) : null };
  }

  // --- اليوم: المتوقع من الجدول مقابل المرفوع
  function dayModel(A, iso) {
    const w = wday(iso), up = (A.days || {})[iso] || {};
    const T = A.tt.teachers.filter(t => t.name).map(t => {
      const exp = (t.days[w] || []).map((c, i) => c && { p: i + 1, ...c }).filter(Boolean), got = up[t.name] || [], used = new Set();
      const pick = e => { const x = got.find(x => !used.has(x) && x.p === e.p && x.g === e.g && x.s === e.s) || got.find(x => !used.has(x) && x.p === e.p)
        || got.find(x => !used.has(x) && x.g === e.g && x.s === e.s && !exp.some(o => o.p === x.p)); if (x) used.add(x); return x; };
      const cells = exp.map(e => ({ ...e, f: pick(e) })), extra = got.filter(x => !used.has(x));
      return { t, exp, cells, extra, sent: cells.filter(c => c.f).length };
    }).filter(r => r.exp.length || r.extra.length);
    const need = T.reduce((a, r) => a + r.exp.length, 0), sent = T.reduce((a, r) => a + r.sent, 0);
    return { iso, w, T, need, sent, done: T.filter(r => r.sent === r.exp.length).length };
  }
  // أيام الدراسة عن بعد = الأيام التي وصلت فيها ملفات، واليوم إن كان يوم دراسة
  const daysOf = A => [...new Set([...Object.keys(A.days || {}), ...(wday(today()) <= 4 ? [today()] : [])])].filter(d => wday(d) <= 4).sort().reverse();
  // اختيار اليوم: قائمة منسدلة + السابق/التالي (قد تصل الأيام إلى ٣٠ يومًا وأكثر)
  const dayNav = (days, iso) => { if (days.length < 2) return ''; const i = days.indexOf(iso), older = days[i + 1], newer = days[i - 1];
    return `<div class="at-nav"><button class="btn sm ghost" ${older ? `data-go="att/d/${older}"` : 'disabled'}>→ اليوم السابق</button>
      <select data-attday>${days.map(d => `<option value="${d}"${d === iso ? ' selected' : ''}>${DAYS[wday(d)]} ${hijT(d)}${d === today() ? ' (اليوم)' : ''}</option>`).join('')}</select>
      <button class="btn sm ghost" ${newer ? `data-go="att/d/${newer}"` : 'disabled'}>اليوم التالي ←</button></div>`; };

  // --- متابعة اليوم (مسؤولة الغياب والوكيلة)
  function home(A, sel) {
    const days = daysOf(A), iso = sel && /^\d{4}-\d\d-\d\d$/.test(sel) ? sel : days[0] || today();
    if (wday(iso) > 4) return dayNav(days, iso) + '<div class="empty card">هذا اليوم ليس يوم دراسة.</div>';
    const M = dayModel(A, iso), all = M.done === M.T.length && M.T.length;
    const remind = r => { const ph = (A.phones || {})[r.t.name]; if (!ph || r.sent === r.exp.length) return '';
      const miss = r.cells.filter(c => !c.f).map(c => `ح${ad(c.p)} (${cls(c.g, c.s)})`).join('، ');
      return ` <a class="btn sm ghost" target="_blank" rel="noopener" href="${wa(ph, `السلام عليكم أ. ${short(r.t.name)}\nنأمل رفع ملفات حضور حصص التيمز ليوم ${DAYS[M.w]} ${hijT(iso)}:\n${miss}\nمن المنصة ← «توثيق حصص التيمز»${A.url ? '\n' + A.url : ''}`)}">تذكير واتساب</a>`; };
    return `<div class="card hero th-hero"><div class="grow"><h2>حضور حصص التيمز — ${DAYS[M.w]} ${hij(iso)}</h2>
        <p class="muted">${ad(M.done)} من ${ad(M.T.length)} معلمة أكملت · ${ad(M.sent)} من ${ad(M.need)} حصة وصل ملفها</p></div>
        <div>${all ? chipOf(1, 'اكتملت المعلمات') : chipOf(0, `ناقص ${ad(M.need - M.sent)} حصة`)}</div></div>
      ${dayNav(days, iso)}
      <div class="card pad at-act"><div><b>تقرير الغياب على مستوى حصة</b><div class="muted" style="font-size:13px">لكل فصل: الطالبات × حصص اليوم${all ? '' : ' — يمكن إعداده الآن، والحصص التي لم يصل ملفها تظهر مخططة'}</div></div>
        <span><button class="btn" data-go="att/r/${iso}">إعداد تقارير الفصول ←</button> <button class="btn ghost" data-go="attr">تقارير كل الأيام</button></span></div>
      <div class="card at-wrap"><table class="at-t"><thead><tr><th>المعلمة</th>${[1, 2, 3, 4, 5, 6, 7].map(p => `<th>ح${ad(p)}</th>`).join('')}<th>الحالة</th></tr></thead><tbody>
      ${M.T.slice().sort((a, b) => (a.sent === a.exp.length) - (b.sent === b.exp.length) || a.t.name.localeCompare(b.t.name, 'ar')).map(r => `<tr>
        <td class="nm">${esc(short(r.t.name))}</td>
        ${[1, 2, 3, 4, 5, 6, 7].map(p => { const c = r.cells.find(x => x.p === p);
          return c ? `<td class="${c.f ? 'ok' : 'miss'}" title="${c.f ? esc(c.f.subj || c.f.file || '') : 'لم يصل الملف'}">${ad(c.s)}/${ad(c.g)}<i>${c.f ? '✓' : '—'}</i></td>` : '<td class="no"></td>'; }).join('')}
        <td>${chipOf(r.sent === r.exp.length, `${ad(r.sent)}/${ad(r.exp.length)}`)}${r.extra.length ? ` <span class="chip s-part">+${ad(r.extra.length)} خارج الجدول</span>` : ''}${remind(r)}</td></tr>`).join('')}
      </tbody></table></div>
      <p class="muted" style="font-size:12.5px;margin:8px 4px">الخانة كما في الجدول الورقي: الرقم الأيمن = الصف، والأيسر = الفصل · ✓ وصل الملف · — لم يصل · <a href="#att/tt">مراجعة جدول الحصص</a></p>`;
  }

  // --- «تقارير الغياب»: كل الأيام
  function allReports(A) {
    const days = daysOf(A).filter(d => (A.days || {})[d]);
    return `<div class="card hero th-hero"><div class="grow"><h2>تقارير الغياب</h2><p class="muted">تقرير الغياب على مستوى حصة لكل يوم دراسة عن بعد · ${ad(days.length)} ${days.length > 2 && days.length < 11 ? 'أيام' : 'يومًا'}</p></div></div>
      ${days.length ? `<div class="card at-wrap"><table class="at-t"><thead><tr><th>اليوم</th><th>الحصص</th><th>المعلمات</th><th></th></tr></thead><tbody>${days.map(d => { const M = dayModel(A, d);
        return `<tr><td class="nm">${DAYS[wday(d)]} ${hij(d)}</td><td>${chipOf(M.sent === M.need, `${ad(M.sent)} من ${ad(M.need)}`)}</td><td>${ad(M.done)} من ${ad(M.T.length)} أكملت</td>
          <td><button class="btn sm" data-go="att/r/${d}">فتح التقرير</button> <button class="btn sm ghost" data-go="att/d/${d}">المتابعة</button></td></tr>`; }).join('')}</tbody></table></div>`
        : '<div class="empty card">لم تصل ملفات حضور بعد</div>'}`;
  }

  // --- تقارير الفصول: نموذج الوزارة «تقرير الغياب على مستوى حصة» (مجلد «رصد الغياب منصة التيمز»): لكل فصل صفحة،
  // الطالبات × ح١–ح٧: غ = غياب، ت = تأخير. حصة في الجدول لم يصل ملفها: خانة مخططة؛ لا حصة: فارغة.
  const GRN = ['', 'الأول المتوسط', 'الثاني المتوسط', 'الثالث المتوسط'];
  function classReports(A, iso) {
    const M = dayModel(A, iso), C = {};
    M.T.forEach(r => { r.cells.forEach(c => (C[ck(c.g, c.s)] ||= []).push({ p: c.p, t: r.t.name, f: c.f }));
      r.extra.forEach(f => f.g && (C[ck(f.g, f.s)] ||= []).push({ p: f.p || 0, t: r.t.name, f })); });
    return Object.keys(A.roster).sort().filter(k => C[k]).map(k => { const [g, s] = k.split('-').map(Number);
      return { k, g, s, names: A.roster[k], rows: C[k].map(x => ({ ...x, L: x.f ? lesson(A, { ...x.f, g, s }) : null })) }; });
  }
  function officialPage(c, iso, logo) {
    const P = [1, 2, 3, 4, 5, 6, 7].map(p => c.rows.find(r => r.p === p && r.L) || c.rows.find(r => r.p === p) || null);
    const mark = (n, x) => !x ? '<td></td>' : !x.L ? '<td class="nf"></td>' : x.L.absent.some(o => o.n === n) ? '<td class="g">غ</td>' : x.L.late.includes(n) ? '<td class="t">ت</td>' : '<td></td>';
    const un = [...new Set(c.rows.flatMap(r => r.L ? r.L.un.map(u => u.raw) : []))];
    return `<section class="of">
      <div class="of-h"><div class="of-r">المملكة العربية السعودية<br>وزارة التعليم<br>الإدارة العامة للتعليم بمنطقة عسير<br>المتوسطة الحادية والعشرون بالخميس</div>
        <img src="${logo}" alt="وزارة التعليم">
        <div class="of-l"><span>الصف</span>: ${GRN[c.g]}<br><span>القسم</span>: التعليم العام<br><span>الفصل</span>: ${ad(c.s)}<br><span>النظام الدراسي</span>: منتظم<br><span>العام</span>: ١٤٤٧-١٤٤٨</div></div>
      <h3 class="of-t">تقرير الغياب على مستوى حصة</h3>
      <table class="of-g"><thead><tr><th rowspan="3" class="m">م</th><th rowspan="3" class="nm">اسم الطالبة</th><th colspan="7">اليوم</th></tr>
        <tr><th colspan="7">${DAYS[wday(iso)]} ${hij(iso)}</th></tr>
        <tr>${P.map((x, i) => `<th${x && !x.L ? ' class="nf"' : ''}>ح${ad(i + 1)}${x && x.f && x.f.subj ? `<small class="of-sj">${esc(x.f.subj)}</small>` : ''}</th>`).join('')}</tr></thead>
      <tbody>${c.names.map((n, i) => `<tr><td class="m">${ad(i + 1)}</td><td class="nm">${esc(n)}</td>${P.map(x => mark(n, x)).join('')}</tr>`).join('')}</tbody></table>
      <div class="of-k"><span><b>ت</b> تعني تأخير</span><span><b>غ</b> تعني غياب بدون عذر</span><span><b>ع</b> تعني غياب بعذر</span>
        ${P.some(x => x && !x.L) ? '<span><i class="nfk"></i> حصة لم يصل ملف حضورها</span>' : ''}</div>
      ${un.length ? `<div class="of-u">أسماء في ملفات Teams لم تُطابق قائمة الفصل: ${un.map(esc).join('، ')}</div>` : ''}
      <div class="of-s">مدير المدرسة<br><b>أمينة حسين مشيط آل مشيط</b></div>
    </section>`;
  }
  function reports(A, iso) {
    if (!/^\d{4}-\d\d-\d\d$/.test(iso || '')) return allReports(A);
    const R = classReports(A, iso), M = dayModel(A, iso), logo = new URL('moe-logo.png', location.href).href;
    window.__attPrint = () => { const w = window.open('', '_blank'); if (!w) return;
      w.document.write(`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>تقرير الغياب على مستوى حصة ${hijT(iso)}</title><style>${OCSS}@page{size:A4 landscape;margin:8mm}body{margin:0;font-family:Tahoma,Arial,sans-serif}.of{page-break-after:always}</style>
        <body>${R.map(c => officialPage(c, iso, logo)).join('')}</body></html>`);
      w.document.close(); let done = 0; const pr = () => { if (!done++) w.print(); }; w.onload = pr; setTimeout(pr, 1500); };
    return `<button class="back" data-go="att/d/${iso}">→ متابعة اليوم</button>
      <div class="card hero th-hero"><div class="grow"><h2>تقرير الغياب على مستوى حصة — ${DAYS[wday(iso)]} ${hij(iso)}</h2>
        <p class="muted">${ad(R.length)} فصول · ${M.sent === M.need ? 'وصلت كل الحصص' : `ناقص ${ad(M.need - M.sent)} حصة (مخططة في التقرير)`}</p></div>
        <button class="btn" onclick="__attPrint()">طباعة / حفظ PDF</button></div>
      ${R.length ? R.map(c => `<div class="card pad at-of">${officialPage(c, iso, logo)}</div>`).join('') : '<div class="empty card">لم تصل ملفات حضور لهذا اليوم</div>'}`;
  }

  function timetable(A) {
    const K = {}; A.tt.teachers.forEach(t => t.days.forEach((d, w) => d.forEach((c, p) => { if (c) { const k = [w, p, c.g, c.s].join(); K[k] = (K[k] || 0) + 1; } })));
    const clash = (w, p, c) => K[[w, p, c.g, c.s].join()] > 1, nC = Object.values(K).filter(n => n > 1).length;
    return `<button class="back" data-go="att">→ متابعة اليوم</button>
      <div class="card hero th-hero"><div class="grow"><h2>جدول الحصص</h2><p class="muted">منقول من صورة الجدول المدرسي · الخانة كما في الورقة: الأيمن = الصف، الأيسر = الفصل · <b style="color:#b45309">؟</b> = غير واضح في الصورة · <span style="background:#fdecec;padding:0 6px;border-radius:6px">أحمر</span> = معلمتان في الفصل نفسه والحصة نفسها (${ad(nC)})، يحتاج تأكيدًا</p></div></div>
      ${DAYS.slice(0, 5).map((d, w) => `<h3 class="hub-h">${d}</h3><div class="card at-wrap"><table class="at-t"><thead><tr><th>المعلمة</th>${[1, 2, 3, 4, 5, 6, 7].map(p => `<th>ح${ad(p)}</th>`).join('')}</tr></thead><tbody>
        ${A.tt.teachers.map(t => `<tr><td class="nm">${esc(t.name ? short(t.name) : t.label)}${t.unsure || !t.name ? ' <b style="color:#b45309">؟</b>' : ''}</td>
          ${t.days[w].map((c, p) => c ? `<td class="tt${clash(w, p, c) ? ' miss' : ''}">${ad(c.s)}/${ad(c.g)}${c.q ? '<b style="color:#b45309">؟</b>' : ''}</td>` : '<td class="no"></td>').join('')}</tr>`).join('')}
      </tbody></table></div>`).join('')}`;
  }

  // --- صفحة المعلمة «توثيق حصص التيمز»: جدول حصصها لليوم، وكل ملف ترفقه يملأ حصته (المادة، الفصل، الوقت، الحاضرات)
  let PEND = [];   // ملفات اختارتها ولم تُرسل: {iso, f, file: File} أو {err, name}
  const me = A => A.tt.teachers[0];
  // ما أرسلته من هذا الجهاز ولم يصل بعد إلى ون درايف (يظهر «أُرسل» فورًا؛ يُحذف حين يصل أو بعد ٣ أيام)
  const SKEY = 'wk-att-sent', sget = () => { try { return JSON.parse(localStorage.getItem(SKEY) || '[]'); } catch { return []; } }, sset = v => { try { localStorage.setItem(SKEY, JSON.stringify(v)); } catch {} };
  // ما حذفته ولم يُحذف بعد من ون درايف (يختفي فورًا؛ يُنسى حين يختفي من البيانات أو بعد ٣ أيام)
  const DKEY = 'wk-att-del', dget = () => { try { return JSON.parse(localStorage.getItem(DKEY) || '[]'); } catch { return []; } }, dset = v => { try { localStorage.setItem(DKEY, JSON.stringify(v)); } catch {} };
  function sentLocal(A) {
    const nm = me(A).name, now = Date.now(), has = (iso, f) => (((A.days || {})[iso] || {})[nm] || []).some(x => x.file === f);
    const dk = dget().filter(x => x.to === nm && has(x.iso, x.file) && now - x.at < 3 * 864e5); dset(dk);
    dk.forEach(x => { const b = A.days[x.iso]; b[nm] = b[nm].filter(f => f.file !== x.file); });
    const have = new Set(Object.values(A.days || {}).flatMap(b => (b[nm] || []).map(x => x.file)));
    const keep = sget().filter(x => x.to === nm && !have.has(x.f.file) && now - x.at < 3 * 864e5 && !dk.some(d => d.iso === x.iso && d.file === x.f.file)); sset(keep);
    keep.forEach(x => { (((A.days ||= {})[x.iso] ||= {})[nm] ||= []).push({ ...x.f, wait: 1 }); });
  }
  function tPage(A, sel) {
    const days = [...new Set([...daysOf(A), ...PEND.filter(x => x.iso).map(x => x.iso)])].sort().reverse();
    const iso = sel && /^\d{4}-\d\d-\d\d$/.test(sel) ? sel : days[0] || today();
    const P = PEND.filter(x => x.iso === iso), used = new Set(); assign(me(A), iso, [...((A.days || {})[iso] || {})[me(A).name] || [], ...P.map(x => x.f)]);
    const M = dayModel(A, iso), r = M.T[0] || { cells: [], exp: [], extra: [], sent: 0 };
    const pend = c => { const q = P.find(x => !used.has(x) && x.f.p === c.p) || P.find(x => !used.has(x) && x.f.g === c.g && x.f.s === c.s && !r.cells.some(o => o.p === x.f.p)); if (q) used.add(q); return q; };
    const rows = r.cells.map(c => ({ c, q: c.f ? null : pend(c) })), extraP = P.filter(x => !used.has(x)), errs = PEND.filter(x => x.err);
    // يُعرض وقت الحصة الرسمي (المستخدمة 2026-10-26: وقت الاجتماع تقريبي)؛ وقت الاجتماع فقط لملف لم تُعرف حصته
    const info = f => f ? `${esc(f.subj || '')}<br><span class="muted">${f.p ? slot(f.p) : esc(f.start || '') + (f.end ? ' – ' + esc(f.end) : '')}</span>` : '<span class="muted">—</span>';
    const cnt = (f, c) => { if (!f || !c.g) return '<span class="muted">—</span>'; const L = lesson(A, { ...f, g: c.g, s: c.s }); return `${ad(L.here.length)} من ${ad(L.names.length)}`; };
    const drop = q => ` <button class="btn sm ghost" data-attdrop="${PEND.indexOf(q)}">إزالة</button>`;
    const del = f => ` <button class="btn sm ghost" data-attdel="${esc(iso)}|${esc(f.file)}" title="حذف الملف المرسل بالخطأ">حذف</button>`;
    const nP = r.exp.length, word = n => n > 2 && n < 11 ? 'حصص' : 'حصة';
    return `<div class="card hero th-hero"><div class="grow"><h2>توثيق حصص التيمز — ${DAYS[wday(iso)]} ${hij(iso)}</h2>
        <p class="muted">${nP ? (r.sent ? `أرسلتِ ${ad(r.sent)} من ${ad(nP)} ${word(nP)}` : `لم ترسلي بعد · ${nP === 1 ? 'حصة واحدة' : nP === 2 ? 'حصتان' : ad(nP) + ' ' + word(nP)} اليوم`) : 'لا توجد لكِ حصص في هذا اليوم حسب الجدول'}</p></div>
        <div>${nP ? (r.sent === nP ? chipOf(1, 'أرسلتِ كل حصصك') : chipOf(0, `باقي ${ad(nP - r.sent)}`)) : ''}</div></div>
      ${dayNav(days, iso)}
      <div class="card pad at-act"><div><b>إرفاق ملفات الحضور</b><div class="muted" style="font-size:13px">نزّلي «تقرير الحضور» من Teams لكل حصة، واختاري الملفات كلها مرة واحدة؛ تُوزَّع على حصصك تلقائيًا.</div></div>
        <label class="btn">اختيار الملفات<input type="file" multiple accept=".csv,text/csv" data-attf hidden></label></div>
      <div class="card at-wrap"><table class="at-t at-tt"><thead><tr><th>الحصة</th><th>الصف</th><th>المادة / الوقت</th><th>الحاضرات</th><th>الحالة</th></tr></thead><tbody>
      ${rows.map(({ c, q }) => `<tr class="${c.f ? 'ok' : q ? 'rd' : ''}"><td>ح${ad(c.p)}</td><td>${cls(c.g, c.s)}</td><td>${info(c.f || q?.f)}</td><td>${cnt(c.f || q?.f, c)}</td>
        <td>${c.f ? chipOf(1, c.f.wait ? '✓ أُرسل · قيد النقل' : '✓ أُرسل') + del(c.f) : q ? `<span class="chip s-part">جاهز للإرسال</span>${drop(q)}` : chipOf(0, 'لم يُرفق')}</td></tr>`).join('')}
      ${r.extra.map(f => `<tr class="ok"><td>${f.p ? 'ح' + ad(f.p) : '—'}</td><td>${f.g ? cls(f.g, f.s) : '؟'}</td><td>${info(f)}</td><td>${cnt(f, f)}</td><td>${chipOf(1, f.wait ? '✓ أُرسل · قيد النقل' : '✓ أُرسل')} <span class="chip s-part">خارج جدولك</span>${del(f)}</td></tr>`).join('')}
      ${extraP.map(q => `<tr class="rd"><td>${q.f.p ? 'ح' + ad(q.f.p) : '—'}</td><td>${q.f.g ? cls(q.f.g, q.f.s) : 'لم يُعرف الفصل'}</td><td>${info(q.f)}</td><td>${cnt(q.f, q.f)}</td>
        <td><span class="chip s-part">خارج جدولك</span>${drop(q)}</td></tr>`).join('')}
      ${!rows.length && !extraP.length && !r.extra.length ? '<tr><td colspan="5" class="muted">لا توجد حصص</td></tr>' : ''}
      </tbody></table></div>
      ${errs.length ? `<div class="card pad" style="color:#b91c1c">${errs.map(x => `«${esc(x.name)}»: ${esc(x.err)}${drop(x)}`).join('<br>')}</div>` : ''}
      <div class="at-act" style="justify-content:flex-end"><button class="btn" data-attsend="${iso}" ${P.length ? '' : 'disabled'}>إرسال${P.length ? ` (${ad(P.length)})` : ''}</button></div>
      <p class="muted" style="font-size:12.5px;margin:8px 4px">يُحفظ كل ملف في مجلدك داخل «رصد الغياب منصة التيمز» على ون درايف ويصل لمسؤولة الغياب خلال دقائق.</p>`;
  }
  async function readFiles(files) {
    const A = D.att;
    for (const file of files) {
      try {
        if (file.size > 2 * 1024 * 1024) throw new Error('الملف أكبر من المسموح');
        const r = TEAMS.parse(await file.arrayBuffer()); if (!r.start || !r.students.length) throw new Error('الملف ليس «تقرير حضور» من Teams');
        const iso = isoOf(r.start), nm = me(A).name;
        if (PEND.some(x => x.f && x.f.file === file.name && x.iso === iso) || (A.days?.[iso]?.[nm] || []).some(x => x.file === file.name)) throw new Error('الملف أُرفق من قبل');
        PEND.push({ iso, file, f: lessonOf(A, r, file.name) });
      } catch (e) { PEND.push({ name: file.name, err: e.message || 'تعذّرت قراءة الملف' }); }
    }
    const last = PEND.filter(x => x.iso).pop(); if (last && location.hash !== '#att/d/' + last.iso) location.hash = 'att/d/' + last.iso; else route();
  }
  async function send(iso, btn) {
    const A = D.att, P = PEND.filter(x => x.iso === iso), nm = me(A).name; if (!P.length) return;
    btn.disabled = true; btn.textContent = 'جارٍ الإرسال…'; let ok = 0;
    for (const x of P) {
      try {
        // الملف الأصلي إلى صندوق المنصة ← tools/inbox.js يكتبه في «رصد الغياب منصة التيمز/<المعلمة>/<اليوم>/»
        if (!A.demo) await sealSend({ kind: 'att', name: A.who, day: iso, file: x.file.name, type: 'text/csv', size: x.file.size }, new Uint8Array(await x.file.arrayBuffer()));
        (((A.days ||= {})[iso] ||= {})[nm] ||= []).push({ ...x.f, wait: 1 });
        sset([...sget(), { to: nm, iso, at: Date.now(), f: x.f }]); dset(dget().filter(d => !(d.to === nm && d.iso === iso && d.file === x.f.file))); PEND.splice(PEND.indexOf(x), 1); ok++;
      } catch (e) { x.f.errSend = 1; }
    }
    route(); if (typeof toast === 'function') toast(ok === P.length ? (A.demo ? 'معاينة: سُجّلت هنا فقط ولم تُرسل فعليًا' : 'تم الإرسال ✓') : 'تعذّر إرسال بعض الملفات، تحققي من الاتصال وأعيدي الإرسال');
  }
  async function remove(iso, file, btn) {
    const A = D.att, nm = me(A).name, b = ((A.days || {})[iso] || {})[nm] || [], f = b.find(x => x.file === file); if (!f) return;
    if (!confirm(`حذف ملف «${f.subj || file}»${f.p ? ' (ح' + ad(f.p) + ')' : ''}؟
يُنقل من مجلدك إلى «محذوف» ولا يدخل في تقارير الغياب، ويمكنك إرفاق الملف الصحيح بعده.`)) return;
    btn.disabled = true;
    try {
      // tools/inbox.js ينقله إلى «<اليوم>/محذوف/» (لا يُمحى نهائيًا)
      if (!A.demo) await sealSend({ kind: 'att-del', name: A.who, day: iso, file }, new Uint8Array(0));
      A.days[iso][nm] = b.filter(x => x !== f);
      sset(sget().filter(x => !(x.to === nm && x.iso === iso && x.f.file === file)));
      if (!f.wait) dset([...dget(), { to: nm, iso, file, at: Date.now() }]);
      route(); if (typeof toast === 'function') toast(A.demo ? 'معاينة: حُذف هنا فقط' : 'حُذف الملف ✓');
    } catch (e) { btn.disabled = false; if (typeof toast === 'function') toast('تعذّر الحذف، تحققي من الاتصال وأعيدي المحاولة'); }
  }
  if (!window.__attEv) { window.__attEv = 1;
    document.addEventListener('change', e => { const t = e.target;
      if (t.matches && t.matches('[data-attf]') && t.files.length) readFiles([...t.files]);
      if (t.matches && t.matches('[data-attday]')) location.hash = 'att/d/' + t.value; });
    document.addEventListener('click', e => { const t = e.target.closest ? e.target : null; if (!t) return;
      const dr = t.closest('[data-attdrop]'); if (dr) { PEND.splice(+dr.dataset.attdrop, 1); route(); return; }
      const dl = t.closest('[data-attdel]'); if (dl) { const [iso, ...f] = dl.dataset.attdel.split('|'); remove(iso, f.join('|'), dl); return; }
      const sb = t.closest('[data-attsend]'); if (sb) send(sb.dataset.attsend, sb); });
  }

  const CSS = `.at-wrap{overflow-x:auto;padding:0}.at-t{width:100%;border-collapse:collapse;font-size:13.5px;min-width:600px}
    .at-t th,.at-t td{border-bottom:1px solid var(--line,#e5e7eb);padding:8px 6px;text-align:center}.at-t th{background:var(--soft,#f6f6f4);font-weight:700}
    .at-t td.nm{text-align:right;white-space:nowrap;font-weight:600}.at-t td.ok{background:#e7f6ec;color:#166534}.at-t td.miss{background:#fdecec;color:#b91c1c}
    .at-t td i{display:block;font-style:normal;font-size:12px}.at-t td.no{background:transparent}.at-tt tr.ok td{background:#e7f6ec}.at-tt tr.rd td{background:#fff7e6}
    .at-nav{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin:10px 0}.at-nav select{font:inherit;padding:6px 10px;border-radius:10px;border:1px solid var(--line,#ccc);background:var(--card,#fff);min-width:200px}
    .at-act{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:10px 0}.at-of{overflow-x:auto}.at-of .of{min-width:760px}`;
  const OCSS = `.of{color:#111;font-size:12.5px}.of-h{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.of-h img{height:62px}
    .of-r,.of-l{font-weight:700;font-size:11.5px;line-height:1.7}.of-l span{display:inline-block;min-width:78px}.of-t{text-align:center;margin:4px 0 8px;font-size:15px}
    .of-g{width:100%;border-collapse:collapse;table-layout:fixed}.of-g th,.of-g td{border:1px solid #333;padding:3px 4px;text-align:center;height:22px}
    .of-g thead th{background:#cfdcef;color:#1f3b6e}.of-g .m{width:34px}.of-g .nm{width:38%;text-align:right;color:#b45309;font-weight:700}.of-g td.m{background:#cfdcef;font-weight:700}
    .of-g td.g{color:#b91c1c;font-weight:800}.of-g td.t{color:#1d4ed8;font-weight:800}.of-g .nf,.nfk{background:repeating-linear-gradient(45deg,#ddd 0 4px,#f4f4f4 4px 8px)}
    .of-k{display:flex;gap:22px;flex-wrap:wrap;margin:8px 0;font-size:12px}.of-k b{border:1px solid #333;padding:0 5px;margin-left:4px}.nfk{display:inline-block;width:18px;height:12px;border:1px solid #333;vertical-align:middle;margin-left:4px}
    .of-sj{display:block;font-size:9.5px;font-weight:400;line-height:1.3;color:#334}.of-u{font-size:11.5px;color:#92400e;margin:4px 0}.of-s{text-align:center;width:260px;margin:10px auto 0;font-weight:700;line-height:1.8}`;
  if (!document.getElementById('att-css')) { const st = document.createElement('style'); st.id = 'att-css'; st.textContent = CSS + OCSS; document.head.appendChild(st); }

  window.ATT = {
    render(A, a) {
      ready(A);
      const [v, x] = String(a || '').split('/');
      if (v === 'all') return allReports(A);
      if (A.mode === 'teacher') return tPage(A, v === 'd' ? x : '');
      if (v === 'r') return reports(A, x);
      if (v === 'tt') return timetable(A);
      return home(A, v === 'd' ? x : '');
    },
  };
})();
