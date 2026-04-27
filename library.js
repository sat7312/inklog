const CHAPTER_LIBRARY_STORAGE_KEY = 'rpLogChapterLibrary';
const STORAGE_KEY = 'rpLogEditorData';
const THEME_KEY = 'owb_ui_theme';

let chapters = [];
let selectedChapterId = null;
let notificationTimer = null;

document.addEventListener('DOMContentLoaded', function () {
    applySavedTheme();
    loadChapters();
    renderChapterList();
    selectFirstChapter();
});

function applySavedTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
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
        renderDescription(null);
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
            '<span class="library-work-num">' + (index + 1) + '</span>' +
            '<div class="page-item-info">' +
            '<div class="page-item-name">' + escapeHtml(chapter.title || 'Untitled Chapter') + '</div>' +
            '<div class="page-item-preview">' + escapeHtml(preview).replace(/\n/g, ' ').substring(0, 90) + '</div>' +
            '<div class="page-item-preview">' + escapeHtml(dateText) + '</div>' +
            '</div>' +
            '</div>' +
            '<div class="page-controls">' +
            '<button class="btn-delete-page btn-delete-chapter" data-id="' + chapter.id + '" title="삭제">×</button>' +
            '</div>' +
            '</div>';

        chapterList.appendChild(item);
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
    renderDescription(chapter);
    renderChapterList();
}

function renderDescription(chapter) {
    const title = document.getElementById('readerTitle');
    const content = document.getElementById('readerContent');
    if (!title || !content) return;

    if (!chapter) {
        title.textContent = 'Description';
        content.innerHTML = '<div class="library-empty-reader">저장된 작품을 선택하면 소개 페이지가 표시됩니다.</div>';
        return;
    }

    const data = chapter.data || {};
    const characters = Array.isArray(data.characters) ? data.characters : [];
    const pages = Array.isArray(data.pages) ? data.pages : [];
    const pageCount = pages.filter(function (item) {
        return !item.itemType || item.itemType === 'page';
    }).length;
    const sectionCount = pages.filter(function (item) {
        return item.itemType === 'section';
    }).length;
    const savedDate = chapter.updatedAt || chapter.createdAt;
    const savedDateText = savedDate ? new Date(savedDate).toLocaleString('ko-KR') : '-';
    const coverImage = chapter.coverImage || '';
    const summary = chapter.summary || '저장된 소개가 없습니다.';

    title.textContent = 'Description';
    content.innerHTML =
        '<article class="library-description">' +
        (coverImage ? '<div class="library-description-cover" style="background-image:url(\'' + escapeAttribute(coverImage) + '\');"></div>' : '') +
        '<div class="library-description-body">' +
        '<div class="library-description-meta">SAVED WORK</div>' +
        '<h1>' + escapeHtml(chapter.title || 'Untitled Chapter') + '</h1>' +
        (chapter.subtitle ? '<p class="library-description-subtitle">' + escapeHtml(chapter.subtitle) + '</p>' : '') +
        '<div class="library-description-stats">' +
        '<span>페이지 ' + pageCount + '</span>' +
        '<span>섹션 ' + sectionCount + '</span>' +
        '<span>캐릭터 ' + characters.length + '</span>' +
        '<span>' + escapeHtml(savedDateText) + '</span>' +
        '</div>' +
        '<div class="library-description-actions">' +
        '<button class="btn-accent" id="editSelectedChapter">작품 편집</button>' +
        '</div>' +
        '<section class="library-description-section">' +
        '<h2>Summary</h2>' +
        '<p>' + escapeHtml(summary).replace(/\n/g, '<br>') + '</p>' +
        '</section>' +
        renderCharacters(characters) +
        '</div>' +
        '</article>';

    const editButton = document.getElementById('editSelectedChapter');
    if (editButton) {
        editButton.addEventListener('click', function () {
            editChapter(chapter.id);
        });
    }
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
    renderDescription(chapters.find(function (item) {
        return item.id === selectedChapterId;
    }) || null);
    showNotification('챕터가 삭제되었습니다.');
}

function renderCharacters(characters) {
    if (!characters.length) {
        return '<section class="library-description-section"><h2>Characters</h2><p>등록된 캐릭터가 없습니다.</p></section>';
    }

    const characterItems = characters.map(function (character) {
        const image = character.image || '';
        return '<div class="library-character-item">' +
            (image ? '<div class="library-character-image" style="background-image:url(\'' + escapeAttribute(image) + '\');"></div>' : '<div class="library-character-image"></div>') +
            '<div>' +
            '<strong>' + escapeHtml(character.name || '이름 없는 캐릭터') + '</strong>' +
            (character.role ? '<span>' + escapeHtml(character.role) + '</span>' : '') +
            (character.description ? '<p>' + escapeHtml(character.description).replace(/\n/g, '<br>') + '</p>' : '') +
            '</div>' +
            '</div>';
    }).join('');

    return '<section class="library-description-section"><h2>Characters</h2><div class="library-character-list">' + characterItems + '</div></section>';
}

function editChapter(id) {
    const chapter = chapters.find(function (item) {
        return item.id === id;
    });
    if (!chapter || !chapter.data) {
        showNotification('편집할 작품 데이터가 없습니다.');
        return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(chapter.data));
    window.location.href = 'index.html';
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

function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
}
