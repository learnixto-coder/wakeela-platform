// «سجل توثيق الأداء الوظيفي — نموذج ٣» (2026-11-12): المعلمة التي عندها سجل جاهز ترفقه فقط: ملف PDF أو رابط.
// الملف: D.inbox بالمفتاح "rr" → tools/inbox.js يحفظه في <المعلمة>\سجل توثيق الأداء الوظيفي (السجل الجاهز)\ (ينشئ المجلد)،
// وexport.js (rrInfo) يرجعه في t.rr. الرابط: Supabase pf_save_by_pid في PF.p3 = {url, at} (نفس سجل «التعريف بالمعلمة»).
// يعتمد على دوال index.html: D، esc، nf، sealUpload، wFileUrl، teacherId، phoneOf، sessionCode، UP_MAX.
(function () {
  'use strict';
  document.head.insertAdjacentHTML('beforeend', `<style id="p3-css">
.p3{--pri:#6c5ce7;--pri-s:#efecff;--ink:#24252c;--mut:#6e6a7c;--ln:#ebe8f2;--ok:#1d8a4a;--bad:#c0392b;color:var(--ink);max-width:760px;margin:0 auto;display:grid;gap:14px}
.p3 .p3h{background:linear-gradient(135deg,#6c5ce7,#8e7cf3);color:#fff;border-radius:20px;padding:22px 20px;display:flex;gap:14px;align-items:center}
.p3 .p3h .ic{flex:none;width:52px;height:52px;border-radius:16px;background:rgba(255,255,255,.18);display:grid;place-items:center}
.p3 .p3h h2{margin:0;font-size:1.25rem;color:#fff}.p3 .p3h p{margin:4px 0 0;opacity:.9;font-size:.92rem;line-height:1.7}
.p3 .p3c{background:#fff;border:1px solid var(--ln);border-radius:18px;padding:16px}
.p3 .p3c h3{margin:0 0 10px;font-size:1.05rem}
.p3 .p3e{color:var(--mut);margin:0;font-size:.95rem}
.p3 .p3r{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--ln)}.p3 .p3r:first-of-type{border-top:0}
.p3 .p3r .fi{flex:none;width:42px;height:42px;border-radius:12px;background:var(--pri-s);color:var(--pri);display:grid;place-items:center;font-weight:700;font-size:.75rem}
.p3 .p3r .nm{flex:1;min-width:0}.p3 .p3r .nm b{display:block;overflow-wrap:anywhere;font-weight:600}.p3 .p3r .nm small{color:var(--mut)}
.p3 .b3{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:42px;padding:0 16px;border-radius:12px;border:0;background:var(--pri);color:#fff;font:inherit;font-weight:600;cursor:pointer;text-decoration:none;white-space:nowrap}
.p3 .b3.gh{background:var(--pri-s);color:var(--pri)}.p3 .b3.dl{background:#fff;color:var(--bad);border:1px solid #f1c9c4}
.p3 .b3:disabled{opacity:.6;cursor:default}
.p3 .two{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.p3 .lk{display:flex;gap:8px;flex-wrap:wrap}.p3 .lk input{flex:1;min-width:0;min-height:42px;border:1px solid var(--ln);border-radius:12px;padding:0 12px;font:inherit;direction:ltr;text-align:left}
.p3 .msg{display:block;margin-top:8px;font-size:.9rem;color:var(--mut)}.p3 .msg.ok{color:var(--ok)}.p3 .msg.err{color:var(--bad)}
.p3 .uq{display:block;font-size:.9rem;margin-top:6px}
.p3 .p3f{display:flex;justify-content:flex-start}
.p3 .p3r .nm b[dir=ltr]{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (max-width:620px){.p3 .two{grid-template-columns:1fr}.p3 .p3r{flex-wrap:wrap}.p3 .p3r .nm{flex:1 1 calc(100% - 60px)}.p3 .p3r .b3{flex:1}}
</style>`);

  const KEY = 'rr';   // tools/inbox.js → <المعلمة>\سجل توثيق الأداء الوظيفي (السجل الجاهز)\
  const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const SB = 'https://bynymxmjzaeoyikuuwen.supabase.co';
  const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5bnlteG1qemFlb3lpa3V1d2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MzMyNzEsImV4cCI6MjEwNzQwOTI3MX0.lL2cNc0Q_rGOaSy8rtSLPSOU9dZ57Yw1C4MoMmd9jjo';
  const rpc = async (fn, body) => { const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const x = await r.text(); if (!r.ok) throw new Error(x); return x ? JSON.parse(x) : null; };
  let PF = null, PFS = '', PFERR = false, LMSG = null;
  const UP = [];   // ما رُفع في هذه الجلسة: {n, st: 'up'|'ok'|'fail', err}
  const me = () => D.teachers[0];
  const pid = async () => teacherId(phoneOf(sessionCode));
  async function pfLoad() {
    const sc = sessionCode; if (PF && PFS === sc) return;
    try { const d = await rpc('pf_get_by_pid', { p_pid: await pid() }); if (sc !== sessionCode) return; PF = d || {}; PFERR = false; }
    catch { PF = {}; PFERR = true; }
    PFS = sc; redraw();
  }
  const I = p => `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const fmtD = iso => { if (!iso) return ''; iso = String(iso).slice(0, 10); try { const P = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(new Date(iso + 'T12:00:00')), g = k => (P.find(q => q.type === k) || {}).value;
    return AR([g('day'), g('month'), g('year')].join('/')) + 'هـ'; } catch { return iso; } };   // هجري، اليوم يمين

  function render() {
    if (!PF || PFS !== sessionCode) setTimeout(pfLoad);
    const t = me(), box = t.rr, files = box ? box.files : [], link = PF && PF.p3 && PF.p3.url;
    const has = files.length || link;
    const rows = files.map(f => `<div class="p3r"><span class="fi">${esc((f.x || 'ملف').toUpperCase())}</span>
        <span class="nm"><b>${esc(f.n.split(' / ').pop().replace(/^م\s*\d+\s*-\s*/, ''))}</b><small>${f.d ? 'أُرفق ' + fmtD(f.d) : ''}</small></span>
        <a class="b3" href="${esc(wFileUrl(box.url, f.n.split(' / ').join('/')))}" target="_blank" rel="noopener">فتح السجل</a></div>`).join('')
      + (link ? `<div class="p3r"><span class="fi">${I('<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>')}</span>
        <span class="nm"><b dir="ltr" style="text-align:right">${esc(link)}</b><small>رابط سجل الإنجاز${PF.p3.at ? '، حُفظ ' + fmtD(PF.p3.at) : ''}</small></span>
        <a class="b3" href="${esc(link)}" target="_blank" rel="noopener">فتح الرابط</a><button type="button" class="b3 dl" data-p3-del>حذف الرابط</button></div>` : '');
    return `<div class="p3" id="p3Root">
      <div class="p3h"><span class="ic">${I('<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="m9 14 2 2 4-4"/>')}</span>
        <div><h2>سجل توثيق الأداء الوظيفي، نموذج ب</h2><p>إذا كان سجلك جاهزًا، أرفقيه هنا ملف PDF أو رابطًا، وارجعي له متى شئتِ من هذا الزر.</p></div></div>
      ${has || UP.length ? `<div class="p3c"><h3>سجلي الجاهز</h3>${rows}
        ${UP.map(f => `<span class="uq">${f.st === 'up' ? '⏳' : f.st === 'ok' ? '✓' : '✗'} ${esc(f.n)}${f.st === 'ok' ? '، يظهر هنا خلال دقائق' : f.err ? '، ' + esc(f.err) : ''}</span>`).join('')}
        ${box && box.url ? `<div class="p3f" style="margin-top:12px"><a class="b3 gh" href="${esc(box.url)}" target="_blank" rel="noopener">فتح المجلد في OneDrive</a></div>` : ''}</div>` : ''}
      <div class="two">
        <div class="p3c"><h3>إرفاق ملف PDF</h3><p class="p3e" style="margin-bottom:12px">ملف واحد أو أكثر، حتى ٢٠ م.ب للملف.</p>
          ${D.inbox ? `<label class="b3">اختيار ملف PDF<input type="file" accept=".pdf,application/pdf" multiple hidden data-p3-in></label>` : '<p class="p3e">الرفع غير متاح حاليًا.</p>'}</div>
        <div class="p3c"><h3>${link ? 'تغيير الرابط' : 'إضافة رابط'}</h3><p class="p3e" style="margin-bottom:12px">رابط سجل إنجازك (Google Drive أو OneDrive أو موقع).</p>
          <div class="lk"><input id="p3L" type="url" placeholder="https://" value="${esc(link || '')}" aria-label="رابط السجل"><button type="button" class="b3" data-p3-save>حفظ الرابط</button></div>
          <span id="p3M" class="msg${LMSG ? ' ' + LMSG[0] : ''}">${LMSG ? esc(LMSG[1]) : PFERR ? 'حفظ الرابط غير متاح حاليًا' : ''}</span></div>
      </div></div>`;
  }
  function redraw() { const r = document.getElementById('p3Root'); if (r) r.outerHTML = render(); }

  async function saveLink(url) {
    const btn = document.querySelector('[data-p3-save]'); if (btn) btn.disabled = true;
    const next = { ...(PF || {}) }; if (url) next.p3 = { url, at: new Date().toISOString().slice(0, 10) }; else delete next.p3;
    try { await rpc('pf_save_by_pid', { p_pid: await pid(), p_data: next }); PF = next; LMSG = ['ok', url ? 'تم حفظ الرابط ✓' : 'تم حذف الرابط']; }
    catch { LMSG = ['err', 'ما تم الحفظ، تحقّقي من الاتصال']; }
    redraw();
  }
  async function upload(list) {
    const t = me(), items = [...list].map(file => ({ file, n: file.name, st: 'up', err: !/\.pdf$/i.test(file.name) ? 'الملف ليس PDF' : file.size > UP_MAX ? 'أكبر من ٢٠ م.ب' : '' }));
    items.forEach(it => { if (it.err) it.st = 'fail'; UP.push(it); }); redraw();
    for (const it of items.filter(it => it.st === 'up')) {
      try { await sealUpload(it.file, KEY, t); it.st = 'ok'; }
      catch (e) { it.st = 'fail'; it.err = e.message === 'gh401' || e.message === 'gh403' ? 'الرفع غير متاح حاليًا' : 'تحقّقي من الاتصال'; }
      redraw();
    }
  }
  document.addEventListener('change', e => { const i = e.target.closest('input[data-p3-in]'); if (i && i.files.length) upload(i.files); });
  document.addEventListener('click', e => {
    if (e.target.closest('[data-p3-save]')) {
      const v = document.getElementById('p3L').value.trim();
      if (!/^https?:\/\/\S+\.\S+/i.test(v)) { LMSG = ['err', 'اكتبي رابطًا يبدأ بـ https://']; return redraw(); }
      return saveLink(v);
    }
    if (e.target.closest('[data-p3-del]') && confirm('حذف رابط السجل؟')) saveLink('');
  });
  window.P3 = { render };
})();
