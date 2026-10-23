(function () {
    'use strict';

    var TOTAL = LifeGrid.TOTAL_MONTHS;   // 900
    var COLUMNS = 30;
    var MARKS_KEY = 'lifeGridMarksV1';
    var BIRTHDAY_KEY = 'lifeGridBirthday';

    var locales = {
        en: {
            pageTitle: 'Your Life Grid · 900 Months',
            title: 'Your Life Grid',
            subtitle: '1 grid = 1 month · 900 grids = your entire life span',
            msgPara1: '🌲 <strong>An average human lifetime is just 900 months.</strong> Each small square here represents one month. A 30×30 grid fits your entire journey on a single sheet of paper.',
            msgPara2: '🌸 If you are <strong>30 years old</strong>, you have already filled <strong>360 squares</strong>; if 20, 240 squares have slipped by.<br>The blank squares are the chapters still unwritten — not many, but enough to change everything.',
            msgPara3: '🎨 <strong>This sheet whispers to you:</strong> “What color will you give to the squares that remain?”',
            quote: '✔ Don’t waste months on long‑term unhappiness — 900 squares can’t afford that much friction.<br>✔ Do what matters early. Time with loved ones, chasing a dream, caring for yourself — all need squares to fill.<br>✔ No single square must be perfect, but if this month is truly lived, it will glow.<br>— The squares that have passed will never return. Yet the empty ones are still clean, waiting for your mark.',
            personalNote: '✨ These squares belong to you. You decide how to paint them — any shade, any meaning. ✨',
            resetBtn: '🧽 Reset all squares',
            fillBtn: '📅 Fill by birthday',
            printBtn: '🖨️ Print this page',
            footerNote: '💡 Click any square to mark it (grey = lived / important) · Arrow keys move, Space toggles · Your marks are saved in this browser.',
            authorInfo: 'Copyright MFn 2026, code by MFn & Deepseek',
            watermark: 'Your Life Grid',
            fillBirthdayLabel: 'Your birthday',
            fillConfirm: 'Fill',
            fillCancel: 'Cancel',
            emptyDate: '🌸 Please choose your birthday first.',
            invalidDate: '📅 That date does not exist. Please pick a real year, month and day.',
            filledMsg: function (months) {
                return 'Filled ' + months + ' of 900 squares · ' + (TOTAL - months) + ' still blank.';
            },
            resetMsg: 'All squares cleared — 900 clean squares, ready for a fresh start.',
            monthLabel: function (n) { return 'Month ' + n; },
            gridAria: 'Your life grid: 900 squares, one per month, 30 per row'
        },
        zh: {
            pageTitle: '人生格 · 900 个月',
            title: '人生格',
            subtitle: '1 格 = 1 个月 · 900 格 = 你的整个生命跨度',
            msgPara1: '🌲 <strong>人的平均寿命只有 900 个月。</strong> 每个小格代表一个月，一张 30×30 的方格纸就能装下你的一生。',
            msgPara2: '🌸 如果你 <strong>30 岁</strong>，你已经涂满了 <strong>360</strong> 格；如果 20 岁，240 格已悄然流逝。<br>剩下的空白格子，是尚未书写的章节——不算多，却足以改变一切。',
            msgPara3: '🎨 <strong>这张纸轻声问你：</strong> “剩下的空格，你准备涂上什么颜色？”',
            quote: '✔ 别把时间浪费在长期不快乐的事上——900 格经不起太多内耗。<br>✔ 重要的事尽早做：陪伴家人、追逐梦想、照顾自己，都需要格子来填。<br>✔ 每个格子不必完美，但只要这个月真正活过，它就会发光。<br>—— 逝去的格子无法重来，但空白的格子依然干净，等你落笔。',
            personalNote: '✨ 这些格子属于你。你想涂成什么样子、什么颜色，都由你决定。 ✨',
            resetBtn: '🧽 重置所有格子',
            fillBtn: '📅 根据生日填充',
            printBtn: '🖨️ 打印本页',
            footerNote: '💡 点击任意格子可标记（灰色 = 已度过 / 重要）· 方向键移动，空格键切换 · 标记会自动保存在本机浏览器',
            authorInfo: '版权所有 MFn 2026，代码：MFn & Deepseek',
            watermark: '人生格',
            fillBirthdayLabel: '你的生日',
            fillConfirm: '填充',
            fillCancel: '取消',
            emptyDate: '🌸 请先选择你的生日。',
            invalidDate: '📅 这个日期不存在，请选择真实的年月日。',
            filledMsg: function (months) {
                return '已填满 ' + months + ' / 900 格，还剩 ' + (TOTAL - months) + ' 格空白。';
            },
            resetMsg: '已清空所有格子——900 个干净的格子，随时可以重新开始。',
            monthLabel: function (n) { return '第 ' + n + ' 个月'; },
            gridAria: '你的人生格：900 个格子，每格一个月，每行 30 格'
        }
    };

    var titleEl = document.getElementById('titleText');
    var subtitleEl = document.getElementById('subtitleText');
    var messageBox = document.getElementById('messageBox');
    var resetBtn = document.getElementById('resetColorsBtn');
    var fillBtn = document.getElementById('fillByBirthdayBtn');
    var printBtn = document.getElementById('printBtn');
    var footerNoteEl = document.getElementById('footerNote');
    var authorInfoEl = document.getElementById('authorInfo');
    var watermarkEl = document.getElementById('watermarkText');
    var gridContainer = document.getElementById('gridContainer');
    var fillPanel = document.getElementById('fillPanel');
    var fillDateInput = document.getElementById('fillBirthDate');
    var fillBirthdayLabelEl = document.getElementById('fillBirthdayLabel');
    var fillConfirmBtn = document.getElementById('fillConfirmBtn');
    var fillCancelBtn = document.getElementById('fillCancelBtn');
    var statusEl = document.getElementById('statusRegion');

    var marks = new Uint8Array(TOTAL);
    var cells = [];
    var lastFocused = 0;
    var saveTimer = null;
    var currentTexts = locales.en;

    /* ------------------------------------------------------------------ */
    /* Language                                                           */
    /* ------------------------------------------------------------------ */

    var language = LifeGrid.setupLanguage({
        locales: locales,
        storageKey: 'lifeGridLang',
        defaultLang: 'en',
        onApply: function (texts) {
            currentTexts = texts;
            updateTexts(texts);
        }
    });

    function updateTexts(t) {
        titleEl.textContent = t.title;
        subtitleEl.textContent = t.subtitle;
        messageBox.innerHTML = '<p>' + t.msgPara1 + '</p>' +
            '<p>' + t.msgPara2 + '</p>' +
            '<p>' + t.msgPara3 + '</p>' +
            '<div class="gray-quote">' + t.quote + '</div>' +
            '<div class="personal-note">' + t.personalNote + '</div>';
        resetBtn.textContent = t.resetBtn;
        fillBtn.textContent = t.fillBtn;
        printBtn.textContent = t.printBtn;
        footerNoteEl.textContent = t.footerNote;
        authorInfoEl.textContent = t.authorInfo;
        watermarkEl.textContent = t.watermark;
        fillConfirmBtn.textContent = t.fillConfirm;
        fillCancelBtn.textContent = t.fillCancel;
        fillBirthdayLabelEl.textContent = t.fillBirthdayLabel;
        gridContainer.setAttribute('aria-label', t.gridAria);
        updateCellLabels(t);
    }

    /* ------------------------------------------------------------------ */
    /* Grid                                                               */
    /* ------------------------------------------------------------------ */

    function buildGrid() {
        var fragment = document.createDocumentFragment();
        for (var i = 0; i < TOTAL; i += 1) {
            var cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'cell';
            cell.setAttribute('aria-pressed', 'false');
            cell.tabIndex = i === 0 ? 0 : -1;
            fragment.appendChild(cell);
        }
        gridContainer.textContent = '';
        gridContainer.appendChild(fragment);
        gridContainer.setAttribute('role', 'group');
        cells = Array.prototype.slice.call(gridContainer.children);
    }

    function updateCellLabels(t) {
        for (var i = 0; i < cells.length; i += 1) {
            cells[i].setAttribute('aria-label', t.monthLabel(i + 1));
        }
    }

    function paintCell(index) {
        var cell = cells[index];
        if (!cell) return;
        var marked = marks[index] === 1;
        cell.classList.toggle('lived', marked);
        cell.setAttribute('aria-pressed', marked ? 'true' : 'false');
    }

    function paintAll() {
        for (var i = 0; i < TOTAL; i += 1) paintCell(i);
    }

    function indexOfCell(node) {
        return cells.indexOf(node);
    }

    function focusCell(index) {
        if (index < 0 || index >= TOTAL || !cells[index]) return;
        if (cells[lastFocused]) cells[lastFocused].tabIndex = -1;
        lastFocused = index;
        cells[index].tabIndex = 0;
        cells[index].focus();
    }

    function toggleCell(index) {
        marks[index] = marks[index] ? 0 : 1;
        paintCell(index);
        scheduleSave();
    }

    function applyFirstMonths(months) {
        for (var i = 0; i < TOTAL; i += 1) {
            marks[i] = i < months ? 1 : 0;
        }
        paintAll();
    }

    function clearAll() {
        marks.fill(0);
        paintAll();
    }

    /* ------------------------------------------------------------------ */
    /* Persistence                                                        */
    /* ------------------------------------------------------------------ */

    function scheduleSave() {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(saveMarks, 150);
    }

    function saveMarks() {
        saveTimer = null;
        var chars = new Array(TOTAL);
        for (var i = 0; i < TOTAL; i += 1) chars[i] = marks[i] ? '1' : '0';
        LifeGrid.storage.set(MARKS_KEY, chars.join(''));
    }

    function restoreMarks() {
        var raw = LifeGrid.storage.get(MARKS_KEY, '');
        if (typeof raw !== 'string' || raw.length !== TOTAL) return false;
        for (var i = 0; i < TOTAL; i += 1) {
            var ch = raw.charAt(i);
            if (ch !== '0' && ch !== '1') return false;
            marks[i] = ch === '1' ? 1 : 0;
        }
        return true;
    }

    /* ------------------------------------------------------------------ */
    /* Status announcements                                               */
    /* ------------------------------------------------------------------ */

    function announce(text) {
        if (!statusEl) return;
        statusEl.textContent = '';
        // A short delay lets screen readers notice that the message changed,
        // even when the new text is identical to the old one.
        setTimeout(function () { statusEl.textContent = text; }, 30);
    }

    /* ------------------------------------------------------------------ */
    /* Fill panel                                                         */
    /* ------------------------------------------------------------------ */

    function openFillPanel() {
        fillPanel.hidden = false;
        fillBtn.setAttribute('aria-expanded', 'true');
        var saved = LifeGrid.storage.get(BIRTHDAY_KEY, '');
        if (saved && LifeGrid.parseDateFromInput(saved)) fillDateInput.value = saved;
        fillDateInput.max = LifeGrid.formatDateISO(new Date());
        fillDateInput.focus();
        if (typeof fillDateInput.showPicker === 'function') {
            try { fillDateInput.showPicker(); } catch (err) { /* not allowed without a gesture */ }
        }
    }

    function closeFillPanel(returnFocus) {
        fillPanel.hidden = true;
        fillBtn.setAttribute('aria-expanded', 'false');
        if (returnFocus) fillBtn.focus();
    }

    function confirmFill() {
        var raw = fillDateInput.value.trim();

        if (!raw) {
            alert(currentTexts.emptyDate);
            fillDateInput.focus();
            return;
        }

        var birthDate = LifeGrid.parseDateFromInput(raw);
        if (!birthDate) {
            alert(currentTexts.invalidDate);
            fillDateInput.focus();
            return;
        }

        var monthsLived = LifeGrid.calculateMonthsLived(birthDate);
        applyFirstMonths(monthsLived);
        LifeGrid.storage.set(BIRTHDAY_KEY, raw);
        saveMarks();
        announce(currentTexts.filledMsg(monthsLived));
        closeFillPanel(true);
    }

    /* ------------------------------------------------------------------ */
    /* Printing                                                           */
    /* ------------------------------------------------------------------ */

    function printPage() {
        printBtn.classList.add('print-clicked');
        setTimeout(function () { printBtn.classList.remove('print-clicked'); }, 300);
        setTimeout(function () { window.print(); }, 60);
    }

    /* ------------------------------------------------------------------ */
    /* URL state                                                          */
    /* ------------------------------------------------------------------ */

    function monthsFromURL() {
        var params = new URLSearchParams(window.location.search);
        var raw = params.get('monthsLived');
        if (raw === null) return -1;
        var num = parseInt(raw, 10);
        if (isNaN(num)) return -1;
        return Math.max(0, Math.min(num, TOTAL));
    }

    /* ------------------------------------------------------------------ */
    /* Events                                                             */
    /* ------------------------------------------------------------------ */

    function bindGridEvents() {
        gridContainer.addEventListener('click', function (event) {
            var index = indexOfCell(event.target);
            if (index !== -1) toggleCell(index);
        });

        gridContainer.addEventListener('focusin', function (event) {
            var index = indexOfCell(event.target);
            if (index === -1 || index === lastFocused) return;
            if (cells[lastFocused]) cells[lastFocused].tabIndex = -1;
            lastFocused = index;
            cells[index].tabIndex = 0;
        });

        gridContainer.addEventListener('keydown', function (event) {
            var index = indexOfCell(event.target);
            if (index === -1) return;

            var next = -1;
            if (event.key === 'ArrowLeft') {
                next = index % COLUMNS === 0 ? -1 : index - 1;
            } else if (event.key === 'ArrowRight') {
                next = index % COLUMNS === COLUMNS - 1 ? -1 : index + 1;
            } else if (event.key === 'ArrowUp') {
                next = index - COLUMNS;
            } else if (event.key === 'ArrowDown') {
                next = index + COLUMNS;
            } else if (event.key === 'Home') {
                next = index - (index % COLUMNS);
            } else if (event.key === 'End') {
                next = index - (index % COLUMNS) + COLUMNS - 1;
            }

            if (next >= 0 && next < TOTAL) {
                event.preventDefault();
                focusCell(next);
            }
        });
    }

    function bindToolbarEvents() {
        resetBtn.addEventListener('click', function () {
            clearAll();
            saveMarks();
            announce(currentTexts.resetMsg);
        });

        fillBtn.addEventListener('click', function () {
            if (fillPanel.hidden) openFillPanel();
            else closeFillPanel(true);
        });

        fillConfirmBtn.addEventListener('click', confirmFill);
        fillCancelBtn.addEventListener('click', function () { closeFillPanel(true); });

        fillDateInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                confirmFill();
            } else if (event.key === 'Escape') {
                event.preventDefault();
                closeFillPanel(true);
            }
        });

        printBtn.addEventListener('click', printPage);
    }

    /* ------------------------------------------------------------------ */
    /* Boot                                                               */
    /* ------------------------------------------------------------------ */

    function init() {
        buildGrid();
        updateTexts(currentTexts);
        bindGridEvents();
        bindToolbarEvents();

        restoreMarks();

        var months = monthsFromURL();
        if (months > 0) {
            applyFirstMonths(months);
            saveMarks();
            announce(currentTexts.filledMsg(months));
        } else {
            paintAll();
        }
    }

    init();

    window.lifeGridLanguage = language;
})();
