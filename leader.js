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
.ld-f a span{color:var(--muted);font-size:12px;white-space:nowrap}
.ld-row{display:flex;gap:6px;align-items:stretch}.ld-row>a{flex:1;min-width:0}
.ld-del{border:1px solid var(--line);background:var(--card);color:var(--none);border-radius:10px;padding:4px 10px;font:inherit;font-size:12.5px;cursor:pointer}.ld-del:hover{border-color:var(--none)}.ld-del:disabled{opacity:.5;cursor:wait}
.ld-cell{display:flex;flex-direction:column;gap:4px}.ld-cell .ld-del{padding:3px 6px}
.ld-dup{outline:2px solid var(--none);outline-offset:-1px}
.ld-al{padding:14px 16px;display:grid;gap:10px;margin-bottom:12px;border-inline-start:4px solid #b4443c}.ld-alh{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}.ld-alh label{display:flex;gap:8px;align-items:center;cursor:pointer;font-size:15.5px}.ld-alh input{width:18px;height:18px;accent-color:var(--brand)}
.ld-alt{width:100%;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--soft);font:inherit;font-size:14px;line-height:1.7;resize:vertical}.ld-al .ld-links{margin:0}.ld-empty{color:var(--muted);font-size:13px;padding:6px 0}`;
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
    D.all.forEach(p => { const pc = p.cls || p.t.cls, key = pc + ' | ' + p.n;   // p.cls: برنامج خاص بالمعلمة في فصل آخر
      const r = RM[key] = RM[key] || { key, cls: pc, n: p.n, dom: p.dom, need: p.need, from: p.from, to: p.to, s: p.s, P: [] };
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
    <td><span class="chip s-${ST[p.s][1]}">${ST[p.s][0]}</span></td><td>${evChip(p)}</td>
    <td>${btn(p.evUrl, 'الشواهد')} ${btn(p.repUrl, 'قياس الأثر والتقرير', 1)}</td></tr>`;
  const table = (rows, withTeacher) => `<div class="card ld-tw"><table class="ld-t"><thead><tr>${withTeacher ? '<th>المعلمة</th>' : ''}<th>البرنامج</th><th>عدد الحصص</th><th>البداية</th><th>النهاية</th><th>الحالة</th><th>الشواهد</th><th>المجلدات</th></tr></thead><tbody>${rows.map(p => progRow(p, withTeacher)).join('')}</tbody></table></div>`;

  const NUM = ['', 'واحد', 'اثنين', 'ثلاثة', 'أربعة', 'خمسة'];
  const clsName = c => `فصل ${c.g} ${NUM[c.no] || ar(c.no)}`;
  // شريط التنقل: «→ رجوع» إلى الصفحة الأعلى + مسار الصفحات
  const nav = (...L) => `<div class="ld-nav"><button class="btn sm" data-go="${L.length > 1 ? L[L.length - 2][0] : 'start'}">→ رجوع</button><span class="bc">${[['start', 'الرئيسية']].concat(L).map(([h, t], i, A) => i === A.length - 1 ? `<b>${esc(t)}</b>` : `<button data-go="${h}">${esc(t)}</button>`).join(' ‹ ')}</span></div>`;
  const hubBtn = (go, t, sub, c) => `<button class="ld-hb" style="--c:${c}" data-go="${go}"><b>${t}</b><small>${sub}</small></button>`;
  // «الأنشطة الصفية»: أربعة أزرار فقط (طلب رائدة النشاط)
  function classHub(D) {
    return nav(['lg', 'الأنشطة الصفية']) + `<div class="card ld-h"><h2>الأنشطة الصفية</h2><p>${ar(D.all.length)} نشاطًا · ${ar(D.teachers.length)} معلمة · الفصل الدراسي الأول ١٤٤٨هـ</p></div>
    <div class="ld-hub">
      ${hubBtn('lts', 'المعلمات', `${ar(D.teachers.length)} معلمة مع زميلاتهن في الفصل`, '#2f6fb0')}
      ${hubBtn('ld', 'المجالات', `${ar(D.doms.length)} مجالات`, '#b7791f')}
      ${hubBtn('lf', 'المجلدات', `أقسام الأرشيف · ${ar(D.folders.length)} أقسام`, '#6b7280')}
      ${hubBtn('lm', 'لوحة المؤشرات', 'قوة الشواهد وتحقق التنفيذ', '#8a6f52')}
    </div>`;
  }
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
  // المكرر = نفس الاسم (بلا « (2)» ونحوها) ونفس الحجم في القائمة نفسها؛ تبقى الأقدم أصلًا وتُعلَّم الباقية «مكرر»
  const dupIds = F => { const seen = {}, d = new Set();
    F.slice().sort((a, b) => String(a.t).localeCompare(String(b.t))).forEach(f => { const k = f.n.replace(/\s*\(\d+\)(?=\.[^.]*$)/, '') + '|' + f.s; if (seen[k]) d.add(f.id); else seen[k] = 1; });
    return d; };
  const dupChip = '<span class="chip s-none">مكرر</span>';
  const delBtn = f => `<button class="ld-del" data-del="${esc(f.id)}" data-n="${esc(f.n)}" title="نقل إلى سلة المحذوفات في Drive">حذف</button>`;
  const fileLink = (f, dup) => `<div class="ld-row"><a href="https://drive.google.com/file/d/${esc(f.id)}/view" target="_blank" rel="noopener"${dup ? ' class="ld-dup"' : ''}><b>${esc(f.n)}</b><span>${dup ? dupChip + ' ' : ''}${new Date(f.t).toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long' })}</span></a>${delBtn(f)}</div>`;
  const fileList = F => { const d = dupIds(F); return `<div class="ld-f">${F.map(f => fileLink(f, d.has(f.id))).join('')}</div>`; };
  function nonClass(D) {
    const n = D.weeks.reduce((a, w) => a + w.files.length + w.subs.reduce((b, s) => b + s.files.length, 0), 0);
    return nav(['ln', 'الأنشطة اللاصفية']) + `<div class="card ld-h"><h2>الأنشطة اللاصفية</h2><p>الفترات اللاصفية (الإذاعة والاصطفاف الصباحي والصلاة) حسب الأسبوع · ${ar(n)} تقريرًا · من «1. التقارير / التقارير اللاصفية (الفترات)»</p></div>
    <div class="ld-fo">${D.weeks.map(w => { const c = w.files.length + w.subs.reduce((b, s) => b + s.files.length, 0);
      return `<details class="card"${c ? ' open' : ''}><summary><span>${esc(w.n)}</span><span class="chip ${c ? 's-ok' : 's-na'}">${ar(c)} تقرير</span></summary>
        ${w.files.length ? fileList(w.files) : ''}
        ${w.subs.map(s => `<p class="ld-empty" style="margin:10px 0 4px">${esc(s.n)}</p>${s.files.length ? fileList(s.files) : '<p class="ld-empty">لا تقارير.</p>'}`).join('')}
        <div class="ld-links" style="margin-top:8px">${btn(w.url, 'فتح مجلد الأسبوع', 1)}</div></details>`; }).join('') || '<p class="ld-empty">لا توجد أسابيع.</p>'}</div>`;
  }
  function teachersPage(D) {
    return nav(['lg', 'الأنشطة الصفية'], ['lts', 'المعلمات']) + `<div class="card ld-h"><h2>المعلمات</h2><p>كل معلمة مع زميلتها في الفصل؛ اضغطي اسم المعلمة لعرض أنشطتها</p></div>` + classCards(D);
  }
  function domainsPage(D) {
    return nav(['lg', 'الأنشطة الصفية'], ['ld', 'المجالات']) + `<div class="card ld-h"><h2>المجالات</h2><p>المجالات المعتمدة في سجل خطة النشاط</p></div>` + domCards(D);
  }
  function foldersPage(D) {
    return nav(['lg', 'الأنشطة الصفية'], ['lf', 'المجلدات']) + `<div class="card ld-h"><h2>المجلدات</h2><p>أقسام أرشيف «الفصل الدراسي الأول 1448هـ» كما هي في Drive، وعدد الملفات في كل قسم</p></div>
    <div class="ld-links">${btn(D.archive, 'فتح الأرشيف كاملًا')} ${btn(D.db, 'قاعدة الأنشطة الصفية', 1)}</div>
    <div class="ld-fo">${D.folders.map(f => `<details class="card"><summary><span>${esc(f.n)}</span><span class="chip s-na">${ar(f.count)} ملف</span></summary>
      <ul>${f.subs.map(x => `<li><span>${esc(x.n)}</span><span style="display:flex;gap:8px;align-items:center"><span class="muted">${ar(x.count)} ملف</span>${btn(x.url, 'فتح', 1)}</span></li>`).join('') || '<li>لا مجلدات فرعية</li>'}</ul>
      <div class="ld-links" style="margin-top:8px">${btn(f.url, 'فتح القسم')}</div></details>`).join('')}</div>`;
  }
  // «تحميل الكل» للطباعة: ملف PDF واحد لكل نوع (tools/act_reports.py)؛ مشفر بمفتاح في ملف الرائدة (D.ar.key) ويُفك في المتصفح
  const arAll = D => { const A = D.ar; if (!A || !(A.cls || A.non)) return '';
    const b = (k, l) => A[k] ? `<button class="btn" data-arl="${k}">${l} — ${ar(A[k].count)} تقارير · ${ar(A[k].pages)} صفحة</button>` : '';
    const ord = (k, t, how) => A[k] && A[k].items ? `<details class="ld-fold" style="margin:0"><summary>ترتيب ${t} في الملف (${how})</summary><ol style="margin:8px 0 0;padding-inline-start:22px;font-size:13px;line-height:1.9">${A[k].items.map(x => `<li>${esc(x)}</li>`).join('')}</ol></details>` : '';
    return `<div class="card ld-tools"><h4>تحميل الكل للطباعة (ملف PDF واحد)</h4><div class="row2">${b('cls', 'الأنشطة الصفية')} ${b('non', 'الأنشطة اللاصفية')}<span class="ld-msg" id="arlMsg"></span></div>
      ${ord('cls', 'الأنشطة الصفية', 'الصف ← الفصل ← المجال ← البرنامج')}${ord('non', 'الأنشطة اللاصفية', 'الأسبوع ← الفصل')}</div>`; };
  document.addEventListener('click', async ev => {
    const b = ev.target.closest('[data-arl]'); if (!b) return;
    const A = D_().ar, it = A[b.dataset.arl], msg = document.getElementById('arlMsg'), old = b.textContent;
    b.disabled = true; b.textContent = 'جارٍ التجهيز…';
    try {
      const key = await crypto.subtle.importKey('raw', Uint8Array.from(A.key.match(/../g).map(h => parseInt(h, 16))), 'AES-GCM', false, ['decrypt']);
      const r = await fetch(it.bin + '?t=' + Date.now(), { cache: 'no-cache' }); if (!r.ok) throw new Error('net');
      const u = new Uint8Array(await r.arrayBuffer()), pdf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(0, 12) }, key, u.subarray(12));
      const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' })), a = document.createElement('a');
      a.href = url; a.download = (b.dataset.arl === 'cls' ? 'تقارير الأنشطة الصفية' : 'تقارير الأنشطة اللاصفية') + ' - 1448هـ.pdf'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 120000); if (msg) msg.textContent = 'تم التحميل';
    } catch { if (msg) { msg.textContent = 'تعذّر التحميل، حاولي مرة أخرى'; msg.className = 'ld-msg err'; } }
    finally { b.disabled = false; b.textContent = old; }
  });
  function reportsPage(D) {
    const R = D.reports.slice().sort((a, b) => a.p.localeCompare(b.p, 'ar') || a.n.localeCompare(b.n, 'ar'));
    const groups = [...new Set(R.map(r => r.p))];
    const z = D.zip;
    return nav(['lr', 'التقارير']) + arAll(D) + `<div class="card ld-h"><h2>التقارير (${ar(R.length)})</h2><p>كل تقارير PDF في الأرشيف: التقارير الصفية واللاصفية، والجاهزة للختم، وتقارير البرامج</p></div>
    <div class="ld-links">${z ? `<a class="btn" href="https://drive.google.com/uc?export=download&id=${esc(z.id)}" target="_blank" rel="noopener">تحميل كل التقارير دفعة واحدة (ZIP)</a> <a class="btn ghost" href="https://drive.google.com/file/d/${esc(z.id)}/view" target="_blank" rel="noopener">عرض الملف المضغوط</a>
      <span class="ld-empty">آخر تجميع: ${new Date(z.t).toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long' })}</span>` : '<span class="ld-empty">يُجهَّز ملف التحميل الكامل مع التحديث القادم.</span>'}</div>
    ${groups.map(g => `<h3 class="ld-sec">${esc(g)}</h3>${fileList(R.filter(r => r.p === g))}`).join('') || '<p class="ld-empty">لا توجد تقارير بعد.</p>'}`;
  }
  /* ── التقييم: يُقرأ ويُحفظ في «قاعدة الأنشطة الصفية» (ورقة «التقييم») عبر نظام Apps Script؛ لا يُحفظ في المتصفح ── */
  const code = () => { try { return sessionCode; } catch { return ''; } };
  async function api(body) {   // POST نص JSON (بلا طلب تمهيدي)؛ إعادة المحاولة لأن خادم Google يفشل أحيانًا
    let last = 'تعذر الاتصال';
    for (let i = 0; i < 3; i++) {
      try { const r = await fetch(window.__LD.api, { method: 'POST', signal: AbortSignal.timeout ? AbortSignal.timeout(45000) : undefined, headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ code: code() }, body)) });
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
    <td><span class="chip s-${ST[r.s][1]}">${ST[r.s][0]}</span></td><td>${upChip(n)}</td>
    <td><button class="btn sm" data-go="lb/${r.i}">فتح</button></td></tr>`; };
  const recTable = R => R.length ? `<div class="card ld-tw"><table class="ld-t"><thead><tr><th>البرنامج</th><th>الفصل والمعلمات</th><th>البداية</th><th>النهاية</th><th>التنفيذ</th><th>الشواهد</th><th></th></tr></thead><tbody>${R.map(recRow).join('')}</tbody></table></div>` : '<p class="ld-empty">لا برامج.</p>';
  const thumb = f => /^image\//.test(f.m) ? `<img loading="lazy" src="https://drive.google.com/thumbnail?id=${esc(f.id)}&sz=w400" alt="" onerror="this.replaceWith(document.createTextNode('صورة'))">` : esc((f.n.split('.').pop() || 'ملف').toUpperCase());
  const grid = F => { const d = dupIds(F); return F.length ? `<div class="ld-grid">${F.map(f => `<div class="ld-cell"><a class="ld-it${d.has(f.id) ? ' ld-dup' : ''}" href="https://drive.google.com/file/d/${esc(f.id)}/view" target="_blank" rel="noopener" title="${esc(f.n)}"><span class="th">${thumb(f)}</span><span>${d.has(f.id) ? dupChip + ' ' : ''}${esc(f.n)}</span></a>${delBtn(f)}</div>`).join('')}</div>` : '<p class="ld-empty">لا ملفات في هذا المجلد.</p>'; };

  // صفحة سجل البرنامج: المعلمات المشاركات، الحالات الأربع منفصلة، المجلدات والشواهد، الرفع وإنشاء المجلدات، والتقييم
  function record(D, i) {
    const r = D.recs[i]; if (!r) return programs(D);
    const e = evOf(r), n = recFiles(r).length;
    const folders = r.P.flatMap(p => [
      { id: p.ids && p.ids.ev, n: 'الشواهد', who: p.t.name, url: p.evUrl, files: p.ev },
      { id: p.ids && p.ids.rep, n: 'قياس الأثر والتقرير', who: p.t.name, url: p.repUrl, files: p.rep }]
      .concat((p.more || []).map(m => ({ id: m.id, n: m.n, who: p.t.name, url: m.url, files: m.files, mine: 1 }))));
    return nav(['lg', 'الأنشطة الصفية'], ['lb/' + i, r.n + ' — ' + r.cls])
    + `<div class="card ld-h" style="border-inline-start-color:${DOM[r.dom] || 'var(--brand)'}"><h2>${esc(r.n)}</h2><p>${esc(r.dom)} · ${esc(r.cls)} · ${per(r.need)} · من ${r.from ? esc(r.from.d) + ' ' + hd(r.from.h) : '—'} إلى ${r.to ? esc(r.to.d) + ' ' + hd(r.to.h) : '—'}</p></div>
    <div class="ld-st">
      <div class="card"><small>حالة التنفيذ (حسب التاريخ)</small><b><span class="chip s-${ST[r.s][1]}">${ST[r.s][0]}</span></b></div>
      <div class="card"><small>رفع الشواهد</small><b>${upChip(n)}</b></div></div>
    <div class="ld-links">${r.T.map(t => `<button class="btn sm ghost" data-go="lt/${t.i}">${esc(t.name)}</button>`).join(' ')} <button class="btn sm ghost" data-go="lc/${D.cls.findIndex(c => c.c === r.cls)}">برامج الفصل</button> <button class="btn sm ghost" data-go="ld/${D.doms.indexOf(r.dom)}">مجال ${esc(r.dom)}</button></div>
    <div class="card ld-ev" data-rec="${i}"><h4>ملاحظات رائد النشاط</h4>
      <label for="ldN">ملاحظات على الشواهد أو البرنامج</label><textarea id="ldN" placeholder="تكتب ما يلاحظ على التنفيذ أو الشواهد">${esc(e.notes || '')}</textarea>
      <div class="row2"><button class="btn" data-act="save">حفظ الملاحظات</button><span class="ld-msg" id="ldMsg">${e.at ? 'آخر تحديث: ' + esc(e.at) : 'لا ملاحظات بعد'}</span></div>
      <p class="ld-d" style="margin:8px 0 0">تظهر الملاحظات ${r.T.length > 1 ? 'للمعلمتين' : 'للمعلمة'} في صفحة البرنامج بالمنصة خلال ربع ساعة تقريبًا من الحفظ.</p></div>
    ${D.survey && D.survey.ids && D.survey.ids[r.key] && typeof ctSrvCard === 'function' ? ctSrvCard(D.survey.ids[r.key], r.n, r.cls, ((D.teachers || []).find(t => t.cls === r.cls) || {}).students, '', 1) : ''}
    <div class="card ld-tools" data-rec="${i}"><h4>إضافة شواهد أو مجلد</h4>
      <div class="row2"><select id="ldF" aria-label="المجلد">${folders.filter(f => f.id).map(f => `<option value="${esc(f.id)}">${esc(f.who)} / ${esc(f.n)}</option>`).join('')}</select>
        <label class="btn sm ghost" style="cursor:pointer">اختيار ملفات<input type="file" id="ldU" multiple hidden></label><span class="ld-msg" id="ldUM">الصور تُصغَّر قبل الرفع</span></div>
      <div class="row2"><input type="text" id="ldD" placeholder="اسم مجلد جديد (مثل: الصور، الاستبانات، النتائج والمؤشرات)" style="flex:1;min-width:200px">
        <select id="ldDP" aria-label="داخل مجلد المعلمة">${r.P.filter(p => p.ids && p.ids.p).map(p => `<option value="${esc(p.ids.p)}">داخل مجلد ${esc(p.t.name)}</option>`).join('')}</select>
        <button class="btn sm" data-act="mkdir">إنشاء المجلد</button></div></div>
    <h3 class="ld-sec">المجلدات والشواهد (${ar(n)} ملف)</h3>
    ${folders.map(f => `<details class="card ld-fold"${f.files.length ? ' open' : ''}><summary><span>${esc(f.n)} <span class="ld-d" style="display:inline">· ${esc(f.who)}</span></span><span class="ld-dots">${upChip(f.files.length)}${dupIds(f.files).size ? `<span class="chip s-none">${ar(dupIds(f.files).size)} مكرر</span>` : ''}${btn(f.url, 'فتح في Drive', 1)}</span></summary>${grid(f.files)}</details>`).join('')}`;
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
      <select id="lbS"><option value="">كل الحالات</option><option value="run">جارٍ الآن</option><option value="done">انتهى</option><option value="wait">لم يبدأ</option><option value="noev">بلا شواهد</option></select></div>
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
  function purge(o, id, seen = new Set()) {   // يزيل الملف المحذوف من كل القوائم (التقارير، الأسابيع، مجلدات البرامج)
    if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
    if (Array.isArray(o)) { for (let i = o.length - 1; i >= 0; i--) if (o[i] && o[i].id === id && o[i].m) o.splice(i, 1); }
    Object.values(o).forEach(v => purge(v, id, seen));
  }
  function events() {
    if (window.__LDev) return; window.__LDev = 1;
    document.addEventListener('input', ev => {
      const id = ev.target.id;
      if (/^lb[QDTMS]$/.test(id)) filterPrograms();
      if (ev.target.classList.contains('ld-alc')) { const n = document.getElementById('laN'); if (n) n.textContent = ar(document.querySelectorAll('.ld-alc:checked').length); }
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
          const j = await api({ a: 'upload', uid: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + k, key: r.key, folder, name: f.name, mime: f.type || 'application/octet-stream', b64 });
          r.P.forEach(p => { if (p.ids && p.ids.ev === folder) p.ev.push(j.file); else if (p.ids && p.ids.rep === folder) p.rep.push(j.file); else (p.more || []).forEach(m => { if (m.id === folder) m.files.push(j.file); }); });
          ok++;
        } catch (e) { msg.textContent = `تعذر رفع «${f0.name}»: ${e.message}`; msg.className = 'ld-msg err'; }
      }
      if (ok) { route(); const m = document.getElementById('ldUM'); if (m) m.textContent = `رُفع ${ar(ok)} من ${ar(files.length)}`; }
    });
    document.addEventListener('click', async ev => {   // حذف ملف: إلى سلة المحذوفات في Drive (يُسترجع خلال ٣٠ يومًا)
      const x = ev.target.closest('[data-del]'); if (!x) return;
      ev.preventDefault();
      if (!confirm(`حذف «${x.dataset.n}»؟
يُنقل الملف إلى سلة المحذوفات في Google Drive ويمكن استرجاعه خلال ٣٠ يومًا.`)) return;
      x.disabled = true; x.textContent = 'جارٍ الحذف…';
      try { await api({ a: 'del', id: x.dataset.del }); purge(D_(), x.dataset.del); const y = window.scrollY; route(); window.scrollTo(0, y); }
      catch (e) { x.disabled = false; x.textContent = 'حذف'; alert('تعذر الحذف: ' + e.message); }
    });
    document.addEventListener('click', async ev => {
      const b = ev.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act.startsWith('al-')) return alertAct(b);
      const box = b.closest('[data-rec]'), D = D_(), r = D.recs[+box.dataset.rec];
      const say = (t, err) => { const m = box.querySelector('.ld-msg:last-child') || document.getElementById('ldMsg'); if (m) { m.textContent = t; m.className = 'ld-msg' + (err ? ' err' : ''); } };
      b.disabled = true;
      try {
        if (b.dataset.act === 'seen' || b.dataset.act === 'save') {
          const body = { a: 'eval', key: r.key };
          if (b.dataset.act === 'seen') body.seen = !(evOf(r).seen);
          else body.notes = document.getElementById('ldN').value;   // الملاحظات فقط؛ لا اطلاع ولا درجة (طلب رائد النشاط)
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
    return `<div class="card ld-h"><h2>صفحة رائد النشاط : منى العمري</h2><p>الفصل الدراسي الأول ١٤٤٨هـ · من سجل خطة النشاط المعتمد</p></div>
    <div class="ld-k">${[[D.teachers.length, 'معلمة'], [D.all.length, 'برنامجًا'], [c('run'), 'جارٍ الآن'], [c('done'), 'انتهى'], [c('wait'), 'لم يبدأ'], [noEv, 'بدأ أو انتهى بلا شواهد']]
      .map(([n, l]) => `<div class="card"><b>${ar(n)}</b><span>${l}</span></div>`).join('')}</div>
    <div class="ld-hub">
      ${hubBtn('lg', 'الأنشطة الصفية', 'المعلمات · المجالات · المجلدات · لوحة المؤشرات', '#0f6b63')}
      ${hubBtn('ln', 'الأنشطة اللاصفية', `الفترات حسب الأسبوع · ${ar(D.weeks.length)} أسبوعًا`, '#7a4fb5')}
      ${hubBtn('lnr', 'تقارير المعلمات في الأنشطة اللاصفية', 'التقارير حسب الأسبوع · المؤشرات والخطة الزمنية', '#b5477a')}
      ${hubBtn('la', 'رسائل التنبيه', (n => n ? `${ar(n)} معلمة لديها برامج انتهت بلا شواهد` : 'لا توجد برامج منتهية بلا شواهد')(overdue(D).length), '#b4443c')}
    </div>
    <h3 class="ld-sec">برامج جارية الآن (${ar(run.length)})</h3>${run.length ? recTable(run) : '<p class="ld-empty">لا يوجد برنامج جارٍ اليوم.</p>'}
`;
  }
  // «رسائل التنبيه»: تنبيه المعلمة بالبرامج التي انتهت ولم تُرفق شواهدها (لا صور في «الشواهد» في مجلدها).
  // تُرسل مشفرة إلى صندوق المنصة (sealSend في index.html)، وينقلها جهاز المدرسة (tools/inbox.js) إلى تنبيهات المعلمة
  // فتظهر في «الرئيسية» عندها؛ السجل data/ln.json (مشفر برمز الرائدة) يبيّن ما وصل وما اطّلعت عليه.
  const overdue = D => D.teachers.map(t => ({ t, P: t.p.filter(p => p.s === 'done' && !p.ev.length) })).filter(x => x.P.length);
  const hijri = iso => { const f = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(new Date(iso));
    const g = k => +(f.find(x => x.type === k) || {}).value; return hd(`${g('year')}/${g('month')}/${g('day')}`); };
  const alMsg = (t, P) => `السلام عليكم ورحمة الله وبركاته\nأ. ${t.name}\n${P.length === 1 ? 'انتهى موعد تنفيذ البرنامج التالي ولم تُرفق شواهده بعد:' : 'انتهى موعد تنفيذ البرامج التالية ولم تُرفق شواهدها بعد:'}\n`
    + P.map(p => `• ${p.n} — انتهى ${p.to.d} ${hd(p.to.h)}`).join('\n') + '\nنأمل رفع صور الشواهد من زر «الأنشطة الصفية» في المنصة.\nرائد النشاط: منى العمري';
  const PEND = 'ld-al-pend';
  const pendGet = () => { try { return JSON.parse(localStorage.getItem(PEND) || '[]'); } catch { return []; } };
  const pendSet = v => { try { localStorage.setItem(PEND, JSON.stringify(v.slice(-200))); } catch {} };
  function loadLog(D, force) {   // السجل يُقرأ من نسخة الموقع المنشورة (قد يتأخر دقيقة بعد معالجة جهاز المدرسة)
    if (D._ln && !force) return Promise.resolve(D._ln);
    return fetch('data/ln.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json().then(e => openBox(e, code())).then(x => x.items || []) : [])
      .catch(() => []).then(L => { D._ln = L; const have = new Set(L.map(x => x.id)); pendSet(pendGet().filter(p => !have.has(p.id) && Date.now() - Date.parse(p.at) < 2 * 864e5)); return L; });
  }
  const lastOf = (D, name) => (D._ln || []).filter(x => x.to === name).concat(pendGet().filter(x => x.to === name)).sort((a, b) => b.at.localeCompare(a.at))[0];
  const stOf = x => x.pend ? '<span class="chip s-part">قيد الإرسال</span>' : x.ok === false ? '<span class="chip s-none">لم تصل: لا حساب لها في المنصة</span>' : x.closed ? `<span class="chip s-ok">اطّلعت ${hijri(x.closed)}</span>` : '<span class="chip s-na">وصلت · لم تطّلع بعد</span>';
  const lastTxt = (D, name) => { const x = lastOf(D, name); return x ? `آخر تنبيه ${hijri(x.at)} ${stOf(x)}` : 'لم يُرسل لها تنبيه بعد'; };
  function paintLog(D) {
    document.querySelectorAll('[data-last]').forEach(s => { s.innerHTML = lastTxt(D, s.dataset.last); });
    const box = document.getElementById('laLog'); if (!box) return;
    const L = (D._ln || []).concat(pendGet()).sort((a, b) => b.at.localeCompare(a.at));
    box.innerHTML = L.length ? `<div class="card ld-tw"><table class="ld-t"><thead><tr><th>التاريخ</th><th>المعلمة</th><th>البرامج</th><th>الحالة</th></tr></thead><tbody>${L.slice(0, 100).map(x =>
      `<tr><td class="ld-w"><b>${hijri(x.at)}</b></td><td>${esc(x.to)}</td><td>${(x.progs || []).map(esc).join('<br>') || '—'}</td><td>${stOf(x)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="ld-empty">لم يُرسل أي تنبيه بعد.</p>';
  }
  function alerts(D) {
    const O = overdue(D), can = new Set(D.alert || []);
    setTimeout(() => loadLog(D, true).then(() => paintLog(D)), 0);
    const card = ({ t, P }) => { const ok = can.has(t.name) && D.inbox;
      return `<div class="card ld-al" data-al="${t.i}"><div class="ld-alh"><label><input type="checkbox" class="ld-alc"${ok ? ' checked' : ' disabled'}> <b>${esc(t.name)}</b></label>
        <span class="ld-d" style="display:inline">${esc(t.cls)}${t.mates.length ? ' · مع ' + t.mates.map(m => esc(m.name)).join(' و ') : ''}</span>
        <span class="chip s-none">${P.length === 1 ? 'برنامج واحد' : ar(P.length) + ' برامج'} بلا شواهد</span></div>
        <div class="ld-links">${P.map(p => `<button class="btn sm ghost" data-go="lb/${p.rec.i}">${esc(p.n)} · انتهى ${hd(p.to.h)}</button>`).join('')}</div>
        ${ok ? `<textarea class="ld-alt" rows="${P.length + 6}" aria-label="نص التنبيه إلى ${esc(t.name)}">${esc(alMsg(t, P))}</textarea>` : '<p class="ld-msg err">لا حساب لها في المنصة، فلا يصلها التنبيه.</p>'}
        <span class="ld-msg" data-last="${esc(t.name)}">${lastTxt(D, t.name)}</span></div>`; };
    const n = O.filter(x => can.has(x.t.name)).length;
    return nav(['la', 'رسائل التنبيه']) + `<div class="card ld-h" style="border-inline-start-color:#b4443c"><h2>رسائل التنبيه</h2><p>البرامج التي انتهى موعدها حسب سجل الخطة ولم تُرفق المعلمة شواهدها. يمكنك تعديل نص كل رسالة قبل الإرسال، وتظهر في الصفحة الرئيسية للمعلمة في المنصة خلال ٥–١٠ دقائق.</p></div>
    ${O.length ? `<div class="card ld-tools"><div class="row2"><button class="btn" data-act="al-send"${n && D.inbox ? '' : ' disabled'}>إرسال التنبيه إلى المحددات (<span id="laN">${ar(n)}</span>)</button>
      <button class="btn sm ghost" data-act="al-all">تحديد الكل</button><button class="btn sm ghost" data-act="al-none">إلغاء التحديد</button><span class="ld-msg" id="laMsg">${D.inbox ? '' : 'الإرسال غير مفعّل بعد في هذه النسخة.'}</span></div></div>
      ${O.map(card).join('')}` : '<div class="card ld-h"><p>لا توجد برامج انتهت بلا شواهد. 👍</p></div>'}
    <h3 class="ld-sec">التنبيهات المرسلة</h3><div id="laLog"><p class="ld-empty">جارٍ التحميل…</p></div>`;
  }
  async function alertAct(b) {
    const D = D_(), all = [...document.querySelectorAll('.ld-al')], cnt = () => { const n = document.getElementById('laN'); if (n) n.textContent = ar(document.querySelectorAll('.ld-alc:checked').length); };
    if (b.dataset.act === 'al-all' || b.dataset.act === 'al-none') { all.forEach(c => { const x = c.querySelector('.ld-alc'); if (!x.disabled) x.checked = b.dataset.act === 'al-all'; }); return cnt(); }
    const msg = document.getElementById('laMsg'), say = (t, err) => { msg.textContent = t; msg.className = 'ld-msg' + (err ? ' err' : ''); };
    const at = new Date().toISOString(), items = all.filter(c => c.querySelector('.ld-alc:checked')).map(c => { const t = D.teachers[+c.dataset.al];
      return { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), to: t.name, text: c.querySelector('.ld-alt').value.trim(), progs: overdue(D).find(x => x.t === t).P.map(p => p.n) }; });
    if (!items.length) return say('اختاري معلمة واحدة على الأقل', 1);
    if (items.some(x => !x.text)) return say('نص التنبيه فارغ لإحدى المعلمات', 1);
    b.disabled = true; say('جارٍ الإرسال…');
    try {
      await sealSend({ kind: 'lalert', code: code(), items }, new Uint8Array(0));
      pendSet(pendGet().concat(items.map(x => ({ ...x, at, pend: 1 })))); paintLog(D);
      say(`أُرسل ${items.length === 1 ? 'التنبيه' : ar(items.length) + ' تنبيهات'}، ويظهر في رئيسية المعلمة خلال ٥–١٠ دقائق`);
    } catch (e) { say('تعذّر الإرسال، حاولي مرة أخرى', 1); } finally { b.disabled = false; }
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
    return nav(['lg', 'الأنشطة الصفية'], ['lts', 'المعلمات'], ['lc/' + k, clsName(c)]) + `<div class="card ld-h"><h2>${esc(clsName(c))}</h2><p>${c.T.map(t => esc(t.name) + ' (' + esc(t.subj) + ')').join(' · ')} · عدد الطالبات ${ar(c.T[0].students)}</p></div>` + recTable(L);
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
    return nav(['lg', 'الأنشطة الصفية'], ['lm', 'لوحة المؤشرات']) + `<div class="card ld-h"><h2>لوحة مؤشرات الشواهد والتنفيذ</h2><p>تقيس قوة الشواهد وتحقق التنفيذ لكل برنامج بدأ أو انتهى، وتُحدَّث تلقائيًا مع كل شاهد يُرفع.</p></div>
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
    return nav(['lg', 'الأنشطة الصفية'], ['ld', 'المجالات'], ['ld/' + k, d]) + `<div class="ld-dn">${D.doms.map((x, j) => `<button style="--c:${DOM[x] || 'var(--brand)'}" class="${j === k ? 'on' : ''}" data-go="ld/${j}">${esc(x)}</button>`).join('')}</div>
    <div class="card ld-h" style="border-inline-start-color:${DOM[d] || 'var(--brand)'}"><h2>مجال ${esc(d)}</h2><p>${ar(L.length)} برنامجًا لدى ${ar(new Set(L.map(p => p.t.name)).size)} معلمة · ${names.map(esc).join('، ')}</p></div>
    ${names.map(n => { const R = D.recs.filter(r => r.dom === d && r.n === n); return `<h3 class="ld-sec">${esc(n)} — ${ar(R.length)} فصول · المعلمات: ${[...new Set(R.flatMap(r => r.T.map(t => t.name)))].map(esc).join('، ')}</h3>` + recTable(R); }).join('')}`;
  }
  // صفحة المعلمة: زرّا «الأنشطة الصفية» و«الأنشطة اللاصفية» (طلب المستخدمة 2026-10-18)
  const nN = s => String(s).replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  const tPeriods = (D, t) => D.weeks.map(w => ({ w: w.n.replace(/^\d+\.\s*/, ''), url: w.url, files: w.files.concat(...(w.subs || []).map(s => s.files)).filter(f => nN(f.n).includes(nN(t.name))) })).filter(w => w.files.length);
  function teacher(D, i) {
    const t = D.teachers[i]; if (!t) return home(D);
    const n = tPeriods(D, t).reduce((s, w) => s + w.files.length, 0), ev = t.p.reduce((s, p) => s + p.ev.length, 0);
    return nav(['lts', 'المعلمات'], ['lt/' + i, t.name]) + `<div class="card ld-h"><h2>${esc(t.name)}</h2><p>${esc(t.cls)} · مادة ${esc(t.subj)}${t.mates.length ? ' · مع ' + t.mates.map(m => esc(m.name)).join(' و ') : ''}</p></div>
    <div class="ld-hub">${hubBtn('ltc/' + i, 'الأنشطة الصفية', `${ar(t.p.length)} برامج · ${ar(ev)} شاهد`, '#0f6b63')}${hubBtn('ltn/' + i, 'الأنشطة اللاصفية', n ? `${ar(n)} تقارير في الفترات` : 'لا توجد تقارير بعد', '#7a4fb5')}</div>`;
  }
  function teacherNon(D, i) {
    const t = D.teachers[i]; if (!t) return home(D);
    const W = tPeriods(D, t);
    return nav(['lts', 'المعلمات'], ['lt/' + i, t.name], ['ltn/' + i, 'الأنشطة اللاصفية']) + `<div class="card ld-h"><h2>الأنشطة اللاصفية — ${esc(t.name)}</h2><p>تقاريرها في الفترات حسب الأسبوع</p></div>`
      + (W.length ? W.map(w => `<h3 class="ld-sec">${esc(w.w)} ${btn(w.url, 'مجلد الأسبوع', 1)}</h3><div class="ld-f">${w.files.map(f => `<a href="https://drive.google.com/file/d/${esc(f.id)}/view" target="_blank" rel="noopener"><b>${esc(f.n)}</b><span>${new Date(f.t).toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long' })}</span></a>`).join('')}</div>`).join('') : '<p class="ld-empty">لا توجد لها تقارير في الفترات اللاصفية بعد.</p>');
  }
  function teacherClass(D, i) {
    const t = D.teachers[i]; if (!t) return home(D);
    return nav(['lts', 'المعلمات'], ['lt/' + i, t.name], ['ltc/' + i, 'الأنشطة الصفية']) + `<div class="card ld-h"><h2>${esc(t.name)}</h2><p>${esc(t.cls)} · مادة ${esc(t.subj)} · عدد الطالبات ${ar(t.students)} · ${ar(t.p.length)} برامج</p></div>
    <div class="ld-links">${btn(t.url, 'مجلد المعلمة')} ${t.mates.map(m => `<button class="btn sm ghost" data-go="lt/${m.i}">زميلتها: ${esc(m.name)}</button>`).join(' ')} <button class="btn sm ghost" data-go="lc/${D.cls.findIndex(c => c.c === t.cls)}">برامج الفصل</button></div>
    ${t.mates.length ? `<p class="ld-mate">${t.mates.map(m => same(t, m) ? `تنفذ البرامج نفسها مع زميلتها ${esc(m.name)}.` : `برامجها في جدول الإسناد تختلف عن زميلتها ${esc(m.name)}.`).join(' ')}</p>` : '<p class="ld-mate">لا زميلة لها في الفصل.</p>'}${table(t.p, false)}
    ${t.p.map(p => `<h3 class="ld-sec">${esc(p.n)} — الشواهد (${ar(p.ev.length)})</h3>${p.ev.length ? `<div class="ld-f">${p.ev.map(f =>
      `<a href="https://drive.google.com/file/d/${esc(f.id)}/view" target="_blank" rel="noopener"><b>${esc(f.n)}</b><span>${new Date(f.t).toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long' })}</span></a>`).join('')}</div>` : '<p class="ld-empty">لم تُرفع شواهد بعد.</p>'}`).join('')}`;
  }
  function all(D) {
    return nav(['lp', 'كل البرامج']) + `<div class="card ld-h"><h2>كل البرامج (${ar(D.all.length)})</h2><p>مرتبة حسب تاريخ البداية</p></div>` + table(D.all.slice().sort((a, b) => (a.from ? day(a.from.g) : 9e15) - (b.from ? day(b.from.g) : 9e15)), true);
  }
  // ───── «تقارير المعلمات في الأنشطة اللاصفية» (طلب المستخدمة 2026-10-19): تبويبان «التقارير» و«المؤشرات» ─────
  // الخطة: D.nplan (أسابيع إذاعة كل فصل من جدول الإذاعة + برنامجا المكتبة)؛ الشواهد: D.radio[الفصل] (ev، وفي كل ملف by = من رفعته)؛
  // التقارير: حية من الخادم (a=nall برمز الرائدة، مع صورة التقرير المصغرة)، وإلى أن تصل تُستعمل D.nrecs (بلا صور) من الملف المشفر.
  const NR = { recs: null, loading: false, err: '', f: { cls: '', st: '' }, th: {} };
  // مصغرات الشواهد عبر النظام برمز الرائدة (a=thumb، من الأرشيف فقط) — لا تعتمد على تسجيل دخولها في Google؛ ثلاث في وقت واحد وتُحفظ في الذاكرة
  async function nrThumbs() {
    const q = [...document.querySelectorAll('[data-nrth]')];
    await Promise.all([0, 1, 2].map(async () => { while (q.length) { const el = q.shift(), id = el.dataset.nrth;
      try { if (!NR.th[id]) { const j = await api({ a: 'thumb', id }); NR.th[id] = j.b64 || ''; }
        if (el.isConnected) el.outerHTML = NR.th[id] ? `<img alt="" src="data:image/jpeg;base64,${NR.th[id]}">` : '<span>صورة</span>'; }
      catch { if (el.isConnected) el.textContent = 'صورة'; } } }));
  }
  function nrLoad() {
    if (NR.loading || NR.recs) return; NR.loading = true;
    api({ a: 'nall', ...(window.NC_TEST && { test: 1 }) }).then(j => { NR.recs = j.recs || []; NR.err = ''; }).catch(e => { NR.err = e.message; })
      .finally(() => { NR.loading = false; if (/^#lnr/.test(location.hash) && typeof route === 'function') { const y = window.scrollY; route(); window.scrollTo(0, y); } });
  }
  const gDay = s => s ? Date.parse(s + 'T00:00:00Z') : 0;
  const hNum = h => { const [y, m, d] = String(h || '').split('/').map(Number); return (y || 0) * 400 + (m || 0) * 32 + (d || 0); };
  const NS = { rep: ['تقرير صادر', 'ok'], ev: ['شواهد بلا تقرير', 'part'], none: ['لم ترفع الشواهد', 'none'], now: ['جارٍ هذا الأسبوع', 'part'], later: ['لم يحن موعده', 'na'] };
  /** صف لكل معلمة في كل أسبوع من أسابيع فصلها (ولكل نشاط يدوي أصدرته) */
  function nrRows(D) {
    const R = NR.recs || D.nrecs || [], rows = [];
    (D.nplan || []).forEach(c => {
      const W = (D.radio || {})[c.cls] || [];
      c.runs.forEach(r => {
        const fd = W.find(x => x.n === 'الأسبوع ' + String(r.w).padStart(2, '0') + ' — ' + r.topic) || {};
        const state = today > gDay(r.g1) ? 'past' : today >= gDay(r.g0) ? 'now' : 'later';
        c.teachers.forEach(t => rows.push({ c, r, t, state, url: fd.url || '', rec: R.find(x => x.cls === c.cls && x.sid === r.sid && x.teacher === t && x.st !== 'مسودة') || null,
          ev: (fd.ev || []).filter(f => f.by === t) }));
      });
      R.filter(x => x.cls === c.cls && x.sid.startsWith('m|') && x.st !== 'مسودة').forEach(rec => {
        const fd = W.find(x => x.n.startsWith('نشاط يدوي — ' + rec.mname.slice(0, 40))) || {};
        rows.push({ c, r: { topic: rec.mname, days: rec.days, w: rec.w, manual: true, sid: rec.sid }, t: rec.teacher, state: 'past', url: fd.url || '', rec, ev: (fd.ev || []).filter(f => f.by === rec.teacher) });
      });
    });
    rows.forEach(x => { x.s = x.rec ? 'rep' : x.ev.length ? 'ev' : x.state === 'past' ? 'none' : x.state === 'now' ? 'now' : 'later'; x.k = x.c.cls + '|' + (x.r.sid || ''); });
    return rows.sort((a, b) => hNum((a.rec && a.rec.days[0]) || a.r.days[0]) - hNum((b.rec && b.rec.days[0]) || b.r.days[0]) || a.c.cls.localeCompare(b.c.cls, 'ar'));
  }
  const nrSpan = days => !days || !days.length ? '—' : days.length === 1 ? hd(days[0]) : hd(days[0]) + ' – ' + hd(days[days.length - 1]);
  const nrTabs = tab => `<div class="nr-tabs"><button class="${tab ? '' : 'on'}" data-go="lnr">التقارير</button><button class="${tab ? 'on' : ''}" data-go="lnr/m">المؤشرات</button></div>`;
  const nrThumb = f => `<a class="nr-ev" href="https://drive.google.com/file/d/${esc(f.id)}/view" target="_blank" rel="noopener" title="${esc(f.n)}">${/^image\//.test(f.m)
    ? (NR.th[f.id] ? `<img alt="" src="data:image/jpeg;base64,${NR.th[f.id]}">` : `<span data-nrth="${esc(f.id)}">…</span>`) : `<span>${/pdf/.test(f.m) ? 'PDF' : /video/.test(f.m) ? 'فيديو' : 'ملف'}</span>`}</a>`;
  function nrRow(x) {
    const rec = x.rec, p = rec && rec.partner, days = rec ? rec.days : x.r.days;
    return `<div class="nr-r"><div class="nr-who"><b>${esc(x.t)}</b><span class="chip s-${NS[x.s][1]}">${NS[x.s][0]}</span>
        <small>${nrSpan(days)}${rec ? ` · ${ar(rec.dur || 15)} دقيقة · ${rec.students == null ? '—' : ar(rec.students) + ' طالبة'}${rec.dis ? ` · ${ar(rec.dis)} من ذوات الإعاقة` : ''}` : ''}</small>
        ${p && p.n ? `<small>المعلمة المشاركة: ${esc(p.n)} — ${p.took ? '<b class="nr-y">شاركت</b>' : '<b class="nr-n">لم تشارك</b>'}</small>` : ''}
        ${rec && rec.pcount ? `<small>الشراكات (${ar(rec.pcount)}): ${esc(rec.pnames)}</small>` : ''}</div>
      <div class="nr-evs">${x.ev.slice(0, 10).map(nrThumb).join('')}${x.ev.length > 10 ? `<span class="nr-more">+${ar(x.ev.length - 10)}</span>` : ''}${x.ev.length ? '' : '<span class="ld-empty" style="margin:0">لا شواهد</span>'}</div>
      <div class="nr-rep">${rec && rec.pdf ? `<a href="https://drive.google.com/file/d/${esc(rec.pdf.id)}/view" target="_blank" rel="noopener" title="${esc(rec.pdf.name)}">${rec.thumb
        ? `<img alt="التقرير" src="data:image/jpeg;base64,${rec.thumb}">` : '<span class="nr-noth">PDF</span>'}<span>التقرير${rec.ver > 1 ? ` (الإصدار ${ar(rec.ver)})` : ''}</span></a>` : '<span class="ld-empty" style="margin:0">لم يصدر التقرير</span>'}</div></div>`;
  }
  function nrReports(D, rows) {
    const F = NR.f, cls = (D.nplan || []).map(c => c.cls);
    const shown = rows.filter(x => (!F.cls || x.c.cls === F.cls) && (!F.st || x.s === F.st));
    const groups = []; shown.forEach(x => { let g = groups.find(q => q.k === x.k); if (!g) groups.push(g = { k: x.k, x, rows: [] }); g.rows.push(x); });
    return `<div class="nr-f"><select id="nrC"><option value="">كل الفصول</option>${cls.map(c => `<option${F.cls === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>
      <select id="nrS"><option value="">كل الحالات</option>${Object.entries(NS).map(([k, v]) => `<option value="${k}"${F.st === k ? ' selected' : ''}>${v[0]}</option>`).join('')}</select>
      <span class="muted">${ar(groups.length)} أسبوعًا · ${ar(shown.length)} تقريرًا مطلوبًا</span></div>
    ${groups.map(({ x, rows: G }) => { const r = x.r, c = x.c;
      return `<div class="card nr-g"><div class="nr-h"><div><b>${r.manual ? 'نشاط يدوي: ' + esc(r.topic) : `الأسبوع ${WK[r.w] || ar(r.w)} — ${esc(r.topic)}`}</b>
          <span>${esc(c.cls)} · ${nrSpan(r.days)}${r.dn ? ' (' + r.dn.join('، ') + ')' : ''}</span>
          ${r.radio || r.prayer ? `<span>الاصطفاف الصباحي: ${esc(r.radio || '—')} · الصلاة: ${esc(r.prayer || '—')}</span>` : ''}</div>
        ${x.url ? `<a class="btn sm ghost" href="${esc(x.url)}" target="_blank" rel="noopener">رابط الشواهد</a>` : ''}</div>${G.map(nrRow).join('')}</div>`; }).join('') || '<p class="ld-empty">لا نتائج.</p>'}`;
  }
  function nrMetrics(D, rows) {
    const W = rows.filter(x => !x.r.manual), due = W.filter(x => x.state === 'past'), done = due.filter(x => x.s === 'rep'), R = rows.filter(x => x.rec).map(x => x.rec);
    const sum = k => R.reduce((a, r) => a + (Number(r[k]) || 0), 0), withP = R.filter(r => r.partner && r.partner.n), took = withP.filter(r => r.partner.took).length;
    const pct = due.length ? Math.round(done.length / due.length * 100) : null;
    const names = [...new Set(R.filter(r => r.pcount && r.pnames).flatMap(r => r.pnames.split(/[،,]\s*/)).map(s => s.trim()).filter(Boolean))];
    const kpi = [[pct === null ? '—' : ar(pct) + '٪', 'نسبة الإنجاز', `${ar(done.length)} من ${ar(due.length)} تقريرًا مستحقًا`], [ar(R.length), 'تقريرًا صادرًا', (m => m ? 'منها ' + ar(m) + ' لأنشطة يدوية' : 'في أسابيع الإذاعة')(rows.filter(x => x.r.manual && x.rec).length)],
      [ar(due.filter(x => x.s === 'none').length), 'بلا شواهد', 'أسابيع انتهت ولم تُرفع شواهدها'], [ar(sum('students')), 'طالبة مشاركة', 'مجموع التقارير الصادرة'],
      [ar(sum('dis')), 'من ذوات الإعاقة', 'مجموع التقارير الصادرة'], [ar(sum('pcount')), 'شراكة مجتمعية', names.length ? names.slice(0, 3).join('، ') + (names.length > 3 ? '…' : '') : 'لا توجد'],
      [withP.length ? ar(took) + ' / ' + ar(withP.length) : '—', 'مشاركة الزميلات', 'شاركت فعلًا في التنفيذ']];
    // الخطة الزمنية: صف لكل فصل، عمود لكل أسبوع (١–١٩)، والخانة ملونة بحالة معلماته
    const cell = (c, w) => { const r = c.runs.find(q => q.w === w); if (!r) return '<td></td>';
      const X = rows.filter(x => x.c === c && x.r === r), all = X.every(x => x.s === 'rep'), some = X.some(x => x.s === 'rep' || x.s === 'ev');
      const s = X[0].state === 'later' ? 'na' : X[0].state === 'now' ? (all ? 'ok' : 'part') : all ? 'ok' : some ? 'part' : 'none';
      return `<td class="nr-c s-${s}" title="${esc(r.topic)} — ${nrSpan(r.days)} — ${X.map(x => x.t + ': ' + NS[x.s][0]).join('، ')}">${esc(r.topic)}<small>${X.filter(x => x.s === 'rep').length ? ar(X.filter(x => x.s === 'rep').length) + '/' + ar(X.length) : ''}</small></td>`; };
    const curW = (() => { let w = 0; (D.nplan || []).forEach(c => c.runs.forEach(r => { if (today >= gDay(r.g0)) w = Math.max(w, r.w); })); return w; })();
    const byT = {}; due.forEach(x => { (byT[x.t] ||= { t: x.t, cls: x.c.cls, due: 0, rep: 0, miss: [], ev: [] }); const b = byT[x.t]; b.due++;
      if (x.s === 'rep') b.rep++; else if (x.s === 'ev') b.ev.push(x); else b.miss.push(x); });
    const T = Object.values(byT), okT = T.filter(b => b.rep === b.due), missT = T.filter(b => b.miss.length), evT = T.filter(b => b.ev.length);
    const lbl = x => `الأسبوع ${WK[x.r.w] || ar(x.r.w)} (${esc(x.r.topic)})`;
    return `<div class="ld-k">${kpi.map(([n, l, s]) => `<div class="card"><b>${n}</b><span>${l}</span><small class="nr-ks">${esc(s)}</small></div>`).join('')}</div>
    <h3 class="ld-sec">الخطة الزمنية للأنشطة اللاصفية</h3>
    <div class="nr-leg"><span class="nr-c s-ok">صدرت تقاريره</span><span class="nr-c s-part">جزئي / جارٍ</span><span class="nr-c s-none">انتهى بلا شواهد</span><span class="nr-c s-na">لم يحن</span></div>
    <div class="card ld-tw"><table class="ld-t nr-plan"><thead><tr><th>الفصل</th>${Array.from({ length: 19 }, (_, i) => `<th${i + 1 === curW ? ' class="nr-cur"' : ''}>${ar(i + 1)}</th>`).join('')}</tr></thead>
      <tbody>${(D.nplan || []).map(c => `<tr><th>${esc(c.cls)}<small>${c.teachers.map(esc).join(' و')}</small></th>${Array.from({ length: 19 }, (_, i) => cell(c, i + 1)).join('')}</tr>`).join('')}</tbody></table></div>
    <div class="card ld-tw" style="margin-top:12px"><table class="ld-t"><thead><tr><th>الأسبوع</th><th>الفصل</th><th>الموضوع والبرنامجان</th><th>الأيام</th><th>المعلمات</th></tr></thead><tbody>
      ${(D.nplan || []).flatMap(c => c.runs.map(r => ({ c, r }))).sort((a, b) => a.r.w - b.r.w).map(({ c, r }) => `<tr><td>${WK[r.w] || ar(r.w)}</td><td>${esc(c.cls)}</td>
        <td><b>${esc(r.topic)}</b><br><small>${esc(r.radio || '—')} · ${esc(r.prayer || '—')}</small></td><td>${nrSpan(r.days)}</td>
        <td>${rows.filter(x => x.c === c && x.r === r).map(x => `${esc(x.t)} <span class="chip s-${NS[x.s][1]}">${NS[x.s][0]}</span>`).join('<br>')}</td></tr>`).join('')}</tbody></table></div>
    <div class="nr-cols">
      <div class="card nr-l"><h3>المعلمات المنجزات (${ar(okT.length)})</h3>${okT.length ? okT.map(b => `<div><b>${esc(b.t)}</b> <small>${esc(b.cls)} · ${ar(b.rep)} من ${ar(b.due)}</small></div>`).join('') : '<p class="ld-empty">لا توجد بعد.</p>'}</div>
      <div class="card nr-l"><h3>لم يرفعن الشواهد (${ar(missT.length)})</h3>${missT.length ? missT.map(b => `<div><b>${esc(b.t)}</b> <small>${esc(b.cls)} · ${b.miss.map(lbl).join('، ')}</small></div>`).join('') : '<p class="ld-empty">لا توجد — كل الأسابيع المنتهية فيها شواهد.</p>'}</div>
      <div class="card nr-l"><h3>شواهد بلا تقرير (${ar(evT.length)})</h3>${evT.length ? evT.map(b => `<div><b>${esc(b.t)}</b> <small>${esc(b.cls)} · ${b.ev.map(lbl).join('، ')}</small></div>`).join('') : '<p class="ld-empty">لا توجد.</p>'}</div>
    </div>
    ${names.length ? `<div class="card nr-l" style="margin-top:12px"><h3>الشراكات المجتمعية (${ar(names.length)})</h3><div>${names.map(esc).join('، ')}</div></div>` : ''}`;
  }
  function nrPage(D, a) {
    nrCss(); nrLoad(); setTimeout(nrThumbs, 0);
    const rows = nrRows(D), tab = a === 'm';
    return nav(['lnr', 'تقارير المعلمات في الأنشطة اللاصفية']) + `<div class="card ld-h"><h2>تقارير المعلمات في الأنشطة اللاصفية</h2>
      <p>بطاقات تنفيذ الفترات اللاصفية (الاصطفاف الصباحي والصلاة) لكل معلمة في أسابيع إذاعة فصلها${NR.loading ? ' · جارٍ تحديث التقارير…' : NR.err ? ' · تعذّر تحديث التقارير: ' + esc(NR.err) : ''}</p></div>`
      + nrTabs(tab) + (tab ? nrMetrics(D, rows) : nrReports(D, rows));
  }
  document.addEventListener('change', ev => {
    if (ev.target.id !== 'nrC' && ev.target.id !== 'nrS') return;
    NR.f[ev.target.id === 'nrC' ? 'cls' : 'st'] = ev.target.value; if (typeof route === 'function') route();
  });
  function nrCss() {
    if (document.getElementById('nr-css')) return; const s = document.createElement('style'); s.id = 'nr-css';
    s.textContent = `.nr-tabs{display:flex;gap:6px;margin:0 0 12px}.nr-tabs button{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:8px 18px;font-weight:600;cursor:pointer}.nr-tabs button.on{background:var(--brand);border-color:var(--brand);color:var(--brand-ink)}
.nr-f{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}.nr-f select{padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink)}
.nr-g{padding:14px 16px;margin-bottom:12px}.nr-h{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;border-bottom:1px solid var(--line);padding-bottom:10px;margin-bottom:6px}
.nr-h b{font-size:16px}.nr-h span{display:block;color:var(--muted);font-size:13px}
.nr-r{display:grid;grid-template-columns:minmax(180px,1.1fr) 2fr auto;gap:12px;align-items:center;padding:10px 0;border-top:1px dashed var(--line)}.nr-r:first-of-type{border-top:0}
.nr-who b{display:block}.nr-who small{display:block;color:var(--muted);font-size:12.5px;margin-top:3px}.nr-y{color:var(--ok)}.nr-n{color:var(--none)}
.nr-evs{display:flex;flex-wrap:wrap;gap:4px;align-items:center}.nr-ev{width:46px;height:46px;border-radius:7px;overflow:hidden;border:1px solid var(--line);background:var(--soft);display:grid;place-items:center;font-size:10px;color:var(--muted);text-decoration:none}
.nr-ev img{width:100%;height:100%;object-fit:cover}.nr-more{font-size:12px;color:var(--muted)}
.nr-rep a{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:12px;text-decoration:none}.nr-rep img{width:58px;border:1px solid var(--line);border-radius:4px;background:#fff}
.nr-noth{width:58px;height:80px;display:grid;place-items:center;border:1px solid var(--line);border-radius:4px;background:var(--soft)}
@media(max-width:700px){.nr-r{grid-template-columns:1fr auto}.nr-evs{grid-column:1/-1;order:3}}
.nr-ks{display:block;color:var(--muted);font-size:11.5px;margin-top:2px}
.nr-plan{font-size:12px}.nr-plan th small{display:block;font-weight:400;color:var(--muted);font-size:11px}.nr-plan td,.nr-plan th{padding:5px 4px;text-align:center;min-width:44px}.nr-plan th:first-child{text-align:right;min-width:130px}
.nr-c{border-radius:6px;font-size:11px;line-height:1.3}.nr-c small{display:block;font-weight:700}.nr-plan th.nr-cur{background:var(--brand);color:var(--brand-ink);border-radius:6px}
.nr-c.s-ok{background:var(--ok-bg);color:var(--ok)}.nr-c.s-part{background:var(--part-bg);color:var(--part)}.nr-c.s-none{background:var(--none-bg);color:var(--none)}.nr-c.s-na{background:var(--na-bg);color:var(--na)}
.nr-leg{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}.nr-leg .nr-c{padding:3px 10px;font-size:12px}
.nr-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:12px}.nr-l{padding:14px 16px}.nr-l h3{margin:0 0 8px;font-size:15px}.nr-l>div{padding:5px 0;border-top:1px dashed var(--line)}.nr-l small{color:var(--muted)}`;
    document.head.appendChild(s);
  }
  window.LEADER = {
    render(D, v, a) { style(); events(); window.__LD = D; prep(D); const tt = document.getElementById('title'); if (tt) tt.textContent = this.title;
      return v === 'lnr' ? nrPage(D, a) : v === 'lt' ? teacher(D, +a) : v === 'ltc' ? teacherClass(D, +a) : v === 'ltn' ? teacherNon(D, +a) : v === 'ld' ? (a === undefined || a === '' ? domainsPage(D) : domain(D, +a)) : v === 'lg' ? (a === undefined || a === '' ? classHub(D) : grade(D, +a)) : v === 'ln' ? nonClass(D) : v === 'lts' ? teachersPage(D) : v === 'lf' ? foldersPage(D) : v === 'lr' ? reportsPage(D) : v === 'lc' ? klass(D, +a) : v === 'lb' ? (a === undefined || a === '' ? programs(D) : record(D, +a)) : v === 'lm' ? metrics(D) : v === 'lp' ? all(D) : v === 'la' ? alerts(D) : home(D); },
    title: 'صفحة رائد النشاط : منى العمري',
  };
})();
