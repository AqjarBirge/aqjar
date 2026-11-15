(function() {
  // Подключать ПОСЛЕ hub.js
  const wrap = document.querySelector("#p0 .hb-wrap");
  if (!wrap) return;

  const TZ_HOURS = 5; // Казахстан: UTC+5
  const WD = [1, 2, 3, 4, 5];
  const DAY_RU = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const LUNCH = [13 * 60, 14 * 60 + 30];

  // Часы работы взяты из mapa.js / hub.js — сверьте с реальными
  const ORGS = [
    { n: "🏛️ Акимат района", pi: 0, phone: "+7 (705) 657-13-47", open: 540, close: 1110, days: WD, lunch: LUNCH },
    { n: "💼 Карьерный центр", pi: 1, phone: "+7 (71546) 2-14-50", open: 540, close: 1110, days: WD, lunch: LUNCH },
    { n: "🎓 Отдел образования", pi: 2, phone: "79-113", open: 540, close: 1110, days: WD, lunch: LUNCH },
    { n: "📂 Районный архив", pi: 3, phone: "+7 (71546) 2-11-30", open: 540, close: 1110, days: WD, lunch: LUNCH },
    { n: "🏢 ЦОН (1414)", pi: 6, phone: "1414", open: 540, close: 1080, days: WD, lunch: LUNCH },
    { n: "🐄 Ветеринария", pi: 4, phone: "+7 (71546) 7-90-46", open: 540, close: 1110, days: WD, lunch: LUNCH },
    { n: "🧪 СЭС", pi: 10, phone: "+7 (71546) 2-19-17", open: 540, close: 1110, days: WD, lunch: LUNCH },
    { n: "🏦 Казначейство", pi: 11, open: 540, close: 1110, days: WD, lunch: LUNCH },
    { n: "🧪 Управление СЭС", pi: 12, phone: "+7 (71546) 2-19-17", open: 540, close: 1110, days: WD, lunch: LUNCH },
    { n: "📊 Отдел статистики", pi: 13, open: 540, close: 1110, days: WD, lunch: LUNCH },
    { n: "🏫 ТСШ", pi: 14, open: 480, close: 1020, days: WD },
    { n: "🏫 БСШ", pi: 15, open: 480, close: 1020, days: WD },
    { n: "🏥 Районная больница", pi: 7, phone: "103", always: true },
    { n: "🚓 РОВД (Полиция)", pi: 8, phone: "102", always: true },
    { n: "🚆 Ж/д вокзал", pi: 9, phone: "105", always: true }
  ];

  const st = document.createElement("style");
  st.textContent = [
    ".lv-box{background:var(--cd);border:1px solid var(--bd);border-radius:18px;padding:20px;display:flex;flex-direction:column;gap:14px}",
    ".lv-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}",
    ".lv-head h3{font-size:17px;font-weight:800}",
    ".lv-time{font-size:12px;color:var(--mt);font-weight:600}",
    ".lv-filter{display:flex;gap:6px}",
    ".lv-fbtn{background:var(--in);border:1px solid var(--bd);color:var(--mt);padding:5px 12px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer}",
    ".lv-fbtn.act{border-color:var(--ac);color:var(--ac);background:var(--sf)}",
    ".lv-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}",
    ".lv-item{background:var(--in);border:1px solid var(--bd);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:6px}",
    ".lv-name{font-size:14px;font-weight:700}",
    ".lv-st{font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px}",
    ".lv-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}",
    ".lv-open .lv-dot{background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.2)}",
    ".lv-open .lv-st{color:#22c55e}",
    ".lv-lunch .lv-dot{background:#f59e0b}.lv-lunch .lv-st{color:#f59e0b}",
    ".lv-closed .lv-dot{background:#ef4444}.lv-closed .lv-st{color:#f87171}",
    ".lv-acts{display:flex;gap:6px;margin-top:2px}",
    ".lv-act{background:transparent;border:1px solid var(--bd);color:var(--tx);padding:4px 10px;border-radius:8px;font-size:11.5px;cursor:pointer}",
    ".lv-act:hover{border-color:var(--ac);color:var(--ac)}"
  ].join("");
  document.head.appendChild(st);

  const box = document.createElement("div");
  box.className = "lv-box";
  box.innerHTML =
    '<div class="lv-head"><div><h3>🟢 Что открыто сейчас</h3><div class="lv-time" id="lvTime"></div></div>' +
    '<div class="lv-filter"><button type="button" class="lv-fbtn act" data-f="all">Все</button>' +
    '<button type="button" class="lv-fbtn" data-f="open">Только открытые</button></div></div>' +
    '<div class="lv-list" id="lvList"></div>';
  const grid = wrap.querySelector(".hb-grid");
  wrap.insertBefore(box, grid || null);

  let filter = "all";
  box.querySelectorAll(".lv-fbtn").forEach(function(b) {
    b.onclick = function() {
      filter = b.getAttribute("data-f");
      box.querySelectorAll(".lv-fbtn").forEach(function(x) { x.classList.toggle("act", x === b); });
      render();
    };
  });

  function hm(min) {
    return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");
  }
  function dur(min) {
    const h = Math.floor(min / 60), m = min % 60;
    return (h ? h + " ч " : "") + m + " мин";
  }
  function nextOpenLabel(o, day) {
    for (let k = 1; k <= 7; k++) {
      const d = (day + k) % 7;
      if (o.days.includes(d)) return (k === 1 ? "завтра" : DAY_RU[d]) + " в " + hm(o.open);
    }
    return "";
  }

  function status(o, kz) {
    if (o.always) return { s: "open", t: "Круглосуточно" };
    const day = kz.getUTCDay();
    const m = kz.getUTCHours() * 60 + kz.getUTCMinutes();
    if (!o.days.includes(day)) return { s: "closed", t: "Выходной, откроется " + nextOpenLabel(o, day) };
    if (m < o.open) return { s: "closed", t: "Откроется сегодня в " + hm(o.open) };
    if (m >= o.close) return { s: "closed", t: "Закрыто, откроется " + nextOpenLabel(o, day) };
    if (o.lunch && m >= o.lunch[0] && m < o.lunch[1]) return { s: "lunch", t: "Обед, откроется в " + hm(o.lunch[1]) };
    if (o.lunch && m < o.lunch[0]) return { s: "open", t: "Открыто, обед через " + dur(o.lunch[0] - m) };
    return { s: "open", t: "Открыто, закроется через " + dur(o.close - m) };
  }

  // переход во вкладку «Организации» и перемещение карты к нужному зданию
  function showOnMap(idx) {
    const r3 = document.getElementById("r3");
    if (r3) r3.checked = true;
    if (typeof idx !== "number") return;
    const focus = function() {
      const g = window.aqGis;
      const wrapEl = document.querySelector(".org-gis-wrap");
      if (wrapEl) wrapEl.scrollIntoView({ behavior: "smooth", block: "start" });
      if (!g) return;
      // карта была в скрытой вкладке — пересчитываем размер и ставим вид без анимации
      g.map.invalidateSize();
      g.go(idx, false);
      g.map.setView(g.places[idx].ll, 17, { animate: false });
    };
    if (window.aqGis) setTimeout(focus, 150);
    else document.addEventListener("aqgis-ready", function() { setTimeout(focus, 150); }, { once: true });
  }

  function render() {
    const kz = new Date(Date.now() + TZ_HOURS * 3600 * 1000);
    document.getElementById("lvTime").textContent =
      "Время в Талшыке: " + hm(kz.getUTCHours() * 60 + kz.getUTCMinutes()) + " • " + DAY_RU[kz.getUTCDay()];
    const list = document.getElementById("lvList");
    list.innerHTML = "";
    ORGS.forEach(function(o) {
      const r = status(o, kz);
      if (filter === "open" && r.s !== "open") return;
      const el = document.createElement("div");
      el.className = "lv-item lv-" + r.s;
      el.innerHTML =
        '<div class="lv-name"></div><div class="lv-st"><span class="lv-dot"></span><span class="lv-t"></span></div>' +
        '<div class="lv-acts">' + (o.phone ? '<button type="button" class="lv-act lv-call">📞 ' + o.phone + '</button>' : '') +
        '<button type="button" class="lv-act lv-map">🗺️ На карте</button></div>';
      el.querySelector(".lv-name").textContent = o.n;
      el.querySelector(".lv-t").textContent = r.t;
      const callBtn = el.querySelector(".lv-call");
      if (callBtn) callBtn.onclick = function() { if (typeof cp === "function") cp(o.phone); };
      el.querySelector(".lv-map").onclick = function() { showOnMap(o.pi); };
      list.appendChild(el);
    });
    if (!list.children.length) {
      list.innerHTML = '<div style="color:var(--mt);font-size:13px">Сейчас всё закрыто, кроме экстренных служб: 112, 103, 102.</div>';
    }
  }

  render();
  setInterval(render, 30000);
})();
