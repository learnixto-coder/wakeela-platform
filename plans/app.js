(function(){'use strict';
const PLANS_CSS = "/* Layout: the school platform's own shell (green sticky header + tab strip) wrapping a\n   summary-first plans register: overview → programs → improvement plan → original pages.\n   Style: Minimalism / Swiss (ui-ux-pro-max), platform tokens, mobile-first breakpoints 375/768/1024/1440. */\n:host{display:block;\n  --bg:#f4f6f5; --card:#fff; --ink:#17201d; --muted:#5f6b67; --faint:#86928e; --line:#e2e7e5; --soft:#eef2f0;\n  --brand:#0f5c4d; --brand-2:#13786a; --brand-ink:#fff; --brand-soft:#dcefe9;\n  --s-crit:#c0392b; --s-high:#d9712c; --s-mh:#d4a017; --s-mid:#c4b42a; --s-dev:#6aae86; --s-keep:#2e8b57;\n  --none:#b3261e; --shadow:0 1px 2px rgba(16,24,20,.06),0 4px 14px rgba(16,24,20,.05);\n  --r:14px; --font:\"IBM Plex Sans Arabic\",system-ui,\"Segoe UI\",Tahoma,sans-serif;\n}\n@media (prefers-color-scheme:dark){:host(:not(.light)){\n  color-scheme:dark;\n  --bg:#0f1513; --card:#18201d; --ink:#e8eeec; --muted:#9aa8a3; --faint:#74827d; --line:#2a3531; --soft:#1f2925;\n  --brand:#2fa58c; --brand-2:#3bbfa3; --brand-ink:#06201a; --brand-soft:#173a32; --none:#ff8a80; --shadow:none;\n}}\n:host(.dark){\n  color-scheme:dark;\n  --bg:#0f1513; --card:#18201d; --ink:#e8eeec; --muted:#9aa8a3; --faint:#74827d; --line:#2a3531; --soft:#1f2925;\n  --brand:#2fa58c; --brand-2:#3bbfa3; --brand-ink:#06201a; --brand-soft:#173a32; --none:#ff8a80; --shadow:none;\n}\n*{box-sizing:border-box}\n.root{background:var(--bg);color:var(--ink);font:15px/1.7 var(--font);-webkit-text-size-adjust:100%;direction:rtl;text-align:right}\nh1,h2,h3{margin:0;line-height:1.45;text-wrap:balance}\nh2{font-size:18px;font-weight:700}\nh3{font-size:15.5px;font-weight:700}\np{margin:0}\nbutton,input,select{font:inherit;color:inherit}\nbutton{cursor:pointer}\na{color:var(--brand-2)}\n[hidden]{display:none!important}\n:focus-visible{outline:2px solid var(--brand-2);outline-offset:2px;border-radius:6px}\n.num{font-variant-numeric:tabular-nums}\n.wrap{max-width:1180px;margin-inline:auto;padding-inline:16px}\n@media (min-width:768px){.wrap{padding-inline:24px}}\n\n/* lock (same look as the platform) */\n.lock{min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px 16px}\n.lock-box{width:100%;max-width:380px;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:28px 22px;box-shadow:var(--shadow);text-align:center}\n.logo{width:56px;height:56px;border-radius:16px;background:var(--brand);color:var(--brand-ink);display:grid;place-items:center;margin:0 auto 12px}\n.lock h1{font-size:20px;margin-bottom:4px}\n.lock p{color:var(--muted);margin-bottom:18px;font-size:14px}\n.field{width:100%;min-height:48px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--soft);text-align:center;letter-spacing:2px;font-size:17px;direction:ltr}\n.check{display:flex;gap:8px;align-items:center;justify-content:center;margin:12px 0 16px;color:var(--muted);font-size:14px}\n.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;text-decoration:none;border:0;border-radius:12px;padding:10px 16px;background:var(--brand);color:var(--brand-ink);font-weight:600}\n.btn.wide{width:100%}\n.btn:disabled{opacity:.55;cursor:wait}\n.btn.ghost{background:var(--card);color:var(--brand-2);border:1px solid var(--brand-2)}\n.btn[aria-disabled=\"true\"]{background:var(--soft);color:var(--faint);pointer-events:none}\n.err{color:var(--none);font-size:14px;min-height:22px;margin-top:10px}\n\n/* shell */\nheader.top{position:sticky;top:0;z-index:6;background:var(--brand);color:var(--brand-ink);padding-top:env(safe-area-inset-top,0px)}\n.top-in{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;padding-block:12px}\n.top h1{font-size:17px}\n.top small{display:block;opacity:.88;font-size:12.5px;line-height:1.6}\n.top .sp{flex:1}\n.back-btn{display:inline-flex;align-items:center;gap:6px;min-height:40px;background:#fff;color:var(--brand);border-radius:10px;padding:0 14px;font-weight:700;font-size:14px;text-decoration:none;white-space:nowrap}\nnav.tabs{background:var(--card);border-bottom:1px solid var(--line);position:sticky;z-index:5}\n.tabs .wrap{display:flex;overflow-x:auto;scrollbar-width:none;padding-inline:8px}\n.tabs .wrap::-webkit-scrollbar{display:none}\n.tab{flex:0 0 auto;min-height:46px;background:none;border:0;padding:0 14px;color:var(--muted);font-weight:500;border-bottom:3px solid transparent;white-space:nowrap}\n.tab[aria-selected=\"true\"]{color:var(--brand-2);border-color:var(--brand-2);font-weight:600}\n.tab:hover{color:var(--ink)}\n\nmain{padding-block:18px calc(env(safe-area-inset-bottom,0px) + 48px)}\nsection.view{display:grid;gap:24px}\n.block{display:grid;gap:12px;min-width:0;align-content:start}\n.block-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:4px 16px}\n.sub{color:var(--muted);font-size:13.5px}\n.card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);min-width:0}\n.pad{padding:14px 16px}\n@media (min-width:768px){.pad{padding:18px 20px}}\n.link{background:none;border:0;padding:4px 0;color:var(--brand-2);font-weight:600;text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px;font-size:13.5px}\n.note{font-size:12.5px;color:var(--faint)}\n.people{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:14px}\n.people span{color:var(--muted)}\n.people b{font-weight:600;color:var(--ink)}\n\n/* tiles */\n.tiles{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}\n@media (min-width:768px){.tiles{grid-template-columns:repeat(3,1fr)}}\n@media (min-width:1024px){.tiles{grid-template-columns:repeat(5,1fr)}}\n.tile{padding:14px;display:grid;gap:2px;align-content:start}\n.tile .k{font-size:13px;color:var(--muted)}\n.tile .v{font-size:26px;font-weight:700;line-height:1.3}\n.tile .v small{font-size:15px;font-weight:500;color:var(--muted)}\n.tile .n{font-size:12px;color:var(--faint)}\n\n/* indicator chart */\n.ind-row{display:grid;grid-template-columns:30px 1fr;gap:6px 12px;align-items:center;padding:12px 0;border-top:1px solid var(--line)}\n.ind-row:first-child{border-top:0;padding-top:0}\n.ind-row > .barline,.ind-row > .pr,.ind-row > .ind-act,.ind-row > .ind-progs{grid-column:2}\n@media (min-width:1024px){\n  .ind-row{grid-template-columns:34px minmax(160px,1.1fr) minmax(200px,2fr) 140px}\n  .ind-row > .barline,.ind-row > .pr{grid-column:auto}\n  .ind-row > .ind-act,.ind-row > .ind-progs{grid-column:2 / -1}\n}\n.ind-scale{display:none}\n@media (min-width:1024px){.ind-scale{display:grid;grid-template-columns:34px minmax(160px,1.1fr) minmax(200px,2fr) 140px;gap:12px;font-size:11.5px;color:var(--faint);padding-bottom:6px}\n  .ind-scale .ticks{display:flex;justify-content:space-between;padding-inline-end:68px}}\n.rank{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:600;background:var(--soft);color:var(--muted)}\n.ind-name b{display:block;font-weight:600;line-height:1.45}\n.ind-name span{font-size:12.5px;color:var(--faint)}\n.track{position:relative;height:10px;background:var(--soft);border-radius:6px;overflow:hidden}\n.fill{position:absolute;inset-block:0;right:0;border-radius:6px;background:var(--brand-2)}\n.barline{display:flex;align-items:center;gap:10px}\n.barline .track{flex:1}\n.barline .val{min-width:60px;font-weight:600;font-size:14px;text-align:left}\n.ind-act{font-size:13.5px;color:var(--muted);max-width:80ch}\n.ind-progs{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:13px;color:var(--muted)}\n\n.chip{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;padding:2px 10px 3px;border-radius:999px;white-space:nowrap;border:1px solid var(--line);background:var(--card);color:var(--ink)}\n.chip i{width:8px;height:8px;border-radius:50%;flex:none}\n.pchip{min-height:32px;background:var(--brand-soft);border-color:transparent;color:var(--brand-2);font-weight:600;padding:3px 12px}\n.pchip:hover{background:var(--brand-2);color:var(--brand-ink)}\n\n.cols{display:grid;grid-template-columns:1fr;gap:16px}\n@media (min-width:900px){.cols{grid-template-columns:1fr 1fr}}\n.lbl{font-size:12.5px;color:var(--brand-2);font-weight:700}\n.vm{display:grid;gap:14px}\n.vm p{max-width:65ch}\n.values{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px 18px}\n.values b{font-weight:600}\n.values p{font-size:13.5px;color:var(--muted)}\n\n/* tables (cards under 768px — ui-ux-pro-max «Table Handling») */\n.tbl-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:var(--r);background:var(--card);box-shadow:var(--shadow)}\ntable{border-collapse:collapse;width:100%;font-size:14px}\nth{font-weight:600;font-size:12.5px;color:var(--muted);text-align:right;padding:10px 12px;background:var(--soft);white-space:nowrap}\ntd{padding:11px 12px;border-top:1px solid var(--line);vertical-align:top}\ntr.click{cursor:pointer}\ntr.click:hover td{background:var(--brand-soft)}\nth button{background:none;border:0;padding:0;font-weight:600;color:inherit}\nth button::after{content:\" ↕\";color:var(--faint)}\nth button[data-dir=\"asc\"]::after{content:\" ↑\";color:var(--brand-2)}\nth button[data-dir=\"desc\"]::after{content:\" ↓\";color:var(--brand-2)}\n.pname{font-weight:600}\n@media (min-width:768px){.stack td.t{min-width:150px}}\n.small{font-size:12.5px;color:var(--faint)}\n.mini{display:flex;align-items:center;gap:8px;min-width:120px}\n.mini .track{height:8px;flex:1}\n.ev0{color:var(--none);font-weight:600}\n@media (max-width:767px){\n  .stack thead{display:none}\n  .stack, .stack tbody, .stack tr, .stack td{display:block;width:100%}\n  .stack-wrap{border:0;background:none;box-shadow:none;overflow:visible}\n  .stack tr{background:var(--card);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);padding:12px 14px;margin-bottom:10px}\n  .stack td{border:0;padding:3px 0;display:grid;grid-template-columns:110px 1fr;gap:10px;align-items:start}\n  .stack td::before{content:attr(data-l);color:var(--faint);font-size:12.5px}\n  .stack td.t{display:block;padding-bottom:6px}\n  .stack td.t::before{content:none}\n  .stack tr.click:hover td{background:none}\n}\n\n/* filters */\n.filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.fbtn{min-height:38px;border:1px solid var(--line);background:var(--card);border-radius:999px;padding:4px 14px;font-size:14px}\n.fbtn[aria-pressed=\"true\"]{background:var(--brand);border-color:var(--brand);color:var(--brand-ink)}\n.search{flex:1 1 220px;max-width:380px;min-height:44px;border:1px solid var(--line);background:var(--card);border-radius:12px;padding:8px 14px;font-size:15px}\n\n/* improvement */\n.facts{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:var(--r);overflow:hidden}\n@media (min-width:768px){.facts{grid-template-columns:repeat(3,1fr)}}\n@media (min-width:1024px){.facts{grid-template-columns:repeat(6,1fr)}}\n.facts div{background:var(--card);padding:12px 14px}\n.facts .k{font-size:12.5px;color:var(--muted)}\n.facts .v{font-weight:700;font-size:19px}\n.urgent{display:grid;gap:12px;align-content:start}\n.urow{display:grid;gap:6px}\n@media (min-width:768px){.urow{grid-template-columns:1fr minmax(180px,250px);gap:16px;align-items:center}}\n.swot{display:grid;grid-template-columns:1fr;gap:12px}\n@media (min-width:768px){.swot{grid-template-columns:1fr 1fr}}\n.swot h3{display:flex;align-items:center;gap:8px;margin-bottom:6px}\n.swot ul{margin:0;padding-inline-start:18px;display:grid;gap:4px;font-size:14px}\n.mark{width:10px;height:10px;border-radius:3px;flex:none}\n.prow{display:grid;gap:4px 16px;padding:12px 0;border-top:1px solid var(--line)}\n.prow:first-child{border-top:0;padding-top:0}\n@media (min-width:768px){.prow{grid-template-columns:140px 130px 1fr}}\n.prow p{font-size:13.5px;color:var(--muted);max-width:80ch}\n.dom{display:grid;gap:4px}\n.dom-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px}\n.el{display:grid;gap:6px 18px;padding:14px 0;border-top:1px solid var(--line)}\n.dom-head + .el{border-top:0}\n@media (min-width:900px){.el{grid-template-columns:200px 1fr}}\n.el .t{font-weight:700}\n.el dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:14px}\n.el dt{color:var(--faint);white-space:nowrap;font-size:13px}\n.el dd{margin:0}\n.chips{display:flex;flex-wrap:wrap;gap:6px}\nol.recs{margin:0;padding-inline-start:22px;display:grid;gap:6px;font-size:14.5px;max-width:90ch}\n\n/* original pages viewer */\n.docsw{display:flex;gap:8px;flex-wrap:wrap}\n.viewer{display:grid;grid-template-columns:1fr;gap:14px;align-items:start}\n@media (min-width:1024px){.viewer{grid-template-columns:250px 1fr}}\n.toc{display:none}\n@media (min-width:1024px){.toc{display:grid;gap:2px;position:sticky;top:120px;max-height:calc(100vh - 140px);overflow:auto;padding:8px}}\n.toc button{background:none;border:0;text-align:right;padding:7px 10px;border-radius:8px;font-size:14px;display:flex;justify-content:space-between;gap:8px;color:var(--muted)}\n.toc button:hover{background:var(--soft);color:var(--ink)}\n.toc button[aria-current=\"true\"]{background:var(--brand-soft);color:var(--brand-2);font-weight:600}\n.toc .pg{color:var(--faint);font-size:12.5px}\n.tocsel{width:100%;min-height:44px;border:1px solid var(--line);background:var(--card);border-radius:12px;padding:8px 12px}\n@media (min-width:1024px){.tocsel{display:none}}\n.vbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;justify-content:space-between;margin-block:10px}\n.vbar .grp{display:flex;align-items:center;gap:8px}\n.ibtn{min-height:44px;min-width:44px;border:1px solid var(--line);background:var(--card);border-radius:12px;padding:6px 14px;font-size:14px}\n.ibtn:disabled{opacity:.4;cursor:default}\n.pgin{width:70px;min-height:44px;border:1px solid var(--line);background:var(--card);border-radius:12px;padding:6px 8px;text-align:center}\n.page{display:block;width:100%;max-width:100%;height:auto;aspect-ratio:var(--ar,16/9);border:1px solid var(--line);border-radius:8px;background:#fff;object-fit:contain}\n.page.loading{background:var(--soft) linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent) 0 0/40% 100% no-repeat;animation:sh 1.2s infinite}\n@keyframes sh{to{background-position:140% 0}}\n\n/* program dialog: full screen on phones */\ndialog{border:0;padding:0;border-radius:16px;width:min(980px,calc(100vw - 32px));max-height:calc(100dvh - 32px);background:var(--card);color:var(--ink)}\n@media (max-width:767px){dialog{width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;margin:0;border-radius:0}}\ndialog::backdrop{background:rgba(6,20,16,.55)}\n.dlg-head{position:sticky;top:0;background:var(--brand);color:var(--brand-ink);padding:calc(env(safe-area-inset-top,0px) + 14px) 18px 14px;display:flex;justify-content:space-between;gap:12px;align-items:flex-start;z-index:1}\n.dlg-head .small{color:inherit;opacity:.85}\n.dlg-head h2{font-size:19px}\n.x{flex:none;min-height:40px;background:rgba(255,255,255,.16);border:0;border-radius:10px;color:inherit;padding:0 14px;font-weight:600}\n.dlg-body{padding:16px 18px calc(env(safe-area-inset-bottom,0px) + 24px);display:grid;gap:16px}\n.kv{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden}\n@media (min-width:768px){.kv{grid-template-columns:repeat(4,1fr)}}\n.kv div{background:var(--card);padding:10px 12px}\n.kv .k{font-size:12px;color:var(--faint)}\n.kv .v{font-weight:600}\n.steps{margin:0;padding-inline-start:22px;display:grid;gap:3px;font-size:14.5px}\n.btns{display:flex;flex-wrap:wrap;gap:10px}\n.foot{margin-top:28px;color:var(--faint);font-size:12.5px;text-align:center}\n/* inside the school platform page: its header, tabs and side padding are already there */\n.embed{background:none}\n.embed header.top{display:none}\n.embed .wrap{max-width:none;padding-inline:0}\n.embed main{padding-block:4px 24px}\n.embed nav.tabs{position:static;background:none;margin-bottom:6px}\n.embed .lock{min-height:0;padding-block:32px}\n@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}\n\n/* timeline (Gantt: months × weeks, like the ministry form; month colours from the form) */\n.tl-bar{justify-content:space-between;align-items:center}\n.tl-legend{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;color:var(--muted)}\n.tl-legend span{display:inline-flex;align-items:center;gap:6px}\n.sw{display:inline-block;width:14px;height:14px;border-radius:3px}\n.sw.done{background:var(--tl-done)} .sw.next{background:var(--tl-next)} .sw.now{width:3px;height:16px;border-radius:2px;background:var(--s-crit)}\n:host{--tl-done:#1f7a72;--tl-next:#9ed3cc;--tl-ink:#17201d}\n:host(.dark){--tl-done:#2fa58c;--tl-next:#24514a}\n@media (prefers-color-scheme:dark){:host(:not(.light)){--tl-done:#2fa58c;--tl-next:#24514a}}\n.tl-wrap{overflow-x:auto;padding:0}\n.tl{border-collapse:separate;border-spacing:0;font-size:12.5px;width:max-content;min-width:100%}\n.tl th,.tl td{border-top:0;border-left:1px solid var(--line);border-bottom:1px solid var(--line);padding:0;text-align:center;vertical-align:middle;white-space:nowrap}\n.tl thead th{background:var(--soft);color:var(--muted);font-weight:600;font-size:11.5px;padding:4px 2px}\n.tl thead th.mo{color:var(--tl-ink);font-size:12px;padding:6px 4px}\n.tl thead th.mo.dk{color:#fff}\n.tl thead th.wk{color:var(--tl-ink);font-weight:500}\n.tl .wkn{min-width:22px;font-size:11px}\n.tl .c-no,.tl .c-name,.tl .c-d{position:sticky;z-index:1;background:var(--card)}\n.tl thead .c-no,.tl thead .c-name,.tl thead .c-d{background:var(--soft);z-index:2}\n.tl .c-no{right:0;width:34px;min-width:34px}\n.tl .c-name{right:34px;min-width:150px;max-width:190px;text-align:right;padding:6px 10px;white-space:normal;font-weight:600;font-size:13px}\n.tl .c-d{font-size:12px;padding:4px 8px;color:var(--muted);position:static}\n.tl .c-name button{all:unset;cursor:pointer;color:var(--ink)}\n.tl .c-name button:hover{color:var(--brand-2);text-decoration:underline}\n.tl .c-name button:focus-visible{outline:2px solid var(--brand-2);outline-offset:2px;border-radius:4px}\n.tl td.c{width:22px;min-width:22px;height:30px}\n.tl td.on{background:var(--tl-next)} .tl td.on.past{background:var(--tl-done)}\n.tl .now{box-shadow:inset -3px 0 0 var(--s-crit)}\n.tl tbody tr:hover td.c-no,.tl tbody tr:hover td.c-name,.tl tbody tr:hover td.c-d{background:var(--brand-soft)}\n.tl .st{display:block;font-weight:500;font-size:11px;color:var(--faint)}\n.tl .st.run{color:var(--brand-2)} .tl .st.end{color:var(--s-high)}\n@media (max-width:767px){.tl .c-name{min-width:118px;max-width:130px;font-size:12px}.tl .c-d{display:none}}\n\n/* one view as its own platform page (mountPlans opt.only): no inner tabs, no links into other views */\n.only nav.tabs{display:none}\n.only [data-open]{display:none}\n";
const PLANS_HTML = "\n<section class=\"lock\" id=\"lock\" hidden>\n  <form class=\"lock-box\" id=\"lockForm\">\n    <div class=\"logo\"><svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 3v18h18\"/><path d=\"M7 15l4-4 3 3 5-6\"/><\/svg><\/div>\n    <h1>لوحة الخطط ١٤٤٨هـ<\/h1>\n    <p>الخطة التشغيلية وخطة التحسين · المتوسطة الحادية والعشرون<\/p>\n    <input class=\"field\" id=\"code\" autocomplete=\"current-password\" placeholder=\"رمز الاطلاع\" autocapitalize=\"characters\" spellcheck=\"false\" aria-label=\"رمز الاطلاع\">\n    <label class=\"check\"><input type=\"checkbox\" id=\"remember\" checked> تذكّر الرمز على هذا الجهاز<\/label>\n    <button class=\"btn wide\" id=\"go\">دخول<\/button>\n    <div class=\"err\" id=\"err\" role=\"alert\"><\/div>\n  <\/form>\n<\/section>\n\n<div id=\"app\" hidden>\n<header class=\"top\">\n  <div class=\"wrap top-in\">\n    <div>\n      <h1>لوحة الخطة التشغيلية وخطة التحسين ١٤٤٨هـ<\/h1>\n      <small id=\"hMeta\"><\/small>\n    <\/div>\n  <\/div>\n<\/header>\n<nav class=\"tabs\" aria-label=\"أقسام اللوحة\">\n  <div class=\"wrap\" role=\"tablist\">\n    <button class=\"tab\" role=\"tab\" aria-selected=\"true\" data-v=\"overview\">نظرة عامة<\/button>\n    <button class=\"tab\" role=\"tab\" aria-selected=\"false\" data-v=\"programs\">الخطة التشغيلية<\/button>\n    <button class=\"tab\" role=\"tab\" aria-selected=\"false\" data-v=\"timeline\">الخطة الزمنية<\/button>\n    <button class=\"tab\" role=\"tab\" aria-selected=\"false\" data-v=\"improve\">خطة التحسين<\/button>\n    <button class=\"tab\" role=\"tab\" aria-selected=\"false\" data-v=\"files\">الملفات الأصلية<\/button>\n  <\/div>\n<\/nav>\n\n<main class=\"wrap\">\n  <section class=\"view\" id=\"v-overview\">\n    <div class=\"tiles\" id=\"tiles\"><\/div>\n    <div class=\"block\">\n      <div class=\"block-head\">\n        <h2>مؤشرات الأداء وأولويات المعالجة<\/h2>\n        <span class=\"sub\">نسب مجالات تقرير الأداء مرتبة حسب أولوية المعالجة في الخطة · <button class=\"link\" data-open=\"op:44\">صفحة الأولويات<\/button><\/span>\n      <\/div>\n      <div class=\"card pad\">\n        <div class=\"ind-scale num\" aria-hidden=\"true\"><span><\/span><span><\/span><span class=\"ticks\"><span>٠٪<\/span><span>٢٥٪<\/span><span>٥٠٪<\/span><span>٧٥٪<\/span><span>١٠٠٪<\/span><\/span><span><\/span><\/div>\n        <div id=\"ind\"><\/div>\n      <\/div>\n    <\/div>\n    <div class=\"block\">\n      <div class=\"block-head\"><h2>البرامج حسب محاور الخطة<\/h2><span class=\"sub\">اضغطي على المحور لعرض برامجه<\/span><\/div>\n      <div class=\"tbl-wrap stack-wrap\"><table class=\"stack\">\n        <thead><tr><th>المحور<\/th><th>عدد البرامج<\/th><th>متوسط نسبة تحقق الأهداف (مرحلية)<\/th><th>ملفات الشواهد<\/th><th>برامج بلا شواهد<\/th><\/tr><\/thead>\n        <tbody id=\"axes\"><\/tbody>\n      <\/table><\/div>\n    <\/div>\n    <div class=\"cols\">\n      <div class=\"card pad vm\">\n        <div><div class=\"lbl\">الرؤية<\/div><p id=\"vision\"><\/p><\/div>\n        <div><div class=\"lbl\">الرسالة<\/div><p id=\"mission\"><\/p><\/div>\n        <div><div class=\"lbl\">الشعار<\/div><p id=\"slogan\" style=\"font-weight:700;font-size:17px\"><\/p><\/div>\n      <\/div>\n      <div class=\"card pad\" style=\"display:grid;gap:12px;align-content:start\">\n        <div class=\"lbl\">القيم<\/div>\n        <div class=\"values\" id=\"values\"><\/div>\n      <\/div>\n    <\/div>\n  <\/section>\n\n  <section class=\"view\" id=\"v-programs\" hidden>\n    <div class=\"block\">\n      <div class=\"block-head\">\n        <h2>برامج الخطة التشغيلية<\/h2>\n        <span class=\"sub\" id=\"progSub\"><\/span>\n      <\/div>\n      <div class=\"card pad people\" id=\"opPeople\"><\/div>\n      <div class=\"filters\" id=\"axisFilters\"><\/div>\n      <div class=\"filters\"><input class=\"search\" id=\"q\" type=\"search\" placeholder=\"ابحثي باسم البرنامج أو المعلمة أو المالك\" aria-label=\"بحث في البرامج\"><span class=\"sub\" id=\"shown\"><\/span><\/div>\n      <div class=\"tbl-wrap stack-wrap\"><table class=\"stack\">\n        <thead><tr>\n          <th><button data-sort=\"i\">م<\/button><\/th>\n          <th>البرنامج<\/th>\n          <th>المحور / المجال<\/th>\n          <th>المعلمات المنفذات<\/th>\n          <th><button data-sort=\"base\">خط الأساس ← المستهدف<\/button><\/th>\n          <th><button data-sort=\"goal_pct\">نسبة تحقق الأهداف<\/button><\/th>\n          <th><button data-sort=\"evidence\">الشواهد<\/button><\/th>\n        <\/tr><\/thead>\n        <tbody id=\"progRows\"><\/tbody>\n      <\/table><\/div>\n      <p class=\"note\" id=\"progNote\"><\/p>\n    <\/div>\n  <\/section>\n\n  <section class=\"view\" id=\"v-timeline\" hidden>\n    <div class=\"block\">\n      <div class=\"block-head\">\n        <h2>الخطة الزمنية لبرامج وأنشطة الخطة التشغيلية ١٤٤٨هـ<\/h2>\n        <span class=\"sub\" id=\"tlSub\"><\/span>\n      <\/div>\n      <div class=\"tiles\" id=\"tlTiles\"><\/div>\n      <div class=\"filters tl-bar\">\n        <div class=\"tl-legend\">\n          <span><i class=\"sw done\"><\/i>منفَّذ حتى الآن<\/span>\n          <span><i class=\"sw next\"><\/i>مخطَّط (مستمر)<\/span>\n          <span><i class=\"sw now\"><\/i>الأسبوع الحالي<\/span>\n        <\/div>\n        <div class=\"btns\" id=\"tlFiles\"><\/div>\n      <\/div>\n      <div class=\"tl-wrap card\" tabindex=\"0\" aria-label=\"جدول الخطة الزمنية، مرّري أفقيًا لعرض بقية الأشهر\"><table class=\"tl\" id=\"tl\"><\/table><\/div>\n      <p class=\"note\" id=\"tlNote\"><\/p>\n    <\/div>\n  <\/section>\n\n  <section class=\"view\" id=\"v-improve\" hidden>\n    <div class=\"block\">\n      <div class=\"block-head\"><h2>البيانات الأساسية<\/h2><button class=\"link\" data-open=\"imp:3\">صفحة البيانات الأساسية<\/button><\/div>\n      <div class=\"facts\" id=\"facts\"><\/div>\n    <\/div>\n    <div class=\"cols\">\n      <div class=\"block\">\n        <div class=\"block-head\"><h2>الأولويات العاجلة<\/h2><button class=\"link\" data-open=\"imp:8\">الصفحة<\/button><\/div>\n        <div class=\"card pad urgent\" id=\"urgent\"><\/div>\n      <\/div>\n      <div class=\"block\">\n        <div class=\"block-head\"><h2>أولوية المجالات<\/h2><button class=\"link\" data-open=\"imp:7\">الصفحة<\/button><\/div>\n        <div class=\"card pad\" id=\"prio\"><\/div>\n      <\/div>\n    <\/div>\n    <div class=\"block\">\n      <div class=\"block-head\"><h2>تحليل واقع المدرسة<\/h2><span class=\"sub\"><button class=\"link\" data-open=\"imp:5\">نقاط القوة والضعف<\/button> · <button class=\"link\" data-open=\"imp:6\">الفرص والتهديدات<\/button><\/span><\/div>\n      <div class=\"swot\" id=\"swot\"><\/div>\n    <\/div>\n    <div class=\"block\">\n      <div class=\"block-head\"><h2>بناء خطة التحسين في مجالات الممارسات الإشرافية<\/h2><span class=\"sub\">اضغطي على البرنامج لعرض تفاصيله وشواهده<\/span><\/div>\n      <div id=\"plan\" style=\"display:grid;gap:14px\"><\/div>\n    <\/div>\n    <div class=\"cols\">\n      <div class=\"block\">\n        <div class=\"block-head\"><h2>تحسين الخطة وتطويرها<\/h2><button class=\"link\" data-open=\"imp:37\">الصفحة<\/button><\/div>\n        <div class=\"tbl-wrap stack-wrap\"><table class=\"stack\"><thead><tr><th>البرنامج<\/th><th>إجراء تحسين الخطة<\/th><\/tr><\/thead><tbody id=\"actions\"><\/tbody><\/table><\/div>\n      <\/div>\n      <div class=\"block\">\n        <div class=\"block-head\"><h2>التوصيات<\/h2><button class=\"link\" data-open=\"imp:38\">الصفحة<\/button><\/div>\n        <div class=\"card pad\"><ol class=\"recs\" id=\"recs\"><\/ol><\/div>\n      <\/div>\n    <\/div>\n    <p class=\"note\">نماذج متابعة التنفيذ (ص ١٨–٢٢) وتقويم خطة التحسين (ص ٢٣–٣٦) معروضة كاملة في «الملفات الأصلية».<\/p>\n  <\/section>\n\n  <section class=\"view\" id=\"v-files\" hidden>\n    <div class=\"block-head\">\n      <h2 id=\"docTitle\"><\/h2>\n      <div class=\"docsw\" role=\"group\" aria-label=\"اختيار الملف\">\n        <button class=\"fbtn\" id=\"d-op\" data-doc=\"op\" aria-pressed=\"true\">الخطة التشغيلية<\/button>\n        <button class=\"fbtn\" id=\"d-imp\" data-doc=\"imp\" aria-pressed=\"false\">خطة التحسين<\/button>\n      <\/div>\n    <\/div>\n    <div class=\"viewer\">\n      <nav class=\"card toc\" id=\"toc\" aria-label=\"محتويات الملف\"><\/nav>\n      <div style=\"min-width:0\">\n        <select class=\"tocsel\" id=\"tocsel\" aria-label=\"الانتقال إلى قسم\"><\/select>\n        <div class=\"vbar\">\n          <div class=\"grp\">\n            <button class=\"ibtn\" id=\"prev\" aria-label=\"الصفحة السابقة\">→ السابقة<\/button>\n            <button class=\"ibtn\" id=\"next\" aria-label=\"الصفحة التالية\">التالية ←<\/button>\n          <\/div>\n          <div class=\"grp sub\">صفحة <input class=\"pgin num\" id=\"pgin\" type=\"number\" min=\"1\" inputmode=\"numeric\" aria-label=\"رقم الصفحة\"> من <span id=\"pgcount\" class=\"num\"><\/span><\/div>\n        <\/div>\n        <img class=\"page\" id=\"pageImg\" alt=\"\">\n      <\/div>\n    <\/div>\n  <\/section>\n  <p class=\"foot\" id=\"foot\"><\/p>\n<\/main>\n<\/div>\n\n<dialog id=\"dlg\" aria-labelledby=\"dlgTitle\">\n  <div class=\"dlg-head\">\n    <div><div class=\"small\" id=\"dlgEyebrow\"><\/div><h2 id=\"dlgTitle\"><\/h2><\/div>\n    <button class=\"x\" id=\"dlgClose\">إغلاق<\/button>\n  <\/div>\n  <div class=\"dlg-body\" id=\"dlgBody\"><\/div>\n<\/dialog>\n\n";
window.mountPlans = function(host, opt){
opt = opt || {};
const root = host.shadowRoot || host.attachShadow({mode:'open'});
const theme = document.documentElement.dataset.theme;
host.classList.toggle('dark', theme === 'dark'); host.classList.toggle('light', theme === 'light');
root.innerHTML = '<style>' + PLANS_CSS + '</style><div class="root' + (opt.embed ? ' embed' : '') + (opt.only ? ' only' : '') + '">' + PLANS_HTML + '</div>';
const $ = s => root.querySelector(s), $$ = s => root.querySelectorAll(s);
const AR = '٠١٢٣٤٥٦٧٨٩';
const ar = v => String(v).replace(/\d/g, d => AR[d]).replace(/\./g, '٫');
const fx = (v, n=0) => ar(Number(v).toFixed(n));
// Hijri date d/m/y in Arabic digits; RLM before each slash keeps the day on the right (same as the reports)
const hd = s => ar(s.split('/').reverse().join('‏/')) + 'هـ';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ls = { get(k){ try{ return localStorage.getItem(k) }catch(e){ return null } }, set(k,v){ try{ v==null ? localStorage.removeItem(k) : localStorage.setItem(k,v) }catch(e){} } };
const ss = { get(k){ try{ return sessionStorage.getItem(k) }catch(e){ return null } } };

/* ---------- data access: embedded (artifact) or encrypted files (platform) ---------- */
const EMB = document.getElementById('data');
const EMBED = !!opt.embed, BASE = opt.base || '';
// decrypted data survive re-renders of the platform view (no second PBKDF2 / download)
const cache = window.__plansCache || (window.__plansCache = { pages: {} });
let D = cache.D, CK = cache.CK; const pageCache = cache.pages;
const utf8 = new TextEncoder();
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function unwrap(code){
  const L = await (await fetch(BASE + 'lock.json?t=' + Date.now(), {cache:'no-store'})).json();
  for (const l of L.locks){
    try{
      const base = await crypto.subtle.importKey('raw', utf8.encode(code), 'PBKDF2', false, ['deriveKey']);
      const wk = await crypto.subtle.deriveKey({name:'PBKDF2', salt:b64(l.salt), iterations:L.iter, hash:'SHA-256'}, base, {name:'AES-GCM', length:256}, false, ['decrypt']);
      const raw = await crypto.subtle.decrypt({name:'AES-GCM', iv:b64(l.iv)}, wk, b64(l.ct));
      return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
    }catch(e){}
  }
  throw new Error('code');
}
async function openBin(url){
  const r = await fetch(url, {cache:'no-cache'}); if(!r.ok) throw new Error('net');
  const u = new Uint8Array(await r.arrayBuffer());
  return crypto.subtle.decrypt({name:'AES-GCM', iv:u.subarray(0,12)}, CK, u.subarray(12));
}
async function loadData(){
  const plain = await openBin(BASE + 'd.bin?v=' + Date.now());
  return JSON.parse(await new Response(new Blob([plain]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
}
function pageUrl(doc, n){
  const k = doc + n;
  if (pageCache[k]) return pageCache[k];
  if (EMB) return pageCache[k] = Promise.resolve('data:image/jpeg;base64,' + JSON.parse(document.getElementById(doc==='op'?'pgOp':'pgImp').textContent)[n-1]);
  const v = (D.pageVer && D.pageVer[doc + '-' + n]) || '';
  return pageCache[k] = openBin(`${BASE}p/${doc}-${String(n).padStart(3,'0')}.bin?v=${v}`)
    .then(buf => URL.createObjectURL(new Blob([buf], {type:'image/jpeg'})))
    .catch(e => { delete pageCache[k]; throw e; });
}
function setImg(img, doc, n){
  img.classList.add('loading'); img.removeAttribute('src');
  img.style.setProperty('--ar', doc==='op' ? '16/9' : '842/595');
  const want = doc + n; img.dataset.want = want;
  pageUrl(doc, n).then(u => { if (img.dataset.want === want){ img.src = u; img.classList.remove('loading'); } })
    .catch(() => { img.classList.remove('loading'); img.alt = 'تعذّر تحميل الصفحة، تحققي من الاتصال'; });
}

/* ---------- lock ---------- */
async function tryCode(code, remember){
  CK = await unwrap(code);
  D = await loadData();
  Object.assign(cache, { code, CK, D });
  if (remember) ls.set('wk-plans-code', code);
  start();
}
async function boot(){
  if (EMB){ D = JSON.parse(EMB.textContent); start(); return; }
  if (CK && (!opt.code || opt.code === cache.code)){   // key already unwrapped by the platform (or an earlier visit)
    try{ if (!D){ D = cache.D = await loadData(); } start(); return; }catch(e){}
  }
  if (!window.crypto || !crypto.subtle || !window.DecompressionStream){
    $('#lock').hidden = false; $('#err').textContent = 'المتصفح قديم، حدّثيه أو استخدمي Chrome أو Safari الحديث'; return;
  }
  // from the platform (same tab) or a remembered code
  const cands = [opt.code, ss.get('wk-plans-code'), ls.get('wk-plans-code'), ls.get('wk-platform-code')].filter(Boolean);
  for (const c of [...new Set(cands)]){ try{ await tryCode(c, false); return; }catch(e){} }
  $('#lock').hidden = false; $('#code').focus();
}
$('#lockForm').addEventListener('submit', async e => {
  e.preventDefault();
  const code = $('#code').value.trim().toUpperCase(); if (!code) return;
  $('#go').disabled = true; $('#go').textContent = 'جارٍ الفتح…'; $('#err').textContent = '';
  try{ await tryCode(code, $('#remember').checked); }
  catch(err){ $('#err').textContent = err.message === 'code' ? 'الرمز غير صحيح' : 'تعذّر تحميل البيانات، تحققي من الاتصال'; }
  finally{ $('#go').disabled = false; $('#go').textContent = 'دخول'; }
});

/* ---------- app ---------- */
function start(){
$('#lock').hidden = true; $('#app').hidden = false;
if (!EMBED) new ResizeObserver(([e]) => { $('nav.tabs').style.top = e.target.offsetHeight + 'px'; }).observe($('header.top'));
const toTop = () => EMBED ? window.scrollTo({top: Math.max(0, host.getBoundingClientRect().top + scrollY - (opt.offset ? opt.offset() : 0) - 8)}) : toTop();

const P = D.programs, S = D.school;
const byName = Object.fromEntries(P.map(p => [p.name, p]));
const PRIO = {"عالية جدًا":"--s-crit","عالية":"--s-high","متوسطة مرتفعة":"--s-mh","متوسطة":"--s-mid","متابعة تطويرية":"--s-dev","محافظة واستدامة":"--s-keep",
              "عالٍ":"--s-crit","منخفض":"--s-mid","لا يوجد احتياج":"--s-keep"};
const chip = lvl => `<span class="chip"><i style="background:var(${PRIO[lvl]||'--faint'})"></i>${esc(lvl)}</span>`;
const pchip = n => byName[n] ? `<button class="chip pchip" data-prog="${esc(n)}">${esc(n)}</button>` : `<span class="chip">${esc(n)}</span>`;
const avg = a => (a = a.filter(x => x != null)).length ? a.reduce((s,x)=>s+x,0)/a.length : 0;
const from = hd(D.period.from), to = hd(D.period.to);
const built = new Date(D.generated);
const builtTxt = built.toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-arab', {weekday:'long', day:'numeric', month:'long', year:'numeric'});

$('#hMeta').innerHTML = `${esc(S.name)} · مديرة المدرسة: ${esc(S.principal)} · وكيلة المدرسة: ${esc(S.vice)}<br>مدة التنفيذ من ${from} إلى ${to}`;
$('#foot').textContent = `آخر تحديث للبيانات: ${builtTxt}`;
$('#opPeople').innerHTML = `<div><span>مديرة المدرسة: </span><b>${esc(S.principal)}</b></div><div><span>وكيلة المدرسة: </span><b>${esc(S.vice)}</b></div><div><span>مدة التنفيذ: </span><b>من ${from} إلى ${to}</b></div>`;

/* tabs */
function show(v){
  $$('.tab').forEach(t => t.setAttribute('aria-selected', t.dataset.v===v));
  $$('section.view').forEach(s => s.hidden = s.id !== 'v-'+v);
  if (v==='files') renderPage();
  if (v==='timeline') renderTimeline();
  if (!opt.only) ls.set('plansTab', v);
  if (!EMBED) try{ history.replaceState(null, '', '#' + v); }catch(e){}
}
$$('.tab').forEach(t => t.addEventListener('click', () => { show(t.dataset.v); toTop(); }));

/* overview */
const goalAvg = avg(P.map(p=>p.goal_pct)), evTotal = P.reduce((s,p)=>s+p.evidence,0), withEv = P.filter(p=>p.evidence>0).length;
$('#tiles').innerHTML = [
  ['برامج الخطة التشغيلية', ar(P.length), 'في ٥ محاور و١٠ مجالات أداء'],
  ['متوسط نسبة تحقق الأهداف', fx(goalAvg)+'<small>٪</small>', 'مرحلية، من نماذج قياس الأثر'],
  ['ملفات الشواهد المرفوعة', ar(evTotal), `${ar(withEv)} برنامجًا من ${ar(P.length)} لديها شواهد`],
  ['متوسط مؤشرات الأداء', fx(avg(D.indicators.map(r=>r[2])),1)+'<small>٪</small>', 'خط الأساس لمجالات التقرير العشرة'],
  ['الأداء العام للمدرسة', ar(S.overall)+'<small>٪</small>', 'مستوى «'+S.overall_level+'» في آخر تقرير'],
].map(([k,v,n]) => `<div class="card tile"><span class="k">${k}</span><span class="v num">${v}</span><span class="n">${n}</span></div>`).join('');

$('#ind').innerHTML = D.indicators.slice().sort((a,b)=>a[3]-b[3]).map(([field,dom,val,rank,lvl,act,progs]) => `
  <div class="ind-row">
    <span class="rank num">${ar(rank)}</span>
    <div class="ind-name"><b>${esc(field)}</b><span>${esc(dom)}</span></div>
    <div class="barline"><div class="track" role="img" aria-label="${esc(field)} ${fx(val,2)}٪"><div class="fill" style="width:${val}%"></div></div><span class="val num">${fx(val,2)}٪</span></div>
    <div class="pr">${chip(lvl)}</div>
    <p class="ind-act">${esc(act)}</p>
    <div class="ind-progs">البرامج المرتبطة: ${progs.map(pchip).join('')}</div>
  </div>`).join('');

const axes = [...new Set(P.map(p=>p.axis))];
$('#axes').innerHTML = axes.map(a => {
  const ps = P.filter(p=>p.axis===a), g = avg(ps.map(p=>p.goal_pct)), none = ps.filter(p=>!p.evidence);
  return `<tr class="click" data-axis="${esc(a)}" tabindex="0"><td class="t pname" data-l="المحور">${esc(a)}</td><td class="num" data-l="عدد البرامج">${ar(ps.length)}</td>
    <td data-l="متوسط التحقق"><div class="mini"><div class="track"><div class="fill" style="width:${g}%"></div></div><span class="num">${fx(g)}٪</span></div></td>
    <td class="num" data-l="ملفات الشواهد">${ar(ps.reduce((s,p)=>s+p.evidence,0))}</td>
    <td data-l="بلا شواهد">${none.length ? none.map(p=>`<span class="ev0">${esc(p.name)}</span>`).join('، ') : '<span class="small">لا يوجد</span>'}</td></tr>`;
}).join('');
const pickAxis = a => { state.axis = a; syncFilters(); renderRows(); show('programs'); toTop(); };
$$('#axes tr').forEach(tr => {
  tr.addEventListener('click', () => pickAxis(tr.dataset.axis));
  tr.addEventListener('keydown', e => { if (e.key==='Enter') pickAxis(tr.dataset.axis); });
});
$('#vision').textContent = D.vision; $('#mission').textContent = D.mission; $('#slogan').textContent = D.slogan;
$('#values').innerHTML = D.values.map(([k,v]) => `<div><b>${esc(k)}</b><p>${esc(v)}</p></div>`).join('');

/* programs */
const state = {axis:'الكل', q:'', sort:'i', dir:'asc'};
try{ const s = JSON.parse(ls.get('plansProg')||'null'); if (s) Object.assign(state, s, {q:''}); }catch(e){}
$('#progSub').textContent = `${ar(P.length)} برنامجًا · اضغطي على أي برنامج لعرض بطاقته وإجراءاته ومجلد شواهده`;
$('#progNote').textContent = `نسبة تحقق الأهداف ونسبة الأثر مرحلية من نماذج «قياس الأثر» لكل برنامج، والبرامج مستمرة حتى ${to}. عدد الشواهد هو عدد الملفات في مجلد «الشواهد» لكل برنامج. رقم المؤشر ١٩ غير موجود في الخطة.`;
$('#axisFilters').innerHTML = ['الكل', ...axes].map(a => `<button class="fbtn" data-axis="${esc(a)}" aria-pressed="false">${esc(a)} <span class="num small">${ar(a==='الكل'?P.length:P.filter(p=>p.axis===a).length)}</span></button>`).join('');
function syncFilters(){ $$('#axisFilters .fbtn').forEach(b => b.setAttribute('aria-pressed', b.dataset.axis===state.axis)); }
$$('#axisFilters .fbtn').forEach(b => b.addEventListener('click', () => { state.axis = b.dataset.axis; syncFilters(); renderRows(); }));
$('#q').addEventListener('input', e => { state.q = e.target.value.trim(); renderRows(); });
$$('th button[data-sort]').forEach(b => b.addEventListener('click', () => {
  const k = b.dataset.sort;
  state.dir = state.sort===k && state.dir==='asc' ? 'desc' : (k==='i' ? 'asc' : 'desc');
  state.sort = k; renderRows();
}));
function renderRows(){
  const q = state.q, m = state.dir==='asc' ? 1 : -1;
  const rows = P.filter(p => (state.axis==='الكل' || p.axis===state.axis) && (!q || [p.name,p.teacher,p.owner,p.field].join(' ').includes(q)))
    .sort((a,b) => (a.goal_pct==null)-(b.goal_pct==null) || (a[state.sort]-b[state.sort])*m || a.i-b.i);   // not started: always last
  $$('th button[data-sort]').forEach(b => b.dataset.dir = b.dataset.sort===state.sort ? state.dir : '');
  $('#shown').textContent = rows.length===P.length ? '' : `يظهر ${ar(rows.length)} من ${ar(P.length)}`;
  $('#progRows').innerHTML = rows.map(p => `
    <tr class="click" data-prog="${esc(p.name)}" tabindex="0">
      <td class="num small" data-l="رقم المؤشر">${ar(p.no)}</td>
      <td class="t"><div class="pname">${esc(p.name)}</div><div class="small">${esc(p.owner)}</div></td>
      <td data-l="المحور / المجال">${esc(p.axis)}<div class="small">${esc(p.field)}</div></td>
      <td data-l="المعلمات">${esc(p.teacher)}</td>
      <td class="num" data-l="الأساس ← المستهدف">${fx(p.base,2)}٪ ← ${fx(p.target,1)}٪</td>
      <td data-l="نسبة التحقق"><div class="mini"><div class="track"><div class="fill" style="width:${p.goal_pct || 0}%"></div></div><span class="num">${p.goal_pct == null ? 'لم يبدأ' : fx(p.goal_pct) + '٪'}</span></div></td>
      <td class="num ${p.evidence||p.goal_pct==null?'':'ev0'}" data-l="الشواهد">${p.goal_pct==null ? '<span class="small">—</span>' : p.evidence ? ar(p.evidence)+' ملف' : 'لا توجد بعد'}</td>
    </tr>`).join('') || `<tr><td colspan="7" class="small">لا توجد برامج تطابق البحث.</td></tr>`;
  ls.set('plansProg', JSON.stringify({axis:state.axis, sort:state.sort, dir:state.dir}));
}
syncFilters(); renderRows();

/* program dialog */
const hmd = ([m,d]) => hd(m > 12 ? `1449/${m-12}/${d}` : `1448/${m}/${d}`);
const tlOf = p => { const r = D.timeline && D.timeline.rows.find(x => x.no === p.no); return r ? hmd(r.start) + ' – ' + hmd(r.end) : ''; };
const dlg = $('#dlg');
function openProgram(name){
  const p = byName[name]; if (!p) return;
  $('#dlgEyebrow').textContent = `رقم المؤشر ${ar(p.no)} · ${p.axis} · ${p.field}`;
  $('#dlgTitle').textContent = p.name;
  const inImp = D.impPlan.flatMap(([dom,pg,els]) => els.filter(e => e[3].includes(p.name)).map(e => `${e[0]} (${dom})`));
  $('#dlgBody').innerHTML = `
    <div class="btns">
      <a class="btn" href="${esc(p.share)}" target="_blank" rel="noopener" ${p.share ? '' : 'aria-disabled="true"'}>فتح مجلد الشواهد والتقرير ↗</a>
      <button class="btn ghost" data-open="op:${p.pages[0]}">عرض البطاقة في ملف الخطة</button>
    </div>
    <div class="kv">
      <div><div class="k">نسبة تحقق الأهداف</div><div class="v num">${p.goal_pct == null ? 'لم يبدأ التنفيذ بعد' : fx(p.goal_pct) + '٪ <span class="small">مرحلية</span>'}</div></div>
      <div><div class="k">نسبة الأثر</div><div class="v num">${p.impact_pct == null ? '—' : fx(p.impact_pct) + '٪ <span class="small">' + esc(p.impact) + '</span>'}</div></div>
      <div><div class="k">مستوى الأداء</div><div class="v">${esc(p.perf)}</div></div>
      <div><div class="k">ملفات الشواهد</div><div class="v num ${p.evidence || p.goal_pct == null ? '' : 'ev0'}">${p.goal_pct == null ? '—' : p.evidence ? ar(p.evidence) : 'لا توجد بعد'}</div></div>
      <div><div class="k">خط الأساس ← المستهدف</div><div class="v num">${fx(p.base,2)}٪ ← ${fx(p.target,1)}٪</div></div>
      <div><div class="k">دورة القياس</div><div class="v">${esc(p.cycle)}</div></div>
      <div><div class="k">التكلفة</div><div class="v num">${p.cost ? ar(p.cost)+' ر.س' : 'بدون تكلفة'}</div></div>
      <div><div class="k">مدة التنفيذ</div><div class="v num">${tlOf(p) || from + ' – ' + to}</div></div>
      ${p.weeks ? `<div><div class="k">الأسابيع الدراسية</div><div class="v">${esc(ar(p.weeks[0] === p.weeks[1] ? p.weeks[0] : p.weeks[0] + ' ← ' + p.weeks[1]))}</div></div>` : ''}
    </div>
    <div class="cols">
      <div style="display:grid;gap:10px;align-content:start">
        <div><div class="small">الهدف العام</div><div>${esc(p.goal)}</div></div>
        <div><div class="small">الهدف التفصيلي</div><div>${esc(p.objective)}</div></div>
        <div><div class="small">مؤشر الأداء</div><div>${esc(p.kpi)}</div></div>
        <div><div class="small">الفئة المستهدفة</div><div>${esc(p.audience)}</div></div>
        <div><div class="small">مالك البرنامج</div><div>${esc(p.owner)}</div></div>
        <div><div class="small">المعلمات المنفذات</div><div>${esc(p.teacher)}</div></div>
        ${inImp.length ? `<div><div class="small">يرد في خطة التحسين ضمن</div><div>${inImp.map(esc).join('، ')}</div></div>` : ''}
      </div>
      <div style="display:grid;gap:10px;align-content:start">
        <div class="small">الإجراءات التنفيذية</div>
        <ol class="steps">${p.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
        ${p.achievement ? `<div><div class="small">مؤشر الإنجاز</div><div>${esc(p.achievement)}</div></div>` : ''}
      </div>
    </div>
    <div style="display:grid;gap:12px">
      <div class="small">بطاقة البرنامج ولوحة مؤشر الأداء الشاملة كما وردتا في الخطة التشغيلية (ص ${ar(p.pages[0])}–${ar(p.pages[1])})</div>
      ${p.pages.map(n => `<img class="page" data-pg="${n}" alt="صفحة ${ar(n)} من الخطة التشغيلية">`).join('')}
    </div>`;
  $('#dlgBody').querySelectorAll('img[data-pg]').forEach(img => setImg(img, 'op', +img.dataset.pg));
  if (!dlg.open) dlg.showModal();
  dlg.scrollTop = 0;
}
$('#dlgClose').addEventListener('click', () => dlg.close());
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

root.addEventListener('click', e => {
  const pr = e.target.closest('[data-prog]');
  if (pr){ openProgram(pr.dataset.prog); return; }
  const op = e.target.closest('[data-open]');
  if (op){ const [doc,n] = op.dataset.open.split(':'); if (dlg.open) dlg.close(); openPage(doc, +n); }
});
if (window.__plansKey) document.removeEventListener('keydown', window.__plansKey);
document.addEventListener('keydown', window.__plansKey = e => {
  if (!host.isConnected) return;
  const t = e.composedPath()[0];
  if (e.key === 'Enter'){ const tr = t.closest && t.closest('tr[data-prog]'); if (tr) openProgram(tr.dataset.prog); }
  if (!$('#v-files').hidden && !dlg.open && !/INPUT|SELECT|TEXTAREA/.test(t.tagName || '')){
    if (e.key === 'ArrowLeft') go(1);
    if (e.key === 'ArrowRight') go(-1);
  }
});

/* timeline — the current week and the done/planned split are computed from today's date on every open */
function renderTimeline(){
  const T = D.timeline; if (!T) return;
  const DAY = 864e5, dOf = s => { const [y,m,d] = s.split('-').map(Number); return Date.UTC(y, m-1, d); };
  const now = new Date(), today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const ms = T.months.map(o => o.m), first = dOf(T.monthStart[ms[0]]), endAll = dOf(T.monthStart[ms[ms.length-1] + 1]);
  let cur = -1, hm = null;
  if (today >= first && today < endAll){
    const m = Math.max(...ms.filter(k => dOf(T.monthStart[k]) <= today));
    const d = Math.round((today - dOf(T.monthStart[m])) / DAY) + 1;
    hm = [m, d]; cur = (m - ms[0]) * 4 + Math.min(Math.floor((d - 1) / 7), 3);
  } else if (today >= endAll) cur = ms.length * 4;
  const tw = (T.weeks || []).find(w => today >= dOf(w[2]) && today <= dOf(w[2]) + 4 * DAY);
  const hd2 = hmd;
  const R = T.rows.map(r => {
    const st = dOf(r.sg), en = dOf(r.eg);
    const state = today < st ? 'wait' : today > en ? 'done' : 'run';
    return Object.assign({}, r, {state, left: Math.round((en - today) / DAY)});
  });
  const running = R.filter(r => r.state === 'run'), done = R.filter(r => r.state === 'done'), wait = R.filter(r => r.state === 'wait');
  const nextEnd = R.filter(r => r.state !== 'done').sort((a,b) => a.left - b.left)[0];
  $('#tlSub').textContent = `${ar(R.length)} برنامجًا · اضغطي على اسم البرنامج لعرض بطاقته`;
  $('#tlTiles').innerHTML = [
    ['الأسبوع الدراسي الحالي', tw ? ar(tw[1]) : '—', (tw ? (tw[0] === 1 ? 'الفصل الأول' : 'الفصل الثاني') + ' · ' : '') + (hm ? 'اليوم ' + hd2(hm) : '')],
    ['برامج جارية الآن', ar(running.length), `من ${ar(R.length)} برنامجًا`],
    ['برامج لم تبدأ بعد', ar(wait.length), wait.length ? wait.map(r => r.name).join('، ') : 'بدأت جميع البرامج'],
    ['برامج انتهت', ar(done.length), done.length ? done.map(r => r.name).join('، ') : 'التنفيذ مستمر'],
    ['أقرب برنامج ينتهي', nextEnd ? `<span style="font-size:18px">${esc(nextEnd.name)}</span>` : '—', nextEnd ? `${hd2(nextEnd.end)} · بعد ${ar(nextEnd.left)} يومًا` : ''],
  ].map(([k,v,n]) => `<div class="card tile"><span class="k">${k}</span><span class="v num">${v}</span><span class="n">${esc(n)}</span></div>`).join('');
  const W = ms.length * 4;
  let h = `<thead><tr><th class="c-no" rowspan="3">م</th><th class="c-name" rowspan="3">البرامج والأنشطة</th><th class="c-d" rowspan="3">البداية</th><th class="c-d" rowspan="3">النهاية</th>`;
  h += T.months.map(o => `<th class="mo${o.dark ? ' dk' : ''}" colspan="4" style="background:#${o.color}">${esc(o.name)}</th>`).join('') + '</tr><tr>';
  h += T.months.map(o => `<th class="wk" colspan="4" style="background:#${o.tint}">${o.wl}</th>`).join('') + '</tr><tr>';
  for (let k = 0; k < W; k++) h += `<th class="wkn${k === cur ? ' now' : ''}">${ar(k % 4 + 1)}</th>`;
  h += '</tr></thead><tbody>';
  R.forEach((r, i) => {
    const lbl = r.state === 'run' ? `<span class="st run">جارٍ · يتبقى ${ar(r.left)} يومًا</span>` : r.state === 'done' ? '<span class="st end">انتهى</span>' : '<span class="st">لم يبدأ</span>';
    h += `<tr><td class="c-no num">${ar(i + 1)}</td><td class="c-name">${byName[r.name] ? `<button data-prog="${esc(r.name)}">${esc(r.name)}</button>` : esc(r.name)}${lbl}</td>`
       + `<td class="c-d num">${hd2(r.start)}</td><td class="c-d num">${hd2(r.end)}</td>`;
    for (let k = 0; k < W; k++){
      const on = k >= r.s && k <= r.e;
      h += `<td class="c${on ? ' on' : ''}${on && k <= cur ? ' past' : ''}${k === cur ? ' now' : ''}"${on && k === r.s ? ` title="من ${hd2(r.start)} إلى ${hd2(r.end)}"` : ''}></td>`;
    }
    h += '</tr>';
  });
  $('#tl').innerHTML = h + '</tbody>';
  $('#tlNote').textContent = 'خانات الأسابيع في كل شهر: ١ = الأيام ١–٧، ٢ = ٨–١٤، ٣ = ١٥–٢١، ٤ = ٢٢ إلى نهاية الشهر. الأسابيع الدراسية وفق توزيع الوزارة ١٤٤٨هـ: الفصل الأول من ١٠/٣ (إجازة ١٢–١٦/٦)، والفصل الثاني من ٩/٨ (إجازة الفطر ٢١/٩–٥/١٠، والأضحى ٢–١٦/١٢) وينتهي ٥/١/١٤٤٩هـ. الأسبوع الحالي والجزء المنفَّذ يُحسبان تلقائيًا من تاريخ اليوم.';
  // scroll so the current week is in view (RTL: the table starts at the right)
  requestAnimationFrame(() => {
    const wrap = $('.tl-wrap'), c = wrap.querySelector('th.now');
    if (c && wrap.scrollWidth > wrap.clientWidth){
      const wr = wrap.getBoundingClientRect(), cr = c.getBoundingClientRect();
      wrap.scrollLeft += cr.left - wr.left - wr.width / 2;
    }
  });
}
const tlFiles = D.files || [];
$('#tlFiles').innerHTML = tlFiles.map((f, i) => `<button class="btn ${i ? 'ghost' : ''}" data-file="${i}">تنزيل ${esc(f.label)}</button>`).join('');
$('#tlFiles').addEventListener('click', async e => {
  const b = e.target.closest('[data-file]'); if (!b) return;
  const f = tlFiles[+b.dataset.file], t = b.textContent;
  b.disabled = true; b.textContent = 'جارٍ التنزيل…';
  try{
    const buf = await openBin(`${BASE}f/${f.key}.bin?v=${f.ver}`);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([buf], {type: f.mime})); a.download = f.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 30000);
    b.textContent = t;
  }catch(err){ b.textContent = 'تعذّر التنزيل، حاولي مجددًا'; setTimeout(() => { b.textContent = t; }, 3000); }
  finally{ b.disabled = false; }
});

/* improvement */
$('#facts').innerHTML = [
  ['الطالبات', ar(S.students)], ['المعلمات', ar(S.teachers)], ['الفصول الدراسية', ar(S.classes)], ['شاغلات الوظائف الإدارية', ar(S.admins)],
  ['الأداء العام (آخر تقرير)', ar(S.overall)+'٪ · '+S.overall_level], ['نواتج التعلم (آخر تقرير)', fx(S.outcomes,2)+'٪ · '+S.outcomes_level],
].map(([k,v]) => `<div><div class="k">${k}</div><div class="v num">${v}</div></div>`).join('');
$('#urgent').innerHTML = `<p class="sub">مؤشران مصنفان في مستوى «الانطلاق» ضمن مجال نواتج التعلم (رفع التحصيل العلمي والدراسي)، وأداة القياس: قياس فصلي موثق.</p>` +
  D.impUrgent.map(([t,v]) => `<div class="urow"><div>${esc(t)}</div><div class="barline"><div class="track"><div class="fill" style="width:${v}%;background:var(--s-mh)"></div></div><span class="val num">${fx(v,2)}٪</span></div></div>`).join('') +
  `<div class="ind-progs">البرامج المرتبطة: ${['ننافس لنصل','مهارات متقنة','بيانات تقود التحسين'].map(pchip).join('')}</div>`;
$('#prio').innerHTML = D.impDomainPriority.map(([d,l,w]) => `<div class="prow"><b>${esc(d)}</b><div>${chip(l)}</div><p>${esc(w)}</p></div>`).join('');
const SW = {"نقاط القوة":"--s-keep","نقاط الضعف":"--s-crit","الفرص":"--brand-2","التهديدات":"--s-high"};
$('#swot').innerHTML = Object.entries(D.impSwot).map(([k,items]) => `<div class="card pad"><h3><i class="mark" style="background:var(${SW[k]})"></i>${esc(k)}</h3><ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('');
$('#plan').innerHTML = D.impPlan.map(([dom,pg,els]) => `
  <div class="card pad dom">
    <div class="dom-head"><h3>مجال ${esc(dom)}</h3><button class="link" data-open="imp:${pg}">الصفحة ${ar(pg)}</button></div>
    ${els.map(([t,need,act,progs,dur,ex,resp]) => `
      <div class="el">
        <div class="t">${esc(t)}</div>
        <dl>
          <dt>وصف الاحتياج</dt><dd>${esc(need)}</dd>
          <dt>إجراءات التحسين</dt><dd>${esc(act)}</dd>
          <dt>البرامج</dt><dd><span class="chips">${progs.map(pchip).join('')}</span></dd>
          <dt>مدة الإنجاز</dt><dd>${esc(dur)}</dd>
          <dt>المنفذ / المسؤول</dt><dd>${esc(ex)} · ${esc(resp)}</dd>
        </dl>
      </div>`).join('')}
  </div>`).join('');
$('#actions').innerHTML = D.impActions.map(([n,a]) => `<tr><td class="t" data-l="البرنامج">${pchip(n)}</td><td data-l="الإجراء">${esc(a)}</td></tr>`).join('');
$('#recs').innerHTML = D.impRecs.map(r => `<li>${esc(r)}</li>`).join('');

/* viewer */
const vs = {doc:'op', page:1};
const TITLES = {op:'الخطة التشغيلية ١٤٤٨هـ', imp:'خطة التحسين المدرسية ١٤٤٨هـ'};
const count = doc => D.pageCount[doc];
function openPage(doc, n){ vs.doc = doc; vs.page = n; show('files'); toTop(); }
function go(d){ vs.page = Math.min(Math.max(1, vs.page + d), count(vs.doc)); renderPage(); }
function renderPage(){
  const secs = vs.doc==='op' ? D.opSections : D.impSections;
  $('#docTitle').textContent = TITLES[vs.doc];
  ['op','imp'].forEach(d => $('#d-'+d).setAttribute('aria-pressed', d===vs.doc));
  $('#pgcount').textContent = ar(count(vs.doc));
  $('#pgin').max = count(vs.doc); $('#pgin').value = vs.page;
  $('#prev').disabled = vs.page <= 1; $('#next').disabled = vs.page >= count(vs.doc);
  const img = $('#pageImg');
  img.alt = `${TITLES[vs.doc]}، صفحة ${ar(vs.page)}`;
  setImg(img, vs.doc, vs.page);
  if (vs.page < count(vs.doc)) pageUrl(vs.doc, vs.page + 1).catch(() => {});   // prefetch next
  let cur = 0; secs.forEach(([n], i) => { if (n <= vs.page) cur = i; });
  $('#toc').innerHTML = secs.map(([n,t], i) => `<button data-page="${n}" aria-current="${i===cur}"><span>${esc(t)}</span><span class="pg num">${ar(n)}</span></button>`).join('');
  $('#tocsel').innerHTML = secs.map(([n,t], i) => `<option value="${n}" ${i===cur ? 'selected' : ''}>${esc(t)} (ص ${ar(n)})</option>`).join('');
}
$('#toc').addEventListener('click', e => { const b = e.target.closest('button[data-page]'); if (b){ vs.page = +b.dataset.page; renderPage(); } });
$('#tocsel').addEventListener('change', e => { vs.page = +e.target.value; renderPage(); });
$('#prev').addEventListener('click', () => go(-1));
$('#next').addEventListener('click', () => go(1));
$('#pgin').addEventListener('change', e => { const n = parseInt(String(e.target.value).replace(/[٠-٩]/g, c => AR.indexOf(c)), 10); if (n){ vs.page = 0; go(n); } });
$$('.docsw .fbtn').forEach(b => b.addEventListener('click', () => { vs.doc = b.dataset.doc; vs.page = 1; renderPage(); }));

const TABS = ['overview','programs','timeline','improve','files'], fromHash = EMBED ? '' : location.hash.slice(1), startTab = ls.get('plansTab');
show(opt.only && TABS.includes(opt.only) ? opt.only : TABS.includes(fromHash) ? fromHash : TABS.includes(startTab) ? startTab : 'overview');
}
boot();
};
})();
