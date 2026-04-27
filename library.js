const CHAPTER_LIBRARY_STORAGE_KEY = 'rpLogChapterLibrary';
const STORAGE_KEY = 'rpLogEditorData';
const THEME_KEY = 'owb_ui_theme';

let chapters = [];
let selectedChapterId = null;
let notificationTimer = null;

document.addEventListener('DOMContentLoaded', function () {
    applySavedTheme();
    setupLibraryControls();
    loadChapters();
    renderChapterList();
    selectFirstChapter();
});

function applySavedTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(savedTheme);
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

function setupLibraryControls() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const next = document.body.classList.contains('light-mode') ? 'dark' : 'light';
            applyTheme(next);
            localStorage.setItem(THEME_KEY, next);
        });
    }

    const soundToggle = document.getElementById('soundToggle');
    const rainAudio = document.getElementById('rainAudio');
    const iconOff = document.getElementById('icon-sound-off');
    const iconOn = document.getElementById('icon-sound-on');
    if (soundToggle && rainAudio) {
        rainAudio.volume = 1.0;
        soundToggle.addEventListener('click', function () {
            if (rainAudio.paused) {
                rainAudio.play().then(function () {
                    if (iconOff) iconOff.style.display = 'none';
                    if (iconOn) iconOn.style.display = 'block';
                    soundToggle.classList.add('playing');
                    showNotification('빗소리가 켜졌습니다.');
                }).catch(function (error) {
                    console.error('Audio playback failed:', error);
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

    const creditModal = document.getElementById('creditModal');
    const creditToggle = document.getElementById('creditToggle');
    const closeCredit = document.querySelector('.close-credit');
    if (creditModal && creditToggle && closeCredit) {
        creditToggle.addEventListener('click', function () {
            creditModal.style.display = 'flex';
        });
        closeCredit.addEventListener('click', function () {
            creditModal.style.display = 'none';
        });
        creditModal.addEventListener('click', function (event) {
            if (event.target === creditModal) {
                creditModal.style.display = 'none';
            }
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
    const editButton = document.getElementById('editSelectedChapter');
    const readButton = document.getElementById('readSelectedChapter');
    if (!title || !content) return;

    if (!chapter) {
        title.textContent = 'Description';
        content.innerHTML = '<div class="library-empty-reader">저장된 작품을 선택하면 소개 페이지가 표시됩니다.</div>';
        if (editButton) editButton.style.display = 'none';
        if (readButton) readButton.style.display = 'none';
        return;
    }

    title.textContent = 'Description';
    if (readButton) {
        readButton.textContent = '읽기';
        readButton.style.display = 'inline-flex';
        readButton.onclick = function () {
            renderReader(chapter);
        };
    }
    if (editButton) {
        editButton.style.display = 'inline-flex';
        editButton.onclick = function () {
            editChapter(chapter.id);
        };
    }
    content.innerHTML = chapter.descriptionHtml
        ? '<div class="library-intro-description">' + chapter.descriptionHtml + '</div>'
        : '<div class="library-empty-reader">이 작품은 Intro Preview가 저장되기 전에 생성되었습니다. 작품 편집 후 다시 저장하세요.</div>';
}

function renderReader(chapter) {
    const title = document.getElementById('readerTitle');
    const content = document.getElementById('readerContent');
    const editButton = document.getElementById('editSelectedChapter');
    const readButton = document.getElementById('readSelectedChapter');
    if (!title || !content || !chapter) return;

    title.textContent = chapter.title || 'Reader';
    if (editButton) {
        editButton.style.display = 'inline-flex';
        editButton.onclick = function () {
            editChapter(chapter.id);
        };
    }
    if (readButton) {
        readButton.textContent = '작품 소개';
        readButton.style.display = 'inline-flex';
        readButton.onclick = function () {
            renderDescription(chapter);
        };
    }
    content.innerHTML = chapter.html || '<div class="library-empty-reader">읽을 본문이 없습니다.</div>';
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
