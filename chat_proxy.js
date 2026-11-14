// Подключать в app.html ПОСЛЕ основного <script> с чатом (в самом конце, рядом с остальными скриптами).
// Заменяет старую send(), которая ходила в Groq напрямую с ключом из браузера.
(function() {
  // ⬇️ Вставьте адрес вашего Worker (его покажет Cloudflare после Deploy)
  const AI_URL = "https://aqjarneiro.tempmailfirst603.workers.dev/";

  const hist = [];

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  // безопасное форматирование: сначала экранируем, потом разрешаем только **жирный** и переносы строк
  function fmt(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
  }

  window.send = async function() {
    const i = document.getElementById("inp");
    if (!i) return;
    const t = i.value.trim();
    if (!t) return;

    add(esc(t), "user");
    i.value = "";
    const m = add("...", "bot");

    if (!AI_URL || AI_URL.indexOf("ВАШ-WORKER") !== -1) {
      m.innerHTML = "⚙️ <b>Демо:</b> «" + esc(t) + "». Укажите адрес Worker в <code>AI_URL</code> (файл chat_proxy.js).";
      return;
    }

    try {
      const r = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: t,
          history: hist.slice(-6),
          lang: (typeof lang !== "undefined") ? lang : "ru"
        })
      });
      let d = {};
      try { d = await r.json(); } catch (e) {}
      if (!r.ok || d.error) {
        m.innerHTML = esc(d.error || "Сервис временно недоступен. Попробуйте позже.");
        return;
      }
      const reply = d.reply || "Пустой ответ от сервера";
      hist.push({ role: "user", content: t }, { role: "assistant", content: reply });
      m.innerHTML = fmt(reply);
      const b = document.getElementById("cbox");
      if (b) b.scrollTop = b.scrollHeight;
    } catch (e) {
      m.innerHTML = "Ошибка сети. Проверьте интернет и попробуйте ещё раз.";
    }
  };
})();
