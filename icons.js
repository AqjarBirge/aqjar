/*!
 * icons.js — векторные иконки вместо эмодзи-«стикеров».
 *
 * Как работает: сайт остаётся как есть, а этот скрипт следит за страницей
 * и заменяет каждый эмодзи на аккуратную линейную SVG-иконку того же смысла.
 * Иконки берут цвет текста (currentColor), поэтому сами подстраиваются под
 * светлую/тёмную тему, кнопки и заголовки.
 *
 * Подключать в app.html и index.html ПЕРВЫМ среди скриптов:
 *     <script src="icons.js"></script>
 *
 * Полезное:
 *   aqIcon("pin")              -> строка с <svg> для вставки в свой HTML
 *   aqIcons.names              -> список всех иконок
 *   aqIcons.scan(элемент)      -> заменить эмодзи внутри элемента вручную
 *   data-noicon="1"            -> поставьте на элемент, чтобы его не трогать
 */
(function () {
  "use strict";
  if (window.__aqIcons) return;
  window.__aqIcons = true;

  var SVGNS = "http://www.w3.org/2000/svg";

  // ---------------------------------------------------------------------------
  // 1. ИКОНКИ (сетка 24×24, линия 1.75, скруглённые концы)
  // ---------------------------------------------------------------------------
  var ICONS = {
    // здания и организации
    "building": '<path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4H13a1.5 1.5 0 0 1 1.5 1.5V21"/><path d="M14.5 10h4A1.5 1.5 0 0 1 20 11.5V21"/><path d="M2.5 21h19"/><path d="M8 8h2M8 12h2M8 16h2"/><path d="M17 14h.01M17 17.5h.01"/>',
    "landmark": '<path d="M3 21h18"/><path d="M5.5 18v-7M9.8 18v-7M14.2 18v-7M18.5 18v-7"/><path d="M12 3l9 5.5H3z"/><path d="M3 18h18"/>',
    "school": '<path d="M3 21h18"/><path d="M5 21V9.5L12 4l7 5.5V21"/><path d="M10 21v-5.5h4V21"/><circle cx="12" cy="10.2" r="1.3"/>',
    "hospital": '<path d="M4 21V6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5V21"/><path d="M2.5 21h19"/><path d="M12 8.5v5M9.5 11h5"/><path d="M10 21v-3.5h4V21"/>',
    "briefcase": '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2.5 13h19"/><path d="M10.5 13v1.6h3V13"/>',
    "cap": '<path d="M22 10l-10-5-10 5 10 5 10-5z"/><path d="M6 12.2V17c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.8"/><path d="M22 10v6"/>',
    "archive": '<rect x="2.5" y="3" width="19" height="5" rx="1"/><path d="M4.5 8v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8"/><path d="M10 12.5h4"/>',
    "coins": '<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.4 18"/><path d="M7 6h1v4"/><path d="M16.7 13.9l.7.7-2.8 2.8"/>',
    "bar-chart": '<path d="M4 21V10M10 21V4M16 21v-7M2.5 21h19"/>',
    "flask": '<path d="M9 3h6"/><path d="M10 3v5.5L4.8 18a2 2 0 0 0 1.8 3h10.8a2 2 0 0 0 1.8-3L14 8.5V3"/><path d="M7.5 14.5h9"/>',
    "paw": '<circle cx="5.5" cy="11" r="1.8"/><circle cx="9.5" cy="6.5" r="1.8"/><circle cx="14.5" cy="6.5" r="1.8"/><circle cx="18.5" cy="11" r="1.8"/><path d="M12 11.5c-3 0-5.5 3-5.5 5.5 0 1.7 1.4 2.5 3 2.5 1 0 1.6-.5 2.5-.5s1.5.5 2.5.5c1.6 0 3-.8 3-2.5 0-2.5-2.5-5.5-5.5-5.5z"/>',
    "train": '<rect x="5" y="3" width="14" height="14" rx="3.5"/><path d="M5 11h14"/><path d="M9 14.3h.01M15 14.3h.01"/><path d="M8 21l2-4M16 21l-2-4"/>',
    "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    "shield-check": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    "home": '<path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20z"/><path d="M9.5 21.5v-7h5v7"/>',

    // связь, карта, навигация
    "phone": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    "chat": '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/>',
    "pin": '<path d="M12 21.5s7-5.7 7-11.2a7 7 0 0 0-14 0c0 5.5 7 11.2 7 11.2z"/><circle cx="12" cy="10.3" r="2.5"/>',
    "map": '<path d="M9 4L3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
    "compass": '<circle cx="12" cy="12" r="9.5"/><path d="M15.8 8.2l-1.9 5.7-5.7 1.9 1.9-5.7z"/>',
    "globe": '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19"/><path d="M12 2.5a14.5 14.5 0 0 1 3.8 9.5 14.5 14.5 0 0 1-3.8 9.5 14.5 14.5 0 0 1-3.8-9.5A14.5 14.5 0 0 1 12 2.5z"/>',
    "satellite": '<path d="M13 7L9 3 5 7l4 4"/><path d="M17 11l4 4-4 4-4-4"/><path d="M8 12l4 4 6-6-4-4z"/><path d="M16 8l3-3"/><path d="M9 21a6 6 0 0 0-6-6"/>',
    "car": '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    "walk": '<circle cx="13.5" cy="4.2" r="1.8"/><path d="M10.2 21l1.6-5.6-2.6-2.4 1.3-4.7 3.1 1.7 2.7 3"/><path d="M11 9.5L8 12M14 16.5l1.8 4.5"/>',
    "bike": '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5L9 9h7l2.5 7.5"/><path d="M9 9l3.5 7.5L16 9"/><path d="M14.5 5.5H17"/>',
    "pointer": '<path d="M4 4l6.6 16 2.4-6.9 6.9-2.4z"/><path d="M13 13l6 6"/>',
    "send": '<path d="M21.5 2.5L10.5 13.5"/><path d="M21.5 2.5L15 21.5l-4.5-8L2.5 9z"/>',
    "inbox": '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',

    // действия и статусы
    "clipboard": '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4v-.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5V4"/><path d="M9 11h6M9 15h4"/>',
    "file": '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M13 2v7h7"/>',
    "book": '<path d="M2.5 3.5H8A4 4 0 0 1 12 7.5V21a3 3 0 0 0-3-3H2.5z"/><path d="M21.5 3.5H16A4 4 0 0 0 12 7.5V21a3 3 0 0 1 3-3h6.5z"/>',
    "trash": '<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l.8 12a2 2 0 0 0 2 1.9h6.4a2 2 0 0 0 2-1.9L18 7"/><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/>',
    "x": '<path d="M6 6l12 12M18 6L6 18"/>',
    "x-circle": '<circle cx="12" cy="12" r="9.5"/><path d="M15 9l-6 6M9 9l6 6"/>',
    "check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    "check-circle": '<circle cx="12" cy="12" r="9.5"/><path d="M8 12.5l2.8 2.8L16 9.5"/>',
    "alert": '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4"/><path d="M12 17.2h.01"/>',
    "help": '<circle cx="12" cy="12" r="9.5"/><path d="M9.2 9.3a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.5-2.8 2.5"/><path d="M12 17h.01"/>',
    "lock": '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/><path d="M12 15v2"/>',
    "clock": '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2"/>',
    "hourglass": '<path d="M5 22h14M5 2h14"/><path d="M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4A2 2 0 0 0 7 17.8V22"/><path d="M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4A2 2 0 0 0 17 6.2V2"/>',
    "timer": '<circle cx="12" cy="13.5" r="8"/><path d="M12 9.5v4l2.5 1.5"/><path d="M9.5 2h5M12 2v3.5"/>',
    "alarm": '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M4 4.5L7 2M20 4.5L17 2"/>',
    "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/>',
    "users": '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16.8 14.2c2.9.2 4.7 2.3 4.7 5.3"/>',
    "bot": '<rect x="4" y="8" width="16" height="12" rx="3.5"/><path d="M12 8V5"/><circle cx="12" cy="3.7" r="1.1"/><path d="M9 13.5h.01M15 13.5h.01"/><path d="M9.5 17h5"/><path d="M2 13v3M22 13v3"/>',
    "bulb": '<path d="M9 18h6M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 0-3.7 11.8c.5.4.7 1 .7 1.7v.5h6V16c0-.7.2-1.3.7-1.7A6.5 6.5 0 0 0 12 2.5z"/>',
    "sliders": '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/>',
    "menu": '<path d="M4 7h16M4 12h16M4 17h16"/>',
    "wrench": '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',

    // стрелки и плеер
    "arrow-right": '<path d="M4 12h16M13.5 5.5L20 12l-6.5 6.5"/>',
    "arrow-left": '<path d="M20 12H4M10.5 5.5L4 12l6.5 6.5"/>',
    "arrow-down": '<path d="M12 4v16M5.5 13.5L12 20l6.5-6.5"/>',
    "chevron-left": '<path d="M15 5l-7 7 7 7"/>',
    "chevron-right": '<path d="M9 5l7 7-7 7"/>',
    "play": '<path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor"/>',
    "pause": '<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>',
    "skip-forward": '<path d="M5 4.8v14.4a.8.8 0 0 0 1.2.7l10.6-7.2a.8.8 0 0 0 0-1.4L6.2 4.1A.8.8 0 0 0 5 4.8z" fill="currentColor"/><path d="M19 5v14"/>',
    "skip-back": '<path d="M19 4.8v14.4a.8.8 0 0 1-1.2.7L7.2 12.7a.8.8 0 0 1 0-1.4l10.6-7.2A.8.8 0 0 1 19 4.8z" fill="currentColor"/><path d="M5 5v14"/>',
    "record": '<circle cx="12" cy="12" r="6.5" fill="currentColor"/>',
    "mic": '<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M19 10.5v1.5a7 7 0 0 1-14 0v-1.5"/><path d="M12 19v3M8.5 22h7"/>',
    "volume": '<path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z"/><path d="M15.5 9a4 4 0 0 1 0 6"/>',
    "volume-2": '<path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18.5 6a8 8 0 0 1 0 12"/>',
    "volume-x": '<path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',

    // оценка, настроение, награды
    "star": '<path d="M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.6l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z"/>',
    "star-fill": '<path d="M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.6l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z" fill="currentColor"/>',
    "heart": '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21.2l7.7-7.8 1.1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    "smile": '<circle cx="12" cy="12" r="9.5"/><path d="M8 14c1 1.5 2.4 2.2 4 2.2s3-.7 4-2.2"/><path d="M9 9.5h.01M15 9.5h.01"/>',
    "laugh": '<circle cx="12" cy="12" r="9.5"/><path d="M7.5 13.2h9a4.5 4.5 0 0 1-9 0z"/><path d="M9 9h.01M15 9h.01"/>',
    "meh": '<circle cx="12" cy="12" r="9.5"/><path d="M8.5 15.5h7"/><path d="M9 9.5h.01M15 9.5h.01"/>',
    "confused": '<circle cx="12" cy="12" r="9.5"/><path d="M8.5 16.2l7-1.6"/><path d="M9 9.5h.01M15 9.5h.01"/>',
    "frown": '<circle cx="12" cy="12" r="9.5"/><path d="M8 16.7c1-1.5 2.4-2.2 4-2.2s3 .7 4 2.2"/><path d="M9 9.5h.01M15 9.5h.01"/>',
    "thumbs-up": '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.3a2 2 0 0 0 2-1.7l1.4-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>',
    "hand": '<path d="M18 11V6a2 2 0 0 0-4 0"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.3l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
    "target": '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.4"/>',
    "trophy": '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.7V17c0 .6-.5 1-1 1.2-1.2.6-2 2-2 3.8"/><path d="M14 14.7V17c0 .6.5 1 1 1.2 1.200.6 2 2 2 3.800"/><path d="M18 2H6v7a6 6 0 0 0 12 0z"/>',
    "medal": '<circle cx="12" cy="15" r="6"/><path d="M8.7 10.2L6 2.5h4.8L12 6M15.3 10.2L18 2.5h-4.8L12 6"/><path d="M12 12.5v5"/>',
    "backpack": '<path d="M8.5 6.5V5a3.5 3.5 0 0 1 7 0v1.5"/><rect x="5" y="6.5" width="14" height="14.5" rx="3.5"/><path d="M9 14.5h6v3.5a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/>',
    "sparkles": '<path d="M11 3l1.9 5.6L18.5 10.5l-5.6 1.9L11 18l-1.9-5.6L3.5 10.5l5.6-1.9z"/><path d="M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',

    // погода
    "sun": '<circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v2M12 20.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1.5 12h2M20.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
    "cloud-sun": '<path d="M12 2v2M4.9 4.9l1.4 1.4M20 12h2M19.1 4.9l-1.4 1.4"/><path d="M15.9 12.7a4 4 0 0 0-5.9-4.2"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6z"/>',
    "sun-cloud": '<circle cx="8" cy="8" r="3.2"/><path d="M8 1.5v1.3M2.5 8H1.3M3.3 3.3l.9.9M12.7 3.3l-.9.9"/><path d="M19 20h-8.5a4 4 0 1 1 .9-7.9A5 5 0 0 1 19 12.5a3.8 3.8 0 0 1 0 7.5z"/>',
    "cloud-rain": '<path d="M20 16.6A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.3"/><path d="M8 13v7M12 15v7M16 13v7"/>',
    "cloud-snow": '<path d="M20 17.6A5 5 0 0 0 18 8h-1.3A8 8 0 1 0 4 16.3"/><path d="M8 16h.01M8 20h.01M12 18h.01M12 22h.01M16 16h.01M16 20h.01"/>',
    "cloud-lightning": '<path d="M19 16.9A5 5 0 0 0 18 7h-1.3a8 8 0 1 0-11.6 9"/><path d="M13 11l-4 6h6l-4 6"/>',
    "snowflake": '<path d="M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17"/><path d="M9 3.8l3 2.2 3-2.2M9 20.2l3-2.2 3 2.2"/>',
    "fog": '<path d="M3 8h18M5 12h14M3 16h18M7 20h10"/>',
    "wind": '<path d="M9.6 4.6A2 2 0 1 1 11 8H2m10.6 11.4A2 2 0 1 0 14 16H2m15.7-8.3A2.5 2.5 0 1 1 19.5 12H2"/>'
  };

  // ---------------------------------------------------------------------------
  // 2. КАКОЙ ЭМОДЗИ -> КАКАЯ ИКОНКА
  // ---------------------------------------------------------------------------
  var MAP = {
    "🏢": "building", "🏛": "landmark", "🏫": "school", "🏥": "hospital", "💼": "briefcase", "🎓": "cap",
    "📂": "archive", "🏦": "coins", "📊": "bar-chart", "🧪": "flask", "🐄": "paw", "🚆": "train",
    "🚓": "shield", "🛡": "shield-check", "🏠": "home",
    "📞": "phone", "💬": "chat", "📍": "pin", "🗺": "map", "🧭": "compass", "🌐": "globe", "🛰": "satellite",
    "🚗": "car", "🚶": "walk", "🚲": "bike", "🖱": "pointer", "👆": "pointer", "➤": "send", "📥": "inbox",
    "📋": "clipboard", "📄": "file", "📖": "book", "🗑": "trash", "✕": "x", "✖": "x", "❌": "x-circle",
    "✓": "check", "✔": "check", "✅": "check-circle", "⚠": "alert", "🤔": "help", "🔒": "lock",
    "🕒": "clock", "⏳": "hourglass", "⏱": "timer", "⏰": "alarm", "👤": "user", "🤝": "users", "🤖": "bot",
    "💡": "bulb", "⚙": "sliders", "☰": "menu", "🔧": "wrench",
    "→": "arrow-right", "←": "arrow-left", "⬇": "arrow-down", "◀": "chevron-left", "▶": "play",
    "⏸": "pause", "⏭": "skip-forward", "⏮": "skip-back", "⏺": "record",
    "🎤": "mic", "🎙": "mic", "🔈": "volume", "🔊": "volume-2", "🔇": "volume-x",
    "⭐": "star-fill", "★": "star-fill", "☆": "star", "💚": "heart",
    "🙂": "smile", "🤩": "laugh", "😐": "meh", "😕": "confused", "😞": "frown", "😅": "frown",
    "👍": "thumbs-up", "👋": "hand", "🎯": "target", "🏆": "trophy", "🏅": "medal", "🎒": "backpack", "🎉": "sparkles",
    "☀": "sun", "🌤": "sun-cloud", "⛅": "cloud-sun", "🌧": "cloud-rain", "🌨": "cloud-snow",
    "⛈": "cloud-lightning", "❄": "snowflake", "🌫": "fog", "💨": "wind"
  };
  // цветные кружки-статусы
  var DOT = { "🟢": "g", "🟡": "y", "🔴": "r" };

  // ---------------------------------------------------------------------------
  // 3. СТИЛИ И СПРАЙТ
  // ---------------------------------------------------------------------------
  var CSS =
    ".ic{width:1.15em;height:1.15em;flex:none;display:inline-block;vertical-align:-.2em;fill:none;stroke:currentColor;" +
    "stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;overflow:visible}" +
    ".ic-l{margin-right:.42em}.ic-t{margin-left:.42em}.ic+.ic{margin-left:.14em}" +
    ".sdot{display:inline-block;width:.58em;height:.58em;border-radius:50%;flex:none;vertical-align:.04em}" +
    ".sdot-l{margin-right:.5em}.sdot-t{margin-left:.5em}" +
    ".sdot-g{background:#22c55e;box-shadow:0 0 0 .2em rgba(34,197,94,.22)}" +
    ".sdot-y{background:#f59e0b;box-shadow:0 0 0 .2em rgba(245,158,11,.24)}" +
    ".sdot-r{background:#ef4444;box-shadow:0 0 0 .2em rgba(239,68,68,.22)}";

  function installBase() {
    if (document.getElementById("aq-icons-css")) return;
    var st = document.createElement("style");
    st.id = "aq-icons-css";
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);

    var sp = document.createElementNS(SVGNS, "svg");
    sp.setAttribute("id", "aq-icons-sprite");
    sp.setAttribute("aria-hidden", "true");
    sp.setAttribute("width", "0");
    sp.setAttribute("height", "0");
    sp.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
    var html = "";
    Object.keys(ICONS).forEach(function (n) {
      html += '<symbol id="aq-i-' + n + '" viewBox="0 0 24 24">' + ICONS[n] + "</symbol>";
    });
    sp.innerHTML = html;
    document.body.appendChild(sp);
  }

  // ---------------------------------------------------------------------------
  // 4. ЗАМЕНА В ТЕКСТЕ
  // ---------------------------------------------------------------------------
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  var keys = Object.keys(MAP).concat(Object.keys(DOT)).sort(function (a, b) { return b.length - a.length; });
  var RE = new RegExp(
    "(" + keys.map(esc).join("|") + ")[\\uFE0E\\uFE0F]?" +
    // любые другие эмодзи, которых нет в списке выше, просто убираем
    "|[\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}\\u{23E9}-\\u{23FA}\\u{FE0E}\\u{FE0F}\\u{200D}\\u{20E3}]",
    "gu"
  );
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1, INPUT: 1, CODE: 1, PRE: 1 };

  function skipped(el) {
    for (var p = el; p && p.nodeType === 1; p = p.parentNode) {
      if (SKIP[p.nodeName] || (p.namespaceURI === SVGNS && p.nodeName !== "svg" && /^(text|tspan)$/i.test(p.nodeName))) return true;
      if (p.getAttribute && p.getAttribute("data-noicon") !== null) return true;
    }
    return false;
  }

  function stripAll(t) {
    return t.replace(RE, "").replace(/^\s+/, "");
  }

  function makeIcon(name, cls) {
    var s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("class", "ic" + (cls ? " " + cls : ""));
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("focusable", "false");
    var u = document.createElementNS(SVGNS, "use");
    u.setAttribute("href", "#aq-i-" + name);
    s.appendChild(u);
    return s;
  }
  function makeDot(color, cls) {
    var s = document.createElement("span");
    s.className = "sdot sdot-" + color + (cls ? " " + cls : "");
    s.setAttribute("aria-hidden", "true");
    return s;
  }

  function convertText(node) {
    var t = node.nodeValue;
    if (!t) return;
    RE.lastIndex = 0;
    if (!RE.test(t)) return;
    RE.lastIndex = 0;
    var parent = node.parentNode;
    if (!parent || skipped(parent)) return;

    var pn = parent.nodeName;
    if (pn === "OPTION" || pn === "OPTGROUP" || pn === "TITLE") {
      node.nodeValue = stripAll(t);
      return;
    }

    // 1) разбираем текст на куски: строки и иконки
    var toks = [], last = 0, m;
    while ((m = RE.exec(t))) {
      if (m.index > last) toks.push(t.slice(last, m.index));
      var ch = m[1];
      if (ch && MAP[ch]) toks.push({ icon: MAP[ch], ch: ch });
      else if (ch && DOT[ch]) toks.push({ dot: DOT[ch] });
      last = m.index + m[0].length;
    }
    if (last < t.length) toks.push(t.slice(last));
    if (!toks.length) { node.nodeValue = ""; return; }

    // 2) решаем, с какой стороны у иконки отступ, и убираем лишний пробел
    function hasContent(from, dir) {
      for (var i = from; i >= 0 && i < toks.length; i += dir) {
        var k = toks[i];
        if (typeof k === "string") { if (/\S/.test(k)) return true; }
        else return false;   // рядом другая иконка: считаем «пустым» местом
      }
      return false;
    }
    for (var i = 0; i < toks.length; i++) {
      var tk = toks[i];
      if (typeof tk === "string") continue;
      var after = hasContent(i + 1, 1), before = hasContent(i - 1, -1);
      if (after) {
        tk.side = "l";
        if (typeof toks[i + 1] === "string") toks[i + 1] = toks[i + 1].replace(/^[ \u00A0]+/, "");
      } else if (before) {
        tk.side = "t";
        if (typeof toks[i - 1] === "string") toks[i - 1] = toks[i - 1].replace(/[ \u00A0]+$/, "");
      }
    }

    // 3) собираем результат
    var frag = document.createDocumentFragment();
    for (var j = 0; j < toks.length; j++) {
      var k2 = toks[j];
      if (typeof k2 === "string") { if (k2) frag.appendChild(document.createTextNode(k2)); continue; }
      var cls = k2.side === "l" ? "l" : k2.side === "t" ? "t" : "";
      if (k2.dot) frag.appendChild(makeDot(k2.dot, cls ? "sdot-" + cls : ""));
      else frag.appendChild(makeIcon(k2.icon, cls ? "ic-" + cls : ""));
    }
    parent.replaceChild(frag, node);
  }

  var ATTRS = ["placeholder", "title", "aria-label"];
  function stripAttr(el, name) {
    var v = el.getAttribute && el.getAttribute(name);
    if (!v) return;
    RE.lastIndex = 0;
    if (!RE.test(v)) return;
    RE.lastIndex = 0;
    var nv = stripAll(v);
    if (nv !== v) el.setAttribute(name, nv);
  }

  function scan(root) {
    if (!root) return;
    if (root.nodeType === 3) { convertText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1 && root.namespaceURI === SVGNS) return;

    var list = [];
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    while (w.nextNode()) list.push(w.currentNode);
    for (var i = 0; i < list.length; i++) convertText(list[i]);

    if (root.querySelectorAll) {
      var els = root.querySelectorAll("[placeholder],[title],[aria-label]");
      for (var e = 0; e < els.length; e++) ATTRS.forEach(function (a) { stripAttr(els[e], a); });
      if (root.nodeType === 1) ATTRS.forEach(function (a) { stripAttr(root, a); });
    }
  }

  // ---------------------------------------------------------------------------
  // 5. ЗАПУСК И СЛЕЖЕНИЕ ЗА СТРАНИЦЕЙ
  // ---------------------------------------------------------------------------
  function start() {
    installBase();
    scan(document.body);
    if (document.title) document.title = stripAll(document.title);

    new MutationObserver(function (recs) {
      for (var r = 0; r < recs.length; r++) {
        var rec = recs[r];
        if (rec.type === "childList") {
          for (var a = 0; a < rec.addedNodes.length; a++) scan(rec.addedNodes[a]);
        } else if (rec.type === "characterData") {
          convertText(rec.target);
        } else if (rec.type === "attributes") {
          stripAttr(rec.target, rec.attributeName);
        }
      }
    }).observe(document.documentElement, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ATTRS
    });
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });

  // ---------------------------------------------------------------------------
  // 6. ДЛЯ ВАШЕГО КОДА
  // ---------------------------------------------------------------------------
  window.aqIcon = function (name, cls) {
    return '<svg class="ic' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#aq-i-' + name + '"/></svg>';
  };
  window.aqIcons = { names: Object.keys(ICONS), map: MAP, scan: scan };
})();
