(function() {
  // Подключать ПОСЛЕ hub.js
  const wrap = document.querySelector("#p0 .hb-wrap");
  if (!wrap) return;

  const SECONDS = 20;
  const MAX_PTS = 100;
  const FALLOFF_M = 250; // очки падают экспоненциально: ~37 очков при ошибке 250 м

  // Координаты — те же, что в mapa.js (из 2ГИС).
  // addr указан только там, где адрес подтверждён. Остальные дополните, когда сверите по 2ГИС.
  const SPOTS = [
    { n: "🏛️ Акимат района", label: "Акимат", ll: [53.633804, 71.862863], addr: "ул. Целинная, 15" },
    { n: "🎓 Отдел образования / Карьерный центр / Отдел занятости (одно здание)", label: "Образование • Карьерный центр • Занятость", ll: [53.633414, 71.861718], addr: "ул. Целинная, 13А" },
    { n: "📂 Районный архив", label: "Архив", ll: [53.632558, 71.862846] },
    { n: "🐄 Ветеринария", label: "Ветеринария", ll: [53.633712, 71.869569], addr: "ул. Газиза Кусаинова" },
    { n: "🧪 СЭС", label: "СЭС", ll: [53.63507, 71.871495], addr: "ул. Абылай хана, 7" },
    { n: "🏦 Казначейство / Управление СЭС / Отдел статистики (одно здание)", label: "Казначейство • СЭС • Статистика", ll: [53.634431, 71.860805] },
    { n: "🏫 ТСШ (Талшыкская средняя школа)", label: "ТСШ", ll: [53.633198, 71.865474] },
    { n: "🏫 БСШ (Бестерекская средняя школа)", label: "БСШ", ll: [53.64604, 71.880822] },
    { n: "🏢 ЦОН", label: "ЦОН", ll: [53.630325, 71.860777] },
    { n: "🏥 Районная больница", label: "Больница", ll: [53.642879, 71.875475] },
    { n: "🚓 РОВД (полиция)", label: "РОВД", ll: [53.633946, 71.860822] },
    { n: "🚆 Ж/д вокзал", label: "Вокзал", ll: [53.63666, 71.854564] }
  ];
  // казахские названия, подписи и адреса
  const KZ = [
    { n: "🏛️ Аудан әкімдігі", l: "Әкімдік" },
    { n: "🎓 Білім бөлімі / Мансап орталығы / Жұмыспен қамту бөлімі (бір ғимарат)", l: "Білім • Мансап орталығы • Жұмыспен қамту" },
    { n: "📂 Аудандық архив", l: "Архив" },
    { n: "🐄 Ветеринария", l: "Ветеринария" },
    { n: "🧪 СЭС", l: "СЭС" },
    { n: "🏦 Қазынашылық / СЭС басқармасы / Статистика бөлімі (бір ғимарат)", l: "Қазынашылық • СЭС • Статистика" },
    { n: "🏫 ТОМ (Талшық орта мектебі)", l: "ТОМ" },
    { n: "🏫 БОМ (Бестерек орта мектебі)", l: "БОМ" },
    { n: "🏢 ХҚКО (ЦОН)", l: "ХҚКО" },
    { n: "🏥 Аудандық аурухана", l: "Аурухана" },
    { n: "🚓 АПБ (полиция)", l: "АПБ" },
    { n: "🚆 Теміржол вокзалы", l: "Вокзал" }
  ];
  SPOTS.forEach(function(s, i) { s.nk = KZ[i].n; s.lk = KZ[i].l; });
  const T = function(ru, kz) { return (typeof lang !== "undefined" && lang === "kz") ? kz : ru; };
  const sName = function(s) { return T(s.n, s.nk); };
  const sLabel = function(s) { return T(s.label, s.lk); };
  const sAddr = function(a) { return T(a, a.replace(/ул\.\s*([^,]+)/, "$1 көшесі")); };
  const ROUNDS = SPOTS.length;
  let screen = "start", endState = null, fbBuild = null;

  // общий загрузчик Leaflet (тот же, что в mapa.js)
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

  const st = document.createElement("style");
  st.textContent = [
    ".gm-box{background:var(--cd);border:1px solid var(--bd);border-radius:18px;padding:20px;display:flex;flex-direction:column;gap:12px}",
    ".gm-box h3{font-size:17px;font-weight:800}",
    ".gm-sub{font-size:12.5px;color:var(--mt)}",
    ".gm-bar{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:13px;font-weight:700}",
    ".gm-q{font-size:18px;font-weight:800;color:var(--ac)}",
    ".gm-time{background:var(--in);border:1px solid var(--bd);padding:4px 12px;border-radius:10px;min-width:64px;text-align:center}",
    ".gm-time.low{color:#f87171;border-color:#f87171}",
    ".gm-map{background:#1e293b;border:1px solid var(--bd);border-radius:14px;overflow:hidden;height:430px;position:relative;z-index:0}",
    "@media(max-width:768px){.gm-map{height:320px}}",
    "#gmMap{width:100%;height:100%;cursor:crosshair}",
    ".gm-fb{font-size:14px;font-weight:700;min-height:20px}",
    ".gm-btn{background:var(--ac);color:#fff;border:none;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;align-self:flex-start}",
    ".gm-btn.sec{background:var(--in);color:var(--tx);border:1px solid var(--bd)}",
    ".gm-row{display:flex;gap:8px;flex-wrap:wrap}",
    ".gm-final{font-size:26px;font-weight:800}"
  ].join("");
  document.head.appendChild(st);

  const box = document.createElement("div");
  box.className = "gm-box";
  wrap.appendChild(box);

  let round = 0, score = 0, order = [], state = "idle", timer = null, left = SECONDS;
  let map = null, layer = null;

  function destroyMap() {
    if (map) { map.remove(); map = null; layer = null; }
  }
  function getBest() {
    try { return parseInt(localStorage.getItem("aqjar_game_best4") || "0", 10) || 0; } catch (e) { return 0; }
  }
  function setBest(v) {
    try { localStorage.setItem("aqjar_game_best4", String(v)); } catch (e) {}
  }
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function showStart() {
    state = "idle";
    screen = "start";
    clearInterval(timer);
    destroyMap();
    const best = getBest();
    box.innerHTML =
      '<div><h3>' + T("🎯 Игра: «Найди на карте»", "🎯 Ойын: «Картадан тап»") + '</h3>' +
      '<div class="gm-sub">' + T(
        "Знаете ли вы Талшык? Вам называют организацию — найдите её на спутниковой карте за " + SECONDS + " секунд. Чем ближе к зданию, тем больше очков (до " + MAX_PTS + " за раунд, всего " + ROUNDS + " раундов).",
        "Талшықты қаншалықты білесіз? Сізге ұйымның атауы айтылады — оны спутниктік картадан " + SECONDS + " секунд ішінде табыңыз. Ғимаратқа жақын болған сайын, ұпай көп (раундына " + MAX_PTS + " ұпайға дейін, барлығы " + ROUNDS + " раунд).") + '</div></div>' +
      '<div class="gm-sub">' + T("🏆 Ваш рекорд на этом устройстве: ", "🏆 Осы құрылғыдағы рекордыңыз: ") + '<b>' + best + '</b> / ' + (ROUNDS * MAX_PTS) + '</div>' +
      '<button type="button" class="gm-btn" id="gmStart">' + T("Играть", "Ойнау") + '</button>';
    document.getElementById("gmStart").onclick = startGame;
  }

  function fitAll() {
    if (!map) return;
    map.fitBounds(L.latLngBounds(SPOTS.map(function(s) { return s.ll; })), { padding: [30, 30], maxZoom: 16, animate: false });
  }

  function startGame() {
    destroyMap();
    round = 0;
    score = 0;
    order = shuffle(SPOTS);
    box.innerHTML =
      '<div class="gm-bar"><span id="gmRound"></span><span id="gmScore"></span><span class="gm-time" id="gmTime"></span></div>' +
      '<div class="gm-q" id="gmQ"></div>' +
      '<div class="gm-map"><div id="gmMap"></div></div>' +
      '<div class="gm-fb" id="gmFb"></div>' +
      '<div class="gm-row"><button type="button" class="gm-btn" id="gmNext" style="display:none">' + T("Дальше →", "Әрі қарай →") + '</button></div>';
    document.getElementById("gmNext").onclick = nextRound;

    window.aqLoadLeaflet(function() {
      map = L.map("gmMap", { center: SPOTS[0].ll, zoom: 15, scrollWheelZoom: false });
      map.on("focus", function() { map.scrollWheelZoom.enable(); });
      map.on("blur", function() { map.scrollWheelZoom.disable(); });
      const imagery = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19, maxNativeZoom: 17,
        attribution: "Tiles © Esri — Esri, Maxar, Earthstar Geographics, GIS User Community"
      });
      const roads = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, maxNativeZoom: 17 });
      imagery.addTo(map);
      roads.addTo(map);
      layer = L.layerGroup().addTo(map);
      map.on("click", onGuess);
      setTimeout(function() { if (map) { map.invalidateSize(); fitAll(); } }, 80);
      nextRound();
    }, function() {
      const m = document.getElementById("gmMap");
      if (m) m.innerHTML = '<div style="padding:20px;color:#fff;font-size:13px">' + T("Не удалось загрузить карту. Проверьте интернет.", "Картаны жүктеу мүмкін болмады. Интернетті тексеріңіз.") + '</div>';
    });
  }

  function nextRound() {
    if (round >= ROUNDS) return showEnd();
    state = "guess";
    screen = "play";
    layer.clearLayers();
    fitAll();
    fbBuild = null;
    document.getElementById("gmFb").textContent = "";
    document.getElementById("gmNext").style.display = "none";
    paintHead();
    left = SECONDS;
    tick();
    clearInterval(timer);
    timer = setInterval(function() {
      left--;
      tick();
      if (left <= 0) {
        clearInterval(timer);
        finishRound(null);
      }
    }, 1000);
  }

  // шапка раунда: номер, очки, вопрос (перерисовывается и при смене языка)
  function paintHead() {
    const r = document.getElementById("gmRound");
    if (!r) return;
    r.textContent = T("Раунд ", "Раунд ") + Math.min(round + (state === "guess" ? 1 : 0), ROUNDS) + "/" + ROUNDS;
    document.getElementById("gmScore").textContent = T("Очки: ", "Ұпай: ") + score;
    const cr = state === "guess" ? order[round] : order[round - 1];
    if (cr) document.getElementById("gmQ").textContent = T("Где находится: " + sName(cr) + "?", sName(cr) + " қайда орналасқан?");
  }

  function tick() {
    const el = document.getElementById("gmTime");
    if (!el) return;
    el.textContent = "⏱ " + left + T(" c", " с");
    el.classList.toggle("low", left <= 5);
  }

  function onGuess(e) {
    if (state !== "guess") return;
    clearInterval(timer);
    finishRound(e.latlng);
  }

  function finishRound(g) {
    state = "reveal";
    const t = order[round];
    const fb = document.getElementById("gmFb");
    let pts = 0;
    const pts4fit = [t.ll];

    let dist = 0;
    if (g) {
      dist = map.distance(g, t.ll);
      pts = Math.round(MAX_PTS * Math.exp(-dist / FALLOFF_M));
      L.polyline([g, t.ll], { color: "#f59e0b", weight: 3, dashArray: "6 6" }).addTo(layer);
      L.circleMarker(g, { radius: 7, color: "#fff", weight: 2, fillColor: "#64748b", fillOpacity: 1 }).addTo(layer);
      pts4fit.push(g);
    }
    // текст результата раунда (пересобирается при смене языка)
    fbBuild = function() {
      let txt;
      if (g) {
        txt = (pts >= 85 ? T("🎯 В точку! ", "🎯 Дәл тидіңіз! ") : pts >= 55 ? T("👍 Неплохо! ", "👍 Жаман емес! ") : pts >= 25 ? T("🤔 Далековато. ", "🤔 Алыстау. ") : T("😅 Промах. ", "😅 Қателестіңіз. ")) +
          "+" + pts + T(" очков • промах ", " ұпай • қателік ") + Math.round(dist) + " м";
      } else {
        txt = T("⏰ Время вышло! +0 очков", "⏰ Уақыт бітті! +0 ұпай");
      }
      if (t.addr) txt += T(" • Адрес: ", " • Мекенжайы: ") + sAddr(t.addr);
      return txt;
    };
    fb.textContent = fbBuild();

    const mk = L.circleMarker(t.ll, { radius: 10, color: "#fff", weight: 3, fillColor: "#10b981", fillOpacity: 1 }).addTo(layer);
    mk.bindTooltip(sLabel(t), { permanent: true, direction: "top", offset: [0, -10] }).openTooltip();
    map.fitBounds(L.latLngBounds(pts4fit), { padding: [70, 70], maxZoom: 17 });


    score += pts;
    round++;
    paintHead();
    const nb = document.getElementById("gmNext");
    nb.textContent = round >= ROUNDS ? T("Результат →", "Нәтиже →") : T("Дальше →", "Әрі қарай →");
    nb.style.display = "inline-block";
  }

  function rank(s) {
    const r = s / (ROUNDS * MAX_PTS);
    if (r >= 0.8) return T("🏅 Старожил", "🏅 Көнекөз");
    if (r >= 0.6) return T("🚲 Знаток района", "🚲 Аудан білгірі");
    if (r >= 0.35) return T("🧭 Местный житель", "🧭 Жергілікті тұрғын");
    return T("🎒 Турист", "🎒 Саяхатшы");
  }

  function showEnd() {
    state = "idle";
    screen = "end";
    clearInterval(timer);
    destroyMap();
    const best = getBest();
    const isNew = score > best;
    if (isNew) setBest(score);
    endState = { isNew: isNew, best: best, score: score };
    renderEnd();
  }

  function renderEnd() {
    const e = endState;
    const sc = e.score;
    const title = rank(sc).replace(/^\S+\s/, "");
    const shareText = T(
      "Я набрал(а) " + sc + " из " + (ROUNDS * MAX_PTS) + " в игре «Найди на карте» — Aqjar Digital, с. Талшык. Звание: " + title + ". Сможешь лучше?",
      "Мен «Картадан тап» ойынында " + (ROUNDS * MAX_PTS) + " ұпайдың " + sc + " ұпайын жинадым — Aqjar Digital, Талшық а. Атағым: " + title + ". Сен жақсырақ жасай аласың ба?");
    box.innerHTML =
      '<div class="gm-final">' + sc + ' / ' + (ROUNDS * MAX_PTS) + '</div>' +
      '<div style="font-size:16px;font-weight:700">' + rank(sc) + '</div>' +
      '<div class="gm-sub">' + (e.isNew ? T("🎉 Новый рекорд!", "🎉 Жаңа рекорд!") : T("Ваш рекорд: ", "Рекордыңыз: ") + e.best) + '</div>' +
      '<div class="gm-row"><button type="button" class="gm-btn" id="gmAgain">' + T("Сыграть ещё", "Қайта ойнау") + '</button>' +
      '<button type="button" class="gm-btn sec" id="gmShare">' + T("📋 Скопировать результат", "📋 Нәтижені көшіру") + '</button></div>';
    document.getElementById("gmAgain").onclick = startGame;
    document.getElementById("gmShare").onclick = function() {
      try { navigator.clipboard.writeText(shareText); } catch (err) {}
      if (typeof toast === "function") toast(T("📋 Скопировано", "📋 Көшірілді"));
    };
  }

  // смена языка RU ⇄ ҚАЗ: перерисовываем текущий экран игры
  document.addEventListener("aqi18n", function() {
    if (screen === "start") showStart();
    else if (screen === "end" && endState) renderEnd();
    else if (screen === "play") {
      paintHead();
      const fbEl = document.getElementById("gmFb");
      if (fbEl && fbBuild && state === "reveal") fbEl.textContent = fbBuild();
      const nb = document.getElementById("gmNext");
      if (nb && nb.style.display !== "none") nb.textContent = round >= ROUNDS ? T("Результат →", "Нәтиже →") : T("Дальше →", "Әрі қарай →");
      tick();
    }
  });

  showStart();
})();
