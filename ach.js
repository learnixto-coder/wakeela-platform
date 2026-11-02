// «سجل إنجازي في النشاط» (2026-11-02، طلب المستخدمة): صفحة احتفال بأعمال المعلمة في الأنشطة الصفية — مفعّلة لابتسام الشهري فقط (achOn في index.html)
// يستعمل دوال index.html العامة: D، esc، nf، hStr، hIso، cpList، cpAll، cpState، cpD، srvResults، srvStat، ctThumbs، ctTh، loadQr
(() => {
  const STAR = 'ach-star', CSS = `
.ach{display:grid;gap:14px}
.ach-hero{background:linear-gradient(140deg,#6c5ce7,#a594ff);color:#fff;border-radius:20px;padding:20px;display:grid;gap:14px}
.ach-hero h2{margin:0;font-size:22px}.ach-hero p{margin:0;opacity:.9}
.ach-st{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.ach-st div{background:rgba(255,255,255,.18);border-radius:12px;padding:10px 6px;text-align:center;font-size:13px}
.ach-st b{display:block;font-size:24px;line-height:1.2}
.ach-hero .btn{background:#fff;color:#4b3cc9;justify-self:start}
@media (max-width:520px){.ach-st{grid-template-columns:repeat(2,1fr)}}
.ach h3{margin:0 0 10px;font-size:17px}
.ach-sub{color:var(--muted);font-size:13px;margin:-6px 0 10px}
.ach-tl{display:grid;gap:14px;position:relative;padding-right:22px}
.ach-tl::before{content:"";position:absolute;right:7px;top:6px;bottom:6px;width:2px;background:var(--line)}
.ach-tl>div{position:relative}
.ach-tl>div::before{content:"";position:absolute;right:-22px;top:5px;width:14px;height:14px;border-radius:50%;background:var(--brand);border:3px solid var(--card)}
.ach-tl>div.na::before{background:var(--line)}
.ach-th4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:6px;max-width:360px}
.ach-ph{aspect-ratio:1;border-radius:10px;overflow:hidden;background:var(--soft);display:grid;place-items:center;font-size:11px;position:relative}
.ach-ph .cp-th{width:100%;height:100%;display:grid;place-items:center;min-height:0;border:0;background:none;padding:0}
.ach-ph img{width:100%;height:100%;object-fit:cover;display:block}
.ach-ph .star{position:absolute;top:4px;left:4px;width:28px;height:28px;border-radius:50%;border:0;background:rgba(0,0,0,.45);color:#fff;font-size:15px;cursor:pointer;line-height:1}
.ach-ph .star.on{background:#e0a21b}
.ach-gal{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.ach-gal .ach-ph:first-child{grid-column:span 2;grid-row:span 2}
.ach-all{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:6px;margin-top:10px}
.ach-bdg{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:12px;text-align:center}
.ach-bdg>div{display:grid;justify-items:center;gap:4px;font-size:12.5px}
.ach-bdg i{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-weight:700;font-size:20px;color:#fff}
.ach-bdg .off i{background:var(--line)!important;color:var(--muted)}
.ach-bdg .off{color:var(--muted)}
.ach-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
.ach-dom{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.ach-leg{display:grid;gap:6px;font-size:13px}.ach-leg span{display:flex;gap:8px;align-items:center}.ach-leg i{width:11px;height:11px;border-radius:3px;flex:none}
.ach-meter{height:10px;border-radius:99px;background:var(--line);overflow:hidden;margin:6px 0 2px}.ach-meter i{display:block;height:100%;background:#e86a92;border-radius:99px}
.ach-pair{display:grid;gap:10px}
.ach-pair .row2{display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:center}
.ach-pair .row2 div{background:var(--soft);border-radius:12px;padding:8px}.ach-pair .row2 b{display:block;font-size:20px}
.ach-cert{display:flex;flex-wrap:wrap;gap:8px}
.ach-story{position:fixed;inset:0;z-index:60;background:rgba(10,8,30,.75);display:grid;place-items:center;padding:16px}
.ach-sl{width:min(380px,100%);aspect-ratio:9/15;max-height:calc(100vh - 32px);background:linear-gradient(170deg,#2b2160,#6c5ce7);color:#fff;border-radius:22px;padding:22px;display:grid;align-content:space-between;cursor:pointer;user-select:none}
.ach-bars{display:flex;gap:4px}.ach-bars i{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.35)}.ach-bars i.on{background:#fff}
.ach-huge{font-size:64px;font-weight:700;line-height:1}
.ach-sl .ach-th4{max-width:none}
.ach-x{position:absolute;top:calc(env(safe-area-inset-top,0px) + 14px);left:14px;width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.2);color:#fff;font-size:20px;cursor:pointer}`;

  const DOMC = ['#8976fd', '#fca61f', '#27ae60', '#2f80ed', '#e86a92', '#6b7280'];
  const LEADER = 'أ. منى العمري', PRINCIPAL = 'أ. أمينة آل مشيط', SCHOOL = 'المتوسطة الحادية والعشرون';
  const stars = () => { try { return JSON.parse(localStorage.getItem(STAR) || '[]'); } catch { return []; } };
  const setStars = v => { try { localStorage.setItem(STAR, JSON.stringify(v.slice(-60))); } catch {} };
  const gDay = g => { const [y, m, d] = String(g).split('/').map(Number); return Date.UTC(y, m - 1, d); };
  const isImg = f => !/^video\//.test(f.m || '') && !/\.(mp4|mov|pdf|docx?)$/i.test(f.n || '');
  const pn = s => String(s || '').replace(/^برنامج\s+/, '');   // «برنامج X» → X
  const first = s => String(s || '').replace(/^أ\.\s*/, '').split(' ')[0];

  // كل ما تحتاجه الصفحة من بيانات المعلمة (برامج الأنشطة الصفية)
  function model() {
    const L = cpList().map(x => ({ ...x, all: cpAll(x.p), st: cpState(x.p) }));
    L.sort((a, b) => (a.p.from ? gDay(a.p.from.g) : 9e15) - (b.p.from ? gDay(b.p.from.g) : 9e15));
    const name = D.ct.items[0].name, photos = L.flatMap(x => x.all.filter(f => f.id && isImg(f)).map(f => ({ f, k: x.id, prog: x.p.n })));
    const cls = new Map(); L.forEach(x => cls.set(x.p.cls || x.it.cls, x.p.students || x.it.students || 0));
    const done = L.filter(x => (x.p.rep || []).length);
    const doms = {}; L.forEach(x => { doms[x.p.dom] = (doms[x.p.dom] || 0) + 1; });
    return { L, name, photos, students: [...cls.values()].reduce((a, b) => a + b, 0), done, doms, own: L.reduce((s, x) => s + (x.p.files || []).length, 0) };
  }
  const ph = (it, sz = 300, star = false) => `<div class="ach-ph"><div class="cp-th" data-ctth="${esc(it.f.id)}" data-sz="${sz}" data-k="${esc(it.k)}"><span class="muted">…</span></div>${star ? `<button class="star${stars().includes(it.f.id) ? ' on' : ''}" data-achstar="${esc(it.f.id)}" aria-label="أضيفي إلى أجمل لقطاتي">★</button>` : ''}</div>`;

  function badges(M, srvAvg) {
    const early = M.done.some(x => x.p.to && x.p.rep.some(f => f.t && new Date(f.t).getTime() <= gDay(x.p.to.g) + 864e5));
    const pair = M.L.some(x => (x.p.files || []).length && (x.p.mates || []).some(m => (m.files || []).length));
    return [
      ['١', 'أول شاهد', M.own > 0, '#8976fd'], ['✓', 'برنامج مكتمل', M.done.length > 0, '#27ae60'], ['⏱', 'تقرير في وقته', early, '#fca61f'],
      ['٥٠', '٥٠ صورة', M.photos.length >= 50, '#2f80ed'], ['♥', 'حب الطالبات', srvAvg != null && srvAvg >= 4, '#e86a92'],
      ['٢', 'شريكة مثالية', pair, '#5b4bc4'], ['٣', 'ثلاثة مجالات', Object.keys(M.doms).length >= 3, '#1e9e8f']];
  }
  const bdgHtml = B => B.map(([s, t, on, c]) => `<div class="${on ? '' : 'off'}"><i style="background:${c}">${s}</i><span>${t}</span></div>`).join('');

  function donut(doms) {
    const E = Object.entries(doms), tot = E.reduce((s, [, n]) => s + n, 0), C = 2 * Math.PI * 36; let off = 0;
    const arcs = E.map(([, n], i) => { const len = n / tot * C, a = `<circle cx="50" cy="50" r="36" fill="none" stroke="${DOMC[i % DOMC.length]}" stroke-width="16" stroke-dasharray="${len.toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 50 50)"/>`; off += len; return a; }).join('');
    return `<div class="ach-dom"><svg viewBox="0 0 100 100" width="130" height="130" role="img" aria-label="توزيع المجالات"><circle cx="50" cy="50" r="36" fill="none" stroke="var(--line)" stroke-width="16"/>${arcs}
      <text x="50" y="50" text-anchor="middle" font-size="18" font-weight="700" fill="var(--ink)">${nf(E.length)}</text><text x="50" y="64" text-anchor="middle" font-size="8" fill="var(--muted)">${E.length > 2 ? 'مجالات' : 'مجال'}</text></svg>
      <div class="ach-leg">${E.map(([d, n], i) => `<span><i style="background:${DOMC[i % DOMC.length]}"></i>${esc(d)} · ${nf(n)} ${n > 1 ? 'برامج' : 'برنامج'}</span>`).join('')}</div></div>`;
  }

  function render() {
    if (!document.getElementById('achCss')) document.head.append(Object.assign(document.createElement('style'), { id: 'achCss', textContent: CSS }));
    const M = model(), S = stars(), starred = M.photos.filter(x => S.includes(x.f.id)), best = (starred.length ? starred : M.photos.slice(-6).reverse()).slice(0, 6);
    const pairs = M.L.filter(x => (x.p.mates || []).length);
    setTimeout(() => { ctThumbs(); fillSrv(M); }, 0);
    return `<div class="ach">
  <section class="ach-hero">
    <div><p style="font-size:13px">سجل إنجازي في النشاط الطلابي · الفصل الدراسي الأول ١٤٤٨هـ</p><h2>أ. ${esc(M.name)}</h2><p>${esc([...new Set(M.L.map(x => x.p.cls || x.it.cls))].join(' · '))}</p></div>
    <div class="ach-st"><div><b>${nf(M.L.length)}</b>${M.L.length > 2 ? 'برامج' : 'برنامج'}</div><div><b>${nf(M.done.length)}</b>مكتمل</div><div><b>${nf(M.students)}</b>طالبة</div><div><b>${nf(M.photos.length)}</b>صورة</div></div>
    <button class="btn" data-achstory>▶ قصتي في النشاط</button>
  </section>

  <section class="card pad"><h3>رحلتي في النشاط</h3>
    <div class="ach-tl">${M.L.map(x => { const P = x.all.filter(f => f.id && isImg(f)).slice(-4).map(f => ({ f, k: x.id }));
      return `<div class="${x.st[1] === 'na' ? 'na' : ''}"><b>${esc(x.p.n)}</b> <span class="chip s-${x.st[1]}">${x.st[0]}</span><div class="muted" style="font-size:13px">${esc(x.p.dom)} · من ${cpD(x.p.from)} إلى ${cpD(x.p.to)}</div>
        ${P.length ? `<div class="ach-th4">${P.map(i => ph(i, 200)).join('')}</div>` : ''}</div>`; }).join('')}</div></section>

  <section class="card pad"><h3>أجمل لقطاتي</h3><p class="ach-sub">${starred.length ? 'الصور اللي اخترتِها بالنجمة.' : 'أحدث صورك. اضغطي ★ على أي صورة تحت لتضيفيها هنا.'}</p>
    ${best.length ? `<div class="ach-gal">${best.map((x, i) => ph(x, i ? 300 : 600)).join('')}</div>` : '<p class="muted" style="margin:0">لا صور بعد.</p>'}
    ${M.photos.length ? `<details style="margin-top:12px"><summary class="muted" style="cursor:pointer">كل صوري (${nf(M.photos.length)}) لاختيار الأجمل</summary><div class="ach-all">${M.photos.slice().reverse().map(x => ph(x, 200, true)).join('')}</div></details>` : ''}</section>

  <section class="card pad"><h3>أوسمتي</h3><div class="ach-bdg" id="achBdg">${bdgHtml(badges(M, null))}</div></section>

  <div class="ach-two">
    <section class="card pad"><h3>مجالاتي</h3>${donut(M.doms)}</section>
    <section class="card pad"><h3>صوت الطالبات</h3><div id="achSrv"><p class="muted" style="margin:0">جارٍ تحميل نتائج الاستبانة…</p></div></section>
  </div>

  ${pairs.length ? `<section class="card pad"><h3>عملنا المشترك</h3><div class="ach-two">${pairs.map(x => { const mine = (x.p.files || []).length;
    return `<div class="ach-pair"><b>${esc(x.p.n)}</b><span class="muted" style="font-size:13px">مع ${x.p.mates.map(m => 'أ. ' + esc(m.name)).join(' و')}</span>
      <div class="row2"><div><b>${nf(mine)}</b>صورة منكِ</div><div><b>${nf(x.p.mates.reduce((s, m) => s + (m.files || []).length, 0))}</b>صورة من زميلتك</div></div>
      ${(x.p.rep || []).length ? '<span class="chip s-ok" style="justify-self:start">تقرير واحد للفصل ✓</span>' : ''}</div>`; }).join('')}</div></section>` : ''}

  <section class="card pad"><h3>شهاداتي</h3><p class="ach-sub">تطلع شهادة شكر لكل برنامج اكتمل تقريره.</p>
    ${M.done.length ? `<div class="ach-cert">${M.done.map(x => `<button class="btn sm" data-achcert="${esc(x.id)}">شهادة برنامج ${esc(pn(x.p.n))}</button>`).join('')}</div>` : '<p class="muted" style="margin:0">أول ما يصدر تقرير برنامج تطلع شهادته هنا.</p>'}</section>

  <section class="card pad"><h3>صفحة إنجازي للطباعة</h3><p class="ach-sub">صفحة واحدة مرتبة لسجل الأداء الوظيفي: برامجك وأجمل صورك وأوسمتك. اختاري «حفظ بصيغة PDF» من نافذة الطباعة.</p>
    <button class="btn" data-achprint>طباعة / حفظ PDF</button></section>
</div>`;
  }

  // صوت الطالبات + وسام «حب الطالبات» من استبانة نهاية البرنامج (المجاميع فقط، دون أسماء)
  let srvLast = null;
  async function fillSrv(M) {
    const el = document.getElementById('achSrv'); if (!el) return;
    let R = null; try { R = await srvResults(); } catch {}
    const rows = M.L.filter(x => x.p.srv).map(x => ({ x, s: R && srvStat(R.programs?.[x.p.srv]) })).filter(r => r.s);
    const n = rows.reduce((a, r) => a + r.s.n, 0), avg = n ? rows.reduce((a, r) => a + r.s.avg * r.s.n, 0) / n : null;
    srvLast = { n, avg };
    if (!el.isConnected) return;
    el.innerHTML = n ? `<div style="display:flex;justify-content:space-between;align-items:baseline"><b>رضا الطالبات</b><b style="font-size:22px;color:#e86a92">${nf(Math.round(avg / 5 * 100))}٪</b></div>
      <div class="ach-meter"><i style="width:${avg / 5 * 100}%"></i></div><div class="muted" style="font-size:13px">من ${nf(n)} ${n > 10 ? 'طالبة' : 'طالبات'} أجبن على الاستبانة</div>
      <div style="display:grid;gap:4px;margin-top:10px;font-size:13px">${rows.map(r => `<span>${esc(r.x.p.n)}: <b>${r.s.avg.toFixed(1)}</b> من ٥ (${nf(r.s.n)} ردًّا)</span>`).join('')}</div>`
      : '<p class="muted" style="margin:0">ما فيه ردود على الاستبانة بعد. أول ما تجيب الطالبات يطلع رضاهن هنا.</p>';
    const b = document.getElementById('achBdg'); if (b) b.innerHTML = bdgHtml(badges(M, avg));
  }

  // شهادة الشكر: ملف SVG يُنزَّل
  function cert(x, name) {
    const d = x.p.to ? hStr(x.p.to.h) : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1123 794" width="1123" height="794" direction="rtl" font-family="Rubik, 'IBM Plex Sans Arabic', Tahoma, sans-serif">
<rect width="1123" height="794" fill="#fbfaff"/><rect x="28" y="28" width="1067" height="738" rx="18" fill="none" stroke="#e0a21b" stroke-width="6"/>
<rect x="46" y="46" width="1031" height="702" rx="12" fill="none" stroke="#6c5ce7" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/>
<circle cx="561" cy="150" r="48" fill="#e0a21b"/><text x="561" y="168" text-anchor="middle" font-size="50" fill="#fff">★</text>
<text x="561" y="260" text-anchor="middle" font-size="54" font-weight="700" fill="#6c5ce7">شهادة شكر وتقدير</text>
<text x="561" y="330" text-anchor="middle" font-size="26" fill="#24203d">تتقدم إدارة ${SCHOOL} ورائدة النشاط الطلابي بالشكر والتقدير للأستاذة</text>
<text x="561" y="410" text-anchor="middle" font-size="48" font-weight="700" fill="#24203d">${esc(name)}</text>
<text x="561" y="475" text-anchor="middle" font-size="26" fill="#24203d">على تنفيذ برنامج «${esc(pn(x.p.n))}» لطالبات ${esc(x.p.cls || x.it.cls)}</text>
<text x="561" y="515" text-anchor="middle" font-size="22" fill="#6b6785">مجال ${esc(x.p.dom)} · الفصل الدراسي الأول ١٤٤٨هـ</text>
<text x="561" y="560" text-anchor="middle" font-size="22" fill="#6b6785">سائلين الله لها دوام التوفيق والسداد</text>
<text x="860" y="660" text-anchor="middle" font-size="20" fill="#6b6785">رائدة النشاط</text><text x="860" y="695" text-anchor="middle" font-size="24" font-weight="700" fill="#24203d">${LEADER}</text>
<text x="263" y="660" text-anchor="middle" font-size="20" fill="#6b6785">مديرة المدرسة</text><text x="263" y="695" text-anchor="middle" font-size="24" font-weight="700" fill="#24203d">${PRINCIPAL}</text>
<text x="561" y="695" text-anchor="middle" font-size="20" fill="#6b6785">${d}</text></svg>`;
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })), download: `شهادة شكر - ${pn(x.p.n)}.svg` });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  // «قصتي في النشاط»: شرائح بالضغط، مثل القصص
  function story() {
    const M = model(), img = it => ctTh[it.f.id]?.b64 ? `<div class="ach-ph"><img alt="" src="data:${ctTh[it.f.id].m || 'image/jpeg'};base64,${ctTh[it.f.id].b64}"></div>` : '';
    const pics = M.photos.filter(x => ctTh[x.f.id]?.b64).slice(-4).map(img).join('');
    const top = Object.entries(M.doms).sort((a, b) => b[1] - a[1])[0];
    const S = [
      `<div style="opacity:.85">الفصل الدراسي الأول ١٤٤٨هـ</div><div class="ach-huge" style="font-size:40px">قصتي في النشاط</div><div>أ. ${esc(M.name)}</div>`,
      `<div style="opacity:.85">هذا الفصل نفّذتِ</div><div class="ach-huge">${nf(M.L.length)}</div><div style="font-size:18px;font-weight:600">${M.L.length > 2 ? 'برامج' : 'برنامج'} نشاط، اكتمل منها ${nf(M.done.length)}</div>`,
      `<div style="opacity:.85">وأسعدتِ</div><div class="ach-huge">${nf(M.students)}</div><div style="font-size:18px;font-weight:600">طالبة في ${esc([...new Set(M.L.map(x => x.p.cls || x.it.cls))].join(' و'))}</div>`,
      `<div style="opacity:.85">ووثّقتِ</div><div class="ach-huge">${nf(M.photos.length)}</div><div style="font-size:18px;font-weight:600">صورة من أنشطة طالباتك</div>${pics ? `<div class="ach-th4">${pics}</div>` : ''}`,
      `<div style="opacity:.85">أكثر مجال اشتغلتِ عليه</div><div class="ach-huge" style="font-size:38px">${esc(top ? top[0] : '—')}</div>${srvLast?.n ? `<div style="font-size:18px;font-weight:600">ورضا طالباتك ${nf(Math.round(srvLast.avg / 5 * 100))}٪ ♥</div>` : ''}`,
      `<div class="ach-huge" style="font-size:40px">شكرًا لعطائك</div><div style="font-size:18px">كل صورة هنا لحظة صنعتِها لطالباتك ✦</div>`];
    let i = 0;
    const box = Object.assign(document.createElement('div'), { className: 'ach-story' });
    const draw = () => { box.innerHTML = `<button class="ach-x" aria-label="إغلاق">✕</button><div class="ach-sl" role="button" tabindex="0" aria-label="الشريحة التالية"><div class="ach-bars">${S.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div><div style="display:grid;gap:10px">${S[i]}</div><div style="opacity:.7;font-size:12px">اضغطي للمتابعة</div></div>`; };
    box.addEventListener('click', e => { if (e.target.closest('.ach-x') || e.target === box) { box.remove(); return; } if (++i >= S.length) { box.remove(); return; } draw(); });
    draw(); document.body.append(box);
  }

  // صفحة الطباعة: نافذة جديدة بتنسيق A4 + رمز QR يفتح المنصة
  async function printPage() {
    const M = model(), S = stars(), sel = M.photos.filter(x => S.includes(x.f.id) && ctTh[x.f.id]?.b64);
    const pics = (sel.length ? sel : M.photos.filter(x => ctTh[x.f.id]?.b64).slice(-6)).slice(0, 6);
    let qr = ''; try { await loadQr(); const q = qrcode(0, 'M'); q.addData(location.href.split('#')[0]); q.make(); qr = q.createSvgTag({ cellSize: 3, margin: 1, scalable: true }); } catch {}
    const B = badges(M, srvLast?.avg ?? null).filter(b => b[2]);
    const w = window.open('', '_blank'); if (!w) { alert('اسمحي بالنوافذ المنبثقة ثم أعيدي المحاولة'); return; }
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>سجل إنجاز النشاط - ${esc(M.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;600;700&display=swap" rel="stylesheet">
<style>@page{size:A4;margin:14mm}body{font-family:Rubik,Tahoma,sans-serif;color:#24203d;margin:0;font-size:13px;line-height:1.7}
.hd{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #6c5ce7;padding-bottom:8px}h1{margin:0;font-size:22px;color:#6c5ce7}
.st{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}.st div{border:1px solid #e3e0f0;border-radius:10px;text-align:center;padding:8px}.st b{display:block;font-size:22px;color:#6c5ce7}
table{width:100%;border-collapse:collapse;margin:6px 0 14px}th,td{border:1px solid #e3e0f0;padding:6px 8px;text-align:right}th{background:#efecff}
.ph{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.ph img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:6px}
.bd{display:flex;flex-wrap:wrap;gap:6px}.bd span{border:1px solid #e0a21b;border-radius:99px;padding:2px 10px}
.ft{display:flex;justify-content:space-between;align-items:flex-end;margin-top:16px}.qr{width:90px}h2{font-size:15px;margin:14px 0 6px}</style></head><body>
<div class="hd"><div><h1>سجل إنجاز النشاط الطلابي</h1><div>أ. ${esc(M.name)} · ${SCHOOL}</div></div><div>الفصل الدراسي الأول ١٤٤٨هـ</div></div>
<div class="st"><div><b>${nf(M.L.length)}</b>برامج</div><div><b>${nf(M.done.length)}</b>مكتمل</div><div><b>${nf(M.students)}</b>طالبة</div><div><b>${nf(M.photos.length)}</b>صورة</div></div>
<h2>البرامج</h2><table><tr><th>البرنامج</th><th>المجال</th><th>الفصل</th><th>المدة</th><th>الحالة</th></tr>
${M.L.map(x => `<tr><td>${esc(x.p.n)}</td><td>${esc(x.p.dom)}</td><td>${esc(x.p.cls || x.it.cls)}</td><td>${x.p.from ? hStr(x.p.from.h) + ' - ' + hStr(x.p.to.h) : '—'}</td><td>${(x.p.rep || []).length ? 'مكتمل بتقرير' : x.st[0]}</td></tr>`).join('')}</table>
${srvLast?.n ? `<h2>رضا الطالبات</h2><div>${nf(Math.round(srvLast.avg / 5 * 100))}٪ من ${nf(srvLast.n)} ردًّا على استبانة نهاية البرنامج</div>` : ''}
${B.length ? `<h2>الأوسمة</h2><div class="bd">${B.map(b => `<span>${b[1]}</span>`).join('')}</div>` : ''}
${pics.length ? `<h2>من أجمل اللقطات</h2><div class="ph">${pics.map(x => `<img alt="" src="data:${ctTh[x.f.id].m || 'image/jpeg'};base64,${ctTh[x.f.id].b64}">`).join('')}</div>` : ''}
<div class="ft"><div>رائدة النشاط: ${LEADER}<br>مديرة المدرسة: ${PRINCIPAL}</div>${qr ? `<div style="text-align:center"><div class="qr">${qr}</div><span style="font-size:10px">المنصة</span></div>` : ''}</div>
<script>window.onload=()=>setTimeout(()=>print(),400)<\/script></body></html>`);
    w.document.close();
  }

  document.addEventListener('click', e => {
    const s = e.target.closest('[data-achstar]'); if (s) { e.stopPropagation(); const id = s.dataset.achstar, v = stars(), on = !v.includes(id); setStars(on ? [...v, id] : v.filter(x => x !== id)); s.classList.toggle('on', on); return; }
    if (e.target.closest('[data-achstory]')) return story();
    if (e.target.closest('[data-achprint]')) return printPage();
    const c = e.target.closest('[data-achcert]'); if (c) { const x = model().L.find(y => y.id === c.dataset.achcert); if (x) cert(x, model().name); }
  });
  window.ACH = { render };
})();
