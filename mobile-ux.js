(function() {
  // Подключать ПОСЛЕ mobile.js (и желательно последним из стилевых скриптов,
  // чтобы перебить размеры шрифтов других модулей на мобильных экранах).

  const st = document.createElement("style");
  st.textContent = [
    "@media(max-width:768px){",

    // 1) Не даём iOS зумить страницу при фокусе на поле ввода —
    // для этого у всех полей шрифт должен быть не меньше 16px.
    "input,textarea,select{font-size:16px !important}",

    // 2) Убираем серую вспышку при тапе и делаем нажатия отзывчивее
    "*{-webkit-tap-highlight-color:transparent}",
    "button,.tbtn,.chip,.hb-pchip,.btn,.ph,.lv-act,.gm-btn,.rv-star,.rv-del,.rt-chip,.rt-go{touch-action:manipulation}",
    "button:active,.tbtn:active,.chip:active,.hb-pchip:active,.btn:active,.card:active,.hb-card:active{opacity:.7}",

    // 3) Увеличиваем маленькие кнопки/чипы до комфортного размера пальца (≈44px)
    "button,.tbtn,.chip,.hb-pchip,.btn,.lv-act,.rt-chip{min-height:40px;display:inline-flex;align-items:center;justify-content:center}",
    ".tbtn{min-height:44px}",
    ".ibar button,.gear,.mob-burger{min-width:44px;min-height:44px}",

    // 4) Горизонтальные ленты карточек — скролл с «прилипанием»,
    // чтобы карточка не зависала посередине экрана
    ".akzhar-row{scroll-snap-type:x mandatory}",
    ".akzhar-slide{scroll-snap-align:start}",
    ".hb-prompts,.sug{scroll-snap-type:x proximity}",
    ".hb-pchip,.chip{scroll-snap-align:start}",

    // 5) Чуть крупнее основной текст для читаемости на маленьком экране
    "body{-webkit-text-size-adjust:100%}",

    // 6) Лёгкая индикация зоны свайпа от края экрана (едва заметная, не мешает)
    ".mob-edge-hint{position:fixed;top:50%;left:0;width:4px;height:60px;margin-top:-30px;background:var(--ac);opacity:.35;border-radius:0 6px 6px 0;z-index:980;pointer-events:none;transition:opacity .3s}",
    ".mob-edge-hint.hide{opacity:0}",

    "}"
  ].join("");
  document.head.appendChild(st);

  // ---------- свайп от левого края для открытия меню ----------
  const side = document.querySelector(".side");
  if (!side) return;

  // лёгкая подсказка пользователю, что меню можно вытянуть свайпом
  const hint = document.createElement("div");
  hint.className = "mob-edge-hint";
  document.body.appendChild(hint);
  setTimeout(function() { hint.classList.add("hide"); }, 2500);

  let touchStartX = 0, touchStartY = 0, tracking = false;
  const EDGE_ZONE = 24;   // ширина зоны у края экрана, с которой начинается свайп
  const OPEN_DIST = 60;   // на сколько пикселей нужно провести пальцем, чтобы открыть
  const CLOSE_DIST = 60;  // и чтобы закрыть

  function isMobile() {
    return window.matchMedia && window.matchMedia("(max-width:768px)").matches;
  }

  document.addEventListener("touchstart", function(e) {
    if (!isMobile() || !e.touches || e.touches.length !== 1) { tracking = false; return; }
    const t = e.touches[0];
    const open = side.classList.contains("mob-open");
    // открываем только если палец стартовал у самого края экрана
    // закрываем, если меню уже открыто (от любой точки на самом меню)
    if (!open && t.clientX > EDGE_ZONE) { tracking = false; return; }
    if (open && !side.contains(e.target)) { tracking = false; return; }
    tracking = true;
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  document.addEventListener("touchmove", function(e) {
    if (!tracking || !e.touches || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dy) > Math.abs(dx)) { tracking = false; return; } // это вертикальный скролл, не трогаем

    const open = side.classList.contains("mob-open");
    if (!open && dx > OPEN_DIST) {
      side.classList.add("mob-open");
      const overlay = document.querySelector(".mob-overlay");
      if (overlay) overlay.classList.add("open");
      tracking = false;
    } else if (open && dx < -CLOSE_DIST) {
      side.classList.remove("mob-open");
      const overlay = document.querySelector(".mob-overlay");
      if (overlay) overlay.classList.remove("open");
      tracking = false;
    }
  }, { passive: true });

  document.addEventListener("touchend", function() { tracking = false; });
})();
