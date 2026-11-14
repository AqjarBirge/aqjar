(function() {
  const st = document.createElement("style");
  st.textContent = `
    #r0:checked ~ .side label[for="r0"] { background: var(--ac); color: #fff; }
    #r0:checked ~ .main #p0 { display: flex; }
    .hb-wrap { padding: 24px 28px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 20px; }
    
    .hb-top-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: var(--cd); border: 1px solid var(--bd); border-radius: 16px; padding: 14px 20px; }
    .hb-sos { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .hb-sos-btn { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 5px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.15s; }
    .hb-sos-btn:hover { background: #ef4444; color: #fff; }
    .hb-live { font-size: 12px; font-weight: 600; color: var(--tx); }

    .hb-hero { background: var(--cd); border: 1px solid var(--bd); border-radius: 20px; padding: 30px; display: flex; flex-direction: column; gap: 16px; }
    .hb-region { font-size: 12px; font-weight: 700; color: var(--ac); letter-spacing: 0.5px; text-transform: uppercase; }
    .hb-title { font-size: 30px; font-weight: 800; line-height: 1.2; max-width: 700px; }
    .hb-sub { font-size: 14px; line-height: 1.55; color: var(--mt); max-width: 620px; }
    
    .hb-search { display: flex; gap: 8px; background: var(--in); border: 1px solid var(--bd); padding: 6px; border-radius: 14px; max-width: 660px; margin-top: 4px; }
    .hb-search input { flex: 1; background: transparent; border: none; color: var(--tx); padding: 9px 12px; font-size: 14px; outline: none; }
    .hb-search button { background: var(--ac); color: #fff; border: none; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; }
    .hb-prompts { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .hb-pchip { background: var(--in); border: 1px solid var(--bd); color: var(--mt); padding: 6px 12px; border-radius: 10px; font-size: 12px; cursor: pointer; transition: 0.15s; }
    .hb-pchip:hover { border-color: var(--ac); color: var(--tx); }

    .hb-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 14px; }
    .hb-card { background: var(--cd); border: 1px solid var(--bd); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; cursor: pointer; transition: border-color 0.2s, transform 0.15s; }
    .hb-card:hover { border-color: var(--ac); transform: translateY(-2px); }
    .hb-chead { display: flex; align-items: center; gap: 10px; }
    .hb-cicon { width: 36px; height: 36px; border-radius: 10px; background: var(--sf); color: var(--ac); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
    .hb-card h3 { font-size: 15px; font-weight: 700; }
    .hb-card p { font-size: 13px; color: var(--mt); line-height: 1.45; }
    .hb-link { font-size: 12px; font-weight: 700; color: var(--ac); }
  `;
  document.head.appendChild(st);

  const r1 = document.getElementById("r1");
  const menu = document.querySelector(".side .menu");
  const main = document.querySelector("main.main");
  if (!r1 || !menu || !main) return;

  r1.checked = false;
  const r0 = document.createElement("input");
  r0.type = "radio"; r0.name = "t"; r0.id = "r0"; r0.className = "hide"; r0.checked = true;
  r1.parentNode.insertBefore(r0, r1);

  const lbl = document.createElement("label");
  lbl.setAttribute("for", "r0"); lbl.className = "tbtn";
  lbl.setAttribute("data-ru", "🏠 Главная");
  lbl.setAttribute("data-kz", "🏠 Басты бет");
  lbl.textContent = "🏠 Главная";
  menu.insertBefore(lbl, menu.firstChild);

  const sec = document.createElement("section");
  sec.id = "p0"; sec.className = "pnl";
  sec.innerHTML = `
    <div class="hb-wrap">
      <div class="hb-top-bar">
        <div class="hb-live" id="hbStatus">🕒 Загрузка графика работы...</div>
        <div class="hb-sos">
          <span style="font-size:12px;color:var(--mt);font-weight:600">Экстренные номера:</span>
          <button type="button" class="hb-sos-btn" onclick="cp('112')">112 ЧС</button>
          <button type="button" class="hb-sos-btn" onclick="cp('103')">103 Скорая</button>
          <button type="button" class="hb-sos-btn" onclick="cp('102')">102 Полиция</button>
          <button type="button" class="hb-sos-btn" onclick="cp('154')">154 РЭС</button>
        </div>
      </div>

      <div class="hb-hero">
        <div class="hb-region">Северо-Казахстанская область • Акжарский район</div>
        <h1 class="hb-title" data-ru="Единая справочная служба с. Талшык и Акжарского района" data-kz="Талшық ауылы мен Ақжар ауданының бірыңғай анықтамалық қызметі">Единая справочная служба с. Талшык и Акжарского района</h1>
        <p class="hb-sub" data-ru="Актуальные телефоны учреждений, график приёма граждан, информация о государственных услугах, пособиях и интерактивная схема районного центра." data-kz="Мекемелердің өзекті телефондары, азаматтарды қабылдау кестесі, мемлекеттік қызметтер, жәрдемақылар туралы ақпарат және аудан орталығының интерактивті сызбасы.">Актуальные телефоны учреждений, график приёма граждан, информация о государственных услугах, пособиях и интерактивная схема районного центра.</p>

        <div class="hb-search">
          <input type="text" id="hbQuickInp" placeholder="Введите ваш вопрос (например: приёмные дни в Акимате или документы на грант)..." onkeydown="if(event.key==='Enter')hbRunAsk()">
          <button type="button" onclick="hbRunAsk()">Найти ответ</button>
        </div>

        <div class="hb-prompts">
          <span style="font-size:12px;color:var(--mt)">Частые запросы:</span>
          <span class="hb-pchip" onclick="hbChipAsk('Какие документы нужны для справки о стаже в архиве?')">Справка о стаже (Архив)</span>
          <span class="hb-pchip" onclick="hbChipAsk('График приёма граждан в Акимате Акжарского района')">Приём граждан в Акимате</span>
          <span class="hb-pchip" onclick="hbChipAsk('Как оформить грант до 400 МРП в Карьерном центре?')">Грант до 400 МРП</span>
          <span class="hb-pchip" onclick="hbChipAsk('Телефоны регистратуры и приёмного покоя больницы в с. Талшык')">Районная больница</span>
        </div>
      </div>

      <div class="hb-grid">
        <div class="hb-card" onclick="document.getElementById('r3').checked=true">
          <div>
            <div class="hb-chead"><div class="hb-cicon">🏢</div><h3>Государственные организации</h3></div>
            <p style="margin-top:8px">Контакты и описание услуг Акимата, Карьерного центра, Архива, Ветеринарии, Отделов образования и занятости.</p>
          </div>
          <div class="hb-link">Открыть список учреждений →</div>
        </div>

        <div class="hb-card" onclick="document.getElementById('r2').checked=true">
          <div>
            <div class="hb-chead"><div class="hb-cicon">📞</div><h3>Телефонный справочник</h3></div>
            <p style="margin-top:8px">Прямые номера диспетчерских, коммунальных, медицинских и аварийных служб села Талшык с копированием в один клик.</p>
          </div>
          <div class="hb-link">Перейти в справочник →</div>
        </div>

        <div class="hb-card" onclick="document.getElementById('r3').checked=true;setTimeout(function(){var m=document.querySelector('.org-gis-wrap');if(m)m.scrollIntoView({behavior:'smooth'});},120)">
          <div>
            <div class="hb-chead"><div class="hb-cicon">🗺️</div><h3>Карта центра и господдержка</h3></div>
            <p style="margin-top:8px">Интерактивная схема улиц с. Талшык с расположением зданий и памяткой по социальным выплатам и программам.</p>
          </div>
          <div class="hb-link">Открыть карту района →</div>
        </div>

        <div class="hb-card" onclick="document.getElementById('r1').checked=true">
          <div>
            <div class="hb-chead"><div class="hb-cicon">💬</div><h3>Онлайн-консультант</h3></div>
            <p style="margin-top:8px">Дежурный справочный помощник, который ответит на вопросы по работе служб района на русском и казахском языках.</p>
          </div>
          <div class="hb-link">Задать вопрос в чате →</div>
        </div>
      </div>
    </div>
  `;
  main.insertBefore(sec, main.querySelector("#p1"));

  window.hbRunAsk = function() {
    const val = document.getElementById("hbQuickInp").value.trim();
    if (!val) return;
    document.getElementById("hbQuickInp").value = "";
    document.getElementById("r1").checked = true;
    if (typeof qAsk === "function") qAsk(val);
  };

  window.hbChipAsk = function(text) {
    document.getElementById("r1").checked = true;
    if (typeof qAsk === "function") qAsk(text);
  };

  function updateStatus() {
    const el = document.getElementById("hbStatus");
    if (!el) return;
    const now = new Date();
    const day = now.getDay();
    const hr = now.getHours();
    const min = String(now.getMinutes()).padStart(2, "0");
    let stText = "🟢 Госучреждения с. Талшык открыты";
    if (day === 0 || day === 6) stText = "🔴 Выходной день (работают экстренные службы 24/7)";
    else if (hr === 13 || (hr === 14 && now.getMinutes() < 30)) stText = "🟡 Обеденный перерыв (13:00 – 14:30)";
    else if (hr < 9 || hr >= 18) stText = "🔴 Рабочий день завершён (приём с 09:00)";
    el.textContent = "🕒 " + hr + ":" + min + " • " + stText;
  }
  updateStatus();
  setInterval(updateStatus, 30000);
})();
