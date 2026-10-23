/*!
 * Your Life Grid — shared helpers.
 * Loaded before the page script on both index.html and grid.html.
 *
 * Exposes window.LifeGrid:
 *   TOTAL_MONTHS           900
 *   parseDateFromInput(v)  strict YYYY-MM-DD parser (rejects 2021-02-30)
 *   formatDateISO(date)    Date -> "YYYY-MM-DD"
 *   calculateMonthsLived() whole months between a birth date and today, 0..900
 *   storage.get/set/remove localStorage that never throws (private mode, quota)
 *   setupLanguage()        language menu + persistence + document.lang/title
 */
(function (global) {
    'use strict';

    var TOTAL_MONTHS = 900;
    var DATE_PATTERN = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

    // BCP 47 tags for <html lang>. Add a line here when you add a locale.
    var LANG_TAGS = {
        en: 'en',
        zh: 'zh-CN'
    };

    /* ------------------------------------------------------------------ */
    /* Dates                                                              */
    /* ------------------------------------------------------------------ */

    /**
     * Parse "YYYY-MM-DD" strictly.
     *
     * `new Date(2021, 1, 30)` silently rolls over to 2021-03-02, so a plain
     * Date round-trip is not enough: compare the components afterwards and
     * reject anything that moved.
     *
     * @param {string} value
     * @returns {Date|null}
     */
    function parseDateFromInput(value) {
        if (typeof value !== 'string') return null;
        var match = DATE_PATTERN.exec(value.trim());
        if (!match) return null;

        var year = Number(match[1]);
        var month = Number(match[2]);
        var day = Number(match[3]);
        if (month < 1 || month > 12 || day < 1 || day > 31) return null;

        var date = new Date(year, month - 1, day);
        if (isNaN(date.getTime())) return null;
        if (date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day) {
            return null;
        }
        return date;
    }

    /** True for Date objects from any realm (cross-frame Dates still work). */
    function isDateObject(value) {
        return Object.prototype.toString.call(value) === '[object Date]';
    }

    /** Pad a number to two digits. */
    function pad2(n) {
        return n < 10 ? '0' + n : String(n);
    }

    /** Format a Date as "YYYY-MM-DD" (local time). */
    function formatDateISO(date) {
        return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
    }

    /**
     * Whole months lived between `birthDate` and `today`, capped at 900.
     * A birthday that has not arrived this month does not count as a full month.
     */
    function calculateMonthsLived(birthDate, today) {
        if (!isDateObject(birthDate) || isNaN(birthDate.getTime())) return 0;
        today = today || new Date();

        var birth = new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        var now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (now < birth) return 0;

        var months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        if (now.getDate() < birth.getDate()) months -= 1;
        if (months < 0) months = 0;
        return Math.min(months, TOTAL_MONTHS);
    }

    /* ------------------------------------------------------------------ */
    /* Storage                                                            */
    /* ------------------------------------------------------------------ */

    var storage = {
        get: function (key, fallback) {
            try {
                var raw = global.localStorage.getItem(key);
                return raw === null ? fallback : raw;
            } catch (err) {
                return fallback;
            }
        },
        set: function (key, value) {
            try {
                global.localStorage.setItem(key, String(value));
                return true;
            } catch (err) {
                return false;
            }
        },
        remove: function (key) {
            try {
                global.localStorage.removeItem(key);
            } catch (err) { /* ignore */ }
        }
    };

    /* ------------------------------------------------------------------ */
    /* Language                                                           */
    /* ------------------------------------------------------------------ */

    /**
     * Wire the language menu, remember the choice, and keep
     * <html lang> / <title> in sync.
     *
     * @param {object} options
     * @param {object} options.locales    { en: {...}, zh: {...} }
     * @param {string} [options.storageKey='lifeGridLang']
     * @param {string} [options.defaultLang]
     * @param {function} options.onApply  (texts, lang) => void
     * @returns {{apply: function, getLanguage: function}}
     */
    function setupLanguage(options) {
        var locales = options.locales || {};
        var supported = Object.keys(locales);
        var storageKey = options.storageKey || 'lifeGridLang';
        var onApply = options.onApply;
        var switchBtn = document.getElementById('langSwitchBtn');
        var menu = document.getElementById('langMenu');
        var current = null;

        function renderMenu(lang) {
            if (!menu) return;
            var buttons = menu.querySelectorAll('[data-lang]');
            Array.prototype.forEach.call(buttons, function (button) {
                var active = button.getAttribute('data-lang') === lang;
                button.classList.toggle('is-active', active);
                button.setAttribute('aria-checked', active ? 'true' : 'false');
            });
        }

        function setMenuOpen(open) {
            if (!menu || !switchBtn) return;
            menu.hidden = !open;
            switchBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open) {
                var first = menu.querySelector('.is-active') || menu.querySelector('[data-lang]');
                if (first) first.focus();
            }
        }

        function apply(lang) {
            if (!locales[lang]) return false;
            current = lang;
            document.documentElement.lang = LANG_TAGS[lang] || lang;
            if (locales[lang].pageTitle) document.title = locales[lang].pageTitle;
            storage.set(storageKey, lang);
            renderMenu(lang);
            if (typeof onApply === 'function') onApply(locales[lang], lang);
            return true;
        }

        function detect() {
            var saved = storage.get(storageKey, '');
            if (saved && locales[saved]) return saved;
            var nav = String((global.navigator && (navigator.language || navigator.userLanguage)) || 'en').toLowerCase();
            for (var i = 0; i < supported.length; i += 1) {
                if (nav === supported[i] || nav.indexOf(supported[i] + '-') === 0) return supported[i];
            }
            return (options.defaultLang && locales[options.defaultLang]) ? options.defaultLang : supported[0];
        }

        if (switchBtn && menu) {
            switchBtn.setAttribute('aria-expanded', 'false');
            switchBtn.addEventListener('click', function (event) {
                event.stopPropagation();
                setMenuOpen(menu.hidden);
            });
            switchBtn.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') setMenuOpen(false);
            });
            document.addEventListener('click', function (event) {
                if (menu.hidden) return;
                if (menu.contains(event.target) || switchBtn.contains(event.target)) return;
                setMenuOpen(false);
            });
            menu.addEventListener('click', function (event) {
                var button = event.target.closest('[data-lang]');
                if (!button) return;
                apply(button.getAttribute('data-lang'));
                setMenuOpen(false);
                switchBtn.focus();
            });
            menu.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') {
                    setMenuOpen(false);
                    switchBtn.focus();
                }
            });
        }

        apply(detect());

        return {
            apply: apply,
            getLanguage: function () { return current; }
        };
    }

    /* ------------------------------------------------------------------ */
    /* Export                                                             */
    /* ------------------------------------------------------------------ */

    global.LifeGrid = {
        TOTAL_MONTHS: TOTAL_MONTHS,
        parseDateFromInput: parseDateFromInput,
        formatDateISO: formatDateISO,
        calculateMonthsLived: calculateMonthsLived,
        storage: storage,
        setupLanguage: setupLanguage
    };

    // Backwards-compatible globals for any older page still calling them directly.
    global.parseDateFromInput = parseDateFromInput;
    global.calculateMonthsLived = calculateMonthsLived;
})(window);
