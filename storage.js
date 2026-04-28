function loadFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = migrateEditorData(JSON.parse(saved), {
                fallbackEditorTitle: getEditingChapterTitle()
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            applyEditorDataToForm(data);
        } else {
            loadDefaultSettings();
        }
    } catch (e) {
        console.error('Failed to load from storage:', e);
        loadDefaultSettings();
    }
}

function getDefaultEditorData() {
    return {
        schemaVersion: EDITOR_DATA_SCHEMA_VERSION,
        editorTitle: '',
        useRoundedQuotes: true,
        useTextIndent: false,
        preserveLineBreaks: false,
        coverImage: 'DefaultCover.png',
        coverAutoFit: true,
        coverZoom: 120,
        coverFocusX: 50,
        coverFocusY: 30,
        coverArchiveNo: 'ARCHIVE NO.001',
        coverTitle: 'Yuzu',
        coverSubtitle: '귀여운 고양이 메이드',
        summaryText: '',
        enableComment: false,
        commentText: '',
        commentNickname: '',
        enableTags: true,
        customColors: {
            bg: '#ffffff',
            text: '#2c3e50',
            em: '#2d5af0',
            header: '#162a3e',
            quote1Bg: '#f0f2f5',
            quote1Text: '#2c3e50',
            quote2Bg: '#f0f2f5',
            quote2Text: '#162a3e',
            tagText: '#6c8da8',
            divider: '#c8d6e0'
        },
        pages: [
            {
                itemType: 'section',
                title: 'Section Title',
                subtitle: 'Story',
                image: 'DefaultSection.png',
                focusX: 50,
                focusY: 40
            },
            {
                itemType: 'page',
                type: 'basic',
                title: 'Page Title',
                subtitle: 'Page Subtitle',
                content: '[IMG:DefaultImg.png]\nPage Content',
                bgImage: null,
                collapsed: false,
                useGlobalTags: true,
                tags: [],
                headerImage: null,
                headerFocusX: 50,
                headerFocusY: 50
            }
        ],
        tags: JSON.parse(JSON.stringify(DEFAULT_TAGS)),
        replacements: [{ from: '', to: '' }],
        customThemes: [],
        profiles: [
            {
                name: 'Yuzu',
                imageUrl: 'DefaultProfile1.png',
                zoom: 100,
                focusX: 50,
                focusY: 30,
                desc: ' Profile 1 Description',
                tag: 'CHAR',
                color: '#c77d8e'
            },
            {
                name: 'Jong-won',
                imageUrl: 'DefaultProfile2.png',
                zoom: 100,
                focusX: 50,
                focusY: 10,
                desc: 'Profile 2 Description',
                tag: 'USER',
                color: '#5a9ace'
            }
        ],
        localImages: {},
        textSpacing: {
            fontSize: textSpacing.fontSize,
            lineHeight: textSpacing.lineHeight,
            letterSpacing: textSpacing.letterSpacing,
            paragraphSpacing: textSpacing.paragraphSpacing,
            textIndent: textSpacing.textIndent
        },
        headingFontSizes: Object.assign({}, headingFontSizes),
        fontFamily: 'Noto Serif KR',
        globalTheme: 'basic',
        hidePageNumbers: false,
        enablePageFold: true,
        showHeaderWhenFoldOff: false,
        dividerStyle: 'line',
        dividerCustomText: ''
    };
}

function loadDefaultSettings() {
    const data = migrateEditorData(getDefaultEditorData());
    applyEditorDataToForm(data);
    updatePreview();
}

