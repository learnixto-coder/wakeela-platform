// «المبادرات» (2026-11-12) لحساب سالمة العماري — اطلاع وطباعة. البيانات D.ini من tools/ini.js (export.js).
// #ini            -> زرّا العامين
// #ini/1448       -> ملخص العام + أسماء المعلمات + «تنزيل تقرير العام PDF»
// #ini/1448-<i>   -> مبادرات المعلمة i وملفاتها (معاينة) + طباعة / تنزيل PDF لكل مبادرة أو لكل مبادراتها
// المعاينات من site/prev (loadPrev / prevPage في index.html) بمفتاح «المعلمة|المبادرات|المسار». الطباعة: نافذة الطباعة → «حفظ PDF».
// يعتمد على: D، esc، nf، go، loadPrev، prevPage.
(function () {
  'use strict';
  document.head.insertAdjacentHTML('beforeend', `<style id="ini-css">
.in{display:grid;gap:14px;max-width:980px;margin:0 auto}
.in-yrs{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.in-yr{border:0;border-radius:20px;padding:26px 20px;cursor:pointer;font:inherit;text-align:right;color:#fff;display:grid;gap:6px;background:linear-gradient(135deg,var(--brand-2),var(--brand));box-shadow:var(--shadow)}
.in-yr.o{background:var(--card);color:var(--brand-2);border:1px solid var(--line)}
.in-yr b{font-size:1.9rem;line-height:1.2}.in-yr span{opacity:.92;font-size:.95rem}
.in-yr:focus-visible{outline:3px solid var(--accent,#fca61f);outline-offset:3px}
.in-top{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}
.in-top h2{margin:0;font-size:1.3rem}
.in-seg{display:flex;gap:8px;flex-wrap:wrap}
.in-seg button{font:inherit;border:1px solid var(--line);background:var(--card,#fff);border-radius:20px;padding:5px 16px;cursor:pointer}
.in-seg button.on{background:var(--brand-2);border-color:var(--brand-2);color:#fff}
.in-k{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.in-k div{background:var(--card,#fff);border:1px solid var(--line);border-radius:14px;padding:12px;text-align:center}
.in-k b{display:block;font-size:1.6rem;color:var(--brand-2)}.in-k span{font-size:.85rem;color:var(--mut,#666)}
.in-t{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.in-tb{display:flex;align-items:center;gap:10px;border:1px solid var(--line);background:var(--card,#fff);border-radius:14px;padding:12px 14px;cursor:pointer;font:inherit;text-align:right}
.in-tb .nm{flex:1;min-width:0;font-weight:600}.in-tb .c{flex:none;min-width:32px;height:32px;border-radius:10px;background:var(--soft);color:var(--brand-2);display:grid;place-items:center;font-weight:700}
.in-tb.z{opacity:.6}.in-tb.z .c{background:#f3e3dc;color:#b4552d}
.in-it{background:var(--card,#fff);border:1px solid var(--line);border-radius:16px;padding:14px 16px;display:grid;gap:10px}
.in-it h3{margin:0;font-size:1.08rem;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.in-sh{font-size:.82rem;color:var(--accent,#c97d0a);font-weight:600}
.in-chip{font-size:.78rem;border-radius:10px;padding:1px 9px;background:var(--soft);color:var(--brand-2);font-weight:600}
.in-fs{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px}
.in-f{border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#f6f8f8;cursor:pointer;font:inherit;padding:0;display:grid;text-align:right}
.in-f .im{aspect-ratio:3/4;display:grid;place-items:center;color:#8aa;font-size:.8rem;overflow:hidden;background:#eef3f2}
.in-f .im img{width:100%;height:100%;object-fit:cover;object-position:top}
.in-f .cap{font-size:.72rem;padding:4px 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;direction:rtl}
.in-acts{display:flex;gap:8px;flex-wrap:wrap}
.in-b{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 16px;border-radius:12px;border:0;background:var(--brand-2);color:#fff;font:inherit;font-weight:600;cursor:pointer}
.in-b.gh{background:var(--soft);color:var(--brand-2)}
.in-b:disabled{opacity:.6;cursor:default}
.in-note{font-size:.85rem;color:var(--mut,#666);margin:0}
.in-lb{position:fixed;inset:0;background:rgba(10,20,20,.75);z-index:60;overflow:auto;padding:16px}
.in-lb .bx{max-width:900px;margin:0 auto;background:#fff;border-radius:14px;padding:12px;display:grid;gap:10px}
.in-lb .bx img{width:100%;border:1px solid #ddd;border-radius:6px}
.in-tw{overflow-x:auto;background:var(--card);border:1px solid var(--line);border-radius:16px}
.in-tbl{width:100%;border-collapse:collapse;font-size:.92rem;min-width:640px}
.in-tbl th{background:var(--soft);color:var(--ink);text-align:right;padding:10px 12px;font-weight:700;white-space:nowrap;border-bottom:1px solid var(--line)}
.in-tbl td{padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}
.in-tbl tr.f td{border-top:2px solid var(--line)}
.in-tbl tr:hover td:not(.tn){background:var(--soft)}
.in-tbl td.tn{font-weight:700;white-space:nowrap}
.in-tbl .nw{white-space:nowrap}
.in-tbl .ms{display:grid;gap:4px}
.in-h3{margin:6px 0 0;font-size:1.05rem;color:var(--brand-2)}
.in-tbl .lnk{border:0;background:none;padding:0;font:inherit;font-weight:700;color:var(--brand-2);cursor:pointer;text-align:right}
.in-tbl .lnk:hover{text-decoration:underline}
.in-tbl .num{text-align:center;width:70px}
.in-tbl .z td{color:var(--muted)}
.in-tbl .na{font-size:.75rem;color:var(--muted);display:block}
.in-q{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.in-q input{flex:1 1 220px;min-height:40px;border:1px solid var(--line);border-radius:12px;padding:0 12px;font:inherit;background:var(--card);color:var(--ink)}
#iniPrint{display:none}
.in-paper{background:#fff;color:#000;border:1px solid var(--line);border-radius:6px;box-shadow:var(--shadow);padding:14mm 12mm;max-width:210mm;margin:0 auto;overflow-x:auto}
.idoc{font:13px/1.7 Tahoma,Arial,sans-serif;direction:rtl;color:#000}
.idoc .hd{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #0f7c74;padding-bottom:8px;margin-bottom:12px}
.idoc .hd .r{font-weight:700;line-height:1.8;font-size:12px}.idoc .hd img{height:2cm}
.idoc h1{text-align:center;font-size:19px;margin:10px 0 2px;color:#0f7c74}
.idoc .sb{text-align:center;color:#444;margin:0 0 12px}
.idoc .kp{display:flex;gap:10px;margin-bottom:6px}.idoc .kp div{flex:1;border:1px solid #9bb;text-align:center;padding:6px;border-radius:4px}.idoc .kp b{display:block;font-size:20px;color:#0f7c74}
.idoc .bar{background:#0f7c74;color:#fff;font-weight:700;padding:5px 12px;margin:16px 0 0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.idoc table{width:100%;border-collapse:collapse;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.idoc th{background:#e2f2f0;border:1px solid #9bb;padding:6px 8px;text-align:right;white-space:nowrap}
.idoc td{border:1px solid #9bb;padding:6px 8px;vertical-align:middle}
.idoc tbody tr:nth-child(even) td{background:#f6fbfa}
.idoc td.c,.idoc th.c{text-align:center;width:34px}
.idoc .nw{white-space:nowrap}.idoc td.ms div{white-space:nowrap}
.idoc tr{break-inside:avoid}
.idoc .zz{margin:6px 0 0;line-height:1.9}
.idoc .sig{display:flex;justify-content:space-between;margin-top:36px;text-align:center;break-inside:avoid}.idoc .sig div{width:30%}
@media (max-width:600px){.in-yrs{grid-template-columns:1fr}.in-k{grid-template-columns:1fr 1fr}}
@media print{
  body.ini-printing>*:not(#iniPrint){display:none!important}
  body.ini-printing{background:#fff!important}
  body.ini-printing #iniPrint{display:block;color:#000;font:12.5px/1.6 Tahoma,Arial,sans-serif;direction:rtl}
  #iniPrint .pg{break-after:page}#iniPrint .pg:last-child{break-after:auto}
  #iniPrint img.pv{display:block;max-width:100%;max-height:265mm;margin:0 auto}
  #iniPrint .hd{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #0f7c74;padding-bottom:8px;margin-bottom:12px}
  #iniPrint .hd .r{font-weight:700;line-height:1.8;font-size:12px}
  #iniPrint .hd img{height:2cm}
  #iniPrint h1{text-align:center;font-size:19px;margin:10px 0 4px}
  #iniPrint .sb{text-align:center;color:#444;margin:0 0 12px}
  #iniPrint .bar{background:#0f7c74;color:#fff;font-weight:700;padding:4px 12px;margin:14px 0 8px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  #iniPrint table{width:100%;border-collapse:collapse;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  #iniPrint th{background:#e2f2f0;border:1px solid #9bb;padding:5px;text-align:right}
  #iniPrint td{border:1px solid #9bb;padding:5px;vertical-align:top}
  #iniPrint tr{break-inside:avoid}
  #iniPrint td.nw,#iniPrint th.nw{white-space:nowrap}
  #iniPrint td.ms div{white-space:nowrap}
  #iniPrint .kp{display:flex;gap:10px}#iniPrint .kp div{flex:1;border:1px solid #9bb;text-align:center;padding:6px}#iniPrint .kp b{display:block;font-size:20px;color:#0f7c74}
  #iniPrint .sig{display:flex;justify-content:space-between;margin-top:36px;text-align:center}#iniPrint .sig div{width:30%}
  #iniPrint .ttl{font-weight:700;font-size:15px;margin:0 0 6px;text-align:center}
}
</style>`);

  const I = () => D.ini, FOLD = () => I().folder;
  const YEARS = ['1448', '1447'];
  const AR = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  // التاريخ يُقرأ من اليمين: اليوم ثم الشهر ثم السنة — علامة RLM (‏) قبل كل «/» حتى لا يُعرض اليوم يسارًا
  const dmy = (d, m, y) => [d, m, y].map(AR).join('‏/') + 'هـ';
  // تاريخ المبادرة = أقدم تاريخ رفع لملفاتها (d: YYYY-MM-DD من export.js)، بالهجري d/m/y
  const hij = iso => { try { const p = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(new Date(iso + 'T12:00:00'));
    const g = t => (p.find(x => x.type === t) || {}).value; return dmy(g('day'), g('month'), parseInt(g('year'), 10)); } catch { return '—'; } };
  const itDate = it => { const d = it.files.map(f => f.d).filter(Boolean).sort()[0]; return d ? hij(d) : '—'; };
  const hijriToday = () => { try { const p = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(new Date());
    const g = t => (p.find(x => x.type === t) || {}).value; return dmy(g('day'), g('month'), parseInt(g('year'), 10)); } catch { return ''; } };
  const yOf = it => it.y || '1448';   // العام غير المذكور = العام الحالي (مرفوع في سجلات ١٤٤٨هـ)
  const itemsOf = (t, y) => t.items.filter(it => yOf(it) === y);
  const gKey = it => it.g || it.n;
  const partners = (y, t, it) => I().teachers.filter(o => o !== t && itemsOf(o, y).some(x => gKey(x) === gKey(it))).map(o => short(o.name));
  const short = n => { const p = n.replace(/^أ\.\s*/, '').split(/\s+/).filter(Boolean); return p[0] + (p.length > 1 ? ' ' + p[p.length - 1] : ''); };
  const pkey = (t, f) => t.name + '|' + FOLD() + '|' + f.n;
  const isVid = f => /^(mp4|mov|m4v|avi|3gp|wmv|mkv)$/i.test(f.x || '');
  const fname = n => n.split(' / ').pop().replace(/\p{Cf}/gu, '');
  const stats = y => { const T = I().teachers, list = T.flatMap(t => itemsOf(t, y).map(it => ({ t, it })));
    return { n: new Set(list.map(r => gKey(r.it) + (r.it.g ? '' : '|' + r.t.name))).size, teachers: T.filter(t => itemsOf(t, y).length).length, all: T.length,
      shared: new Set(list.filter(r => partners(y, r.t, r.it).length).map(r => gKey(r.it))).size, list }; };

  // 2026-11-12: جدولان — المبادرات الفردية (لكل معلمة)، والمشتركة (مرة واحدة بأسماء المعلمات)
  const solo = y => I().teachers.flatMap((t, i) => itemsOf(t, y).filter(it => !partners(y, t, it).length).map(it => ({ t, i, it })));
  const groups = y => { const M = new Map();
    I().teachers.forEach((t, i) => itemsOf(t, y).forEach(it => { if (!partners(y, t, it).length) return; const k = gKey(it);
      if (!M.has(k)) M.set(k, { n: it.n, m: [], files: [] }); const g = M.get(k); g.m.push({ t, i }); g.files.push(...it.files); }));
    return [...M.values()]; };
  const nameCell = (y, t, i) => `<button class="lnk" data-go="ini/${y}-${i}">${esc(t.name)}</button>`;
  function render(a) {
    if (!I()) return '<div class="card pad">لا توجد بيانات.</div>';
    const [y, ti] = String(a || '').split('-');
    if (!YEARS.includes(y)) return home();
    if (ti === 'r') return reportView(y);
    if (ti !== undefined && I().teachers[+ti]) { setTimeout(fillThumbs, 0); return teacher(y, +ti); }
    return year(y);
  }
  function home() {
    return `<div class="in"><div class="in-yrs">${YEARS.map(y => { const s = stats(y);
      return `<button class="in-yr${y === '1447' ? ' o' : ''}" data-go="ini/${y}"><b>مبادرات ${AR(y)}هـ</b><span>${nf(s.n)} مبادرة · ${nf(s.teachers)} معلمة</span></button>`; }).join('')}</div>
      <p class="in-note">اختاري العام، ثم المعلمة لعرض مبادراتها وطباعتها أو حفظها PDF.</p></div>`;
  }
  function year(y) {
    const s = stats(y), T = I().teachers;
    return `<div class="in">
      <div class="in-top"><h2>مبادرات المعلمات · ${AR(y)}هـ</h2>
        <div class="in-seg">${YEARS.map(x => `<button data-go="ini/${x}"${x === y ? ' class="on"' : ''}>${AR(x)}هـ</button>`).join('')}</div></div>
      <div class="in-k"><div><b>${nf(s.n)}</b><span>مبادرة (المشتركة مرة واحدة)</span></div><div><b>${nf(s.shared)}</b><span>مبادرة مشتركة</span></div><div><b>${nf(s.teachers)} / ${nf(s.all)}</b><span>معلمة لها مبادرات</span></div></div>
      <div class="in-acts"><button class="in-b" data-go="ini/${y}-r">تقرير كل المبادرات ${AR(y)}هـ (بدون شواهد): عرض · طباعة · تنزيل</button></div>
      <div class="in-q"><input id="iniQ" type="search" placeholder="ابحثي باسم المعلمة أو المبادرة" aria-label="بحث"></div>
      ${(() => { const S = solo(y), G = groups(y), Z = T.filter(t => !itemsOf(t, y).length);
        const btn = (y, i) => `<button class="in-b gh" style="min-height:32px;padding:0 12px" data-go="ini/${y}-${i}">عرض</button>`;
        return `<h3 class="in-h3">المبادرات الفردية (${nf(S.length)})</h3>
      <div class="in-tw"><table class="in-tbl iniTbl">
        <thead><tr><th>م</th><th>المعلمة</th><th>المبادرة</th><th>تاريخ الرفع</th><th></th></tr></thead>
        <tbody>${S.map((r, k) => `<tr data-q="${esc(r.t.name + ' ' + r.it.n)}"><td>${nf(k + 1)}</td><td class="tn">${nameCell(y, r.t, r.i)}</td>
          <td>${esc(r.it.n)}</td><td class="nw">${itDate(r.it)}</td><td>${btn(y, r.i)}</td></tr>`).join('') || '<tr><td colspan="5">لا توجد مبادرات فردية</td></tr>'}</tbody></table></div>
      <h3 class="in-h3">المبادرات المشتركة (${nf(G.length)})</h3>
      <div class="in-tw"><table class="in-tbl iniTbl">
        <thead><tr><th>م</th><th>المبادرة</th><th>المعلمات المشتركات</th><th>تاريخ الرفع</th></tr></thead>
        <tbody>${G.map((g, k) => `<tr data-q="${esc(g.n + ' ' + g.m.map(x => x.t.name).join(' '))}"><td>${nf(k + 1)}</td><td>${esc(g.n)}</td>
          <td class="tn"><div class="ms">${g.m.map(x => `<span>${nameCell(y, x.t, x.i)}</span>`).join('')}</div></td><td class="nw">${itDate(g)}</td></tr>`).join('') || '<tr><td colspan="4">لا توجد مبادرات مشتركة</td></tr>'}</tbody></table></div>
      ${Z.length ? `<p class="in-note">معلمات بلا مبادرات مرفوعة لهذا العام: ${esc(Z.map(t => t.name).join('، '))}</p>` : ''}`; })()}</div>`;
  }
  function teacher(y, i) {
    const t = I().teachers[i], L = itemsOf(t, y);
    const card = (it, j) => { const p = partners(y, t, it);
      return `<section class="in-it"><h3>${esc(it.n)} <span class="in-chip">${AR(yOf(it))}هـ</span> <span class="in-note">تاريخ الرفع: ${itDate(it)}</span></h3>
        ${p.length ? `<span class="in-sh">مشتركة مع: ${esc(p.join('، '))}</span>` : ''}
        <div class="in-fs">${it.files.map((f, k) => fileTile(t, f, `${j}:${k}`)).join('')}</div>
        <div class="in-acts"><button class="in-b" data-iniprt="${y}-${i}-${j}">طباعة / حفظ PDF</button></div></section>`; };
    return `<div class="in">
      <div class="in-top"><h2>${esc(t.name)}</h2><div class="in-seg"><button data-go="ini/${y}">← كل المعلمات</button>${YEARS.map(x => `<button data-go="ini/${x}-${i}"${x === y ? ' class="on"' : ''}>${AR(x)}هـ</button>`).join('')}</div></div>
      ${L.length ? `<div class="in-acts"><button class="in-b" data-iniprt="${y}-${i}-all">طباعة كل مبادراتها ${AR(y)}هـ / حفظ PDF</button></div>${L.map((it) => card(it, t.items.indexOf(it))).join('')}`
        : `<div class="in-it"><p class="in-note">لا توجد مبادرات مرفوعة لعام ${AR(y)}هـ.</p></div>`}
      ${t.other.length && y === '1448' ? `<section class="in-it"><h3>ملفات أخرى في مجلد المبادرات</h3><p class="in-note">ملفات بلا اسم مبادرة واضح.</p><div class="in-fs">${t.other.map((f, k) => fileTile(t, f, 'o:' + k)).join('')}</div></section>` : ''}
    </div>`;
  }
  const fileTile = (t, f, id) => `<button class="in-f" data-inif="${esc(id)}" data-key="${esc(pkey(t, f))}" title="${esc(fname(f.n))}"><span class="im">${isVid(f) ? 'فيديو' : esc((f.x || '').toUpperCase())}</span><span class="cap">${esc(fname(f.n))}</span></button>`;

  async function fillThumbs() {
    let idx; try { idx = await loadPrev(); } catch { return; }
    document.querySelectorAll('.in-f[data-key]:not([data-done])').forEach(b => { b.dataset.done = 1; const e = idx[b.dataset.key];
      if (e && e.n) prevPage(e.id, 1).then(u => { b.querySelector('.im').innerHTML = `<img alt="" src="${u}">`; }).catch(() => {}); });
  }
  const pagesOf = async (t, f) => { const idx = await loadPrev(), e = idx[pkey(t, f)]; if (!e || !e.n) return [];
    return Promise.all(Array.from({ length: e.n }, (_, k) => prevPage(e.id, k + 1))); };

  // عرض ملف واحد بكل صفحاته
  async function openFile(t, f) {
    const lb = Object.assign(document.createElement('div'), { className: 'in-lb', role: 'dialog' });
    lb.innerHTML = `<div class="bx"><div class="in-acts" style="justify-content:space-between"><b style="overflow-wrap:anywhere">${esc(fname(f.n))}</b><button class="in-b gh" data-x>إغلاق</button></div><div data-pp><p class="in-note">جارٍ التحميل…</p></div></div>`;
    lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('[data-x]')) lb.remove(); }); document.body.append(lb);
    const box = lb.querySelector('[data-pp]');
    try { const U = await pagesOf(t, f); box.innerHTML = U.length ? U.map(u => `<img alt="" src="${u}">`).join('') : `<p class="in-note">${isVid(f) ? 'مقطع فيديو: لا يُعرض هنا.' : 'لا توجد معاينة لهذا الملف بعد.'}</p>`; }
    catch { box.innerHTML = '<p class="in-note">تعذر التحميل، حاولي مرة أخرى.</p>'; }
  }

  // الطباعة: صندوق #iniPrint ثم نافذة الطباعة (منها «حفظ PDF»)
  const head = () => `<div class="hd"><div class="r">المملكة العربية السعودية<br>وزارة التعليم<br>الإدارة العامة للتعليم بمنطقة عسير<br>${esc(D.school || 'المتوسطة الحادية والعشرون')}</div><img src="moe-logo.png?v=3" alt="وزارة التعليم"></div>`;
  async function doPrint(html, btn) {
    const old = btn && btn.textContent; if (btn) { btn.disabled = true; btn.textContent = 'جارٍ التجهيز…'; }
    let box = document.getElementById('iniPrint'); if (!box) { box = Object.assign(document.createElement('div'), { id: 'iniPrint' }); document.body.append(box); }
    box.innerHTML = html;
    await Promise.all([...box.querySelectorAll('img')].map(im => im.complete ? 0 : new Promise(r => { im.onload = im.onerror = r; })));
    const pg = document.createElement('style'); pg.textContent = '@media print{@page{size:A4 portrait;margin:10mm}}'; document.head.append(pg);
    document.body.classList.add('ini-printing');
    const done = () => { document.body.classList.remove('ini-printing'); pg.remove(); box.innerHTML = ''; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    if (btn) { btn.disabled = false; btn.textContent = old; }
    window.print();
  }
  async function evidencePages(list) {   // list: [{t, it}] -> صفحة عنوان لكل مبادرة ثم صفحات ملفاتها
    let html = '';
    for (const { t, it } of list) {
      html += `<div class="pg">${head()}<h1>${esc(it.n)}</h1><p class="sb">${esc(t.name)} · ${AR(yOf(it))}هـ</p>
        <table><tr><th>م</th><th>الملف</th><th>ملاحظة</th></tr>${it.files.map((f, k) => `<tr><td>${AR(k + 1)}</td><td>${esc(fname(f.n))}</td><td>${isVid(f) ? 'مقطع فيديو (لا يُطبع)' : ''}</td></tr>`).join('')}</table></div>`;
      for (const f of it.files) { if (isVid(f)) continue; let U = []; try { U = await pagesOf(t, f); } catch {}
        U.forEach(u => { html += `<div class="pg"><p class="ttl">${esc(it.n)} — ${esc(short(t.name))}</p><img class="pv" alt="" src="${u}"></div>`; }); }
    }
    return html;
  }
  // تقرير كل المبادرات بدون شواهد — نفس المحتوى للعرض في المتصفح والطباعة والتنزيل (2026-11-12)
  const byT = (a, b) => a.t.name.localeCompare(b.t.name, 'ar') || itDate(a.it).localeCompare(itDate(b.it));
  function docHTML(y, logo) {
    const s = stats(y), S = solo(y).sort(byT), G = groups(y).sort((a, b) => a.n.localeCompare(b.n, 'ar')), Z = I().teachers.filter(t => !itemsOf(t, y).length);
    return `<div class="idoc"><div class="hd"><div class="r">المملكة العربية السعودية<br>وزارة التعليم<br>الإدارة العامة للتعليم بمنطقة عسير<br>${esc(D.school || 'المتوسطة الحادية والعشرون')}</div><img src="${logo || 'moe-logo.png?v=3'}" alt="وزارة التعليم"></div>
      <h1>تقرير مبادرات المعلمات لعام ${AR(y)}هـ</h1><p class="sb">تاريخ التقرير: ${hijriToday()}</p>
      <div class="kp"><div><b>${AR(s.n)}</b>مبادرة</div><div><b>${AR(S.length)}</b>مبادرة فردية</div><div><b>${AR(G.length)}</b>مبادرة مشتركة</div><div><b>${AR(s.teachers)} / ${AR(s.all)}</b>معلمة لها مبادرات</div></div>
      <div class="bar">أولًا: المبادرات الفردية (${AR(S.length)})</div>
      <table><thead><tr><th class="c">م</th><th>المعلمة</th><th>المبادرة</th><th>تاريخ الرفع</th></tr></thead><tbody>
      ${S.map((r, k) => `<tr><td class="c">${AR(k + 1)}</td><td class="nw">${esc(r.t.name)}</td><td>${esc(r.it.n)}</td><td class="nw">${itDate(r.it)}</td></tr>`).join('') || '<tr><td colspan="4">لا توجد</td></tr>'}</tbody></table>
      <div class="bar">ثانيًا: المبادرات المشتركة (${AR(G.length)})</div>
      <table><thead><tr><th class="c">م</th><th>المبادرة</th><th>المعلمات المشتركات</th><th>تاريخ الرفع</th></tr></thead><tbody>
      ${G.map((g, k) => `<tr><td class="c">${AR(k + 1)}</td><td>${esc(g.n)}</td><td class="ms">${g.m.map(x => `<div>${esc(x.t.name)}</div>`).join('')}</td><td class="nw">${itDate(g)}</td></tr>`).join('') || '<tr><td colspan="4">لا توجد</td></tr>'}</tbody></table>
      ${Z.length ? `<div class="bar">ثالثًا: معلمات بلا مبادرات مرفوعة لهذا العام (${AR(Z.length)})</div><p class="zz">${esc(Z.map(t => t.name).join('، '))}</p>` : ''}
      <div class="sig"><div><b>منسقة المبادرات</b><br><br>${D.ro ? '' : esc(D.me || '')}</div><div><b>وكيلة المدرسة</b><br><br>فوزية خبتي الدوسري</div><div><b>مديرة المدرسة</b><br><br>أمينة آل مشيط</div></div></div>`;
  }
  const report = y => `<div class="pg">${docHTML(y)}</div>`;
  function reportView(y) {
    return `<div class="in">
      <div class="in-top"><h2>تقرير المبادرات · ${AR(y)}هـ</h2><div class="in-seg"><button data-go="ini/${y}">← الجدول</button>${YEARS.map(x => `<button data-go="ini/${x}-r"${x === y ? ' class="on"' : ''}>${AR(x)}هـ</button>`).join('')}</div></div>
      <div class="in-acts"><button class="in-b" data-inirep="${y}">طباعة</button><button class="in-b" data-inirep="${y}">حفظ PDF</button><button class="in-b gh" data-inidl="${y}">تنزيل التقرير</button></div>
      <p class="in-note">«حفظ PDF»: اختاري «حفظ بتنسيق PDF» في نافذة الطباعة. «تنزيل التقرير»: ملف يُفتح في أي متصفح ويُطبع منه.</p>
      <div class="in-paper">${docHTML(y)}</div></div>`;
  }
  async function download(y, btn) {
    const o = btn.textContent; btn.disabled = true; btn.textContent = 'جارٍ التجهيز…';
    let logo = '';
    try { const bl = await (await fetch('moe-logo.png?v=3')).blob(); logo = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(bl); }); } catch {}
    const css = [...document.getElementById('ini-css').textContent.matchAll(/^\.idoc[^\n]*$/gm)].map(m => m[0]).join('\n');
    const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>تقرير مبادرات المعلمات ${AR(y)}هـ</title>
