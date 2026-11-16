(function() {
  // Подключать ПОСЛЕ hub.js (и live.js, если он есть).
  // Использует тот же спутниковый загрузчик карты, что и game.js (window.aqLoadLeaflet) —
  // убедитесь, что game.js тоже подключён на странице (хотя бы раньше по порядку, либо
  // этот файл сам создаст загрузчик при необходимости).
  const wrap = document.querySelector("#p0 .hb-wrap");
  if (!wrap) return;

  const TZ = 5;               // Казахстан UTC+5
  const WALK_M_MIN = 80;      // средняя скорость пешком ≈ 80 м/мин (используется как запасной вариант)
  const DETOUR = 1.35;        // во столько раз путь по улицам обычно длиннее прямой линии — для грубой прикидки при переборе вариантов
  // Специальный публичный сервер именно для ПЕШЕХОДНЫХ маршрутов (не для машин!).
  // Обычный router.project-osrm.org — только для автомобилей и для ходьбы не годится.
  const OSRM = "https://routing.openstreetmap.de/routed-foot/route/v1/foot/";
  const WD = [1, 2, 3, 4, 5];
  const DAY = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const isRu = function() { return (typeof lang === "undefined" || lang === "ru"); };
  const T = function(ru, kz) { return isRu() ? ru : kz; };

  // Реальные координаты — те же здания, что и в game.js (сверены по 2ГИС).
  // часы работы — как в live.js.
  const PLACES = {
    akimat: { n: "🏛️ Акимат", ll: [53.633804, 71.862863], open: 540, close: 1110, lunch: [780, 870] },
    career: { n: "💼 Карьерный центр", ll: [53.633414, 71.861718], open: 540, close: 1110, lunch: [780, 870] },
    edu: { n: "🎓 Отдел образования", ll: [53.633414, 71.861718], open: 540, close: 1110, lunch: [780, 870] },
    arch: { n: "📂 Архив", ll: [53.632558, 71.862846], open: 540, close: 1110, lunch: [780, 870] },
    vet: { n: "🐄 Ветеринария", ll: [53.633712, 71.869569], open: 540, close: 1110, lunch: [780, 870] },
    con: { n: "🏢 ЦОН", ll: [53.630325, 71.860777], open: 540, close: 1080, lunch: [780, 870] },
    hosp: { n: "🏥 Больница", ll: [53.642879, 71.875475], always: true },
    police: { n: "🚓 Отдел полиции", ll: [53.633946, 71.860822], always: true },
    station: { n: "🚆 Вокзал", ll: [53.63666, 71.854564], always: true },
    ses: { n: "🧪 СЭС", ll: [53.63507, 71.871495], open: 540, close: 1110, lunch: [780, 870] },
    treasury: { n: "🏦 Казначейство", ll: [53.634431, 71.860805], open: 540, close: 1110, lunch: [780, 870] },
    stat: { n: "📊 Отдел статистики", ll: [53.634431, 71.860805], open: 540, close: 1110, lunch: [780, 870] },
    tsh: { n: "🏫 ТСШ", ll: [53.633198, 71.865474], open: 480, close: 1200 },
    bsh: { n: "🏫 БСШ", ll: [53.64604, 71.880822], open: 480, close: 1200 }
  };

  // длительность визита — ориентировочная, подправьте под реальность
  const TASKS = [
    { id: "t1", t: "📄 Справка о стаже", p: "arch", d: 25 },
    { id: "t2", t: "🏛️ Приём в акимате", p: "akimat", d: 30 },
    { id: "t3", t: "🏢 Документы в ЦОНе", p: "con", d: 30 },
    { id: "t4", t: "💼 Грант / занятость", p: "career", d: 30 },
    { id: "t5", t: "🎓 Вопрос по школе / саду", p: "edu", d: 20 },
    { id: "t6", t: "🐄 Ветеринария", p: "vet", d: 20 },
    { id: "t7", t: "🏥 Больница", p: "hosp", d: 40 },
    { id: "t8", t: "🚓 Полиция", p: "police", d: 30 },
    { id: "t9", t: "🧪 СЭС", p: "ses", d: 20 },
    { id: "t10", t: "🏦 Казначейство", p: "treasury", d: 25 },
    { id: "t11", t: "📊 Статистика", p: "stat", d: 20 },
    { id: "t12", t: "🏫 ТСШ", p: "tsh", d: 30 },
    { id: "t13", t: "🏫 БСШ", p: "bsh", d: 30 }
  ];

  const st = document.createElement("style");
  st.textContent = [
    ".rt-box{background:var(--cd);border:1px solid var(--bd);border-radius:18px;padding:20px;display:flex;flex-direction:column;gap:14px}",
    ".rt-box h3{font-size:17px;font-weight:800}",
    ".rt-sub{font-size:12.5px;color:var(--mt)}",
    ".rt-chips{display:flex;flex-wrap:wrap;gap:8px}",
    ".rt-chip{background:var(--in);border:1px solid var(--bd);color:var(--mt);padding:7px 12px;border-radius:10px;font-size:12.5px;font-weight:600;cursor:pointer}",
    ".rt-chip.act{border-color:var(--ac);color:var(--ac);background:var(--sf)}",
    ".rt-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:12.5px;color:var(--mt)}",
    ".rt-row select,.rt-row input{background:var(--in);border:1px solid var(--bd);color:var(--tx);padding:7px 10px;border-radius:10px;font-size:13px}",
    ".rt-geo{background:var(--sf);border:1px solid var(--ac);color:var(--ac);padding:7px 12px;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer}",
    ".rt-geo:disabled{opacity:.5;cursor:default}",
    ".rt-geo-status{font-size:12px;font-weight:600}",
    ".rt-go{background:var(--ac);color:#fff;border:none;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer}",
    ".rt-out{display:grid;grid-template-columns:1.1fr 1fr;gap:16px}",
    "@media(max-width:800px){.rt-out{grid-template-columns:1fr}}",
    ".rt-sum{font-size:14px;font-weight:700;padding:10px 14px;border-radius:12px;background:var(--sf);color:var(--ac)}",
    ".rt-sum.bad{background:rgba(239,68,68,.14);color:#f87171}",
    ".rt-step{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--bd);font-size:13px}",
    ".rt-num{width:24px;height:24px;border-radius:50%;background:var(--ac);color:#fff;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}",
    ".rt-step.fail .rt-num{background:#ef4444}",
    ".rt-time{font-weight:800;min-width:46px}",
    ".rt-note{font-size:11.5px;color:var(--mt)}",
    ".rt-map{background:#1e293b;border:1px solid var(--bd);border-radius:14px;overflow:hidden;height:360px;position:relative;align-self:start}",
    "@media(max-width:800px){.rt-map{height:280px}}",
    "#rtMap{width:100%;height:100%}"
  ].join("");
  document.head.appendChild(st);

  const box = document.createElement("div");
  box.className = "rt-box";
  box.innerHTML =
    '<div><h3>🧭 Умный планировщик дел</h3>' +
    '<div class="rt-sub">Отметьте, что нужно сделать — система выстроит порядок обхода с учётом часов работы, обеда и реальных расстояний между зданиями.</div></div>' +
    '<div class="rt-chips" id="rtChips"></div>' +
    '<div class="rt-row">' +
      '<label>' + T("Я сейчас:", "Мен қазір:") + ' <select id="rtFrom"></select></label>' +
      '<label>' + T("Начать в:", "Бастау уақыты:") + ' <input type="time" id="rtStart"></label>' +
      '<button type="button" class="rt-go" id="rtGo">' + T("Построить маршрут", "Бағытты құру") + '</button>' +
    '</div>' +
    '<div class="rt-geo-status" id="rtGeoStatus"></div>' +
    '<div id="rtOut"></div>';
  const grid = wrap.querySelector(".hb-grid");
  wrap.insertBefore(box, grid || null);

  const sel = new Set();
  const chips = document.getElementById("rtChips");
  TASKS.forEach(function(t) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "rt-chip";
    b.textContent = t.t;
    b.onclick = function() {
      if (sel.has(t.id)) sel.delete(t.id); else sel.add(t.id);
      b.classList.toggle("act", sel.has(t.id));
    };
    chips.appendChild(b);
  });

  const from = document.getElementById("rtFrom");
  const meOpt = document.createElement("option");
  meOpt.value = "me";
  meOpt.textContent = "📍 " + T("Моё местоположение (GPS)", "Менің орналасуым (GPS)");
  from.appendChild(meOpt);
  Object.keys(PLACES).forEach(function(k) {
    const o = document.createElement("option");
    o.value = k;
    o.textContent = PLACES[k].n;
    from.appendChild(o);
  });

  // ---------- геолокация ----------
  let myCoord = null; // [lat, lon], заполняется при выборе пункта «Моё местоположение»
  const geoStatus = document.getElementById("rtGeoStatus");

  function setGeoStatus(text, ok) {
    geoStatus.textContent = text;
    geoStatus.style.color = ok === undefined ? "var(--mt)" : (ok ? "#22c55e" : "#f87171");
  }

  function getMyLocation() {
    return new Promise(function(resolve, reject) {
      if (!navigator.geolocation) {
        setGeoStatus(T("Геолокация не поддерживается этим браузером.", "Бұл браузерде геолокация қолдау көрсетілмейді."), false);
        reject(new Error("no_geo"));
        return;
      }
      setGeoStatus(T("Определяю местоположение…", "Орналасу анықталуда…"));
      navigator.geolocation.getCurrentPosition(function(pos) {
        myCoord = [pos.coords.latitude, pos.coords.longitude];
        const acc = Math.round(pos.coords.accuracy || 0);
        setGeoStatus("📍 " + T("Местоположение определено", "Орналасу анықталды") + (acc ? " (±" + acc + " м)" : ""), true);
        resolve(myCoord);
      }, function(err) {
        myCoord = null;
        let msg = T("Не удалось определить местоположение.", "Орналасуды анықтау мүмкін болмады.");
        if (err && err.code === 1) msg = T("Доступ к местоположению запрещён в браузере — разрешите его в настройках сайта.", "Орналасуға қатынау браузерде тыйым салынған.");
        setGeoStatus(msg, false);
        reject(err);
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    });
  }

  from.addEventListener("change", function() {
    setGeoStatus("");
    if (from.value === "me") getMyLocation().catch(function() {});
  });

  // общий загрузчик Leaflet — тот же, что в game.js/mapa.js (если ещё не создан)
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

  function hm(m) {
    m = Math.round(m);
    return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  }
  function kzNow() { return new Date(Date.now() + TZ * 3600 * 1000); }

  // настоящее расстояние по сфере Земли (haversine), в метрах
  function haversine(a, b) {
    const R = 6371000, toRad = Math.PI / 180;
    const dLat = (b[0] - a[0]) * toRad, dLon = (b[1] - a[1]) * toRad;
    const la1 = a[0] * toRad, la2 = b[0] * toRad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // позиция может быть либо строкой-ключом из PLACES, либо координатами [lat, lon] (геолокация)
  function coordOf(pos) {
    return Array.isArray(pos) ? pos : PLACES[pos].ll;
  }
  function labelOf(pos) {
    return Array.isArray(pos) ? T("📍 Вы (моё местоположение)", "📍 Сіз (менің орналасуым)") : PLACES[pos].n;
  }

  // грубая прикидка пешего времени (прямая × коэффициент объезда) — используется
  // только для перебора порядка обхода, чтобы не делать сотни запросов к роутеру
  function estWalk(a, b) {
    const A = coordOf(a), B = coordOf(b);
    if (A[0] === B[0] && A[1] === B[1]) return 0;
    return Math.max(1, Math.ceil(haversine(A, B) * DETOUR / WALK_M_MIN));
  }

  // настоящий маршрут по улицам через OSRM (бесплатный роутер по OpenStreetMap).
  // Возвращает { minutes, meters, line } или null, если роутер недоступен/не нашёл дорогу —
  // тогда используется запасной вариант (прямая линия + коэффициент объезда).
  async function routeLeg(a, b) {
    const A = coordOf(a), B = coordOf(b);
    if (A[0] === B[0] && A[1] === B[1]) return { minutes: 0, meters: 0, line: [A] };
    const url = OSRM + A[1] + "," + A[0] + ";" + B[1] + "," + B[0] + "?overview=full&geometries=geojson";
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(function() { ctrl.abort(); }, 7000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      const j = await res.json();
      if (j.code !== "Ok" || !j.routes || !j.routes.length) throw new Error("no_route");
      const r = j.routes[0];
      const line = r.geometry.coordinates.map(function(c) { return [c[1], c[0]]; }); // OSRM даёт [lon,lat] → Leaflet хочет [lat,lon]
      // Берём у роутера РАССТОЯНИЕ и путь по улицам — это надёжно (настоящая дорога).
      // А вот ВРЕМЯ считаем сами по нормальной скорости шага человека, а не доверяем
      // чужому «duration»: некоторые публичные роутеры на деле считают по машинной
      // скорости, из-за чего время похода пешком получалось нереально маленьким.
      let meters = Math.round(r.distance);
      // роутер «прилипает» к ближайшей улице: дорисовываем и считаем отрезки от точных координат зданий до дороги
      const dA = haversine(A, line[0]), dB = haversine(line[line.length - 1], B);
      if (dA > 8) { line.unshift(A); meters += Math.round(dA); }
      if (dB > 8) { line.push(B); meters += Math.round(dB); }
      // проверка на здравый смысл: если путь по улицам намного длиннее прямой (здания рядом, но
      // роутер повёл в обход квартала), идём напрямую — как ходят люди между соседними зданиями
      const straight = haversine(A, B);
      if (meters > straight * 1.7 + 150) {
        const dm = Math.round(straight * 1.15);
        return { minutes: Math.max(1, Math.ceil(dm / WALK_M_MIN)), meters: dm, line: [A, B], real: true, direct: true };
      }
      const minutes = Math.max(1, Math.ceil(meters / WALK_M_MIN));
      return { minutes: minutes, meters: meters, line: line, real: true };
    } catch (e) {
      return { minutes: estWalk(a, b), meters: Math.round(haversine(A, B) * DETOUR), line: [A, B], real: false };
    }
  }

  // стартовое время и день
  const now0 = kzNow();
  let planDay = now0.getUTCDay();
  let planNote = "";
  let startDefault = now0.getUTCHours() * 60 + now0.getUTCMinutes();
  if (!WD.includes(planDay)) {
    for (let k = 1; k <= 7; k++) {
      const d = (planDay + k) % 7;
      if (WD.includes(d)) { planNote = T("Сегодня выходной, планирую на ", "Бүгін демалыс күн, ") + DAY[d] + ". "; planDay = d; break; }
    }
    startDefault = 540;
  } else if (startDefault >= 1110) {
    planNote = T("Рабочий день уже закончился, планирую на завтра. ", "Жұмыс күні аяқталды, ертеңге жоспарлаймын. ");
    startDefault = 540;
  }
  document.getElementById("rtStart").value = hm(startDefault);

  // быстрая симуляция одного порядка обхода (для перебора вариантов) — на грубой оценке времени
  function simulateEst(order, startPos, startT) {
    let t = startT, pos = startPos, fails = 0;
    const steps = [];
    order.forEach(function(task) {
      const P = PLACES[task.p];
      const w = estWalk(pos, task.p);
      let begin = t + w, note = "";
      let ok = true;
      if (!P.always) {
        if (begin < P.open) { begin = P.open; note = T("ждать открытия до ", "ашылуын күту ") + hm(P.open); }
        if (P.lunch && begin < P.lunch[1] && begin + task.d > P.lunch[0]) {
          begin = P.lunch[1];
          note = T("перенесено после обеда (", "түскі астан кейінге ауыстырылды (") + hm(P.lunch[0]) + "–" + hm(P.lunch[1]) + ")";
        }
        if (begin + task.d > P.close) ok = false;
      }
      if (ok) {
        steps.push({ task: task, walk: w, begin: begin, end: begin + task.d, note: note, ok: true });
        t = begin + task.d;
        pos = task.p;
      } else {
        fails++;
        steps.push({ task: task, walk: 0, begin: 0, end: 0, note: T("не успеть: закроется в ", "үлгермейді: жабылады ") + hm(P.close), ok: false });
      }
    });
    return { steps: steps, fails: fails, end: t };
  }

  // точная симуляция уже выбранного порядка — с реальным временем ходьбы по улицам (OSRM).
  // Делает по одному запросу на каждый переход (их мало, не больше 7) — поэтому вызывается
  // только один раз, для уже найденного оптимального порядка, а не на каждый вариант перебора.
  async function simulateReal(order, startPos, startT) {
    let t = startT, pos = startPos, fails = 0;
    const steps = [];
    for (const task of order) {
      const P = PLACES[task.p];
      const leg = await routeLeg(pos, task.p);
      let begin = t + leg.minutes, note = "";
      let ok = true;
      if (!P.always) {
        if (begin < P.open) { begin = P.open; note = T("ждать открытия до ", "ашылуын күту ") + hm(P.open); }
        if (P.lunch && begin < P.lunch[1] && begin + task.d > P.lunch[0]) {
          begin = P.lunch[1];
          note = T("перенесено после обеда (", "түскі астан кейінге ауыстырылды (") + hm(P.lunch[0]) + "–" + hm(P.lunch[1]) + ")";
        }
        if (begin + task.d > P.close) ok = false;
      }
      if (!leg.real) note = (note ? note + " • " : "") + T("маршрут приблизительный (нет данных о дороге)", "бағыт болжамды (жол деректері жоқ)");
      if (leg.direct) note = (note ? note + " • " : "") + T("здания рядом, путь напрямую", "ғимараттар жақын, жол тікелей");
      if (ok) {
        steps.push({ task: task, from: pos, walkMin: leg.minutes, walkM: leg.meters, line: leg.line, real: leg.real, begin: begin, end: begin + task.d, note: note, ok: true });
        t = begin + task.d;
        pos = task.p;
      } else {
        fails++;
        steps.push({ task: task, walkMin: 0, walkM: 0, line: [], real: leg.real, begin: 0, end: 0, note: T("не успеть: закроется в ", "үлгермейді: жабылады ") + hm(P.close), ok: false });
      }
    }
    return { steps: steps, fails: fails, end: t };
  }

  function perms(arr) {
    if (arr.length <= 1) return [arr];
    const res = [];
    arr.forEach(function(x, i) {
      const rest = arr.slice(0, i).concat(arr.slice(i + 1));
      perms(rest).forEach(function(p) { res.push([x].concat(p)); });
    });
    return res;
  }

  let rtMap = null, rtLayer = null;
  function destroyMap() {
    if (rtMap) { rtMap.remove(); rtMap = null; rtLayer = null; }
  }

  function renderMap(startPos, best) {
    const mapBox = document.getElementById("rtMapHolder");
    if (!mapBox) return;
    destroyMap();
    window.aqLoadLeaflet(function() {
      rtMap = L.map("rtMap", { center: coordOf(startPos), zoom: 14, scrollWheelZoom: false });
      rtMap.on("focus", function() { rtMap.scrollWheelZoom.enable(); });
      rtMap.on("blur", function() { rtMap.scrollWheelZoom.disable(); });
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19, maxNativeZoom: 17,
        attribution: "Tiles © Esri — Esri, Maxar, Earthstar Geographics, GIS User Community"
      }).addTo(rtMap);
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, maxNativeZoom: 17 }).addTo(rtMap);
      rtLayer = L.layerGroup().addTo(rtMap);

      const pts = [coordOf(startPos)];
      L.circleMarker(coordOf(startPos), { radius: 8, color: "#fff", weight: 2, fillColor: "#0f172a", fillOpacity: 1 })
        .addTo(rtLayer)
        .bindTooltip(labelOf(startPos), { permanent: false, direction: "top" });

      let n = 0;
      best.steps.forEach(function(s) {
        if (!s.ok) return;
        n++;
        const c = PLACES[s.task.p].ll;
        pts.push(c);
        // сегмент маршрута до этой точки: реальная дорога (сплошная линия) или
        // прямая (пунктир), если для этого участка не нашлось данных о дороге
        if (s.line && s.line.length > 1) {
          L.polyline(s.line, { color: "#f59e0b", weight: 4, opacity: s.real ? 0.9 : 0.6, dashArray: s.real ? null : "6 6" }).addTo(rtLayer);
        }
        const mk = L.circleMarker(c, { radius: 10, color: "#fff", weight: 3, fillColor: "#10b981", fillOpacity: 1 }).addTo(rtLayer);
        mk.bindTooltip(String(n) + ". " + PLACES[s.task.p].n, { permanent: true, direction: "top", offset: [0, -10] });
      });
      setTimeout(function() {
        if (!rtMap) return;
        rtMap.invalidateSize();
        rtMap.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 16 });
      }, 60);
    }, function() {
      mapBox.innerHTML = '<div style="padding:20px;color:#fff;font-size:13px">' +
        T("Не удалось загрузить карту. Проверьте интернет.", "Картаны жүктеу мүмкін болмады. Интернетті тексеріңіз.") + '</div>';
    });
  }

  async function build() {
    const out = document.getElementById("rtOut");
    const goBtn = document.getElementById("rtGo");
    const tasks = TASKS.filter(function(t) { return sel.has(t.id); });
    if (!tasks.length) {
      out.innerHTML = '<div class="rt-sub">' + T("Выберите хотя бы одно дело.", "Кемінде бір іс таңдаңыз.") + '</div>';
      destroyMap();
      return;
    }
    if (tasks.length > 7) {
      out.innerHTML = '<div class="rt-sub">' + T("Выберите не больше 7 дел за один раз.", "Бір уақытта 7-ден артық іс таңдамаңыз.") + '</div>';
      destroyMap();
      return;
    }

    let startPos;
    if (from.value === "me") {
      if (!myCoord) {
        try { await getMyLocation(); } catch (e) {
          out.innerHTML = '<div class="rt-sub" style="color:#f87171">' + T("Не удалось определить ваше местоположение — разрешите доступ или выберите здание из списка.", "Орналасуыңызды анықтау мүмкін болмады — рұқсат беріңіз немесе тізімнен ғимарат таңдаңыз.") + '</div>';
          return;
        }
      }
      startPos = myCoord;
    } else {
      startPos = from.value;
    }

    const sv = document.getElementById("rtStart").value || "09:00";
    const startT = parseInt(sv.slice(0, 2), 10) * 60 + parseInt(sv.slice(3, 5), 10);

    // 1) быстрый перебор вариантов обхода по грубой прикидке расстояний
    let bestOrder = null, bestEst = null;
    perms(tasks).forEach(function(o) {
      const r = simulateEst(o, startPos, startT);
      if (!bestEst || r.fails < bestEst.fails || (r.fails === bestEst.fails && r.end < bestEst.end)) { bestEst = r; bestOrder = o; }
    });

    // 2) один точный проход по уже выбранному порядку — с реальным маршрутом по улицам
    goBtn.disabled = true;
    goBtn.textContent = T("Строю маршрут по улицам…", "Көшелер бойынша бағыт құрылуда…");
    out.innerHTML = '<div class="rt-sub">' + T("Считаю реальные расстояния по дорогам…", "Жолдар бойынша нақты қашықтықтар есептелуде…") + '</div>';

    let best;
    try {
      best = await simulateReal(bestOrder, startPos, startT);
    } catch (e) {
      best = bestEst; // на случай полного сбоя роутера — хотя бы приблизительный результат
    }
    goBtn.disabled = false;
    goBtn.textContent = T("Построить маршрут", "Бағытты құру");

    const okSteps = best.steps.filter(function(s) { return s.ok; });
    const sumCls = best.fails ? "rt-sum bad" : "rt-sum";
    const sumTxt = best.fails
      ? planNote + T("Успеете ", "Үлгересіз ") + okSteps.length + T(" из ", " / ") + tasks.length + T(". Остальное — на следующий рабочий день.", ". Қалғаны келесі жұмыс күніне.")
      : planNote + T("Всё успеете! Закончите примерно в ", "Бәріне үлгересіз! Шамамен ") + hm(best.end) + (isRu() ? "." : " аяқтайсыз.");

    let html = '<div class="' + sumCls + '">' + sumTxt + '</div><div class="rt-out" style="margin-top:12px"><div>';
    let n = 0;
    const norm = function(x) { return String(x).replace(/[^\p{L}\p{N}]+/gu, "").toLowerCase(); };
    // «Откуда → Куда» (+ название дела, если оно не повторяет название места)
    const stepTitle = function(s) {
      const P = PLACES[s.task.p];
      const same = (s.from === s.task.p);
      let t = (s.from === undefined || same) ? P.n : labelOf(s.from) + " → " + P.n;
      if (norm(P.n) !== norm(s.task.t)) t += " — " + s.task.t;
      return t;
    };
    best.steps.forEach(function(s) {
      const P = PLACES[s.task.p];
      if (s.ok) {
        n++;
        const distTxt = s.walkM ? " (~" + (s.walkM >= 1000 ? (s.walkM / 1000).toFixed(1) + " км" : s.walkM + " м") + ")" : "";
        html += '<div class="rt-step"><div class="rt-num">' + n + '</div><div><div><span class="rt-time">' + hm(s.begin) + '</span> ' + stepTitle(s) + '</div>' +
          '<div class="rt-note">' + (s.walkMin ? T("пешком по улицам ~", "көшелер бойымен жаяу ~") + s.walkMin + T(" мин", " мин") + distTxt + T(" • ", " • ") : "") + T("визит ~", "бару ~") + s.task.d + T(" мин", " мин") + (s.note ? " • " + s.note : "") + '</div></div></div>';
      } else {
        html += '<div class="rt-step fail"><div class="rt-num">!</div><div><div>' + stepTitle(s) + '</div><div class="rt-note">' + s.note + '</div></div></div>';
      }
    });
    html += '<div class="rt-note" style="margin-top:8px">' + T("Маршрут и время построены по реальным улицам (OpenStreetMap / OSRM). Время визита — ориентировочное; перед поездкой уточняйте график по телефону.", "Бағыт пен уақыт нақты көшелер бойынша құрылған (OpenStreetMap / OSRM).") + '</div></div>';
    html += '<div class="rt-map" id="rtMapHolder"><div id="rtMap"></div></div></div>';
    out.innerHTML = html;

    renderMap(startPos, best);
  }

  document.getElementById("rtGo").onclick = build;
})();