function collectEditorData(extraData) {
    return {
        schemaVersion: EDITOR_DATA_SCHEMA_VERSION,
        editorTitle: editorTitle,
        useRoundedQuotes: getCheckedValue('useRoundedQuotes'),
        useTextIndent: getCheckedValue('useTextIndent'),
        preserveLineBreaks: getCheckedValue('preserveLineBreaks'),
        enableTopSection: true,
        enableCover: true,
        coverImage: getInputValue('coverImage'),
        coverAutoFit: getCheckedValue('coverAutoFit'),
        coverZoom: getIntInputValue('coverZoom', 120),
        coverFocusX: getIntInputValue('coverFocusX', 50),
        coverFocusY: getIntInputValue('coverFocusY', 30),
        coverArchiveNo: getInputValue('coverArchiveNo'),
        coverTitle: getInputValue('coverTitle'),
        coverSubtitle: getInputValue('coverSubtitle'),
        enableProfiles: true,
        summaryText: getInputValue('summaryText'),
        enableComment: getCheckedValue('enableComment'),
        commentText: getInputValue('commentText'),
        commentNickname: getInputValue('commentNickname'),
        enableTags: getCheckedValue('enableTags'),
        customColors: {
            bg: getColorValue('customBg'),
            text: getColorValue('customText'),
            em: getColorValue('customEm'),
            header: getColorValue('customHeader'),
            quote1Bg: getColorValue('customQuote1Bg'),
            quote1Text: getColorValue('customQuote1Text'),
            quote2Bg: getColorValue('customQuote2Bg'),
            quote2Text: getColorValue('customQuote2Text'),
            tagText: getColorValue('customTagText'),
            divider: getColorValue('customDivider')
        },
        pages: pages,
        tags: tags,
        replacements: replacements,
        customThemes: customThemes,
        profiles: profiles,
        localImages: localImages,
        characters: getProfileCharacters(),
        textSpacing: textSpacing,
        fontFamily: fontFamily,
        globalTheme: globalTheme,
        hidePageNumbers: hidePageNumbers,
        headingFontSizes: headingFontSizes,
        enablePageFold: enablePageFold,
        showHeaderWhenFoldOff: showHeaderWhenFoldOff,
        dividerStyle: dividerStyle,
        dividerCustomText: dividerCustomText,
        ...(extraData || {})
    };
}

function cloneData(value) {
    if (!value || typeof value !== 'object') return {};
    try {
        return JSON.parse(JSON.stringify(value));
    } catch (e) {
        return {};
    }
}

function normalizeCustomColors(customColors) {
    const colors = customColors && typeof customColors === 'object' ? customColors : {};
    return {
        bg: colors.bg || '#ffffff',
        text: colors.text || '#2c3e50',
        em: colors.em || '#2d5af0',
        header: colors.header || colors.line || colors.headerText || '#162a3e',
        quote1Bg: colors.quote1Bg || '#f0f2f5',
        quote1Text: colors.quote1Text || '#2c3e50',
        quote2Bg: colors.quote2Bg || '#f0f2f5',
        quote2Text: colors.quote2Text || '#162a3e',
        tagText: colors.tagText || colors.text || '#6c8da8',
        divider: colors.divider || colors.tagText || colors.text || '#c8d6e0'
    };
}

function normalizeCustomThemes(value) {
    const themes = Array.isArray(value) ? value : [];
    return themes.map(function (theme) {
        const normalized = Object.assign({}, theme);
        const header = normalized.header || normalized.line || normalized.headerText || normalized.text || '#333333';
        normalized.header = header;
        normalized.headerText = normalized.headerText || header;
        normalized.line = normalized.line || header;
        normalized.tagText = normalized.tagText || normalized.text || '#888888';
        normalized.divider = normalized.divider || normalized.tagText || normalized.text || '#cccccc';
        return normalized;
    });
}

function normalizePages(value) {
    const sourcePages = Array.isArray(value) ? value : [];
    return sourcePages.map(function (item) {
        const page = Object.assign({}, item);
        if (!page.itemType) page.itemType = 'page';
        if (page.itemType === 'page') page.collapsed = false;
        if (page.content) page.content = migrateLocalImagesInText(page.content);
        if (page.image) page.image = migrateLocalImageValue(page.image);
        if (page.bgImage) page.bgImage = migrateLocalImageValue(page.bgImage);
        if (page.headerImage) page.headerImage = migrateLocalImageValue(page.headerImage);
        if (page.itemType === 'page' && (page.imageWidth === undefined || page.imageWidth === null)) {
            page.imageWidth = 100;
        }
        return page;
    });
}

function normalizeTags(value) {
    let normalizedTags;
    if (Array.isArray(value) && value.length > 0) {
        normalizedTags = JSON.parse(JSON.stringify(value));
    } else {
        normalizedTags = JSON.parse(JSON.stringify(DEFAULT_TAGS));
    }
    while (normalizedTags.length < DEFAULT_TAGS.length) {
        normalizedTags.push(JSON.parse(JSON.stringify(DEFAULT_TAGS[normalizedTags.length])));
    }
    return normalizedTags;
}

