(function () {
    'use strict';

    var BIRTHDAY_KEY = 'lifeGridBirthday';

    var locales = {
        en: {
            pageTitle: 'Life Grid · Start',
            title: 'Could you please tell me your birthday?',
            subNote: '· One sheet of paper, 900 squares ·',
            submitBtn: 'See my grid →',
            skipBtn: 'No, thanks.',
            birthDateLabel: 'Your birthday',
            emptyBirthdayAlert: '🌸 Please enter your birthday to create your life grid.',
            invalidDateAlert: '📅 That date does not exist. Please pick a real year, month and day.'
        },
        zh: {
            pageTitle: '人生格 · 开始',
            title: '能告诉我你的生日吗？',
            subNote: '· 一张纸，九百格 ·',
            submitBtn: '查看我的人生格 →',
            skipBtn: '不了，谢谢',
            birthDateLabel: '你的生日',
            emptyBirthdayAlert: '🌸 请输入你的生日来创建你的人生格。',
            invalidDateAlert: '📅 这个日期不存在，请选择真实的年月日。'
        }
    };

    var titleEl = document.getElementById('titleText');
    var subNoteEl = document.getElementById('subNoteText');
    var submitBtn = document.getElementById('submitBtn');
    var skipBtn = document.getElementById('skipBtn');
    var dateInput = document.getElementById('birthDate');
    var birthDateLabelEl = document.getElementById('birthDateLabel');
    var container = document.getElementById('appContainer');
    var isTransitioning = false;
    var currentTexts = locales.en;

    var language = LifeGrid.setupLanguage({
        locales: locales,
        storageKey: 'lifeGridLang',
        defaultLang: 'en',
        onApply: function (texts) {
            currentTexts = texts;
            titleEl.textContent = texts.title;
            subNoteEl.textContent = texts.subNote;
            submitBtn.value = texts.submitBtn;
            skipBtn.value = texts.skipBtn;
            birthDateLabelEl.textContent = texts.birthDateLabel;
        }
    });

    // Remember the last birthday so people do not retype it on every visit,
    // and never offer a future date.
    var savedBirthday = LifeGrid.storage.get(BIRTHDAY_KEY, '');
    if (savedBirthday && LifeGrid.parseDateFromInput(savedBirthday)) {
        dateInput.value = savedBirthday;
    }
    dateInput.max = LifeGrid.formatDateISO(new Date());

    function redirectWithExit(targetUrl) {
        if (isTransitioning) return;
        isTransitioning = true;
        container.classList.add('exit-animation');
        document.body.style.backgroundColor = '#f0f3f8';
        setTimeout(function () { window.location.href = targetUrl; }, 350);
    }

    function onSubmit() {
        if (isTransitioning) return;

        var rawDate = dateInput.value.trim();
        if (!rawDate) {
            alert(currentTexts.emptyBirthdayAlert);
            dateInput.focus();
            return;
        }

        var birthDate = LifeGrid.parseDateFromInput(rawDate);
        if (!birthDate) {
            alert(currentTexts.invalidDateAlert);
            dateInput.focus();
            return;
        }

        LifeGrid.storage.set(BIRTHDAY_KEY, rawDate);
        var monthsLived = LifeGrid.calculateMonthsLived(birthDate);
        redirectWithExit('./grid.html?monthsLived=' + monthsLived);
    }

    function onSkip() {
        if (isTransitioning) return;
        redirectWithExit('./grid.html?monthsLived=-1');
    }

    submitBtn.addEventListener('click', onSubmit);
    skipBtn.addEventListener('click', onSkip);
    dateInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') onSubmit();
    });

    window.addEventListener('pageshow', function () {
        isTransitioning = false;
        container.classList.remove('exit-animation');
        document.body.style.backgroundColor = '';
    });

    // Expose the resolved language for debugging/manual switching in the console.
    window.lifeGridLanguage = language;
})();
