(function() {
  const st = document.createElement("style");
  st.textContent = [
    ".mob-burger,.mob-overlay{display:none}",
    "@media(max-width:768px),(max-height:480px){",
    "html,body{width:100%;height:var(--app-h,100vh);overflow:hidden;position:fixed;inset:0}",
    "body{display:block}",
    ".mob-burger{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;background:var(--cd);border:1px solid var(--bd);color:var(--tx);font-size:18px;cursor:pointer;margin-right:10px;flex-shrink:0}",
    ".mob-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(3px);z-index:990}",
    ".mob-overlay.open{display:block}",
    ".side{position:fixed;top:0;left:0;bottom:0;width:260px;height:var(--app-h,100vh);z-index:1000;transform:translateX(-105%);transition:transform .25s ease;box-shadow:10px 0 30px rgba(0,0,0,.5)}",
    ".side.mob-open{transform:translateX(0)}",
    ".main{width:100%;height:var(--app-h,100vh);display:flex;flex-direction:column}",
    ".top{height:52px;flex-shrink:0;padding:8px 12px}",
    ".top>div:first-child{display:flex;align-items:center}",
    ".pnl{height:calc(var(--app-h,100vh) - 52px) !important;flex:1;min-height:0;overflow:hidden}",
    "#p1,#p4{display:none;flex-direction:column}",
    "#r1:checked~.main #p1,#r4:checked~.main #p4{display:flex !important}",
    ".chat{flex:1 1 auto;min-height:0;overflow-y:auto;padding:12px}",
    ".msg,.iitem{max-width:92%;font-size:14px;word-break:break-word}",
    ".sug{flex-shrink:0;padding:6px 10px;gap:6px}",
    ".ibar{flex-shrink:0;display:flex !important;flex-wrap:wrap;gap:6px;padding:8px 10px;background:var(--gl);border-top:1px solid var(--bd)}",
    "#p1 .ibar input{flex:1 1 0%;min-width:0;width:auto !important;font-size:16px;padding:9px 12px}",
    "#p4 #iName{flex:1 1 100%;width:100% !important;font-size:15px;padding:8px 12px}",
    "#p4 #iText{flex:1 1 0%;min-width:0;width:auto !important;font-size:15px;padding:9px 12px}",
    ".ibar button{width:42px;height:42px;flex-shrink:0;font-size:18px}",
    ".cards{height:100%;overflow-y:auto;padding:14px}",
    ".grid{grid-template-columns:1fr;gap:10px}",
    ".akzhar-slide{min-width:245px;max-width:245px;height:240px}",
    ".org-gis-map{height:280px}",
    ".gis-tp-grid{grid-template-columns:1fr}",
    "}"
  ].join("");
  document.head.appendChild(st);

  // Точная подстройка высоты под экран смартфона и выезжающую клавиатуру
  function fixHeight() {
    const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty("--app-h", h + "px");
  }
  fixHeight();
  window.addEventListener("resize", fixHeight);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", fixHeight);
  }
  })();