function normalizeProfiles(data) {
    if (data.profiles && data.profiles.length > 0) {
        return JSON.parse(JSON.stringify(data.profiles)).map(function (profile) {
            profile.imageUrl = migrateLocalImageValue(profile.imageUrl);
            return profile;
        });
    }
    if (data.userName || data.charName) {
        return [
            {
                name: data.userName || 'User',
                imageUrl: migrateLocalImageValue(data.userImageUrl || ''),
                focusX: data.userFocusX !== undefined ? data.userFocusX : 50,
                focusY: data.userFocusY !== undefined ? data.userFocusY : 30,
                desc: data.userDesc || '',
                tag: data.userProfileTag || '',
                color: ''
            },
            {
                name: data.charName || 'Char',
                imageUrl: migrateLocalImageValue(data.charImageUrl || ''),
                focusX: data.charFocusX !== undefined ? data.charFocusX : 50,
                focusY: data.charFocusY !== undefined ? data.charFocusY : 30,
                desc: data.charDesc || '',
                tag: data.charProfileTag || '',
                color: ''
            }
        ];
    }
    return [];
}

function migrateEditorData(rawData, options) {
    const data = cloneData(rawData);
    const fallbackTitle = options && options.fallbackEditorTitle ? options.fallbackEditorTitle : '';

    localImages = data.localImages && typeof data.localImages === 'object' ? data.localImages : {};

    data.schemaVersion = EDITOR_DATA_SCHEMA_VERSION;
    data.editorTitle = data.editorTitle || fallbackTitle || '';
    editorTitle = data.editorTitle;
    data.coverImage = migrateLocalImageValue(data.coverImage || '');
    data.customColors = normalizeCustomColors(data.customColors);
    data.pages = normalizePages(data.pages);
    data.tags = normalizeTags(data.tags);
    data.replacements = Array.isArray(data.replacements) ? data.replacements : [];
    data.customThemes = normalizeCustomThemes(data.customThemes);
    data.profiles = normalizeProfiles(data);
    data.localImages = localImages;

    if (!data.textSpacing) data.textSpacing = {};
    if (!data.headingFontSizes) data.headingFontSizes = {};
    if (!data.globalTheme) data.globalTheme = 'basic';
    if (data.enablePageFold === undefined) data.enablePageFold = true;
    if (data.showHeaderWhenFoldOff === undefined) data.showHeaderWhenFoldOff = false;
    if (!data.dividerStyle) data.dividerStyle = 'line';
    if (data.dividerCustomText === undefined) data.dividerCustomText = '';

    return data;
}

function syncTextSpacingControls() {
    const controls = {
        textSize: { input: 'textSizeInput', slider: 'textSizeSlider', display: 'textSizeDisplay', value: textSpacing.fontSize, suffix: 'px', format: function (v) { return v.toFixed(1); } },
        lineHeight: { input: 'lineHeightInput', slider: 'lineHeightSlider', display: 'lineHeightDisplay', value: textSpacing.lineHeight, suffix: '', format: function (v) { return v.toFixed(2); } },
        letterSpacing: { input: 'letterSpacingInput', slider: 'letterSpacingSlider', display: 'letterSpacingDisplay', value: textSpacing.letterSpacing, suffix: 'px', format: function (v) { return v.toFixed(1); } },
        paragraphSpacing: { input: 'paragraphSpacingInput', slider: 'paragraphSpacingSlider', display: 'paragraphSpacingDisplay', value: textSpacing.paragraphSpacing, suffix: 'px', format: function (v) { return String(v); } },
        textIndent: { input: 'textIndentInput', slider: 'textIndentSlider', display: 'textIndentDisplay', value: textSpacing.textIndent, suffix: 'px', format: function (v) { return String(v); } }
    };

    Object.keys(controls).forEach(function (key) {
        const item = controls[key];
        const input = document.getElementById(item.input);
        const slider = document.getElementById(item.slider);
        const display = document.getElementById(item.display);
        if (input) input.value = item.value;
        if (slider) slider.value = item.value;
        if (display) display.textContent = item.format(item.value) + item.suffix;
    });
}

