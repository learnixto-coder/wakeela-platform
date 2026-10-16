/* «لوحة مؤشرات الجودة» (route #quality) — data from tools/quality.py: quality/lock.json + quality/d.bin, charts by Apache ECharts (quality/echarts.min.js).
   window.mountQuality(host, {code}) renders into a shadow root; colours come from the platform tokens (--bg, --card, --ink, --brand …). */
(() => {
const CSS = `
:host{display:block;--g1:#2e7d4f;--g2:#8cc49b;--g3:#f0b93a;--g4:#d03b3b;--grid:#e9eceb}
@media (prefers-color-scheme:dark){:host{--g1:#4fb07a;--g4:#e5605f;--grid:#33353f}}
*{box-sizing:border-box}
.top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}
.sub{color:var(--muted);font-size:13px}
.seg{display:inline-flex;flex-wrap:wrap;background:var(--soft);border:1px solid var(--line);border-radius:10px;padding:3px;gap:2px}
.seg button{font:inherit;font-size:13px;border:0;background:none;color:var(--muted);padding:6px 14px;border-radius:8px;cursor:pointer}
.seg button.on{background:var(--card);color:var(--ink);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.08)}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:14px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.kpi .l{font-size:13px;color:var(--muted)}
.kpi .v{font-size:30px;font-weight:700;line-height:1.2;margin-top:4px;font-variant-numeric:tabular-nums}
.kpi .v small{font-size:14px;font-weight:500;color:var(--muted)}
.kpi .n{font-size:12px;color:var(--muted);margin-top:2px}
.pill{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:2px 9px;border-radius:99px;background:var(--soft);color:var(--ink);white-space:nowrap}
.dot{width:8px;height:8px;border-radius:50%;display:inline-block}
.grid{display:grid;gap:14px;grid-template-columns:repeat(12,1fr);margin-bottom:14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;min-width:0}
.card h2{margin:0;font-size:16px;font-weight:600}
.card .d{font-size:12.5px;color:var(--muted);margin:2px 0 8px}
.c4{grid-column:span 4}.c5{grid-column:span 5}.c7{grid-column:span 7}.c12{grid-column:span 12}
@media (max-width:980px){.c4,.c5,.c7{grid-column:span 12}}
.ch{width:100%;height:280px;direction:ltr}.ch.tall{height:380px}
table{width:100%;border-collapse:collapse;font-size:13.5px}
th{text-align:right;font-weight:600;color:var(--muted);font-size:12.5px;padding:8px;border-bottom:1px solid var(--line);white-space:nowrap}
th[data-k]{cursor:pointer;user-select:none}th[data-k]:hover{color:var(--ink)}
td{padding:8px;border-bottom:1px solid var(--line);vertical-align:middle}
tr:last-child td{border-bottom:0}
.num{font-variant-numeric:tabular-nums;white-space:nowrap}
.bv{display:flex;align-items:center;gap:8px}.bv .num{min-width:24px}
.bar{flex:1;height:8px;background:var(--soft);border-radius:4px;min-width:60px;overflow:hidden}
.bar i{display:block;height:100%;border-radius:4px}
.tw{overflow-x:auto}
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
.gi{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--soft)}
.gi .im{aspect-ratio:4/3;background:var(--line) center/cover no-repeat}
.gi .t{padding:8px 10px;font-size:12px}
.gi .t b{display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.flags{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.flag{font-size:11px;padding:1px 7px;border-radius:99px;background:color-mix(in srgb,var(--g4) 14%,transparent)}
details{font-size:13px;color:var(--muted)}
summary{cursor:pointer;color:var(--ink);font-weight:600}
.muted{color:var(--muted)}
.empty{color:var(--muted);font-size:13px;padding:30px 0;text-align:center}`;

const HTML = `
<div class="top"><div class="sub" id="gen"></div>
  <div class="seg" id="scope"><button data-v="all" class="on">جميع الشواهد</button><button data-v="plan">برامج الخطة التشغيلية</button><button data-v="teach">سجلات إنجاز المعلمات</button></div></div>
<section class="kpis" id="kpis"></section>
<div class="grid">
  <div class="card c4"><h2>مؤشر جودة الصور</h2><div class="d">متوسط الدرجة من 100 لجميع الصور المرفوعة</div><div id="gauge" class="ch"></div></div>
  <div class="card c4"><h2>توزيع الصور حسب المستوى</h2><div class="d">عدد الصور في كل مستوى جودة</div><div id="donut" class="ch"></div></div>
  <div class="card c4"><h2>أكثر مشكلات التصوير</h2><div class="d">عدد الصور التي ظهرت فيها كل مشكلة</div><div id="issues" class="ch"></div></div>
</div>
<div class="grid" id="planRow">
  <div class="card c7"><h2>خريطة البرامج: جودة المحتوى × جودة الصور</h2><div class="d">كل نقطة برنامج من برامج الفصل الأول؛ الحجم = عدد الشواهد. الأعلى يمينًا = الأفضل</div><div id="scatter" class="ch tall"></div></div>
  <div class="card c5"><h2>تقييم محتوى الشواهد لكل برنامج</h2><div class="d">عدد الملفات القوية والمتوسطة والضعيفة في ارتباطها بأهداف البرنامج</div><div id="content" class="ch tall"></div></div>
</div>
<div class="grid"><div class="card c12"><h2>الرفع الأسبوعي للصور حسب مستوى الجودة</h2><div class="d">الأسبوع الدراسي حسب تاريخ رفع الملف إلى OneDrive</div><div id="weeks" class="ch"></div></div></div>
<div class="grid" id="progTblRow"><div class="card c12"><h2>برامج الخطة التشغيلية (الفصل الأول)</h2><div class="d">اضغطي عنوان أي عمود للترتيب</div><div class="tw"><table id="ptbl"></table></div></div></div>
<div class="grid"><div class="card c12"><h2 id="ownTitle">المعلمات</h2><div class="d">متوسط جودة الصور وعدد الضعيفة</div><div class="tw"><table id="ttbl"></table></div></div></div>
<div class="grid"><div class="card c12"><h2>أضعف الصور المرفوعة</h2><div class="d">أقل الصور درجة مع سبب الضعف — يُفضَّل إعادة تصويرها (النسخ المكررة مستبعدة)</div><div class="gal" id="gal"></div></div></div>
<div class="card"><details><summary>كيف تُحسب الدرجات؟</summary>
  <p><b>درجة الصورة (من 100)</b> = 35٪ الدقة + 45٪ الوضوح + 20٪ الإضاءة والتباين، وتُحسب آليًا من ملف الصورة نفسه.</p>
  <ul><li><b>الدقة:</b> 2 ميجابكسل فأكثر = كاملة، وأقل من 0.5 ميجابكسل أو ضلع قصير أقل من 600 بكسل = «دقة منخفضة».</li>
  <li><b>الوضوح:</b> يقيس حدة الحواف؛ الصورة المهتزة أو غير المركزة تُعلَّم «ضبابية».</li>
  <li><b>الإضاءة:</b> متوسط السطوع المنخفض = «مظلمة»، والتباين الضعيف = «باهتة».</li>
  <li><b>المستويات:</b> ممتازة 85+ · جيدة 70–84 · مقبولة 50–69 · ضعيفة أقل من 50.</li>
  <li><b>جودة المحتوى:</b> من تقييم شواهد البرامج (قوي / متوسط / ضعيف لكل ملف، ودرجة البرنامج وتغطية الإجراءات).</li>
  <li><b>نسخة مكررة:</b> صورة بنفس الاسم والحجم عند المالكة نفسها.</li>
  <li>الفيديو وصور HEIC والملفات غير الصور لا تدخل في درجة الصور.</li></ul></details></div>`;

const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const GR = ['ممتازة', 'جيدة', 'مقبولة', 'ضعيفة'], FL = ['ضبابية', 'دقة منخفضة', 'مظلمة', 'باهتة', 'مكررة'];
const gradeOf = s => s >= 85 ? 'ممتازة' : s >= 70 ? 'جيدة' : s >= 50 ? 'مقبولة' : 'ضعيفة';
const avg = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nameShort = n => { const w = n.replace(/^أ\.\s*/, '').split(' '); return w.length > 2 ? w[0] + ' ' + w[w.length - 1] : w.join(' '); };
let data = null, ecLoad = null;

async function load(code, base) {
  if (data) return data;
  const L = await (await fetch(base + 'lock.json?t=' + Date.now(), { cache: 'no-store' })).json(), l = L.locks[0];
  const pk = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey']);
  const wk = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(l.salt), iterations: L.iter, hash: 'SHA-256' }, pk, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const ck = await crypto.subtle.importKey('raw', await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(l.iv) }, wk, b64(l.ct)), 'AES-GCM', false, ['decrypt']);
  const u = new Uint8Array(await (await fetch(base + 'd.bin?t=' + Date.now(), { cache: 'no-store' })).arrayBuffer());
  const gz = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(0, 12) }, ck, u.subarray(12));
  return data = JSON.parse(await new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
}
const loadEc = base => window.echarts ? Promise.resolve() : ecLoad ??= new Promise((ok, bad) => {
  const s = document.createElement('script'); s.src = base + 'echarts.min.js'; s.onload = ok; s.onerror = () => { ecLoad = null; bad(); }; document.head.append(s); });

