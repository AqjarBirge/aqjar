(function() {
  const st = document.createElement("style");
  st.textContent = ".w-card{background:var(--cd);border:1px solid var(--bd);border-radius:14px;padding:12px;margin-bottom:10px;display:flex;flex-direction:column;gap:6px}.w-top{display:flex;justify-content:space-between;align-items:center}.w-temp{font-size:24px;font-weight:800;color:var(--ac)}.w-icon{font-size:26px}.w-desc{font-size:12px;color:var(--tx);font-weight:600}.w-wind{font-size:11px;color:var(--mt)}";
  document.head.appendChild(st);

  const badge = document.querySelector(".side .badge");
  if (!badge) return;

  const box = document.createElement("div");
  box.innerHTML = '<div class="w-card"><div class="w-top"><div><div style="font-size:11px;color:var(--mt)" data-ru="Погода • с. Талшык" data-kz="Ауа райы • Талшық а.">Погода • с. Талшык</div><div class="w-temp" id="wTemp">--°C</div></div><div class="w-icon" id="wIcon">🌤️</div></div><div class="w-desc" id="wDesc" data-ru="Загрузка..." data-kz="Жүктелуде...">Загрузка...</div><div class="w-wind" id="wWind">💨 -- м/с</div></div>';
  badge.parentNode.insertBefore(box, badge);

  async function loadWeather() {
    try {
      const url = "https://" + ["api", "open-meteo", "com"].join(".") + "/v1/forecast?latitude=53.63&longitude=71.87&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=ms";
      const res = await fetch(url);
      const data = await res.json();
      if (!data.current) return;

      const t = Math.round(data.current.temperature_2m);
      const w = Math.round(data.current.wind_speed_10m);
      const c = data.current.weather_code;

      let icon = "☀️", ru = "Ясно", kz = "Ашық";
      if (c >= 1 && c <= 3) { icon = "⛅"; ru = "Облачно"; kz = "Бұлтты"; }
      else if (c >= 45 && c <= 48) { icon = "🌫️"; ru = "Туман"; kz = "Тұман"; }
      else if (c >= 51 && c <= 67) { icon = "🌧️"; ru = "Дождь"; kz = "Жаңбыр"; }
      else if (c >= 71 && c <= 77) { icon = "❄️"; ru = "Снег"; kz = "Қар"; }
      else if (c >= 80 && c <= 86) { icon = "🌨️"; ru = "Осадки"; kz = "Жауын-шашын"; }
      else if (c >= 95) { icon = "⛈️"; ru = "Гроза"; kz = "Найзағай"; }

      document.getElementById("wTemp").textContent = (t > 0 ? "+" : "") + t + "°C";
      document.getElementById("wIcon").textContent = icon;

      const descEl = document.getElementById("wDesc");
      descEl.setAttribute("data-ru", ru);
      descEl.setAttribute("data-kz", kz);
      const curLang = (typeof lang !== "undefined") ? lang : "ru";
      descEl.textContent = (curLang === "ru") ? ru : kz;
      document.getElementById("wWind").textContent = "💨 " + w + " м/с";
    } catch (e) {
      const d = document.getElementById("wDesc");
      if (d) d.textContent = "Нет сети";
    }
  }

  loadWeather();
})();