function syncHeadingFontSizeControls() {
    const map = {
        coverArchiveNo:  { slider: 'coverArchiveNoSizeSlider',  input: 'coverArchiveNoSizeInput',  display: 'coverArchiveNoSizeDisplay' },
        coverTitle:      { slider: 'coverTitleSizeSlider',      input: 'coverTitleSizeInput',      display: 'coverTitleSizeDisplay' },
        coverSubtitle:   { slider: 'coverSubtitleSizeSlider',   input: 'coverSubtitleSizeInput',   display: 'coverSubtitleSizeDisplay' },
        coverTag:        { slider: 'coverTagSizeSlider',        input: 'coverTagSizeInput',        display: 'coverTagSizeDisplay' },
        sectionTitle:    { slider: 'sectionTitleSizeSlider',    input: 'sectionTitleSizeInput',    display: 'sectionTitleSizeDisplay' },
        sectionSubtitle: { slider: 'sectionSubtitleSizeSlider', input: 'sectionSubtitleSizeInput', display: 'sectionSubtitleSizeDisplay' },
        pageHeaderNum:   { slider: 'pageHeaderNumSizeSlider',   input: 'pageHeaderNumSizeInput',   display: 'pageHeaderNumSizeDisplay' },
        pageHeaderTitle: { slider: 'pageHeaderTitleSizeSlider', input: 'pageHeaderTitleSizeInput', display: 'pageHeaderTitleSizeDisplay' }
    };

    Object.keys(headingFontSizes).forEach(function (key) {
        if (!map[key]) return;
        const slider = document.getElementById(map[key].slider);
        const input = document.getElementById(map[key].input);
        const display = document.getElementById(map[key].display);
        if (slider) slider.value = headingFontSizes[key];
        if (input) input.value = headingFontSizes[key];
        if (display) display.textContent = headingFontSizes[key] + 'px';
    });
}

