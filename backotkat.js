(function() {
  const menu = document.querySelector(".side .menu");
  if (menu) {
    const a = document.createElement("a");
    a.href = "index.html";
    a.className = "tbtn";
    a.style.cssText = "border:1px solid var(--bd);margin-bottom:8px;color:var(--tx);text-decoration:none;display:flex;align-items:center;gap:6px";
    a.setAttribute("data-ru", "← На главную");
    a.setAttribute("data-kz", "← Басты бетке");
    const curLang = (typeof lang !== "undefined") ? lang : "ru";
    a.textContent = (curLang === "ru") ? "← На главную" : "← Басты бетке";
    menu.insertBefore(a, menu.firstChild);
  }

  const p = new URLSearchParams(window.location.search);
  const tab = p.get("tab");
  const ask = p.get("ask");
  if (tab && document.getElementById(tab)) {
    document.getElementById(tab).checked = true;
  }
  if (ask) {
    const r1 = document.getElementById("r1");
    if (r1) r1.checked = true;
    setTimeout(function() { if (typeof qAsk === "function") qAsk(ask); }, 300);
  }
})();
  const topLeft = document.querySelector(".top > div:first-child");
  const side = document.querySelector(".side");
  if (topLeft && side) {
    const burger = document.createElement("button");
    burger.type = "button";
    burger.className = "mob-burger";
    burger.textContent = "☰";
    topLeft.insertBefore(burger, topLeft.firstChild);

    const overlay = document.createElement("div");
    overlay.className = "mob-overlay";
    document.body.appendChild(overlay);

    const toggleMenu = function(force) {
      const open = (typeof force === "boolean") ? force : !side.classList.contains("mob-open");
      side.classList.toggle("mob-open", open);
      overlay.classList.toggle("open", open);
    };

    burger.onclick = function() { toggleMenu(); };
    overlay.onclick = function() { toggleMenu(false); };

    side.querySelectorAll(".tbtn").forEach(function(btn) {
      btn.addEventListener("click", function() { toggleMenu(false); });
    });
  }

