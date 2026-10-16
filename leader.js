/* بوابة رائدة النشاط — الأنشطة الصفية 1448هـ (المعلمات وبرامجهن من سجل خطة النشاط، والشواهد من أرشيف رائدة النشاط).
   تُحمَّل من index.html عند الدخول برمز رائدة النشاط؛ البيانات في data/l.json (مشفرة بالرمز) يبنيها tools/leader.js.
   LEADER.render(D, view, arg) يعيد HTML الصفحة؛ الأزرار data-go يربطها bind() في index.html. */
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ar = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const RLM = '‏';
  const hd = h => { if (!h) return '—'; const [y, m, d] = h.split('/').map(Number); return ar(d) + RLM + '/' + ar(m) + RLM + '/' + ar(y) + 'هـ'; };
  const WK = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر', 'السادس عشر', 'السابع عشر', 'الثامن عشر', 'التاسع عشر'];
  const per = n => { const U = ['', 'واحدة', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثماني', 'تسع', 'عشر'];
    return n === 1 ? 'حصة واحدة' : n === 2 ? 'حصتين' : n <= 10 ? U[n] + ' حصص' : n === 11 ? 'إحدى عشرة حصة' : n === 12 ? 'اثنتا عشرة حصة' : ar(n) + ' حصة'; };
  const DOM = { 'المواطنة والحياة': '#d9a400', 'الثقافة والفنون': '#e07b1a', 'الرياضة والصحة': '#d93f45', 'العلوم والتقنية': '#0b5d7a', 'النشاط الكشفي': '#0f97a8' };
  const day = g => { const [y, m, d] = g.split('/').map(Number); return Date.UTC(y, m - 1, d); };
  const now = new Date(), today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const ST = { wait: ['لم يبدأ', 'na'], run: ['جارٍ الآن', 'part'], done: ['انتهى', 'ok'], nodate: ['بلا تاريخ في السجل', 'none'] };
  const stateOf = p => !p.from || !p.to ? 'nodate' : today < day(p.from.g) ? 'wait' : today > day(p.to.g) ? 'done' : 'run';
  const evChip = p => p.ev.length ? `<span class="chip s-ok">${ar(p.ev.length)} شاهد</span>` : (p.s === 'done' || p.s === 'run') ? '<span class="chip s-none">لا شواهد</span>' : '<span class="chip s-na">—</span>';

  const CSS = `.ld-h{border-inline-start:5px solid var(--brand);padding:16px 18px;margin-bottom:14px}.ld-h h2{margin:0;font-size:19px}.ld-h p{margin:4px 0 0;color:var(--muted);font-size:13.5px}
.ld-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px}.ld-k .card{padding:12px 14px}.ld-k b{display:block;font-size:24px}.ld-k span{color:var(--muted);font-size:12.5px}
.ld-sec{margin:20px 0 10px;font-size:16px}.ld-links{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px}
.ld-tw{overflow-x:auto}.ld-t{width:100%;min-width:760px;border-collapse:separate;border-spacing:0;font-size:13.5px}
.ld-t th{background:var(--soft);color:var(--muted);font-weight:600;font-size:12.5px;text-align:start;padding:8px 10px;border-bottom:1px solid var(--line)}
.ld-t td{padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:middle}.ld-t tr:last-child td{border-bottom:0}
.ld-p{font-weight:700;border-inline-start:5px solid var(--c)}.ld-d{display:block;color:var(--muted);font-size:12px;font-weight:500}
.ld-w b{display:block;font-weight:600}.ld-w span{color:var(--muted);font-size:12px}
.ld-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
.ld-tb{display:flex;flex-direction:column;gap:6px;padding:14px 16px;text-align:start;cursor:pointer;font:inherit;color:var(--ink)}.ld-tb:hover{border-color:var(--brand)}
.ld-tb b{font-size:15.5px}.ld-tb small{color:var(--muted)}.ld-dots{display:flex;gap:6px;flex-wrap:wrap}
.ld-dg{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}.ld-db{display:flex;flex-direction:column;gap:4px;padding:14px 16px;text-align:start;cursor:pointer;font:inherit;color:var(--ink);border-top:5px solid var(--c)}.ld-db:hover{border-color:var(--c)}.ld-db b{font-size:16px}.ld-db small{color:var(--muted);font-size:12.5px}
.ld-dn{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}.ld-dn button{border:2px solid var(--c);background:var(--card);color:var(--ink);border-radius:999px;padding:5px 12px;font:inherit;font-size:13px;font-weight:600;cursor:pointer}.ld-dn button.on{background:var(--c);color:#fff}
.ld-cg{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}.ld-cc{padding:14px 16px;display:flex;flex-direction:column;gap:10px}.ld-cc h4{margin:0;font-size:16px;display:flex;justify-content:space-between;gap:8px;align-items:center}.ld-pair{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px}.ld-pair button{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--soft);cursor:pointer;font:inherit;color:var(--ink);text-align:start}.ld-pair button:hover{border-color:var(--brand)}.ld-pair small{color:var(--muted);font-size:12px}.ld-mate{display:inline-flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px;font-size:13.5px}
.ld-m-note{background:var(--soft);border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-size:13px;color:var(--muted);margin-bottom:14px}
.ld-hero{display:flex;gap:18px;align-items:center;padding:16px 18px;margin-bottom:12px}.ld-hero .big{font-size:44px;font-weight:800;line-height:1}.ld-hero p{margin:6px 0 0;color:var(--muted);font-size:13px}
.ld-ring{--v:0;width:96px;height:96px;border-radius:50%;flex:0 0 auto;display:grid;place-items:center;background:conic-gradient(var(--brand) calc(var(--v)*1%),var(--soft) 0)}.ld-ring>div{width:74px;height:74px;border-radius:50%;background:var(--card);display:grid;place-items:center;font-weight:800;font-size:20px}
.ld-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px}.ld-2>.card{padding:14px 16px;min-width:0}.ld-2 h4{margin:0 0 10px;font-size:15px}
.ld-bars{display:grid;gap:8px}.ld-bar{display:grid;grid-template-columns:minmax(90px,150px) 1fr 44px;gap:10px;align-items:center;font-size:13px}.ld-bar .tr{height:12px;background:var(--soft);border-radius:999px;overflow:hidden}.ld-bar .fl{height:100%;display:block;background:var(--brand);border-radius:999px}.ld-bar .v{font-weight:700;text-align:end}.ld-bar .nm{display:flex;gap:6px;align-items:center;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ld-sw{width:10px;height:10px;border-radius:3px;flex:0 0 auto}
.ld-cols{display:flex;align-items:flex-end;gap:4px;height:140px;padding-top:8px;border-bottom:1px solid var(--line)}.ld-col{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:3px;height:100%;min-width:0}.ld-col i{display:block;width:100%;max-width:26px;background:var(--brand);border-radius:4px 4px 0 0}.ld-col.now i{background:var(--part)}.ld-col b{font-size:11px}.ld-xl{display:flex;gap:4px}.ld-xl span{flex:1;text-align:center;font-size:10.5px;color:var(--muted)}
.ld-lv{display:inline-block;padding:1px 9px;border-radius:999px;font-size:12px;font-weight:700}.ld-lv.a,.ld-lv.b{background:var(--ok-bg);color:var(--ok)}.ld-lv.c{background:var(--part-bg);color:var(--part)}.ld-lv.d{background:var(--none-bg);color:var(--none)}.ld-lv.n{background:var(--na-bg);color:var(--na)}
.ld-f{display:grid;gap:6px;margin-top:8px}.ld-f a{display:flex;justify-content:space-between;gap:10px;padding:8px 12px;border:1px solid var(--line);border-radius:10px;text-decoration:none;color:var(--ink);background:var(--card)}
.ld-f a span{color:var(--muted);font-size:12px;white-space:nowrap}.ld-empty{color:var(--muted);font-size:13px;padding:6px 0}`;
  function style() { if (document.getElementById('ld-css')) return; const s = document.createElement('style'); s.id = 'ld-css'; s.textContent = CSS; document.head.appendChild(s); }

  function prep(D) {
    if (D._prep) return; D._prep = 1;
    D.teachers.forEach((t, i) => { t.i = i; t.p.forEach(p => { p.s = stateOf(p); p.t = t; }); });
    D.all = D.teachers.flatMap(t => t.p);
    D.cls = [...new Set(D.teachers.map(t => t.cls))].map(c => ({ c, T: D.teachers.filter(t => t.cls === c) }));
    D.teachers.forEach(t => { t.mates = D.teachers.filter(x => x.cls === t.cls && x !== t); });
    D.doms = Object.keys(DOM).filter(d => D.all.some(p => p.dom === d)).concat([...new Set(D.all.map(p => p.dom))].filter(d => !DOM[d]));
  }
  const when = x => x ? `<b>${esc(x.d)} ${hd(x.h)}</b><span>الأسبوع ${WK[x.w] || ar(x.w)}</span>` : '—';
  const btn = (u, l, ghost) => u ? `<a class="btn sm${ghost ? ' ghost' : ''}" href="${esc(u)}" target="_blank" rel="noopener">${l}</a>` : '';
  const progRow = (p, withTeacher) => `<tr>
    ${withTeacher ? `<td><button class="btn sm ghost" data-go="lt/${p.t.i}">${esc(p.t.name)}</button><span class="ld-d">${esc(p.t.cls)}</span></td>` : ''}
    <td class="ld-p" style="--c:${DOM[p.dom] || 'var(--line)'}">${esc(p.n)}<span class="ld-d">${esc(p.dom)}</span></td>
    <td>${per(p.need)}</td><td class="ld-w">${when(p.from)}</td><td class="ld-w">${when(p.to)}</td>
    <td><span class="chip s-${ST[p.s][1]}">${ST[p.s][0]}</span></td><td>${evChip(p)}</td>
    <td>${btn(p.evUrl, 'الشواهد')} ${btn(p.repUrl, 'قياس الأثر والتقرير', 1)}</td></tr>`;
  const table = (rows, withTeacher) => `<div class="card ld-tw"><table class="ld-t"><thead><tr>${withTeacher ? '<th>المعلمة</th>' : ''}<th>البرنامج</th><th>عدد الحصص</th><th>البداية</th><th>النهاية</th><th>الحالة</th><th>الشواهد</th><th>المجلدات</th></tr></thead><tbody>${rows.map(p => progRow(p, withTeacher)).join('')}</tbody></table></div>`;

  function home(D) {
    const c = s => D.all.filter(p => p.s === s).length, noEv = D.all.filter(p => (p.s === 'done' || p.s === 'run') && !p.ev.length).length;
    const run = D.all.filter(p => p.s === 'run');
    return `<div class="card ld-h"><h2>بوابة رائدة النشاط — أ. منى العمري</h2><p>الأنشطة الصفية · الفصل الدراسي الأول ١٤٤٨هـ · من سجل خطة النشاط المعتمد</p></div>
    <div class="ld-k">${[[D.teachers.length, 'معلمة'], [D.all.length, 'برنامجًا'], [c('run'), 'جارٍ الآن'], [c('done'), 'انتهى'], [c('wait'), 'لم يبدأ'], [noEv, 'بدأ أو انتهى بلا شواهد']]
      .map(([n, l]) => `<div class="card"><b>${ar(n)}</b><span>${l}</span></div>`).join('')}</div>
    <div class="ld-links">${btn(D.db, 'قاعدة الأنشطة الصفية')} ${btn(D.archive, 'أرشيف الفصل الدراسي الأول', 1)} <button class="btn sm ghost" data-go="lp">كل البرامج</button> <button class="btn sm ghost" data-go="ld/0">البرامج حسب المجال</button> <button class="btn sm" data-go="lm">لوحة المؤشرات</button></div>
    <h3 class="ld-sec">برامج جارية الآن (${ar(run.length)})</h3>${run.length ? table(run, true) : '<p class="ld-empty">لا يوجد برنامج جارٍ اليوم.</p>'}
    <h3 class="ld-sec">حسب المجال</h3>${domCards(D)}
    <h3 class="ld-sec">المعلمات مع زميلاتهن (حسب الفصل)</h3>${classCards(D)}`;
  }
  const same = (a, b) => a.p.map(p => p.n).sort().join('|') === b.p.map(p => p.n).sort().join('|');
  function classCards(D) {
    return `<div class="ld-cg">${D.cls.map((c, k) => { const L = c.T.flatMap(t => t.p), run = L.filter(p => p.s === 'run').length, ev = L.reduce((a, p) => a + p.ev.length, 0);
      const diff = c.T.length > 1 && !same(c.T[0], c.T[1]);
      return `<div class="card ld-cc"><h4>${esc(c.c)} <button class="btn sm ghost" data-go="lc/${k}">برامج الفصل</button></h4>
        <div class="ld-pair">${c.T.map(t => `<button data-go="lt/${t.i}"><b>${esc(t.name)}</b><small>${esc(t.subj)} · ${ar(t.p.length)} برامج</small></button>`).join('')}</div>
        <span class="ld-dots">${[...new Set(L.map(p => p.n))].map(n => { const p = L.find(x => x.n === n); return `<span class="chip s-${ST[p.s][1]}">${esc(n.replace(/^برنامج /, ''))}</span>`; }).join('')}</span>
        <small style="color:var(--muted)">${c.T.length > 1 ? (diff ? 'برامج المعلمتين مختلفة في جدول الإسناد' : 'المعلمتان تنفذان البرامج نفسها') : 'معلمة واحدة في الفصل'} · ${ar(run)} جارٍ · ${ar(ev)} شاهد · ${ar(c.T[0].students)} طالبة</small></div>`; }).join('')}</div>`;
  }
  function klass(D, k) {
    const c = D.cls[k]; if (!c) return home(D);
    const L = c.T.flatMap(t => t.p).sort((a, b) => a.n.localeCompare(b.n, 'ar') || a.t.i - b.t.i);
    return `<div class="card ld-h"><h2>${esc(c.c)}</h2><p>${c.T.map(t => esc(t.name) + ' (' + esc(t.subj) + ')').join(' · ')} · عدد الطالبات ${ar(c.T[0].students)}</p></div>` + table(L, true);
  }
  /* مؤشر قوة الشواهد والتنفيذ (لكل برنامج بدأ أو انتهى):
     تحقق التنفيذ 40 = الشواهد مقابل الحصص المنقضية (شاهد لكل حصة) · انتظام الرفع 20 = المرفوع خلال مدة البرنامج (+7 أيام)
     تنوع الشواهد 15 = صورة/فيديو/مستند (نوعان = كامل) · التقرير وقياس الأثر 25 = ملف في «قياس الأثر والتقرير» (للمنتهي فقط) */
  const W = [['تحقق التنفيذ', 40], ['انتظام الرفع', 20], ['تنوع الشواهد', 15], ['التقرير وقياس الأثر', 25]];
  const kindOf = m => /^image\//.test(m) ? 'img' : /^video\//.test(m) ? 'vid' : 'doc';
  function score(p) {
    if (p.s !== 'run' && p.s !== 'done') return null;
    const a = day(p.from.g), b = day(p.to.g), f = p.s === 'done' ? 1 : Math.min(1, Math.max(0, (today - a + 864e5) / (b - a + 864e5)));
    const E = Math.max(1, Math.ceil(p.need * f)), n = p.ev.length;
    const inWin = n ? p.ev.filter(x => { const t = Date.parse(x.t); return t >= a - 864e5 && t <= b + 8 * 864e5; }).length / n : 0;
    const c = [Math.min(1, n / E), inWin, Math.min(1, new Set(p.ev.map(x => kindOf(x.m))).size / 2), p.s === 'done' ? (p.rep.length ? 1 : 0) : null];
    let sw = 0, sv = 0; c.forEach((v, i) => { if (v !== null) { sw += W[i][1]; sv += v * W[i][1]; } });
    return { v: Math.round(sv / sw * 100), c, E, n };
  }
  const LV = v => v === null || v === undefined ? ['لا بيانات', 'n'] : v >= 85 ? ['متميز', 'a'] : v >= 70 ? ['متقدم', 'b'] : v >= 50 ? ['مقبول', 'c'] : ['يحتاج تحسين', 'd'];
  const avg = L => { const x = L.filter(v => v !== null && v !== undefined); return x.length ? Math.round(x.reduce((a, b) => a + b, 0) / x.length) : null; };
  const pc = v => v === null || v === undefined ? '—' : ar(v) + '٪';
  const bars = rows => `<div class="ld-bars">${rows.map(([nm, v, sw, title]) => `<div class="ld-bar" title="${esc(title || nm)}: ${v === null ? 'لا بيانات' : pc(v)}"><span class="nm">${sw ? `<i class="ld-sw" style="background:${sw}"></i>` : ''}${esc(nm)}</span><span class="tr"><span class="fl" style="width:${v || 0}%"></span></span><span class="v">${pc(v)}</span></div>`).join('')}</div>`;
  const T0 = Date.UTC(2026, 7, 23), BRK = Date.UTC(2026, 10, 22);   // الأسبوع 1 = الأحد 10/3/1448 (23 أغسطس 2026)؛ إجازة الخريف 12–16/6 (22–26 نوفمبر)
  const weekOf = t => { const d = Date.parse(t); if (d >= BRK && d < BRK + 7 * 864e5) return 0; return Math.floor((d - T0) / (7 * 864e5)) + 1 - (d >= BRK + 7 * 864e5 ? 1 : 0); };
  function metrics(D) {
    D.all.forEach(p => { p.sc = score(p); });
    const st = D.all.filter(p => p.sc), ov = avg(st.map(p => p.sc.v));
    const ev = D.all.reduce((a, p) => a + p.ev.length, 0), cur = weekOf(new Date(today).toISOString());
    const wk = Array.from({ length: 19 }, (_, i) => i + 1).map(w => [w, D.all.reduce((a, p) => a + p.ev.filter(x => weekOf(x.t) === w).length, 0)]);
    const mx = Math.max(1, ...wk.map(x => x[1]));
    const need = st.filter(p => p.sc.v < 50).sort((a, b) => a.sc.v - b.sc.v);
    const noRep = D.all.filter(p => p.s === 'done' && !p.rep.length).length;
    const lv = LV(ov);
    return `<div class="card ld-h"><h2>لوحة مؤشرات الشواهد والتنفيذ</h2><p>تقيس قوة الشواهد وتحقق التنفيذ لكل برنامج بدأ أو انتهى، وتُحدَّث تلقائيًا مع كل شاهد يُرفع.</p></div>
    ${ev ? '' : '<div class="ld-m-note">لم تُرفع شواهد بعد؛ تكتمل المؤشرات تلقائيًا عندما تبدأ المعلمات رفع الصور من زر «برامج الأنشطة الصفية» في المنصة.</div>'}
    <div class="card ld-hero"><div class="ld-ring" style="--v:${ov || 0}"><div>${pc(ov)}</div></div>
      <div><span class="ld-lv ${lv[1]}">${lv[0]}</span><p>المؤشر العام لـ ${ar(st.length)} برنامجًا بدأت أو انتهت من ${ar(D.all.length)} برنامجًا</p></div></div>
    <div class="ld-k">${[[ar(ev), 'شاهدًا مرفوعًا'], [ar(st.filter(p => p.sc.n > 0).length) + ' من ' + ar(st.length), 'برامج بدأت ولها شواهد'], [ar(st.filter(p => !p.sc.n).length), 'بدأت بلا شواهد'], [ar(noRep), 'انتهت بلا تقرير أو قياس أثر'], [ar(st.filter(p => p.sc.v >= 85).length), 'برامج متميزة']]
      .map(([n, l]) => `<div class="card"><b>${n}</b><span>${l}</span></div>`).join('')}</div>
    <div class="ld-2">
      <div class="card"><h4>مكونات المؤشر (متوسط البرامج)</h4>${bars(W.map(([nm, w], i) => [nm + ' (' + ar(w) + '٪)', avg(st.map(p => p.sc.c[i] === null ? null : Math.round(p.sc.c[i] * 100)))]))}</div>
      <div class="card"><h4>حسب المجال</h4>${bars(D.doms.map(d => [d, avg(st.filter(p => p.dom === d).map(p => p.sc.v)), DOM[d]]))}</div>
      <div class="card"><h4>حسب الفصل (المعلمة وزميلتها)</h4>${bars(D.cls.map(c => [c.c, avg(st.filter(p => p.t.cls === c.c).map(p => p.sc.v)), null, c.T.map(t => t.name).join(' و ')]))}</div>
      <div class="card"><h4>المعلمات</h4>${bars(D.teachers.map(t => [t.name, avg(t.p.filter(p => p.sc).map(p => p.sc.v))]).sort((a, b) => (b[1] ?? -1) - (a[1] ?? -1)))}</div>
    </div>
    <h3 class="ld-sec">الشواهد المرفوعة أسبوعيًا</h3>
    <div class="card" style="padding:14px 16px"><div class="ld-cols">${wk.map(([w, n]) => `<div class="ld-col${w === cur ? ' now' : ''}" title="الأسبوع ${WK[w]}: ${ar(n)} شاهد">${n ? `<b>${ar(n)}</b>` : ''}<i style="height:${n / mx * 100}%"></i></div>`).join('')}</div>
      <div class="ld-xl">${wk.map(([w]) => `<span>${ar(w)}</span>`).join('')}</div><p class="ld-empty">أرقام الأسابيع الدراسية ١–١٩؛ العمود المميز = الأسبوع الحالي.</p></div>
    <h3 class="ld-sec">برامج تحتاج متابعة (${ar(need.length)})</h3>
    ${need.length ? `<div class="card ld-tw"><table class="ld-t"><thead><tr><th>المعلمة</th><th>البرنامج</th><th>الحالة</th><th>الشواهد / المتوقع</th><th>المؤشر</th><th>المجلد</th></tr></thead><tbody>${need.map(p => `<tr>
      <td><button class="btn sm ghost" data-go="lt/${p.t.i}">${esc(p.t.name)}</button><span class="ld-d">${esc(p.t.cls)}</span></td><td class="ld-p" style="--c:${DOM[p.dom] || 'var(--line)'}">${esc(p.n)}</td>
      <td><span class="chip s-${ST[p.s][1]}">${ST[p.s][0]}</span></td><td>${ar(p.sc.n)} / ${ar(p.sc.E)}</td><td><span class="ld-lv ${LV(p.sc.v)[1]}">${pc(p.sc.v)} · ${LV(p.sc.v)[0]}</span></td><td>${btn(p.evUrl, 'الشواهد')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="ld-empty">لا يوجد.</p>'}
    <details class="card" style="padding:12px 16px;margin-top:14px"><summary style="cursor:pointer;font-weight:700">كيف يُحسب المؤشر؟</summary>
      <ul style="margin:8px 0 0;color:var(--muted);font-size:13px;line-height:1.9">
        <li><b>تحقق التنفيذ (٤٠٪):</b> عدد الشواهد مقابل الحصص التي انقضت من البرنامج (شاهد لكل حصة على الأقل).</li>
        <li><b>انتظام الرفع (٢٠٪):</b> نسبة الشواهد المرفوعة خلال مدة البرنامج أو بعدها بأسبوع.</li>
        <li><b>تنوع الشواهد (١٥٪):</b> صور وفيديو ومستندات؛ نوعان أو أكثر = كامل.</li>
        <li><b>التقرير وقياس الأثر (٢٥٪):</b> وجود ملف في مجلد «قياس الأثر والتقرير» بعد انتهاء البرنامج (لا يُحسب للبرنامج الجاري).</li>
        <li>المستويات: متميز ٨٥٪ فأكثر · متقدم ٧٠٪ · مقبول ٥٠٪ · يحتاج تحسين أقل من ٥٠٪. البرامج التي لم تبدأ لا تدخل في الحساب.</li></ul></details>`;
  }
  function domCards(D) {
    return `<div class="ld-dg">${D.doms.map((d, k) => { const L = D.all.filter(p => p.dom === d), n = s => L.filter(p => p.s === s).length;
      return `<button class="card ld-db" style="--c:${DOM[d] || 'var(--brand)'}" data-go="ld/${k}"><b>${esc(d)}</b><small>${ar(L.length)} برنامجًا · ${ar(new Set(L.map(p => p.n)).size)} أسماء برامج · ${ar(new Set(L.map(p => p.t.name)).size)} معلمة</small>
        <span class="ld-dots"><span class="chip s-part">${ar(n('run'))} جارٍ</span><span class="chip s-ok">${ar(n('done'))} انتهى</span><span class="chip s-na">${ar(n('wait'))} لم يبدأ</span><span class="chip s-ok">${ar(L.reduce((a, p) => a + p.ev.length, 0))} شاهد</span></span></button>`; }).join('')}</div>`;
  }
  function domain(D, k) {
    const d = D.doms[k]; if (d === undefined) return home(D);
    const L = D.all.filter(p => p.dom === d).sort((a, b) => a.n.localeCompare(b.n, 'ar') || (a.from ? day(a.from.g) : 9e15) - (b.from ? day(b.from.g) : 9e15));
    const names = [...new Set(L.map(p => p.n))];
    return `<div class="ld-dn">${D.doms.map((x, j) => `<button style="--c:${DOM[x] || 'var(--brand)'}" class="${j === k ? 'on' : ''}" data-go="ld/${j}">${esc(x)}</button>`).join('')}</div>
    <div class="card ld-h" style="border-inline-start-color:${DOM[d] || 'var(--brand)'}"><h2>مجال ${esc(d)}</h2><p>${ar(L.length)} برنامجًا لدى ${ar(new Set(L.map(p => p.t.name)).size)} معلمة · ${names.map(esc).join('، ')}</p></div>
    ${names.map(n => { const G = L.filter(p => p.n === n); return `<h3 class="ld-sec">${esc(n)} (${ar(G.length)})</h3>` + table(G, true); }).join('')}`;
  }
  function teacher(D, i) {
    const t = D.teachers[i]; if (!t) return home(D);
    return `<div class="card ld-h"><h2>${esc(t.name)}</h2><p>${esc(t.cls)} · مادة ${esc(t.subj)} · عدد الطالبات ${ar(t.students)} · ${ar(t.p.length)} برامج</p></div>
    <div class="ld-links">${btn(t.url, 'مجلد المعلمة')} ${t.mates.map(m => `<button class="btn sm ghost" data-go="lt/${m.i}">زميلتها: ${esc(m.name)}</button>`).join(' ')} <button class="btn sm ghost" data-go="lc/${D.cls.findIndex(c => c.c === t.cls)}">برامج الفصل</button></div>
    ${t.mates.length ? `<p class="ld-mate">${t.mates.map(m => same(t, m) ? `تنفذ البرامج نفسها مع زميلتها ${esc(m.name)}.` : `برامجها في جدول الإسناد تختلف عن زميلتها ${esc(m.name)}.`).join(' ')}</p>` : '<p class="ld-mate">لا زميلة لها في الفصل.</p>'}${table(t.p, false)}
    ${t.p.map(p => `<h3 class="ld-sec">${esc(p.n)} — الشواهد (${ar(p.ev.length)})</h3>${p.ev.length ? `<div class="ld-f">${p.ev.map(f =>
      `<a href="https://drive.google.com/file/d/${esc(f.id)}/view" target="_blank" rel="noopener"><b>${esc(f.n)}</b><span>${new Date(f.t).toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long' })}</span></a>`).join('')}</div>` : '<p class="ld-empty">لم تُرفع شواهد بعد.</p>'}`).join('')}`;
  }
  function all(D) {
    return `<div class="card ld-h"><h2>كل البرامج (${ar(D.all.length)})</h2><p>مرتبة حسب تاريخ البداية</p></div>` + table(D.all.slice().sort((a, b) => (a.from ? day(a.from.g) : 9e15) - (b.from ? day(b.from.g) : 9e15)), true);
  }
  window.LEADER = {
    render(D, v, a) { style(); prep(D); return v === 'lt' ? teacher(D, +a) : v === 'ld' ? domain(D, +a) : v === 'lc' ? klass(D, +a) : v === 'lm' ? metrics(D) : v === 'lp' ? all(D) : home(D); },
    title: 'بوابة رائدة النشاط',
  };
})();