function applyEditorDataToForm(data) {
    editorTitle = data.editorTitle || '';
    localImages = data.localImages || {};

    const useRoundedQuotes = document.getElementById('useRoundedQuotes');
    const useTextIndent = document.getElementById('useTextIndent');
    const preserveLineBreaks = document.getElementById('preserveLineBreaks');
    const coverImage = document.getElementById('coverImage');
    const coverZoom = document.getElementById('coverZoom');
    const coverFocusX = document.getElementById('coverFocusX');
    const coverFocusY = document.getElementById('coverFocusY');
    const coverAutoFit = document.getElementById('coverAutoFit');
    const coverArchiveNo = document.getElementById('coverArchiveNo');
    const coverTitle = document.getElementById('coverTitle');
    const coverSubtitle = document.getElementById('coverSubtitle');
    const coverManualControls = document.getElementById('coverManualControls');
    const coverZoomValue = document.getElementById('coverZoomValue');
    const coverFocusXValue = document.getElementById('coverFocusXValue');
    const coverFocusYValue = document.getElementById('coverFocusYValue');
    const summaryText = document.getElementById('summaryText');
    const enableCommentEl = document.getElementById('enableComment');
    const commentText = document.getElementById('commentText');
    const commentNickname = document.getElementById('commentNickname');
    const commentContent = document.getElementById('commentContent');
    const enableTagsEl = document.getElementById('enableTags');
    const tagsInputs = document.getElementById('tagsInputs');

    if (useRoundedQuotes) useRoundedQuotes.checked = data.useRoundedQuotes || false;
    if (useTextIndent) useTextIndent.checked = data.useTextIndent || false;
    if (preserveLineBreaks) preserveLineBreaks.checked = data.preserveLineBreaks || false;

    if (coverImage) coverImage.value = data.coverImage || '';
    if (coverAutoFit) coverAutoFit.checked = data.coverAutoFit || false;
    if (coverZoom) coverZoom.value = data.coverZoom || 120;
    if (coverFocusX) coverFocusX.value = data.coverFocusX || 50;
    if (coverFocusY) coverFocusY.value = data.coverFocusY || 28;
    if (coverArchiveNo) coverArchiveNo.value = data.coverArchiveNo || 'ARCHIVE NO.001';
    if (coverTitle) coverTitle.value = data.coverTitle || '';
    if (coverSubtitle) coverSubtitle.value = data.coverSubtitle || '';
    if (coverManualControls) coverManualControls.style.display = data.coverAutoFit ? 'none' : 'block';
    if (coverZoomValue) coverZoomValue.textContent = (data.coverZoom || 120) + '%';
    if (coverFocusXValue) coverFocusXValue.textContent = (data.coverFocusX || 50) + '%';
    if (coverFocusYValue) coverFocusYValue.textContent = (data.coverFocusY || 28) + '%';

    if (summaryText) summaryText.value = data.summaryText || '';
    if (enableCommentEl) enableCommentEl.checked = data.enableComment || false;
    if (commentText) commentText.value = data.commentText || '';
    if (commentNickname) commentNickname.value = data.commentNickname || '';
    if (commentContent) commentContent.style.display = data.enableComment ? 'block' : 'none';
    if (enableTagsEl) enableTagsEl.checked = data.enableTags !== undefined ? data.enableTags : true;
    if (tagsInputs && enableTagsEl) tagsInputs.style.display = enableTagsEl.checked ? 'block' : 'none';

    if (data.customColors) {
        setColorInputValue('customBg', data.customColors.bg);
        setColorInputValue('customText', data.customColors.text);
        setColorInputValue('customEm', data.customColors.em);
        setColorInputValue('customHeader', data.customColors.header);
        setColorInputValue('customQuote1Bg', data.customColors.quote1Bg);
        setColorInputValue('customQuote1Text', data.customColors.quote1Text);
        setColorInputValue('customQuote2Bg', data.customColors.quote2Bg);
        setColorInputValue('customQuote2Text', data.customColors.quote2Text);
        setColorInputValue('customTagText', data.customColors.tagText);
        setColorInputValue('customDivider', data.customColors.divider);
    }

    pages = data.pages || [];
    tags = data.tags || JSON.parse(JSON.stringify(DEFAULT_TAGS));
    replacements = data.replacements || [];
    customThemes = data.customThemes || [];
    profiles = data.profiles || [];
    textSpacing = { ...textSpacing, ...(data.textSpacing || {}) };
    headingFontSizes = { ...headingFontSizes, ...(data.headingFontSizes || {}) };
    fontFamily = data.fontFamily || fontFamily;
    globalTheme = data.globalTheme || 'basic';
    hidePageNumbers = data.hidePageNumbers || false;
    enablePageFold = data.enablePageFold !== undefined ? data.enablePageFold : true;
    showHeaderWhenFoldOff = data.showHeaderWhenFoldOff || false;
    dividerStyle = data.dividerStyle || 'line';
    dividerCustomText = data.dividerCustomText || '';

    const fontFamilyEl = document.getElementById('fontFamily');
    const globalThemeEl = document.getElementById('globalTheme');
    const hidePageNumbersEl = document.getElementById('hidePageNumbers');
    const enablePageFoldEl = document.getElementById('enablePageFold');
    const showHeaderWhenFoldOffEl = document.getElementById('showHeaderWhenFoldOff');
    const dividerStyleEl = document.getElementById('dividerStyle');
    const dividerCustomTextEl = document.getElementById('dividerCustomText');

    if (fontFamilyEl) fontFamilyEl.value = fontFamily;
    if (globalThemeEl) globalThemeEl.value = globalTheme;
    if (hidePageNumbersEl) hidePageNumbersEl.checked = hidePageNumbers;
    if (enablePageFoldEl) enablePageFoldEl.checked = enablePageFold;
    if (showHeaderWhenFoldOffEl) showHeaderWhenFoldOffEl.checked = showHeaderWhenFoldOff;
    if (dividerStyleEl) dividerStyleEl.value = dividerStyle;
    if (dividerCustomTextEl) {
        dividerCustomTextEl.value = dividerCustomText;
        dividerCustomTextEl.style.display = dividerStyle === 'custom' ? 'block' : 'none';
    }

    syncTextSpacingControls();
    syncHeadingFontSizeControls();

    updateTagsList();
    updateReplacementsList();
    updatePagesList();
    updateCustomThemesList();
    updateProfilesList();
}

function getEditingChapterTitle() {
    try {
        const editingId = localStorage.getItem(EDITING_CHAPTER_KEY);
        if (!editingId) return '';
        const saved = localStorage.getItem(CHAPTER_LIBRARY_STORAGE_KEY);
        const chapters = saved ? JSON.parse(saved) : [];
        const chapter = chapters.find(function (item) { return item.id === editingId; });
        return chapter ? (chapter.title || '') : '';
    } catch (e) {
        return '';
    }
}

let _saveIndicatorTimer = null;
let _suppressDirtyIndicator = false;

function setSaveIndicator(text, state) {
    const el = document.getElementById('saveIndicator');
    if (!el) return;
    clearTimeout(_saveIndicatorTimer);
    el.textContent = text;
    el.classList.remove('saved', 'dirty');
    if (state) el.classList.add(state);
    el.classList.add('visible');
}