<style>body{margin:0;background:#eef2f2}.pp{background:#fff;max-width:210mm;margin:16px auto;padding:14mm 12mm;box-shadow:0 2px 12px rgba(0,0,0,.12);overflow-x:auto}@page{size:A4 portrait;margin:10mm}@media print{body{background:#fff}.pp{margin:0;padding:0;box-shadow:none;max-width:none}}
${css}</style></head><body><div class="pp">${docHTML(y, logo)}</div></body></html>`;
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' })), download: `تقرير مبادرات المعلمات ${y}هـ.html` });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    btn.disabled = false; btn.textContent = o;
  }

  if (!window.__iniBound) { window.__iniBound = 1;
    document.addEventListener('input', e => { if (e.target.id !== 'iniQ') return; const q = e.target.value.trim();
      document.querySelectorAll('.iniTbl tbody tr').forEach(r => { r.hidden = !!q && !r.dataset.q.includes(q); }); });
    document.addEventListener('click', async e => {
      const dl = e.target.closest('[data-inidl]'); if (dl) return download(dl.dataset.inidl, dl);
      const f = e.target.closest('[data-inif]'), p = e.target.closest('[data-iniprt]'), r = e.target.closest('[data-inirep]'), all = e.target.closest('[data-iniall]');
      if (!f && !p && !r && !all) return;
      const [y, ti] = (location.hash.split('/')[1] || '').split('-');
      if (f) { const t = I().teachers[+ti], [j, k] = f.dataset.inif.split(':'); return openFile(t, j === 'o' ? t.other[+k] : t.items[+j].files[+k]); }
      if (r) return doPrint(report(r.dataset.inirep), r);
      if (all) { const yy = all.dataset.iniall; all.disabled = true; all.textContent = 'جارٍ التجهيز… قد يستغرق دقيقة';
        const html = report(yy) + await evidencePages(stats(yy).list); all.disabled = false; all.textContent = `طباعة كل مبادرات ${AR(yy)}هـ بشواهدها`; return doPrint(html); }
      if (p) { const [yy, i, j] = p.dataset.iniprt.split('-'), t = I().teachers[+i], L = j === 'all' ? itemsOf(t, yy) : [t.items[+j]];
        p.disabled = true; const o = p.textContent; p.textContent = 'جارٍ التجهيز…'; const html = await evidencePages(L.map(it => ({ t, it }))); p.disabled = false; p.textContent = o; return doPrint(html); }
    });
  }
  window.INI = { render };
})();
