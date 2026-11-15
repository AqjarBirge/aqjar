(function() {
  // Подключать ПОСЛЕДНИМ из скриптов интерфейса (после guide.js), чтобы перебить стили других модулей.
  // Адаптация всех разделов под телефон: ничего не обрезается, ничего не вылезает за экран.
  const MQ = "@media(max-width:768px),(max-height:480px){";

  const css = [
    MQ,

    // ---- базовое ----
    "html,body{max-width:100vw;overflow-x:hidden}",
    "img,svg,video,canvas,iframe{max-width:100%}",
    ".msg,.iitem,.card h3,.card p,.rv-itext{overflow-wrap:anywhere}",

    // ---- шапка ----
    ".top>div:first-child{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".inbtn>span:first-of-type{display:none}",
    ".inbtn{padding:7px 10px}",
    ".pop{right:10px;top:54px;width:min(270px,calc(100vw - 20px))}",
    // mobile-ux растягивал ВСЕ button до 40px по высоте — переключатели в ⚙️ превращались в кружки
    ".sw{min-height:0 !important;height:20px !important;width:40px !important;display:block !important;padding:0}",
    ".sw::after{top:2px}",
    ".adm input{font-size:16px}",

    // ---- боковое меню ----
    ".side{overflow-y:auto;-webkit-overflow-scrolling:touch;gap:14px;padding-bottom:20px}",
    ".side .menu{margin-top:10px}",

    // ---- общие карточки / справочник ----
    ".cards{padding:14px 14px 32px}",
    ".card{flex-wrap:wrap}",
    ".card>div:first-child{flex:1 1 150px;min-width:0}",
    ".card .btn{flex-shrink:0}",
    ".akzhar-head{flex-wrap:wrap;margin:18px 0 8px}",
    ".akzhar-head>div:last-child{display:none !important}",
    ".akzhar-row{cursor:auto;gap:10px;padding-bottom:12px}",
    // карточки служб: высота по содержимому, чтобы текст не обрезался
    ".akzhar-slide{height:auto !important;min-height:240px;min-width:min(250px,78vw) !important;max-width:min(250px,78vw) !important}",

    // ---- главная ----
    ".hb-wrap{padding:14px 14px 32px;gap:14px}",
    ".hb-top-bar{padding:12px 14px}",
    ".hb-sos{gap:6px}",
    ".hb-sos-btn{min-height:36px;padding:4px 10px}",
    ".hb-hero{padding:18px 16px;gap:12px}",
    ".hb-title{font-size:22px}",
    ".hb-sub{font-size:13px}",
    ".hb-search{max-width:100%;padding:5px}",
    ".hb-search input{min-width:0;width:100%;padding:9px 8px}",
    ".hb-search button{padding:10px 12px}",
    ".hb-grid{grid-template-columns:1fr}",

    // ---- «Что открыто сейчас» ----
    ".lv-box{padding:14px}",
    ".lv-list{grid-template-columns:1fr}",
    ".lv-acts{flex-wrap:wrap}",
    ".lv-act{flex:1 1 auto}",

    // ---- планировщик ----
    ".rt-box{padding:14px}",
    ".rt-row{align-items:stretch}",
    ".rt-row label{display:flex;flex-direction:column;gap:4px;flex:1 1 100%}",
    ".rt-row select,.rt-row input{width:100%;max-width:100%;font-size:16px}",
    ".rt-go{width:100%}",
    ".rt-chip{padding:7px 10px}",
    ".rt-map{height:300px}",

    // ---- игра ----
    ".gm-box{padding:14px}",
    ".gm-q{font-size:15px}",
    ".gm-map{height:320px}",
    ".gm-row .gm-btn{flex:1 1 auto}",
    ".gm-final{font-size:22px}",

    // ---- карта организаций + гид ----
    ".org-gis-wrap{margin-top:16px;gap:12px}",
    ".org-gis-wrap>*{min-width:0}",
    ".org-gis-map{height:340px !important}",
    ".org-gis-side{padding:14px}",
    ".gis-tp-grid{grid-template-columns:repeat(2,minmax(0,1fr)) !important}",
    ".gis-tp-btn{white-space:normal;line-height:1.2;min-height:40px;text-align:left;justify-content:flex-start}",
    ".org-gis-btns .btn{flex:1 1 calc(50% - 8px)}",
    ".gv-bar{padding:12px;margin-top:14px}",
    ".gv-row input{flex:1 1 100%}",
    ".gv-b{flex:1 1 auto;white-space:normal}",
    ".gv-row .gv-sel{flex:1 1 100%;font-size:16px}",
    ".gv-cap{left:6px;right:6px;bottom:6px;padding:8px 10px;gap:4px}",
    ".gv-cap .ct{font-size:14px}",
    ".gv-cap .cx{font-size:12px;line-height:1.35;max-height:72px;overflow-y:auto}",
    ".gv-ctl button{min-height:36px;padding:4px 10px}",

    // ---- отзывы ----
    ".rv-wrap{padding:14px 14px 32px;gap:14px}",
    ".rv-box{padding:14px}",
    ".rv-avg-n{font-size:40px}",
    ".rv-star{font-size:32px;min-height:0;min-width:40px}",
    ".rv-btn{width:100%;align-self:stretch}",

    // ---- окна и уведомления ----
    ".mbg{padding:10px}",
    ".mdl{max-height:80vh;max-height:80dvh}",
    ".toast{left:12px;right:12px;bottom:76px;text-align:center}",

    "}"
  ].join("");

  const st = document.createElement("style");
  st.id = "mobile-fix-css";
  st.textContent = css;
  document.head.appendChild(st);

  // ---- меню: закрывается после выбора ЛЮБОГО пункта (в т.ч. «Отзывы», добавленного позже) ----
  const side = document.querySelector(".side");
  function closeMenu() {
    if (side) side.classList.remove("mob-open");
    const ov = document.querySelector(".mob-overlay");
    if (ov) ov.classList.remove("open");
  }
  if (side) {
    side.addEventListener("click", function(e) {
      if (e.target.closest && e.target.closest(".tbtn")) closeMenu();
    });
  }
  // при повороте экрана на планшет/десктоп меню не должно «залипать»
  window.addEventListener("resize", function() {
    if (window.matchMedia && !window.matchMedia("(max-width:768px),(max-height:480px)").matches) closeMenu();
  });

  // ---- чат: при открытии клавиатуры прокручиваем к последнему сообщению ----
  const inp = document.getElementById("inp");
  const cbox = document.getElementById("cbox");
  if (inp && cbox) {
    inp.addEventListener("focus", function() {
      setTimeout(function() { cbox.scrollTop = cbox.scrollHeight; }, 350);
    });
  }

  // ---- карты: после смены вкладки/поворота экрана пересчитываем размер ----
  function refreshMaps() {
    setTimeout(function() {
      if (window.aqGis && window.aqGis.map) { try { window.aqGis.map.invalidateSize(); } catch (e) {} }
    }, 200);
  }
  window.addEventListener("orientationchange", refreshMaps);
  document.querySelectorAll('input[name="t"]').forEach(function(r) { r.addEventListener("change", refreshMaps); });
})();