function showSavedIndicator() {
    setSaveIndicator('✓ 저장됨', 'saved');
    clearTimeout(_saveIndicatorTimer);
    _saveIndicatorTimer = setTimeout(function () {
        const el = document.getElementById('saveIndicator');
        if (el) el.classList.remove('visible');
    }, 1500);
}

function showDirtyIndicator() {
    setSaveIndicator('수정됨', 'dirty');
}

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collectEditorData()));
        if (!_suppressDirtyIndicator) showDirtyIndicator();
    } catch (e) {
        console.error('Failed to save to storage:', e);
    }
}

function saveChapterToLibrary() {
    const saved = localStorage.getItem(CHAPTER_LIBRARY_STORAGE_KEY);
    const chapters = saved ? JSON.parse(saved) : [];
    const editingId = localStorage.getItem(EDITING_CHAPTER_KEY);
    const existingChapter = editingId ? chapters.find(function (c) { return c.id === editingId; }) : null;

    const defaultTitle = existingChapter
        ? existingChapter.title
        : (editorTitle || getInputValue('coverTitle') || getInputValue('pageTitle') || 'Untitled Chapter');

    const modal = document.getElementById('saveChapterModal');
    const input = document.getElementById('saveChapterTitleInput');
    input.value = defaultTitle;
    modal.style.display = 'flex';
    setTimeout(function () { input.focus(); input.select(); }, 50);

    function doSave() {
        const title = input.value.trim();
        if (!title) return;
        modal.style.display = 'none';
        try {
            editorTitle = title;

            const now = new Date().toISOString();
            const data = collectEditorData();
            if (existingChapter) {
                existingChapter.title = title;
                existingChapter.subtitle = getInputValue('coverSubtitle');
                existingChapter.summary = getInputValue('summaryText');
                existingChapter.coverImage = getInputValue('coverImage');
                existingChapter.descriptionHtml = generateIntroHTML(data);
                existingChapter.html = generateHTML(data, false);
                existingChapter.data = data;
                existingChapter.updatedAt = now;
                localStorage.setItem(CHAPTER_LIBRARY_STORAGE_KEY, JSON.stringify(chapters));
                _suppressDirtyIndicator = true;
                saveToStorage();
                _suppressDirtyIndicator = false;
                updatePreview();
                showSavedIndicator();
                showNotification('작품이 업데이트되었습니다.');
            } else {
                const chapter = {
                    id: 'chapter_' + Date.now(),
                    title: title,
                    subtitle: getInputValue('coverSubtitle'),
                    summary: getInputValue('summaryText'),
                    coverImage: getInputValue('coverImage'),
                    descriptionHtml: generateIntroHTML(data),
                    html: generateHTML(data, false),
                    data: data,
                    createdAt: now,
                    updatedAt: now
                };
                chapters.unshift(chapter);
                localStorage.setItem(CHAPTER_LIBRARY_STORAGE_KEY, JSON.stringify(chapters));
                localStorage.setItem(EDITING_CHAPTER_KEY, chapter.id);
                _suppressDirtyIndicator = true;
                saveToStorage();
                _suppressDirtyIndicator = false;
                updatePreview();
                showSavedIndicator();
                showNotification('챕터가 작품 선택 페이지에 저장되었습니다.');
            }
        } catch (error) {
            _suppressDirtyIndicator = false;
            console.error('Chapter save failed:', error);
            showNotification('챕터 저장 실패: ' + error.message);
        }
        cleanup();
    }

    function doCancel() {
        modal.style.display = 'none';
        cleanup();
    }

    function onKeydown(e) {
        if (e.key === 'Enter') doSave();
        if (e.key === 'Escape') doCancel();
    }

    function cleanup() {
        document.getElementById('saveChapterConfirm').removeEventListener('click', doSave);
        document.getElementById('saveChapterModalClose').removeEventListener('click', doCancel);
        input.removeEventListener('keydown', onKeydown);
        modal.removeEventListener('click', onOverlayClick);
    }

    function onOverlayClick(e) {
        if (e.target === modal) doCancel();
    }

    document.getElementById('saveChapterConfirm').addEventListener('click', doSave);
    document.getElementById('saveChapterModalClose').addEventListener('click', doCancel);
    input.addEventListener('keydown', onKeydown);
    modal.addEventListener('click', onOverlayClick);
}

