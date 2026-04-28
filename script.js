document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

async function initializeApp() {
    try {
        setupThemeToggle();
        setupCreditModal();
        setupPanelToggle();
        await loadFromStorage();
        setupEventListeners();
        setupTabs();
        initializePresets();

        const coverAutoFit = document.getElementById('coverAutoFit');
        const coverManualControls = document.getElementById('coverManualControls');
        if (coverAutoFit && coverManualControls) {
            coverManualControls.style.display = coverAutoFit.checked ? 'none' : 'block';
        }

        updatePreview();
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
    }
}

function setupPanelToggle() {
    const btn = document.getElementById('panelToggle');
    const editorPanel = document.querySelector('.editor-panel');
    if (!btn || !editorPanel) return;

    btn.addEventListener('click', function () {
        editorPanel.classList.toggle('panel-collapsed');
    });
}

function setupTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const targetId = this.getAttribute('data-tab');

            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));

            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.add('active');

            const editorPanel = document.querySelector('.editor-panel');
            if (editorPanel && editorPanel.classList.contains('panel-collapsed')) {
                editorPanel.classList.remove('panel-collapsed');
            }

            const previewPanel = document.querySelector('.preview-panel');
            if (previewPanel && previewPanel.classList.contains('mobile-visible')) {
                previewPanel.classList.remove('mobile-visible');
                const eyeIcon = document.getElementById('icon-preview-eye');
                const editIcon = document.getElementById('icon-preview-edit');
                if (eyeIcon && editIcon) {
                    eyeIcon.style.display = 'block';
                    editIcon.style.display = 'none';
                }
                const toggleBtn = document.getElementById('togglePreview');
                if (toggleBtn) toggleBtn.title = '미리보기 보기';
            }

            updatePreview();
        });
    });
}

