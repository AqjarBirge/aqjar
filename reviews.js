(function() {
  // Подключать ПОСЛЕ hub.js (в app.html: <script src="reviews.js"></script>)

  // ВСТАВЬТЕ СЮДА URL веб-приложения Google Apps Script (заканчивается на /exec)
  const API_URL = "https://script.google.com/macros/s/AKfycbzGgfd5Stk_RQAQp9MECh5wqVyWhTPGPGetBaMCl6UyX4j0Mrcg_iU076TDbmsacr4C/exec";

  const r1 = document.getElementById("r1");
  const menu = document.querySelector(".side .menu");
  const main = document.querySelector("main.main");
  if (!r1 || !menu || !main) return;

  const isRu = function() { return (typeof lang === "undefined" || lang === "ru"); };
  const T = function(ru, kz) { return isRu() ? ru : kz; };
  const isAdmin = function() { return (typeof adm !== "undefined" && adm === true); };

  // ---------- стили ----------
  const st = document.createElement("style");
  st.textContent = [
    "#r6:checked ~ .side label[for=\"r6\"]{background:var(--ac);color:#fff}",
    "#r6:checked ~ .main #p6{display:flex}",
    ".rv-wrap{padding:24px 28px;overflow-y:auto;flex:1;min-height:0;display:flex;flex-direction:column;gap:18px}",
    ".rv-box{background:var(--cd);border:1px solid var(--bd);border-radius:18px;padding:20px;display:flex;flex-direction:column;gap:12px}",
    ".rv-box h3{font-size:17px;font-weight:800}",
    ".rv-sub{font-size:12.5px;color:var(--mt)}",
    ".rv-top{display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:center}",
    "@media(max-width:640px){.rv-top{grid-template-columns:1fr}}",
    ".rv-avg{text-align:center}",
    ".rv-avg-n{font-size:48px;font-weight:800;line-height:1;color:var(--ac)}",
    ".rv-stars-static{color:#f59e0b;font-size:18px;letter-spacing:2px}",
    ".rv-bars{display:flex;flex-direction:column;gap:5px}",
    ".rv-bar{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--mt)}",
    ".rv-bar-track{flex:1;height:8px;background:var(--in);border-radius:6px;overflow:hidden}",
    ".rv-bar-fill{height:100%;background:#f59e0b;border-radius:6px;transition:width .4s}",
    ".rv-pick{display:flex;gap:6px}",
    ".rv-star{background:none;border:none;font-size:34px;line-height:1;cursor:pointer;color:var(--bd);padding:0;transition:transform .12s,color .12s}",
    ".rv-star.on{color:#f59e0b}",
    ".rv-star:hover{transform:scale(1.15)}",
    ".rv-label{font-size:13px;font-weight:700;min-height:18px;color:var(--ac)}",
    ".rv-in{background:var(--in);border:1px solid var(--bd);color:var(--tx);padding:10px 12px;border-radius:10px;font-size:16px;outline:none;width:100%;font-family:inherit}",
    ".rv-in:focus{border-color:var(--ac)}",
    "textarea.rv-in{min-height:84px;resize:vertical}",
    ".rv-hp{position:absolute;left:-9999px;opacity:0;height:0;width:0}",
    ".rv-btn{background:var(--ac);color:#fff;border:none;padding:11px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;align-self:flex-start}",
    ".rv-btn:disabled{opacity:.5;cursor:default}",
    ".rv-list{display:flex;flex-direction:column;gap:10px}",
    ".rv-item{background:var(--in);border:1px solid var(--bd);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:6px}",
    ".rv-item.mine{border-color:var(--ac)}",
    ".rv-ihead{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:13px}",
    ".rv-itext{font-size:14px;line-height:1.5;word-break:break-word;white-space:pre-wrap}",
    ".rv-date{font-size:11.5px;color:var(--mt)}",
    ".rv-del{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3);padding:4px 10px;border-radius:8px;font-size:11.5px;font-weight:700;cursor:pointer;align-self:flex-start}",
    ".rv-del:hover{background:#ef4444;color:#fff}",
    ".rv-diag{border-color:rgba(148,163,184,.3)}",
    ".rv-diag summary{cursor:pointer;font-size:13px;font-weight:700;color:var(--mt)}",
    ".rv-diag pre{font-size:11.5px;background:var(--in);border:1px solid var(--bd);border-radius:10px;padding:10px;overflow-x:auto;white-space:pre-wrap;word-break:break-all;margin-top:10px}",
    ".rv-diag .rv-btn{background:var(--in);color:var(--tx);border:1px solid var(--bd);margin-top:8px}",
    ".rv-ok{color:#22c55e}",
    ".rv-bad{color:#f87171}"
  ].join("");
  document.head.appendChild(st);

  // ---------- вкладка в меню ----------
  const r6 = document.createElement("input");
  r6.type = "radio"; r6.name = "t"; r6.id = "r6"; r6.className = "hide";
  r1.parentNode.insertBefore(r6, r1);

  const lbl = document.createElement("label");
  lbl.setAttribute("for", "r6");
  lbl.className = "tbtn";
  lbl.setAttribute("data-ru", "⭐ Отзывы");
  lbl.setAttribute("data-kz", "⭐ Пікірлер");
  lbl.textContent = isRu() ? "⭐ Отзывы" : "⭐ Пікірлер";
  menu.appendChild(lbl);

  const sec = document.createElement("section");
  sec.id = "p6";
  sec.className = "pnl";
  sec.innerHTML =
    '<div class="rv-wrap">' +
      '<div class="rv-box">' +
        '<h3>⭐ Оценка сервиса</h3>' +
        '<div class="rv-top">' +
          '<div class="rv-avg"><div class="rv-avg-n" id="rvAvg">–</div>' +
            '<div class="rv-stars-static" id="rvAvgStars">☆☆☆☆☆</div>' +
            '<div class="rv-sub" id="rvCount"></div></div>' +
          '<div class="rv-bars" id="rvBars"></div>' +
        '</div>' +
      '</div>' +
      '<div class="rv-box">' +
        '<h3 id="rvFormTitle">Оставьте отзыв</h3>' +
        '<div class="rv-pick" id="rvPick"></div>' +
        '<div class="rv-label" id="rvLabel"></div>' +
        '<input type="text" class="rv-in" id="rvName" maxlength="40" placeholder="Ваше имя (необязательно)">' +
        '<textarea class="rv-in" id="rvText" maxlength="500" placeholder="Что понравилось, что улучшить? (необязательно)"></textarea>' +
        '<input type="text" class="rv-hp" id="rvHp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<button type="button" class="rv-btn" id="rvSend">Отправить отзыв</button>' +
        '<div class="rv-sub" id="rvMsg"></div>' +
      '</div>' +
      '<div class="rv-box"><h3 id="rvListTitle">Отзывы жителей</h3><div class="rv-list" id="rvList"></div></div>' +
      '<details class="rv-box rv-diag" id="rvDiagBox" style="display:none"><summary>🔧 Диагностика подключения</summary>' +
        '<div class="rv-sub" style="margin-top:8px">Адрес сервера:</div>' +
        '<pre id="rvDiagUrl"></pre>' +
        '<button type="button" class="rv-btn" id="rvDiagBtn">Проверить соединение</button>' +
        '<pre id="rvDiagOut" style="display:none"></pre>' +
      '</details>' +
    '</div>';
  main.appendChild(sec);

  // ---------- состояние ----------
  const LABELS_RU = ["", "😞 Плохо", "😕 Так себе", "😐 Нормально", "🙂 Хорошо", "🤩 Отлично!"];
  const LABELS_KZ = ["", "😞 Нашар", "😕 Орташадан төмен", "😐 Қанағаттанарлық", "🙂 Жақсы", "🤩 Тамаша!"];
  let myUid = null;
  try {
    myUid = localStorage.getItem("aqjar_my_uid");
    if (!myUid) {
      myUid = "u_" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("aqjar_my_uid", myUid);
    }
  } catch (e) { myUid = "u_" + Math.random().toString(36).slice(2, 10); }

  let picked = 0;
  let data = { count: 0, avg: 0, dist: [0, 0, 0, 0, 0], items: [] };
  let sending = false;

  const $ = function(id) { return document.getElementById(id); };
  const apiReady = function() { return API_URL && API_URL.indexOf("ВСТАВЬТЕ") === -1; };

  $("rvDiagUrl").textContent = apiReady() ? API_URL : T("(URL ещё не вставлен в reviews.js)", "(URL reviews.js файлына әлі енгізілмеген)");

  // ---------- JSONP: надёжная связь с Apps Script без проблем с CORS ----------
  let jsonpN = 0;
  function jsonp(url, timeoutMs) {
    return new Promise(function(resolve, reject) {
      const cbName = "aqjar_rv_cb_" + (jsonpN++) + "_" + Date.now();
      const script = document.createElement("script");
      let done = false;
      const timer = setTimeout(function() {
        if (done) return;
        done = true;
        cleanup();
        reject(new Error("timeout"));
      }, timeoutMs || 12000);
      function cleanup() {
        clearTimeout(timer);
        try { delete window[cbName]; } catch (e) {}
        if (script.parentNode) script.parentNode.removeChild(script);
      }
      window[cbName] = function(payload) {
        if (done) return;
        done = true;
        cleanup();
        resolve(payload);
      };
      script.onerror = function() {
        if (done) return;
        done = true;
        cleanup();
        reject(new Error("script_load_error"));
      };
      const sep = url.indexOf("?") === -1 ? "?" : "&";
      script.src = url + sep + "callback=" + cbName + "&_=" + Date.now();
      document.head.appendChild(script);
    });
  }

  function apiCall(params) {
    if (!apiReady()) return Promise.reject(new Error("api_not_configured"));
    const url = new URL(API_URL);
    Object.keys(params).forEach(function(k) {
      if (params[k] !== undefined && params[k] !== null) url.searchParams.set(k, params[k]);
    });
    return jsonp(url.toString());
  }

  // ---------- выбор звёзд ----------
  const pick = $("rvPick");
  const starBtns = [];
  for (let i = 1; i <= 5; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "rv-star";
    b.textContent = "★";
    b.setAttribute("aria-label", i + " / 5");
    b.onclick = function() { setPick(i); };
    b.onmouseenter = function() { paint(i); };
    pick.appendChild(b);
    starBtns.push(b);
  }
  pick.onmouseleave = function() { paint(picked); };

  function paint(n) {
    starBtns.forEach(function(b, i) { b.classList.toggle("on", i < n); });
    $("rvLabel").textContent = n ? (isRu() ? LABELS_RU[n] : LABELS_KZ[n]) : "";
  }
  function setPick(n) { picked = n; paint(n); }

  // ---------- отрисовка ----------
  function starsText(n) {
    n = Math.round(n);
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  }

  function fmtCount(n) {
    if (!isRu()) return n + " баға";
    const m10 = n % 10, m100 = n % 100;
    const w = (m10 === 1 && m100 !== 11) ? "оценка" : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? "оценки" : "оценок";
    return n + " " + w;
  }

  function errText(code) {
    const map = {
      bad_uid: T("Техническая ошибка (uid). Обновите страницу (F5).", "Техникалық қате (uid). Бетті жаңартыңыз (F5)."),
      bad_stars: T("Сначала поставьте оценку от 1 до 5 звёзд.", "Алдымен 1-ден 5-ке дейін баға қойыңыз."),
      admin_pass_not_configured: T("Пароль удаления ещё не настроен в Apps Script (ADMIN_PASS).", "Жою құпиясөзі (ADMIN_PASS) әлі орнатылмаған."),
      wrong_pass: T("Неверный пароль модератора.", "Модератор құпиясөзі қате."),
      no_id: T("Не удалось определить отзыв.", "Пікір анықталмады."),
      not_found: T("Отзыв не найден (возможно, уже удалён).", "Пікір табылмады (мүмкін, әлдеқашан жойылған)."),
      api_not_configured: T("В reviews.js не вставлен URL сервера.", "reviews.js файлына сервер URL-і енгізілмеген."),
      timeout: T("Сервер не ответил вовремя. Проверьте интернет и попробуйте снова.", "Сервер уақытында жауап бермеді. Интернетті тексеріп, қайталап көріңіз."),
      script_load_error: T("Не удалось связаться с сервером. Проверьте URL в reviews.js.", "Сервермен байланыс орнатылмады. reviews.js файлындағы URL-ді тексеріңіз.")
    };
    return map[code] || (T("Ошибка сервера: ", "Сервер қатесі: ") + code);
  }

  function render() {
    $("rvAvg").textContent = data.count ? data.avg.toFixed(1).replace(".", ",") : "–";
    $("rvAvgStars").textContent = starsText(data.avg);
    $("rvCount").textContent = data.count ? fmtCount(data.count) : T("Пока нет оценок", "Әзірге баға жоқ");

    const bars = $("rvBars");
    bars.innerHTML = "";
    for (let s = 5; s >= 1; s--) {
      const c = data.dist[s - 1] || 0;
      const pct = data.count ? Math.round(c / data.count * 100) : 0;
      const row = document.createElement("div");
      row.className = "rv-bar";
      const a = document.createElement("span");
      a.textContent = s + " ★";
      a.style.minWidth = "28px";
      const tr = document.createElement("div");
      tr.className = "rv-bar-track";
      const f = document.createElement("div");
      f.className = "rv-bar-fill";
      f.style.width = pct + "%";
      tr.appendChild(f);
      const n = document.createElement("span");
      n.textContent = c;
      n.style.minWidth = "24px";
      n.style.textAlign = "right";
      row.appendChild(a); row.appendChild(tr); row.appendChild(n);
      bars.appendChild(row);
    }

    const list = $("rvList");
    list.innerHTML = "";
    if (!data.items.length) {
      const e = document.createElement("div");
      e.className = "rv-sub";
      e.textContent = apiReady() ? T("Отзывов пока нет. Будьте первым!", "Пікір әзірге жоқ. Бірінші болыңыз!") :
        T("Подключите Google Apps Script (см. инструкцию), чтобы отзывы сохранялись.", "Пікірлерді сақтау үшін Google Apps Script қосыңыз.");
      list.appendChild(e);
      return;
    }
    data.items.forEach(function(x) {
      const it = document.createElement("div");
      it.className = "rv-item" + (x.mine ? " mine" : "");
      const head = document.createElement("div");
      head.className = "rv-ihead";
      const nm = document.createElement("b");
      nm.textContent = "👤 " + (x.name || T("Житель", "Тұрғын")) + (x.mine ? T(" (вы)", " (сіз)") : "");
      const stars = document.createElement("span");
      stars.className = "rv-stars-static";
      stars.textContent = starsText(x.stars);
      head.appendChild(nm); head.appendChild(stars);
      it.appendChild(head);
      if (x.text) {
        const t = document.createElement("div");
        t.className = "rv-itext";
        t.textContent = x.text;
        it.appendChild(t);
      }
      const d = document.createElement("div");
      d.className = "rv-date";
      d.textContent = x.date || "";
      it.appendChild(d);
      if (isAdmin() && x.id) {
        const del = document.createElement("button");
        del.type = "button";
        del.className = "rv-del";
        del.textContent = T("🗑 Удалить", "🗑 Жою");
        del.onclick = function() { deleteReview(x.id); };
        it.appendChild(del);
      }
      list.appendChild(it);
    });
  }

  function applyLang() {
    $("rvFormTitle").textContent = T("Оставьте отзыв", "Пікір қалдырыңыз");
    $("rvName").placeholder = T("Ваше имя (необязательно)", "Атыңыз (міндетті емес)");
    $("rvText").placeholder = T("Что понравилось, что улучшить? (необязательно)", "Не ұнады, нені жақсартуға болады? (міндетті емес)");
    $("rvSend").textContent = T("Отправить отзыв", "Пікірді жіберу");
    $("rvListTitle").textContent = T("Отзывы жителей", "Тұрғындардың пікірлері");
    paint(picked);
    render();
  }

  // ---------- загрузка с сервера ----------
  async function load() {
    if (!apiReady()) { render(); return; }
    try {
      const j = await apiCall({ action: "list", uid: myUid });
      if (j && j.ok) {
        data = { count: j.count || 0, avg: j.avg || 0, dist: j.dist || [0, 0, 0, 0, 0], items: j.items || [] };
        render();
      } else {
        $("rvList").innerHTML = '<div class="rv-sub rv-bad">' + T("Не удалось загрузить отзывы: ", "Пікірлерді жүктеу мүмкін болмады: ") +
          (j && j.error ? errText(j.error) : "?") + '</div>';
      }
    } catch (e) {
      $("rvList").innerHTML = '<div class="rv-sub rv-bad">' + errText(String(e.message || e)) + '</div>';
    }
  }

  // ---------- отправка ----------
  function setMsg(text, bad) {
    const m = $("rvMsg");
    m.textContent = text;
    m.className = "rv-sub " + (bad ? "rv-bad" : "rv-ok");
  }

  $("rvSend").onclick = async function() {
    if (sending) return;
    if (!picked) { setMsg(T("Сначала поставьте оценку от 1 до 5 звёзд.", "Алдымен 1-ден 5-ке дейін баға қойыңыз."), true); return; }
    if ($("rvHp").value) return; // бот
    if (!apiReady()) { setMsg(errText("api_not_configured"), true); return; }

    let last = 0;
    try { last = parseInt(localStorage.getItem("aqjar_rv_last") || "0", 10) || 0; } catch (e) {}
    if (Date.now() - last < 15000) { setMsg(T("Подождите несколько секунд перед повторной отправкой.", "Қайта жіберер алдында бірнеше секунд күтіңіз."), true); return; }

    const name = $("rvName").value.trim().slice(0, 40);
    const text = $("rvText").value.trim().slice(0, 500);
    sending = true;
    $("rvSend").disabled = true;
    setMsg(T("Отправляю…", "Жіберілуде…"));

    try {
      const j = await apiCall({ action: "add", uid: myUid, name: name, stars: picked, text: text, hp: $("rvHp").value });
      if (j && j.ok) {
        try { localStorage.setItem("aqjar_rv_last", String(Date.now())); } catch (e) {}
        setMsg(T("Спасибо за отзыв! 💚", "Пікіріңіз үшін рахмет! 💚"));
        if (typeof toast === "function") toast("⭐ " + T("Отзыв отправлен", "Пікір жіберілді"));
        $("rvText").value = "";
        await load();
      } else {
        setMsg((j && j.error ? errText(j.error) : T("Не удалось отправить отзыв.", "Пікірді жіберу мүмкін болмады.")), true);
      }
    } catch (e) {
      setMsg(errText(String(e.message || e)), true);
    }
    sending = false;
    $("rvSend").disabled = false;
  };

  // ---------- удаление (модератор) ----------
  function getAdminPass() {
    let p = "";
    try { p = sessionStorage.getItem("aqjar_adm_pass") || ""; } catch (e) {}
    if (!p) {
      p = window.prompt(T("Пароль модератора для удаления отзывов:", "Пікірлерді жою үшін модератор құпиясөзі:")) || "";
      if (p) { try { sessionStorage.setItem("aqjar_adm_pass", p); } catch (e) {} }
    }
    return p;
  }

  async function deleteReview(id) {
    if (!apiReady()) return;
    const pass = getAdminPass();
    if (!pass) return;
    try {
      const j = await apiCall({ action: "delete", id: id, pass: pass });
      if (j && j.ok) {
        if (typeof toast === "function") toast("🗑 " + T("Отзыв удалён", "Пікір жойылды"));
        await load();
      } else {
        try { sessionStorage.removeItem("aqjar_adm_pass"); } catch (e) {}
        alert((j && j.error ? errText(j.error) : T("Не удалось удалить отзыв.", "Пікірді жою мүмкін болмады.")));
      }
    } catch (e) {
      alert(errText(String(e.message || e)));
    }
  }

  // ---------- диагностика на странице ----------
  $("rvDiagBtn").onclick = async function() {
    const out = $("rvDiagOut");
    out.style.display = "block";
    out.textContent = T("Проверяю…", "Тексерілуде…");
    try {
      const j = await apiCall({ action: "where" });
      out.textContent = JSON.stringify(j, null, 2);
    } catch (e) {
      out.textContent = T("Ошибка: ", "Қате: ") + String(e.message || e);
    }
  };

  function applyAdminVisibility() {
    $("rvDiagBox").style.display = isAdmin() ? "flex" : "none";
  }

  // реагируем на смену языка и режима администратора (проверяем раз в секунду)
  let prevLang = isRu();
  let prevAdm = isAdmin();
  applyAdminVisibility();
  setInterval(function() {
    if (isRu() !== prevLang) { prevLang = isRu(); applyLang(); }
    if (isAdmin() !== prevAdm) { prevAdm = isAdmin(); render(); applyAdminVisibility(); }
  }, 1000);

  applyLang();
  load();
  setInterval(load, 60000);
})();
