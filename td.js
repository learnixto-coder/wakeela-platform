/* «لوحتي» — لوحة المعلمة (طلب المستخدمة 2026-10-19): مؤشر إنجازها ومحاوره، موقعها بين كل المعلمات (بلا أسماء)،
   الآن والقادم، ما يحتاج إجراء، وخطة زمنية (غانت) لبرامجها وأنشطتها: مخطط · جارٍ · منتهٍ.
   البيانات من D.td (tools/td.js عبر export.js)؛ الحالة الزمنية تُحسب من تاريخ اليوم في المتصفح. بلا تدقيق الجودة. */
window.TD = (() => {
  const DAY = 864e5, AR = s => String(s).replace(/\d/g, c => '٠١٢٣٤٥٦٧٨٩'[c]), N = x => AR(Math.round(x));
  const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const G = s => s ? new Date(s + 'T00:00:00') : null;
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const HP = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' });
  const HM = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { month: 'long' });
  const hParts = d => { const P = HP.formatToParts(d), g = t => +(P.find(x => x.type === t) || {}).value; return { y: g('year'), m: g('month'), d: g('day') }; };
  const HD = d => { if (!d) return '—'; const h = hParts(d); return AR(h.d) + '‏/' + AR(h.m) + '‏/' + AR(h.y) + 'هـ'; };   // اليوم أقصى اليمين
  const days = n => n === 0 ? 'اليوم' : n === 1 ? 'غدًا' : n === 2 ? 'بعد يومين' : n <= 10 ? 'بعد ' + AR(n) + ' أيام' : 'بعد ' + AR(n) + ' يومًا';
  const ago = n => n === 0 ? 'اليوم' : n === 1 ? 'أمس' : n === 2 ? 'منذ يومين' : n <= 10 ? 'منذ ' + AR(n) + ' أيام' : 'منذ ' + AR(n) + ' يومًا';

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
  const docTxt = x => x.g === 'cn' ? (x.st === 'done' ? 'البطاقة صادرة' : x.st === 'ev' ? 'شواهد بلا بطاقة' : 'لا بطاقة بعد')
    : x.g === 'cp' ? AR(x.files) + ' شاهد' + (x.need ? ' · ' + AR(x.need) + ' حصص' : '') + (x.rep ? ' · بطاقة التنفيذ صادرة' : '')
    : AR(x.files) + ' شاهد' + (x.rep ? ' · يوجد تقرير' : '');

  // ───────── المؤشر والمقارنة ─────────
  const pctBelow = (v, L) => L.length ? Math.round(L.filter(x => x < v).length / L.length * 100) : 0;
  const mean = L => L.length ? L.reduce((s, x) => s + x, 0) / L.length : null;
  function ringSvg(v, cls) {
    const r = 52, c = 2 * Math.PI * r, f = v == null ? 0 : v / 100;
    return `<svg class="td-ring ${cls}" viewBox="0 0 128 128" role="img" aria-label="مؤشر الإنجاز ${v == null ? 'غير متاح' : N(v) + ' من ١٠٠'}">
      <circle cx="64" cy="64" r="${r}" class="bg"/><circle cx="64" cy="64" r="${r}" class="fg" stroke-dasharray="${c * f} ${c}" transform="rotate(-90 64 64)"/>
      <text x="64" y="60" text-anchor="middle" class="v">${v == null ? '—' : N(v)}</text><text x="64" y="84" text-anchor="middle" class="u">من ١٠٠</text></svg>`;
  }
  // شريط التوزيع: نقطة لكل معلمة (بلا أسماء)، متوسط المدرسة، وموقعها
  function strip(me, L, lbl) {
    const av = mean(L), dots = L.map(v => `<i class="td-dot" style="inset-inline-start:${v}%"></i>`).join('');
    return `<div class="td-strip" role="img" aria-label="${E(lbl)}: أنتِ ${N(me)}، متوسط المعلمات ${N(av)}">
      <div class="td-track">${dots}
        <span class="td-avg" style="inset-inline-start:${av}%"><b>المتوسط ${N(av)}</b></span>
        <span class="td-me" style="inset-inline-start:${me}%"><b>أنتِ ${N(me)}</b></span></div>
      <div class="td-scale"><span>٠</span><span>٥٠</span><span>١٠٠</span></div></div>`;
  }
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

  // ───────── الآن والقادم + ما يحتاج إجراء ─────────
  function nowNext(T) {
    const t = today(), X = T.items.map(x => ({ x, s: stOf(x, t) }));
    const run = X.filter(o => o.s.k === 'run').sort((a, b) => (a.s.left ?? 999) - (b.s.left ?? 999));
    const next = X.filter(o => o.s.k === 'plan' && o.s.n != null).sort((a, b) => a.s.n - b.s.n).slice(0, 4);
    const row = (o, tag) => `<button class="td-it" data-go="${E(o.x.go)}"><span class="td-pill p-${o.s.k}">${tag}</span>
      <span class="td-in"><b>${E(AR(o.x.n))}</b><small>${E(GRP[o.x.g])}${o.x.sub ? ' · ' + E(AR(o.x.sub)) : ''}</small>
      <small>${HD(G(o.x.g0))} — ${HD(G(o.x.g1))}</small></span><span class="td-go">←</span></button>`;
    return `<div class="td-col"><h3>الآن <span class="td-n">${N(run.length)}</span></h3>${run.length ? run.map(o => row(o, o.s.left != null ? (o.s.left === 0 ? 'ينتهي اليوم' : 'باقي ' + AR(o.s.left) + (o.s.left <= 10 ? ' أيام' : ' يومًا')) : 'جارٍ')).join('') : '<p class="td-empty">لا يوجد برنامج أو نشاط جارٍ اليوم.</p>'}</div>
      <div class="td-col"><h3>القادم</h3>${next.length ? next.map(o => row(o, days(o.s.n))).join('') : '<p class="td-empty">لا يوجد شيء مخطط بعد.</p>'}</div>`;
  }
  function todo(T) {
    const t = today(), L = [];
    T.items.forEach(x => { const s = stOf(x, t);
      if (s.k === 'miss') L.push({ w: 3, go: x.go, b: x.n, s: x.g === 'cn' ? (x.st === 'ev' ? 'شواهدك مرفوعة — أصدري بطاقة التنفيذ' : 'انتهى أسبوعك — ارفعي الشواهد وأصدري البطاقة') : 'انتهى ' + ago(Math.round((t - G(x.g1)) / DAY)) + ' بلا شواهد — ارفعي صوره', g: GRP[x.g] });
      else if (s.k === 'run' && x.g === 'cp' && !x.files && (t - G(x.g0)) / DAY >= 7) L.push({ w: 2, go: x.go, b: x.n, s: 'جارٍ منذ ' + AR(Math.round((t - G(x.g0)) / DAY)) + ' يومًا ولم تُرفع صور بعد', g: GRP.cp });
      else if (s.k === 'run' && x.g === 'cn') L.push({ w: 2, go: x.go, b: x.n, s: 'أسبوع إذاعتك الآن — وثّقي الإذاعة والصلاة', g: GRP.cn }); });
    const tt = (D.teachers || [])[0];
    if (tt && tt.cells) tt.cells.filter(c => c.s === 'none' || c.s === 'part').forEach(c => L.push({ w: 1, go: 'mine', b: (c.f.group ? c.f.group + ' / ' : '') + c.f.label, s: 'المطلوب ' + AR(c.f.min) + ' · الموجود ' + AR(c.info.count), g: 'سجل الإنجاز' }));
    L.sort((a, b) => b.w - a.w);
    if (!L.length) return '<p class="td-empty ok">لا يوجد ما يحتاج إجراء الآن — أحسنتِ.</p>';
    const top = L.slice(0, 6), more = L.slice(6);
    const row = x => `<button class="td-todo w${x.w}" data-go="${E(x.go)}"><span class="td-in"><b>${E(AR(x.b))}</b><small>${E(x.g)} · ${E(AR(x.s))}</small></span><span class="td-go">←</span></button>`;
    return top.map(row).join('') + (more.length ? `<details class="td-more"><summary>${more.length === 1 ? 'عرض عنصر آخر' : more.length === 2 ? 'عرض عنصرين آخرين' : 'عرض ' + N(more.length) + (more.length <= 10 ? ' عناصر أخرى' : ' عنصرًا آخر')}</summary>${more.map(row).join('')}</details>` : '');
  }

  // ───────── الخطة الزمنية (غانت) ─────────
  const SEM1 = [new Date(2026, 7, 23), new Date(2027, 0, 10)];
  function gantt(T, mode) {
    const t = today(), its = T.items.filter(x => x.g0);
    let [a, b] = mode === 'y' ? [SEM1[0], new Date(Math.max(...its.map(x => +G(x.g1 || x.g0)), +SEM1[1]) + 7 * DAY)] : SEM1;
    const vis = mode === 'y' ? its : its.filter(x => G(x.g0) <= b && G(x.g1 || x.g0) >= a);
    const span = b - a, P = d => Math.max(0, Math.min(100, (d - a) / span * 100));
    // أشهر هجرية (خط عند أول كل شهر) + أسابيع الدراسة للفصل الأول
    const ticks = []; for (let d = new Date(a); d <= b; d = new Date(+d + DAY)) { if (hParts(d).d === 1 && P(d) < 96) ticks.push({ x: P(d), l: HM.format(d) }); }
    const wks = mode === 'y' ? [] : (typeof WEEK_STARTS !== 'undefined' ? WEEK_STARTS : []).map((d, i) => ({ x: P(d), w: P(new Date(+d + 5 * DAY)) - P(d), n: i + 1 })).filter(o => o.x < 100);
    const tx = t >= a && t <= b ? P(t) : null;
    const groups = ['cp', 'cn', 'plan'].map(g => [g, vis.filter(x => x.g === g).sort((p, q) => p.g0 < q.g0 ? -1 : 1)]).filter(([, L]) => L.length);
    const hidden = its.length - vis.length;
    const bar = (x, i) => { const s = stOf(x, t), x0 = P(G(x.g0)), x1 = P(new Date(+G(x.g1 || x.g0) + DAY)), w = Math.max(x1 - x0, 0.9);
      return `<div class="tg-row"><div class="tg-lab"><b>${E(AR(x.n))}</b><small>${E(AR(x.sub || ''))}</small></div>
        <div class="tg-lane">${tx != null ? `<i class="tg-now" style="inset-inline-start:${tx}%"></i>` : ''}
          <button class="tg-bar b-${s.k}" data-go="${E(x.go)}" data-tip="${i}" style="inset-inline-start:${x0}%;width:${w}%" aria-label="${E(AR(x.n))}: ${E(s.l)}، ${HD(G(x.g0))} إلى ${HD(G(x.g1))}">
            ${s.k === 'run' ? `<i class="tg-prog" style="width:${s.p * 100}%"></i>` : ''}<span class="tg-ic">${{ done: '✓', miss: '!', run: '', plan: '' }[s.k]}</span></button></div></div>`; };
    let i = 0; window.TD._tip = [];
    const rows = groups.map(([g, L]) => `<div class="tg-grp"><span>${E(GRP[g])}</span><small>${N(L.length)}</small></div>` + L.map(x => { window.TD._tip.push(x); return bar(x, i++); }).join('')).join('');
    return `<div class="tg-wrap"><div class="tg">
      <div class="tg-row tg-head"><div class="tg-lab"></div><div class="tg-lane">
        ${ticks.map(o => `<span class="tg-m" style="inset-inline-start:${o.x}%">${E(o.l)}</span>`).join('')}
        ${wks.map(o => `<span class="tg-w" style="inset-inline-start:${o.x}%;width:${o.w}%">${AR(o.n)}</span>`).join('')}
        ${tx != null ? `<span class="tg-today" style="inset-inline-start:${tx}%">اليوم</span>` : ''}</div></div>
      <div class="tg-body">${ticks.map(o => `<i class="tg-grid" style="inset-inline-start:calc(var(--lab) + 8px + (100% - var(--lab) - 16px) * ${o.x / 100})"></i>`).join('')}${rows || '<p class="td-empty">لا توجد عناصر في هذه الفترة.</p>'}</div>
    </div></div>${hidden ? `<p class="td-note">${N(hidden)} من برامجك خارج الفصل الأول — اختاري «العام الدراسي» لرؤيتها.</p>` : ''}`;
  }
  const legend = `<div class="tg-leg"><span><i class="b-plan"></i>مخطط</span><span><i class="b-run"></i>جارٍ (الجزء الداكن = ما مضى)</span><span><i class="b-done"></i>منتهٍ · موثّق</span><span><i class="b-miss"></i>منتهٍ · بلا توثيق</span><span><i class="tg-nowk"></i>اليوم</span></div>`;

  // ───────── الصفحة ─────────
  let mode = null;
  function render() {
    css(); const T = D.td, me = T.me, t = today();
    if (mode == null) { try { mode = localStorage.getItem('td-mode') || ''; } catch (e) { mode = ''; } }
    const L = T.peers.map(p => p.o).filter(x => x != null), lv = me.o != null ? LEVEL(me.o) : null, below = me.o != null ? pctBelow(me.o, L) : 0;
    const name = (D.teachers[0] && D.teachers[0].short || '').split(' ')[0];
    const runN = T.items.filter(x => stOf(x, t).k === 'run').length, nextX = T.items.map(x => ({ x, s: stOf(x, t) })).filter(o => o.s.k === 'plan' && o.s.n != null).sort((p, q) => p.s.n - q.s.n)[0];
    return `<div class="td">
      <section class="td-hero">
        <div class="td-hl">${ringSvg(me.o, lv ? 'lv-' + lv[1] : '')}</div>
        <div class="td-hr"><h2>لوحتك يا أ. ${E(name)}</h2>
          ${me.o != null ? strip(me.o, L, 'موقعك بين المعلمات') : ''}
          <div class="td-facts"><span><b>${N(runN)}</b> جارٍ الآن</span>${nextX ? `<span>القادم <b>${E(AR(nextX.x.n))}</b> ${days(nextX.s.n)}</span>` : ''}<span>${N(L.length)} معلمة في المقارنة</span></div></div>
      </section>
      <section class="td-card td-gc"><div class="td-gh"><h3>الخطة الزمنية لبرامجك وأنشطتك</h3>
        <div class="td-seg" role="tablist"><button data-tdm="" class="${mode ? '' : 'on'}" role="tab">الفصل الأول</button><button data-tdm="y" class="${mode ? 'on' : ''}" role="tab">العام الدراسي</button></div></div>
        ${legend}${gantt(T, mode)}<div class="tg-tip" hidden></div></section>
      <div class="td-areas">${ORDER.map(k => areaCard(k, T)).join('')}</div>
      <div class="td-two"><section class="td-card"><div class="td-nn">${nowNext(T)}</div></section>
        <section class="td-card"><h3>ما يحتاج منكِ</h3>${todo(T)}</section></div>
      <details class="td-card td-how"><summary>كيف يُحسب المؤشر؟</summary>
        <ul><li><b>سجل الإنجاز (${N(T.w.rec)}٪):</b> نسبة مجلداتك التي بلغت الحد المطلوب.</li>
        <li><b>الأنشطة الصفية (${N(T.w.cp)}٪):</b> لكل برنامج بدأ: صورك مقارنة بالمتوقع (صورة لكل أسبوع مضى بحد أقصى عدد الحصص) ٨٠٪، وبطاقة التنفيذ بعد انتهائه ٢٠٪.</li>
        <li><b>الأنشطة اللاصفية (${N(T.w.cn)}٪):</b> لكل أسبوع إذاعة انتهى: بطاقة صادرة = ١٠٠، شواهد بلا بطاقة = ٥٠.</li>
        <li><b>برامج الخطة التشغيلية (${N(T.w.plan)}٪):</b> لكل برنامج بدأ: شواهد ٧٠ + تقرير ٣٠.</li>
        <li>المحور الذي لم يبدأ لا يدخل في الحساب، ويُوزَّع وزنه على البقية. لا يدخل تدقيق الجودة في المؤشر.</li>
        <li>المقارنة بدرجات جميع المعلمات دون أسماء، والمعادلة واحدة للجميع. آخر تحديث: ${HD(new Date(T.at))}.</li></ul></details>
    </div>`;
  }
  // تفاعل الغانت: تلميح عند المرور (وعند اللمس: اللمسة الأولى تلميح، الثانية فتح)، وتبديل الفترة
  function wire() {
    const root = document.querySelector('.td'); if (!root || root.dataset.w) return; root.dataset.w = 1;
    root.querySelectorAll('[data-tdm]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.tdm; try { localStorage.setItem('td-mode', mode); } catch (e) { } route(); }));
    const tip = root.querySelector('.tg-tip'), gc = root.querySelector('.td-gc'), t = today(); let armed = null;
    const show = (el) => { const x = TD._tip[+el.dataset.tip], s = stOf(x, t);
      tip.innerHTML = `<b>${E(AR(x.n))}</b><span>${E(GRP[x.g])}${x.sub ? ' · ' + E(AR(x.sub)) : ''}</span><span>${HD(G(x.g0))} — ${HD(G(x.g1))}</span>
        <span class="td-pill p-${s.k}">${E(s.l)}${s.k === 'plan' && s.n != null ? ' · يبدأ ' + days(s.n) : s.k === 'run' && s.left != null ? ' · باقي ' + AR(s.left) + ' يوم' : ''}</span><span>${docTxt(x)}</span>`;
      tip.hidden = false; const r = el.getBoundingClientRect(), g = gc.getBoundingClientRect(), w = tip.offsetWidth;
      tip.style.top = (r.bottom - g.top + 6) + 'px'; tip.style.left = Math.max(8, Math.min(g.width - w - 8, r.left - g.left + r.width / 2 - w / 2)) + 'px'; };
    root.querySelectorAll('.tg-bar').forEach(el => {
      el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(el); });
      el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') tip.hidden = true; });
      el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' && armed !== el) { e.preventDefault(); armed = el; show(el); el.addEventListener('click', ev => { if (armed === el && !el.dataset.ok) { ev.stopImmediatePropagation(); el.dataset.ok = 1; } }, { capture: true, once: true }); } });
    });
    const wrap = root.querySelector('.tg-wrap'), now = root.querySelector('.tg-today');
    if (now && wrap.scrollWidth > wrap.clientWidth) { const a = now.getBoundingClientRect(), b = wrap.getBoundingClientRect(); wrap.scrollLeft += (a.left + a.width / 2) - (b.left + b.width / 2); }
    root.querySelector('.tg-wrap').addEventListener('scroll', () => { tip.hidden = true; armed = null; root.querySelectorAll('.tg-bar[data-ok]').forEach(b => delete b.dataset.ok); });
  }
  function css() {
    if (document.getElementById('td-css')) return;
    const s = document.createElement('style'); s.id = 'td-css'; s.textContent = `
.td{--run:#6b5d82;--run-bg:#e4dff0;--plan:#9aa3ad;--lab:210px;max-width:1040px;margin-inline:auto;display:flex;flex-direction:column;gap:16px}
@media (prefers-color-scheme:dark){.td{--run:#b9addb;--run-bg:#3a3550;--plan:#7d8691}}
.td h3{margin:0 0 10px;font-size:17px}.td-h{margin:6px 0 -4px;font-size:17px}.td-h small{font-weight:400;color:var(--muted);font-size:12.5px;margin-inline-start:8px}
.td-card,.td-hero,.td-area{background:var(--card);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow)}
.td-card{padding:16px 18px;position:relative;min-width:0}
.td-hero{display:flex;gap:22px;align-items:center;padding:20px 22px;background:linear-gradient(135deg,var(--card) 55%,var(--soft))}
.td-hl{display:flex;flex-direction:column;align-items:center;gap:8px;flex:0 0 auto}
.td-hr{flex:1;min-width:0}.td-hr h2{margin:0 0 4px;font-size:22px}.td-hr p{margin:0 0 12px;color:var(--muted)}
.td-ring{width:132px;height:132px}.td-ring .bg{fill:none;stroke:var(--soft);stroke-width:12}.td-ring .fg{fill:none;stroke:var(--brand);stroke-width:12;stroke-linecap:round;transition:stroke-dasharray .8s}
.td-ring.lv-ok .fg{stroke:var(--ok)}.td-ring.lv-part .fg{stroke:var(--part)}.td-ring.lv-none .fg{stroke:var(--none)}
.td-ring .v{font-size:34px;font-weight:800;fill:var(--ink)}.td-ring .u{font-size:12px;fill:var(--muted)}
.td-lv{font-size:13px;font-weight:700;padding:3px 12px;border-radius:99px;background:var(--soft)}
.lv-ok{color:var(--ok)}.td-lv.lv-ok{background:var(--ok-bg)}.lv-part{color:var(--part)}.td-lv.lv-part{background:var(--part-bg)}.lv-none{color:var(--none)}.td-lv.lv-none{background:var(--none-bg)}.lv-go{color:var(--brand)}
.td-strip{margin:26px 0 6px}.td-track{position:relative;height:10px;border-radius:99px;background:linear-gradient(90deg,var(--soft),var(--line))}
[dir=rtl] .td-track{background:linear-gradient(270deg,var(--soft),var(--line))}
.td-dot{position:absolute;top:50%;width:8px;height:8px;margin-inline-start:-4px;margin-top:-4px;border-radius:50%;background:var(--muted);opacity:.45;border:1px solid var(--card)}
.td-avg,.td-me{position:absolute;top:50%;transform:translateY(-50%)}
.td-avg::before{content:"";position:absolute;inset-inline-start:-1px;top:-7px;width:2px;height:24px;background:var(--muted)}
.td-avg b{position:absolute;top:16px;inset-inline-start:0;transform:translateX(50%);white-space:nowrap;font-size:11.5px;color:var(--muted);font-weight:600}
.td-me::before{content:"";position:absolute;width:18px;height:18px;inset-inline-start:-9px;top:-9px;border-radius:50%;background:var(--brand);border:3px solid var(--card);box-shadow:0 0 0 2px var(--brand)}
.td-me b{position:absolute;bottom:14px;inset-inline-start:0;transform:translateX(50%);white-space:nowrap;font-size:12.5px;color:var(--brand);font-weight:800}
.td-scale{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:22px}
.td-facts{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;color:var(--muted);margin-top:4px}.td-facts b{color:var(--ink)}
.td-areas{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.td-area{font:inherit;color:inherit;text-align:start;padding:14px 16px;cursor:pointer;display:flex;flex-direction:column;gap:8px;transition:transform .15s,box-shadow .15s}
.td-area:hover{transform:translateY(-2px)}.td-area:focus-visible,.tg-bar:focus-visible,.td-it:focus-visible,.td-todo:focus-visible{outline:3px solid var(--brand);outline-offset:2px}
.td-ah{display:flex;justify-content:space-between;align-items:baseline;gap:6px;font-weight:700}.td-ah small{color:var(--muted);font-weight:400;font-size:11.5px}
.td-av{display:flex;align-items:baseline;gap:4px}.td-av b{font-size:30px;line-height:1}.td-av span{color:var(--muted);font-size:13px}.td-av em{font-style:normal;font-size:12.5px;font-weight:700;margin-inline-start:auto}
.td-bar{position:relative;height:8px;border-radius:99px;background:var(--soft)}.td-bar i{position:absolute;inset-block:0;inset-inline-start:0;border-radius:99px;background:var(--brand)}
.td-bar s{position:absolute;top:-4px;width:2px;height:16px;background:var(--ink);opacity:.55}
.td-cmp,.td-line{font-size:12.5px;color:var(--muted)}.td-na{color:var(--muted);font-size:13.5px;padding:10px 0}
.td-two{display:grid;grid-template-columns:1.25fr 1fr;gap:12px}.td-nn{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.td-n{font-size:12px;background:var(--soft);border-radius:99px;padding:1px 8px;margin-inline-start:4px}
.td-it,.td-todo{display:flex;align-items:center;gap:10px;width:100%;font:inherit;color:inherit;text-align:start;background:none;border:0;border-top:1px solid var(--line);padding:10px 2px;cursor:pointer}
.td-it:hover,.td-todo:hover{background:var(--soft)}.td-in{display:flex;flex-direction:column;min-width:0;flex:1}.td-in b{font-size:14.5px}.td-in small{color:var(--muted);font-size:12px}
.td-go{color:var(--muted)}.td-todo{border-inline-start:4px solid transparent;padding-inline-start:10px}.td-todo.w3{border-inline-start-color:var(--none)}.td-todo.w2{border-inline-start-color:var(--part)}.td-todo.w1{border-inline-start-color:var(--line)}
.td-more summary{cursor:pointer;color:var(--brand);font-weight:600;padding:8px 2px;font-size:13.5px}
.td-pill{flex:0 0 auto;font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:99px;white-space:nowrap}
.p-run{background:var(--run-bg);color:var(--run)}.p-plan{background:var(--na-bg);color:var(--na)}.p-done{background:var(--ok-bg);color:var(--ok)}.p-miss{background:var(--none-bg);color:var(--none)}
.td-empty{color:var(--muted);font-size:13.5px;margin:6px 0}.td-empty.ok{color:var(--ok);font-weight:600}
.td-gh{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}.td-gh h3{margin:0}
.td-seg{display:inline-flex;background:var(--soft);border-radius:10px;padding:3px}.td-seg button{font:inherit;font-size:13px;border:0;background:none;color:var(--muted);padding:6px 14px;border-radius:8px;cursor:pointer;min-height:34px}
.td-seg button.on{background:var(--card);color:var(--ink);font-weight:700;box-shadow:var(--shadow)}
.tg-leg{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:12px;color:var(--muted);margin:12px 0 8px}.tg-leg span{display:inline-flex;align-items:center;gap:6px}
.tg-leg i{width:22px;height:10px;border-radius:4px;display:inline-block}.tg-leg .tg-nowk{width:2px;height:14px;background:var(--none);border-radius:0}
.tg-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:12px;-webkit-overflow-scrolling:touch}
.tg{min-width:780px;position:relative}
.tg-row{display:grid;grid-template-columns:var(--lab) 1fr;min-height:46px;border-top:1px solid var(--line)}
.tg-head{min-height:52px;border-top:0;background:var(--soft);position:sticky;top:0;z-index:2}
.tg-lab{position:sticky;inset-inline-start:0;z-index:1;background:var(--card);padding:6px 12px;display:flex;flex-direction:column;justify-content:center;border-inline-end:1px solid var(--line);min-width:0}
.tg-head .tg-lab{background:var(--soft)}.tg-lab b{font-size:13px;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tg-lab small{font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tg-lane{position:relative;margin-inline:8px}
.tg-m{position:absolute;top:6px;font-size:11.5px;font-weight:700;color:var(--ink);white-space:nowrap;padding-inline-start:5px;border-inline-start:1px solid var(--muted)}
.tg-w{position:absolute;bottom:4px;font-size:10px;color:var(--muted);text-align:center}
.tg-today{position:absolute;bottom:-1px;transform:translateX(50%);background:var(--none);color:#fff;font-size:10.5px;font-weight:700;padding:1px 6px;border-radius:6px 6px 0 0;z-index:3}
.tg-body{position:relative}.tg-grid{position:absolute;top:0;bottom:0;width:1px;background:var(--line);opacity:.7;pointer-events:none}
.tg-grp{display:flex;align-items:center;gap:8px;padding:6px 12px;background:var(--soft);border-top:1px solid var(--line);font-size:12.5px;font-weight:800;position:sticky;inset-inline-start:0}
.tg-grp small{font-weight:600;color:var(--muted)}
.tg-now{position:absolute;top:0;bottom:0;width:2px;margin-inline-start:-1px;background:var(--none);opacity:.8;z-index:1}
.tg-bar{position:absolute;top:50%;height:20px;margin-top:-10px;min-width:10px;border-radius:5px;border:0;padding:0;cursor:pointer;overflow:hidden;display:flex;align-items:center;justify-content:center;z-index:2}
.tg-bar:hover{filter:brightness(1.08);box-shadow:0 0 0 2px var(--card),0 0 0 4px currentColor}
.b-plan{background:repeating-linear-gradient(135deg,var(--na-bg) 0 5px,var(--card) 5px 9px);box-shadow:inset 0 0 0 1.5px var(--plan);color:var(--plan)}
.b-run{background:var(--run-bg);box-shadow:inset 0 0 0 1.5px var(--run);color:var(--run)}.tg-prog{position:absolute;inset-block:0;inset-inline-start:0;background:var(--run)}
.b-done{background:var(--ok);color:var(--ok)}.b-miss{background:var(--none);color:var(--none)}
.tg-ic{position:relative;color:#fff;font-size:12px;font-weight:900;line-height:1}
.tg-tip{position:absolute;z-index:20;width:260px;background:var(--ink);color:var(--card);border-radius:10px;padding:10px 12px;font-size:12.5px;display:flex;flex-direction:column;gap:3px;box-shadow:0 8px 24px rgba(0,0,0,.25);pointer-events:none}
.tg-tip[hidden]{display:none}.tg-tip b{font-size:13.5px}.tg-tip .td-pill{align-self:flex-start;margin-top:2px}
.td-note{font-size:12.5px;color:var(--muted);margin:8px 2px 0}
.td-how summary{cursor:pointer;font-weight:700}.td-how ul{margin:10px 0 0;padding-inline-start:20px;line-height:1.9;font-size:13.5px;color:var(--muted)}.td-how b{color:var(--ink)}
@media (max-width:900px){.td-areas{grid-template-columns:repeat(2,1fr)}.td-two{grid-template-columns:1fr}}
@media (max-width:560px){.td{--lab:132px}.td-hero{flex-direction:column;text-align:center;padding:18px 16px}.td-facts{justify-content:center}.td-nn{grid-template-columns:1fr}.td-areas{gap:10px}.td-area{padding:12px}.td-av b{font-size:24px}.td-card{padding:14px}}
@media (prefers-reduced-motion:reduce){.td-ring .fg,.td-area{transition:none}}`;
    document.head.appendChild(s);
  }
  return { render: () => { const h = render(); setTimeout(wire, 0); return h; }, _tip: [] };
})();
