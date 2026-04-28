// Constants, showNotification, escapeHtml, applyTheme, setupThemeToggle,
// setupCreditModal are defined in common.js

let chapters = [];
let selectedChapterId = null;
let currentLibraryViewMode = 'description';
let readerScrollRaf = null;

document.addEventListener('DOMContentLoaded', function () {
    setupThemeToggle();
    setupCreditModal();
    setupPanelToggle();
    setupLibraryControls();
    loadChapters();
    renderChapterList();
});

function setupPanelToggle() {
    const btn = document.getElementById('panelToggle');
    const editorPanel = document.querySelector('.editor-panel');
    if (!btn || !editorPanel) return;

    btn.addEventListener('click', function () {
        editorPanel.classList.toggle('panel-collapsed');
    });
}

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
        let migrated = false;
        chapters = chapters.map(function (chapter) {
            if (!chapter || !chapter.data || typeof migrateEditorData !== 'function') return chapter;
            const beforeVersion = chapter.data.schemaVersion;
            const data = migrateEditorData(chapter.data, {
                fallbackEditorTitle: chapter.title || ''
            });
            if (beforeVersion !== data.schemaVersion) migrated = true;
            return Object.assign({}, chapter, {
                title: chapter.title || data.editorTitle || data.coverTitle || 'Untitled Chapter',
                subtitle: chapter.subtitle || data.coverSubtitle || '',
                summary: chapter.summary || data.summaryText || '',
                coverImage: chapter.coverImage || data.coverImage || '',
                data: data
            });
        });
        if (migrated) saveChapters();
    } catch (error) {
        console.error('Failed to load chapter library:', error);
        chapters = [];
    }
}

function saveChapters() {
    localStorage.setItem(CHAPTER_LIBRARY_STORAGE_KEY, JSON.stringify(chapters));
}

function getLibraryViewIcon(isReaderMode) {
    if (isReaderMode) {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="14" y2="17"></line></svg>';
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v18H5.5A2.5 2.5 0 0 0 3 23V5.5z"></path><path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v18h5.5A2.5 2.5 0 0 1 21 23V5.5z"></path></svg>';
}

function getLibraryViewToggleLabel(chapterId) {
    return selectedChapterId === chapterId && currentLibraryViewMode === 'reader' ? '작품 소개' : '읽기';
}

function updateChapterViewToggleButtons() {
    document.querySelectorAll('.btn-library-view-toggle').forEach(function (button) {
        const label = getLibraryViewToggleLabel(button.dataset.id);
        const isReaderMode = label === '작품 소개';
        button.title = label;
        button.setAttribute('aria-label', label);
        button.innerHTML = getLibraryViewIcon(isReaderMode);
        button.classList.toggle('active', isReaderMode);
    });
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

    chapters.forEach(function (chapter) {
        const item = document.createElement('div');
        item.className = 'page-item' + (chapter.id === selectedChapterId ? ' selected-chapter' : '');
        item.dataset.chapterId = chapter.id;

        const date = chapter.updatedAt || chapter.createdAt;
        const dateText = date ? new Date(date).toLocaleString('ko-KR') : '';
        const preview = chapter.summary || chapter.subtitle || '요약 없음';

        item.innerHTML =
            '<div class="page-item-header">' +
            '<div class="page-item-main">' +
            '<div class="page-item-info">' +
            '<div class="page-item-name">' + escapeHtml(chapter.title || 'Untitled Chapter') + '</div>' +
            '<div class="page-item-preview">' + escapeHtml(preview).replace(/\n/g, ' ').substring(0, 90) + '</div>' +
            '<div class="page-item-preview">' + escapeHtml(dateText) + '</div>' +
            '</div>' +
            '</div>' +
            '<div class="page-controls">' +
            '<button class="btn-move btn-library-view-toggle" data-id="' + chapter.id + '" title="' + getLibraryViewToggleLabel(chapter.id) + '" aria-label="' + getLibraryViewToggleLabel(chapter.id) + '">' + getLibraryViewIcon(selectedChapterId === chapter.id && currentLibraryViewMode === 'reader') + '</button>' +
            '<button class="btn-move btn-edit-chapter" data-id="' + chapter.id + '" title="편집">✎</button>' +
            '<button class="btn-delete-page btn-delete-chapter" data-id="' + chapter.id + '" title="삭제">×</button>' +
            '</div>' +
            '</div>';

        chapterList.appendChild(item);

        if (chapter.id === selectedChapterId) {
            chapterList.appendChild(createChapterOutline(chapter));
        }
    });

    if (!selectedChapterId) {
        renderDescription(null);
    }

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

    chapterList.querySelectorAll('.btn-library-view-toggle').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleChapterView(button.dataset.id);
        });
    });

    chapterList.querySelectorAll('.page-item').forEach(function (item) {
        item.addEventListener('click', function () {
            selectChapter(item.dataset.chapterId);
        });
    });
}

