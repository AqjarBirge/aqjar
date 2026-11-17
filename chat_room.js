(function() {
  // Единый общий чат жителей. Подключать в app.html ПОСЛЕ hub.js (рядом с остальными скриптами).
  // Переводится только интерфейс (RU/KZ). Сообщения и ники пользователей НЕ переводятся.
  const API_URL = "https://script.google.com/macros/s/AKfycbwMlybRapJwBYwnQVMOo6UZjnz9NIW1O-oTxVjJq_SAl4gkAAbmXz6COAWN9yfNxiXB/exec";
  const POLL_MS = 5000;
  const MAX_LEN = 300;

  const r1 = document.getElementById("r1");
  const menu = document.querySelector(".side .menu");
  const main = document.querySelector("main.main");
  if (!r1 || !menu || !main) return;

  // отдельный id пользователя для чата (не совпадает с id в «Идеях»)
  // хранится сразу в двух местах (localStorage + cookie на 2 года): если очистить одно, id восстановится из другого
  function readCookieUid() {
    const m = document.cookie.match(/(?:^|; )aqjar_chat_uid=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  }
  let uid = "";
  try { uid = localStorage.getItem("aqjar_chat_uid") || ""; } catch (e) {}
  if (!uid) uid = readCookieUid();
  if (!uid || uid.length > 80) {
    uid = "c_" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  }
  try { localStorage.setItem("aqjar_chat_uid", uid); } catch (e) {}
  try { document.cookie = "aqjar_chat_uid=" + encodeURIComponent(uid) + "; max-age=63072000; path=/; SameSite=Lax"; } catch (e) {}

  const T = function(ru, kz) { return (typeof lang !== "undefined" && lang === "kz") ? kz : ru; };

  const ERR = {
    nick_bad: ["Ник: 2–20 символов — буквы, цифры, пробел, _ . -", "Ник: 2–20 таңба — әріп, сан, бос орын, _ . -"],
    nick_taken: ["Этот ник уже занят", "Бұл ник бос емес"],
    limit: ["Ник уже менялся, больше нельзя", "Ник бір рет өзгертілген, енді болмайды"],
    no_nick: ["Сначала задайте ник", "Алдымен ник қойыңыз"],
    rate: ["Слишком часто, подождите пару секунд", "Тым жиі, бірнеше секунд күтіңіз"],
    empty: ["Пустое сообщение", "Бос хабарлама"],
    auth: ["Неверный пароль администратора", "Әкімші құпиясөзі қате"],
    banned: ["Вы заблокированы администратором", "Сіз әкімшімен бұғатталғансыз"],
    muted: ["Вы в муте — писать в чат нельзя", "Сіз мутта — чатқа жазуға болмайды"],
    punished: ["Пока действует наказание, менять ник нельзя", "Жаза әрекет еткенше никті өзгертуге болмайды"],
    not_found: ["Не найдено", "Табылмады"],
    net: ["Нет связи с сервером", "Сервермен байланыс жоқ"]
  };
  function errText(code) {
    if (code && !ERR[code]) return T("Ошибка сервера: ", "Сервер қатесі: ") + code; // например unknown_action — скрипт не обновлён
    const e = ERR[code] || ERR.net;
    return T(e[0], e[1]);
  }
  function say(msg) {
    if (typeof toast === "function") toast(msg);
    else alert(msg);
  }

  // ---------- стили ----------
  const st = document.createElement("style");
  st.textContent = `
    #r20:checked ~ .side label[for="r20"] { background: var(--ac); color: #fff; }
    #r20:checked ~ .main #p20 { display: flex; }
    #p20 { flex-direction: column; min-height: 0; }
    .cr-bar { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; padding: 12px 18px; border-bottom: 1px solid var(--bd); background: var(--cd); flex-shrink: 0; }
    .cr-me { font-size: 13px; color: var(--mt); }
    .cr-me b { color: var(--tx); }
    .cr-small { background: transparent; border: 1px solid var(--bd); color: var(--tx); padding: 5px 12px; border-radius: 10px; font-size: 12px; cursor: pointer; }
    .cr-small:hover { border-color: var(--ac); color: var(--ac); }
    .cr-list { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 16px 18px; display: flex; flex-direction: column; gap: 8px; }
    .cr-empty { margin: auto; text-align: center; color: var(--mt); font-size: 14px; max-width: 360px; }
    .cr-msg { max-width: 78%; background: var(--cd); border: 1px solid var(--bd); border-radius: 14px; padding: 8px 12px; align-self: flex-start; overflow-wrap: anywhere; }
    .cr-msg.mine { align-self: flex-end; background: var(--sf); border-color: var(--ac); }
    .cr-head { display: flex; gap: 8px; align-items: baseline; font-size: 12px; color: var(--mt); }
    .cr-head b { color: var(--ac); font-size: 12.5px; }
    .cr-text { font-size: 14px; white-space: pre-wrap; margin-top: 2px; }
    .cr-del { background: none; border: none; color: #f87171; cursor: pointer; font-size: 12px; margin-left: auto; }
    .cr-del + .cr-ban-btn { margin-left: 0; }
    .cr-input { display: flex; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--bd); background: var(--gl, var(--cd)); flex-shrink: 0; }
    .cr-input input { flex: 1 1 0; min-width: 0; background: var(--in); border: 1px solid var(--bd); color: var(--tx); border-radius: 12px; padding: 10px 14px; font-size: 14px; outline: none; }
    .cr-input input:focus { border-color: var(--ac); }
    .cr-input button { background: var(--ac); color: #fff; border: none; border-radius: 12px; padding: 0 18px; font-weight: 700; cursor: pointer; }
    .cr-input button:disabled, .cr-input input:disabled { opacity: .5; cursor: not-allowed; }
    .cr-nickbox { display: flex; gap: 8px; padding: 14px 18px; border-bottom: 1px solid var(--bd); background: var(--cd); flex-wrap: wrap; align-items: center; flex-shrink: 0; }
    .cr-nickbox input { flex: 1 1 180px; background: var(--in); border: 1px solid var(--bd); color: var(--tx); border-radius: 10px; padding: 9px 12px; font-size: 14px; outline: none; }
    .cr-nickbox button { background: var(--ac); color: #fff; border: none; border-radius: 10px; padding: 9px 16px; font-weight: 700; cursor: pointer; }
    .cr-ban-btn { background: none; border: none; cursor: pointer; font-size: 12px; }
    .cr-banbox { padding: 8px 18px; border-bottom: 1px solid var(--bd); background: var(--cd); font-size: 12.5px; flex-shrink: 0; }
    .cr-banbox summary { cursor: pointer; font-weight: 700; color: var(--mt); }
    .cr-banrow { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 0; }
    .cr-banned { padding: 10px 18px; color: #f87171; font-size: 13px; font-weight: 700; flex-shrink: 0; }
    .cr-hint { font-size: 12px; color: var(--mt); flex: 1 1 100%; }
    .cr-mod-bg { position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 3000; display: flex; align-items: center; justify-content: center; padding: 14px; }
    .cr-mod { background: var(--cd); border: 1px solid var(--bd); border-radius: 16px; padding: 16px; width: min(320px, 100%); display: flex; flex-direction: column; gap: 8px; }
    .cr-mod h4 { font-size: 14px; margin-bottom: 4px; overflow-wrap: anywhere; }
    .cr-mod button { background: var(--in); border: 1px solid var(--bd); color: var(--tx); border-radius: 10px; padding: 10px 12px; font-size: 13px; font-weight: 600; cursor: pointer; text-align: left; }
    .cr-mod button:hover { border-color: var(--ac); color: var(--ac); }
    .cr-mod .cr-mod-cancel { text-align: center; color: var(--mt); }
    .cr-banrow small { color: var(--mt); display: block; font-weight: 400; }
    .cr-dots { background: none; border: none; color: var(--mt); cursor: pointer; font-size: 20px; line-height: 1; padding: 0 6px; font-weight: 800; }
    .cr-dots:hover { color: var(--ac); }
    .cr-pop { position: fixed; z-index: 3000; background: var(--cd); border: 1px solid var(--bd); border-radius: 14px; padding: 10px; width: min(280px, calc(100vw - 16px)); box-shadow: 0 10px 30px rgba(0,0,0,.45); display: flex; flex-direction: column; gap: 8px; }
    .cr-pop h4 { font-size: 13px; overflow-wrap: anywhere; }
    .cr-pop .lb { font-size: 11px; color: var(--mt); font-weight: 700; margin-bottom: 4px; }
    .cr-pop .row { display: flex; flex-wrap: wrap; gap: 6px; }
    .cr-pop button { background: var(--in); border: 1px solid var(--bd); color: var(--tx); border-radius: 9px; padding: 6px 10px; font-size: 12px; font-weight: 600; cursor: pointer; min-height: 0; }
    .cr-pop button:hover { border-color: var(--ac); color: var(--ac); }
    .cr-pop .un { width: 100%; text-align: left; }
    @media(max-width:768px),(max-height:480px){
      #p20{display:none;flex-direction:column}
      #r20:checked~.main #p20{display:flex !important}
      .cr-msg{max-width:92%}
      .cr-input button{min-width:44px;min-height:44px}
    }
  `;
  document.head.appendChild(st);

  // ---------- каркас: переключатель, пункт меню, панель ----------
  const r20 = document.createElement("input");
  r20.type = "radio"; r20.name = "t"; r20.id = "r20"; r20.className = "hide";
  r1.parentNode.insertBefore(r20, r1);

  const lbl = document.createElement("label");
  lbl.setAttribute("for", "r20"); lbl.className = "tbtn";
  lbl.setAttribute("data-ru", "💬 Общий чат");
  lbl.setAttribute("data-kz", "💬 Жалпы чат");
  lbl.textContent = "💬 Общий чат";
  const r1lbl = menu.querySelector('label[for="r1"]');
  if (r1lbl && r1lbl.nextSibling) menu.insertBefore(lbl, r1lbl.nextSibling);
  else menu.appendChild(lbl);

  const sec = document.createElement("section");
  sec.id = "p20"; sec.className = "pnl";
  sec.innerHTML =
    '<div class="cr-bar"><div class="cr-me" id="crMe"></div><button type="button" class="cr-small" id="crChange"></button></div>' +
    '<details class="cr-banbox" id="crBanBox" style="display:none"><summary id="crBanSum"></summary><div id="crBanList"></div></details>' +
    '<div class="cr-banned" id="crBanned" style="display:none"></div>' +
    '<div class="cr-nickbox" id="crNickBox"><input type="text" id="crNickInp" maxlength="20" autocomplete="off">' +
    '<button type="button" id="crNickBtn"></button><div class="cr-hint" id="crNickHint"></div></div>' +
    '<div class="cr-list" id="crList"></div>' +
    '<div class="cr-input"><input type="text" id="crInp" maxlength="' + MAX_LEN + '" autocomplete="off"><button type="button" id="crSend">➤</button></div>';
  main.appendChild(sec);

  const $ = function(id) { return document.getElementById(id); };

  // ---------- состояние ----------
  let me = { nick: "", changes: 0, banned: false, muted: false, until: 0 };
  let editing = false;    // идёт смена ника
  let lastSig = "";
  let lastList = [];
  let sending = false;

  const canWrite = function() { return !!me.nick && !me.banned && !me.muted; };
  function fmtDT(ts) {
    const d = new Date(Number(ts) + 5 * 3600 * 1000);
    const p = function(n) { return String(n).padStart(2, "0"); };
    const now = new Date(Date.now() + 5 * 3600 * 1000);
    const same = d.getUTCDate() === now.getUTCDate() && d.getUTCMonth() === now.getUTCMonth();
    return (same ? "" : p(d.getUTCDate()) + "." + p(d.getUTCMonth() + 1) + " ") + p(d.getUTCHours()) + ":" + p(d.getUTCMinutes());
  }
  function untilText(ts) {
    return Number(ts) > 0 ? T("до ", "дейін ") + fmtDT(ts) : T("навсегда", "мәңгілікке");
  }

  const nickValid = function(n) { return /^[\p{L}\p{N}_.\- ]{2,20}$/u.test(n); };

  // ---------- интерфейс (переводится только он) ----------
  function applyLang() {
    $("crInp").placeholder = T("Сообщение для всех...", "Барлығына хабарлама...");
    $("crNickInp").placeholder = T("Ваш ник", "Сіздің никіңіз");
    $("crNickHint").textContent = editing
      ? T("Ник можно сменить только один раз.", "Никті тек бір рет өзгертуге болады.")
      : T("Ник задаётся один раз; потом его можно сменить ещё один раз.", "Ник бір рет қойылады; кейін тағы бір рет өзгертуге болады.");
    $("crNickBtn").textContent = T("Сохранить", "Сақтау");
    $("crChange").textContent = T("✏️ Сменить ник (1 раз)", "✏️ Никті өзгерту (1 рет)");

    $("crBanSum").textContent = T("🔇 Наказания: муты и баны", "🔇 Жазалар: мут және бан");
    if (me.banned) $("crBanned").textContent = errText("banned") + " (" + untilText(me.until) + ")";
    else if (me.muted) $("crBanned").textContent = "🔇 " + errText("muted") + " (" + untilText(me.until) + ")";
    $("crBanned").style.display = (me.banned || me.muted) ? "" : "none";

    const hasNick = !!me.nick && !me.banned;
    $("crNickBox").style.display = (!me.banned && (!me.nick || editing)) ? "flex" : "none";
    $("crInp").disabled = !canWrite();
    $("crSend").disabled = !canWrite();
    const canChange = hasNick && me.changes < 1 && !editing && !me.muted;
    $("crChange").style.display = canChange ? "" : "none";

    const meEl = $("crMe");
    meEl.textContent = "";
    if (hasNick) {
      meEl.append(T("Вы: ", "Сіз: "));
      const b = document.createElement("b");
      b.textContent = me.nick; // ник пользователя не переводится
      meEl.append(b);
      if (me.changes >= 1) meEl.append(" • " + T("ник уже менялся", "ник өзгертілген"));
    } else {
      meEl.textContent = T("Задайте ник, чтобы писать в чат", "Чатқа жазу үшін ник қойыңыз");
    }
    render(lastList, true);
  }

  function fmtTime(ts) {
    const d = new Date(Number(ts) + 5 * 3600 * 1000); // Казахстан UTC+5
    return String(d.getUTCHours()).padStart(2, "0") + ":" + String(d.getUTCMinutes()).padStart(2, "0");
  }

  function render(list, force) {
    const isAdmin = (typeof adm !== "undefined" && adm === true);
    $("crBanBox").style.display = isAdmin ? "" : "none";
    const sig = list.map(function(m) { return m.id + "|" + m.n + "|" + (m.m ? 1 : 0); }).join(",") + "|" + isAdmin + "|" + ((typeof lang !== "undefined") ? lang : "ru");
    if (!force && sig === lastSig) return;
    lastSig = sig;
    lastList = list;

    closeMenu();
    const box = $("crList");
    const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    box.innerHTML = "";
    if (!list.length) {
      const e = document.createElement("div");
      e.className = "cr-empty";
      e.textContent = T("Пока сообщений нет. Напишите первым!", "Әзірге хабарлама жоқ. Бірінші болып жазыңыз!");
      box.appendChild(e);
      return;
    }
    list.forEach(function(m) {
      const el = document.createElement("div");
      el.className = "cr-msg" + (m.m ? " mine" : "");
      const head = document.createElement("div");
      head.className = "cr-head";
      const nb = document.createElement("b");
      nb.textContent = m.n;           // ник — как ввёл пользователь
      const tm = document.createElement("span");
      tm.textContent = fmtTime(m.ts);
      head.appendChild(nb); head.appendChild(tm);
      if (isAdmin) {
        const d = document.createElement("button");
        d.type = "button"; d.className = "cr-del"; d.textContent = "🗑";
        d.onclick = function() { delMsg(m.id); };
        head.appendChild(d);
        if (!m.m) {
          const bb = document.createElement("button");
          bb.type = "button"; bb.className = "cr-dots"; bb.textContent = "⋯";
          bb.title = T("Наказания: мут / бан", "Жазалар: мут / бан");
          bb.onclick = function(ev) { ev.stopPropagation(); openMod(m.id, m.n, bb); };
          head.appendChild(bb);
        }
      }
      const tx = document.createElement("div");
      tx.className = "cr-text";
      tx.textContent = m.t;           // текст — как написал пользователь, без перевода
      el.appendChild(head); el.appendChild(tx);
      box.appendChild(el);
    });
    if (nearBottom || force === "bottom") box.scrollTop = box.scrollHeight;
  }

  // ---------- сеть ----------
  function apiOk() { return API_URL && API_URL.indexOf("ВСТАВЬТЕ") === -1; }

  async function get(params) {
    const r = await fetch(API_URL + "?" + new URLSearchParams(params).toString());
    return r.json();
  }
  async function post(body) {
    const r = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body)
    });
    return r.json();
  }

  async function loadMe() {
    if (!apiOk()) return;
    try {
      const d = await get({ action: "me", uid: uid });
      me = { nick: d.nick || "", changes: Number(d.changes) || 0, banned: d.banned === true, muted: d.muted === true, until: Number(d.until) || 0 };
      applyLang();
    } catch (e) {}
  }

  async function poll(force) {
    if (!apiOk()) return;
    if (me.banned || me.muted) loadMe();
    if (!force && (!r20.checked || document.hidden)) return;
    try {
      const d = await get({ action: "list", uid: uid });
      if (Array.isArray(d.messages)) render(d.messages, force ? "bottom" : false);
    } catch (e) {}
  }

  async function saveNick() {
    const n = $("crNickInp").value.trim().replace(/\s+/g, " ");
    if (!nickValid(n)) { say(errText("nick_bad")); return; }
    if (!apiOk()) { say(errText("net")); return; }
    try {
      const d = await post({ action: "nick", uid: uid, nick: n });
      if (!d.ok) { if (d.error === "banned") { me.banned = true; me.until = Number(d.until) || 0; applyLang(); } say(errText(d.error)); return; }
      me = { nick: d.nick, changes: Number(d.changes) || 0, banned: false, muted: me.muted, until: me.until };
      editing = false;
      $("crNickInp").value = "";
      applyLang();
      poll(true);
    } catch (e) { say(errText("net")); }
  }

  async function sendMsg() {
    if (sending || !me.nick) return;
    const t = $("crInp").value.trim();
    if (!t) return;
    if (!apiOk()) { say(errText("net")); return; }
    sending = true;
    $("crSend").disabled = true;
    try {
      const d = await post({ action: "send", uid: uid, text: t.slice(0, MAX_LEN) });
      if (!d.ok) {
        if (d.error === "banned") { me.banned = true; me.until = Number(d.until) || 0; applyLang(); }
        if (d.error === "muted") { me.muted = true; me.until = Number(d.until) || 0; applyLang(); }
        say(errText(d.error));
      }
      else { $("crInp").value = ""; await poll(true); }
    } catch (e) { say(errText("net")); }
    sending = false;
    $("crSend").disabled = !canWrite();
  }

  function getPass() {
    let p = "";
    try { p = sessionStorage.getItem("aqjar_adm_pass") || ""; } catch (e) {}
    if (!p) {
      p = window.prompt(T("Пароль администратора:", "Әкімші құпиясөзі:")) || "";
      if (p) { try { sessionStorage.setItem("aqjar_adm_pass", p); } catch (e) {} }
    }
    return p;
  }

  async function delMsg(id) {
    const pass = getPass();
    if (!pass) return;
    try {
      const d = await post({ action: "delete", id: id, pass: pass });
      if (!d.ok) {
        if (d.error === "auth") { try { sessionStorage.removeItem("aqjar_adm_pass"); } catch (e) {} }
        say(errText(d.error));
        return;
      }
      poll(true);
    } catch (e) { say(errText("net")); }
  }

  // выпадающее меню «⋯» рядом с сообщением: мут / бан на время или навсегда, снять мут
  let popEl = null;
  function closeMenu() { if (popEl) { popEl.remove(); popEl = null; } }

  function openMod(id, nick, anchor) {
    if (popEl && popEl._anchor === anchor) { closeMenu(); return; }
    closeMenu();
    const box = document.createElement("div");
    box.className = "cr-pop";
    box._anchor = anchor;
    const h = document.createElement("h4");
    h.textContent = nick;                      // ник — как есть
    box.appendChild(h);

    const PRESETS = [
      [10, "10 мин", "10 мин"],
      [60, "1 час", "1 сағ"],
      [1440, "24 часа", "24 сағ"],
      [10080, "7 дней", "7 күн"],
      [0, "∞ навсегда", "∞ мәңгі"]
    ];
    function section(icon, ru, kz, action) {
      const wrap = document.createElement("div");
      const lb = document.createElement("div");
      lb.className = "lb"; lb.textContent = icon + " " + T(ru, kz);
      const row = document.createElement("div");
      row.className = "row";
      PRESETS.forEach(function(p) {
        const btn = document.createElement("button");
        btn.type = "button"; btn.textContent = T(p[1], p[2]);
        btn.onclick = function() {
          if (p[0] === 0 && !window.confirm(T("Выдать «", "Беру «") + nick + T("» наказание навсегда?", "» мәңгілікке жаза?"))) return;
          closeMenu();
          doMod(action, id, p[0]);
        };
        row.appendChild(btn);
      });
      wrap.appendChild(lb); wrap.appendChild(row);
      return wrap;
    }
    box.appendChild(section("🔇", "Мут (нельзя писать)", "Мут (жазуға болмайды)", "mute"));
    box.appendChild(section("🚫", "Бан (нельзя писать, сообщения скрыты)", "Бан (жазуға болмайды, хабарламалар жасырын)", "ban"));
    const un = document.createElement("button");
    un.type = "button"; un.className = "un";
    un.textContent = "🔊 " + T("Снять мут", "Мутты алу");
    un.onclick = function() { closeMenu(); doMod("unmute", id, 0); };
    box.appendChild(un);

    document.body.appendChild(box);
    popEl = box;
    // позиция рядом с кнопкой, не выходя за экран
    const r = anchor.getBoundingClientRect();
    const w = box.offsetWidth, hgt = box.offsetHeight;
    let left = Math.min(Math.max(8, r.right - w), window.innerWidth - w - 8);
    let top = r.bottom + 4;
    if (top + hgt > window.innerHeight - 8) top = Math.max(8, r.top - hgt - 4);
    box.style.left = left + "px";
    box.style.top = top + "px";
  }
  document.addEventListener("click", function(e) {
    if (popEl && !popEl.contains(e.target)) closeMenu();
  });
  document.addEventListener("keydown", function(e) { if (e.key === "Escape") closeMenu(); });
  window.addEventListener("scroll", closeMenu, true);
  window.addEventListener("resize", closeMenu);

  async function doMod(action, id, minutes) {
    const pass = getPass();
    if (!pass) return;
    try {
      const d = await post({ action: action, id: id, minutes: minutes, pass: pass });
      if (!d.ok) {
        if (d.error === "auth") { try { sessionStorage.removeItem("aqjar_adm_pass"); } catch (e) {} }
        say(errText(d.error));
        return;
      }
      say(action === "mute" ? "🔇 " + T("Мут выдан", "Мут берілді")
        : action === "ban" ? "🚫 " + T("Заблокирован", "Бұғатталды")
        : "🔊 " + T("Мут снят", "Мут алынды"));
      poll(true);
      loadBans();
    } catch (e) { say(errText("net")); }
  }

  async function loadBans() {
    const pass = getPass();
    if (!pass) return;
    const box = $("crBanList");
    try {
      const d = await post({ action: "banlist", pass: pass });
      if (!d.ok) {
        if (d.error === "auth") { try { sessionStorage.removeItem("aqjar_adm_pass"); } catch (e) {} }
        say(errText(d.error));
        return;
      }
      box.innerHTML = "";
      if (!d.list.length) {
        box.textContent = T("Никого нет", "Ешкім жоқ");
        return;
      }
      d.list.forEach(function(x) {
        const row = document.createElement("div");
        row.className = "cr-banrow";
        const nm = document.createElement("b");
        const nbox = document.createElement("div");
        nm.textContent = x.n;
        const sm = document.createElement("small");
        sm.textContent = (x.k === "mute" ? "🔇 " + T("мут ", "мут ") : "🚫 " + T("бан ", "бан ")) + untilText(x.until);
        nbox.appendChild(nm); nbox.appendChild(sm);
        const un = document.createElement("button");
        un.type = "button"; un.className = "cr-small";
        un.textContent = x.k === "mute" ? T("Снять мут", "Мутты алу") : T("Разблокировать", "Бұғаттан шығару");
        un.onclick = async function() {
          try {
            const r = await post({ action: (x.k === "mute" ? "unmute" : "unban"), nick: x.n, pass: pass });
            if (!r.ok) { say(errText(r.error)); return; }
            loadBans(); poll(true);
          } catch (e) { say(errText("net")); }
        };
        row.appendChild(nbox); row.appendChild(un);
        box.appendChild(row);
      });
    } catch (e) { say(errText("net")); }
  }

  // ---------- события ----------
  $("crBanBox").addEventListener("toggle", function() { if ($("crBanBox").open) loadBans(); });
  $("crNickBtn").onclick = saveNick;
  $("crNickInp").addEventListener("keydown", function(e) { if (e.key === "Enter") saveNick(); });
  $("crSend").onclick = sendMsg;
  $("crInp").addEventListener("keydown", function(e) { if (e.key === "Enter") sendMsg(); });
  $("crChange").onclick = function() {
    editing = true;
    $("crNickInp").value = me.nick;
    applyLang();
    $("crNickInp").focus();
  };
  document.addEventListener("aqi18n", applyLang);
  document.querySelectorAll('input[name="t"]').forEach(function(r) {
    r.addEventListener("change", function() { if (r20.checked) poll(true); });
  });

  // при включении/выключении режима админа сразу перерисовываем чат (без ожидания опроса)
  const prevDraw = window.draw;
  window.draw = function() {
    if (typeof prevDraw === "function") prevDraw.apply(this, arguments);
    try { render(lastList, true); } catch (e) {}
  };

  applyLang();
  loadMe();
  poll(true);
  setInterval(poll, POLL_MS);
})();
