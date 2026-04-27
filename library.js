const CHAPTER_LIBRARY_STORAGE_KEY = 'rpLogChapterLibrary';
const THEME_KEY = 'owb_ui_theme';

let chapters = [];
let selectedChapterId = null;
let notificationTimer = null;

document.addEventListener('DOMContentLoaded', function () {
    applySavedTheme();
    loadChapters();
    setupLibraryEvents();
    renderChapterList();
    selectFirstChapter();
});

function applySavedTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
}

function setupLibraryEvents() {
    const backToEditor = document.getElementById('backToEditor');
    if (backToEditor) {
        backToEditor.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }
}

function loadChapters() {
    try {
        const saved = localStorage.getItem(CHAPTER_LIBRARY_STORAGE_KEY);
        chapters = saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Failed to load chapter library:', error);
        chapters = [];
    }
}

function saveChapters() {
    localStorage.setItem(CHAPTER_LIBRARY_STORAGE_KEY, JSON.stringify(chapters));
}

function renderChapterList() {
    const chapterList = document.getElementById('chapterList');
    if (!chapterList) return;

    chapterList.innerHTML = '';

    if (chapters.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'page-item';
        empty.innerHTML =
            '<div class="page-item-header">' +
            '<div class="page-item-main">' +
            '<div class="page-item-info">' +
            '<div class="page-item-name">저장된 작품이 없습니다.</div>' +
            '<div class="page-item-preview">편집기의 Format 탭에서 챕터를 저장하세요.</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        chapterList.appendChild(empty);
        renderReader(null);
        return;
    }

    chapters.forEach(function (chapter, index) {
        const item = document.createElement('div');
        item.className = 'page-item' + (chapter.id === selectedChapterId ? ' selected-chapter' : '');
        item.dataset.chapterId = chapter.id;

        const date = chapter.updatedAt || chapter.createdAt;
        const dateText = date ? new Date(date).toLocaleString('ko-KR') : '';
        const preview = chapter.summary || chapter.subtitle || '요약 없음';

        item.innerHTML =
            '<div class="page-item-header">' +
            '<div class="page-item-main">' +
            '<span class="page-num">' + (index + 1) + '</span>' +
            '<div class="page-item-info">' +
            '<div class="page-item-name">' + escapeHtml(chapter.title || 'Untitled Chapter') + '</div>' +
            '<div class="page-item-preview">' + escapeHtml(preview).replace(/\n/g, ' ').substring(0, 90) + '</div>' +
            '<div class="page-item-preview">' + escapeHtml(dateText) + '</div>' +
            '</div>' +
            '</div>' +
            '<div class="page-controls">' +
            '<button class="btn-edit-page btn-read-chapter" data-id="' + chapter.id + '">READ</button>' +
            '<button class="btn-delete-page btn-delete-chapter" data-id="' + chapter.id + '" title="삭제">×</button>' +
            '</div>' +
            '</div>';

        chapterList.appendChild(item);
    });

    chapterList.querySelectorAll('.btn-read-chapter').forEach(function (button) {
        button.addEventListener('click', function (event) {
            selectChapter(event.target.dataset.id);
        });
    });

    chapterList.querySelectorAll('.btn-delete-chapter').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            deleteChapter(event.target.dataset.id);
        });
    });

    chapterList.querySelectorAll('.page-item').forEach(function (item) {
        item.addEventListener('click', function () {
            selectChapter(item.dataset.chapterId);
        });
    });
}

function selectFirstChapter() {
    if (chapters.length > 0) {
        selectChapter(chapters[0].id);
    }
}

function selectChapter(id) {
    selectedChapterId = id;
    const chapter = chapters.find(function (item) {
        return item.id === id;
    });
    renderReader(chapter);
    renderChapterList();
}

function renderReader(chapter) {
    const title = document.getElementById('readerTitle');
    const content = document.getElementById('readerContent');
    if (!title || !content) return;

    if (!chapter) {
        title.textContent = 'Reader';
        content.innerHTML = '<div class="library-empty-reader">저장된 작품을 선택하면 여기에 표시됩니다.</div>';
        return;
    }

    title.textContent = chapter.title || 'Untitled Chapter';
    content.innerHTML = chapter.html || '';
}

function deleteChapter(id) {
    const chapter = chapters.find(function (item) {
        return item.id === id;
    });
    if (!chapter) return;

    if (!confirm('"' + (chapter.title || 'Untitled Chapter') + '" 챕터를 삭제하시겠습니까?')) {
        return;
    }

    chapters = chapters.filter(function (item) {
        return item.id !== id;
    });
    if (selectedChapterId === id) {
        selectedChapterId = chapters[0] ? chapters[0].id : null;
    }
    saveChapters();
    renderChapterList();
    renderReader(chapters.find(function (item) {
        return item.id === selectedChapterId;
    }) || null);
    showNotification('챕터가 삭제되었습니다.');
}

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
