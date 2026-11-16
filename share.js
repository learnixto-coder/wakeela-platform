// «مشاركات الطالبات وأولياء الأمور» (2026-11-09) — اطلاع فقط، ثلاثة تبويبات:
//   o1 اليوم الوطني (نعناعي) · o2 يوم المعلم (لافندر فاتح): data/oc.bin = iv(12) | AES-GCM(shareK, gzip JSON من keys/oc-msgs.json) — يكتبه tools/export.js
//   d3 درع الوطن: حائط المبادرة مباشرة من Supabase العامة (api_dir3 → wall)، بلا تخزين في المنصة؛ شكله مثل صفحة المبادرة (شعار الوزارة + اسم المدرسة)
// الاستعمال في index.html: SHARE.render(D, a) حيث a = 'o1' | 'o2' | 'd3' (الافتراضي o1)
window.SHARE = (() => {
  let data = null, err = '', loading = null, cls = '';
  const OCC = {
    o1: { name: 'اليوم الوطني', img: 'm/national-day.png', bg: '#EAF8F2', bg2: '#F6FCF9', ac: '#1F8F6A', soft: '#CDEFE1', ink: '#145C45' },
    o2: { name: 'يوم المعلم', img: 'm/teacher-day.png', bg: '#F5F3FC', bg2: '#FBFAFE', ac: '#7A68C9', soft: '#E4DFF6', ink: '#4B3C93' },
    d3: { name: 'درع الوطن', ac: '#1f7a5c', soft: '#d7e9e3', ink: '#123c34' } };
  // «درع الوطن»: نفس الطلب العام الذي تستعمله صفحة المبادرة (المفتاح عام والجداول مقفلة؛ القراءة عبر api_dir3 فقط؛ حد الصفحة ٥٠)
  const D3 = { api: 'https://uautjfgslrfhceciqwyn.supabase.co/rest/v1/rpc/api_dir3', base: 'https://schoolbsom-droid.github.io/knowledge-production/dir3/',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdXRqZmdzbHJmaGNlY2lxd3luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNjI3NzMsImV4cCI6MjEwODgzODc3M30.Dj1dYWNMwhp02hJEko8XnDD23Mi-gK-Q82BkICdrj_Q', per: 20 };
  // ترتيب الحائط (طلب المستخدمة 2026-11-09): الإدارة (المديرة، الوكيلة، الإداريات) ← المعلمة رزان (تصميم المبادرة) ← المعلمات ← الطالبات ← أولياء الأمور
  const SEC = [['adm', 'إدارة المدرسة'], ['tch', 'المعلمات'], ['stu', 'الطالبات'], ['par', 'أولياء الأمور']];
  const FILT = [['all', 'الكل'], ['adm', 'الإدارة'], ['tch', 'المعلمات'], ['stu', 'الطالبات'], ['par', 'أولياء الأمور']];
  const rankOf = m => { const s = m.sec || '';
    if (m.who === 'staff') return /مديرة/.test(s) ? [0, 0] : /وكيلة/.test(s) ? [0, 1] : /إدارية|ادارية/.test(s) ? [0, 2] : /رزان/.test(m.name || '') ? [1, 0] : [1, 1];
    return m.who === 'students' ? [2, 0] : [3, 0]; };
  const TYPE = { msg: 'رسالة', card: 'بطاقة', draw: 'رسم', voice: 'رسالة صوتية', pray: 'دعاء', quiz: 'أكملت التحدّي', parent: 'ولي أمر', video: 'فيديو' };
  const d3 = { f: 'all', page: 1, all: null, err: '', busy: false };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ar = n => String(n).replace(/\d/g, c => '٠١٢٣٤٥٦٧٨٩'[c]);
  const clean = s => String(s || '').replace(/\\([\\.!()\-*_#+[\]>`~|])/g, '$1').trim();   // نص النماذج يصل بهروب markdown
  const hDate = t => { try { const d = t instanceof Date ? t : new Date(t.replace(' ', 'T') + ':00+03:00');
    const p = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'Asia/Riyadh' }).formatToParts(d), g = k => +p.find(x => x.type === k).value;
    return ar(g('day')) + '‏/' + ar(g('month')) + '‏/' + ar(g('year')) + 'هـ'; } catch { return ''; } };   // اليوم أقصى اليمين
  const grade = c => (String(c).match(/^(أول|ثاني|ثالث)/) || [, 'أخرى'])[1];
  const clsKey = c => { const o = { 'أول': 1, 'ثاني': 2, 'ثالث': 3 }[grade(c)] || 9; return o * 100 + (+(String(c).match(/\d+/) || [0])[0]); };
  const rerender = () => { const y = window.scrollY; window.dispatchEvent(new HashChangeEvent('hashchange')); window.scrollTo(0, y); };
  const box = (t, c) => `<div class="sh-card" style="text-align:center;color:${c || '#778'}">${t}</div>`;

  async function fetchData(key) {
    const buf = new Uint8Array(await fetch('data/oc.bin?t=' + Date.now(), { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('net'); return r.arrayBuffer(); }));
    const k = await crypto.subtle.importKey('raw', Uint8Array.from(key.match(/../g), h => parseInt(h, 16)), 'AES-GCM', false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.subarray(0, 12) }, k, buf.subarray(12));
    return JSON.parse(await new Response(new Blob([plain]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
  }
  // كل مشاركات الحائط مرة واحدة (~٦٠ كيلوبايت)، ثم الترتيب والتقسيم إلى صفحات هنا
  async function d3Load() {
    if (d3.busy) return; d3.busy = true; d3.err = '';
    const call = p => fetch(D3.api, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: D3.key, Authorization: 'Bearer ' + D3.key }, body: JSON.stringify({ p: { action: 'wall', size: 50, ...p } }) })
      .then(r => { if (!r.ok) throw new Error('net'); return r.json(); });
    const every = async who => { const a = await call({ page: 1, who }), L = [...(a.wall || [])], n = Math.ceil((+a.wallTotal || 0) / 50);
      for (let p = 2; p <= n; p++) L.push(...((await call({ page: p, who })).wall || []));
      return L.map(m => ({ ...m, who })); };
    try {
      const A = (await Promise.all(['staff', 'students', 'parents'].map(every))).flat().map(m => ({ ...m, r: rankOf(m) }));
      d3.all = A.sort((x, y) => x.r[0] - y.r[0] || x.r[1] - y.r[1] || String(y.time).localeCompare(String(x.time)));
    } catch { d3.err = 'تعذّر تحميل مشاركات درع الوطن، تحققي من الاتصال.'; }
    d3.busy = false; rerender();
  }

  const css = `<style>
  .sh{--bg:#fff;--bg2:#fff;--ac:#555;--soft:#eee;--ink:#333;background:linear-gradient(180deg,var(--bg),var(--bg2));border-radius:22px;padding:14px;margin:0 -4px}
  .sh-pills{display:flex;gap:8px;justify-content:center;margin:2px 0 14px;overflow-x:auto;scrollbar-width:none}
  .sh-pill{flex:none;border:1.5px solid var(--soft);background:#fff;color:var(--ink);border-radius:999px;padding:8px 15px;font:inherit;font-weight:700;cursor:pointer}
  .sh-pill.on{background:var(--ac);border-color:var(--ac);color:#fff}
  .sh-ban{background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 1px 3px #0001;border-top:8px solid var(--ac)}
  .sh-ban img{display:block;width:100%;max-height:220px;object-fit:contain;background:var(--soft)}
  .sh-ban .in{padding:14px 16px}
  .sh-ban h2{margin:0 0 4px;color:var(--ink);font-size:1.35rem}
  .sh-ban p{margin:0;color:#667}
  .sh-st{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}
  .sh-st div{background:#fff;border-radius:14px;padding:10px;text-align:center;box-shadow:0 1px 2px #0001}
  .sh-st b{display:block;font-size:1.5rem;color:var(--ac)}
  .sh-st span{font-size:.85rem;color:#667}
  .sh-card{background:#fff;border-radius:16px;padding:14px 16px;margin:0 0 10px;box-shadow:0 1px 2px #0001}
  .sh-card h3{margin:0 0 10px;font-size:1.05rem;color:var(--ink)}
  .sh-bar{display:grid;grid-template-columns:92px 1fr 30px;gap:8px;align-items:center;margin:6px 0;font-size:.9rem;cursor:pointer;background:none;border:0;width:100%;font-family:inherit;text-align:start;padding:2px 0}
  .sh-bar i{display:block;height:12px;border-radius:6px;background:var(--ac);min-width:4px}
  .sh-bar .tr{background:var(--soft);border-radius:6px}
  .sh-bar b{color:var(--ink);text-align:center}
  .sh-bar.on span:first-child{color:var(--ac);font-weight:700}
  .sh-chips{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}
  .sh-chip{flex:none;border:1px solid var(--soft);background:#fff;color:var(--ink);border-radius:999px;padding:5px 12px;font:inherit;font-size:.85rem;cursor:pointer}
  .sh-chip.on{background:var(--soft);border-color:var(--ac);font-weight:700}
  .sh-m{background:#fff;border-radius:16px;padding:14px 16px;margin:0 0 10px;box-shadow:0 1px 2px #0001;border-inline-start:4px solid var(--ac)}
  .sh-m .hd{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px}
  .sh-m .nm{font-weight:700;color:var(--ink)}
  .sh-m .cl{font-size:.8rem;background:var(--soft);color:var(--ink);border-radius:999px;padding:2px 10px}
  .sh-m .tx{white-space:pre-line;line-height:1.9;color:#333}
  .sh-m .dt{font-size:.78rem;color:#889;margin-top:8px}
  .sh-m .more{background:none;border:0;color:var(--ac);font:inherit;font-weight:700;cursor:pointer;padding:4px 0 0}
  .sh-m.cut .tx{max-height:7.6em;overflow:hidden;-webkit-mask-image:linear-gradient(#000 60%,transparent)}
  /* ---- «درع الوطن» بتصميم صفحة المبادرة ---- */
  .d3{--g1:#1f7a5c;--g2:#2f9a78;--t1:#2a7f9e;--ink:#123c34;--mut:#5f7a74;--line:#d7e9e3;--soft:#eef8f4;font-family:Almarai,Tahoma,sans-serif;color:var(--ink);
    background:linear-gradient(160deg,#f3faf7,#fff 45%,#eef6f6);border-radius:22px;padding:14px;margin:0 -4px}
  .d3 .sh-pill{font-family:inherit}
  .d3 .sh-pill.on{background:linear-gradient(90deg,var(--g1),var(--t1));border-color:transparent}
  .d3 .grad{background:linear-gradient(90deg,var(--g1),var(--t1),#5cc4a3,var(--t1),var(--g1));background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:d3sh 6s linear infinite}
  @keyframes d3sh{to{background-position:-300% 0}}
  .d3-top{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.9);border-radius:18px;padding:10px 14px;border-bottom:2px solid transparent;border-image:linear-gradient(90deg,var(--t1),var(--g2)) 1;margin-bottom:16px}
  .d3-top img{height:52px}
  .d3-top .sn{font-weight:800;font-size:18px;line-height:1.3}
  .d3-top small{display:block;color:var(--mut);font-size:13px}
  .d3-head{text-align:center;margin:4px 0 16px}
  .d3-chip{display:inline-block;background:linear-gradient(90deg,var(--g1),var(--g2));color:#fff;font-weight:800;font-size:14px;padding:6px 16px;border-radius:30px;margin-bottom:10px}
  .d3-ttl{font-family:'Noto Kufi Arabic',Almarai,sans-serif;font-size:28px;font-weight:800;line-height:1.35}
  .d3-sub{color:var(--mut);font-size:15px;margin-top:6px;line-height:1.6}
  .d3-sub a{color:var(--g1);font-weight:800}
  .d3-st{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:0 0 14px}
  .d3-st div{background:#fff;border:2px solid var(--line);border-radius:18px;padding:10px 4px;text-align:center}
  .d3-st b{display:block;font-size:22px;font-weight:800;color:var(--g1)}
  .d3-st span{font-size:12px;font-weight:700;color:var(--mut)}
  .d3-f{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:0 0 12px}
  .d3-f button{border:2px solid var(--line);background:#fff;font:inherit;font-size:14px;font-weight:800;color:var(--g1);border-radius:99px;padding:7px 14px;cursor:pointer}
  .d3-f button.on{background:linear-gradient(90deg,var(--g1),var(--t1));color:#fff;border-color:transparent}
  .d3-f small{font-size:12px;font-weight:700;opacity:.8}
  .d3-pg{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:12px 0}
  .d3-pg button{min-width:40px;height:40px;padding:0 8px;border-radius:12px;border:2px solid var(--line);background:#fff;font:inherit;font-weight:800;color:var(--g1);cursor:pointer}
  .d3-pg button.on{background:linear-gradient(90deg,var(--g1),var(--t1));color:#fff;border-color:transparent}
  .d3-pg span{align-self:center;color:var(--mut);font-weight:800}
  .d3-sec{display:flex;align-items:center;gap:10px;margin:18px 2px 12px;font-weight:800;font-size:17px;color:var(--g1)}
  .d3-sec::after{content:'';flex:1;height:2px;background:linear-gradient(90deg,var(--line),transparent)}
  .d3-wall{columns:2 260px;column-gap:14px}
  .wi{break-inside:avoid;margin-bottom:14px;background:#fff;border:2px solid var(--line);border-radius:20px;padding:16px}
  .wi .who{display:flex;align-items:center;gap:8px;font-weight:800;font-size:15px}
  .wi .who i{flex:none;width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--g1),var(--t1));color:#fff;font-style:normal;display:flex;align-items:center;justify-content:center;font-size:14px}
  .wi .who small{color:var(--mut);font-weight:400;font-size:12px;margin-inline-start:auto;white-space:nowrap}
  .wi .tx{margin-top:10px;line-height:1.8;font-size:16px;white-space:pre-wrap;word-break:break-word}
  .wi img,.wi video{display:block;width:100%;border-radius:14px;margin-top:10px;border:1px solid var(--line)}
  .wi video{background:#000;max-height:70vh}
  .wi .tag{display:inline-block;margin-top:10px;font-size:12px;font-weight:700;color:var(--g1);background:var(--soft);padding:4px 10px;border-radius:12px}
  .wi.stf{background:#e8f8fa;border-color:#3cb8c9}.wi.stf .who i{background:linear-gradient(135deg,#3cb8c9,#1b8a9a)}.wi.stf .tag{background:#cdeff4;color:#0e6d7a}
  .wi.adm{background:linear-gradient(180deg,#fffaf0,#fff);border-color:#c9a24a}.wi.adm .who i{background:linear-gradient(135deg,#d9b45a,#a8802a)}.wi.adm .tag{background:#f6ebcb;color:#7a5b12}
  .wi.qz{background:#f1f8e9;border-color:#7cb342}.wi.qz .who i{background:linear-gradient(135deg,#7cb342,#558b2f)}.wi.qz .tag{background:#dcedc8;color:#33691e}
  .wi.par{background:#fbf7ff;border-color:#c9b6ea}.wi.par .who i{background:linear-gradient(135deg,#9b7fd6,#6f55b0)}.wi.par .tag{background:#ece3fa;color:#4f3a8a}
  </style>`;
  const pills = k => '<div class="sh-pills">' + Object.entries(OCC).map(([kk, o]) =>
    '<button class="sh-pill' + (kk === k ? ' on' : '') + '" data-go="share/' + kk + '"' + (kk === k ? '' : ' style="color:' + o.ink + ';border-color:' + o.soft + '"') + '>' + o.name + '</button>').join('') + '</div>';
  const wrap = (O, k, inner) => css + '<div class="sh" style="--bg:' + O.bg + ';--bg2:' + O.bg2 + ';--ac:' + O.ac + ';--soft:' + O.soft + ';--ink:' + O.ink + '">' + pills(k) + inner + '</div>';

  // اليوم الوطني / يوم المعلم
  function viewOcc(k) {
    const O = OCC[k], src = (data[k] || {}).msgs || [];
    const M = src.map(m => ({ ...m, msg: clean(m.msg) })).filter(m => m.msg).sort((x, y) => String(y.t).localeCompare(String(x.t)));
    const by = {}; M.forEach(m => { (by[m.cls || 'أخرى'] ||= []).push(m); });
    const C = Object.keys(by).sort((x, y) => clsKey(x) - clsKey(y)), mx = Math.max(1, ...C.map(c => by[c].length));
    if (cls && !by[cls]) cls = '';
    const L = cls ? by[cls] : M;
    return wrap(O, k, `<div class="sh-ban"><img alt="${O.name}" src="${O.img}"><div class="in"><h2>رسائل ${O.name}</h2><p>ما كتبته الطالبات وأولياء الأمور بمناسبة ${O.name}.</p></div></div>
      <div class="sh-st"><div><b>${ar(M.length)}</b><span>رسالة</span></div><div><b>${ar(C.length)}</b><span>فصول</span></div><div><b>${ar(new Set(M.map(m => m.nm)).size)}</b><span>مشاركة</span></div></div>
      <div class="sh-card"><h3>المشاركة حسب الفصل</h3>${C.map(c => `<button class="sh-bar${c === cls ? ' on' : ''}" data-shc="${esc(c)}"><span>${esc(c)}</span><span class="tr"><i style="width:${Math.round(by[c].length / mx * 100)}%"></i></span><b>${ar(by[c].length)}</b></button>`).join('')}</div>
      <div class="sh-chips"><button class="sh-chip${cls ? '' : ' on'}" data-shc="">الكل (${ar(M.length)})</button>${C.map(c => `<button class="sh-chip${c === cls ? ' on' : ''}" data-shc="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      ${L.length ? L.map(m => `<div class="sh-m${m.msg.length > 280 ? ' cut' : ''}"><div class="hd"><span class="nm">${esc(m.nm || 'مشاركة')}</span><span class="cl">${esc(m.cls || '')}</span></div>
        <div class="tx">${esc(m.msg)}</div>${m.msg.length > 280 ? '<button class="more" data-shmore>اقرئي الرسالة كاملة</button>' : ''}<div class="dt">${hDate(m.t)}</div></div>`).join('') : box('لا توجد رسائل بعد')}`);
  }

  // درع الوطن — بطاقة مثل «حائط الدرع» في صفحة المبادرة
  const secOf = m => SEC[m.r[0]][0];
  function d3Item(m) {
    const vid = /^vid\/[\w-]+\.mp4$/.test(m.img || ''), img = m.type === 'draw' && /^data:image\/(jpeg|png);base64,/.test(m.img || '');
    const tx = String(m.text || '').replace(/\u{1F6E1}️?/gu, '💚');   // لا 🛡️ (تظهر في الآيفون بألوان علم آخر)
    const k = secOf(m), kind = k === 'adm' ? ' adm' : k === 'tch' ? ' stf' : k === 'par' ? ' par' : m.type === 'quiz' ? ' qz' : '';
    const tag = k === 'adm' || k === 'tch' ? esc(m.sec || 'منسوبة المدرسة') + (m.type === 'video' ? ' · فيديو' : '')
      : esc(TYPE[m.type] || 'مشاركة') + (m.cls ? ' · ' + esc(m.cls) + (m.sec ? ' / ' + esc(m.sec) : '') : '');
    return `<div class="wi${kind}"><div class="who"><i>${esc((m.name || '؟').trim()[0] || '؟')}</i><span>${esc(m.name || 'مشاركة')}</span><small>${m.time ? hDate(new Date(m.time)) : ''}</small></div>
      ${m.type === 'voice' ? '<div class="tx">🎙️ أرسلت رسالة صوتية لجنودنا</div>' : tx ? `<div class="tx">${esc(tx)}</div>` : ''}
      ${img ? `<img alt="رسم" src="${m.img}">` : ''}${m.type === 'video' && vid ? `<video controls playsinline preload="metadata" src="${D3.base + m.img}"></video>` : ''}
      <span class="tag">${tag}</span></div>`;
  }
  function viewD3() {
    if (!document.getElementById('d3-font')) document.head.insertAdjacentHTML('beforeend', '<link id="d3-font" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&family=Noto+Kufi+Arabic:wght@800&display=swap">');
    if (!d3.all && !d3.err) d3Load();
    const A = d3.all || [], n = k => A.filter(m => secOf(m) === k).length;
    const F = d3.f === 'all' ? A : A.filter(m => secOf(m) === d3.f), pages = Math.max(1, Math.ceil(F.length / D3.per));
    d3.page = Math.min(d3.page, pages);
    const L = F.slice((d3.page - 1) * D3.per, d3.page * D3.per);
    const pager = pages < 2 ? '' : '<div class="d3-pg">' + Array.from({ length: pages }, (_, i) => i + 1).filter(x => x === 1 || x === pages || Math.abs(x - d3.page) <= 1)
      .map((x, i, P) => (i && x - P[i - 1] > 1 ? '<span>…</span>' : '') + `<button class="${x === d3.page ? 'on' : ''}" data-d3p="${x}">${ar(x)}</button>`).join('') + '</div>';
    // عنوان القسم عند أول بطاقة منه في الصفحة
    let last = '', body = '';
    L.forEach(m => { const k = secOf(m); if (k !== last) { body += (last ? '</div>' : '') + `<div class="d3-sec">${SEC.find(s => s[0] === k)[1]}</div><div class="d3-wall">`; last = k; } body += d3Item(m); });
    if (last) body += '</div>';
    return css + `<div class="d3">${pills('d3')}
      <div class="d3-top"><img src="moe-logo.png" alt="وزارة التعليم"><div><div class="sn grad">المتوسطة الحادية والعشرون</div><small>مبادرة درع الوطن</small></div></div>
      <div class="d3-head"><span class="d3-chip">حائط الدرع</span><div class="d3-ttl grad">رسائلكن لحماة الوطن</div>
        <div class="d3-sub">رسائل الإدارة والمعلمات والطالبات وأولياء الأمور، تتحدّث تلقائيًا · <a href="${D3.base}" target="_blank" rel="noopener">صفحة المبادرة ↗</a></div></div>
      ${A.length ? `<div class="d3-st">${SEC.map(([k, l]) => `<div><b>${ar(n(k))}</b><span>${l}</span></div>`).join('')}</div>` : ''}
      <div class="d3-f">${FILT.map(([k, l]) => `<button class="${k === d3.f ? 'on' : ''}" data-d3w="${k}">${l}${A.length ? ` <small>(${ar(k === 'all' ? A.length : n(k))})</small>` : ''}</button>`).join('')}</div>
      ${d3.err ? box(d3.err + ` <button class="sh-chip" data-d3r>إعادة المحاولة</button>`, '#a33') : !d3.all ? box('جارٍ تحميل المشاركات…')
        : L.length ? pager + body + pager : box('لا توجد مشاركات بعد')}
    </div>`;
  }

  // أحداث الصفحة — مرة واحدة على مستوى المستند
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-shc]'); if (c) { cls = c.dataset.shc; rerender(); return; }
    const w = e.target.closest('[data-d3w]'); if (w) { d3.f = w.dataset.d3w; d3.page = 1; rerender(); return; }
    const p = e.target.closest('[data-d3p]'); if (p) { d3.page = +p.dataset.d3p; rerender(); document.querySelector('.d3-f')?.scrollIntoView({ block: 'start' }); return; }
    if (e.target.closest('[data-d3r]')) { d3.err = ''; d3Load(); rerender(); return; }
    const m = e.target.closest('[data-shmore]'); if (m) { m.closest('.sh-m').classList.remove('cut'); m.remove(); }
  });

  function render(D, a) {
    if (a === 'd3') return viewD3();
    const k = a === 'o2' ? 'o2' : 'o1';
    if (data) return viewOcc(k);
    if (err) return `<div class="card pad"><p class="muted" style="margin:0">${err}</p></div>`;
    loading ||= fetchData(D.shareK).then(j => { data = j; }, e => { err = e.message === 'net' ? 'تعذّر تحميل الرسائل، تحققي من الاتصال ثم أعيدي فتح الصفحة.' : 'تعذّر فتح الرسائل.'; })
      .then(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
    return '<div class="card pad"><p class="muted" style="margin:0">جارٍ تحميل الرسائل…</p></div>';
  }
  return { render };
})();
