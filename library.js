// Constants, showNotification, escapeHtml, applyTheme, setupThemeToggle,
// setupSoundToggle, setupCreditModal are defined in common.js

let chapters = [];
let selectedChapterId = null;

document.addEventListener('DOMContentLoaded', function () {
    setupThemeToggle();
    setupSoundToggle();
    setupCreditModal();
    setupLibraryControls();
    loadChapters();
    renderChapterList();
});

function setupLibraryControls() {
    const openEditor = document.getElementById('openEditor');
    if (openEditor) {
        openEditor.addEventListener('click', function () {
            window.location.href = 'editor.html';
        });
    }

    const addArchiveBtn = document.getElementById('addArchive');
    if (addArchiveBtn) {
        addArchiveBtn.addEventListener('click', function () {
            localStorage.removeItem(EDITING_CHAPTER_KEY);
            window.location.href = 'editor.html';
        });
    }

    const togglePreviewBtn = document.getElementById('togglePreview');
    const previewPanel = document.querySelector('.preview-panel');
    const iconEye = document.getElementById('icon-preview-eye');
    const iconEdit = document.getElementById('icon-preview-edit');
    if (togglePreviewBtn && previewPanel) {
        togglePreviewBtn.addEventListener('click', function () {
            const isVisible = previewPanel.classList.toggle('mobile-visible');
            if (iconEye) iconEye.style.display = isVisible ? 'none' : 'block';
            if (iconEdit) iconEdit.style.display = isVisible ? 'block' : 'none';
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
            '<button class="btn-move btn-edit-chapter" data-id="' + chapter.id + '" title="편집">✎</button>' +
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

    chapterList.querySelectorAll('.btn-edit-chapter').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            editChapter(event.target.dataset.id);
        });
    });

    chapterList.querySelectorAll('.page-item').forEach(function (item) {
        item.addEventListener('click', function () {
            selectChapter(item.dataset.chapterId);
        });
    });
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
    const readButton = document.getElementById('readSelectedChapter');
    if (!title || !content) return;

    if (!chapter) {
        title.textContent = 'Description';
        content.innerHTML = '<div class="library-empty-reader">저장된 작품을 선택하면 소개 페이지가 표시됩니다.</div>';
        if (readButton) readButton.style.display = 'none';
        return;
    }

    title.textContent = 'Description';
    if (readButton) {
        readButton.textContent = '읽기';
        readButton.style.display = 'inline-flex';
        readButton.onclick = function () { renderReader(chapter); };
    }
    if (chapter.data) {
        content.innerHTML = '<div class="library-intro-description">' + generateIntroHTML(chapter.data) + '</div>';
    } else if (chapter.descriptionHtml) {
        content.innerHTML = '<div class="library-intro-description">' + chapter.descriptionHtml + '</div>';
    } else {
        content.innerHTML = '<div class="library-empty-reader">이 작품은 Intro Preview가 저장되기 전에 생성되었습니다. 작품 편집 후 다시 저장하세요.</div>';
    }
}

function renderReader(chapter) {
    const title = document.getElementById('readerTitle');
    const content = document.getElementById('readerContent');
    const readButton = document.getElementById('readSelectedChapter');
    if (!title || !content || !chapter) return;

    title.textContent = chapter.title || 'Reader';
    if (readButton) {
        readButton.textContent = '작품 소개';
        readButton.style.display = 'inline-flex';
        readButton.onclick = function () { renderDescription(chapter); };
    }

    const readerData = chapter.data
        ? Object.assign({}, chapter.data, { enableTopSection: false, enableComment: false })
        : null;

    content.innerHTML = readerData
        ? generateHTML(readerData, true)
        : (chapter.html || '<div class="library-empty-reader">읽을 본문이 없습니다.</div>');
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

function editChapter(id) {
    const chapter = chapters.find(function (item) {
        return item.id === id;
    });
    if (!chapter || !chapter.data) {
        showNotification('편집할 작품 데이터가 없습니다.');
        return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(chapter.data));
    localStorage.setItem(EDITING_CHAPTER_KEY, id);
    window.location.href = 'editor.html';
}