function setupEventListeners() {
    const inputIds = ['summaryText', 'topBgImage', 'coverImage', 'coverArchiveNo', 'coverTitle', 'coverSubtitle', 'commentText', 'commentNickname'];
    inputIds.forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function () {
                updatePreview();
                saveToStorage();
            });
        }
    });

    const preview = document.getElementById('preview');
    if (preview) {
        preview.addEventListener('click', function (event) {
            const quote = event.target.closest('.js-quote-assign');
            if (!quote) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            toggleSelectedQuoteTarget(quote);
            if (hasSelectedQuoteTargets()) {
                openQuoteCharacterMenu(quote);
            } else {
                removeQuoteCharacterMenuOnly();
            }
        });
    }

    const selectCoverImageFile = document.getElementById('selectCoverImageFile');
    if (selectCoverImageFile) {
        selectCoverImageFile.addEventListener('click', function () {
            selectLocalImage(function (dataUrl, file) {
                const imageRef = createLocalImageRef(dataUrl, file);
                const coverImage = document.getElementById('coverImage');
                if (coverImage) coverImage.value = imageRef;
                updatePreview();
                saveToStorage();
                showNotification('로컬 표지 이미지가 추가되었습니다.');
            });
        });
    }

    const coverZoom = document.getElementById('coverZoom');
    const coverFocusX = document.getElementById('coverFocusX');
    const coverFocusY = document.getElementById('coverFocusY');

    if (coverZoom) {
        coverZoom.addEventListener('input', function () {
            const coverZoomValue = document.getElementById('coverZoomValue');
            if (coverZoomValue) coverZoomValue.textContent = this.value + '%';
            updatePreview();
            saveToStorage();
        });
    }
    if (coverFocusX) {
        coverFocusX.addEventListener('input', function () {
            const coverFocusXValue = document.getElementById('coverFocusXValue');
            if (coverFocusXValue) coverFocusXValue.textContent = this.value + '%';
            updatePreview();
            saveToStorage();
        });
    }
    if (coverFocusY) {
        coverFocusY.addEventListener('input', function () {
            const coverFocusYValue = document.getElementById('coverFocusYValue');
            if (coverFocusYValue) coverFocusYValue.textContent = this.value + '%';
            updatePreview();
            saveToStorage();
        });
    }

    const coverAutoFit = document.getElementById('coverAutoFit');
    if (coverAutoFit) {
        coverAutoFit.addEventListener('change', function () {
            const coverManualControls = document.getElementById('coverManualControls');
            if (coverManualControls) coverManualControls.style.display = this.checked ? 'none' : 'block';
            updatePreview();
            saveToStorage();
        });
    }

    const globalThemeEl = document.getElementById('globalTheme');
    if (globalThemeEl) {
        globalThemeEl.addEventListener('change', function () {
            globalTheme = globalThemeEl.value;
            const selectedTheme = globalTheme;
            let themeToApply = null;

            if (selectedTheme === 'user') {
                themeToApply = STYLES.light;
            } else if (selectedTheme === 'char') {
                themeToApply = STYLES.dark;
            } else if (STYLES[selectedTheme]) {
                themeToApply = STYLES[selectedTheme];
            }

            if (themeToApply) {
                const theme = themeToApply;
                setColorInputValue('customBg', theme.bg);
                setColorInputValue('customText', theme.text);
                setColorInputValue('customEm', theme.em);
                setColorInputValue('customHeader', theme.header);
                setColorInputValue('customQuote1Bg', theme.quote1Bg);
                setColorInputValue('customQuote1Text', theme.quote1Text);
                setColorInputValue('customQuote2Bg', theme.quote2Bg);
                setColorInputValue('customQuote2Text', theme.quote2Text);
                setColorInputValue('customTagText', theme.tagText || theme.text);
                setColorInputValue('customDivider', theme.divider || theme.tagText || theme.text);
            }
            updatePreview();
            saveToStorage();
        });
    }

    const hidePageNumbersEl = document.getElementById('hidePageNumbers');
    if (hidePageNumbersEl) {
        hidePageNumbersEl.addEventListener('change', function () {
            hidePageNumbers = hidePageNumbersEl.checked;
            updatePreview();
            saveToStorage();
        });
    }

    const enablePageFoldEl = document.getElementById('enablePageFold');
    if (enablePageFoldEl) {
        enablePageFoldEl.addEventListener('change', function () {
            enablePageFold = enablePageFoldEl.checked;
            updatePreview();
            saveToStorage();
        });
    }

    const showHeaderWhenFoldOffEl = document.getElementById('showHeaderWhenFoldOff');
    if (showHeaderWhenFoldOffEl) {
        showHeaderWhenFoldOffEl.addEventListener('change', function () {
            showHeaderWhenFoldOff = showHeaderWhenFoldOffEl.checked;
            updatePreview();
            saveToStorage();
        });
    }

    const dividerStyleEl = document.getElementById('dividerStyle');
    const dividerCustomEl = document.getElementById('dividerCustomText');
    if (dividerStyleEl) {
        dividerStyleEl.addEventListener('change', function () {
            dividerStyle = dividerStyleEl.value;
            dividerCustomEl.style.display = dividerStyle === 'custom' ? 'block' : 'none';
            updatePreview();
            saveToStorage();
        });
    }
    if (dividerCustomEl) {
        dividerCustomEl.addEventListener('input', function () {
            dividerCustomText = dividerCustomEl.value;
            updatePreview();
            saveToStorage();
        });
    }

    const checkboxIds = ['useRoundedQuotes', 'useTextIndent', 'preserveLineBreaks', 'enableTags', 'enableComment'];
    checkboxIds.forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', function () {
                if (id === 'enableComment') {
                    document.getElementById('commentContent').style.display = el.checked ? 'block' : 'none';
                }
                updatePreview();
                saveToStorage();
            });
        }
    });

    const enableTags = document.getElementById('enableTags');
    if (enableTags) {
        enableTags.addEventListener('change', function () {
            document.getElementById('tagsInputs').style.display = enableTags.checked ? 'block' : 'none';
        });
    }

    const colorIds = ['customBg', 'customText', 'customEm', 'customHeader',
        'customQuote1Bg', 'customQuote1Text', 'customQuote2Bg', 'customQuote2Text', 'customTagText', 'customDivider'];
    colorIds.forEach(function (id) {
        const colorEl = document.getElementById(id);
        const textEl = document.getElementById(id + 'Text');

        if (colorEl) {
            colorEl.addEventListener('input', function () {
                if (textEl) textEl.value = colorEl.value;
                updatePreview();
                saveToStorage();
            });
        }

        if (textEl) {
            textEl.addEventListener('input', function () {
                const val = textEl.value;
                if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                    if (colorEl) colorEl.value = val;
                    updatePreview();
                    saveToStorage();
                }
            });
            textEl.addEventListener('blur', function () {
                let val = textEl.value;
                if (!val.startsWith('#')) val = '#' + val;
                if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                    textEl.value = val;
                    if (colorEl) colorEl.value = val;
                    updatePreview();
                    saveToStorage();
                } else {
                    textEl.value = colorEl ? colorEl.value : '#000000';
                }
            });
        }
    });

    const addPageBtn = document.getElementById('addPage');
    if (addPageBtn) {
        addPageBtn.addEventListener('click', function () {
            closeQuoteCharacterMenu();
            currentEditingIndex = null;
            document.getElementById('pageTitle').value = '';
            document.getElementById('pageSubtitle').value = '';
            document.getElementById('pageContent').value = '';
            tempPageTags = [];

            const pageModal = document.getElementById('pageModal');
            pageModal.style.display = 'block';
            updatePageStats();
            setTimeout(function () {
                pageModal.scrollTop = 0;
                const modalBody = pageModal.querySelector('.modal-body');
                if (modalBody) modalBody.scrollTop = 0;
            }, 50);
        });
    }

    const addSectionBtn = document.getElementById('addSection');
    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', function () {
            closeQuoteCharacterMenu();
            currentEditingIndex = null;
            document.getElementById('sectionTitle').value = '';
            document.getElementById('sectionSubtitle').value = '';
            document.getElementById('sectionImage').value = '';
            document.getElementById('sectionAlign').value = 'center';
            document.getElementById('sectionZoom').value = 100;
            document.getElementById('sectionFocusX').value = 50;
            document.getElementById('sectionFocusY').value = 50;
            document.getElementById('sectionZoomValue').textContent = '100%';
            document.getElementById('sectionFocusXValue').textContent = '50%';
            document.getElementById('sectionFocusYValue').textContent = '50%';

            const sectionModal = document.getElementById('sectionModal');
            sectionModal.style.display = 'block';
            setTimeout(function () {
                sectionModal.scrollTop = 0;
                const modalBody = sectionModal.querySelector('.modal-body');
                if (modalBody) modalBody.scrollTop = 0;
            }, 50);
        });
    }

    const closeModal = document.querySelector('.close');
    if (closeModal) {
        closeModal.addEventListener('click', function () {
            document.getElementById('pageModal').style.display = 'none';
        });
    }

    const closeSectionModal = document.querySelector('.close-section');
    if (closeSectionModal) {
        closeSectionModal.addEventListener('click', function () {
            document.getElementById('sectionModal').style.display = 'none';
        });
    }

    const savePage = document.getElementById('savePage');
    if (savePage) savePage.addEventListener('click', savePageData);

    const saveSection = document.getElementById('saveSection');
    if (saveSection) saveSection.addEventListener('click', saveSectionData);

    const deletePage = document.getElementById('deletePage');
    if (deletePage) deletePage.addEventListener('click', deletePageData);

    const deleteSection = document.getElementById('deleteSection');
    if (deleteSection) deleteSection.addEventListener('click', deleteSectionData);

    const deleteAllPagesBtn = document.getElementById('deleteAllPages');
    if (deleteAllPagesBtn) deleteAllPagesBtn.addEventListener('click', deleteAllPages);

    const pageContent = document.getElementById('pageContent');
    if (pageContent) {
        pageContent.addEventListener('input', function () {
            updatePageStats();
        });
    }

    const sectionZoom = document.getElementById('sectionZoom');
    if (sectionZoom) {
        sectionZoom.addEventListener('input', function () {
            document.getElementById('sectionZoomValue').textContent = this.value + '%';
        });
    }

    const sectionFocusX = document.getElementById('sectionFocusX');
    if (sectionFocusX) {
        sectionFocusX.addEventListener('input', function () {
            document.getElementById('sectionFocusXValue').textContent = this.value + '%';
        });
    }

    const sectionFocusY = document.getElementById('sectionFocusY');
    if (sectionFocusY) {
        sectionFocusY.addEventListener('input', function () {
            document.getElementById('sectionFocusYValue').textContent = this.value + '%';
        });
    }

    const selectSectionImageFile = document.getElementById('selectSectionImageFile');
    if (selectSectionImageFile) {
        selectSectionImageFile.addEventListener('click', function () {
            selectLocalImage(function (dataUrl, file) {
                const imageRef = createLocalImageRef(dataUrl, file);
                const sectionImage = document.getElementById('sectionImage');
                if (sectionImage) sectionImage.value = imageRef;
                showNotification('로컬 섹션 이미지가 추가되었습니다.');
            });
        });
    }

    const defaultImageWidth = document.getElementById('defaultImageWidth');
    if (defaultImageWidth) {
        defaultImageWidth.addEventListener('input', function () {
            const defaultImageWidthValue = document.getElementById('defaultImageWidthValue');
            if (defaultImageWidthValue) defaultImageWidthValue.textContent = this.value + '%';
        });
    }

    const insertImage = document.getElementById('insertImage');
    if (insertImage) {
        insertImage.addEventListener('click', function () {
            const url = prompt('이미지 URL을 입력하세요:');
            if (url) {
                const pageContent = document.getElementById('pageContent');
                insertAtCursor(pageContent, '[IMG:' + url + ']');
                updatePageStats();
                updatePreview();
            }
        });
    }

    const insertLocalImage = document.getElementById('insertLocalImage');
    if (insertLocalImage) {
        insertLocalImage.addEventListener('click', function () {
            selectLocalImage(function (dataUrl, file) {
                const imageRef = createLocalImageRef(dataUrl, file);
                const pageContent = document.getElementById('pageContent');
                insertAtCursor(pageContent, '[IMG:' + imageRef + ']');
                updatePageStats();
                updatePreview();
                showNotification('로컬 이미지가 본문에 추가되었습니다.');
            });
        });
    }

    function toggleInlineWrap(marker) {
        const ta = document.getElementById('pageContent');
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const text = ta.value;
        const selected = text.slice(start, end);
        const mLen = marker.length;
        const before = text.slice(start - mLen, start);
        const after = text.slice(end, end + mLen);
        if (before === marker && after === marker) {
            ta.value = text.slice(0, start - mLen) + selected + text.slice(end + mLen);
            ta.setSelectionRange(start - mLen, end - mLen);
        } else {
            const insert = marker + (selected || '텍스트') + marker;
            ta.value = text.slice(0, start) + insert + text.slice(end);
            ta.setSelectionRange(start + mLen, start + mLen + (selected || '텍스트').length);
        }
        ta.focus();
        updatePreview();
    }

    const insertBoldBtn = document.getElementById('insertBold');
    if (insertBoldBtn) insertBoldBtn.addEventListener('click', function () { toggleInlineWrap('**'); });

    const insertItalicBtn = document.getElementById('insertItalic');
    if (insertItalicBtn) insertItalicBtn.addEventListener('click', function () { toggleInlineWrap('*'); });

    function setLineAlign(prefix) {
        const ta = document.getElementById('pageContent');
        if (!ta) return;
        const start = ta.selectionStart;
        const text = ta.value;
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = text.indexOf('\n', start);
        const lineEndActual = lineEnd === -1 ? text.length : lineEnd;
        const lineText = text.slice(lineStart, lineEndActual);
        const stripped = lineText.replace(/^\[<\]\s*|^\[\|\]\s*|^\[>\]\s*/, '');
        const existingPrefix = lineText.match(/^(\[<\]|\[\|\]|\[>\])\s*/);
        const isSame = existingPrefix && existingPrefix[1] === prefix;
        const newLine = isSame ? stripped : prefix + ' ' + stripped;
        ta.value = text.slice(0, lineStart) + newLine + text.slice(lineEndActual);
        ta.setSelectionRange(lineStart + newLine.length, lineStart + newLine.length);
        ta.focus();
        updatePreview();
    }

    const insertAlignLeft = document.getElementById('insertAlignLeft');
    if (insertAlignLeft) insertAlignLeft.addEventListener('click', function () { setLineAlign('[<]'); });
    const insertAlignCenter = document.getElementById('insertAlignCenter');
    if (insertAlignCenter) insertAlignCenter.addEventListener('click', function () { setLineAlign('[|]'); });
    const insertAlignRight = document.getElementById('insertAlignRight');
    if (insertAlignRight) insertAlignRight.addEventListener('click', function () { setLineAlign('[>]'); });

    function insertHeading(prefix) {
        const ta = document.getElementById('pageContent');
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const text = ta.value;
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = text.indexOf('\n', end);
        const lineEndActual = lineEnd === -1 ? text.length : lineEnd;
        const lineText = text.slice(lineStart, lineEndActual);
        const stripped = lineText.replace(/^#{1,4}\s*/, '');
        const newLine = prefix + ' ' + (stripped || '제목');
        ta.value = text.slice(0, lineStart) + newLine + text.slice(lineEndActual);
        const selectStart = lineStart + prefix.length + 1;
        const selectEnd = lineStart + newLine.length;
        ta.setSelectionRange(selectStart, selectEnd);
        ta.focus();
        updatePreview();
    }

    ['insertH1', 'insertH2', 'insertH3', 'insertH4'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (btn) {
            const level = parseInt(id.replace('insertH', ''));
            btn.addEventListener('click', function () { insertHeading('#'.repeat(level)); });
        }
    });

    const insertDivider = document.getElementById('insertDivider');
    if (insertDivider) {
        insertDivider.addEventListener('click', function () {
            const pageContent = document.getElementById('pageContent');
            const cursorPos = pageContent.selectionStart;
            const text = pageContent.value;
            pageContent.value = text.slice(0, cursorPos) + '\n[HR]\n' + text.slice(cursorPos);
        });
    }

    const insertFootnote = document.getElementById('insertFootnote');
    if (insertFootnote) {
        insertFootnote.addEventListener('click', function () {
            const pageContent = document.getElementById('pageContent');
            const selectedText = pageContent.value.substring(pageContent.selectionStart, pageContent.selectionEnd);
            if (!selectedText) {
                alert('주석을 달 텍스트를 먼저 선택하세요.');
                return;
            }
            const footnote = prompt('주석 내용을 입력하세요:');
            if (footnote) {
                const cursorStart = pageContent.selectionStart;
                const cursorEnd = pageContent.selectionEnd;
                const text = pageContent.value;
                pageContent.value = text.slice(0, cursorStart) + '[FN:' + selectedText + ']' + footnote + '[/FN]' + text.slice(cursorEnd);
            }
        });
    }

    const addTagBtn = document.getElementById('addTag');
    if (addTagBtn) {
        addTagBtn.addEventListener('click', function () {
            tags.push({ name: '', value: '', link: '' });
            updateTagsList();
            saveToStorage();
        });
    }

    const addReplacementBtn = document.getElementById('addReplacement');
    if (addReplacementBtn) {
        addReplacementBtn.addEventListener('click', function () {
            replacements.push({ from: '', to: '' });
            updateReplacementsList();
            saveToStorage();
        });
    }

    const addThemeBtn = document.getElementById('addCustomTheme');
    if (addThemeBtn) addThemeBtn.addEventListener('click', addCustomTheme);

    const addProfileBtn = document.getElementById('addProfile');
    if (addProfileBtn) {
        addProfileBtn.addEventListener('click', function () {
            if (profiles.length < 6) {
                profiles.push({
                    name: '',
                    imageUrl: '',
                    zoom: 100,
                    focusX: 50,
                    focusY: 30,
                    desc: '',
                    tag: '',
                    color: ''
                });
                updateProfilesList();
                saveToStorage();
            } else {
                alert('프로필은 최대 6개까지 추가할 수 있습니다.');
            }
        });
    }

    const copyBtn = document.getElementById('copyToClipboard');
    if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);

    const spacingDisplayMap = {
        fontSize: { displayId: 'textSizeDisplay', unit: 'px', decimals: 1 },
        lineHeight: { displayId: 'lineHeightDisplay', unit: '', decimals: 2 },
        letterSpacing: { displayId: 'letterSpacingDisplay', unit: 'px', decimals: 1 },
        paragraphSpacing: { displayId: 'paragraphSpacingDisplay', unit: 'px', decimals: 0 },
        textIndent: { displayId: 'textIndentDisplay', unit: 'px', decimals: 0 }
    };

    function updateSpacingDisplay(property, value) {
        const info = spacingDisplayMap[property];
        if (!info) return;
        const el = document.getElementById(info.displayId);
        if (el) el.textContent = parseFloat(value).toFixed(info.decimals) + info.unit;
    }

    function setupSpacingControls(inputId, sliderId, property) {
        const input = document.getElementById(inputId);
        const slider = document.getElementById(sliderId);
        if (input && slider) {
            input.addEventListener('input', function () {
                const value = parseFloat(this.value);
                slider.value = value;
                textSpacing[property] = value;
                updateSpacingDisplay(property, value);
                updatePreview();
                saveToStorage();
            });
            slider.addEventListener('input', function () {
                const value = parseFloat(this.value);
                input.value = value;
                textSpacing[property] = value;
                updateSpacingDisplay(property, value);
                updatePreview();
                saveToStorage();
            });
            updateSpacingDisplay(property, textSpacing[property] !== undefined ? textSpacing[property] : parseFloat(slider.value));
        }
    }

    setupSpacingControls('textSizeInput', 'textSizeSlider', 'fontSize');
    setupSpacingControls('lineHeightInput', 'lineHeightSlider', 'lineHeight');
    setupSpacingControls('letterSpacingInput', 'letterSpacingSlider', 'letterSpacing');
    setupSpacingControls('paragraphSpacingInput', 'paragraphSpacingSlider', 'paragraphSpacing');
    setupSpacingControls('textIndentInput', 'textIndentSlider', 'textIndent');

    const resetSpacingBtn = document.getElementById('resetSpacing');
    if (resetSpacingBtn) {
        resetSpacingBtn.addEventListener('click', function () {
            textSpacing = { fontSize: 14.2, lineHeight: 1.7, letterSpacing: -0.5, paragraphSpacing: 10, textIndent: 0 };

            const textSizeInput = document.getElementById('textSizeInput');
            const textSizeSlider = document.getElementById('textSizeSlider');
            const lineHeightInput = document.getElementById('lineHeightInput');
            const lineHeightSlider = document.getElementById('lineHeightSlider');
            const letterSpacingInput = document.getElementById('letterSpacingInput');
            const letterSpacingSlider = document.getElementById('letterSpacingSlider');
            const paragraphSpacingInput = document.getElementById('paragraphSpacingInput');
            const paragraphSpacingSlider = document.getElementById('paragraphSpacingSlider');
            const textIndentInput = document.getElementById('textIndentInput');
            const textIndentSlider = document.getElementById('textIndentSlider');

            if (textSizeInput) textSizeInput.value = 14.2;
            if (textSizeSlider) textSizeSlider.value = 14.2;
            if (lineHeightInput) lineHeightInput.value = 1.7;
            if (lineHeightSlider) lineHeightSlider.value = 1.7;
            if (letterSpacingInput) letterSpacingInput.value = -0.5;
            if (letterSpacingSlider) letterSpacingSlider.value = -0.5;
            if (paragraphSpacingInput) paragraphSpacingInput.value = 10;
            if (paragraphSpacingSlider) paragraphSpacingSlider.value = 10;
            if (textIndentInput) textIndentInput.value = 0;
            if (textIndentSlider) textIndentSlider.value = 0;

            updatePreview();
            saveToStorage();
            showNotification('텍스트 간격이 기본값으로 초기화되었습니다.');
        });
    }

    const headingDefaults = {
        coverArchiveNo: 11, coverTitle: 42, coverSubtitle: 14, coverTag: 11,
        sectionTitle: 20, sectionSubtitle: 11, pageHeaderNum: 40, pageHeaderTitle: 15,
    };
    const headingDisplayMap = {
        coverArchiveNo:  { slider: 'coverArchiveNoSizeSlider',  input: 'coverArchiveNoSizeInput',  display: 'coverArchiveNoSizeDisplay' },
        coverTitle:      { slider: 'coverTitleSizeSlider',      input: 'coverTitleSizeInput',      display: 'coverTitleSizeDisplay' },
        coverSubtitle:   { slider: 'coverSubtitleSizeSlider',   input: 'coverSubtitleSizeInput',   display: 'coverSubtitleSizeDisplay' },
        coverTag:        { slider: 'coverTagSizeSlider',        input: 'coverTagSizeInput',        display: 'coverTagSizeDisplay' },
        sectionTitle:    { slider: 'sectionTitleSizeSlider',    input: 'sectionTitleSizeInput',    display: 'sectionTitleSizeDisplay' },
        sectionSubtitle: { slider: 'sectionSubtitleSizeSlider', input: 'sectionSubtitleSizeInput', display: 'sectionSubtitleSizeDisplay' },
        pageHeaderNum:   { slider: 'pageHeaderNumSizeSlider',   input: 'pageHeaderNumSizeInput',   display: 'pageHeaderNumSizeDisplay' },
        pageHeaderTitle: { slider: 'pageHeaderTitleSizeSlider', input: 'pageHeaderTitleSizeInput', display: 'pageHeaderTitleSizeDisplay' },
    };

    function syncHeadingUI(key, value) {
        const ids = headingDisplayMap[key];
        const sl = document.getElementById(ids.slider);
        const inp = document.getElementById(ids.input);
        const dsp = document.getElementById(ids.display);
        if (sl) sl.value = value;
        if (inp) inp.value = value;
        if (dsp) dsp.textContent = value + 'px';
    }

    function setupHeadingControl(key) {
        const ids = headingDisplayMap[key];
        const slider = document.getElementById(ids.slider);
        const input = document.getElementById(ids.input);
        if (!slider || !input) return;
        slider.addEventListener('input', function () {
            const v = parseFloat(this.value);
            headingFontSizes[key] = v;
            syncHeadingUI(key, v);
            updatePreview();
            saveToStorage();
        });
        input.addEventListener('input', function () {
            const v = parseFloat(this.value);
            headingFontSizes[key] = v;
            syncHeadingUI(key, v);
            updatePreview();
            saveToStorage();
        });
        syncHeadingUI(key, headingFontSizes[key]);
    }

    Object.keys(headingDefaults).forEach(setupHeadingControl);

    const resetHeadingBtn = document.getElementById('resetHeadingSizes');
    if (resetHeadingBtn) {
        resetHeadingBtn.addEventListener('click', function () {
            headingFontSizes = { ...headingDefaults };
            Object.keys(headingDefaults).forEach(k => syncHeadingUI(k, headingDefaults[k]));
            updatePreview();
            saveToStorage();
            showNotification('제목 크기가 기본값으로 초기화되었습니다.');
        });
    }

    const fontFamilySelect = document.getElementById('fontFamily');
    if (fontFamilySelect) {
        fontFamilySelect.addEventListener('change', function () {
            fontFamily = this.value;
            updatePreview();
            saveToStorage();
            showNotification('폰트가 변경되었습니다: ' + fontFamily);
        });
    }

    const commentThemeSelect = document.getElementById('commentTheme');
    if (commentThemeSelect) {
        commentThemeSelect.addEventListener('change', function () {
            updatePreview();
            saveToStorage();
        });
    }

    const exportDataBtn = document.getElementById('exportData');
    if (exportDataBtn) exportDataBtn.addEventListener('click', exportDataToJSON);

    const importDataBtn = document.getElementById('importData');
    const importFileInput = document.getElementById('importFileInput');
    if (importDataBtn && importFileInput) {
        importDataBtn.addEventListener('click', function () { importFileInput.click(); });
        importFileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                importDataFromJSON(file);
                e.target.value = '';
            }
        });
    }

    const resetDataBtn = document.getElementById('resetData');
    if (resetDataBtn) resetDataBtn.addEventListener('click', resetCurrentData);

    const cleanupImagesBtn = document.getElementById('cleanupImages');
    if (cleanupImagesBtn) cleanupImagesBtn.addEventListener('click', cleanupUnusedLocalImages);
    updateImageStorageSummary();

    const saveChapterBtn = document.getElementById('saveChapterToLibrary');
    if (saveChapterBtn) saveChapterBtn.addEventListener('click', saveChapterToLibrary);

    const quickSaveChapterBtn = document.getElementById('quickSaveChapter');
    if (quickSaveChapterBtn) quickSaveChapterBtn.addEventListener('click', saveChapterToLibrary);

    const openChapterLibraryBtn = document.getElementById('openChapterLibrary');
    if (openChapterLibraryBtn) {
        openChapterLibraryBtn.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }

    const quickOpenLibraryBtn = document.getElementById('quickOpenLibrary');
    if (quickOpenLibraryBtn) {
        quickOpenLibraryBtn.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }
}