window.mountQuality = async (host, { code, base = 'quality/' }) => {
  const [D] = await Promise.all([load(code, base), loadEc(base)]);
  const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${CSS}</style>${HTML}`;
  const $ = s => root.querySelector(s), css = n => getComputedStyle(host).getPropertyValue(n).trim();
  const GC = () => [css('--g1'), css('--g2'), css('--g3'), css('--g4')], gcol = g => GC()[GR.indexOf(g)];
  const pill = s => s == null ? '' : `<span class="pill"><span class="dot" style="background:${gcol(gradeOf(s))}"></span>${gradeOf(s)}</span>`;
  const bar = v => v == null ? '<span class="muted">—</span>' : `<div class="bv"><span class="num">${v}</span><div class="bar"><i style="width:${v}%;background:${gcol(gradeOf(v))}"></i></div></div>`;
  const P1 = D.progs.filter(p => !p.t2), charts = {};
  let scope = 'all', pSort = { k: 'cs', d: 1 };
  const g = new Date(D.generated);
  $('#gen').textContent = 'آخر تحليل: ' + g.toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-latn') + ' · ' + g.toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit' });

  function base0() {
    const t = css('--ink'), m = css('--muted'), gr = css('--grid'), f = getComputedStyle(host).fontFamily;
    return { B: { textStyle: { fontFamily: f, color: t }, tooltip: { backgroundColor: css('--card'), borderColor: css('--line'), textStyle: { color: t, fontFamily: f },
        extraCssText: 'direction:rtl;text-align:right;border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.12)' } },
      ax: { axisLine: { lineStyle: { color: gr } }, axisTick: { show: false }, axisLabel: { color: m, fontFamily: f }, splitLine: { lineStyle: { color: gr } }, nameTextStyle: { color: m } } };
  }
  const chart = (id, opt) => { (charts[id] ??= echarts.init($('#' + id), null, { renderer: 'svg' })).setOption(opt, true); };

  function render() {
    const I = D.imgs.filter(i => scope === 'all' || i.kind === scope), { B, ax } = base0(), ink = css('--ink'), card = css('--card');
    const sc = avg(I.map(i => i.score)), low = I.filter(i => i.grade === 'ضعيفة' || i.grade === 'مقبولة').length, pc = n => I.length ? Math.round(n / I.length * 100) : 0;
    const rated = P1.filter(p => p.cs != null), cov = P1.reduce((a, p) => a + (p.cov || 0), 0), of = P1.reduce((a, p) => a + (p.of || 0), 0);
    const K = [['مؤشر جودة الصور', `${sc ?? '—'}<small> / 100</small>`, pill(sc)],
      ['الصور المحللة', I.length, `${pc(I.filter(i => i.grade === 'ممتازة' || i.grade === 'جيدة').length)}٪ جيدة فأعلى`],
      ['دون المستوى الجيد', low, `${pc(low)}٪ مقبولة أو ضعيفة`],
      ['نسخ مكررة', I.filter(i => i.flags.includes('مكررة')).length, 'صور بنفس الاسم والحجم']];
    if (scope !== 'teach') K.push(['جودة محتوى الشواهد', `${avg(rated.map(p => p.cs)) ?? '—'}<small> / 100</small>`, `متوسط ${rated.length} برنامجًا مُقيَّمًا`],
      ['تغطية إجراءات البرامج', `${of ? Math.round(cov / of * 100) : 0}<small>٪</small>`, `${cov} من ${of} إجراءً عليها شاهد`],
      ['برامج بلا شواهد', P1.filter(p => !p.files).length, `من ${P1.length} برنامجًا (الفصل الأول)`]);
    $('#kpis').innerHTML = K.map(k => `<div class="kpi"><div class="l">${k[0]}</div><div class="v">${k[1]}</div><div class="n">${k[2]}</div></div>`).join('');

    chart('gauge', { ...B, series: [{ type: 'gauge', startAngle: 200, endAngle: -20, min: 0, max: 100, radius: '95%', center: ['50%', '60%'], splitNumber: 20,
      axisLine: { lineStyle: { width: 16, color: [[.5, GC()[3]], [.7, GC()[2]], [.85, GC()[1]], [1, GC()[0]]] } },
      pointer: { length: '58%', width: 5, itemStyle: { color: ink } }, anchor: { show: true, size: 12, itemStyle: { color: ink } },
      axisTick: { show: false }, splitLine: { length: 16, lineStyle: { color: card, width: 3 } },
      axisLabel: { distance: -38, color: css('--muted'), fontSize: 11, formatter: v => [0, 50, 70, 85, 100].includes(v) ? v : '' },
      detail: { offsetCenter: [0, '32%'], fontSize: 34, fontWeight: 700, color: ink, formatter: v => v + '\n{s|' + gradeOf(v) + '}', rich: { s: { fontSize: 14, color: css('--muted'), fontWeight: 500, padding: [6, 0, 0, 0] } } },
      title: { show: false }, data: [{ value: sc || 0 }] }] });

    chart('donut', { ...B, tooltip: { ...B.tooltip, trigger: 'item', formatter: p => `${p.marker} ${p.name}: <b>${p.value}</b> صورة (${p.percent}٪)` },
      legend: { bottom: 0, icon: 'circle', itemWidth: 9, textStyle: { color: ink } },
      series: [{ type: 'pie', radius: ['48%', '74%'], center: ['50%', '44%'], padAngle: 1.5, itemStyle: { borderRadius: 4, borderColor: card, borderWidth: 2 },
        label: { formatter: '{c}', color: ink, fontWeight: 600 }, labelLine: { length: 6, length2: 6 },
        data: GR.map((gr, k) => ({ name: gr, value: I.filter(i => i.grade === gr).length, itemStyle: { color: GC()[k] } })) }] });

    const ord = FL.map(f => [f, I.filter(i => i.flags.includes(f)).length]).sort((a, b) => a[1] - b[1]);
    chart('issues', { ...B, grid: { left: 40, right: 34, top: 6, bottom: 10, containLabel: true }, tooltip: { ...B.tooltip, trigger: 'item', formatter: p => `${p.name}: <b>${p.value}</b> صورة` },
      xAxis: { type: 'value', inverse: true, ...ax, splitLine: { show: false }, axisLabel: { show: false } }, yAxis: { type: 'category', position: 'right', data: ord.map(x => x[0]), ...ax, axisLine: { show: false } },
      series: [{ type: 'bar', barWidth: 16, data: ord.map(x => x[1]), itemStyle: { color: css('--brand'), borderRadius: [4, 0, 0, 4] }, label: { show: true, position: 'left', color: ink, fontWeight: 600 } }] });

    const wk = I.map(i => i.week).filter(w => w >= 1 && w <= 40), W = [];
    for (let w = Math.min(...wk, 1); w <= Math.max(...wk, 1); w++) W.push(w);
    chart('weeks', { ...B, legend: { top: 0, left: 0, icon: 'circle', itemWidth: 9, textStyle: { color: ink } }, grid: { left: 10, right: 10, top: 36, bottom: 6, containLabel: true },
      tooltip: { ...B.tooltip, trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: ps => `الأسبوع ${ps[0].name}<br>` + ps.filter(p => p.value).map(p => `${p.marker} ${p.seriesName}: <b>${p.value}</b>`).join('<br>') },
      xAxis: { type: 'category', data: W, inverse: true, ...ax, splitLine: { show: false }, name: 'الأسبوع', nameLocation: 'start' }, yAxis: { type: 'value', position: 'right', ...ax, minInterval: 1 },
      series: GR.map((gr, k) => ({ name: gr, type: 'bar', stack: 'w', barMaxWidth: 28, itemStyle: { color: GC()[k], borderColor: card, borderWidth: 1 }, data: W.map(w => I.filter(i => i.week === w && i.grade === gr).length) })) });

    const showPlan = scope !== 'teach';
    $('#planRow').style.display = $('#progTblRow').style.display = showPlan ? '' : 'none';
    if (showPlan) {
      const pts = P1.filter(p => p.cs != null && p.iq != null);
      chart('scatter', { ...B, grid: { left: 16, right: 24, top: 20, bottom: 30, containLabel: true },
        tooltip: { ...B.tooltip, trigger: 'item', formatter: p => { const q = p.data.p; return `<b>${esc(q.name)}</b><br>جودة المحتوى: ${q.cs}<br>جودة الصور: ${q.iq}<br>الشواهد: ${q.files} ملف<br><span style="color:${css('--muted')}">${esc(q.teachers.join('، '))}</span>`; } },
        xAxis: { type: 'value', min: 0, max: 100, inverse: true, name: 'جودة المحتوى ←', nameLocation: 'middle', nameGap: 26, ...ax },
        yAxis: { type: 'value', min: 0, max: 100, position: 'right', name: 'جودة الصور', ...ax },
        series: [{ type: 'scatter', data: pts.map(p => ({ value: [p.cs, p.iq], p, symbolSize: 10 + Math.sqrt(p.files) * 3.2,
            itemStyle: { color: gcol(gradeOf(Math.round((p.cs + p.iq) / 2))), opacity: .88, borderColor: card, borderWidth: 2 } })),
          label: { show: true, formatter: p => p.data.p.name, position: 'left', fontSize: 11, color: css('--muted') }, labelLayout: { hideOverlap: true },
          markLine: { silent: true, symbol: 'none', lineStyle: { color: css('--line'), type: 'dashed' }, label: { show: false }, data: [{ xAxis: 60 }, { yAxis: 60 }] },
          markArea: { silent: true, itemStyle: { color: 'transparent' }, label: { color: css('--muted'), fontSize: 11 },
            data: [[{ name: 'متميز', coord: [100, 100] }, { coord: [60, 60] }], [{ name: 'يحتاج دعمًا', coord: [60, 60] }, { coord: [0, 0] }]] } }] });

      const share = p => p.strong / (p.strong + p.mid + p.poor), cp = P1.filter(p => p.strong + p.mid + p.poor > 0).sort((a, b) => share(a) - share(b));
      chart('content', { ...B, legend: { top: 0, left: 0, icon: 'circle', itemWidth: 9, textStyle: { color: ink } }, grid: { left: 10, right: 10, top: 30, bottom: 6, containLabel: true },
        tooltip: { ...B.tooltip, trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: ps => `<b>${esc(ps[0].name)}</b><br>` + ps.map(p => `${p.marker} ${p.seriesName}: <b>${p.value}</b>`).join('<br>') },
        xAxis: { type: 'value', inverse: true, ...ax, minInterval: 1 }, yAxis: { type: 'category', position: 'right', data: cp.map(p => p.name), ...ax, axisLabel: { ...ax.axisLabel, fontSize: 11, width: 120, overflow: 'truncate' } },
        series: [['قوي', 0, 'strong'], ['متوسط', 2, 'mid'], ['ضعيف', 3, 'poor']].map(([n, c, k]) => ({ name: n, type: 'bar', stack: 'c', barWidth: 12, itemStyle: { color: GC()[c], borderColor: card, borderWidth: 1 }, data: cp.map(p => p[k]) })) });
      progTable();
    }
    ownerTable(I); gallery(I);
  }

  function progTable() {
    const C = [['البرنامج', 'name'], ['المعلمات', ''], ['الشواهد', 'files'], ['جودة المحتوى', 'cs'], ['تغطية الإجراءات', 'covp'], ['جودة الصور', 'iq'], ['صور ضعيفة', 'weak'], ['المستوى', '']];
    const rows = P1.map(p => ({ ...p, covp: p.of ? Math.round(p.cov / p.of * 100) : null }));
    rows.sort((a, b) => { const x = a[pSort.k], y = b[pSort.k]; if (x == null) return 1; if (y == null) return -1; return (x > y ? 1 : x < y ? -1 : 0) * pSort.d; });
    $('#ptbl').innerHTML = `<thead><tr>${C.map(([l, k]) => `<th${k ? ` data-k="${k}"` : ''}>${l}${pSort.k === k ? (pSort.d > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('')}</tr></thead><tbody>`
      + rows.map(p => `<tr><td><b>${esc(p.name)}</b></td><td class="muted" style="font-size:12.5px">${esc(p.teachers.join('، '))}</td>
        <td class="num">${p.files || '<span style="color:var(--g4)">لا يوجد</span>'}</td><td>${bar(p.cs)}</td><td>${bar(p.covp)}</td><td>${bar(p.iq)}</td>
        <td class="num">${p.imgs ? p.weak : '—'}</td><td>${p.level ? `<span class="pill">${esc(p.level)}</span>` : '<span class="muted">لم يُقيَّم</span>'}</td></tr>`).join('') + '</tbody>';
    root.querySelectorAll('#ptbl th[data-k]').forEach(th => th.onclick = () => { const k = th.dataset.k; pSort = { k, d: pSort.k === k ? -pSort.d : -1 }; progTable(); });
  }
  function ownerTable(I) {
    const byPlan = scope === 'plan', g = {};
    $('#ownTitle').textContent = byPlan ? 'البرامج حسب جودة الصور' : 'المعلمات حسب جودة الصور';
    I.forEach(i => { if (byPlan || i.kind === 'teach') (g[i.owner] ??= []).push(i); });
    if (scope === 'all')   // a program's images also count for its teachers (matched by first + last name)
      D.progs.forEach(p => p.teachers.forEach(t => { const w = t.split(' '), tn = Object.keys(g).find(n => n.includes(w[0]) && n.includes(w[w.length - 1]));
        if (tn) I.filter(i => i.kind === 'plan' && i.owner === p.name).forEach(i => g[tn].push(i)); }));
    const rows = Object.entries(g).map(([n, a]) => { const f = {}; a.forEach(i => i.flags.forEach(x => f[x] = (f[x] || 0) + 1)); const top = Object.entries(f).sort((x, y) => y[1] - x[1])[0];
      return { n, c: a.length, s: avg(a.map(i => i.score)), w: a.filter(i => i.grade === 'ضعيفة' || i.grade === 'مقبولة').length, top: top ? `${top[0]} (${top[1]})` : '—' }; }).sort((a, b) => a.s - b.s);
    $('#ttbl').innerHTML = `<thead><tr><th>${byPlan ? 'البرنامج' : 'المعلمة'}</th><th>الصور</th><th style="width:34%">متوسط الجودة</th><th>دون الجيد</th><th>أبرز مشكلة</th></tr></thead><tbody>`
      + rows.map(r => `<tr><td><b>${esc(r.n)}</b></td><td class="num">${r.c}</td><td><div class="bv">${bar(r.s).slice(16, -6)}${pill(r.s)}</div></td>
        <td class="num">${r.w ? `<b>${r.w}</b> <span class="muted">(${Math.round(r.w / r.c * 100)}٪)</span>` : '0'}</td><td class="muted">${r.top}</td></tr>`).join('') + '</tbody>';
  }
  function gallery(I) {
    const set = new Set(I), W = D.weak.map(k => D.imgs[k]).filter(i => set.has(i));
    $('#gal').innerHTML = W.length ? W.map(i => `<div class="gi"><div class="im" style="background-image:url('${i.thumb || ''}')"></div><div class="t">
      <b title="${esc(i.name)}">${esc(i.kind === 'plan' ? i.owner : nameShort(i.owner))}</b><span class="muted">${esc(i.kind === 'plan' ? 'شواهد البرنامج' : i.folder)} · ${i.w}×${i.h}</span>
      <div style="margin-top:4px">${pill(i.score).replace('</span>' + gradeOf(i.score), '</span>' + i.score + ' · ' + gradeOf(i.score))}</div>
      <div class="flags">${i.flags.map(f => `<span class="flag">${f}</span>`).join('')}</div></div></div>`).join('') : '<div class="empty">لا توجد صور ضعيفة في هذا النطاق</div>';
  }

  root.querySelectorAll('#scope button').forEach(b => b.onclick = () => { root.querySelectorAll('#scope button').forEach(x => x.classList.toggle('on', x === b)); scope = b.dataset.v; render(); });
  const ro = new ResizeObserver(() => Object.values(charts).forEach(c => c.resize())); ro.observe(host);
  matchMedia('(prefers-color-scheme:dark)').addEventListener('change', () => host.isConnected && render());
  render();
};
})();
