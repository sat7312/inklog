// Shared constants
const STORAGE_KEY = 'rpLogEditorData';
const CHAPTER_LIBRARY_STORAGE_KEY = 'rpLogChapterLibrary';
const EDITING_CHAPTER_KEY = 'rpLogEditingChapterId';
const THEME_KEY = 'owb_ui_theme';

let notificationTimer = null;

function showNotification(message) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    if (notificationTimer) {
        clearTimeout(notificationTimer);
        notification.classList.remove('show');
    }
    void notification.offsetWidth;
    notification.textContent = message;
    notification.classList.add('show');
    notificationTimer = setTimeout(function () {
        notification.classList.remove('show');
        notificationTimer = null;
    }, 2000);
}

function applyTheme(mode) {
    const iconLight = document.getElementById('icon-theme-light');
    const iconDark = document.getElementById('icon-theme-dark');
    if (mode === 'light') {
        document.body.classList.add('light-mode');
        if (iconLight) iconLight.style.display = 'none';
        if (iconDark) iconDark.style.display = 'block';
    } else {
        document.body.classList.remove('light-mode');
        if (iconLight) iconLight.style.display = 'block';
        if (iconDark) iconDark.style.display = 'none';
    }
}

function setupThemeToggle() {
    applyTheme(localStorage.getItem(THEME_KEY) || 'light');
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    themeToggle.addEventListener('click', function () {
        const next = document.body.classList.contains('light-mode') ? 'dark' : 'light';
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
    });
}

function setupSoundToggle() {
    const soundToggle = document.getElementById('soundToggle');
    const rainAudio = document.getElementById('rainAudio');
    const iconOff = document.getElementById('icon-sound-off');
    const iconOn = document.getElementById('icon-sound-on');
    if (!soundToggle || !rainAudio) return;
    rainAudio.volume = 1.0;
    soundToggle.addEventListener('click', function () {
        if (rainAudio.paused) {
            rainAudio.play().then(function () {
                if (iconOff) iconOff.style.display = 'none';
                if (iconOn) iconOn.style.display = 'block';
                soundToggle.classList.add('playing');
                showNotification('빗소리가 켜졌습니다.');
            }).catch(function () {
                showNotification('오디오 재생 실패');
            });
        } else {
            rainAudio.pause();
            if (iconOff) iconOff.style.display = 'block';
            if (iconOn) iconOn.style.display = 'none';
            soundToggle.classList.remove('playing');
            showNotification('빗소리가 꺼졌습니다.');
        }
    });
}

function setupCreditModal() {
    const creditModal = document.getElementById('creditModal');
    const creditToggle = document.getElementById('creditToggle');
    const closeCredit = document.querySelector('.close-credit');
    if (!creditModal || !creditToggle || !closeCredit) return;
    creditToggle.addEventListener('click', function () {
        creditModal.style.display = 'flex';
    });
    closeCredit.addEventListener('click', function () {
        creditModal.style.display = 'none';
    });
    creditModal.addEventListener('click', function (e) {
        if (e.target === creditModal) {
            creditModal.style.display = 'none';
        }
    });
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char];
    });
}