function selectChapter(id) {
    if (selectedChapterId === id) {
        selectedChapterId = null;
        renderDescription(null);
        renderChapterList();
        updateActiveOutlineItem(null);
        return;
    }

    selectedChapterId = id;
    const chapter = chapters.find(function (item) {
        return item.id === id;
    });
    renderDescription(chapter);
    renderChapterList();
}

function toggleChapterView(id) {
    const chapter = chapters.find(function (item) {
        return item.id === id;
    });
    if (!chapter) return;

    const shouldShowDescription = selectedChapterId === id && currentLibraryViewMode === 'reader';
    selectedChapterId = id;
    if (shouldShowDescription) {
        renderDescription(chapter);
    } else {
        renderReader(chapter);
    }
    renderChapterList();
}

function getLibraryReaderAnchorId(itemType, index) {
    return 'library-reader-' + itemType + '-' + index;
}

function getOutlineLabel(item, fallback) {
    const title = item && item.title ? item.title.trim() : '';
    const subtitle = item && item.subtitle ? item.subtitle.trim() : '';
    if (title && subtitle) return title + ' - ' + subtitle;
    return title || subtitle || fallback;
}

function createChapterOutline(chapter) {
    const outline = document.createElement('div');
    outline.className = 'library-chapter-outline';

    const pageItems = chapter && chapter.data && Array.isArray(chapter.data.pages)
        ? chapter.data.pages
        : [];

    if (pageItems.length === 0) {
        outline.innerHTML = '<div class="library-outline-empty">저장된 페이지가 없습니다.</div>';
        return outline;
    }

    let html = '';
    let pageNumber = 0;
    let currentSectionAnchor = '';
    pageItems.forEach(function (item, index) {
        if (item.itemType === 'section') {
            pageNumber = 0;
            currentSectionAnchor = getLibraryReaderAnchorId('section', index);
            html += '<button type="button" class="library-outline-row library-outline-section" data-anchor="' + escapeHtml(currentSectionAnchor) + '" data-outline-type="section" aria-current="false">' +
                '<span class="library-outline-marker">SECTION</span>' +
                '<span class="library-outline-title">' + escapeHtml(getOutlineLabel(item, 'Section')) + '</span>' +
                '</button>';
            return;
        }

        pageNumber++;
        html += '<button type="button" class="library-outline-row library-outline-page" data-anchor="' + escapeHtml(getLibraryReaderAnchorId('page', index)) + '" data-section-anchor="' + escapeHtml(currentSectionAnchor) + '" data-outline-type="page" aria-current="false">' +
            '<span class="library-outline-marker">#' + pageNumber + '</span>' +
            '<span class="library-outline-title">' + escapeHtml(getOutlineLabel(item, 'Page ' + pageNumber)) + '</span>' +
            '</button>';
    });

    outline.innerHTML = html;
    outline.addEventListener('click', function (event) {
        const row = event.target.closest('.library-outline-row');
        if (!row) return;
        event.stopPropagation();
        renderReader(chapter);
        updateActiveOutlineItem(row.dataset.anchor);
        scrollLibraryReaderTo(row.dataset.anchor);
    });

    return outline;
}

function scrollLibraryReaderTo(anchorId) {
    if (!anchorId) return;
    requestAnimationFrame(function () {
        const target = document.getElementById(anchorId);
        if (!target) return;
        if (target.tagName === 'DETAILS') target.open = true;
        closeOtherReaderDetails(target);
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        updateActiveOutlineItem(anchorId);
    });
}

function updateActiveOutlineItem(anchorId) {
    const outlineRows = document.querySelectorAll('.library-outline-row');
    let activeRow = null;
    outlineRows.forEach(function (row) {
        if (anchorId && row.dataset.anchor === anchorId) activeRow = row;
    });
    const activeSectionAnchor = activeRow && activeRow.dataset.outlineType === 'page'
        ? activeRow.dataset.sectionAnchor
        : '';

    outlineRows.forEach(function (row) {
        const isActivePage = !!activeRow && row === activeRow && row.dataset.outlineType === 'page';
        const isActiveSection = !!activeSectionAnchor && row.dataset.anchor === activeSectionAnchor;
        row.classList.toggle('active-page', isActivePage);
        row.classList.toggle('active-section', isActiveSection);
        row.setAttribute('aria-current', isActivePage ? 'true' : 'false');
    });
}

function getReaderScrollContainer() {
    return document.getElementById('readerContent');
}