// 모바일 프리뷰 토글 기능
(function () {
    const toggleBtn = document.getElementById('togglePreview');
    const previewPanel = document.querySelector('.preview-panel');
    const eyeIcon = document.getElementById('icon-preview-eye');
    const editIcon = document.getElementById('icon-preview-edit');

    if (!toggleBtn || !previewPanel) return;

    function toggleIcons(showPreview) {
        if (showPreview) {
            eyeIcon.style.display = 'none';
            editIcon.style.display = 'block';
            toggleBtn.title = '편집으로 돌아가기';
        } else {
            eyeIcon.style.display = 'block';
            editIcon.style.display = 'none';
            toggleBtn.title = '미리보기 보기';
        }
    }

    toggleBtn.addEventListener('click', function () {
        const isVisible = previewPanel.classList.toggle('mobile-visible');
        toggleIcons(isVisible);
    });

    previewPanel.addEventListener('click', function (e) {
        const rect = previewPanel.getBoundingClientRect();
        const closeButtonArea = {
            left: rect.right - 55,
            right: rect.right - 15,
            top: rect.top + 15,
            bottom: rect.top + 55
        };

        if (e.clientX >= closeButtonArea.left &&
            e.clientX <= closeButtonArea.right &&
            e.clientY >= closeButtonArea.top &&
            e.clientY <= closeButtonArea.bottom) {
            previewPanel.classList.remove('mobile-visible');
            toggleIcons(false);
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && previewPanel.classList.contains('mobile-visible')) {
            previewPanel.classList.remove('mobile-visible');
            toggleIcons(false);
        }
    });
})();
