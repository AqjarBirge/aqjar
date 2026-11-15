(function() {
  // Подключать ПОСЛЕ mapa.js
  const p3 = document.querySelector("#p3 .cards");
  if (!p3) return;

  const TZ = 5; // Казахстан UTC+5

  // ===== ГОЛОС =====
  const VOICE_RATE = 1.1;        // скорость озвучки (1 = обычная)
  const CHUNK_PAUSE = 120;       // пауза между предложениями, мс
  const RU_AUDIO_FILES = false;   // false: русский всегда читает голос браузера (файлы audio/ru-*.mp3 не используются); true: сначала играть готовые mp3
  // Замены для правильного ударения. Применяются только к тому, что ПРОИЗНОСИТСЯ (подписи не меняются).
  // Если ударение всё ещё неверное — пробуйте варианты (см. подсказку в ответе):
  //   "Талшы\u0301к" (знак ударения), "Тал-шык", "Талшык"
  // Знак ударения (\u0301) убран: русский голос читал его как лишний звук («Талшыка»).
  // Если ударение в «Талшык» неверное, откройте сайт с ?voicetest и подберите вариант: "Тал-шык", "Талшык".
  // Как русский голос произносит слово «Талшык». Меняйте значение под слух (варианты — на панели ?voicetest).
  const PRON_TALSHYK = "Талшыкх";
  const PRONUNCIATION = [
    [/Талшык(?![а-яёА-ЯЁ])/g, PRON_TALSHYK]   // только отдельное слово, без «Талшыкская» и т.п.
  ];

  // индексы = порядок PLACES в mapa.js
  // 0 Акимат, 1 Карьерный центр, 2 Отдел образования, 3 Архив, 4 Ветеринария, 5 Отдел занятости, 6 ЦОН, 7 Больница, 8 Отдел полиции, 9 Вокзал, 10 СЭС, 11 Казначейство, 12 Управление СЭС, 13 Статистика, 14 ТСШ, 15 БСШ
  const SCHED = {
    0: { o: 540, c: 1110 }, 1: { o: 540, c: 1110 }, 2: { o: 540, c: 1110 }, 3: { o: 540, c: 1110 },
    4: { o: 540, c: 1110 }, 5: { o: 540, c: 1110 }, 6: { o: 540, c: 1080 },
    7: { a: true }, 8: { a: true }, 9: { a: true },
    10: { o: 540, c: 1110 },
    11: { o: 540, c: 1110 }, 12: { o: 540, c: 1110 }, 13: { o: 540, c: 1110 },
    14: { o: 480, c: 1020, nl: true }, 15: { o: 480, c: 1020, nl: true }
  };

  // [индекс места, регулярка, вес] — русские и казахские слова вместе
  const RULES = [
    [0, /акимат|аким(у|а|ом|е)?(?![а-я])|приемн|прием граждан|обращени|жалоб/, 3],
    [3, /стаж|архив|трудов\S* книжк/, 3],
    [6, /цон|госуслуг|егов|egov|1414|паспорт|удостоверен|прописк|регистрац/, 3],
    [6, /справк|документ/, 1],
    [5, /грант|занятост|безработ|пособи|соцпрограмм|социальн|субсиди|инвалид|многодет/, 3],
    [1, /карьер|трудоустр|вакан|резюме|профориент|найти работ|ищу работ/, 3],
    [1, /работ[ауеыо](?![а-я])/, 1],
    [2, /школ|детск\S* сад|детсад|садик|образован|ученик|учител|аттестат|колледж/, 3],
    [4, /ветеринар|корова|коров|скот|животн|собак|кошк|лошад|овц/, 3],
    [10, /сэс|санэпид|эпидем|санитар|дезинфекц|санкнижк/, 3],
    [11, /казначейств|госзакуп|бюджетн\S* плат/, 3],
    [13, /статистик|перепис/, 3],
    [14, /тсш|талшыкск\S*\s*(сш|школ|средн)/, 5],
    [15, /бсш|бестерек|бестерег/, 5],
    [7, /больниц|врач|скорая|поликлин|болит|температур|аптек|здоровь|медицин|прививк/, 3],
    [8, /полиц|ровд|милиц|кража|украл|правонаруш|участков/, 3],
    [9, /вокзал|поезд|электричк|билет|ж\/д|железнодорож/, 3],
    // казахский
    [0, /әкімдік|әкімге|әкімнің|қабылдау күн|шағым|өтініш/, 3],
    [3, /еңбек өтіл|өтілі|еңбек кітапша/, 3],
    [6, /хқко|мемлекеттік қызмет|төлқұжат|жеке куәлік|тіркеу/, 3],
    [6, /анықтама|құжат/, 1],
    [5, /жұмыспен қамту|жұмыссыз|жәрдемақы|әлеуметтік|субсидия|мүгедек|көпбалалы/, 3],
    [1, /мансап|жұмысқа орналас|вакансия|жұмыс іздеу|жұмыс табу/, 3],
    [2, /мектеп|балабақша|білім|оқушы|мұғалім|колледж/, 3],
    [4, /ветеринар|сиыр|жануар|мысық|жылқы|(^|\s)мал/, 3],
    [10, /сэс|санэпид|эпидемиолог|санитариял|дезинфекция/, 3],
    [11, /қазынашылық|мемлекеттік сатып алу/, 3],
    [13, /статистика|санақ/, 3],
    [14, /тсш|талшық\S*\s*(орта|мектеп)/, 5],
    [15, /бсш|бестерек|бөстерек/, 5],
    [7, /аурухана|дәрігер|жедел жәрдем|емхана|дәріхана|денсаулық|ауырады|екпе/, 3],
    [8, /полиция|апб|ұрлық|ұрлады|учаскелік|құқық бұзу/, 3],
    [9, /пойыз|теміржол/, 3]
  ];

  // i: индекс места (null — общий кадр). t/x/v — русский (заголовок, текст, текст для озвучки),
  // kt/kx/kv — казахский. Перевод сделан без носителя языка: проверьте!
  const TOUR = [
    { i: null,
      t: "Добро пожаловать в Талшык",
      x: "Добро пожаловать в Талшык! Сейчас мы облетим главные организации района, а в конце вы сможете сами задать гиду любой вопрос.",
      v: "Добро пожаловать в Талшык! Сейчас мы облетим главные организации района, а в конце вы сможете сами задать гиду любой вопрос.",
      kt: "Талшыққа қош келдіңіз",
      kx: "Талшыққа қош келдіңіз! Қазір біз ауылдың басты ұйымдарын аралап шығамыз, ал соңында гидке кез келген сұрағыңызды қоя аласыз." },
    { i: 0,
      t: "Акимат района",
      x: "Акимат Акжарского района. Здесь работает аппарат акима, сюда можно обратиться с вопросом или жалобой.",
      kt: "Аудан әкімдігі",
      kx: "Ақжар ауданының әкімдігі. Мұнда аудан әкімінің аппараты жұмыс істейді, сұрақпен немесе шағыммен осында жүгінуге болады." },
    { i: 2,
      t: "Образование, карьера, занятость",
      x: "В этом здании находятся отдел образования, карьерный центр и отдел занятости. Здесь помогают с трудоустройством, пособиями и грантами.",
      kt: "Білім, мансап, жұмыспен қамту",
      kx: "Бұл ғимаратта білім бөлімі, мансап орталығы және жұмыспен қамту бөлімі орналасқан. Мұнда жұмысқа орналасуға, жәрдемақы мен гранттарға қатысты көмек көрсетіледі." },
    { i: 3,
      t: "Районный архив",
      x: "Районный архив. Сюда обращаются за архивными справками, в том числе о трудовом стаже.",
      kt: "Аудандық архив",
      kx: "Аудандық архив. Мұнда архивтік анықтамалар, соның ішінде еңбек өтілі туралы анықтамалар үшін жүгінеді." },
    { i: 11,
      t: "Казначейство, СЭС, статистика",
      x: "В этом здании находятся казначейство, управление СЭС и отдел статистики.",
      kt: "Қазынашылық, СЭС, статистика",
      kx: "Бұл ғимаратта қазынашылық, СЭС басқармасы және статистика бөлімі орналасқан." },
    { i: 6,
      t: "ЦОН",
      x: "Центр обслуживания населения. Государственные услуги в одном месте. Единый номер контакт-центра, 1414.",
      v: "Центр обслуживания населения. Государственные услуги в одном месте. Единый номер контакт-центра: один, четыре, один, четыре.",
      kt: "ХҚКО",
      kx: "Халыққа қызмет көрсету орталығы. Мемлекеттік қызметтер бір жерде. Байланыс орталығының бірыңғай нөмірі: 1414.",
      kv: "Халыққа қызмет көрсету орталығы. Мемлекеттік қызметтер бір жерде. Байланыс орталығының бірыңғай нөмірі: бір, төрт, бір, төрт." },
    { i: 8,
      t: "Отдел полиции",
      x: "Отдел полиции Акжарского района. В экстренной ситуации звоните 102.",
      v: "Отдел полиции Акжарского района. В экстренной ситуации звоните: сто два.",
      kt: "Полиция бөлімі",
      kx: "Ақжар аудандық полиция бөлімі. Шұғыл жағдайда 102 нөміріне қоңырау шалыңыз.",
      kv: "Ақжар аудандық полиция бөлімі. Шұғыл жағдайда жүз екі нөміріне қоңырау шалыңыз." },
    { i: 4,
      t: "Ветеринария",
      x: "Ветеринарная служба. Здесь помогают с вопросами здоровья животных, важными для каждого сельского хозяйства.",
      kt: "Ветеринария",
      kx: "Ветеринариялық қызмет. Мұнда мал денсаулығына қатысты мәселелер бойынша көмек көрсетіледі, бұл ауыл шаруашылығы үшін өте маңызды." },
    { i: 10,
      t: "СЭС",
      x: "Санитарно-эпидемиологическая служба. Здесь занимаются санитарно-эпидемиологическим контролем.",
      kt: "СЭС",
      kx: "Санитариялық-эпидемиологиялық қызмет. Мұнда санитариялық-эпидемиологиялық бақылау жүргізіледі." },
    { i: 14,
      t: "Талшыкская средняя школа",
      x: "Талшыкская средняя школа, сокращённо ТСШ.",
      v: "Талшыкская средняя школа.",
      kt: "Талшық орта мектебі",
      kx: "Талшық орта мектебі, қысқаша ТСШ.",
      kv: "Талшық орта мектебі." },
    { i: 15,
      t: "Бестерекская средняя школа",
      x: "Бестерекская средняя школа, сокращённо БСШ.",
      v: "Бестерекская средняя школа.",
      kt: "Бестерек орта мектебі",
      kx: "Бестерек орта мектебі, қысқаша БСШ.",
      kv: "Бестерек орта мектебі." },
    { i: 7,
      t: "Районная больница",
      x: "Районная больница. Скорая помощь вызывается по номеру 103, больница работает круглосуточно.",
      v: "Районная больница. Скорая помощь вызывается по номеру: сто три. Больница работает круглосуточно.",
      kt: "Аудандық аурухана",
      kx: "Аудандық аурухана. Жедел жәрдемді 103 нөмірі арқылы шақыруға болады, аурухана тәулік бойы жұмыс істейді.",
      kv: "Аудандық аурухана. Жедел жәрдемді жүз үш нөмірі арқылы шақыруға болады, аурухана тәулік бойы жұмыс істейді." },
    { i: 9,
      t: "Железнодорожный вокзал",
      x: "Железнодорожный вокзал станции Талшык.",
      kt: "Теміржол вокзалы",
      kx: "Талшық станциясының теміржол вокзалы." },
    { i: null,
      t: "Вот и весь Талшык",
      x: "Вот и весь маршрут. Если вам нужна помощь, просто спросите гида: напишите или скажите, что вам нужно.",
      kt: "Міне, бүкіл бағыт осы",
      kx: "Міне, бүкіл бағыт осы. Көмек керек болса, гидтен сұраңыз: не қажет екенін жазыңыз немесе айтыңыз." }
  ];

  // ===== ТЕКСТЫ ИНТЕРФЕЙСА =====
  const S = {
    ru: {
      title: "🧭 Гид по Талшыку — спросите, и карта покажет",
      ph: "Что вам нужно? Например: справка о стаже, грант, больница…",
      go: "Показать", tour: "▶ Экскурсия по Талшыку",
      chips: ["Справка о стаже", "Госуслуги", "Грант", "Больница", "Куда обратиться с коровой", "Билет на поезд"],
      unknown: "Пока не поняла запрос. Попробуйте иначе: «справка о стаже», «грант», «больница», «ЦОН» — или спросите онлайн-консультанта.",
      unknownVoice: "Не поняла запрос. Попробуйте сказать иначе.",
      askAi: "💬 Спросить консультанта", more: "💬 Подробнее у консультанта",
      foot: "🚶 Пешком", car: "🚗 На машине",
      fromMe: "📍 Откуда: моё местоположение", fromPick: "🖱 Откуда: указать на карте", fromPl: "От: ",
      pickHint: "👆 Кликните на карте точку «Откуда» — оттуда построю маршрут.",
      pickHintTo: "👆 Теперь кликните на карте точку «Куда».",
      toPick: "🖱 Куда: указать на карте", toPl: "Куда: ",
      sameP: "Выберите разные точки в «Откуда» и «Куда».",
      poorGeo: function(a) { return "⚠️ Геолокация неточная (±" + a + " м), браузер определил вас примерно. Кликните на карте, где вы находитесь."; },
      same: "В одном здании: отдел образования, карьерный центр и отдел занятости.",
      sameB: "В одном здании: казначейство, управление СЭС и отдел статистики.",
      st24: "🟢 Круглосуточно", stWeekend: "🔴 Сегодня выходной", stClosed: "🔴 Сегодня уже закрыто",
      stOpensAt: function(h) { return "🔴 Откроется в " + h; },
      stLunch: "🟡 Обеденный перерыв до 14:30",
      stOpen: function(h) { return "🟢 Открыто до " + h; },
      locating: "Определяю ваше местоположение…", building: "Строю маршрут по улицам…",
      noGeo: "Геолокация недоступна. Выберите точку старта в списке.",
      denied: "Не удалось определить местоположение. Разрешите геолокацию или выберите точку старта в списке.",
      footRes: "🚶 Пешком по улицам: ", carRes: "🚗 На машине по улицам: ", approx: ", примерно ",
      fallback: function(d) { return "Маршрут по улицам сейчас недоступен (нет связи с сервисом). Показана прямая: " + d + "."; },
      detourLine: function(d, t) { return "Здание рядом, а по улицам выходит большой крюк — показан прямой путь: " + d + ", примерно " + t + "."; },
      roughLine: function(d, t) { return "⚠️ На карте OpenStreetMap дороги к этому объекту проложены неполно, поэтому показана прямая: " + d + ", примерно " + t + "."; },
      m: "м", km: "км", h: " ч ", min: "мин",
      testBtn: "Произнести",
      voiceLbl: "🎙 Голос:", testVoice: "🔈 Проверить", best: " (лучший)", noVoice: "",
      sample: "Здравствуйте! Я гид по Талшыку. Чем могу помочь?"
    },
    kz: {
      title: "🧭 Талшық гиді — сұраңыз, карта көрсетеді",
      ph: "Не қажет? Мысалы: еңбек өтілі анықтамасы, грант, аурухана…",
      go: "Көрсету", tour: "▶ Талшықты аралау",
      chips: ["Еңбек өтілі анықтамасы", "Мемлекеттік қызметтер", "Грант", "Аурухана", "Сиырмен қайда жүгінемін", "Пойызға билет"],
      unknown: "Сұрауды түсінбедім. Басқаша жазып көріңіз: «еңбек өтілі анықтамасы», «грант», «аурухана», «ХҚКО» — немесе онлайн-кеңесшіден сұраңыз.",
      unknownVoice: "Сұрауды түсінбедім. Басқаша айтып көріңіз.",
      askAi: "💬 Кеңесшіден сұрау", more: "💬 Кеңесшіден толығырақ",
      foot: "🚶 Жаяу", car: "🚗 Көлікпен",
      fromMe: "📍 Қайдан: менің орным", fromPick: "🖱 Қайдан: картадан көрсету", fromPl: "Қайдан: ",
      pickHint: "👆 Картадан «Қайдан» нүктесін басыңыз — бағыт сол жерден құрылады.",
      pickHintTo: "👆 Енді картадан «Қайда» нүктесін басыңыз.",
      toPick: "🖱 Қайда: картадан көрсету", toPl: "Қайда: ",
      sameP: "«Қайдан» және «Қайда» үшін әртүрлі нүкте таңдаңыз.",
      poorGeo: function(a) { return "⚠️ Геолокация дәл емес (±" + a + " м). Картадан өзіңіз тұрған жерді басыңыз."; },
      same: "Бір ғимаратта: білім бөлімі, мансап орталығы және жұмыспен қамту бөлімі.",
      sameB: "Бір ғимаратта: қазынашылық, СЭС басқармасы және статистика бөлімі.",
      st24: "🟢 Тәулік бойы", stWeekend: "🔴 Бүгін демалыс күні", stClosed: "🔴 Бүгін жабық",
      stOpensAt: function(h) { return "🔴 Жабық • ашылу уақыты " + h; },
      stLunch: "🟡 Түскі үзіліс (13:00–14:30)",
      stOpen: function(h) { return "🟢 Ашық • жабылу уақыты " + h; },
      locating: "Орналасқан жеріңіз анықталуда…", building: "Көшелер бойынша бағыт құрылуда…",
      noGeo: "Геолокация қолжетімсіз. Тізімнен бастапқы нүктені таңдаңыз.",
      denied: "Орналасқан жерді анықтау мүмкін болмады. Геолокацияға рұқсат беріңіз немесе тізімнен бастапқы нүктені таңдаңыз.",
      footRes: "🚶 Жаяу көшелер бойынша: ", carRes: "🚗 Көлікпен көшелер бойынша: ", approx: ", шамамен ",
      fallback: function(d) { return "Көшелер бойынша бағыт қазір қолжетімсіз (сервиспен байланыс жоқ). Түзу сызық көрсетілді: " + d + "."; },
      detourLine: function(d, t) { return "Ғимарат жақын, ал көшемен үлкен айналма шығады — тік жол көрсетілді: " + d + ", шамамен " + t + "."; },
      roughLine: function(d, t) { return "⚠️ OpenStreetMap картасында бұл нысанға жол толық салынбаған, сондықтан түзу сызық көрсетілді: " + d + ", шамамен " + t + "."; },
      m: "м", km: "км", h: " сағ ", min: "мин",
      testBtn: "Айту",
      voiceLbl: "🎙 Дауыс:", testVoice: "🔈 Тексеру", best: " (үздік)", noVoice: "🔇 Қазақша дауыс табылмады",
      sample: "Сәлеметсіз бе! Мен Талшық гидімін. Сізге қалай көмектесе аламын?"
    }
  };

  function LG() { return (typeof lang !== "undefined" && lang === "kz") ? "kz" : "ru"; }
  function T(k) { return S[LG()][k]; }

  // ===== СТИЛИ =====
  const css = document.createElement("style");
  css.textContent = [
    ".gv-bar{background:var(--cd);border:1px solid var(--bd);border-radius:18px;padding:16px 18px;margin-top:22px;display:flex;flex-direction:column;gap:10px}",
    ".gv-title{font-size:15px;font-weight:800}",
    ".gv-row{display:flex;gap:8px;flex-wrap:wrap}",
    ".gv-row input{flex:1 1 240px;min-width:0;background:var(--in);border:1px solid var(--bd);color:var(--tx);padding:11px 14px;border-radius:12px;font-size:14px;outline:none}",
    ".gv-row input:focus{border-color:var(--ac)}",
    ".gv-b{background:var(--ac);color:#fff;border:none;padding:10px 16px;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}",
    ".gv-b.sec{background:var(--in);color:var(--tx);border:1px solid var(--bd)}",
    ".gv-b.rec{background:#ef4444;color:#fff}",
    ".gv-sel{background:var(--in);border:1px solid var(--bd);color:var(--tx);padding:9px 10px;border-radius:12px;font-size:12.5px;max-width:100%}",
    ".gv-chips{display:flex;gap:6px;flex-wrap:wrap}",
    ".gv-chip{background:var(--in);border:1px solid var(--bd);color:var(--mt);padding:5px 11px;border-radius:10px;font-size:12px;cursor:pointer}",
    ".gv-chip:hover{border-color:var(--ac);color:var(--tx)}",
    ".gv-ans{background:var(--in);border:1px solid var(--bd);border-radius:14px;padding:14px;display:none;flex-direction:column;gap:6px;font-size:13px}",
    ".gv-ans.on{display:flex}",
    ".gv-ans b.n{font-size:15px;color:var(--ac)}",
    ".gv-ans .q{font-size:12px;color:var(--mt)}",
    ".gv-ring-wrap{background:none;border:none}",
    ".gv-ring{position:absolute;left:-32px;top:-32px;width:64px;height:64px;border-radius:50%;border:3px solid #f59e0b;background:rgba(245,158,11,.18);animation:gvp 1.6s ease-out infinite;pointer-events:none}",
    "@keyframes gvp{0%{transform:scale(.3);opacity:1}100%{transform:scale(1.5);opacity:0}}",
    ".gv-cap{position:absolute;left:10px;right:10px;bottom:10px;z-index:1200;background:rgba(15,23,42,.88);backdrop-filter:blur(6px);color:#f1f5f9;border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:6px}",
    ".gv-cap .ct{font-size:15px;font-weight:800;color:#fbbf24}",
    ".gv-cap .cx{font-size:12.5px;line-height:1.45}",
    ".gv-dots{display:flex;gap:4px}",
    ".gv-dot{height:4px;flex:1;border-radius:2px;background:rgba(255,255,255,.2)}",
    ".gv-dot.on{background:#fbbf24}",
    ".gv-ctl{display:flex;gap:6px}",
    ".gv-ctl button{background:rgba(255,255,255,.12);border:none;color:#fff;border-radius:9px;padding:5px 10px;font-size:14px;cursor:pointer}"
  ].join("");
  document.head.appendChild(css);

  // ===== ПАНЕЛЬ =====
  const bar = document.createElement("div");
  bar.className = "gv-bar";
  bar.innerHTML =
    '<div class="gv-title" id="gvTitle"></div>' +
    '<div class="gv-row"><input id="gvQ" type="text">' +
    '<button type="button" class="gv-b sec" id="gvMic" style="display:none">🎤</button>' +
    '<button type="button" class="gv-b" id="gvGo"></button>' +
    '<button type="button" class="gv-b sec" id="gvTour"></button></div>' +
    '<div class="gv-chips" id="gvChips"></div>' +
    '<div class="gv-row" id="gvVoiceRow" style="display:none;align-items:center">' +
    '<span id="gvVoiceLbl" style="font-size:12px;color:var(--mt)"></span>' +
    '<select id="gvVoice" class="gv-sel"></select>' +
    '<button type="button" class="gv-b sec" id="gvTest"></button>' +
    '<span id="gvVoiceHint" style="font-size:12px;color:var(--mt)"></span></div>' +
    '<div class="gv-ans" id="gvAns"></div>';
  const wrapEl = p3.querySelector(".org-gis-wrap");
  p3.insertBefore(bar, wrapEl || null);

  // скрытая панель для проверки произношения: открыть сайт с ?voicetest в адресе
  if (/[?&]voicetest/.test(location.search)) {
    const tr = document.createElement("div");
    tr.className = "gv-row";
    tr.innerHTML = '<input id="gvTestTxt" type="text" value="Добро пожаловать в Талшык!"><button type="button" class="gv-b sec" id="gvTestBtn"></button>';
    bar.appendChild(tr);
    document.getElementById("gvTestBtn").onclick = function() {
      say(document.getElementById("gvTestTxt").value, null, null, LG(), true);
    };
    // быстрый подбор произношения «Талшык»: нажмите вариант и послушайте
    const vr = document.createElement("div");
    vr.className = "gv-row";
    ["Талшык", "Талшик", "Талшэк", "Талшых", "Тал-шык", "Талшыкх"].forEach(function(w) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "gv-b sec";
      b.textContent = w;
      b.onclick = function() {
        const t = "Добро пожаловать в " + w + "! Сейчас мы облетим главные организации района.";
        document.getElementById("gvTestTxt").value = t;
        say(t, null, null, LG(), true);
      };
      vr.appendChild(b);
    });
    bar.appendChild(vr);
  }

  let lastAsk = null; // {best, q}

  function applyUI() {
    document.getElementById("gvTitle").textContent = T("title");
    document.getElementById("gvQ").placeholder = T("ph");
    document.getElementById("gvGo").textContent = T("go");
    document.getElementById("gvTour").textContent = T("tour");
    const tb = document.getElementById("gvTestBtn");
    if (tb) tb.textContent = T("testBtn");
    document.getElementById("gvVoiceLbl").textContent = T("voiceLbl");
    document.getElementById("gvTest").textContent = T("testVoice");
    fillVoices();
    const chips = document.getElementById("gvChips");
    chips.innerHTML = "";
    T("chips").forEach(function(txt) {
      const c = document.createElement("span");
      c.className = "gv-chip";
      c.textContent = txt;
      c.onclick = function() { document.getElementById("gvQ").value = txt; ask(txt, false); };
      chips.appendChild(c);
    });
  }

  function whenReady(cb) {
    if (window.aqGis) cb(); else document.addEventListener("aqgis-ready", cb, { once: true });
  }
  function hm(m) { return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }
  function status(i) {
    const s = SCHED[i];
    if (s.a) return T("st24");
    const kz = new Date(Date.now() + TZ * 3600 * 1000);
    const d = kz.getUTCDay(), m = kz.getUTCHours() * 60 + kz.getUTCMinutes();
    if (d === 0 || d === 6) return T("stWeekend");
    if (m < s.o) return T("stOpensAt")(hm(s.o));
    if (m >= s.c) return T("stClosed");
    if (m >= 780 && m < 870 && !s.nl) return T("stLunch");
    return T("stOpen")(hm(s.c));
  }
  function norm(s) { return s.toLowerCase().replace(/ё/g, "е"); }
  function pName(p) { return LG() === "kz" ? p.kz : p.ru; }
  function pShort(p) { return LG() === "kz" ? (p.shortKz || p.short) : p.short; }
  function pAddr(g, p) { return g.trAddr ? g.trAddr(p.addr) : p.addr; }

  // ===== ГОЛОС =====
  // Русский: голос Microsoft Светлана (если есть в системе), иначе лучший из русских.
  // Казахский: готовые файлы audio/kz-N.mp3; если их нет — казахский голос браузера (в Edge: Айгуль / Даулет); иначе без звука.
  // Русские файлы audio/ru-N.mp3 тоже подхватываются, если вы их положите (по умолчанию не нужны).
  const synth = window.speechSynthesis;
  let muted = false, speakTok = 0, curAudio = null, fbTimer = null;

  function loadVoices() {
    return new Promise(function(res) {
      if (!synth) return res([]);
      const v = synth.getVoices();
      if (v.length) return res(v);
      let done = false;
      const fin = function() { if (done) return; done = true; res(synth.getVoices()); };
      synth.addEventListener("voiceschanged", fin, { once: true });
      setTimeout(fin, 1500);
    });
  }
  function ruScore(v) {
    const n = (v.name || "").toLowerCase();
    let sc = 0;
    if (/svetlana|светлана/.test(n)) sc += 120;
    if (/irina|ирина/.test(n)) sc += 100;
    if (/natural|neural|online/.test(n)) sc += 10;
    if (/google/.test(n)) sc += 5;
    if (/svetlana|dariya|dmitry|milena|yuri|katya|alena|pavel/.test(n)) sc += 3;
    return sc;
  }
  function kzScore(v) {
    const n = (v.name || "").toLowerCase();
    return /aigul|айгүл/.test(n) ? 100 : /daulet|даулет/.test(n) ? 50 : 0;
  }
  // только женские голоса: мужские имена исключаем
  const MALE = /dmitry|дмитри|pavel|павел|yuri|юри|maxim|максим|mikhail|михаил|alexander|александр|daulet|даулет|\bmale\b|мужск/i;
  function isFemale(v) { return !MALE.test(v.name || ""); }
  // список голосов для языка: русские (Светлана первой) или казахские (Айгуль первой)
  function voicesFor(lc) {
    return loadVoices().then(function(vs) {
      if (lc === "kz") {
        return vs.filter(function(v) { return /^kk/i.test(v.lang) && /aigul|айгүл|айгул/i.test(v.name || ""); }).sort(function(a, b) { return kzScore(b) - kzScore(a); });
      }
      return vs.filter(function(v) { return /^ru/i.test(v.lang) && /svetlana|светлана/i.test(v.name || ""); }).sort(function(a, b) { return ruScore(b) - ruScore(a); });
    });
  }
  function savedVoice(lc) {
    try { return localStorage.getItem("aqjar_voice_" + lc); } catch (e) { return null; }
  }
  function pickVoice(lc) {
    return voicesFor(lc).then(function(list) {
      const sv = savedVoice(lc);
      const f = sv && list.find(function(v) { return v.name === sv; });
      return f || list[0] || null;
    });
  }
  let fillTok = 0;
  function fillVoices() {
    const lc = LG();
    const tok = ++fillTok;   // защита от гонки: если язык переключили, устаревший ответ игнорируем
    voicesFor(lc).then(function(list) {
      if (tok !== fillTok) return;
      const row = document.getElementById("gvVoiceRow");
      const sel = document.getElementById("gvVoice");
      const hint = document.getElementById("gvVoiceHint");
      if (!row || !sel) return;
      sel.innerHTML = "";
      const sv = savedVoice(lc);
      list.forEach(function(v, i) {
        const o = document.createElement("option");
        o.value = v.name;
        o.textContent = v.name + (i === 0 && !sv ? T("best") : "");
        if (sv === v.name) o.selected = true;
        sel.appendChild(o);
      });
      sel.onchange = function() { try { localStorage.setItem("aqjar_voice_" + LG(), sel.value); } catch (e) {} };
      document.getElementById("gvTest").onclick = function() { say(T("sample"), null, null, LG()); };
      const none = !list.length;
      sel.style.display = none ? "none" : "";
      document.getElementById("gvTest").style.display = none ? "none" : "";
      hint.textContent = none ? T("noVoice") : "";
      row.style.display = (none && !T("noVoice")) ? "none" : "flex";
    });
  }
  function stopSpeech() {
    speakTok++;
    clearTimeout(fbTimer);
    if (synth) synth.cancel();
    if (curAudio) { try { curAudio.pause(); } catch (e) {} curAudio = null; }
  }
  function fixPron(text) {
    PRONUNCIATION.forEach(function(r) { text = text.replace(r[0], r[1]); });
    return text;
  }

  // say(текст, что_после, номер_шага_для_файла|null, "ru"|"kz", не_применять_замены)
  function say(text, onend, audioIdx, lc, noFix) {
    stopSpeech();
    const tok = speakTok;
    const finish = function() { if (tok === speakTok && onend) onend(); };
    const waitMs = Math.max(3500, text.length * 60);

    if (muted) { fbTimer = setTimeout(finish, waitMs); return; }

    const tts = function() {
      if (!synth) { fbTimer = setTimeout(finish, waitMs); return; }
      pickVoice(lc).then(function(v) {
        if (tok !== speakTok) return;
        // разрешены только Светлана (ru) и Айгуль (kz): если их нет на устройстве, показываем подписи без озвучки браузера
        if (!v) { fbTimer = setTimeout(finish, waitMs); return; }
        const spoken = (lc === "ru" && !noFix) ? fixPron(text) : text;
        const chunks = (spoken.match(/[^.!?]+[.!?]*/g) || [spoken]).map(function(c) { return c.trim(); }).filter(Boolean);
        let i = 0;
        (function next() {
          if (tok !== speakTok) return;
          if (i >= chunks.length) return finish();
          const u = new SpeechSynthesisUtterance(chunks[i++]);
          if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = "ru-RU"; }
          u.rate = VOICE_RATE;
          u.pitch = 1;
          u.onend = function() { setTimeout(next, CHUNK_PAUSE); };
          u.onerror = function() { setTimeout(next, 0); };
          synth.speak(u);
        })();
      });
    };

    if (audioIdx !== null && audioIdx !== undefined && (lc !== "ru" || RU_AUDIO_FILES)) {
      let fell = false;
      const fb = function() {
        if (fell || tok !== speakTok) return;
        fell = true;
        curAudio = null;
        tts();
      };
      const a = new Audio("audio/" + lc + "-" + audioIdx + ".mp3");
      curAudio = a;
      a.onended = function() { curAudio = null; finish(); };
      a.onerror = fb;
      const pr = a.play();
      if (pr && pr.catch) pr.catch(fb);
    } else {
      tts();
    }
  }

  // ===== пульсирующий круг =====
  let pulse = null;
  function setPulse(g, ll) {
    if (pulse) g.map.removeLayer(pulse);
    pulse = L.marker(ll, {
      icon: L.divIcon({ className: "gv-ring-wrap", html: '<div class="gv-ring"></div>', iconSize: [0, 0] }),
      interactive: false, keyboard: false
    }).addTo(g.map);
  }
  function clearPulse(g) {
    if (pulse) { g.map.removeLayer(pulse); pulse = null; }
  }

  // ===== разбор запроса и ответ =====
  function bestPlace(q) {
    const t = norm(q);
    const score = {};
    RULES.forEach(function(r) { if (r[1].test(t)) score[r[0]] = (score[r[0]] || 0) + r[2]; });
    let best = -1, bs = 0;
    Object.keys(score).forEach(function(k) { if (score[k] > bs) { bs = score[k]; best = +k; } });
    return best;
  }

  function renderAnswer(best, q) {
    const g = window.aqGis;
    const ans = document.getElementById("gvAns");
    const oldFrom = document.getElementById("gvFrom");
    const oldVal = oldFrom ? oldFrom.value : "me";
    ans.classList.add("on");
    ans.innerHTML = "";

    if (best < 0) {
      const m = document.createElement("div");
      m.textContent = T("unknown");
      const b = document.createElement("button");
      b.type = "button"; b.className = "gv-b sec"; b.style.alignSelf = "flex-start";
      b.textContent = T("askAi");
      b.onclick = function() {
        const r1 = document.getElementById("r1");
        if (r1) r1.checked = true;
        if (typeof qAsk === "function") qAsk(q);
      };
      ans.appendChild(m);
      ans.appendChild(b);
      return;
    }

    const p = g.places[best];
    const name = document.createElement("b"); name.className = "n"; name.textContent = pName(p);
    const a1 = document.createElement("div"); a1.textContent = "📍 " + pAddr(g, p);
    const a2 = document.createElement("div"); a2.textContent = "📞 " + p.phone;
    const a3 = document.createElement("div"); a3.textContent = status(best);
    ans.appendChild(name); ans.appendChild(a1); if (p.phone && p.phone !== "—") ans.appendChild(a2); ans.appendChild(a3);
    if (best === 1 || best === 2 || best === 5) {
      const a4 = document.createElement("div"); a4.className = "q"; a4.textContent = T("same"); ans.appendChild(a4);
    }
    if (best === 11 || best === 12 || best === 13) {
      const a5 = document.createElement("div"); a5.className = "q"; a5.textContent = T("sameB"); ans.appendChild(a5);
    }
    const walk = document.createElement("div"); walk.className = "q"; walk.id = "gvWalk"; ans.appendChild(walk);

    const row = document.createElement("div");
    row.className = "gv-row";
    const from = document.createElement("select");
    from.id = "gvFrom"; from.className = "gv-sel";
    const o0 = document.createElement("option");
    o0.value = "me"; o0.textContent = T("fromMe");
    from.appendChild(o0);
    const oPick = document.createElement("option");
    oPick.value = "pick"; oPick.textContent = T("fromPick");
    from.appendChild(oPick);
    g.places.forEach(function(pl, i) {
      if (i === best) return;
      const o = document.createElement("option");
      o.value = String(i); o.textContent = T("fromPl") + pShort(pl);
      from.appendChild(o);
    });
    from.value = oldVal;
    if (from.value !== oldVal) from.value = "me";
    const bw = document.createElement("button");
    bw.type = "button"; bw.className = "gv-b sec"; bw.textContent = T("foot");
    bw.onclick = function() { howToGet(g, "foot"); };
    const bcar = document.createElement("button");
    bcar.type = "button"; bcar.className = "gv-b sec"; bcar.textContent = T("car");
    bcar.onclick = function() { howToGet(g, "car"); };
    const bc = document.createElement("button");
    bc.type = "button"; bc.className = "gv-b sec"; bc.textContent = T("more");
    bc.onclick = function() {
      const r1 = document.getElementById("r1");
      if (r1) r1.checked = true;
      if (typeof qAsk === "function") qAsk(q);
    };
    // плашка «Куда»: все объекты + указать на карте
    const to = document.createElement("select");
    to.id = "gvTo"; to.className = "gv-sel";
    g.places.forEach(function(pl, i) {
      const o = document.createElement("option");
      o.value = String(i); o.textContent = T("toPl") + pShort(pl);
      to.appendChild(o);
    });
    const tPick = document.createElement("option");
    tPick.value = "pick"; tPick.textContent = T("toPick");
    to.appendChild(tPick);
    to.value = String(best);
    to.onchange = function() {
      if (to.value === "pick") {
        const w = document.getElementById("gvWalk");
        if (w) w.textContent = T("pickHintTo");
        return;
      }
      const idx = +to.value;
      lastAsk = { best: idx, q: q };
      renderAnswer(idx, q);
      g.go(idx);
      setPulse(g, g.places[idx].ll);
    };
    const rowSel = document.createElement("div");
    rowSel.className = "gv-row";
    rowSel.appendChild(from); rowSel.appendChild(to);
    ans.appendChild(rowSel);
    row.appendChild(bw); row.appendChild(bcar); row.appendChild(bc);
    ans.appendChild(row);
  }

  function ask(q, fromVoice) {
    q = (q || "").trim();
    if (!q) return;
    whenReady(function() {
      const g = window.aqGis;
      const best = bestPlace(q);
      lastAsk = { best: best, q: q };
      renderAnswer(best, q);
      if (best < 0) {
        if (fromVoice) say(T("unknownVoice"), null, null, LG());
        return;
      }
      const p = g.places[best];
      g.go(best);
      setPulse(g, p.ll);
      if (fromVoice) say(pName(p) + ". " + status(best).replace(/^\S+\s/, "") + ".", null, null, LG());
    });
  }

  // ===== маршрут по улицам =====
  // Точки подъезда к зданиям: координата на ДОРОГЕ/улице рядом со зданием (индекс — как в mapa.js:
  // 0 Акимат, 1 Карьерный, 2 Образование, 3 Архив, 4 Ветеринария, 5 Занятость, 6 ЦОН, 7 Больница, 8 Отдел полиции, 9 Вокзал, 10 СЭС).
  // Если у здания в OpenStreetMap нет подходящей дороги рядом, впишите сюда [lat, lng] ближайшей улицы
  // (правый клик на карте 2ГИС/Google → «координаты»). Маршрут будет строиться до этой точки, а дальше пунктиром до здания.
  const ENTRY = { 7: null, 9: null };
  let routeLayer = null, walker = null, walkAnim = null;

  function clearRoute(g) {
    if (walkAnim) { cancelAnimationFrame(walkAnim); walkAnim = null; }
    if (routeLayer) { g.map.removeLayer(routeLayer); routeLayer = null; }
    if (walker) { g.map.removeLayer(walker); walker = null; }
  }
  let pickHandler = null;
  function cancelPick(g) {
    if (pickHandler) { g.map.off("click", pickHandler); pickHandler = null; }
    g.map.getContainer().style.cursor = "";
  }
  // игрок сам указывает точку старта кликом по карте
  function pickStart(g, msg, ok) {
    cancelPick(g);
    const out = document.getElementById("gvWalk");
    if (out) out.textContent = msg;
    g.map.getContainer().style.cursor = "crosshair";
    pickHandler = function(e) {
      cancelPick(g);
      ok([e.latlng.lat, e.latlng.lng]);
    };
    g.map.on("click", pickHandler);
  }
  function getStart(g, from, ok, fail) {
    cancelPick(g);
    if (from === "pick") return pickStart(g, T("pickHint"), ok);
    if (from !== "me") return ok(g.places[+from].ll);
    if (!navigator.geolocation) return fail(T("noGeo"));
    navigator.geolocation.getCurrentPosition(function(pos) {
      const acc = Math.round(pos.coords.accuracy || 0);
      // ПК без GPS определяется по IP/Wi-Fi с ошибкой в километры — маршрут из такой точки уйдёт в поле
      if (acc > 500) return pickStart(g, T("poorGeo")(acc), ok);
      ok([pos.coords.latitude, pos.coords.longitude]);
    }, function() {
      fail(T("denied"));
    }, { enableHighAccuracy: true, timeout: 10000 });
  }
  function fmtDist(m) { return m < 1000 ? Math.round(m) + " " + T("m") : (m / 1000).toFixed(1) + " " + T("km"); }
  function fmtTime(sec) {
    const m = Math.max(1, Math.round(sec / 60));
    return m < 60 ? m + " " + T("min") : Math.floor(m / 60) + T("h") + (m % 60) + " " + T("min");
  }
  function animateWalker(g, pts) {
    if (walker) g.map.removeLayer(walker);
    walker = L.circleMarker(pts[0], { radius: 7, color: "#fff", weight: 3, fillColor: "#3b82f6", fillOpacity: 1 }).addTo(g.map);
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + g.map.distance(pts[i - 1], pts[i]));
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
  function howToGet(g, mode) {
    const out = document.getElementById("gvWalk");
    const fromEl = document.getElementById("gvFrom");
    const toEl = document.getElementById("gvTo");
    const from = fromEl ? fromEl.value : "me";
    const toVal = toEl ? toEl.value : "";
    if (from !== "me" && from !== "pick" && from === toVal) { if (out) out.textContent = T("sameP"); return; }
    if (out) out.textContent = T("building");

    getStart(g, from, function(start) {
      clearRoute(g);
      const withDest = function(p, pi) {
      const target = (ENTRY[pi] && ENTRY[pi].length === 2) ? ENTRY[pi] : p.ll;
      const url = "https://routing.openstreetmap.de/" + (mode === "car" ? "routed-car" : "routed-foot") +
        "/route/v1/" + (mode === "car" ? "driving" : "foot") + "/" +
        start[1] + "," + start[0] + ";" + target[1] + "," + target[0] + "?overview=full&geometries=geojson";
      const dot = function() { return L.circleMarker(start, { radius: 8, color: "#fff", weight: 3, fillColor: "#3b82f6", fillOpacity: 1 }); };

      fetch(url).then(function(r) { return r.json(); }).then(function(data) {
        if (!data.routes || !data.routes.length) throw new Error("no route");
        const rt = data.routes[0];
        const pts = rt.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
        // Проверка здравого смысла: если дорога заканчивается далеко от здания или маршрут
        // делает огромный крюк — в OSM тут нет нормальных дорог, честнее показать прямую.
        const straightD = g.map.distance(start, p.ll);
        const gapE = g.map.distance(pts[pts.length - 1], p.ll);
        const gapS = g.map.distance(pts[0], start);
        if (gapE > 150 || gapS > 150) throw new Error("bad_route");
        // здания рядом, а роутер повёл в обход квартала — идём напрямую (пешком порог строже, чем на машине)
        if (rt.distance > (mode === "foot" ? straightD * 1.7 + 150 : straightD * 2.5 + 400)) throw new Error("detour");
        // OSRM притягивает точки к ближайшей дороге: дорисовываем отрезки до точных координат
        const dashed = { color: "#f59e0b", weight: 4, dashArray: "6 8" };
        const layers = [
          L.polyline(pts, { color: "#ffffff", weight: 9, opacity: 0.85 }),
          L.polyline(pts, { color: "#f59e0b", weight: 5 })
        ];
        if (g.map.distance(pts[pts.length - 1], p.ll) > 3) layers.push(L.polyline([pts[pts.length - 1], p.ll], dashed));
        if (g.map.distance(pts[0], start) > 3) layers.push(L.polyline([start, pts[0]], dashed));
        layers.push(L.circleMarker(p.ll, { radius: 9, color: "#fff", weight: 3, fillColor: "#10b981", fillOpacity: 1 }));
        layers.push(dot());
        routeLayer = L.layerGroup(layers).addTo(g.map);
        g.map.fitBounds(L.latLngBounds(pts.concat([p.ll, start])), { padding: [60, 60], maxZoom: 17 });
        animateWalker(g, pts.concat([p.ll]));
        if (out) out.textContent = (mode === "car" ? T("carRes") : T("footRes")) + fmtDist(rt.distance) + T("approx") + fmtTime(rt.duration) + ".";
      }).catch(function(e) {
        routeLayer = L.layerGroup([
          L.polyline([start, p.ll], { color: "#f59e0b", weight: 4, dashArray: "8 8" }),
          dot()
        ]).addTo(g.map);
        g.map.fitBounds(L.latLngBounds([start, p.ll]), { padding: [60, 60], maxZoom: 17 });
        const dd = g.map.distance(start, p.ll);
        if (out) out.textContent = T(e && e.message === "detour" ? "detourLine" : "roughLine")(fmtDist(dd), fmtTime(dd * (mode === "foot" ? 1.15 : 1) / (mode === "car" ? 8.3 : 1.35)));
      });
      };
      if (toVal === "pick") {
        // показываем выбранную точку старта, пока пользователь выбирает финиш
        routeLayer = L.layerGroup([L.circleMarker(start, { radius: 8, color: "#fff", weight: 3, fillColor: "#3b82f6", fillOpacity: 1 })]).addTo(g.map);
        pickStart(g, T("pickHintTo"), function(ll) {
          clearRoute(g);
          if (out) out.textContent = T("building");
          withDest({ ll: ll }, -1);
        });
      } else {
        withDest(g.places[+toVal], +toVal);
      }
    }, function(msg) {
      if (out) out.textContent = msg;
    });
  }

  document.getElementById("gvGo").onclick = function() { ask(document.getElementById("gvQ").value, false); };
  document.getElementById("gvQ").addEventListener("keydown", function(e) {
    if (e.key === "Enter") ask(this.value, false);
  });

  // ===== голосовой ввод =====
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    const mic = document.getElementById("gvMic");
    mic.style.display = "";
    let rec = null, on = false;
    mic.onclick = function() {
      if (on && rec) { rec.stop(); return; }
      rec = new SR();
      rec.lang = LG() === "kz" ? "kk-KZ" : "ru-RU";
      rec.interimResults = false;
      rec.onstart = function() { on = true; mic.classList.add("rec"); mic.textContent = "⏺"; };
      rec.onend = function() { on = false; mic.classList.remove("rec"); mic.textContent = "🎤"; };
      rec.onerror = function() { on = false; mic.classList.remove("rec"); mic.textContent = "🎤"; };
      rec.onresult = function(e) {
        const txt = e.results[0][0].transcript;
        document.getElementById("gvQ").value = txt;
        ask(txt, true);
      };
      try { rec.start(); } catch (e) {}
    };
  }

  // ===== экскурсия =====
  let cap = null, cur = 0, paused = false, wait = null, token = 0;

  function stepText(s) { return LG() === "kz" ? { t: s.kt, x: s.kx, v: s.kv || s.kx } : { t: s.t, x: s.x, v: s.v || s.x }; }

  function renderCap() {
    if (!cap) return;
    const s = stepText(TOUR[cur]);
    cap.innerHTML = "";
    const dots = document.createElement("div");
    dots.className = "gv-dots";
    TOUR.forEach(function(_, i) {
      const d = document.createElement("div");
      d.className = "gv-dot" + (i <= cur ? " on" : "");
      dots.appendChild(d);
    });
    const t = document.createElement("div"); t.className = "ct"; t.textContent = s.t;
    const x = document.createElement("div"); x.className = "cx"; x.textContent = s.x;
    const ctl = document.createElement("div"); ctl.className = "gv-ctl";
    function btn(label, fn) {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = label; b.onclick = fn;
      ctl.appendChild(b);
    }
    btn("⏮", function() { go(cur - 1); });
    btn(paused ? "▶" : "⏸", function() { paused ? resume() : pause(); });
    btn("⏭", function() { go(cur + 1); });
    btn(muted ? "🔇" : "🔊", function() { muted = !muted; if (paused) { stopSpeech(); renderCap(); } else { runStep(); } });
    btn("✖", stopTour);
    cap.appendChild(dots); cap.appendChild(t); cap.appendChild(x); cap.appendChild(ctl);
  }

  function runStep() {
    const g = window.aqGis;
    clearTimeout(wait);
    stopSpeech();
    const my = ++token;
    const raw = TOUR[cur];
    if (raw.i === null) {
      clearPulse(g);
      g.map.flyToBounds(L.latLngBounds(g.places.map(function(p) { return p.ll; })), { padding: [30, 30], maxZoom: 16, duration: 1.4 });
    } else {
      g.go(raw.i);
      setPulse(g, g.places[raw.i].ll);
    }
    renderCap();
    const done = function() {
      if (my !== token || paused) return;
      wait = setTimeout(function() { if (my === token && !paused) go(cur + 1); }, 900);
    };
    say(stepText(raw).v, done, cur, LG());
  }

  function go(i) {
    if (i < 0) i = 0;
    if (i >= TOUR.length) return stopTour();
    cur = i;
    runStep();
  }
  function pause() { paused = true; token++; clearTimeout(wait); stopSpeech(); renderCap(); }
  function resume() { paused = false; runStep(); }
  function stopTour() {
    token++;
    clearTimeout(wait);
    stopSpeech();
    paused = false;
    if (cap) { cap.remove(); cap = null; }
    if (window.aqGis) clearPulse(window.aqGis);
  }

  document.getElementById("gvTour").onclick = function() {
    whenReady(function() {
      const box = document.getElementById("gisBox");
      if (!box) return;
      stopTour();
      cap = document.createElement("div");
      cap.className = "gv-cap";
      box.appendChild(cap);
      box.scrollIntoView({ behavior: "smooth", block: "center" });
      paused = false;
      go(0);
    });
  };

  // ===== переключение языка =====
  document.addEventListener("aqlang", function() {
    applyUI();
    if (lastAsk) renderAnswer(lastAsk.best, lastAsk.q);
    if (cap) { if (paused) renderCap(); else runStep(); }
  });

  applyUI();
})();