function getCurrentReaderAnchorId() {
    const content = getReaderScrollContainer();
    if (!content) return null;

    const anchors = Array.from(content.querySelectorAll('[data-library-anchor="true"]'));
    if (anchors.length === 0) return null;

    const contentRect = content.getBoundingClientRect();
    const readingLine = contentRect.top + Math.min(contentRect.height * 0.35, 220);
    let currentAnchor = anchors[0];
    let currentDistance = Math.abs(anchors[0].getBoundingClientRect().top - readingLine);

    anchors.forEach(function (anchor) {
        const rect = anchor.getBoundingClientRect();
        const distance = Math.abs(rect.top - readingLine);
        if (rect.top <= readingLine && distance <= currentDistance + contentRect.height) {
            currentAnchor = anchor;
            currentDistance = distance;
        }
    });

    return currentAnchor ? currentAnchor.id : null;
}

function syncActiveOutlineWithReader() {
    updateActiveOutlineItem(getCurrentReaderAnchorId());
}

function scheduleReaderSync() {
    if (readerScrollRaf) return;
    readerScrollRaf = requestAnimationFrame(function () {
        readerScrollRaf = null;
        syncActiveOutlineWithReader();
    });
}

function closeOtherReaderDetails(openDetails) {
    if (!openDetails || !openDetails.open) return;
    const content = getReaderScrollContainer();
    if (!content) return;

    content.querySelectorAll('details[data-library-anchor="true"]').forEach(function (details) {
        if (details !== openDetails) details.open = false;
    });
}

function enforceSingleOpenReaderDetails() {
    const content = getReaderScrollContainer();
    if (!content) return;

    let firstOpenDetails = null;
    content.querySelectorAll('details[data-library-anchor="true"]').forEach(function (details) {
        if (!details.open) return;
        if (!firstOpenDetails) {
            firstOpenDetails = details;
            return;
        }
        details.open = false;
    });
}

function setupReaderInteractions() {
    const content = getReaderScrollContainer();
    if (!content) return;

    content.addEventListener('scroll', scheduleReaderSync);
    enforceSingleOpenReaderDetails();
    content.querySelectorAll('details[data-library-anchor="true"]').forEach(function (details) {
        details.addEventListener('toggle', function () {
            if (details.open) {
                closeOtherReaderDetails(details);
                updateActiveOutlineItem(details.id);
            }
        });
    });

    syncActiveOutlineWithReader();
}

function renderDescription(chapter) {
    const title = document.getElementById('readerTitle');
    const content = document.getElementById('readerContent');
    if (!title || !content) return;
    currentLibraryViewMode = 'description';

    if (!chapter) {
        title.textContent = 'Description';
        content.innerHTML = '<div class="library-empty-reader">저장된 작품을 선택하면 소개 페이지가 표시됩니다.</div>';
        updateActiveOutlineItem(null);
        updateChapterViewToggleButtons();
        return;
    }

    title.textContent = 'Description';
    if (chapter.data) {
        content.innerHTML = '<div class="library-intro-description">' + generateIntroHTML(chapter.data) + '</div>';
    } else if (chapter.descriptionHtml) {
        content.innerHTML = '<div class="library-intro-description">' + chapter.descriptionHtml + '</div>';
    } else {
        content.innerHTML = '<div class="library-empty-reader">이 작품은 Intro Preview가 저장되기 전에 생성되었습니다. 작품 편집 후 다시 저장하세요.</div>';
    }
    updateActiveOutlineItem(null);
    updateChapterViewToggleButtons();
}

function renderReader(chapter) {
    const title = document.getElementById('readerTitle');
    const content = document.getElementById('readerContent');
    if (!title || !content || !chapter) return;
    currentLibraryViewMode = 'reader';

    title.textContent = chapter.title || 'Reader';

    const readerData = chapter.data
        ? Object.assign({}, chapter.data, {
            enableTopSection: false,
            enableComment: false,
            renderAnchors: true,
            renderAnchorPrefix: 'library-reader'
        })
        : null;

    content.innerHTML = readerData
        ? generateHTML(readerData, true)
        : (chapter.html || '<div class="library-empty-reader">읽을 본문이 없습니다.</div>');
    setupReaderInteractions();
    updateChapterViewToggleButtons();
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

    const editorData = typeof migrateEditorData === 'function'
        ? migrateEditorData(chapter.data, { fallbackEditorTitle: chapter.title || '' })
        : Object.assign({}, chapter.data, { editorTitle: chapter.title || chapter.data.editorTitle || '' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(editorData));
    localStorage.setItem(EDITING_CHAPTER_KEY, id);
    window.location.href = 'editor.html';
}
