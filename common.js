// Shared constants
const STORAGE_KEY = 'rpLogEditorData';
const CHAPTER_LIBRARY_STORAGE_KEY = 'rpLogChapterLibrary';
const EDITING_CHAPTER_KEY = 'rpLogEditingChapterId';
const THEME_KEY = 'owb_ui_theme';
const EDITOR_DATA_SCHEMA_VERSION = 2;

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
