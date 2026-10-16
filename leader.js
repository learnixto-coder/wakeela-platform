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
.ld-nav{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 14px}.ld-nav .bc{display:flex;flex-wrap:wrap;gap:4px;align-items:center;color:var(--muted);font-size:13.5px}.ld-nav .bc button{all:unset;cursor:pointer;color:var(--brand-2);font-weight:600}.ld-nav .bc button:hover{text-decoration:underline}.ld-nav .bc b{color:var(--ink)}
.ld-hub{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;margin-bottom:16px}.ld-hb{display:flex;flex-direction:column;gap:4px;padding:18px;min-height:96px;border:1px solid var(--line);border-top:5px solid var(--c);border-radius:16px;background:var(--card);box-shadow:var(--shadow);cursor:pointer;text-align:start;font:inherit;color:var(--ink)}.ld-hb:hover{border-color:var(--c)}.ld-hb:focus-visible{outline:3px solid var(--c);outline-offset:2px}.ld-hb b{font-size:17px}.ld-hb small{color:var(--muted);font-size:13px}
.ld-fo{display:grid;gap:10px}.ld-fo details{padding:12px 16px}.ld-fo summary{cursor:pointer;display:flex;justify-content:space-between;gap:10px;align-items:center;font-weight:700}.ld-fo ul{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:6px}.ld-fo li{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 10px;border:1px solid var(--line);border-radius:10px;font-size:13.5px}
@media (max-width:560px){.ld-hub{grid-template-columns:repeat(2,minmax(0,1fr))}.ld-hb{padding:14px 12px;min-height:84px}.ld-hb b{font-size:15px}}
.ld-st{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}.ld-st>div{padding:10px 14px;min-width:130px}.ld-st small{display:block;color:var(--muted);font-size:12px}.ld-st b{font-size:15px}
.ld-ev{padding:14px 16px;display:grid;gap:12px;margin-bottom:14px}.ld-ev h4{margin:0;font-size:15.5px}.ld-ev .row2{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.ld-ev input[type=number]{width:96px;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:var(--soft);font:inherit;font-size:18px;font-weight:700;text-align:center}
.ld-ev input[type=range]{flex:1;min-width:160px;accent-color:var(--brand)}.ld-ev textarea{width:100%;min-height:80px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--soft);font:inherit;resize:vertical}
.ld-seen{border:2px solid var(--ok);background:var(--card);color:var(--ok);border-radius:12px;padding:8px 14px;font:inherit;font-weight:700;cursor:pointer}.ld-seen.on{background:var(--ok);color:#fff}
.ld-msg{font-size:13px;color:var(--muted)}.ld-msg.err{color:var(--none)}
.ld-fold{padding:12px 16px;margin-bottom:10px}.ld-fold summary{cursor:pointer;display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center;font-weight:700}
.ld-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-top:10px}.ld-it{display:flex;flex-direction:column;gap:4px;border:1px solid var(--line);border-radius:10px;overflow:hidden;text-decoration:none;color:var(--ink);background:var(--card)}
.ld-it .th{aspect-ratio:4/3;max-width:100%;background:var(--soft);display:grid;place-items:center;color:var(--muted);font-size:12px;overflow:hidden}.ld-it .th img{width:100%;height:100%;object-fit:cover}.ld-it span{padding:4px 8px 6px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ld-tools{padding:14px 16px;display:grid;gap:10px;margin-bottom:14px}.ld-tools h4{margin:0;font-size:15px}.ld-tools .row2{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.ld-tools select,.ld-tools input[type=text],.ld-flt select,.ld-flt input{padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:var(--soft);font:inherit;min-width:0}
.ld-flt{display:grid;grid-template-columns:2fr repeat(4,minmax(0,1fr));gap:8px;margin-bottom:12px}@media (max-width:760px){.ld-flt{grid-template-columns:1fr 1fr}.ld-flt input{grid-column:1/-1}}
.ld-pg{font-weight:700;cursor:pointer;background:none;border:0;padding:0;font:inherit;color:var(--ink);text-align:start}.ld-pg:hover{color:var(--brand-2);text-decoration:underline}
.ld-f{display:grid;gap:6px;margin-top:8px}.ld-f a{display:flex;justify-content:space-between;gap:10px;padding:8px 12px;border:1px solid var(--line);border-radius:10px;text-decoration:none;color:var(--ink);background:var(--card)}
.ld-f a span{color:var(--muted);font-size:12px;white-space:nowrap}.ld-empty{color:var(--muted);font-size:13px;padding:6px 0}`;
  function style() { if (document.getElementById('ld-css')) return; const s = document.createElement('style'); s.id = 'ld-css'; s.textContent = CSS; document.head.appendChild(s); }

  function prep(D) {
    if (D._prep) return; D._prep = 1;
    D.teachers.forEach((t, i) => { t.i = i; t.p.forEach(p => { p.s = stateOf(p); p.t = t; }); });
    D.all = D.teachers.flatMap(t => t.p);
    D.cls = [...new Set(D.teachers.map(t => t.cls))].map(c => ({ c, T: D.teachers.filter(t => t.cls === c) }));
    const GR = ['أول متوسط', 'ثاني متوسط', 'ثالث متوسط'];
    D.cls.forEach((c, k) => { c.k = k; c.g = GR.find(g => c.c.startsWith(g)) || c.c; c.no = +(c.c.match(/(\d+)\s*$/) || [0, 0])[1]; });
    D.grades = GR.map(g => ({ g, C: D.cls.filter(c => c.g === g).sort((a, b) => a.no - b.no) })).filter(x => x.C.length);
    D.weeks = D.weeks || []; D.folders = D.folders || []; D.reports = D.reports || []; D.evals = D.evals || {};
    // سجل البرنامج = الفصل + اسم البرنامج؛ تشترك فيه معلمات الفصل المسند إليهن (بلا نسخ)
    const RM = {};
    D.all.forEach(p => { const key = p.t.cls + ' | ' + p.n;
      const r = RM[key] = RM[key] || { key, cls: p.t.cls, n: p.n, dom: p.dom, need: p.need, from: p.from, to: p.to, s: p.s, P: [] };
      r.P.push(p); p.rec = r; });
    D.recs = Object.values(RM).sort((a, b) => a.cls.localeCompare(b.cls, 'ar') || a.n.localeCompare(b.n, 'ar'));
    D.recs.forEach((r, i) => { r.i = i; r.T = r.P.map(p => p.t); });
    loadEvals(D);
    D.teachers.forEach(t => { t.mates = D.teachers.filter(x => x.cls === t.cls && x !== t); });
    D.doms = Object.keys(DOM).filter(d => D.all.some(p => p.dom === d)).concat([...new Set(D.all.map(p => p.dom))].filter(d => !DOM[d]));
  }
  const when = x => x ? `<b>${esc(x.d)} ${hd(x.h)}</b><span>الأسبوع ${WK[x.w] || ar(x.w)}</span>` : '—';
  const btn = (u, l, ghost) => u ? `<a class="btn sm${ghost ? ' ghost' : ''}" href="${esc(u)}" target="_blank" rel="noopener">${l}</a>` : '';
  const progRow = (p, withTeacher) => `<tr>
    ${withTeacher ? `<td><button class="btn sm ghost" data-go="lt/${p.t.i}">${esc(p.t.name)}</button><span class="ld-d">${esc(p.t.cls)}</span></td>` : ''}
    <td class="ld-p" style="--c:${DOM[p.dom] || 'var(--line)'}">${p.rec ? `<button class="ld-pg" data-go="lb/${p.rec.i}">${esc(p.n)}</button>` : esc(p.n)}<span class="ld-d">${esc(p.dom)}</span></td>
    <td>${per(p.need)}</td><td class="ld-w">${when(p.from)}</td><td class="ld-w">${when(p.to)}</td>
    <td><span class="chip s-${ST[p.s][1]}">${ST[p.s][0]}</span></td><td>${evChip(p)}</td><td>${p.rec ? seenChip(evOf(p.rec)) + ' ' + gradeChip(evOf(p.rec)) : ''}</td>
    <td>${btn(p.evUrl, 'الشواهد')} ${btn(p.repUrl, 'قياس الأثر والتقرير', 1)}</td></tr>`;
  const table = (rows, withTeacher) => `<div class="card ld-tw"><table class="ld-t"><thead><tr>${withTeacher ? '<th>المعلمة</th>' : ''}<th>البرنامج</th><th>عدد الحصص</th><th>البداية</th><th>النهاية</th><th>الحالة</th><th>الشواهد</th><th>الاطلاع والدرجة</th><th>المجلدات</th></tr></thead><tbody>${rows.map(p => progRow(p, withTeacher)).join('')}</tbody></table></div>`;

  const NUM = ['', 'واحد', 'اثنين', 'ثلاثة', 'أربعة', 'خمسة'];
  const clsName = c => `فصل ${c.g} ${NUM[c.no] || ar(c.no)}`;
  // شريط التنقل: «→ رجوع» إلى الصفحة الأعلى + مسار الصفحات
  const nav = (...L) => `<div class="ld-nav"><button class="btn sm" data-go="${L.length > 1 ? L[L.length - 2][0] : 'start'}">→ رجوع</button><span class="bc">${[['start', 'الرئيسية']].concat(L).map(([h, t], i, A) => i === A.length - 1 ? `<b>${esc(t)}</b>` : `<button data-go="${h}">${esc(t)}</button>`).join(' ‹ ')}</span></div>`;
  const hubBtn = (go, t, sub, c) => `<button class="ld-hb" style="--c:${c}" data-go="${go}"><b>${t}</b><small>${sub}</small></button>`;
  function grades(D) {
    return nav(['lg', 'الأنشطة الصفية']) + `<div class="card ld-h"><h2>الأنشطة الصفية</h2><p>اختاري الصف الدراسي</p></div><div class="ld-hub">${D.grades.map((g, i) => {
      const L = g.C.flatMap(c => c.T.flatMap(t => t.p));
      return hubBtn('lg/' + i, 'الصف ' + esc(g.g), `${ar(g.C.length)} فصول · ${ar(L.length)} نشاطًا · ${ar(L.filter(p => p.s === 'run').length)} جارٍ`, 'var(--brand)'); }).join('')}</div>`;
  }
  function grade(D, i) {
    const g = D.grades[i]; if (!g) return grades(D);
    return nav(['lg', 'الأنشطة الصفية'], ['lg/' + i, 'الصف ' + g.g]) + `<div class="card ld-h"><h2>الصف ${esc(g.g)}</h2><p>اختاري الفصل</p></div><div class="ld-hub">${g.C.map(c => {
      const L = c.T.flatMap(t => t.p);
      return hubBtn('lc/' + c.k, esc(clsName(c)), `${c.T.map(t => esc(t.name)).join(' و ')} · ${ar(new Set(L.map(p => p.n)).size)} أنشطة · ${ar(c.T[0].students)} طالبة`, 'var(--brand)'); }).join('')}</div>`;
  }
  const fileLink = f => `<a href="https://drive.google.com/file/d/${esc(f.id)}/view" target="_blank" rel="noopener"><b>${esc(f.n)}</b><span>${new Date(f.t).toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long' })}</span></a>`;
  function nonClass(D) {
    const n = D.weeks.reduce((a, w) => a + w.files.length + w.subs.reduce((b, s) => b + s.files.length, 0), 0);
    return nav(['ln', 'الأنشطة اللاصفية']) + `<div class="card ld-h"><h2>الأنشطة اللاصفية</h2><p>الفترات اللاصفية (الإذاعة والاصطفاف الصباحي والصلاة) حسب الأسبوع · ${ar(n)} تقريرًا · من «1. التقارير / التقارير اللاصفية (الفترات)»</p></div>
    <div class="ld-fo">${D.weeks.map(w => { const c = w.files.length + w.subs.reduce((b, s) => b + s.files.length, 0);
      return `<details class="card"${c ? ' open' : ''}><summary><span>${esc(w.n)}</span><span class="chip ${c ? 's-ok' : 's-na'}">${ar(c)} تقرير</span></summary>
        ${w.files.length ? `<div class="ld-f">${w.files.map(fileLink).join('')}</div>` : ''}
        ${w.subs.map(s => `<p class="ld-empty" style="margin:10px 0 4px">${esc(s.n)}</p>${s.files.length ? `<div class="ld-f">${s.files.map(fileLink).join('')}</div>` : '<p class="ld-empty">لا تقارير.</p>'}`).join('')}
        <div class="ld-links" style="margin-top:8px">${btn(w.url, 'فتح مجلد الأسبوع', 1)}</div></details>`; }).join('') || '<p class="ld-empty">لا توجد أسابيع.</p>'}</div>`;
  }
  function teachersPage(D) {
    return nav(['lts', 'الأنشطة حسب المعلمات']) + `<div class="card ld-h"><h2>الأنشطة حسب المعلمات</h2><p>كل معلمة مع زميلتها في الفصل؛ اضغطي اسم المعلمة لعرض أنشطتها</p></div>` + classCards(D);
  }
  function domainsPage(D) {
    return nav(['ld', 'الأنشطة حسب المجالات']) + `<div class="card ld-h"><h2>الأنشطة حسب المجالات</h2><p>المجالات المعتمدة في سجل خطة النشاط</p></div>` + domCards(D);
  }
  function foldersPage(D) {
    return nav(['lf', 'المجلدات']) + `<div class="card ld-h"><h2>المجلدات</h2><p>أقسام أرشيف «الفصل الدراسي الأول 1448هـ» كما هي في Drive، وعدد الملفات في كل قسم</p></div>
    <div class="ld-links">${btn(D.archive, 'فتح الأرشيف كاملًا')} ${btn(D.db, 'قاعدة الأنشطة الصفية', 1)}</div>
    <div class="ld-fo">${D.folders.map(f => `<details class="card"><summary><span>${esc(f.n)}</span><span class="chip s-na">${ar(f.count)} ملف</span></summary>
      <ul>${f.subs.map(x => `<li><span>${esc(x.n)}</span><span style="display:flex;gap:8px;align-items:center"><span class="muted">${ar(x.count)} ملف</span>${btn(x.url, 'فتح', 1)}</span></li>`).join('') || '<li>لا مجلدات فرعية</li>'}</ul>
      <div class="ld-links" style="margin-top:8px">${btn(f.url, 'فتح القسم')}</div></details>`).join('')}</div>`;
  }
  function reportsPage(D) {
    const R = D.reports.slice().sort((a, b) => a.p.localeCompare(b.p, 'ar') || a.n.localeCompare(b.n, 'ar'));
    const groups = [...new Set(R.map(r => r.p))];
    const z = D.zip;
    return nav(['lr', 'التقارير']) + `<div class="card ld-h"><h2>التقارير (${ar(R.length)})</h2><p>كل تقارير PDF في الأرشيف: التقارير الصفية واللاصفية، والجاهزة للختم، وتقارير البرامج</p></div>
    <div class="ld-links">${z ? `<a class="btn" href="https://drive.google.com/uc?export=download&id=${esc(z.id)}" target="_blank" rel="noopener">تحميل كل التقارير دفعة واحدة (ZIP)</a> <a class="btn ghost" href="https://drive.google.com/file/d/${esc(z.id)}/view" target="_blank" rel="noopener">عرض الملف المضغوط</a>
      <span class="ld-empty">آخر تجميع: ${new Date(z.t).toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long' })}</span>` : '<span class="ld-empty">يُجهَّز ملف التحميل الكامل مع التحديث القادم.</span>'}</div>
    ${groups.map(g => `<h3 class="ld-sec">${esc(g)}</h3><div class="ld-f">${R.filter(r => r.p === g).map(fileLink).join('')}</div>`).join('') || '<p class="ld-empty">لا توجد تقارير بعد.</p>'}`;
  }
  /* ── التقييم: يُقرأ ويُحفظ في «قاعدة الأنشطة الصفية» (ورقة «التقييم») عبر نظام Apps Script؛ لا يُحفظ في المتصفح ── */
  const code = () => { try { return sessionCode; } catch { return ''; } };
  async function api(body) {   // POST نص JSON (بلا طلب تمهيدي)؛ إعادة المحاولة لأن خادم Google يفشل أحيانًا
    let last = 'تعذر الاتصال';
    for (let i = 0; i < 3; i++) {
      try { const r = await fetch(window.__LD.api, { method: 'POST', headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ code: code() }, body)) });
        const t = await r.text(); if (t[0] !== '{') throw new Error('رد غير متوقع'); const j = JSON.parse(t); if (!j.ok) throw new Error(j.error); return j; }
      catch (e) { last = e.message; if (/غير مصرح|غير معروف|ليس من مجلدات|فارغ/.test(last)) break; await new Promise(o => setTimeout(o, 800)); }
    }
    throw new Error(last);
  }
  function loadEvals(D) {   // أحدث التقييمات عند فتح البوابة (الملف المشفر قد يكون أقدم منها)
    if (!D.api || D._evLoading) return; D._evLoading = 1; window.__LD = D;
    fetch(D.api + '?' + new URLSearchParams({ op: 'ct', a: 'evals', code: code() })).then(r => r.json()).then(j => {
      if (j.ok) { D.evals = j.evals || {}; if (location.hash === '#lb') { if (document.getElementById('lbOut')) filterPrograms(); } else if (typeof route === 'function' && !(document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))) { const y = window.scrollY; route(); window.scrollTo(0, y); } }
    }).catch(() => {});
  }
  const evOf = r => D_().evals[r.key] || {};
  const D_ = () => window.__LD;
  const recFiles = r => r.P.flatMap(p => p.ev.concat(p.rep, ...(p.more || []).map(m => m.files)));
  const seenChip = e => e.seen ? '<span class="chip s-ok">تم الاطلاع</span>' : '<span class="chip s-na">لم يُطَّلع</span>';
  const gradeChip = e => e.grade === null || e.grade === undefined ? '<span class="chip s-na">بلا درجة</span>' : `<span class="ld-lv ${LV(e.grade)[1]}">${ar(e.grade)} / ١٠٠</span>`;
  const upChip = n => n ? `<span class="chip s-ok">${ar(n)} ملف</span>` : '<span class="chip s-none">لا شواهد</span>';
  const recRow = r => { const e = evOf(r), n = recFiles(r).length; return `<tr>
    <td class="ld-p" style="--c:${DOM[r.dom] || 'var(--line)'}"><button class="ld-pg" data-go="lb/${r.i}">${esc(r.n)}</button><span class="ld-d">${esc(r.dom)}</span></td>
    <td>${esc(r.cls)}<span class="ld-d">${r.T.map(t => esc(t.name)).join(' و ')}</span></td>
    <td class="ld-w">${when(r.from)}</td><td class="ld-w">${when(r.to)}</td>
    <td><span class="chip s-${ST[r.s][1]}">${ST[r.s][0]}</span></td><td>${upChip(n)}</td><td>${seenChip(e)}</td><td>${gradeChip(e)}</td>
    <td><button class="btn sm" data-go="lb/${r.i}">فتح</button></td></tr>`; };
  const recTable = R => R.length ? `<div class="card ld-tw"><table class="ld-t"><thead><tr><th>البرنامج</th><th>الفصل والمعلمات</th><th>البداية</th><th>النهاية</th><th>التنفيذ</th><th>الشواهد</th><th>الاطلاع</th><th>الدرجة</th><th></th></tr></thead><tbody>${R.map(recRow).join('')}</tbody></table></div>` : '<p class="ld-empty">لا برامج.</p>';
  const thumb = f => /^image\//.test(f.m) ? `<img loading="lazy" src="https://drive.google.com/thumbnail?id=${esc(f.id)}&sz=w400" alt="" onerror="this.replaceWith(document.createTextNode('صورة'))">` : esc((f.n.split('.').pop() || 'ملف').toUpperCase());
  const grid = F => F.length ? `<div class="ld-grid">${F.map(f => `<a class="ld-it" href="https://drive.google.com/file/d/${esc(f.id)}/view" target="_blank" rel="noopener" title="${esc(f.n)}"><span class="th">${thumb(f)}</span><span>${esc(f.n)}</span></a>`).join('')}</div>` : '<p class="ld-empty">لا ملفات في هذا المجلد.</p>';

  // صفحة سجل البرنامج: المعلمات المشاركات، الحالات الأربع منفصلة، المجلدات والشواهد، الرفع وإنشاء المجلدات، والتقييم
  function record(D, i) {
    const r = D.recs[i]; if (!r) return programs(D);
    const e = evOf(r), n = recFiles(r).length;
    const folders = r.P.flatMap(p => [
      { id: p.ids && p.ids.ev, n: 'الشواهد', who: p.t.name, url: p.evUrl, files: p.ev },
      { id: p.ids && p.ids.rep, n: 'قياس الأثر والتقرير', who: p.t.name, url: p.repUrl, files: p.rep }]
      .concat((p.more || []).map(m => ({ id: m.id, n: m.n, who: p.t.name, url: m.url, files: m.files, mine: 1 }))));
    return nav(['lb', 'البرامج'], ['lb/' + i, r.n + ' — ' + r.cls])
    + `<div class="card ld-h" style="border-inline-start-color:${DOM[r.dom] || 'var(--brand)'}"><h2>${esc(r.n)}</h2><p>${esc(r.dom)} · ${esc(r.cls)} · ${per(r.need)} · من ${r.from ? esc(r.from.d) + ' ' + hd(r.from.h) : '—'} إلى ${r.to ? esc(r.to.d) + ' ' + hd(r.to.h) : '—'}</p></div>
    <div class="ld-st">
      <div class="card"><small>حالة التنفيذ (حسب التاريخ)</small><b><span class="chip s-${ST[r.s][1]}">${ST[r.s][0]}</span></b></div>
      <div class="card"><small>رفع الشواهد</small><b>${upChip(n)}</b></div>
      <div class="card"><small>الاطلاع</small><b>${seenChip(e)}</b></div>
      <div class="card"><small>درجة التقييم</small><b>${gradeChip(e)}</b></div></div>
    <div class="ld-links">${r.T.map(t => `<button class="btn sm ghost" data-go="lt/${t.i}">${esc(t.name)}</button>`).join(' ')} <button class="btn sm ghost" data-go="lc/${D.cls.findIndex(c => c.c === r.cls)}">برامج الفصل</button> <button class="btn sm ghost" data-go="ld/${D.doms.indexOf(r.dom)}">مجال ${esc(r.dom)}</button></div>
    <div class="card ld-ev" data-rec="${i}"><h4>الاطلاع والتقييم</h4>
      <div class="row2"><button class="ld-seen${e.seen ? ' on' : ''}" data-act="seen">${e.seen ? '✓ تم الاطلاع' : 'تم الاطلاع'}</button>${e.seenAt ? `<span class="ld-msg">آخر اطلاع: ${esc(e.seenAt)}</span>` : ''}</div>
      <div class="row2"><label for="ldG">الدرجة من ١٠٠</label><input type="number" id="ldG" min="0" max="100" step="1" value="${e.grade ?? ''}" placeholder="—"><input type="range" id="ldGR" min="0" max="100" step="1" value="${e.grade ?? 0}" aria-label="الدرجة"></div>
      <label for="ldN">ملاحظات على الشواهد أو البرنامج</label><textarea id="ldN" placeholder="تكتب ما يلاحظ على التنفيذ أو الشواهد">${esc(e.notes || '')}</textarea>
      <div class="row2"><button class="btn" data-act="save">حفظ التقييم</button><span class="ld-msg" id="ldMsg">${e.at ? 'آخر تحديث: ' + esc(e.at) : 'لم يُقيَّم بعد'}</span></div></div>
    <div class="card ld-tools" data-rec="${i}"><h4>إضافة شواهد أو مجلد</h4>
      <div class="row2"><select id="ldF" aria-label="المجلد">${folders.filter(f => f.id).map(f => `<option value="${esc(f.id)}">${esc(f.who)} / ${esc(f.n)}</option>`).join('')}</select>
        <label class="btn sm ghost" style="cursor:pointer">اختيار ملفات<input type="file" id="ldU" multiple hidden></label><span class="ld-msg" id="ldUM">الصور تُصغَّر قبل الرفع</span></div>
      <div class="row2"><input type="text" id="ldD" placeholder="اسم مجلد جديد (مثل: الصور، الاستبانات، النتائج والمؤشرات)" style="flex:1;min-width:200px">
        <select id="ldDP" aria-label="داخل مجلد المعلمة">${r.P.filter(p => p.ids && p.ids.p).map(p => `<option value="${esc(p.ids.p)}">داخل مجلد ${esc(p.t.name)}</option>`).join('')}</select>
        <button class="btn sm" data-act="mkdir">إنشاء المجلد</button></div></div>
    <h3 class="ld-sec">المجلدات والشواهد (${ar(n)} ملف)</h3>
    ${folders.map(f => `<details class="card ld-fold"${f.files.length ? ' open' : ''}><summary><span>${esc(f.n)} <span class="ld-d" style="display:inline">· ${esc(f.who)}</span></span><span class="ld-dots">${upChip(f.files.length)}${btn(f.url, 'فتح في Drive', 1)}</span></summary>${grid(f.files)}</details>`).join('')}`;
  }

  // قائمة البرامج: بحث وتصفية بالمجال والمعلمة والشهر والحالة
  const MONTHS = ['', 'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
  const monthOf = r => r.from ? +r.from.h.split('/')[1] : 0;
  function programs(D) {
    const ms = [...new Set(D.recs.map(monthOf).filter(Boolean))].sort((a, b) => a - b);
    return nav(['lb', 'البرامج']) + `<div class="card ld-h"><h2>البرامج (${ar(D.recs.length)})</h2><p>كل برنامج مرة واحدة لكل فصل، مع معلماته وشواهده وتقييمه</p></div>
    <div class="ld-flt"><input type="search" id="lbQ" placeholder="بحث باسم البرنامج أو المعلمة أو الفصل">
      <select id="lbD"><option value="">كل المجالات</option>${D.doms.map(d => `<option>${esc(d)}</option>`).join('')}</select>
      <select id="lbT"><option value="">كل المعلمات</option>${D.teachers.map(t => `<option>${esc(t.name)}</option>`).join('')}</select>
      <select id="lbM"><option value="">كل الأشهر (البداية)</option>${ms.map(m => `<option value="${m}">${MONTHS[m]}</option>`).join('')}</select>
      <select id="lbS"><option value="">كل الحالات</option><option value="run">جارٍ الآن</option><option value="done">انتهى</option><option value="wait">لم يبدأ</option><option value="noev">بلا شواهد</option><option value="unseen">لم يُطَّلع</option><option value="ungraded">بلا درجة</option></select></div>
    <div id="lbOut">${recTable(D.recs)}</div>`;
  }
  function filterPrograms() {
    const D = D_(), v = id => (document.getElementById(id) || {}).value || '';
    const q = v('lbQ').trim(), d = v('lbD'), t = v('lbT'), m = +v('lbM') || 0, st = v('lbS');
    const R = D.recs.filter(r => (!q || (r.n + ' ' + r.cls + ' ' + r.T.map(x => x.name).join(' ')).includes(q)) && (!d || r.dom === d) && (!t || r.T.some(x => x.name === t)) && (!m || monthOf(r) === m)
      && (!st || (st === 'noev' ? !recFiles(r).length : st === 'unseen' ? !evOf(r).seen : st === 'ungraded' ? (evOf(r).grade ?? null) === null : r.s === st)));
    document.getElementById('lbOut').innerHTML = `<p class="ld-empty">${ar(R.length)} برنامجًا</p>` + recTable(R);
    document.querySelectorAll('#lbOut [data-go]').forEach(x => x.addEventListener('click', () => { location.hash = x.dataset.go; }));
  }

  // أحداث الصفحات (تفويض على المستند؛ index.html يربط data-go فقط)
  function events() {
    if (window.__LDev) return; window.__LDev = 1;
    document.addEventListener('input', ev => {
      const id = ev.target.id;
      if (/^lb[QDTMS]$/.test(id)) filterPrograms();
      if (id === 'ldGR') document.getElementById('ldG').value = ev.target.value;
      if (id === 'ldG') document.getElementById('ldGR').value = ev.target.value || 0;
    });
    document.addEventListener('change', async ev => {
      if (ev.target.id !== 'ldU' || !ev.target.files.length) return;
      const box = ev.target.closest('[data-rec]'), r = D_().recs[+box.dataset.rec], folder = document.getElementById('ldF').value, msg = document.getElementById('ldUM');
      const files = [...ev.target.files]; let ok = 0;
      for (const [k, f0] of files.entries()) {
        msg.textContent = `جارٍ رفع ${ar(k + 1)} من ${ar(files.length)}…`; msg.className = 'ld-msg';
        try {
          const f = typeof shrinkImage === 'function' ? await shrinkImage(f0) : f0;
          if (f.size > 25 * 1048576) throw new Error('الملف أكبر من 25 م.ب');
          const b64 = await new Promise((o, x) => { const fr = new FileReader(); fr.onload = () => o(String(fr.result).split(',')[1]); fr.onerror = x; fr.readAsDataURL(f); });
          const j = await api({ a: 'upload', key: r.key, folder, name: f.name, mime: f.type || 'application/octet-stream', b64 });
          r.P.forEach(p => { if (p.ids && p.ids.ev === folder) p.ev.push(j.file); else if (p.ids && p.ids.rep === folder) p.rep.push(j.file); else (p.more || []).forEach(m => { if (m.id === folder) m.files.push(j.file); }); });
          ok++;
        } catch (e) { msg.textContent = `تعذر رفع «${f0.name}»: ${e.message}`; msg.className = 'ld-msg err'; }
      }
      if (ok) { route(); const m = document.getElementById('ldUM'); if (m) m.textContent = `رُفع ${ar(ok)} من ${ar(files.length)}`; }
    });
    document.addEventListener('click', async ev => {
      const b = ev.target.closest('[data-act]'); if (!b) return;
      const box = b.closest('[data-rec]'), D = D_(), r = D.recs[+box.dataset.rec];
      const say = (t, err) => { const m = box.querySelector('.ld-msg:last-child') || document.getElementById('ldMsg'); if (m) { m.textContent = t; m.className = 'ld-msg' + (err ? ' err' : ''); } };
      b.disabled = true;
      try {
        if (b.dataset.act === 'seen' || b.dataset.act === 'save') {
          const body = { a: 'eval', key: r.key };
          if (b.dataset.act === 'seen') body.seen = !(evOf(r).seen);
          else { const g = document.getElementById('ldG').value; if (g !== '' && (+g < 0 || +g > 100)) throw new Error('الدرجة بين ٠ و١٠٠'); body.grade = g === '' ? '' : +g; body.notes = document.getElementById('ldN').value; }
          say('جارٍ الحفظ…'); const j = await api(body); D.evals[r.key] = j.eval; const y = window.scrollY; route(); window.scrollTo(0, y);
          const m = document.getElementById('ldMsg'); if (m) m.textContent = 'تم الحفظ في قاعدة الأنشطة الصفية';
        }
        if (b.dataset.act === 'mkdir') {
          const name = document.getElementById('ldD').value.trim(), parent = document.getElementById('ldDP').value;
          if (!name) throw new Error('اكتبي اسم المجلد');
          say('جارٍ إنشاء المجلد…'); const j = await api({ a: 'mkdir', key: r.key, name, parent });
          const p = r.P.find(x => x.ids && x.ids.p === parent); p.more = p.more || [];
          if (!p.more.some(m => m.id === j.id)) p.more.push({ n: j.name, id: j.id, url: j.url, files: [] });
          const y = window.scrollY; route(); window.scrollTo(0, y); const m = document.getElementById('ldUM'); if (m) m.textContent = `أُنشئ المجلد «${j.name}»`;
        }
      } catch (e) { say(e.message, 1); } finally { b.disabled = false; }
    });
  }
  function home(D) {
    const c = s => D.all.filter(p => p.s === s).length, noEv = D.all.filter(p => (p.s === 'done' || p.s === 'run') && !p.ev.length).length;
    const run = D.recs.filter(r => r.s === 'run');
    return `<div class="card ld-h"><h2>بوابة رائدة النشاط — أ. منى العمري</h2><p>الأنشطة الصفية · الفصل الدراسي الأول ١٤٤٨هـ · من سجل خطة النشاط المعتمد</p></div>
    <div class="ld-k">${[[D.teachers.length, 'معلمة'], [D.all.length, 'برنامجًا'], [c('run'), 'جارٍ الآن'], [c('done'), 'انتهى'], [c('wait'), 'لم يبدأ'], [noEv, 'بدأ أو انتهى بلا شواهد']]
      .map(([n, l]) => `<div class="card"><b>${ar(n)}</b><span>${l}</span></div>`).join('')}</div>
    <div class="ld-hub">
      ${hubBtn('lg', 'الأنشطة الصفية', `الصفوف ← الفصول ← الأنشطة · ${ar(D.all.length)} نشاطًا`, '#0f6b63')}
      ${hubBtn('ln', 'الأنشطة اللاصفية', `الفترات حسب الأسبوع · ${ar(D.weeks.length)} أسبوعًا`, '#7a4fb5')}
      ${hubBtn('lts', 'الأنشطة حسب المعلمات', `${ar(D.teachers.length)} معلمة مع زميلاتهن`, '#2f6fb0')}
      ${hubBtn('ld', 'الأنشطة حسب المجالات', `${ar(D.doms.length)} مجالات`, '#b7791f')}
      ${hubBtn('lf', 'المجلدات', `أقسام الأرشيف · ${ar(D.folders.length)} أقسام`, '#6b7280')}
      ${hubBtn('lr', 'التقارير', `${ar(D.reports.length)} تقريرًا · تحميل الكل دفعة واحدة`, '#b3261e')}
      ${hubBtn('lm', 'لوحة المؤشرات', 'قوة الشواهد وتحقق التنفيذ', '#8a6f52')}
      ${hubBtn('lb', 'البرامج', `${ar(D.recs.length)} برنامجًا لكل فصل · بحث وتصفية وتقييم`, '#1e7f4f')}
      ${hubBtn('lp', 'كل البرامج حسب التاريخ', 'لكل معلمة، مرتبة حسب البداية', '#4b5563')}
    </div>
    <div class="ld-links">${btn(D.db, 'قاعدة الأنشطة الصفية', 1)} ${btn(D.archive, 'أرشيف الفصل الدراسي الأول', 1)}</div>
    <h3 class="ld-sec">برامج جارية الآن (${ar(run.length)})</h3>${run.length ? recTable(run) : '<p class="ld-empty">لا يوجد برنامج جارٍ اليوم.</p>'}
`;
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
    const L = D.recs.filter(r => r.cls === c.c);
    const gi = D.grades.findIndex(g => g.g === c.g);
    return nav(['lg', 'الأنشطة الصفية'], ['lg/' + gi, 'الصف ' + c.g], ['lc/' + k, clsName(c)]) + `<div class="card ld-h"><h2>${esc(clsName(c))}</h2><p>${c.T.map(t => esc(t.name) + ' (' + esc(t.subj) + ')').join(' · ')} · عدد الطالبات ${ar(c.T[0].students)}</p></div>` + recTable(L);
  }
  /* مؤشر قوة الشواهد والتنفيذ (لكل برنامج بدأ أو انتهى) — صيغة ميسّرة بطلب رائدة النشاط:
     تحقق التنفيذ 50 = شاهد لكل حصتين منقضيتين · انتظام الرفع 20 = المرفوع خلال مدة البرنامج (+14 يومًا)
     تنوع الشواهد 15 = نوع واحد ثلاثة أرباع، ونوعان كامل · التقرير وقياس الأثر 15 = ملف في «قياس الأثر والتقرير» (للمنتهي فقط) */
  const W = [['تحقق التنفيذ', 50], ['انتظام الرفع', 20], ['تنوع الشواهد', 15], ['التقرير وقياس الأثر', 15]];
  const kindOf = m => /^image\//.test(m) ? 'img' : /^video\//.test(m) ? 'vid' : 'doc';
  function score(p) {
    if (p.s !== 'run' && p.s !== 'done') return null;
    const a = day(p.from.g), b = day(p.to.g), f = p.s === 'done' ? 1 : Math.min(1, Math.max(0, (today - a + 864e5) / (b - a + 864e5)));
    const E = Math.max(1, Math.ceil(p.need * f / 2)), n = p.ev.length;
    const inWin = n ? p.ev.filter(x => { const t = Date.parse(x.t); return t >= a - 864e5 && t <= b + 15 * 864e5; }).length / n : 0;
    const c = [Math.min(1, n / E), inWin, (n ? (new Set(p.ev.map(x => kindOf(x.m))).size >= 2 ? 1 : 0.75) : 0), p.s === 'done' ? (p.rep.length ? 1 : 0) : null];
    let sw = 0, sv = 0; c.forEach((v, i) => { if (v !== null) { sw += W[i][1]; sv += v * W[i][1]; } });
    return { v: Math.round(sv / sw * 100), c, E, n };
  }
  const LV = v => v === null || v === undefined ? ['لا بيانات', 'n'] : v >= 80 ? ['متميز', 'a'] : v >= 65 ? ['متقدم', 'b'] : v >= 50 ? ['مقبول', 'c'] : ['يحتاج تحسين', 'd'];
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
    return nav(['lm', 'لوحة المؤشرات']) + `<div class="card ld-h"><h2>لوحة مؤشرات الشواهد والتنفيذ</h2><p>تقيس قوة الشواهد وتحقق التنفيذ لكل برنامج بدأ أو انتهى، وتُحدَّث تلقائيًا مع كل شاهد يُرفع.</p></div>
    ${ev ? '' : '<div class="ld-m-note">لم تُرفع شواهد بعد؛ تكتمل المؤشرات تلقائيًا عندما تبدأ المعلمات رفع الصور من زر «برامج الأنشطة الصفية» في المنصة.</div>'}
    <div class="card ld-hero"><div class="ld-ring" style="--v:${ov || 0}"><div>${pc(ov)}</div></div>
      <div><span class="ld-lv ${lv[1]}">${lv[0]}</span><p>المؤشر العام لـ ${ar(st.length)} برنامجًا بدأت أو انتهت من ${ar(D.all.length)} برنامجًا</p></div></div>
    <div class="ld-k">${[[ar(ev), 'شاهدًا مرفوعًا'], [ar(st.filter(p => p.sc.n > 0).length) + ' من ' + ar(st.length), 'برامج بدأت ولها شواهد'], [ar(st.filter(p => !p.sc.n).length), 'بدأت بلا شواهد'], [ar(noRep), 'انتهت بلا تقرير أو قياس أثر'], [ar(st.filter(p => p.sc.v >= 80).length), 'برامج متميزة']]
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
        <li><b>تحقق التنفيذ (٥٠٪):</b> شاهد واحد لكل حصتين انقضتا من البرنامج يكفي للدرجة الكاملة.</li>
        <li><b>انتظام الرفع (٢٠٪):</b> نسبة الشواهد المرفوعة خلال مدة البرنامج أو خلال أسبوعين بعد نهايته.</li>
        <li><b>تنوع الشواهد (١٥٪):</b> نوع واحد (صور مثلًا) = ٧٥٪ من الدرجة، ونوعان أو أكثر = كاملة.</li>
        <li><b>التقرير وقياس الأثر (١٥٪):</b> وجود ملف في مجلد «قياس الأثر والتقرير» بعد انتهاء البرنامج (لا يُحسب للبرنامج الجاري).</li>
        <li>المستويات: متميز ٨٠٪ فأكثر · متقدم ٦٥٪ · مقبول ٥٠٪ · يحتاج تحسين أقل من ٥٠٪. البرامج التي لم تبدأ لا تدخل في الحساب.</li></ul></details>`;
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
    return nav(['ld', 'الأنشطة حسب المجالات'], ['ld/' + k, d]) + `<div class="ld-dn">${D.doms.map((x, j) => `<button style="--c:${DOM[x] || 'var(--brand)'}" class="${j === k ? 'on' : ''}" data-go="ld/${j}">${esc(x)}</button>`).join('')}</div>
    <div class="card ld-h" style="border-inline-start-color:${DOM[d] || 'var(--brand)'}"><h2>مجال ${esc(d)}</h2><p>${ar(L.length)} برنامجًا لدى ${ar(new Set(L.map(p => p.t.name)).size)} معلمة · ${names.map(esc).join('، ')}</p></div>
    ${names.map(n => { const R = D.recs.filter(r => r.dom === d && r.n === n); return `<h3 class="ld-sec">${esc(n)} — ${ar(R.length)} فصول · المعلمات: ${[...new Set(R.flatMap(r => r.T.map(t => t.name)))].map(esc).join('، ')}</h3>` + recTable(R); }).join('')}`;
  }
  function teacher(D, i) {
    const t = D.teachers[i]; if (!t) return home(D);
    return nav(['lts', 'الأنشطة حسب المعلمات'], ['lt/' + i, t.name]) + `<div class="card ld-h"><h2>${esc(t.name)}</h2><p>${esc(t.cls)} · مادة ${esc(t.subj)} · عدد الطالبات ${ar(t.students)} · ${ar(t.p.length)} برامج</p></div>
    <div class="ld-links">${btn(t.url, 'مجلد المعلمة')} ${t.mates.map(m => `<button class="btn sm ghost" data-go="lt/${m.i}">زميلتها: ${esc(m.name)}</button>`).join(' ')} <button class="btn sm ghost" data-go="lc/${D.cls.findIndex(c => c.c === t.cls)}">برامج الفصل</button></div>
    ${t.mates.length ? `<p class="ld-mate">${t.mates.map(m => same(t, m) ? `تنفذ البرامج نفسها مع زميلتها ${esc(m.name)}.` : `برامجها في جدول الإسناد تختلف عن زميلتها ${esc(m.name)}.`).join(' ')}</p>` : '<p class="ld-mate">لا زميلة لها في الفصل.</p>'}${table(t.p, false)}
    ${t.p.map(p => `<h3 class="ld-sec">${esc(p.n)} — الشواهد (${ar(p.ev.length)})</h3>${p.ev.length ? `<div class="ld-f">${p.ev.map(f =>
      `<a href="https://drive.google.com/file/d/${esc(f.id)}/view" target="_blank" rel="noopener"><b>${esc(f.n)}</b><span>${new Date(f.t).toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long' })}</span></a>`).join('')}</div>` : '<p class="ld-empty">لم تُرفع شواهد بعد.</p>'}`).join('')}`;
  }
  function all(D) {
    return nav(['lp', 'كل البرامج']) + `<div class="card ld-h"><h2>كل البرامج (${ar(D.all.length)})</h2><p>مرتبة حسب تاريخ البداية</p></div>` + table(D.all.slice().sort((a, b) => (a.from ? day(a.from.g) : 9e15) - (b.from ? day(b.from.g) : 9e15)), true);
  }
  window.LEADER = {
    render(D, v, a) { style(); events(); window.__LD = D; prep(D); return v === 'lt' ? teacher(D, +a) : v === 'ld' ? (a === undefined || a === '' ? domainsPage(D) : domain(D, +a)) : v === 'lg' ? (a === undefined || a === '' ? grades(D) : grade(D, +a)) : v === 'ln' ? nonClass(D) : v === 'lts' ? teachersPage(D) : v === 'lf' ? foldersPage(D) : v === 'lr' ? reportsPage(D) : v === 'lc' ? klass(D, +a) : v === 'lb' ? (a === undefined || a === '' ? programs(D) : record(D, +a)) : v === 'lm' ? metrics(D) : v === 'lp' ? all(D) : home(D); },
    title: 'بوابة رائدة النشاط',
  };
})();
