(function() {
  // ===== НАСТРОЙКИ =====
  // Центр карты (Википедия: 53.63806, 71.87278).
  const CENTER = [53.63806, 71.87278];

  // Точные координаты зданий [lat, lng] в порядке массива PLACES ниже.
  // Пока null — метка ставится ПРИБЛИЗИТЕЛЬНО (пересчёт со старой схемы).
  // Как заполнить: откройте сайт с ?calib в адресе, перетащите метки на здания
  // на спутнике, нажмите «Скопировать координаты» и вставьте результат сюда.
  const LL = [
    [53.633804, 71.862863], // 0 Акимат
    [53.633534, 71.861718], // 1 Карьерный центр (то же здание, что отдел образования; сдвиг ~13 м, чтобы метки не слипались)
    [53.633414, 71.861718], // 2 Отдел образования
    [53.632558, 71.862846], // 3 Архив
    [53.633712, 71.869569], // 4 Ветеринария
    [53.633294, 71.861718], // 5 Отдел занятости (то же здание, сдвиг ~13 м)
    [53.630325, 71.860777], // 6 ЦОН
    [53.642879, 71.875475], // 7 Больница
    [53.633946, 71.860822], // 8 Отдел полиции
    [53.636660, 71.854564], // 9 Ж/д вокзал
    [53.635070, 71.871495], // 10 СЭС (отдельное здание)
    [53.634431, 71.860805], // 11 Казначейство (здание: казначейство + управление СЭС + статистика)
    [53.634551, 71.860805], // 12 Управление СЭС (то же здание, сдвиг ~13 м, чтобы метки не слипались)
    [53.634671, 71.860805], // 13 Отдел статистики (то же здание, сдвиг ~27 м)
    [53.633198, 71.865474], // 14 ТСШ (Талшыкская средняя школа)
    [53.646040, 71.880822]  // 15 БСШ (Бестерекская средняя школа)
  ];
  // ======================

  const CAL = /[?&]calib/.test(location.search);

  const css = document.createElement("style");
  css.textContent = [
    ".org-gis-wrap{margin-top:26px;display:grid;grid-template-columns:1.45fr 1fr;gap:18px;align-items:stretch}",
    "@media(max-width:900px){.org-gis-wrap{grid-template-columns:1fr}}",
    ".org-gis-map{background:#1e293b;border:1px solid var(--bd);border-radius:18px;overflow:hidden;height:460px;position:relative;z-index:0}",
    "#gisMap{width:100%;height:100%}",
    ".org-gis-side{background:var(--cd);border:1px solid var(--bd);border-radius:18px;padding:20px;display:flex;flex-direction:column;justify-content:space-between;gap:12px}",
    ".org-gis-tag{align-self:flex-start;font-size:11px;font-weight:700;padding:4px 10px;border-radius:10px;background:var(--sf);color:var(--ac)}",
    ".gis-tp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}",
    ".gis-tp-btn{background:var(--in);border:1px solid var(--bd);color:var(--tx);padding:7px 10px;border-radius:10px;font-size:11.5px;font-weight:600;text-align:left;cursor:pointer;transition:.15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".gis-tp-btn:hover,.gis-tp-btn.act{background:var(--sf);border-color:var(--ac);color:var(--ac)}",
    ".org-gis-card{background:var(--in);border:1px solid var(--bd);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:5px}",
    ".org-gis-btns{display:flex;gap:8px;flex-wrap:wrap}",
    ".gis-icon{background:none;border:none}",
    ".gis-icon .gl{position:absolute;left:0;bottom:11px;transform:translateX(-50%);background:#fff;color:#0f172a;border:2px solid var(--c);border-radius:8px;padding:2px 7px;font:800 11px system-ui,sans-serif;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.35)}",
    ".gis-icon .gd{position:absolute;left:-8px;top:-8px;width:16px;height:16px;border-radius:50%;background:var(--c);border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.5)}",
    ".gis-icon.act{z-index:1000!important}",
    ".gis-icon.act .gl{background:#0f172a;color:#fff;border-color:#f59e0b}",
    ".gis-icon.act .gd{background:#f59e0b}"
  ].join("");
  document.head.appendChild(css);

  const p3Cards = document.querySelector("#p3 .cards");
  if (!p3Cards) return;

  // x, y — позиция на старой схеме (нужна только для приблизительной стартовой расстановки)
  const PLACES = [
    { x: 315, y: 175, color: "#059669", ru: "Акимат Акжарского района", kz: "Ақжар ауданының әкімдігі", label: "Акимат района", short: "🏛️ Акимат", labelKz: "Аудан әкімдігі", shortKz: "🏛️ Әкімдік", addr: "с. Талшык, ул. Целинная, 15", phone: "+7 (705) 657-13-47", time: "09:00 – 18:30" },
    { x: 375, y: 192, color: "#0284c7", ru: "Карьерный Центр", kz: "Мансап орталығы", label: "Карьерный центр", short: "💼 Карьерный центр", labelKz: "Мансап орталығы", shortKz: "💼 Мансап орталығы", addr: "с. Талшык, ул. Целинная, 13А", phone: "+7 (71546) 2-14-50", time: "09:00 – 18:30" },
    { x: 235, y: 152, color: "#d97706", ru: "Отдел образования", kz: "Білім бөлімі", label: "Отдел образования", short: "🎓 Отдел образования", labelKz: "Білім бөлімі", shortKz: "🎓 Білім бөлімі", addr: "с. Талшык, ул. Целинная, 13А", phone: "1450 / 79-113", time: "09:00 – 18:30" },
    { x: 295, y: 205, color: "#4f46e5", ru: "Районный архив", kz: "Аудандық архив", label: "Районный архив", short: "📂 Районный архив", labelKz: "Аудандық архив", shortKz: "📂 Аудандық архив", addr: "с. Талшык, ул. Целинная, 20", phone: "+7 (71546) 2-11-30", time: "09:00 – 18:30" },
    { x: 425, y: 125, color: "#16a34a", ru: "Отдел ветеринарии", kz: "Ветеринария бөлімі", label: "Ветеринария", short: "🐄 Ветеринария", labelKz: "Ветеринария", shortKz: "🐄 Ветеринария", addr: "с. Талшык, ул. Газиза Кусаинова", phone: "+7 (71546) 7-90-46", time: "09:00 – 18:30" },
    { x: 270, y: 164, color: "#0d9488", ru: "Отдел занятости и соцпрограмм", kz: "Жұмыспен қамту бөлімі", label: "Отдел занятости", short: "🤝 Отдел занятости", labelKz: "Жұмыспен қамту бөлімі", shortKz: "🤝 Жұмыспен қамту", addr: "с. Талшык, ул. Целинная, 13А", phone: "+7 (71546) 2-14-49", time: "09:00 – 18:30" },
    { x: 345, y: 184, color: "#0ea5e9", ru: "ЦОН Акжарского района", kz: "ХҚКО (ЦОН)", label: "ЦОН (1414)", short: "🏢 ЦОН (1414)", labelKz: "ХҚКО (1414)", shortKz: "🏢 ХҚКО (1414)", addr: "с. Талшык, ул. Победы, 67", phone: "1414", time: "09:00 – 18:00" },
    { x: 515, y: 270, color: "#dc2626", ru: "Акжарская районная больница", kz: "Ақжар аудандық ауруханасы", label: "Районная больница", short: "🏥 Больница (103)", labelKz: "Аудандық аурухана", shortKz: "🏥 Аурухана (103)", addr: "с. Талшык, ул. М. Ауэзова, 19", phone: "103", time: "Круглосуточно (24/7)" },
    { x: 175, y: 215, color: "#1d4ed8", ru: "Отдел полиции Акжарского района", kz: "Ақжар ауданының АПБ", label: "Отдел полиции", short: "🚓 Отдел полиции (102)", labelKz: "АПБ (Полиция)", shortKz: "🚓 АПБ (102)", addr: "с. Талшык, ул. Абылай хана, 7", phone: "102", time: "Круглосуточно (24/7)" },
    { x: 225, y: 280, color: "#64748b", ru: "Ж/д вокзал ст. Талшык", kz: "Талшық теміржол вокзалы", label: "Вокзал ст. Талшык", short: "🚆 Ж/д вокзал", labelKz: "Талшық вокзалы", shortKz: "🚆 Теміржол вокзалы", addr: "с. Талшык, ул. Вокзальная, 18Б", phone: "105", time: "Круглосуточно" },
    { x: 440, y: 105, color: "#7c3aed", ru: "Районное управление СЭС", kz: "Аудандық СЭС басқармасы", label: "СЭС", short: "🧪 СЭС", labelKz: "СЭС", shortKz: "🧪 СЭС", addr: "с. Талшык, ул. Газиза Кусаинова, 28Б", phone: "+7 (71546) 2-19-17", time: "09:00 – 18:30" },
    { x: 270, y: 150, color: "#ca8a04", ru: "Районное казначейство", kz: "Аудандық қазынашылық", label: "Казначейство", short: "🏦 Казначейство", labelKz: "Қазынашылық", shortKz: "🏦 Қазынашылық", addr: "с. Талшык, ул. Абылай хана, 5", phone: "—", time: "09:00 – 18:30" },
    { x: 270, y: 142, color: "#9333ea", ru: "Управление СЭС", kz: "СЭС басқармасы", label: "Управление СЭС", short: "🧪 Управление СЭС", labelKz: "СЭС басқармасы", shortKz: "🧪 СЭС басқармасы", addr: "с. Талшык, ул. Абылай хана, 5", phone: "+7 (71546) 2-19-17", time: "09:00 – 18:30" },
    { x: 270, y: 134, color: "#0f766e", ru: "Отдел статистики", kz: "Статистика бөлімі", label: "Отдел статистики", short: "📊 Статистика", labelKz: "Статистика бөлімі", shortKz: "📊 Статистика", addr: "с. Талшык, ул. Абылай хана, 5", phone: "—", time: "09:00 – 18:30" },
    { x: 330, y: 170, color: "#e11d48", ru: "Талшыкская средняя школа (ТСШ)", kz: "Талшық орта мектебі (ТОМ)", label: "ТСШ", short: "🏫 ТСШ", labelKz: "ТОМ", shortKz: "🏫 ТОМ", addr: "с. Талшык, ул. Целинная, 16", phone: "—", time: "08:00 – 17:00" },
    { x: 470, y: 90, color: "#be185d", ru: "Бестерекская средняя школа (БСШ)", kz: "Бестерек орта мектебі (БОМ)", label: "БСШ", short: "🏫 БСШ", labelKz: "БОМ", shortKz: "🏫 БОМ", addr: "с. Талшык, ул. Иманова, 1", phone: "—", time: "08:00 – 17:00" }
  ];

  // приблизительный пересчёт схемы в координаты (1 ед. ≈ 3 м), точка отсчёта — Акимат
  function fromScheme(x, y) {
    return [CENTER[0] + (175 - y) * 2.695e-5, CENTER[1] + (x - 315) * 4.55e-5];
  }
  let saved = null;
  if (CAL) { try { saved = JSON.parse(localStorage.getItem("aqjar_map_cal") || "null"); } catch (e) {} }
  PLACES.forEach(function(p, i) {
    p.ll = (saved && saved[i]) || LL[i] || fromScheme(p.x, p.y);
  });

  const sideHtml = [
    '<div class="org-gis-side">',
    '<div>',
    '<span class="org-gis-tag" data-ru="Спутниковая карта • с. Талшык" data-kz="Спутниктік карта • Талшық а.">Спутниковая карта • с. Талшык</span>',
    '<h3 style="font-size:18px;margin:8px 0 4px" data-ru="Расположение государственных организаций на карте района" data-kz="Аудан картасындағы мемлекеттік ұйымдардың орналасуы">Расположение государственных организаций на карте района</h3>',
    '<p style="font-size:12px;color:var(--mt)" data-ru="Нажмите на кнопку объекта или на метку на карте для быстрого перехода:" data-kz="Жылдам өту үшін нысан батырмасын немесе картадағы белгіні басыңыз:">Нажмите на кнопку объекта или на метку на карте для быстрого перехода:</p>',
    '</div>',
    '<div class="gis-tp-grid" id="gisTpGrid"></div>',
    '<div class="org-gis-card">',
    '<b id="ogName" style="font-size:15px;color:var(--ac)">Акимат Акжарского района</b>',
    '<div style="font-size:12.5px">📍 <span id="ogAddr">с. Талшык, ул. Целинная, 15</span></div>',
    '<div style="font-size:12.5px">📞 <span id="ogPhone" class="ph" onclick="cp(this.textContent)">+7 (705) 657-13-47</span></div>',
    '<div style="font-size:12px;color:var(--mt)">🕒 <span id="ogTime">09:00 – 18:30</span></div>',
    '</div>',
    '<div id="ogRouteInfo" style="font-size:12.5px;font-weight:600;color:var(--ac);min-height:18px"></div>',
    '<div class="org-gis-btns">',
    '<button type="button" class="btn" id="ogZoomAll" data-ru="🗺️ Весь Талшык" data-kz="🗺️ Бүкіл Талшық">🗺️ Весь Талшык</button>',
    '<button type="button" class="btn" id="ogRouteFoot" data-ru="🧭 Маршрут пешком" data-kz="🧭 Жаяу бағыт">🧭 Маршрут пешком</button>',
    '<button type="button" class="btn" id="ogRouteCar" data-ru="🚗 На машине" data-kz="🚗 Көлікпен">🚗 На машине</button>',
    '<button type="button" class="btn" id="ogLocate" data-ru="📍 Где я" data-kz="📍 Мен қайдамын">📍 Где я</button>',
    '<button type="button" class="btn" id="ogAskAi" data-ru="💬 Уточнить у консультанта" data-kz="💬 Кеңесшіден сұрау">💬 Уточнить у консультанта</button>',
    CAL ? '<button type="button" class="btn" id="ogSeq">🎯 Расставить по очереди</button>' : '',
    CAL ? '<button type="button" class="btn" id="ogCopyLL">📋 Скопировать координаты</button>' : '',
    '</div>',
    CAL ? '<div id="ogHint" style="font-size:12px;color:#f59e0b;font-weight:700"></div>' : '',
    '</div>'
  ].join("");

  const box = document.createElement("div");
  box.className = "org-gis-wrap";
  box.innerHTML = '<div class="org-gis-map" id="gisBox"><div id="gisMap"></div></div>' + sideHtml;
  p3Cards.appendChild(box);

  // загрузка Leaflet (общий загрузчик с game.js)
  window.aqLoadLeaflet = window.aqLoadLeaflet || function(ok, fail) {
    if (window.L && window.L.map) return ok();
    const q = window.__aqLf = window.__aqLf || { ok: [], fail: [], busy: false };
    q.ok.push(ok);
    if (fail) q.fail.push(fail);
    if (q.busy) return;
    q.busy = true;
    const lc = document.createElement("link");
    lc.rel = "stylesheet";
    lc.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(lc);
    const ls = document.createElement("script");
    ls.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    ls.onload = function() { const f = q.ok; q.ok = []; q.fail = []; f.forEach(function(x) { x(); }); };
    ls.onerror = function() { const f = q.fail; q.ok = []; q.fail = []; q.busy = false; f.forEach(function(x) { x(); }); };
    document.head.appendChild(ls);
  };
  window.aqLoadLeaflet(init, function() {
    document.getElementById("gisMap").innerHTML = '<div style="padding:20px;color:#fff;font-size:13px">Не удалось загрузить карту. Проверьте подключение к интернету.</div>';
  });

  function init() {
    let curIdx = 0;
    const markers = [];
    const mapEl = document.getElementById("gisMap");
    const map = L.map(mapEl, { center: CENTER, zoom: 15, scrollWheelZoom: false });
    map.attributionControl.setPrefix('<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">Leaflet</a>');

    // колесо мыши включается после клика по карте, чтобы не мешало прокрутке страницы
    map.on("focus", function() { map.scrollWheelZoom.enable(); });
    map.on("blur", function() { map.scrollWheelZoom.disable(); });

    const imagery = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19, maxNativeZoom: 17,
      attribution: "Tiles © Esri — Esri, Maxar, Earthstar Geographics, GIS User Community"
    });
    const roads = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, maxNativeZoom: 17 });
    const names = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, maxNativeZoom: 17 });
    const sat = L.layerGroup([imagery, roads, names]);
    const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: "© участники OpenStreetMap"
    });
    sat.addTo(map);
    L.control.layers({ "🛰️ Спутник": sat, "🗺️ Схема": osm }, null, { position: "topright" }).addTo(map);

    function curLang() { return (typeof lang !== "undefined" && lang === "kz") ? "kz" : "ru"; }
    function tx(ru, kz) { return curLang() === "kz" ? kz : ru; }
    function pLabel(p) { return curLang() === "kz" ? (p.labelKz || p.label) : p.label; }
    function pShort(p) { return curLang() === "kz" ? (p.shortKz || p.short) : p.short; }
    // перевод адреса и времени (названия улиц оставлены как есть, добавлены казахские слова)
    function trAddr(a) {
      if (curLang() !== "kz") return a;
      return a.replace("с. Талшык", "Талшық ауылы")
        .replace(/ул\.\s*([^,]+)/, "$1 көшесі")
        .replace("привокзальная пл.", "вокзал алаңы")
        .replace("центр", "орталық");
    }
    function trTime(t) {
      if (curLang() !== "kz") return t;
      return t.replace("Круглосуточно", "Тәулік бойы");
    }

    function mkIcon(p, act) {
      return L.divIcon({
        className: "gis-icon" + (act ? " act" : ""),
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        html: '<div style="--c:' + p.color + '"><div class="gl">' + pLabel(p) + '</div><div class="gd"></div></div>'
      });
    }

    function setCard(p) {
      const isKz = (typeof lang !== "undefined" && lang === "kz");
      document.getElementById("ogName").textContent = isKz ? p.kz : p.ru;
      document.getElementById("ogAddr").textContent = trAddr(p.addr);
      document.getElementById("ogPhone").textContent = p.phone;
      document.getElementById("ogPhone").parentNode.style.display = (p.phone && p.phone !== "—") ? "" : "none";
      document.getElementById("ogTime").textContent = trTime(p.time);
    }

    function teleportTo(idx, fly) {
      if (idx !== curIdx) {
        clearRoute();
        const ri = document.getElementById("ogRouteInfo");
        if (ri) ri.textContent = "";
      }
      curIdx = idx;
      setCard(PLACES[idx]);
      document.querySelectorAll(".gis-tp-btn").forEach(function(b, i) { b.classList.toggle("act", i === idx); });
      markers.forEach(function(m, i) { m.setIcon(mkIcon(PLACES[i], i === idx)); m.setZIndexOffset(i === idx ? 1000 : 0); });
      if (fly !== false) map.flyTo(PLACES[idx].ll, 17, { duration: 0.8 });
    }

    PLACES.forEach(function(p, idx) {
      const m = L.marker(p.ll, { icon: mkIcon(p, idx === 0), draggable: CAL, title: p.ru });
      m.on("click", function() { teleportTo(idx); });
      if (CAL) {
        m.on("dragend", function() {
          const ll = m.getLatLng();
          p.ll = [ll.lat, ll.lng];
          try { localStorage.setItem("aqjar_map_cal", JSON.stringify(PLACES.map(function(x) { return x.ll; }))); } catch (e) {}
          setCard(p);
        });
      }
      m.addTo(map);
      markers.push(m);
    });

    const tpGrid = document.getElementById("gisTpGrid");
    PLACES.forEach(function(p, idx) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gis-tp-btn" + (idx === 0 ? " act" : "");
      btn.textContent = pShort(p);
      btn.onclick = function() { teleportTo(idx); };
      tpGrid.appendChild(btn);
    });

    const bounds = L.latLngBounds(PLACES.map(function(p) { return p.ll; }));
    function fitAll() { map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 }); }

    document.getElementById("ogZoomAll").onclick = fitAll;
    document.getElementById("ogAskAi").onclick = function() {
      const r1 = document.getElementById("r1");
      if (r1) r1.checked = true;
      if (typeof qAsk === "function") qAsk(tx("Расскажи подробнее про " + PLACES[curIdx].ru + " в с. Талшык", PLACES[curIdx].kz + " туралы Талшық ауылында толығырақ айтып бер"));
    };

    // ===== маршрут по улицам от местоположения пользователя =====
    let routeLayer = null, walker = null, walkAnim = null;

    function clearRoute() {
      if (walkAnim) { cancelAnimationFrame(walkAnim); walkAnim = null; }
      if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
      if (walker) { map.removeLayer(walker); walker = null; }
    }
    function setInfo(t) {
      const el = document.getElementById("ogRouteInfo");
      if (el) el.textContent = t;
    }
    function fmtDist(m) { return m < 1000 ? Math.round(m) + " м" : (m / 1000).toFixed(1) + " км"; }
    function fmtTime(sec) {
      const m = Math.max(1, Math.round(sec / 60));
      return m < 60 ? m + " мин" : Math.floor(m / 60) + tx(" ч ", " сағ ") + (m % 60) + " мин";
    }
    function animateWalker(pts) {
      walker = L.circleMarker(pts[0], { radius: 7, color: "#fff", weight: 3, fillColor: "#3b82f6", fillOpacity: 1 }).addTo(map);
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + map.distance(pts[i - 1], pts[i]));
      const total = cum[cum.length - 1] || 1;
      const t0 = performance.now(), dur = 4500;
      (function step(now) {
        if (!walker) return;
        const f = Math.min(1, (now - t0) / dur), target = f * total;
        let i = 1;
        while (i < cum.length - 1 && cum[i] < target) i++;
        const seg = (cum[i] - cum[i - 1]) || 1;
        const k = Math.min(1, Math.max(0, (target - cum[i - 1]) / seg));
        walker.setLatLng([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]);
        if (f < 1) walkAnim = requestAnimationFrame(step);
      })(t0);
    }

    function buildRoute(mode) {
      const p = PLACES[curIdx];
      if (!navigator.geolocation) { setInfo(tx("Геолокация недоступна на этом устройстве.", "Бұл құрылғыда геолокация қолжетімсіз.")); return; }
      setInfo(tx("📍 Определяю ваше местоположение…", "📍 Орналасқан жеріңіз анықталуда…"));
      navigator.geolocation.getCurrentPosition(function(pos) {
        const start = [pos.coords.latitude, pos.coords.longitude];
        const acc = Math.round(pos.coords.accuracy);
        const straight = map.distance(start, p.ll);
        clearRoute();
        if (acc > 500) {
          setInfo(tx("⚠️ Геолокация неточная (±" + acc + " м) — маршрут получился бы неверным. Включите GPS/точное местоположение на телефоне или укажите старт кликом в блоке «Гид» выше («Откуда: указать на карте»).", "⚠️ Геолокация дәл емес (±" + acc + " м). Жоғарыдағы «Гид» блогында «Қайдан: картадан көрсету» таңдаңыз."));
          return;
        }
        if (mode === "foot" && straight > 25000) {
          setInfo(tx("Вы далеко от Талшыка (~" + Math.round(straight / 1000) + " км), пешком не дойти. Попробуйте «На машине».", "Сіз Талшықтан алыссыз (~" + Math.round(straight / 1000) + " км), жаяу жету мүмкін емес. «Көлікпен» батырмасын басыңыз."));
          return;
        }
        setInfo(tx("📍 Местоположение определено (±" + acc + " м). Строю маршрут по улицам…", "📍 Орналасқан жеріңіз анықталды (±" + acc + " м). Көшелер бойынша бағыт құрылуда…"));
        const url = "https://routing.openstreetmap.de/" + (mode === "car" ? "routed-car" : "routed-foot") +
          "/route/v1/" + (mode === "car" ? "driving" : "foot") + "/" +
          start[1] + "," + start[0] + ";" + p.ll[1] + "," + p.ll[0] + "?overview=full&geometries=geojson";
        const me = function() { return L.circleMarker(start, { radius: 8, color: "#fff", weight: 3, fillColor: "#3b82f6", fillOpacity: 1 }); };

        fetch(url).then(function(r) { return r.json(); }).then(function(data) {
          if (!data.routes || !data.routes.length) throw new Error("no route");
          const rt = data.routes[0];
          const pts = rt.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
          // OSRM «прилипает» к ближайшей дороге, поэтому линия может заканчиваться
          // не у здания, а где-то в поле. Дорисовываем отрезки до ТОЧНЫХ координат:
          // от вашего местоположения до дороги и от дороги до здания.
          const snapEnd = pts[pts.length - 1];
          const snapStart = pts[0];
          const gapEnd = map.distance(snapEnd, p.ll);
          const gapStart = map.distance(snapStart, start);
          if (gapEnd > 150 || gapStart > 150) throw new Error("bad_route");
          // здания рядом, а роутер повёл в обход квартала — идём напрямую (пешком порог строже, чем на машине)
          if (rt.distance > (mode === "foot" ? straight * 1.7 + 150 : straight * 2.5 + 400)) throw new Error("detour");
          const dashed = { color: "#f59e0b", weight: 4, dashArray: "6 8" };
          const layers = [
            L.polyline(pts, { color: "#ffffff", weight: 9, opacity: 0.85 }),
            L.polyline(pts, { color: "#f59e0b", weight: 5 })
          ];
          if (gapEnd > 3) layers.push(L.polyline([snapEnd, p.ll], dashed));
          if (gapStart > 3) layers.push(L.polyline([start, snapStart], dashed));
          // метка пункта назначения строго по сохранённым координатам организации
          layers.push(L.circleMarker(p.ll, { radius: 9, color: "#fff", weight: 3, fillColor: "#10b981", fillOpacity: 1 }));
          layers.push(me());
          clearRoute();
          routeLayer = L.layerGroup(layers).addTo(map);
          const fitPts = pts.concat([p.ll, start]);
          map.fitBounds(L.latLngBounds(fitPts), { padding: [50, 50], maxZoom: 17 });
          animateWalker(pts.concat([p.ll]));
          setInfo((mode === "car" ? tx("🚗 На машине по улицам: ", "🚗 Көлікпен көшелер бойынша: ") : tx("🚶 Пешком по улицам: ", "🚶 Жаяу көшелер бойынша: ")) +
            fmtDist(rt.distance) + tx(", примерно ", ", шамамен ") + fmtTime(rt.duration) + tx(" • вы определены с точностью ±", " • дәлдік ±") + acc + " м");
        }).catch(function(e) {
          clearRoute();
          routeLayer = L.layerGroup([
            L.polyline([start, p.ll], { color: "#f59e0b", weight: 4, dashArray: "8 8" }),
            me()
          ]).addTo(map);
          map.fitBounds(L.latLngBounds([start, p.ll]), { padding: [50, 50], maxZoom: 17 });
          if (e && e.message === "detour") {
            setInfo(tx("Здание рядом, а по улицам выходит большой крюк — показан прямой путь: ", "Ғимарат жақын, ал көшемен үлкен айналма шығады — тік жол көрсетілді: ") + fmtDist(straight) +
              (mode === "foot" ? tx(", примерно ", ", шамамен ") + fmtTime(straight * 1.15 / 1.35) : "") + ".");
            return;
          }
          setInfo(tx("Дороги к этому объекту на карте OpenStreetMap проложены неполно (или сервис недоступен). Показана прямая: ", "Бұл нысанға жол картада толық салынбаған (немесе сервис қолжетімсіз). Түзу сызық көрсетілді: ") + fmtDist(straight) + ".");
        });
      }, function(err) {
        setInfo(err && err.code === 1
          ? tx("Доступ к геолокации запрещён. Разрешите его в настройках браузера для этого сайта.", "Геолокацияға рұқсат жоқ. Осы сайт үшін оны браузер параметрлерінде рұқсат етіңіз.")
          : tx("Не удалось определить местоположение. Проверьте GPS и интернет.", "Орналасқан жерді анықтау мүмкін болмады. GPS пен интернетті тексеріңіз."));
      }, { enableHighAccuracy: true, timeout: 12000 });
    }

    document.getElementById("ogRouteFoot").onclick = function() { buildRoute("foot"); };
    document.getElementById("ogRouteCar").onclick = function() { buildRoute("car"); };

    let me = null;
    document.getElementById("ogLocate").onclick = function() {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(function(pos) {
        const ll = [pos.coords.latitude, pos.coords.longitude];
        if (me) map.removeLayer(me);
        me = L.circleMarker(ll, { radius: 9, color: "#fff", weight: 3, fillColor: "#3b82f6", fillOpacity: 1 }).addTo(map);
        map.fitBounds(L.latLngBounds([ll, PLACES[curIdx].ll]), { padding: [60, 60], maxZoom: 17 });
      }, function() {
        if (typeof toast === "function") toast("Не удалось определить местоположение");
      });
    };

    const copyBtn = document.getElementById("ogCopyLL");
    if (copyBtn) {
      copyBtn.onclick = function() {
        const txt = "const LL = " + JSON.stringify(PLACES.map(function(p) {
          return [+p.ll[0].toFixed(6), +p.ll[1].toFixed(6)];
        })) + ";";
        console.log(txt);
        try { navigator.clipboard.writeText(txt); } catch (e) {}
        if (typeof toast === "function") toast("📋 Координаты скопированы");
      };
    }

    const seqBtn = document.getElementById("ogSeq");
    if (seqBtn) {
      let seq = null;
      const hint = document.getElementById("ogHint");
      const showHint = function() {
        hint.textContent = seq === null
          ? "Режим настройки: нажмите «Расставить по очереди» или перетаскивайте метки. Потом «Скопировать координаты»."
          : "Кликните на карте, где находится: " + PLACES[seq].ru + " (" + (seq + 1) + "/" + PLACES.length + ")";
      };
      seqBtn.onclick = function() { seq = 0; map.flyTo(PLACES[0].ll, 16, { duration: 0.6 }); showHint(); };
      map.on("click", function(e) {
        if (seq === null) return;
        PLACES[seq].ll = [e.latlng.lat, e.latlng.lng];
        markers[seq].setLatLng(e.latlng);
        try { localStorage.setItem("aqjar_map_cal", JSON.stringify(PLACES.map(function(x) { return x.ll; }))); } catch (er) {}
        seq++;
        if (seq >= PLACES.length) {
          seq = null;
          if (typeof toast === "function") toast("Готово! Нажмите «Скопировать координаты»");
        }
        showHint();
      });
      showHint();
    }

    // карта часто создаётся в скрытой вкладке: пересчитываем размер, когда она появляется
    let fitted = false;
    if (window.ResizeObserver) {
      new ResizeObserver(function() {
        map.invalidateSize();
        if (!fitted && mapEl.clientWidth > 0 && mapEl.clientHeight > 0) {
          fitted = true;
          fitAll();
        }
      }).observe(mapEl);
    } else {
      setTimeout(function() { map.invalidateSize(); fitAll(); }, 500);
    }

    setCard(PLACES[0]);

    // доступ для guide.js
    function refreshLang() {
      document.querySelectorAll(".gis-tp-btn").forEach(function(b, i) { b.textContent = pShort(PLACES[i]); });
      teleportTo(curIdx, false);
    }
    window.aqGis = { map: map, places: PLACES, go: teleportTo, trAddr: trAddr, trTime: trTime, refresh: refreshLang };
    document.dispatchEvent(new Event("aqgis-ready"));

    // следим за переключением языка (RU / KZ): обновляем карту и карточку
    let lastLang = curLang();
    setInterval(function() {
      const l = curLang();
      if (l === lastLang) return;
      lastLang = l;
      refreshLang();
      // событие "aqlang" теперь рассылает i18n.js (если его нет — рассылаем здесь)
      if (!window.aqI18n) document.dispatchEvent(new CustomEvent("aqlang", { detail: l }));
    }, 400);
  }
})();
