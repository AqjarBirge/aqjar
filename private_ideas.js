(function() {
  const API_URL = "https://script.google.com/macros/s/AKfycbwOWv7y0MceMGrWuz-gO9jjw-eIoA_e4IlLmsEKXJYKuOHXeSMbFNugSdOwAy5aYFWR/exec";

  let myUid = localStorage.getItem("aqjar_my_uid");
  if (!myUid) {
    myUid = "u_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("aqjar_my_uid", myUid);
  }

  let cloudIdeas = [];

  // защита от вставки HTML-кода в идеи
  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  // пароль админа хранится только в памяти вкладки и проверяется на сервере (Apps Script)
  function getPass(ask) {
    let p = "";
    try { p = sessionStorage.getItem("aqjar_adm_pass") || ""; } catch (e) {}
    if (!p && ask) {
      p = window.prompt("Пароль администратора:") || "";
      if (p) { try { sessionStorage.setItem("aqjar_adm_pass", p); } catch (e) {} }
    }
    return p;
  }

  async function syncCloud() {
    if (!API_URL || API_URL.includes("ВСТАВЬТЕ_СЮДА")) return;
    try {
      const isAdm = (typeof adm !== "undefined" && adm === true);
      const pw = isAdm ? getPass(false) : "";
      const res = await fetch(API_URL + "?uid=" + encodeURIComponent(myUid) + (pw ? "&pass=" + encodeURIComponent(pw) : ""));
      const data = await res.json();
      if (Array.isArray(data)) {
        cloudIdeas = data;
        draw();
      }
    } catch (e) {}
  }

  // проверка пароля админа на сервере (Apps Script): сама панель включается только после ответа «ok»
  window.aqAdminCheck = async function(pass) {
    try {
      const res = await fetch(API_URL + "?action=check&pass=" + encodeURIComponent(pass));
      const d = await res.json();
      return !!(d && d.ok === true);
    } catch (e) { return false; }
  };

  window.addI = async function() {
    const nEl = document.getElementById("iName");
    const tEl = document.getElementById("iText");
    const r = (typeof lang === "undefined" || lang === "ru");
    const n = nEl.value.trim() || (r ? "Житель" : "Тұрғын");
    const t = tEl.value.trim();
    if (!t) return;

    const newItem = { id: String(Date.now()), n: n, t: t, s: "w", uid: myUid };
    cloudIdeas.push(newItem);
    tEl.value = "";
    draw();

    const box = document.getElementById("iList");
    if (box) box.scrollTop = box.scrollHeight;

    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ action: "add", id: newItem.id, n: n, t: t, uid: myUid })
    });
    setTimeout(syncCloud, 1200);
  };

  window.setS = async function(id, s) {
    const pass = getPass(true);
    if (!pass) return;
    const item = cloudIdeas.find(x => x.id === id);
    if (item) item.s = s;
    draw();
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ action: "status", id: id, s: s, pass: pass })
    });
  };

  window.delI = async function(id) {
    const pass = getPass(true);
    if (!pass) return;
    cloudIdeas = cloudIdeas.filter(x => x.id !== id);
    if (typeof toast === "function") toast("🗑 Удалено");
    draw();
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ action: "delete", id: id, pass: pass })
    });
  };

  window.draw = function() {
    const b = document.getElementById("iList");
    const a = document.getElementById("aList");
    if (!b || !a) return;
    b.innerHTML = "";
    a.innerHTML = "";
    let w = 0;
    const r = (typeof lang === "undefined" || lang === "ru");
    const isAdmin = (typeof adm !== "undefined" && adm === true);

    const myIdeas = cloudIdeas.filter(x => x.uid === myUid);

    if (!isAdmin && myIdeas.length === 0) {
      b.innerHTML = '<div style="margin:auto;text-align:center;color:var(--mt);font-size:14px;max-width:360px">' +
        (r ? "🔒 Здесь отображаются только ваши личные обращения и решение администратора по ним. Напишите предложение ниже." : "🔒 Мұнда тек сіздің жеке өтініштеріңіз бен әкімшінің шешімі көрсетіледі. Төменде ұсыныс жазыңыз.") +
        '</div>';
    }

    cloudIdeas.forEach(function(x) {
      if (x.s === "w") w++;
      const st = x.s === "o" ? (r ? "✅ Одобрено" : "✅ Мақұлданды") : (x.s === "n" ? (r ? "❌ Отклонено" : "❌ Қабылданбады") : (r ? "⏳ На рассмотрении" : "⏳ Қаралуда"));
      const cl = x.s === "o" ? "sto" : (x.s === "n" ? "stn" : "stw");
      const bt = isAdmin ? '<div style="display:flex;gap:8px;margin-top:4px">' +
        '<button type="button" class="btn" style="background:#d1fae5;color:#047857" onclick="setS(\'' + esc(x.id) + '\',\'o\')">' + (r ? "Одобрить" : "Мақұлдау") + '</button>' +
        '<button type="button" class="btn" style="background:#fee2e2;color:#b91c1c" onclick="setS(\'' + esc(x.id) + '\',\'n\')">' + (r ? "Отклонить" : "Қабылдамау") + '</button>' +
        '<button type="button" class="btn" style="background:#e2e8f0;color:#334155" onclick="delI(\'' + esc(x.id) + '\')">' + (r ? "🗑 Удалить" : "🗑 Жою") + '</button></div>' : "";
      const h = '<div class="iitem"><div class="ihead"><b>👤 ' + esc(x.n) + '</b><span class="' + cl + '">' + st + '</span></div><div style="font-size:14px">' + esc(x.t) + '</div>' + bt + '</div>';

      a.innerHTML += h;
      if (isAdmin || x.uid === myUid) {
        b.innerHTML += h;
      }
    });

    const cnt = document.getElementById("wCnt");
    if (cnt) cnt.textContent = w;
  };

  window.syncCloudNow = syncCloud;
  syncCloud();
  setInterval(syncCloud, 15000);
})();