function resetCurrentData() {
    if (!confirm('현재 작업 중인 모든 내용이 초기화됩니다.\n저장된 프리셋과 테마는 유지됩니다.\n\n계속하시겠습니까?')) return;

    pages = [];
    tags = [];
    replacements = [];
    profiles = [];
    localImages = {};
    editorTitle = '';
    currentEditingIndex = null;
    tempPageTags = [];
    globalTheme = 'basic';
    hidePageNumbers = false;
    enablePageFold = true;
    showHeaderWhenFoldOff = false;
    dividerStyle = 'line';
    dividerCustomText = '';
    fontFamily = 'Pretendard';
    textSpacing = {
        fontSize: 14.2,
        lineHeight: 1.7,
        letterSpacing: -0.5,
        paragraphSpacing: 10,
        textIndent: 0
    };

    const checkboxIds = [
        'useRoundedQuotes', 'useTextIndent', 'preserveLineBreaks',
        'coverAutoFit', 'enableTags', 'enableComment', 'hidePageNumbers'
    ];
    checkboxIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = (id === 'coverAutoFit' || id === 'enableTags');
    });

    const enablePageFoldEl = document.getElementById('enablePageFold');
    if (enablePageFoldEl) enablePageFoldEl.checked = true;

    const resetShEl = document.getElementById('showHeaderWhenFoldOff');
    if (resetShEl) resetShEl.checked = false;

    const resetDsEl = document.getElementById('dividerStyle');
    const resetDcEl = document.getElementById('dividerCustomText');
    if (resetDsEl) resetDsEl.value = 'line';
    if (resetDcEl) { resetDcEl.value = ''; resetDcEl.style.display = 'none'; }

    const textInputIds = ['coverImage', 'coverTitle', 'coverSubtitle', 'summaryText', 'commentText', 'commentNickname'];
    textInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const coverArchiveNoEl = document.getElementById('coverArchiveNo');
    if (coverArchiveNoEl) coverArchiveNoEl.value = 'ARCHIVE NO.001';

    const fontFamilyEl = document.getElementById('fontFamily');
    if (fontFamilyEl) fontFamilyEl.value = 'Pretendard';

    const spacingDefaults = {
        textSizeInput: 14.2, textSizeSlider: 14.2,
        lineHeightInput: 1.7, lineHeightSlider: 1.7,
        letterSpacingInput: -0.5, letterSpacingSlider: -0.5,
        paragraphSpacingInput: 10, paragraphSpacingSlider: 10,
        textIndentInput: 0, textIndentSlider: 0
    };
    Object.entries(spacingDefaults).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });

    const globalThemeEl = document.getElementById('globalTheme');
    if (globalThemeEl) globalThemeEl.value = 'basic';

    updatePagesList();
    updateTagsList();
    updateReplacementsList();
    updateProfilesList();

    const commentContent = document.getElementById('commentContent');
    if (commentContent) commentContent.style.display = 'none';

    localStorage.removeItem(STORAGE_KEY);
    updatePreview();
    showNotification('초기화 완료! 프리셋과 테마는 유지됩니다.');
}

function exportDataToJSON() {
    try {
        const savedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
        const presets = savedPresets ? JSON.parse(savedPresets) : {};

        const data = collectEditorData({
            presets: presets,
            exportDate: new Date().toISOString(),
            schemaVersion: EDITOR_DATA_SCHEMA_VERSION
        });

        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const now = new Date();
        const dateStr = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + '-' +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
        a.download = 'log-diary-backup-' + dateStr + '.json';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('데이터가 JSON 파일로 내보내졌습니다!');
    } catch (e) {
        console.error('Export failed:', e);
        showNotification('내보내기 실패: ' + e.message);
    }
}

function importDataFromJSON(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            let data = JSON.parse(e.target.result);

            if (!data || typeof data !== 'object') {
                throw new Error('유효하지 않은 데이터 형식입니다.');
            }

            if (!confirm('현재 작업 중인 데이터가 모두 사라집니다. 불러오시겠습니까?')) return;

            data = migrateEditorData(data);
            applyEditorDataToForm(data);

            if (data.presets && typeof data.presets === 'object') {
                localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(data.presets));
                loadPresets();
            }

            updatePreview();
            saveToStorage();

            showNotification('데이터를 성공적으로 불러왔습니다!');
        } catch (e) {
            console.error('Import failed:', e);
            showNotification('불러오기 실패: ' + e.message);
        }
    };

    reader.onerror = function () {
        showNotification('파일 읽기 실패');
    };

    reader.readAsText(file);
}
