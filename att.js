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
  // Teams بالعربية أو بالإنجليزية (المستخدمة 2026-10-26: Attendance.csv — «1. Summary / 2. Participants»): أول عمود موجود
  const get = (o, ...k) => { for (const x of k) if (o[x]) return o[x]; return ''; };
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
        const name = get(o, 'الاسم', 'Name'), role = get(o, 'الدور', 'Role'), mail = get(o, 'البريد الإلكتروني', 'Email').toLowerCase();
        if (sec === 2) people.set(mail || name, { name, mail, role, first: when(get(o, 'وقت الانضمام الأول', 'First Join')), last: when(get(o, 'وقت المغادرة الأخير', 'Last Leave')),
          dur: secs(get(o, 'مدة الاجتماع', 'In-Meeting Duration')), parts: 0 });
        else { const p = people.get(mail || name); if (p) { if (!p.parts) p.dur = 0; p.parts++; p.dur += secs(get(o, 'المدة', 'Duration')); } }
      }
    }
    const start = when(sum['وقت البدء'] || sum['Start time']), end = when(sum['وقت الانتهاء'] || sum['End time']);
    const all = [...people.values()];
    return { title: sum['عنوان الاجتماع'] || sum['Meeting title'] || '', start, end, organizer: (all.find(p => /المنظم|organizer/i.test(p.role)) || {}).name || '',
      // الطالبة = بريد يبدأ بـ S ولو كان دورها «مقدم العرض» (فاطمة الشهراني 2026-10-27: كل الطالبات مقدمات عرض)؛ المعلمة = بريد t
      students: all.filter(p => !/المنظم|organizer/i.test(p.role) && !/^t\d/i.test(p.mail) && (/^s\d/i.test(p.mail) || !/مقدم|presenter/i.test(p.role))) };
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
  const SG = ['', 'أول', 'ثاني', 'ثالث'];   // اسم الصف مختصرًا في خانات «حسب حصص اليوم» (أول١)
  const GR = ['', 'الأول', 'الثاني', 'الثالث'], cls = (g, s) => `${GR[g]} متوسط ${ad(s)}`, ck = (g, s) => g + '-' + s;
  const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const gd = iso => new Date(iso + 'T12:00:00');
  const hijT = iso => { const P = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(gd(iso)), v = t => P.find(x => x.type === t).value;
    return `${ad(v('day'))}‏/${ad(v('month'))}‏/${ad(v('year'))}هـ`; };   // RLM قبل «/»: اليوم في أقصى اليمين
  const hij = iso => `<span dir="rtl">${hijT(iso)}</span>`;
  const wday = iso => gd(iso).getDay();   // 0 = الأحد … 4 = الخميس
  const isoOf = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = () => isoOf(new Date());
  const hm = d => d ? `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}` : '';
  // أوقات الحصص عن بعد (من المستخدمة 2026-10-26): ٤٠ دقيقة وبينها ٥ دقائق، ح١ ٧:٠٠ … ح٧ ١١:٣٠–١٢:١٠
  const BELL = ['7:00', '7:45', '8:30', '9:15', '10:00', '10:45', '11:30'], BELL_END = ['7:40', '8:25', '9:10', '9:55', '10:40', '11:25', '12:10'],
    pics = n => n === 1 ? 'صورة واحدة' : n === 2 ? 'صورتان' : `${ad(n)} ${n > 2 && n < 11 ? 'صور' : 'صورة'}`,
    slot = p => `${ad(BELL[p - 1])}‏ – ‏${ad(BELL_END[p - 1])}`,   // RLM: البداية في اليمين
    mins = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  // الحصة من منتصف الاجتماع (المستخدمة 2026-10-26: «خلك في النصف» — بدء متأخر ٤ دقائق أو تجاوز ٥ لا يغيّرها):
  // أقرب حصة منتصفُها لمنتصف الاجتماع، من ٦:٤٥ حتى ١٣:٣٠
  const MID = BELL.map((b, i) => (mins(b) + mins(BELL_END[i])) / 2);
  const periodAt = d => { const t = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; if (t < mins(BELL[0]) - 15 || t > mins('13:30')) return 0;
    let p = 1; MID.forEach((m, i) => { if (Math.abs(t - m) < Math.abs(t - MID[p - 1])) p = i + 1; }); return p; };
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
  // رقم الحصة من اسم الملف إن كتبته المعلمة: «الحصة السابعة»، «ح٧»، «حصة 3» (لا الأرقام وحدها مثل 1.csv)
  const PW = ['اول', 'ثاني', 'ثالث', 'رابع', 'خامس', 'سادس', 'سابع'];
  const hintOf = file => {
    const s = String(file || '').replace(/\.csv$/i, '').replace(/[٠-٩]/g, c => AR.indexOf(c)).replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
    let m = s.match(/(?:^|[^؀-ۿ])(?:ح|حصه|الحصه)\s*[._-]?\s*([1-7])(?![0-9])/); if (m) return +m[1];
    m = s.match(/(?:حصه\s*|^\s*)ال(اول|ثاني|ثالث|رابع|خامس|سادس|سابع)/); return m ? PW.indexOf(m[1]) + 1 : 0;
  };
  function assign(ttT, iso, L) {
    const exp = ttT ? (ttT.days[wday(iso)] || []) : [];
    L.forEach(f => { if (f.p0 === undefined) f.p0 = f.p; if (f.ph === undefined) f.ph = hintOf(f.file); });
    pass(exp, L, 0);
    // تأخر المعلمة ذلك اليوم: وسيط (منتصف الاجتماع − منتصف حصته)؛ إن كان ١٠ دقائق فأكثر يُعاد التخمين بعد طرحه
    const dl = L.filter(f => f.tm && f.p && exp[f.p - 1] && ck(exp[f.p - 1].g, exp[f.p - 1].s) === ck(f.g, f.s))
      .map(f => { const d = new Date(f.tm); return d.getHours() * 60 + d.getMinutes() - MID[f.p - 1]; }).sort((a, b) => a - b);
    const lag = dl.length ? dl[dl.length >> 1] : 0;
    if (lag >= 10 && lag <= 90) pass(exp, L, lag);
    return L;
  }
  function pass(exp, L, lag) {
    const by = {};
    L.forEach(f => { f.q = lag && f.tm ? periodAt(new Date(f.tm - lag * 60000)) || f.p0 : f.p0; f.p = f.ph || f.q; (by[ck(f.g, f.s)] ||= []).push(f); });
    for (const [k, fs] of Object.entries(by)) {
      const ps = exp.map((c, i) => c && ck(c.g, c.s) === k ? i + 1 : 0).filter(Boolean); if (!ps.length) continue;
      fs.sort((a, b) => (a.t0 || 0) - (b.t0 || 0));
      // مطابقة تحفظ الترتيب بأقل بعد عن وقت الجرس؛ ملف زائد عن حصص الفصل يبقى على وقت الجرس
      const n = fs.length, m = ps.length, SKIP = 100, cost = (f, p) => f.ph ? (f.ph === p ? 0 : 50) : f.q ? Math.abs(f.q - p) : 0;
      const D = [...Array(n + 1)].map(() => Array(m + 1).fill(Infinity)); D[0].fill(0);
      for (let i = 1; i <= n; i++) for (let j = 0; j <= m; j++)
        D[i][j] = Math.min(D[i - 1][j] + SKIP, j ? D[i][j - 1] : Infinity, j ? D[i - 1][j - 1] + cost(fs[i - 1], ps[j - 1]) : Infinity);
      for (let i = n, j = m; i > 0;) {
        if (j && D[i][j] === D[i][j - 1]) j--;
        else if (j && D[i][j] === D[i - 1][j - 1] + cost(fs[i - 1], ps[j - 1])) { fs[i - 1].p = ps[j - 1]; i--; j--; }
        else i--;
      }
    }
  }
  function lessonOf(A, r, file) {
    const R = { ...r, start: r.start && new Date(r.start), end: r.end && new Date(r.end), students: (r.students || []).map(x => ({ ...x, first: x.first && new Date(x.first) })) };
    const C = TEAMS.classify(R), iso = R.start ? isoOf(R.start) : '';
    let best = null; for (const k of Object.keys(A.roster)) { const m = matcher(A.roster[k]), n = C.filter(x => m(x.name)).length; if (!best || n > best.n) best = { k, n }; }
    const [g, s] = best && best.n >= Math.min(3, C.length) && best.n > 0 ? best.k.split('-').map(Number) : [0, 0];
    const tm = R.start ? (R.end && R.end > R.start ? (+R.start + +R.end) / 2 : +R.start + 20 * 60000) : 0, p = tm ? periodAt(new Date(tm)) : 0;
    return { iso, p, p0: p, t0: R.start ? R.start.getTime() : 0, tm, g, s, subj: R.title || '', file, start: hm(R.start), end: hm(R.end),
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
  // أيام الدراسة عن بعد = الأيام التي وصلت فيها ملفات، واليوم إن كان يوم دراسة، ويوم الدراسة السابق فقط (المستخدمة 2026-10-27: للرفع المتأخر، لا أيام الأسبوع كله)
  const prevDay = () => { const d = gd(today()); do d.setDate(d.getDate() - 1); while (d.getDay() > 4); return d.toISOString().slice(0, 10); };
  // أيام تفتحها المستخدمة يدويًا للرفع المتأخر (2026-10-28: الاثنين لنورة عسيري)
  const OPEN = ['2026-10-26'];
  const daysOf = A => [...new Set([...Object.keys(A.days || {}), ...(A.rd || []), prevDay(), ...OPEN, ...(wday(today()) <= 4 ? [today()] : [])])].filter(d => wday(d) <= 4).sort().reverse();
  // اختيار اليوم: قائمة منسدلة + السابق/التالي (قد تصل الأيام إلى ٣٠ يومًا وأكثر)
  const dayNav = (days, iso, pre = 'att/d/') => { if (days.length < 2) return ''; const i = days.indexOf(iso), older = days[i + 1], newer = days[i - 1];
    return `<div class="at-nav"><button class="btn sm ghost" ${older ? `data-go="${pre}${older}"` : 'disabled'}>→ اليوم السابق</button>
      <select data-attday="${pre}">${days.map(d => `<option value="${d}"${d === iso ? ' selected' : ''}>${DAYS[wday(d)]} ${hijT(d)}${d === today() ? ' (اليوم)' : ''}</option>`).join('')}</select>
      <button class="btn sm ghost" ${newer ? `data-go="${pre}${newer}"` : 'disabled'}>اليوم التالي ←</button></div>`; };

  // --- متابعة اليوم (مسؤولة الغياب والوكيلة)
  function home(A, sel) {
    const days = daysOf(A), iso = sel && /^\d{4}-\d\d-\d\d$/.test(sel) ? sel : days[0] || today();
    if (wday(iso) > 4) return dayNav(days, iso) + '<div class="empty card">هذا اليوم ليس يوم دراسة.</div>';
    const M = dayModel(A, iso), all = M.done === M.T.length && M.T.length;
    const evN = r => (((A.ev || {})[iso] || {})[r.t.name]) || 0;
    const remind = r => { const ph = (A.phones || {})[r.t.name]; if (!ph || (r.sent === r.exp.length && evN(r))) return '';
      const miss = [r.sent < r.exp.length && 'ملفات حضور: ' + r.cells.filter(c => !c.f).map(c => `ح${ad(c.p)} (${cls(c.g, c.s)})`).join('، '), !evN(r) && 'صور شواهد توثيق الحصص'].filter(Boolean).join('\n');
      return ` <a class="btn sm ghost" target="_blank" rel="noopener" href="${wa(ph, `السلام عليكم أ. ${short(r.t.name)}\nنأمل رفع توثيق حصص التيمز ليوم ${DAYS[M.w]} ${hijT(iso)}:\n${miss}\nمن المنصة ← «توثيق حصص التيمز»${A.url ? '\n' + A.url : ''}`)}">تذكير واتساب</a>`; };
    return `<div class="card hero th-hero"><div class="grow"><h2>حضور حصص التيمز — ${DAYS[M.w]} ${hij(iso)}</h2>
        <p class="muted">${ad(M.done)} من ${ad(M.T.length)} معلمة أكملت · ${ad(M.sent)} من ${ad(M.need)} حصة وصل ملفها</p></div>
        <div>${all ? chipOf(1, 'اكتملت المعلمات') : chipOf(0, `ناقص ${ad(M.need - M.sent)} حصة`)}</div></div>
      ${dayNav(days, iso)}
      <div class="card pad at-act"><div><b>تقرير الغياب على مستوى حصة</b><div class="muted" style="font-size:13px">لكل فصل: الطالبات × حصص اليوم${all ? '' : ' — يمكن إعداده الآن، والحصص التي لم يصل ملفها تظهر مخططة'}</div></div>
        <span><button class="btn" data-go="att/r/${iso}">إعداد تقارير الفصول ←</button> <button class="btn ghost" data-go="attr">تقارير كل الأيام</button></span></div>
      ${A.vw ? `<div class="card pad at-act"><div><b>توثيق الحضور في تيمز</b><div class="muted" style="font-size:13px">تقرير كل معلمة لهذا اليوم: معاينة وتصفح وتنزيل (${ad(Object.keys((A.pdf || {})[iso] || {}).length)} جاهز)</div></div>
        <span><button class="btn" data-go="att/v/${iso}">عرض تقارير المعلمات ←</button></span></div>` : ''}
      ${''/* «حسب حصص اليوم» (التصميم ٤ باختيار المستخدمة 2026-10-27): صفوف بلا تمرير جانبي — على الجوال كل معلمة كتلة: الاسم والحالة، ثم ح١–ح٧ في سطر، ثم الأزرار */}
      <div class="card at-g"><div class="at-gr at-gh"><div>المعلمة</div><div class="at-gc">${[1, 2, 3, 4, 5, 6, 7].map(p => `<span>ح${ad(p)}</span>`).join('')}</div><div>الشواهد</div><div></div></div>
      ${M.T.slice().sort((a, b) => (a.sent === a.exp.length) - (b.sent === b.exp.length) || a.t.name.localeCompare(b.t.name, 'ar')).map(r => `<div class="at-gr">
        <div class="at-gn"><b>${esc(short(r.t.name))}</b>${chipOf(r.sent === r.exp.length, `${ad(r.sent)} من ${ad(r.exp.length)}`)}</div>
        <div class="at-gc">${[1, 2, 3, 4, 5, 6, 7].map(p => { const c = r.cells.find(x => x.p === p);
          return c ? `<span class="${c.f ? 'ok' : 'miss'}" title="ح${ad(p)} · ${c.f ? esc(c.f.subj || c.f.file || '') : 'لم يصل الملف'}"><i>ح${ad(p)}</i>${SG[c.g]}${ad(c.s)}</span>` : `<span class="no"><i>ح${ad(p)}</i></span>`; }).join('')}</div>
        <div class="at-ge">${evN(r) ? chipOf(1, pics(evN(r))) : chipOf(0, 'لا شواهد')}</div>
        <div class="at-ga">${r.extra.length ? `<span class="chip s-part">+${ad(r.extra.length)} خارج الجدول</span>` : ''}${remind(r)}${A.pdf?.[iso]?.[r.t.name] ? ` <button class="btn sm ghost" data-attpdf="${iso}|${esc(r.t.name)}">PDF</button>` : ''}</div></div>`).join('')}
      </div>
      <p class="muted" style="font-size:12.5px;margin:8px 4px">الأخضر: وصل ملف الحصة · الأصفر: لم يصل بعد · <a href="#att/tt">مراجعة جدول الحصص</a></p>`;
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
        <div class="of-l"><span>الصف</span>: ${GRN[c.g]}<br><span>القسم</span>: التعليم العام<br><span>الفصل</span>: ${ad(c.s)}<br><span>النظام الدراسي</span>: منتظم<br><span>التاريخ</span>: ${hij(today())}</div></div>
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
  // طباعة النموذج: كل فصل في صفحة واحدة كنموذج الوزارة (المستخدمة 2026-10-28) — الفصل الأطول من الصفحة يُصغَّر ليتسع
  // (A4 أفقي بهامش 8 مم ≈ 730px ارتفاعًا)؛ تستعملها مسؤولة الغياب والموجهة الطلابية
  function printOfficial(R, iso) {
    const logo = new URL('moe-logo.png', location.href).href, w = window.open('', '_blank'); if (!w || !R.length) return;
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>تقرير الغياب على مستوى حصة ${hijT(iso)}</title><style>${OCSS}@page{size:A4 landscape;margin:8mm}body{margin:0;font-family:Tahoma,Arial,sans-serif}.of{page-break-after:always;break-inside:avoid}.of:last-child{page-break-after:auto}</style>
      <body>${R.map(c => officialPage(c, iso, logo)).join('')}<script>addEventListener('load', () => document.querySelectorAll('.of').forEach(s => { const h = s.scrollHeight; if (h > 715) s.style.zoom = (715 / h).toFixed(3); }));<\/script></body></html>`);
    w.document.close(); let done = 0; const pr = () => { if (!done++) w.print(); }; w.onload = pr; setTimeout(pr, 1500);
  }
  function reports(A, iso) {
    if (!/^\d{4}-\d\d-\d\d$/.test(iso || '')) return allReports(A);
    const R = classReports(A, iso), M = dayModel(A, iso), logo = new URL('moe-logo.png', location.href).href;
    window.__attPrint = () => printOfficial(R, iso);
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
    // بيانات صُدّرت بعد الحذف بعشر دقائق وما زال الملف فيها = أُعيد إلى المجلد (المستخدمة 2026-10-27: فاطمة شبنان ظهرت صفحتها فارغة)
    const gen = Date.parse((typeof D !== 'undefined' && D && D.generated) || '') || 0;
    const dk = dget().filter(x => x.to === nm && has(x.iso, x.file) && now - x.at < 3 * 864e5 && !(gen > x.at + 6e5)); dset(dk);
    dk.forEach(x => { const b = A.days[x.iso]; b[nm] = b[nm].filter(f => f.file !== x.file); });
    const have = new Set(Object.values(A.days || {}).flatMap(b => (b[nm] || []).map(x => x.file)));
    const keep = sget().filter(x => x.to === nm && !have.has(x.f.file) && now - x.at < 3 * 864e5 && !dk.some(d => d.iso === x.iso && d.file === x.f.file)); sset(keep);
    keep.forEach(x => { (((A.days ||= {})[x.iso] ||= {})[nm] ||= []).push({ ...x.f, wait: 1 }); });
  }
  // --- شواهد توثيق الحصة: صور فقط ← «<اليوم>/توثيق شواهد الحصة/» (المستخدمة 2026-10-26)
  let EVP = [];   // صور اختارتها ولم تُرسل: {iso, file, url}
  const EKEY = 'wk-att-ev', eget = () => { try { return JSON.parse(localStorage.getItem(EKEY) || '[]'); } catch { return []; } }, eset = v => { try { localStorage.setItem(EKEY, JSON.stringify(v)); } catch {} };
  // ما في ون درايف + ما أرسلته من هذا الجهاز ولم يصل بعد (base = العدد عند الإرسال)
  function evCount(A, iso) {
    const nm = me(A).name, now = Date.now(), srv = d => (((A.ev || {})[d] || {})[nm]) || 0;
    const L = eget().filter(x => x.to === nm && now - x.at < 3 * 864e5 && srv(x.iso) < x.base + x.n); eset(L);
    const mine = L.filter(x => x.iso === iso); return { n: Math.max(srv(iso), ...mine.map(x => x.base + x.n)), wait: mine.length > 0 };
  }
  function evCard(A, iso) {
    const E = EVP.filter(x => x.iso === iso), C = evCount(A, iso);
    return `<div class="card pad"><div class="at-act" style="margin:0"><div><b>شواهد توثيق الحصص</b><div class="muted" style="font-size:13px">صور من حصص هذا اليوم (لقطات من Teams وغيرها) — صور فقط</div></div>
        <label class="btn ghost">اختيار الصور<input type="file" multiple accept="image/*" data-atti="${iso}" hidden></label></div>
      <div style="margin-top:8px">${C.n ? chipOf(1, `✓ أُرسلت ${pics(C.n)}${C.wait ? ' · قيد النقل' : ''}`) : chipOf(0, 'لم تُرسل صور بعد')}</div>
      ${E.length ? `<div class="at-evs">${E.map(x => `<span class="at-ev"><img alt="" src="${x.url}"><button class="btn sm ghost" data-attevdrop="${EVP.indexOf(x)}" aria-label="إزالة">×</button></span>`).join('')}</div>
      <div class="at-act" style="justify-content:flex-end;margin-bottom:0"><button class="btn" data-attevsend="${iso}">إرسال الصور (${ad(E.length)})</button></div>` : ''}</div>`;
  }
  // --- «تقرير اليوم» PDF (tools/att-pdf.js): نسخة مشفّرة data/ap/<id>.bin ومفتاحها في البيانات؛ والمادة تكتبها المعلمة مرة واحدة
  const JKEY = 'wk-att-subj', jget = () => { try { return JSON.parse(localStorage.getItem(JKEY) || 'null'); } catch { return null; } }, jset = v => { try { localStorage.setItem(JKEY, JSON.stringify(v)); } catch {} };
  const subjOf = A => { const l = jget(); return l && l.to === me(A).name && l.v !== (A.subj || '') && Date.now() - l.at < 3 * 864e5 ? l.v : A.subj || ''; };
  function pdfCard(A, iso) {
    const nm = me(A).name, x = (((A.pdf || {})[iso] || {})[nm]), has = ((((A.days || {})[iso] || {})[nm]) || []).length, sj = subjOf(A);
    return `<div class="card pad"><div class="at-act" style="margin:0"><div><b>تقرير اليوم في منصة مدرستي (PDF)</b><div class="muted" style="font-size:13px">ملف واحد فيه كل حصص اليوم وأسماء الحاضرات وصور الشواهد، يُحفظ في مجلدك ويتحدّث تلقائيًا بعد كل إرسال</div></div>
        ${x ? `<button class="btn" data-attpdf="${iso}|${esc(nm)}">تنزيل تقرير اليوم</button>` : `<span class="muted" style="font-size:13px">${has && iso < isoOf(new Date(Date.now() - 30 * 864e5)) ? 'أقدم من ٣٠ يومًا: التقرير محفوظ لدى الإدارة في ون درايف' : has ? 'يُجهَّز خلال دقائق من وصول ملفاتك' : 'يظهر بعد إرسال ملفات الحضور'}</span>`}</div>
      <div class="at-sj"><label>المادة في التقرير: <input data-attsubj value="${esc(sj)}" placeholder="مثل: المهارات الرقمية" maxlength="40"></label>
        <button class="btn sm ghost" data-attsubjsave>حفظ المادة</button>${sj ? '' : ' <span class="chip s-none">لم تُكتب المادة بعد</span>'}</div></div>`;
  }
  async function saveSubj(btn) {
    const A = D.att, v = (document.querySelector('[data-attsubj]')?.value || '').replace(/\s+/g, ' ').trim().slice(0, 40); if (!v) return;
    btn.disabled = true;
    try { if (!A.demo) await sealSend({ kind: 'att-subj', name: A.who, subj: v }, new Uint8Array(0)); jset({ to: me(A).name, v, at: Date.now() });
      route(); if (typeof toast === 'function') toast(A.demo ? 'معاينة: لم تُرسل فعليًا' : 'حُفظت المادة ✓ وتظهر في التقارير خلال دقائق'); }
    catch (e) { btn.disabled = false; if (typeof toast === 'function') toast('تعذّر الحفظ، تحققي من الاتصال'); }
  }
  // ملف مشفّر في data/ap (iv ١٢ بايت + AES-GCM) ← محتواه
  async function unseal(url, k64) {
    const r = await fetch(url + '?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) throw new Error('net');
    const u = new Uint8Array(await r.arrayBuffer()), k = await crypto.subtle.importKey('raw', Uint8Array.from(atob(k64), c => c.charCodeAt(0)), 'AES-GCM', false, ['decrypt']);
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(0, 12) }, k, u.subarray(12));
  }
  // data-open: تصفح في نافذة جديدة (تُفتح قبل الانتظار حتى لا يمنعها المتصفح)، وإلا تنزيل
  async function getPdf(iso, nm, btn) {
    const A = D.att, x = (((A.pdf || {})[iso] || {})[nm]); if (!x) return;
    const w = btn.dataset.open ? window.open('', '_blank') : null;
    btn.disabled = true;
    try {
      const url = URL.createObjectURL(new Blob([await unseal(x.u, x.k)], { type: 'application/pdf' }));
      if (w) w.location.href = url;
      else { const a = document.createElement('a'); a.href = url; a.download = (A.mode !== 'teacher' ? short(nm) + ' - ' : '') + x.n; document.body.appendChild(a); a.click(); a.remove(); }
      setTimeout(() => URL.revokeObjectURL(url), 300000);
    } catch (e) { if (w) w.close(); if (typeof toast === 'function') toast('تعذّر فتح التقرير، أعيدي المحاولة'); }
    btn.disabled = false;
  }

  // --- «توثيق الحضور في تيمز» (2026-10-27، التصميم ١ «قائمة ومعاينة جانبية» باختيار المستخدمة): للموجهة الطلابية (mode 'view')
  // وللوكيلة (A.vw، من متابعتها att/v). الأسماء في قائمة، وتقرير المختارة كبيرًا بجانبها: صورة الصفحة الأولى + تفاصيل + تصفح وتنزيل.
  // على الجوال المعاينة فوق القائمة. pre = بادئة الرابط (att/d للموجهة، att/v للوكيلة)
  let VSEL = '';   // المعلمة المختارة
  function viewPage(A, sel, pre) {
    const days = daysOf(A), iso = sel && /^\d{4}-\d\d-\d\d$/.test(sel) ? sel : days[0] || today(), w = wday(iso), P = (A.pdf || {})[iso] || {};
    const T = A.tt.teachers.filter(t => t.name && (P[t.name] || (t.days[w] || []).some(Boolean))).sort((a, b) => short(a.name).localeCompare(short(b.name), 'ar'));
    const R = T.filter(t => P[t.name]), Wt = T.filter(t => !P[t.name]), cur = R.find(t => t.name === VSEL) || R[0];
    const ex = t => (t.days[w] || []).map((c, i) => c && { p: i + 1, ...c }).filter(Boolean);
    const per = t => { const e = ex(t); const n = e.length; return !n ? '' : n === 1 ? 'حصة واحدة' : n === 2 ? 'حصتان' : ad(n) + (n < 11 ? ' حصص' : ' حصة'); };
    const back = pre === 'att/v/' ? `<button class="btn ghost" data-go="att/d/${iso}">متابعة الرفع</button>` : '';
    setTimeout(thumbs, 0);
    // الموجهة الطلابية: «ألبوم حسب المرحلة» (التصميم ٦، المستخدمة 2026-10-27: «يهمها الطالبات») — المعلمة تظهر في كل مرحلة درّستها ذلك اليوم
    if (A.mode === 'view') {
      const album = w > 4 ? '<div class="empty card">هذا اليوم ليس يوم دراسة.</div>' : !T.length ? '<div class="empty card">لا توجد حصص عن بعد في هذا اليوم.</div>'
        : [1, 2, 3].map(g => { const L = R.filter(t => ex(t).some(c => c.g === g)); if (!L.length) return '';
          return `<h3 class="at-ah">${GR[g]} متوسط <small>${ad(L.length)} ${L.length > 2 && L.length < 11 ? 'تقارير' : 'تقرير'}</small></h3><div class="at-al">${L.map(t => {
            const x = P[t.name], k = `${iso}|${esc(t.name)}`, e = ex(t).filter(c => c.g === g), C = [...new Set(e.map(c => SG[c.g] + ad(c.s)))];
            return `<div class="at-doc"><div class="at-stk" role="button" data-attpdf="${k}" data-open="1"><div class="at-th"${x.t ? ` data-attth="${k}"` : ''}><span>تقرير الحصص</span></div>
                ${x.pg ? `<span class="at-pg">${ad(x.pg)} ص</span>` : ''}</div>
              <b>${esc(short(t.name))}</b><small>${C.join('، ')} · ${e.map(c => 'ح' + ad(c.p)).join('، ')}</small>
              <div class="at-tb"><button class="btn sm" data-attpdf="${k}" data-open="1">تصفح</button><button class="btn sm ghost" data-attpdf="${k}">تنزيل</button></div></div>`; }).join('')}</div>`; }).join('')
          + (R.length ? '' : '<div class="empty card">لم يُجهَّز أي تقرير لهذا اليوم بعد.</div>')
          + (Wt.length ? `<h3 class="at-ah">لم يُجهَّز بعد <small>${ad(Wt.length)}</small></h3><div class="at-wl">${Wt.map(t => `<span class="chip">${esc(short(t.name))}</span>`).join('')}</div>` : '');
      return `<div class="card hero th-hero"><div class="grow"><h2>توثيق الحضور في تيمز — ${DAYS[w]} ${hij(iso)}</h2>
          <p class="muted">${ad(R.length)} من ${ad(T.length)} معلمة تقريرها جاهز · مجمّعة حسب المرحلة</p></div></div>${dayNav(days, iso, pre)}${album}`;
    }
    let pv = '<div class="card pad at-pv0 muted">لم يُجهَّز أي تقرير لهذا اليوم بعد.</div>';
    if (cur) { const x = P[cur.name], k = `${iso}|${esc(cur.name)}`, e = ex(cur), C = [...new Set(e.filter(c => c.g).map(c => cls(c.g, c.s)))];
      pv = `<div class="card at-pv"><div class="at-th" role="button" data-attpdf="${k}" data-open="1"${x.t ? ` data-attth="${k}"` : ''}><span>تقرير الحصص</span></div>
        <div class="at-meta"><h3>${esc(short(cur.name))}</h3><div class="muted">${DAYS[w]} ${hij(iso)}</div>
          <dl>${e.length ? `<dt>الحصص</dt><dd>${e.map(c => 'ح' + ad(c.p)).join('، ')}</dd>` : ''}${C.length ? `<dt>الفصول</dt><dd>${C.join('، ')}</dd>` : ''}
            ${x.pg ? `<dt>صفحات التقرير</dt><dd>${ad(x.pg)}</dd>` : ''}<dt>الملف</dt><dd>${esc(x.n)}</dd></dl>
          <div class="at-tb"><button class="btn" data-attpdf="${k}" data-open="1">تصفح</button><button class="btn ghost" data-attpdf="${k}">تنزيل</button></div></div></div>`; }
    return `<div class="card hero th-hero"><div class="grow"><h2>توثيق الحضور في تيمز — ${DAYS[w]} ${hij(iso)}</h2>
        <p class="muted">${ad(R.length)} من ${ad(T.length)} معلمة تقريرها جاهز · اختاري اسمًا لعرض تقريرها</p></div>${back}</div>
      ${dayNav(days, iso, pre)}
      ${w > 4 ? '<div class="empty card">هذا اليوم ليس يوم دراسة.</div>' : !T.length ? '<div class="empty card">لا توجد حصص عن بعد في هذا اليوم.</div>'
      : `<div class="at-v"><div class="card at-ls">
          ${R.map(t => `<button class="at-li${t === cur ? ' on' : ''}" data-attsel="${esc(t.name)}"><i></i>${esc(short(t.name))}<small>${per(t)}</small></button>`).join('')}
          ${Wt.length ? `<div class="at-sep">لم يُجهَّز بعد (${ad(Wt.length)})</div>${Wt.map(t => `<div class="at-li w"><i></i>${esc(short(t.name))}<small>${per(t)}</small></div>`).join('')}` : ''}
        </div>${pv}</div>`}`;
  }
  // --- «حصر الطالبات الغائبات» (2026-10-28، زر مستقل للموجهة الطلابية، النماذج الأربعة باختيار المستخدمة «كلها مفيدة»):
  // من تقارير الفصول نفسها (classReports). حالة الطالبة في كل حصة: a غائبة (ومنها دخول لحظات)، h حاضرة (المتأخرة حاضرة)،
  // n حصة في الجدول لم يصل ملفها (لا تُحسب غيابًا)، '' لا حصة. «طوال اليوم» = غائبة في كل الحصص المرصودة لفصلها.
  const ABC = new WeakMap(), P7 = [1, 2, 3, 4, 5, 6, 7];
  function absDay(A, iso) {
    let M = ABC.get(A); if (!M) ABC.set(A, M = new Map()); if (M.has(iso)) return M.get(iso);
    const R = classReports(A, iso).map(c => {
      const P = P7.map(p => c.rows.find(r => r.p === p && r.L) || c.rows.find(r => r.p === p) || null);
      const st = c.names.map(n => { const s = P.map(x => !x ? '' : !x.L ? 'n' : x.L.absent.some(o => o.n === n) ? 'a' : 'h'),
        rec = s.filter(v => v === 'a' || v === 'h').length, ab = s.filter(v => v === 'a').length;
        return { n, s, rec, ab, full: rec > 0 && ab === rec }; });
      return { k: c.k, g: c.g, s: c.s, names: c.names, P, st, nf: P.filter(x => x && !x.L).length };
    });
    M.set(iso, R); return R;
  }
  const absDays = A => daysOf(A).filter(d => (A.days || {})[d] && wday(d) <= 4);
  const cnm = (g, s) => SG[g] + ' ' + ad(s);
  const pchips = s => `<span class="ab-ps">${s.map((v, i) => `<i class="ab-p ${v || 'x'}" title="ح${ad(i + 1)}">ح${ad(i + 1)}</i>`).join('')}</span>`;
  const absent = s => `<span class="ab-ps">${s.map((v, i) => v === 'a' ? `<i class="ab-p a">ح${ad(i + 1)}</i>` : '').join('')}</span>`;
  const nmBtn = n => `<button class="ab-nm" data-absp="${esc(n)}">${esc(n)}</button>`;
  const LEG = `<div class="ab-leg"><span><i class="ab-p a">ح</i>غائبة</span><span><i class="ab-p h">ح</i>حاضرة</span><span><i class="ab-p n">ح</i>غير مرصودة (لم يُرفع الملف)</span><span><i class="ab-p x">ح</i>لا حصة</span></div>`;
  const stat = (n, l, c = '') => `<div class="ab-st"><b${c ? ` style="color:${c}"` : ''}>${ad(n)}</b><span>${l}</span></div>`;
  const ABT = [['c', 'تقرير الغياب على مستوى حصة'], ['f', 'غياب كامل / جزئي'], ['s', 'الحصر التراكمي'], ['p', 'بطاقة الطالبة']];
  const ABF = { cls: '', rng: 'w', min: 3, who: '' };   // اختيارات الصفحة في هذه الجلسة
  let ABX = null;   // صفوف «تصدير Excel» للعرض الحالي
  const clsSel = R => `<select data-absf="cls"><option value="">كل الفصول</option>${R.map(c => `<option value="${c.k}"${ABF.cls === c.k ? ' selected' : ''}>${cnm(c.g, c.s)}</option>`).join('')}</select>`;
  const weekStart = () => { const d = gd(today()); d.setDate(d.getDate() - d.getDay()); return isoOf(d); };
  const RNG = { w: ['هذا الأسبوع', d => d >= weekStart()], m: ['آخر ٣٠ يومًا', d => (gd(today()) - gd(d)) / 864e5 < 30], a: ['كل الأيام', () => true] };
  // الحصر التراكمي: لكل طالبة غابت مرة على الأقل
  function absSum(A, days) {
    const S = new Map();
    days.forEach(d => absDay(A, d).forEach(c => c.st.forEach(o => { if (!o.rec) return;
      const k = c.k + '|' + o.n, x = S.get(k) || { n: o.n, g: c.g, s: c.s, k: c.k, full: 0, ab: 0, rec: 0, dd: 0 };
      x.rec += o.rec; x.ab += o.ab; x.dd++; if (o.full) x.full++; S.set(k, x); })));
    return [...S.values()].filter(x => x.ab).map(x => ({ ...x, pct: Math.round(x.ab / x.rec * 100) })).sort((a, b) => b.full - a.full || b.ab - a.ab || a.n.localeCompare(b.n, 'ar'));
  }
  const level = (x, min) => x.full >= min ? ['r', 'تحتاج متابعة'] : x.full >= min - 1 || x.pct >= 25 ? ['y', 'قريبة من الحد'] : ['g', 'طبيعي'];
  function absPage(A, a) {
    const [, tab0, x = ''] = String(a).split('/'), tab = ABT.some(t => t[0] === tab0) ? tab0 : 'c', days = absDays(A);
    const iso = /^\d{4}-\d\d-\d\d$/.test(x) ? x : days[0] || '';
    const tabs = `<div class="ab-tabs">${ABT.map(([k, l], i) => `<button class="${k === tab ? 'on' : ''}" data-go="abs/${k}${(k === 'c' || k === 'f') && iso ? '/' + iso : ''}">${ad(i + 1)} · ${l}</button>`).join('')}</div>`;
    const day = (tab === 'c' || tab === 'f') && iso;   // في صفحتي اليوم: نموذج الوزارة نفسه الذي تنزّله مسؤولة الغياب (المستخدمة 2026-10-28 بدل Excel)
    const tools = `<div class="ab-act">${day ? `<button class="btn sm" data-absof="${iso}">تنزيل تقرير الغياب على مستوى حصة</button>` : ''}${tab === 'c' ? '' : `<button class="btn sm${day ? ' ghost' : ''}" data-absprint="1">طباعة هذه الصفحة / PDF</button>`}</div>`;
    const hero = (h, p) => `<div class="card hero th-hero"><div class="grow"><h2>${h}</h2><p class="muted">${p}</p></div></div>`;
    if (!days.length) return hero('حصر الطالبات الغائبات', 'من ملفات حضور حصص التيمز') + tabs + '<div class="empty card">لم تصل ملفات حضور بعد</div>';
    let body = '', title = '';
    if (tab === 'c' || tab === 'f') {
      const R = absDay(A, iso), RF = R.filter(c => !ABF.cls || c.k === ABF.cls), day = `${DAYS[wday(iso)]} ${hijT(iso)}`;
      const nav = dayNav(days, iso, `abs/${tab}/`);
      if (tab === 'c') {
        // نموذج الوزارة نفسه الذي عند مسؤولة الغياب (المستخدمة 2026-10-28: «استبدل الصفحة… بنفس نموذج التقرير»)
        title = `تقرير الغياب على مستوى حصة — ${day}`; ABX = 1;
        const logo = new URL('moe-logo.png', location.href).href;
        body = nav + classReports(A, iso).map(c => `<div class="card pad at-of">${officialPage(c, iso, logo)}</div>`).join('');
      } else {
        title = `الغياب الكامل والجزئي — ${day}`;
        const all = RF.flatMap(c => c.st.filter(o => o.ab).map(o => ({ ...o, c }))), F = all.filter(o => o.full), Pt = all.filter(o => !o.full);
        ABX = [['الحالة', 'الفصل', 'الطالبة', 'حصص الغياب'], ...F.map(o => ['طوال اليوم', cnm(o.c.g, o.c.s), o.n, '']), ...Pt.map(o => ['بعض الحصص', cnm(o.c.g, o.c.s), o.n, o.s.map((v, i) => v === 'a' ? 'ح' + (i + 1) : '').filter(Boolean).join(' ')])];
        body = nav + `<div class="ab-sts">${stat(F.length, 'غائبة طوال اليوم', '#dc2626')}${stat(Pt.length, 'غائبة عن بعض الحصص', '#d97706')}
            ${stat(RF.reduce((s, c) => s + c.names.length, 0), 'طالبات الفصول المرصودة')}${stat(RF.reduce((s, c) => s + c.nf, 0), 'حصص غير مرصودة', '#6b7280')}</div>
          <div class="ab-f">${clsSel(R)}</div>
          <div class="ab-2"><div><h3 class="ab-h r">غائبة طوال اليوم <small>(كل الحصص المرصودة)</small></h3><div class="card pad">${F.length ? F.map(o => `<div class="ab-r"><span>${nmBtn(o.n)}</span><span class="chip">${cnm(o.c.g, o.c.s)}</span></div>`).join('') : '<div class="muted ab-sm">لا أحد</div>'}</div></div>
            <div><h3 class="ab-h y">غائبة عن بعض الحصص</h3><div class="card pad">${Pt.length ? Pt.map(o => `<div class="ab-r"><span>${nmBtn(o.n)} <span class="chip">${cnm(o.c.g, o.c.s)}</span></span>${absent(o.s)}</div>`).join('') : '<div class="muted ab-sm">لا أحد</div>'}</div></div></div>`;
      }
    } else if (tab === 's') {
      const D2 = days.filter(RNG[ABF.rng][1]), L = absSum(A, D2).filter(x => !ABF.cls || x.k === ABF.cls), R = absDay(A, days[0]);
      const lv = L.map(x => level(x, ABF.min)), need = lv.filter(v => v[0] === 'r').length, near = lv.filter(v => v[0] === 'y').length;
      title = `الحصر التراكمي — ${RNG[ABF.rng][0]}`;
      ABX = [['م', 'الطالبة', 'الفصل', 'أيام غياب كامل', 'حصص الغياب', 'من الحصص المرصودة', 'نسبة الغياب', 'الحالة'], ...L.map((x, i) => [i + 1, x.n, cnm(x.g, x.s), x.full, x.ab, x.rec, x.pct + '%', lv[i][1]])];
      body = `<div class="ab-f"><select data-absf="rng">${Object.entries(RNG).map(([k, [l]]) => `<option value="${k}"${ABF.rng === k ? ' selected' : ''}>${l}</option>`).join('')}</select>${clsSel(R)}
          <select data-absf="min">${[2, 3, 4, 5].map(n => `<option value="${n}"${ABF.min === n ? ' selected' : ''}>حد المتابعة: ${ad(n)} ${n === 2 ? 'يومان' : 'أيام'} غياب كامل</option>`).join('')}</select></div>
        <div class="ab-sts">${stat(D2.length, 'أيام تعليم عن بُعد مرصودة')}${stat(need, 'تحتاج متابعة', '#dc2626')}${stat(near, 'قريبة من الحد', '#d97706')}${stat(L.length, 'طالبات غبن مرة أو أكثر')}</div>
        ${L.length ? `<div class="card ab-tw"><table class="ab-t"><thead><tr><th>م</th><th>الطالبة</th><th>الفصل</th><th>أيام غياب كامل</th><th>حصص الغياب</th><th>نسبة الغياب</th><th>الحالة</th></tr></thead><tbody>
          ${L.map((x, i) => `<tr><td>${ad(i + 1)}</td><td>${nmBtn(x.n)}</td><td>${cnm(x.g, x.s)}</td><td>${ad(x.full)}</td><td>${ad(x.ab)} <small class="muted">من ${ad(x.rec)}</small></td>
            <td><span class="ab-bar"><i style="width:${x.pct}%"></i></span> ${ad(x.pct)}٪</td><td><span class="ab-lv ${lv[i][0]}">${lv[i][1]}</span></td></tr>`).join('')}</tbody></table></div>`
          : '<div class="empty card">لا غياب في هذه المدة</div>'}`;
    } else {
      const all = Object.entries(A.roster).flatMap(([k, ns]) => ns.map(n => ({ n, k }))), me = all.find(o => o.n === ABF.who);
      title = me ? `سجل غياب الطالبة ${me.n}` : 'بطاقة الطالبة';
      const inp = `<div class="ab-f ab-q"><input list="ab-names" data-absf="who" value="${esc(ABF.who)}" placeholder="اكتبي اسم الطالبة…" autocomplete="off">
        <datalist id="ab-names">${all.map(o => `<option value="${esc(o.n)}">${cnm(...o.k.split('-').map(Number))}</option>`).join('')}</datalist></div>`;
      ABX = null;
      if (!me) body = inp + `<div class="empty card">${ABF.who ? 'لم يُعثر على الاسم — اختاريه من القائمة' : 'اكتبي جزءًا من الاسم ثم اختاريه من القائمة، أو اضغطي اسم أي طالبة في الصفحات الأخرى'}</div>`;
      else {
        const [g, s] = me.k.split('-').map(Number), H2 = days.slice().reverse().map(d => ({ d, o: (absDay(A, d).find(c => c.k === me.k) || { st: [] }).st.find(o => o.n === me.n) })).filter(h => h.o && h.o.rec);
        const full = H2.filter(h => h.o.full).length, ab = H2.reduce((t, h) => t + h.o.ab, 0), rec = H2.reduce((t, h) => t + h.o.rec, 0);
        ABX = [['اليوم', 'التاريخ', 'حصص الغياب', 'الحالة'], ...H2.map(h => [DAYS[wday(h.d)], hijT(h.d), h.o.s.map((v, i) => v === 'a' ? 'ح' + (i + 1) : '').filter(Boolean).join(' '), h.o.full ? 'غائبة طوال اليوم' : h.o.ab ? h.o.ab + ' حصص' : 'حاضرة'])];
        body = inp + `<div class="card pad"><div class="ab-pr"><span class="ab-av">${esc(me.n.trim()[0] || '')}</span><div><b>${esc(me.n)}</b><div class="muted ab-sm">${cls(g, s)}، ${ad(H2.length)} ${H2.length > 2 && H2.length < 11 ? 'أيام' : 'يومًا'} عن بُعد مرصودة</div></div></div>
          <div class="ab-sts">${stat(full, 'أيام غياب كامل', '#dc2626')}${stat(ab, `حصص غياب من ${ad(rec)}`, '#d97706')}${stat(rec ? Math.round(ab / rec * 100) + '٪' : '—', 'نسبة الغياب')}</div>
          ${LEG}<div class="ab-cal">${H2.map(h => `<div class="ab-d"><div class="ab-dh">${DAYS[wday(h.d)]} ${hij(h.d)}${h.o.full ? '<span class="chip s-none">طوال اليوم</span>' : h.o.ab ? `<span class="chip s-part">${ad(h.o.ab)} ${h.o.ab === 1 ? 'حصة' : h.o.ab === 2 ? 'حصتان' : 'حصص'}</span>` : '<span class="chip s-ok">حاضرة</span>'}</div>${pchips(h.o.s)}</div>`).join('')}</div></div>`;
      }
    }
    window.__absTitle = title;
    return hero('حصر الطالبات الغائبات', 'من ملفات حضور حصص التيمز · الحصص التي لم يصل ملفها لا تُحسب غيابًا') + tabs
      + `<div class="ab-bar0"><b>${esc(title)}</b>${ABX ? tools : ''}</div><div id="abp">${body}</div>`;
  }
  function absPrint() {
    const el = document.getElementById('abp'); if (!el) return; const w = window.open('', '_blank'); if (!w) return;
    const c = el.cloneNode(true); c.querySelectorAll('.at-nav,.ab-f').forEach(x => x.remove());
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>${esc(window.__absTitle || 'حصر الغائبات')}</title><style>${ACSS}
      body{margin:0;padding:10mm;font-family:Tahoma,Arial,sans-serif;color:#111;font-size:12.5px}.card{border:1px solid #ddd;border-radius:8px;margin-bottom:8px;break-inside:avoid}.pad{padding:8px 10px}
      .chip{font-size:11px;border-radius:99px;padding:1px 8px;background:#f3f4f6}.s-none{background:#fee2e2;color:#b91c1c}.s-part{background:#fef3c7;color:#92400e}.s-ok{background:#dcfce7;color:#166534}
      .muted{color:#6b7280}h1{font-size:16px;margin:0 0 4px}.ab-nm{all:unset}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>
      <body><h1>${esc(window.__absTitle || '')}</h1><div class="muted" style="margin-bottom:8px">المتوسطة الحادية والعشرون · من ملفات حضور حصص التيمز · طُبع ${hijT(today())}</div>${c.innerHTML}</body></html>`);
    w.document.close(); let done = 0; const pr = () => { if (!done++) w.print(); }; w.onload = pr; setTimeout(pr, 1200);
  }
  // «تقرير الغياب على مستوى حصة» (officialPage) لكل فصول اليوم، أو للفصل المختار في «غياب كامل / جزئي»
  function absOfficial(A, iso) {
    printOfficial(classReports(A, iso).filter(c => !ABF.cls || c.k === ABF.cls), iso);
  }
  if (!window.__absEv) { window.__absEv = 1;
    document.addEventListener('change', e => { const t = e.target; if (!t.matches || !t.matches('[data-absf]')) return;
      const k = t.dataset.absf; ABF[k] = k === 'min' ? +t.value : t.value; if (k !== 'who' || !t.value || Object.values(D.att.roster).some(L => L.includes(t.value))) route(); });
    document.addEventListener('click', e => { const t = e.target.closest ? e.target : null; if (!t) return;
      const p = t.closest('[data-absp]'); if (p) { ABF.who = p.dataset.absp; location.hash = 'abs/p'; route(); return; }
      const of = t.closest('[data-absof]'); if (of) { absOfficial(D.att, of.dataset.absof); return; }
      if (t.closest('[data-absprint]')) absPrint(); });
  }
  const ACSS = `.ab-ps{display:inline-flex;gap:3px;flex-wrap:wrap;direction:rtl}.ab-p{font-style:normal;font-size:11px;min-width:25px;text-align:center;border-radius:5px;padding:2px 3px;line-height:1.4}
    .ab-p.a{background:#dc2626;color:#fff}.ab-p.h{background:#dcfce7;color:#166534}.ab-p.n{background:repeating-linear-gradient(45deg,#e5e7eb 0 4px,#f9fafb 4px 8px);color:#6b7280}.ab-p.x{background:transparent;color:#c7c7c7;border:1px dashed #e5e7eb}
    .ab-leg{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:#6b7280;margin:6px 4px 12px}.ab-leg .ab-p{margin-left:4px}
    .ab-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:12px}.ab-c h3{margin:0 0 6px;font-size:15.5px;display:flex;justify-content:space-between;align-items:center;gap:8px}
    .ab-r{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;border-top:1px dashed var(--line,#e5e7eb);font-size:14px;flex-wrap:wrap}.ab-r:first-of-type{border-top:0}
    .ab-sm{font-size:12.5px}.ab-sts{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:0 0 12px}
    .ab-st{background:var(--card,#fff);border:1px solid var(--line,#e5e7eb);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column}.ab-st b{font-size:24px}.ab-st span{font-size:12.5px;color:var(--muted,#6b7280)}
    .ab-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ab-h{font-size:15px;margin:0 0 6px;padding:7px 12px;border-radius:10px}.ab-h small{font-weight:400;font-size:12px}.ab-h.r{background:#fee2e2;color:#b91c1c}.ab-h.y{background:#fef3c7;color:#92400e}
    .ab-tw{overflow-x:auto}.ab-t{width:100%;border-collapse:collapse}.ab-t th,.ab-t td{padding:8px 10px;text-align:right;border-bottom:1px solid var(--line,#e5e7eb);font-size:13.5px;white-space:nowrap}.ab-t th{font-size:12.5px;color:var(--muted,#6b7280)}
    .ab-bar{display:inline-block;vertical-align:middle;width:70px;height:8px;background:#eee;border-radius:4px;overflow:hidden}.ab-bar i{display:block;height:100%;background:#dc2626}
    .ab-lv{font-size:12px;border-radius:99px;padding:2px 10px;font-weight:700}.ab-lv.r{background:#fee2e2;color:#b91c1c}.ab-lv.y{background:#fef3c7;color:#92400e}.ab-lv.g{background:#dcfce7;color:#166534}
    .ab-pr{display:flex;gap:12px;align-items:center;margin-bottom:12px}.ab-pr b{font-size:16.5px}.ab-av{width:50px;height:50px;border-radius:50%;background:var(--soft,#eee);display:grid;place-items:center;font-weight:800;font-size:21px}
    .ab-cal{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px}.ab-d{border:1px solid var(--line,#e5e7eb);border-radius:10px;padding:8px}.ab-dh{display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:13px;font-weight:700;margin-bottom:6px}
    @media(max-width:700px){.ab-2{grid-template-columns:1fr}}`;
  const ABCSS = ACSS + `.ab-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px}.ab-tabs button{font:inherit;font-size:13.5px;border:1px solid var(--line,#e5e7eb);background:var(--card,#fff);color:inherit;border-radius:99px;padding:7px 14px;cursor:pointer}
    .ab-tabs button.on{background:var(--brand,#6b5d82);color:#fff;border-color:var(--brand,#6b5d82)}
    .ab-bar0{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin:0 2px 10px}.ab-bar0 b{font-size:15px}.ab-act{display:flex;gap:6px}
    .ab-f{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.ab-f select,.ab-f input{font:inherit;padding:7px 10px;border:1px solid var(--line,#e5e7eb);border-radius:9px;background:var(--card,#fff);color:inherit}.ab-q input{flex:1;min-width:0;padding:10px 14px}
    .ab-nm{all:unset;cursor:pointer;border-bottom:1px dotted currentColor}.ab-nm:hover{color:var(--brand,#6b5d82)}
    @media(max-width:520px){.ab-tabs button{flex:1 1 45%;padding:7px 8px;font-size:12.5px}}`;
  if (!document.getElementById('abs-css')) { const st = document.createElement('style'); st.id = 'abs-css'; st.textContent = ABCSS; document.head.appendChild(st); }
  const TH = new Map();   // صور مصغرة مفكوكة في هذه الجلسة: الملف ← رابط blob
  async function thumbs() {
    for (const el of document.querySelectorAll('[data-attth]')) {
      const [iso, ...n] = el.dataset.attth.split('|'), x = ((D.att.pdf || {})[iso] || {})[n.join('|')]; el.removeAttribute('data-attth'); if (!x || !x.t) continue;
      try { let u = TH.get(x.t); if (!u) { u = URL.createObjectURL(new Blob([await unseal(x.t, x.k)], { type: 'image/jpeg' })); TH.set(x.t, u); }
        el.innerHTML = `<img src="${u}" alt="الصفحة الأولى من تقرير الحصص">`; } catch (e) { /* تبقى البطاقة بلا صورة */ }
    }
  }
  async function sendEv(iso, btn) {
    const A = D.att, nm = me(A).name, E = EVP.filter(x => x.iso === iso); if (!E.length) return;
    btn.disabled = true; btn.textContent = 'جارٍ الإرسال…'; const base = evCount(A, iso).n; let ok = 0;
    for (const x of E) {
      try {
        const f = typeof shrinkImage === 'function' ? await shrinkImage(x.file) : x.file;
        if (!A.demo) await sealSend({ kind: 'att-ev', name: A.who, day: iso, file: f.name, type: f.type || 'image/jpeg', size: f.size }, new Uint8Array(await f.arrayBuffer()));
        URL.revokeObjectURL(x.url); EVP.splice(EVP.indexOf(x), 1); ok++;
      } catch (e) {}
    }
    if (ok) eset([...eget(), { to: nm, iso, base, n: ok, at: Date.now() }]);
    route(); if (typeof toast === 'function') toast(ok === E.length ? (A.demo ? 'معاينة: لم تُرسل فعليًا' : 'تم إرسال الصور ✓') : 'تعذّر إرسال بعض الصور، تحققي من الاتصال وأعيدي الإرسال');
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
    const dup = f => f.t0 && r.cells.some(c => c.f && c.f !== f && c.f.t0 === f.t0);   // نسخة ثانية من ملف حصة مُرسلة (يُحذف بزر «حذف»)
    return `<div class="card hero th-hero"><div class="grow"><h2>توثيق حصص التيمز — ${DAYS[wday(iso)]} ${hij(iso)}</h2>
        <p class="muted">${nP ? (r.sent ? `أرسلتِ ${ad(r.sent)} من ${ad(nP)} ${word(nP)}` : `لم ترسلي بعد · ${nP === 1 ? 'حصة واحدة' : nP === 2 ? 'حصتان' : ad(nP) + ' ' + word(nP)} اليوم`) : 'لا توجد لكِ حصص في هذا اليوم حسب الجدول'}</p></div>
        <div>${nP ? (r.sent === nP ? chipOf(1, 'أرسلتِ كل حصصك') : chipOf(0, `باقي ${ad(nP - r.sent)}`)) : ''}</div></div>
      ${dayNav(days, iso)}
      ${pdfCard(A, iso)}
      <div class="card pad at-act"><div><b>إرفاق ملفات الحضور</b><div class="muted" style="font-size:13px">نزّلي «تقرير الحضور» من Teams لكل حصة، واختاري الملفات كلها مرة واحدة؛ تُوزَّع على حصصك تلقائيًا.</div></div>
        <label class="btn">اختيار الملفات<input type="file" multiple accept=".csv,text/csv" data-attf hidden></label></div>
      <div class="card at-wrap"><table class="at-t at-tt"><thead><tr><th>الحصة</th><th>الصف</th><th>المادة / الوقت</th><th>الحاضرات</th><th>الحالة</th></tr></thead><tbody>
      ${rows.map(({ c, q }) => `<tr class="${c.f ? 'ok' : q ? 'rd' : ''}"><td>ح${ad(c.p)}</td><td>${cls(c.g, c.s)}</td><td>${info(c.f || q?.f)}</td><td>${cnt(c.f || q?.f, c)}</td>
        <td>${c.f ? chipOf(1, c.f.wait ? '✓ أُرسل · قيد النقل' : '✓ أُرسل') + del(c.f) : q ? `<span class="chip s-part">جاهز للإرسال</span>${drop(q)}` : chipOf(0, 'لم يُرفق')}</td></tr>`).join('')}
      ${r.extra.map(f => `<tr class="ok"><td>${f.p ? 'ح' + ad(f.p) : '—'}</td><td>${f.g ? cls(f.g, f.s) : '؟'}</td><td>${info(f)}</td><td>${cnt(f, f)}</td><td>${chipOf(1, f.wait ? '✓ أُرسل · قيد النقل' : '✓ أُرسل')} <span class="chip s-part">${dup(f) ? 'ملف مكرر' : 'خارج جدولك'}</span>${del(f)}</td></tr>`).join('')}
      ${extraP.map(q => `<tr class="rd"><td>${q.f.p ? 'ح' + ad(q.f.p) : '—'}</td><td>${q.f.g ? cls(q.f.g, q.f.s) : 'لم يُعرف الفصل'}</td><td>${info(q.f)}</td><td>${cnt(q.f, q.f)}</td>
        <td><span class="chip s-part">خارج جدولك</span>${drop(q)}</td></tr>`).join('')}
      ${!rows.length && !extraP.length && !r.extra.length ? '<tr><td colspan="5" class="muted">لا توجد حصص</td></tr>' : ''}
      </tbody></table></div>
      ${errs.length ? `<div class="card pad" style="color:#b91c1c">${errs.map(x => `«${esc(x.name)}»: ${esc(x.err)}${drop(x)}`).join('<br>')}</div>` : ''}
      <div class="at-act" style="justify-content:flex-end"><button class="btn" data-attsend="${iso}" ${P.length ? '' : 'disabled'}>إرسال${P.length ? ` (${ad(P.length)})` : ''}</button></div>
      ${evCard(A, iso)}
      <p class="muted" style="font-size:12.5px;margin:8px 4px">يُحفظ كل ملف في مجلدك داخل «رصد الغياب منصة التيمز» على ون درايف ويصل لمسؤولة الغياب خلال دقائق.</p>`;
  }
  async function readFiles(files) {
    const A = D.att;
    for (const file of files) {
      try {
        if (file.size > 2 * 1024 * 1024) throw new Error('الملف أكبر من المسموح');
        const r = TEAMS.parse(await file.arrayBuffer()); if (!r.start || !r.students.length) throw new Error('الملف ليس «تقرير حضور» من Teams');
        const iso = isoOf(r.start), nm = me(A).name;
        // مكرر = الاسم نفسه أو الاجتماع نفسه (وقت البداية نفسه) ولو بُدّل اسم الملف، مثل «… (2).csv» (المستخدمة 2026-10-27)
        const f = lessonOf(A, r, file.name), old = [...PEND.filter(x => x.f && x.iso === iso).map(x => x.f), ...(A.days?.[iso]?.[nm] || [])];
        if (old.some(x => x.file === file.name || (f.t0 && x.t0 === f.t0))) throw new Error('ملف مكرر — هذه الحصة أُرفقت من قبل');
        PEND.push({ iso, file, f });
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
      if (t.matches && t.matches('[data-attday]')) location.hash = (t.dataset.attday || 'att/d/') + t.value;
      if (t.matches && t.matches('[data-atti]') && t.files.length) { const iso = t.dataset.atti, bad = [];
        [...t.files].forEach(file => /^image\//.test(file.type) || /\.(jpe?g|png|heic|heif|webp)$/i.test(file.name) ? EVP.push({ iso, file, url: URL.createObjectURL(file) }) : bad.push(file.name));
        if (bad.length && typeof toast === 'function') toast('تُقبل الصور فقط'); route(); } });
    document.addEventListener('click', e => { const t = e.target.closest ? e.target : null; if (!t) return;
      const dr = t.closest('[data-attdrop]'); if (dr) { PEND.splice(+dr.dataset.attdrop, 1); route(); return; }
      const ed = t.closest('[data-attevdrop]'); if (ed) { const x = EVP.splice(+ed.dataset.attevdrop, 1)[0]; x && URL.revokeObjectURL(x.url); route(); return; }
      const vs = t.closest('[data-attsel]'); if (vs) { VSEL = vs.dataset.attsel; route();
        if (innerWidth < 760) document.querySelector('.at-pv')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      const pb = t.closest('[data-attpdf]'); if (pb) { const [iso, ...n] = pb.dataset.attpdf.split('|'); getPdf(iso, n.join('|'), pb); return; }
      const ss = t.closest('[data-attsubjsave]'); if (ss) { saveSubj(ss); return; }
      const es = t.closest('[data-attevsend]'); if (es) { sendEv(es.dataset.attevsend, es); return; }
      const dl = t.closest('[data-attdel]'); if (dl) { const [iso, ...f] = dl.dataset.attdel.split('|'); remove(iso, f.join('|'), dl); return; }
      const sb = t.closest('[data-attsend]'); if (sb) send(sb.dataset.attsend, sb); });
  }

  const CSS = `.at-g{padding:6px 10px}.at-gr{display:grid;grid-template-columns:minmax(140px,1.2fr) minmax(0,4.6fr) minmax(86px,auto) minmax(120px,1.3fr);gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid var(--line,#e5e7eb)}
    .at-gr:last-child{border-bottom:0}.at-gh{font-size:12.5px;color:var(--muted,#6b7280);font-weight:600;padding:4px 0}.at-gh .at-gc span{background:none;color:inherit}
    .at-gn{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.at-gn b{font-size:14px}.at-ga{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
    .at-gc{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}.at-gc span{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:34px;border-radius:8px;font-size:12.5px;font-weight:600;line-height:1.2}
    .at-gc span.ok{background:#e6f4ec;color:#1e7f4f}.at-gc span.miss{background:#fbf1dc;color:#8a5a00}.at-gc i{display:none;font-style:normal;font-size:10.5px;font-weight:400;opacity:.75}
    .at-gr:not(.at-gh) .at-gc span.no{background:var(--soft,#f6f6f4);opacity:.45}
    @media (max-width:760px){.at-gh{display:none}.at-gr{grid-template-columns:1fr auto;gap:8px;padding:10px 0}.at-gn{grid-column:1/-1}.at-gc{grid-column:1/-1;gap:3px}
      .at-gc i{display:block}.at-gc span{min-height:40px;font-size:11.5px}.at-ga{justify-content:flex-end}}
    .at-ah{display:flex;align-items:center;gap:8px;font-size:16px;margin:20px 2px 12px}.at-ah small{font-weight:400;color:var(--muted,#6b7280);font-size:13px}.at-ah::after{content:"";flex:1;height:1px;background:var(--line,#e5e7eb)}
    .at-al{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:22px 18px}.at-doc{display:flex;flex-direction:column;gap:3px}.at-doc>b{margin-top:8px;font-size:14.5px}.at-doc>small{color:var(--muted,#6b7280);font-size:12.5px}
    .at-doc .at-tb{justify-content:flex-start;margin-top:6px}.at-stk{position:relative;margin:0 0 8px 8px;cursor:pointer}
    .at-stk::before,.at-stk::after{content:"";position:absolute;inset:0;background:#fff;border:1px solid var(--line,#e5e7eb);border-radius:8px}
    .at-stk::before{transform:translate(-8px,8px) rotate(-2deg)}.at-stk::after{transform:translate(-4px,4px) rotate(-1deg)}.at-stk .at-th{position:relative;z-index:1;background:#fff}
    .at-pg{position:absolute;z-index:2;top:8px;left:8px;background:rgba(43,36,30,.8);color:#fff;border-radius:99px;padding:1px 9px;font-size:12px}
    .at-wl{display:flex;flex-wrap:wrap;gap:6px}
    @media (max-width:560px){.at-al{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 14px}}
    .at-v{display:grid;grid-template-columns:300px minmax(0,1fr);gap:14px;align-items:start}.at-v>.card{margin:0}
    .at-ls{padding:6px}.at-li{display:flex;align-items:center;gap:10px;width:100%;font:inherit;color:inherit;text-align:start;background:none;border:0;border-radius:10px;padding:10px;cursor:pointer}
    .at-li:hover{background:var(--soft,#f6f6f4)}.at-li.on{background:#efeaf6;outline:1px solid #cfc4e2}.at-li i{width:10px;height:10px;border-radius:50%;background:var(--ok,#1e7f4f);flex:none}
    .at-li small{margin-inline-start:auto;color:var(--muted,#6b7280)}.at-li.w{color:var(--muted,#6b7280);cursor:default}.at-li.w:hover{background:none}.at-li.w i{background:#d8b56a}
    .at-sep{padding:8px 10px 2px;font-size:12.5px;color:var(--muted,#6b7280)}
    .at-pv{display:grid;grid-template-columns:minmax(0,330px) 1fr;gap:18px;padding:16px;align-items:start;position:sticky;top:12px}.at-pv0{text-align:center}
    .at-meta h3{margin:0;font-size:20px}.at-meta dl{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;margin:12px 0 18px}.at-meta dt{color:var(--muted,#6b7280)}.at-meta dd{margin:0;font-weight:600}
    @media (max-width:900px){.at-pv{grid-template-columns:1fr}.at-pv .at-th{max-width:360px;width:100%;margin:0 auto}}
    @media (max-width:760px){.at-v{grid-template-columns:1fr}.at-pv{position:static;order:-1}}
    .at-th{aspect-ratio:210/297;border:1px solid var(--line,#e5e7eb);border-radius:8px;overflow:hidden;background:var(--soft,#f6f6f4);display:flex;align-items:center;justify-content:center;color:var(--muted,#9ca3af);font-size:12.5px}
    .at-th[data-attpdf]{cursor:pointer}.at-th img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;background:#fff}.at-tb{display:flex;gap:6px;justify-content:center}
    .at-wrap{overflow-x:auto;padding:0}.at-t{width:100%;border-collapse:collapse;font-size:13.5px;min-width:600px}
    .at-t th,.at-t td{border-bottom:1px solid var(--line,#e5e7eb);padding:8px 6px;text-align:center}.at-t th{background:var(--soft,#f6f6f4);font-weight:700}
    .at-t td.nm{text-align:right;white-space:nowrap;font-weight:600}.at-t td.ok{background:#e7f6ec;color:#166534}.at-t td.miss{background:#fdecec;color:#b91c1c}
    .at-t td i{display:block;font-style:normal;font-size:12px}.at-t td.no{background:transparent}.at-tt tr.ok td{background:#e7f6ec}.at-tt tr.rd td{background:#fff7e6}
    .at-nav{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin:10px 0}.at-nav select{font:inherit;padding:6px 10px;border-radius:10px;border:1px solid var(--line,#ccc);background:var(--card,#fff);min-width:200px}
    .at-act{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:10px 0}.at-of{overflow-x:auto}.at-sj{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px;font-size:14px}.at-sj input{font:inherit;padding:6px 10px;border-radius:10px;border:1px solid var(--line,#ccc);min-width:200px;margin-right:6px}.at-evs{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.at-ev{position:relative}.at-ev img{width:92px;height:92px;object-fit:cover;border-radius:10px;border:1px solid var(--line,#e5e7eb);display:block}.at-ev button{position:absolute;top:4px;left:4px;padding:0 8px;background:#fff}.at-of .of{min-width:760px}`;
  const OCSS = `.of{color:#111;font-size:12.5px}.of-h{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.of-h img{height:62px}
    .of-r,.of-l{font-weight:700;font-size:11.5px;line-height:1.7}.of-l span{display:inline-block;min-width:78px}.of-t{text-align:center;margin:4px 0 8px;font-size:15px}
    .of-g{width:100%;border-collapse:collapse;table-layout:fixed}.of-g th,.of-g td{border:1px solid #333;padding:3px 4px;text-align:center;height:22px}
    .of-g thead th{background:#cfdcef;color:#1f3b6e}.of-g .m{width:34px}.of-g .nm{width:38%;text-align:right;color:#b45309;font-weight:700}.of-g td.m{background:#cfdcef;font-weight:700}
    .of-g td.g{color:#b91c1c;font-weight:800}.of-g td.t{color:#1d4ed8;font-weight:800}.of-g .nf,.nfk{background:repeating-linear-gradient(45deg,#ddd 0 4px,#f4f4f4 4px 8px)}
    .of-k{display:flex;gap:22px;flex-wrap:wrap;margin:8px 0;font-size:12px}.of-k b{border:1px solid #333;padding:0 5px;margin-left:4px}.nfk{display:inline-block;width:18px;height:12px;border:1px solid #333;vertical-align:middle;margin-left:4px}
    .of-sj{display:block;font-size:9.5px;font-weight:400;line-height:1.3;color:#334}.of-u{font-size:11.5px;color:#92400e;margin:4px 0}.of-s{text-align:center;width:260px;margin:10px auto 0;font-weight:700;line-height:1.8}`;
  if (!document.getElementById('att-css')) { const st = document.createElement('style'); st.id = 'att-css'; st.textContent = CSS + OCSS; document.head.appendChild(st); }

  // --- «تقرير المعلمة في منصة مدرستي» (نموذج المستخدمة 2026-10-26: تقرير_الحصة_05-04-1448): ملف PDF واحد للمعلمة في اليوم،
  // صفحة لكل حصة + صفحة أخيرة لصور «توثيق شواهد الحصة». يبنيه tools/att-pdf.js على الجهاز (Edge) ويحفظه في مجلد اليوم.
  const H = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PN = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة'], STG = ['', 'أول متوسط', 'ثاني متوسط', 'ثالث متوسط'];
  const WN = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر', 'الثالث عشر',
    'الرابع عشر', 'الخامس عشر', 'السادس عشر', 'السابع عشر', 'الثامن عشر', 'التاسع عشر'];
  // الأسبوع الدراسي كما في tools/export.js schoolWeek: ١٣ أسبوعًا من الأحد ٢٣/٨/٢٠٢٦ ثم ٦ من ٢٩/١١/٢٠٢٦
  const weekOf = iso => { const d = gd(iso); let w = 0; for (let i = 0; i < 19; i++) if (d >= (i < 13 ? new Date(2026, 7, 23 + 7 * i) : new Date(2026, 10, 29 + 7 * (i - 13)))) w = i + 1; return w; };
  const pct = (a, t) => t ? Math.round(a / t * 1000) / 10 : 0;
  function pie(a, b) {
    const t = a + b; if (!t) return '';
    const f = a / t, A = f * 2 * Math.PI, pt = (r, ang) => `${(80 + r * Math.sin(ang)).toFixed(1)} ${(80 - r * Math.cos(ang)).toFixed(1)}`;
    const shape = f >= 1 ? '<circle cx="80" cy="80" r="70" fill="#12a37a"/>' : f <= 0 ? '<circle cx="80" cy="80" r="70" fill="#c9b68c"/>'
      : `<circle cx="80" cy="80" r="70" fill="#c9b68c"/><path d="M80 80 L${pt(70, 0)} A70 70 0 ${f > .5 ? 1 : 0} 1 ${pt(70, A)} Z" fill="#12a37a"/>`;
    const lab = (v, ang) => v ? `<text x="${pt(42, ang).split(' ')[0]}" y="${pt(42, ang).split(' ')[1]}" text-anchor="middle" dominant-baseline="middle">${ad(Math.round(v / t * 100))}٪</text>` : '';
    return `<svg viewBox="0 0 160 160" width="170" height="170">${shape}<g fill="#fff" font-size="13" font-weight="700">${lab(a, A / 2)}${lab(b, A + (2 * Math.PI - A) / 2)}</g></svg>`;
  }
  function teacherPage(A, nm, iso, f, subj, logo) {
    const L = lesson(A, f), n = L.names.length, h = L.here.length;
    return `<section class="tp">
      <div class="tp-h"><div class="tp-r">المملكة العربية السعودية<br>وزارة التعليم<br>إدارة التعليم بمنطقة عسير<br>المتوسطة الحادية والعشرون</div>${logo ? `<img src="${logo}" alt="">` : ''}</div>
      <h1>تقرير المعلمة: <b>${H(short(nm))}</b> في منصة مدرستي</h1>
      <table class="tp-t"><tr><th>المادة</th><th>المرحلة الدراسية</th><th>الفصل</th><th>الحصة</th></tr>
        <tr><td>${H(subj || '')}</td><td>${STG[f.g] || ''}</td><td>${ad(f.s)}</td><td>${PN[f.p] || '—'}</td></tr></table>
      <table class="tp-t"><tr><th>الأسبوع الدراسي</th><th>اليوم</th><th>التاريخ الهجري</th><th>وقت الحصة</th></tr>
        <tr><td>${WN[weekOf(iso)] || ''}</td><td>${DAYS[wday(iso)]}</td><td>${hij(iso)}</td><td>${f.p ? slot(f.p) : H(f.start + (f.end ? ' – ' + f.end : ''))}</td></tr></table>
      ${f.subj ? `<h2 class="tp-l">${H(f.subj)}</h2>` : ''}
      <table class="tp-t tp-st"><tr><th colspan="2" class="tp-c1">إحصائية الحضور</th></tr><tr><th>البيان</th><th>العدد</th></tr>
        <tr><td>عدد الطالبات الكلي</td><td>${ad(n)}</td></tr><tr><td>عدد الحاضرات الفعلي</td><td>${ad(h)}</td></tr><tr><td>نسبة الحضور</td><td>${ad(pct(h, n))}٪</td></tr></table>
      <div class="tp-g"><table class="tp-t tp-n"><tr><th colspan="2" class="tp-c2">أسماء الطالبات الحاضرات</th></tr><tr><th class="m">م</th><th>اسم الطالبة</th></tr>
          ${L.here.map((x, i) => `<tr><td class="m">${ad(i + 1)}</td><td class="nm">${H(x)}</td></tr>`).join('') || '<tr><td colspan="2">—</td></tr>'}</table>
        <div class="tp-pie"><b>نسبة الحضور مقابل عدد الطالبات</b>${pie(h, n - h)}<div class="tp-k"><span><i style="background:#12a37a"></i>الحاضرات</span><span><i style="background:#c9b68c"></i>الغائبات</span></div>
          <table class="tp-t tp-n tp-a"><tr><th colspan="2" class="tp-c3">أسماء الطالبات الغائبات</th></tr><tr><th class="m">م</th><th>اسم الطالبة</th></tr>
          ${L.absent.map((x, i) => `<tr><td class="m">${ad(i + 1)}</td><td class="nm">${H(x.n)}</td></tr>`).join('') || '<tr><td colspan="2">لا يوجد</td></tr>'}</table></div></div>
      <div class="tp-sg"><div>مديرة المدرسة:<br><b>أمينة آل مشيط</b></div><div>المعلمة:<br><b>${H(short(nm))}</b></div></div>
    </section>`;
  }
  const TCSS = `@page{size:A4;margin:10mm}*{box-sizing:border-box}body{margin:0;font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#1f2937;font-size:12.5px}
    .tp{page-break-after:always;break-after:page}.tp:last-child{page-break-after:auto;break-after:auto}
    .tp-h{display:flex;justify-content:space-between;align-items:flex-start}.tp-h img{height:64px}.tp-r{font-weight:700;font-size:11.5px;line-height:1.7}
    h1{text-align:center;font-size:17px;margin:6px 0 10px;color:#1f2937}h1 b{color:#0e7c86}
    .tp-t{width:100%;border-collapse:collapse;margin:0 0 10px;table-layout:fixed}.tp-t th,.tp-t td{border:1px solid #9ca3af;padding:5px 8px;text-align:center}
    .tp-t th{background:#14a5a8;color:#fff;font-weight:700}.tp-t tr:nth-child(even) td{background:#eef8f8}
    .tp-l{text-align:center;color:#0e9f8f;font-size:18px;margin:8px 0}.tp-st td:first-child{text-align:right}.tp-c1{background:#0e8f94!important}
    .tp-g{display:flex;gap:14px;align-items:flex-start;border:1px solid #9ca3af;padding:0}.tp-n{width:58%;margin:0;table-layout:auto}.tp-n th.m,.tp-n td.m{width:34px}
    .tp-n td.nm{text-align:right}.tp-n td{padding:2px 8px;font-size:11.5px}.tp-c2{background:#1f4b5c!important;text-align:right!important}.tp-n tr:nth-child(2) th{background:#1f4b5c}
    .tp-pie{flex:1;text-align:center;padding-top:16px;color:#1f4b5c}.tp-pie b{display:block;margin-bottom:8px}.tp-k{display:flex;justify-content:center;gap:16px;font-size:11px}
    .tp-a{width:100%;margin:12px 0 0}.tp-a th{background:#9a7b3f!important}.tp-c3{text-align:right!important}.tp-k i{display:inline-block;width:10px;height:10px;margin-left:4px;vertical-align:middle}
    .tp-sg{display:flex;justify-content:space-around;margin-top:16px;break-inside:avoid;font-weight:700;line-height:1.8;text-align:center}
    .tp-bar{background:#2b8fb0;color:#fff;text-align:center;padding:6px;font-weight:700;margin-top:4px}
    .tp-ims{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px}.tp-ims img{width:100%;max-height:70mm;object-fit:contain;border:1px solid #d1d5db;break-inside:avoid}`;
  // كل الملف: صفحات الحصص بترتيبها ثم الشواهد. imgs = روابط الصور (file:// على الجهاز)
  function dayDoc(A, nm, iso, { logo = '', imgs = [], subj = '' } = {}) {
    ready(A);
    const L = (((A.days || {})[iso] || {})[nm] || []).filter(f => f.g).slice().sort((a, b) => (a.p || 9) - (b.p || 9) || (a.t0 || 0) - (b.t0 || 0));
    const ev = imgs.length ? `<section class="tp"><div class="tp-h"><div class="tp-r">المملكة العربية السعودية<br>وزارة التعليم<br>إدارة التعليم بمنطقة عسير<br>المتوسطة الحادية والعشرون</div>${logo ? `<img src="${logo}" alt="">` : ''}</div>
      <h1>شواهد توثيق الحصص — ${DAYS[wday(iso)]} ${hij(iso)}</h1><div class="tp-bar">المعلمة: ${H(short(nm))}</div>
      <div class="tp-ims">${imgs.map(u => `<img src="${H(u)}" alt="">`).join('')}</div></section>` : '';
    return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير الحصص ${hijT(iso)}</title><style>${TCSS}</style></head>
      <body>${L.map(f => teacherPage(A, nm, iso, f, subj, logo)).join('')}${ev}</body></html>`;
  }

  window.ATT = {
    dayDoc,
    render(A, a) {
      ready(A);
      const [v, x] = String(a || '').split('/');
      if (v === 'all') return allReports(A);
      if (A.mode === 'teacher') return tPage(A, v === 'd' ? x : '');
      if (v === 'a' && (A.mode === 'view' || A.vw)) return absPage(A, a);   // الموجهة الطلابية والوكيلة
      if (A.mode === 'view') return viewPage(A, v === 'd' ? x : '', 'att/d/');
      if (v === 'v' && A.vw) return viewPage(A, x, 'att/v/');
      if (v === 'r') return reports(A, x);
      if (v === 'tt') return timetable(A);
      return home(A, v === 'd' ? x : '');
    },
  };
})();
