/* «لوحتي» — لوحة المعلمة. 2026-10-26 بطلب المستخدمة (اختارت الشكل «أ» مع المخطط «٩» من الاقتراحات):
   رقم المؤشر وجملة مقارنة، ثم المطلوب منها مرتبًا بالأهم، ثم بطاقات العدّ التنازلي (متأخر · جارٍ · قادم)، والتفاصيل خلف «تفاصيل المؤشر».
   البيانات من D.td (tools/td.js عبر export.js)؛ الحالة الزمنية تُحسب من تاريخ اليوم في المتصفح. بلا تدقيق الجودة. */
window.TD = (() => {
  const DAY = 864e5, AR = s => String(s).replace(/\d/g, c => '٠١٢٣٤٥٦٧٨٩'[c]), N = x => AR(Math.round(x));
  const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const G = s => s ? new Date(s + 'T00:00:00') : null;
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const HP = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' });
  const hParts = d => { const P = HP.formatToParts(d), g = t => +(P.find(x => x.type === t) || {}).value; return { y: g('year'), m: g('month'), d: g('day') }; };
  const HD = d => { if (!d) return '—'; const h = hParts(d); return AR(h.d) + '‏/' + AR(h.m) + '‏/' + AR(h.y) + 'هـ'; };   // اليوم أقصى اليمين
  const ago = n => n === 0 ? 'اليوم' : n === 1 ? 'أمس' : n === 2 ? 'منذ يومين' : n <= 10 ? 'منذ ' + AR(n) + ' أيام' : 'منذ ' + AR(n) + ' يومًا';
  const dl = n => n === 1 ? 'يوم' : n === 2 ? 'يومان' : n <= 10 ? 'أيام' : 'يومًا';

  const GRP = { cp: 'الأنشطة الصفية', cn: 'الأنشطة اللاصفية', plan: 'برامج الخطة التشغيلية' };
  const ORDER = ['rec', 'cp', 'cn', 'plan'];
  const LEVEL = o => o >= 90 ? ['متميزة', 'ok'] : o >= 75 ? ['متقدمة', 'ok'] : o >= 60 ? ['جيدة', 'go'] : o >= 40 ? ['في الطريق', 'part'] : ['تحتاج دعمًا', 'none'];
  // حالة العنصر اليوم: مخطط / جارٍ / منتهٍ (+ موثق أو بلا شواهد)
  const docOf = x => x.g === 'cn' ? x.st === 'done' : x.g === 'cp' ? x.files > 0 : x.files > 0 || x.rep;
  function stOf(x, t) {
    const a = G(x.g0), b = G(x.g1); if (!a) return { k: 'plan', l: 'بلا تاريخ' };
    if (t < a) return { k: 'plan', l: 'مخطط', n: Math.round((a - t) / DAY) };
    if (b && t > b) return docOf(x) ? { k: 'done', l: 'منتهٍ · موثّق' } : { k: 'miss', l: x.g === 'cn' && x.st === 'ev' ? 'منتهٍ · بلا بطاقة' : 'منتهٍ · بلا شواهد' };
    const tot = b ? (b - a) / DAY + 1 : 1, el = (t - a) / DAY + 1;
    return { k: 'run', l: 'جارٍ', p: Math.min(1, el / tot), left: b ? Math.round((b - t) / DAY) : null };
  }

  // ───────── المحاور (داخل «تفاصيل المؤشر») ─────────
  const mean = L => L.length ? L.reduce((s, x) => s + x, 0) / L.length : null;
  function areaCard(k, T) {
    const v = T.me[k], L = T.peers.map(p => p[k]).filter(x => x != null), av = mean(L), it = T.items.filter(x => x.g === k), t = today();
    const lbl = T.label[k];
    let line = '';
    if (k === 'rec') { const tt = (D.teachers || [])[0]; line = tt ? `${N(tt.done)} من ${N(tt.exist)} مجلدات مكتملة` : ''; }
    else if (it.length) { const st = it.map(x => stOf(x, t).k), run = st.filter(s => s === 'run').length, done = st.filter(s => s === 'done').length, miss = st.filter(s => s === 'miss').length;
      line = [run && N(run) + ' جارٍ', done && N(done) + ' موثّق', miss && N(miss) + ' بلا توثيق', st.filter(s => s === 'plan').length && N(st.filter(s => s === 'plan').length) + ' مخطط'].filter(Boolean).join(' · '); }
    const go = { rec: 'mine', cp: 'cp', cn: 'cn', plan: 'plan' }[k];
    const body = v == null ? `<div class="td-na">${it.length ? 'يبدأ لاحقًا — لا يدخل في مؤشرك الآن' : 'لا توجد لكِ عناصر في هذا المحور'}</div>`
      : `<div class="td-av"><b>${N(v)}</b><span>/١٠٠</span><em class="lv-${LEVEL(v)[1]}">${LEVEL(v)[0]}</em></div>
        <div class="td-bar"><i style="width:${v}%"></i>${av != null ? `<s style="inset-inline-start:${av}%" title="متوسط المعلمات"></s>` : ''}</div>
        <div class="td-cmp">${av != null ? (v > av + 0.5 ? `أعلى من متوسط المعلمات (${N(av)}) بـ ${N(v - av)}` : v < av - 0.5 ? `أقل من متوسط المعلمات (${N(av)}) بـ ${N(av - v)}` : `مساوٍ لمتوسط المعلمات (${N(av)})`) : ''}</div>`;
    return `<button class="td-area" data-go="${go}"><div class="td-ah"><span>${E(lbl)}</span><small>الوزن ${N(T.w[k])}٪</small></div>${body}${line ? `<div class="td-line">${line}</div>` : ''}</button>`;
  }

  // ───────── المطلوب منكِ (مرتب بالأهم) ─────────
  function todo(T) {
    const t = today(), L = [];
    T.items.forEach(x => { const s = stOf(x, t);
      if (s.k === 'miss') L.push({ w: 3, go: x.go, b: x.n, s: x.g === 'cn' ? (x.st === 'ev' ? 'شواهدك مرفوعة — أصدري بطاقة التنفيذ' : 'انتهى أسبوعك — ارفعي الشواهد وأصدري البطاقة') : 'انتهى ' + ago(Math.round((t - G(x.g1)) / DAY)) + ' بلا شواهد — ارفعي صوره', g: GRP[x.g] });
      else if (s.k === 'run' && x.g === 'cp' && !x.files && (t - G(x.g0)) / DAY >= 7) L.push({ w: 2, go: x.go, b: x.n, s: 'جارٍ منذ ' + AR(Math.round((t - G(x.g0)) / DAY)) + ' يومًا ولم تُرفع صور بعد', g: GRP.cp });
      else if (s.k === 'run' && x.g === 'cn') L.push({ w: 2, go: x.go, b: x.n, s: 'أسبوع إذاعتك الآن — وثّقي الإذاعة والصلاة', g: GRP.cn }); });
    const tt = (D.teachers || [])[0];
    if (tt && tt.cells) tt.cells.filter(c => c.s === 'none' || c.s === 'part').forEach(c => L.push({ w: 1, go: 'mine', b: (c.f.group ? c.f.group + ' / ' : '') + c.f.label, s: 'المطلوب ' + AR(c.f.min) + ' · الموجود ' + AR(c.info.count), g: 'سجل الإنجاز' }));
    L.sort((a, b) => b.w - a.w);
    if (!L.length) return { n: 0, h: '<p class="td-empty ok">لا يوجد ما يحتاج إجراء الآن — أحسنتِ.</p>' };
    const top = L.slice(0, 5), more = L.slice(5);
    const row = x => `<button class="td-todo w${x.w}" data-go="${E(x.go)}"><i class="td-dt"></i><span class="td-in"><b>${E(AR(x.b))}</b><small>${E(x.g)} · ${E(AR(x.s))}</small></span><span class="td-go">←</span></button>`;
    return { n: L.length, h: top.map(row).join('') + (more.length ? `<details class="td-more"><summary>${more.length === 1 ? 'عرض عنصر آخر' : more.length === 2 ? 'عرض عنصرين آخرين' : 'عرض ' + N(more.length) + (more.length <= 10 ? ' عناصر أخرى' : ' عنصرًا آخر')}</summary>${more.map(row).join('')}</details>` : '') };
  }

  // ───────── مواعيدك: بطاقات العدّ التنازلي ─────────
  // الترتيب: المتأخر (الأقدم أولًا) ← الجاري (الأقرب انتهاءً) ← القادم (الأقرب بدءًا)؛ المنتهي الموثّق في بطاقة واحدة أخيرة
  function countdown(T) {
    const t = today(), X = T.items.map(x => ({ x, s: stOf(x, t) }));
    const late = X.filter(o => o.s.k === 'miss').map(o => ({ ...o, n: Math.round((t - G(o.x.g1)) / DAY) })).sort((a, b) => b.n - a.n);
    const run = X.filter(o => o.s.k === 'run').sort((a, b) => (a.s.left ?? 999) - (b.s.left ?? 999));
    const next = X.filter(o => o.s.k === 'plan' && o.s.n != null).sort((a, b) => a.s.n - b.s.n);
    const done = X.filter(o => o.s.k === 'done');
    const what = x => x.g === 'cp' ? 'ارفعي الصور' : x.g === 'cn' ? (x.st === 'ev' ? 'أصدري بطاقة التنفيذ' : 'ارفعي الشواهد وأصدري البطاقة') : 'ارفعي الشواهد';
    const runTxt = x => x.g === 'cp' ? (x.files ? AR(x.files) + ' صور مرفوعة' : 'لا صور بعد') : x.g === 'cn' ? 'وثّقي الإذاعة والصلاة' : (x.files ? AR(x.files) + ' شاهد' : 'لا شواهد بعد');
    const card = (cls, top, n, unit, x, sub) => `<button class="cd-c ${cls}" data-go="${E(x.go)}"><span class="cd-k"><span class="cd-u">${top}</span>
      <span class="cd-n">${n}</span><span class="cd-u">${unit}</span></span><span class="cd-t"><b>${E(AR(x.n))}</b><small>${E(GRP[x.g])}</small>${sub ? `<small class="cd-s">${E(sub)}</small>` : ''}</span></button>`;
    const C = [
      ...late.map(o => card('late', 'متأخر منذ', N(o.n), dl(o.n), o.x, what(o.x))),
      ...run.map(o => o.s.left == null ? card('hot', 'جارٍ الآن', '•', '', o.x, runTxt(o.x))
        : o.s.left === 0 ? card('hot', 'ينتهي', 'اليوم', '', o.x, runTxt(o.x)) : card('hot', 'باقٍ على نهايته', N(o.s.left), dl(o.s.left), o.x, runTxt(o.x))),
      ...next.map(o => card('', 'يبدأ بعد', N(o.s.n), dl(o.s.n), o.x, HD(G(o.x.g0)))),
    ];
    if (done.length) C.push(`<div class="cd-c ok"><span class="cd-k"><span class="cd-u">منتهٍ وموثّق</span><span class="cd-n">✓ ${N(done.length)}</span></span>
      <span class="cd-t"><small>${done.map(o => E(AR(o.x.n))).join('<br>')}</small></span></div>`);
    return C.length ? `<div class="cd" aria-label="مواعيدك">${C.join('')}</div>` : '<p class="td-empty">لا توجد لكِ برامج أو أنشطة بعد.</p>';
  }

  // ───────── الصفحة ─────────
  function render() {
    css(); const T = D.td, me = T.me;
    const L = T.peers.map(p => p.o).filter(x => x != null), av = mean(L), lv = me.o != null ? LEVEL(me.o) : null;
    const name = (D.teachers[0] && D.teachers[0].short || '').split(' ')[0];
    const cmp = me.o == null || av == null ? '' : me.o > av + 0.5 ? `أعلى من متوسط المعلمات (${N(av)}) بـ ${N(me.o - av)}` : me.o < av - 0.5 ? `أقل من متوسط المعلمات (${N(av)}) بـ ${N(av - me.o)}` : `مساوٍ لمتوسط المعلمات (${N(av)})`;
    const td = todo(T);
    return `<div class="td">
      <section class="td-card td-hero"><h2>أهلًا أ. ${E(name)}</h2>
        ${me.o != null ? `<div class="td-score"><span class="td-big">${N(me.o)}</span><span class="td-of">من ١٠٠</span>
          <div class="td-sc"><span class="td-lv lv-${lv[1]}">${lv[0]}</span><span class="td-cmpt">${cmp}</span></div></div>`
        : '<p class="td-empty">يظهر مؤشرك عند بدء أول برنامج أو نشاط لكِ.</p>'}</section>
      <section class="td-card"><h3>المطلوب منكِ${td.n ? ` <span class="td-n">${N(td.n)}</span>` : ''}</h3>${td.h}</section>
      <section class="td-card"><h3>مواعيدك</h3>${countdown(T)}</section>
      <details class="td-card td-how"><summary>تفاصيل المؤشر</summary>
        <div class="td-areas">${ORDER.map(k => areaCard(k, T)).join('')}</div>
        <ul><li><b>سجل الإنجاز (${N(T.w.rec)}٪):</b> نسبة مجلداتك التي بلغت الحد المطلوب.</li>
        <li><b>الأنشطة الصفية (${N(T.w.cp)}٪):</b> لكل برنامج بدأ: صورك مقارنة بالمتوقع (صورة لكل أسبوع مضى بحد أقصى عدد الحصص) ٨٠٪، وبطاقة التنفيذ بعد انتهائه ٢٠٪.</li>
        <li><b>الأنشطة اللاصفية (${N(T.w.cn)}٪):</b> لكل أسبوع إذاعة انتهى: بطاقة صادرة = ١٠٠، شواهد بلا بطاقة = ٥٠.</li>
        <li><b>برامج الخطة التشغيلية (${N(T.w.plan)}٪):</b> لكل برنامج بدأ: شواهد ٧٠ + تقرير ٣٠.</li>
        <li>المحور الذي لم يبدأ لا يدخل في الحساب، ويُوزَّع وزنه على البقية. لا يدخل تدقيق الجودة في المؤشر.</li>
        <li>المقارنة بدرجات جميع المعلمات (${N(L.length)}) دون أسماء، والمعادلة واحدة للجميع. آخر تحديث: ${HD(new Date(T.at))}.</li></ul></details>
    </div>`;
  }
  function css() {
    if (document.getElementById('td-css')) return;
    const s = document.createElement('style'); s.id = 'td-css'; s.textContent = `
.td{--run:#6b5d82;--run-bg:#e4dff0;--late:#d39b14;max-width:860px;margin-inline:auto;display:flex;flex-direction:column;gap:14px}
@media (prefers-color-scheme:dark){.td{--run:#b9addb;--run-bg:#3a3550}}
.td h3{margin:0 0 8px;font-size:17px;display:flex;align-items:center;gap:6px}
.td-card,.td-area{background:var(--card);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow)}
.td-card{padding:16px 18px;position:relative;min-width:0}
.td-hero h2{margin:0 0 10px;font-size:20px}
.td-score{display:flex;align-items:center;gap:6px 14px;flex-wrap:wrap}
.td-big{font-size:52px;font-weight:900;line-height:1;font-variant-numeric:tabular-nums}.td-of{color:var(--muted);font-size:13px;align-self:flex-end;margin-bottom:6px}
.td-sc{display:flex;flex-direction:column;gap:6px;margin-inline-start:6px}
.td-lv{align-self:flex-start;font-size:13px;font-weight:800;padding:4px 12px;border-radius:10px;background:var(--soft)}
.td-cmpt{color:var(--muted);font-size:13.5px}
.lv-ok{color:var(--ok)}.td-lv.lv-ok{background:var(--ok-bg)}.lv-part{color:var(--part)}.td-lv.lv-part{background:var(--part-bg)}.lv-none{color:var(--none)}.td-lv.lv-none{background:var(--none-bg)}.lv-go{color:var(--brand)}
.td-n{font-size:12px;background:var(--soft);border-radius:99px;padding:1px 8px}
.td-todo{display:flex;align-items:center;gap:12px;width:100%;font:inherit;color:inherit;text-align:start;background:none;border:0;border-top:1px solid var(--line);padding:11px 4px;cursor:pointer}
.td-todo:hover{background:var(--soft)}.td-in{display:flex;flex-direction:column;min-width:0;flex:1}.td-in b{font-size:14.5px}.td-in small{color:var(--muted);font-size:12.5px}
.td-dt{flex:0 0 auto;width:11px;height:11px;border-radius:50%;background:var(--line)}.td-todo.w3 .td-dt{background:var(--none)}.td-todo.w2 .td-dt{background:var(--late)}
.td-go{color:var(--muted)}
.td-more summary{cursor:pointer;color:var(--brand);font-weight:600;padding:8px 2px;font-size:13.5px}
.td-empty{color:var(--muted);font-size:13.5px;margin:6px 0}.td-empty.ok{color:var(--ok);font-weight:600}
/* مواعيدك تحت بعضها بلا شريط تمرير (المستخدمة 2026-10-27): الرقم يمينًا والتفاصيل بجانبه */
.cd{display:flex;flex-direction:column;gap:8px}
.cd-c{width:100%;font:inherit;color:inherit;text-align:start;border:0;border-radius:14px;padding:12px 14px;background:var(--soft);display:grid;grid-template-columns:104px 1fr;gap:14px;align-items:center;cursor:pointer}
.cd-k{display:flex;flex-direction:column;align-items:center;text-align:center;border-inline-end:1px solid var(--line);padding-inline-end:12px}.cd-t{display:flex;flex-direction:column;gap:2px;min-width:0}
.cd-c:hover{filter:brightness(.97)}
.cd-n{font-size:40px;font-weight:900;line-height:1.05;font-variant-numeric:tabular-nums}.cd-u{font-size:12px;color:var(--muted)}
.cd-c b{font-size:15px;line-height:1.4}.cd-c small{font-size:12px;color:var(--muted);line-height:1.6}.cd-c .cd-s{color:var(--ink);font-weight:600}
.cd-c.late{background:var(--none-bg)}.cd-c.late .cd-n,.cd-c.late .cd-s{color:var(--none)}
.cd-c.hot{background:var(--run-bg)}.cd-c.hot .cd-n{color:var(--run)}
.cd-c.ok{background:var(--ok-bg);cursor:default}.cd-c.ok .cd-n{color:var(--ok);font-size:30px}
.td-todo:focus-visible,.cd-c:focus-visible,.td-area:focus-visible,.cd:focus-visible{outline:3px solid var(--brand);outline-offset:2px}
.td-how summary{cursor:pointer;font-weight:700;color:var(--brand)}
.td-how ul{margin:12px 0 0;padding-inline-start:20px;line-height:1.9;font-size:13.5px;color:var(--muted)}.td-how b{color:var(--ink)}
.td-areas{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:12px}
.td-area{font:inherit;color:inherit;text-align:start;padding:12px 14px;cursor:pointer;display:flex;flex-direction:column;gap:7px;box-shadow:none}
.td-ah{display:flex;justify-content:space-between;align-items:baseline;gap:6px;font-weight:700}.td-ah small{color:var(--muted);font-weight:400;font-size:11.5px}
.td-av{display:flex;align-items:baseline;gap:4px}.td-av b{font-size:26px;line-height:1}.td-av span{color:var(--muted);font-size:13px}.td-av em{font-style:normal;font-size:12.5px;font-weight:700;margin-inline-start:auto}
.td-bar{position:relative;height:8px;border-radius:99px;background:var(--soft)}.td-bar i{position:absolute;inset-block:0;inset-inline-start:0;border-radius:99px;background:var(--brand)}
.td-bar s{position:absolute;top:-4px;width:2px;height:16px;background:var(--ink);opacity:.55}
.td-cmp,.td-line{font-size:12.5px;color:var(--muted)}.td-na{color:var(--muted);font-size:13.5px;padding:8px 0}
@media (max-width:560px){.td-card{padding:14px}.td-big{font-size:44px}.td-areas{grid-template-columns:1fr}.cd-c{grid-template-columns:84px 1fr;gap:10px}.cd-n{font-size:32px}}`;
    document.head.appendChild(s);
  }
  return { render };
})();
