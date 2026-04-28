function loadFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            localImages = data.localImages || {};
            editorTitle = data.editorTitle || getEditingChapterTitle() || '';
            data.coverImage = migrateLocalImageValue(data.coverImage);

            const useRoundedQuotes = document.getElementById('useRoundedQuotes');
            const useTextIndent = document.getElementById('useTextIndent');
            const coverImage = document.getElementById('coverImage');
            const coverZoom = document.getElementById('coverZoom');
            const coverFocusX = document.getElementById('coverFocusX');
            const coverFocusY = document.getElementById('coverFocusY');
            const coverAutoFit = document.getElementById('coverAutoFit');
            const coverArchiveNo = document.getElementById('coverArchiveNo');
            const coverTitle = document.getElementById('coverTitle');
            const coverSubtitle = document.getElementById('coverSubtitle');

            if (useRoundedQuotes) useRoundedQuotes.checked = data.useRoundedQuotes || false;
            if (useTextIndent) useTextIndent.checked = data.useTextIndent || false;
            const preserveLineBreaks = document.getElementById('preserveLineBreaks');
            if (preserveLineBreaks) preserveLineBreaks.checked = data.preserveLineBreaks || false;

            if (coverImage) coverImage.value = data.coverImage || '';
            if (coverAutoFit) coverAutoFit.checked = data.coverAutoFit || false;
            if (coverZoom) coverZoom.value = data.coverZoom || 120;
            if (coverFocusX) coverFocusX.value = data.coverFocusX || 50;
            if (coverFocusY) coverFocusY.value = data.coverFocusY || 28;
            if (coverArchiveNo) coverArchiveNo.value = data.coverArchiveNo || 'ARCHIVE NO.001';
            if (coverTitle) coverTitle.value = data.coverTitle || '';
            if (coverSubtitle) coverSubtitle.value = data.coverSubtitle || '';

            const coverManualControls = document.getElementById('coverManualControls');
            if (coverManualControls) {
                coverManualControls.style.display = (data.coverAutoFit) ? 'none' : 'block';
            }

            const coverZoomValue = document.getElementById('coverZoomValue');
            const coverFocusXValue = document.getElementById('coverFocusXValue');
            const coverFocusYValue = document.getElementById('coverFocusYValue');
            const summaryText = document.getElementById('summaryText');
            const enableCommentEl = document.getElementById('enableComment');
            const commentText = document.getElementById('commentText');
            const commentNickname = document.getElementById('commentNickname');
            const commentContent = document.getElementById('commentContent');
            const enableTagsEl = document.getElementById('enableTags');

            if (coverZoomValue) coverZoomValue.textContent = (data.coverZoom || 120) + '%';
            if (coverFocusXValue) coverFocusXValue.textContent = (data.coverFocusX || 50) + '%';
            if (coverFocusYValue) coverFocusYValue.textContent = (data.coverFocusY || 28) + '%';

            if (summaryText) summaryText.value = data.summaryText || '';
            if (enableCommentEl) enableCommentEl.checked = data.enableComment || false;
            if (commentText) commentText.value = data.commentText || '';
            if (commentNickname) commentNickname.value = data.commentNickname || '';
            if (commentContent) commentContent.style.display = data.enableComment ? 'block' : 'none';
            if (enableTagsEl) enableTagsEl.checked = data.enableTags !== undefined ? data.enableTags : true;

            if (data.customColors) {
                setColorInputValue('customBg', data.customColors.bg);
                setColorInputValue('customText', data.customColors.text);
                setColorInputValue('customEm', data.customColors.em);
                setColorInputValue('customHeader', data.customColors.header || data.customColors.line || data.customColors.headerText);
                setColorInputValue('customQuote1Bg', data.customColors.quote1Bg);
                setColorInputValue('customQuote1Text', data.customColors.quote1Text);
                setColorInputValue('customQuote2Bg', data.customColors.quote2Bg);
                setColorInputValue('customQuote2Text', data.customColors.quote2Text);
                setColorInputValue('customTagText', data.customColors.tagText || data.customColors.text);
                setColorInputValue('customDivider', data.customColors.divider || data.customColors.tagText || data.customColors.text);
            }

            pages = data.pages || [];
            pages = pages.map(function (item) {
                if (!item.itemType) item.itemType = 'page';
                if (item.itemType === 'page') item.collapsed = false;
                if (item.content) item.content = migrateLocalImagesInText(item.content);
                if (item.image) item.image = migrateLocalImageValue(item.image);
                if (item.bgImage) item.bgImage = migrateLocalImageValue(item.bgImage);
                if (item.headerImage) item.headerImage = migrateLocalImageValue(item.headerImage);
                if (item.itemType === 'page' && (item.imageWidth === undefined || item.imageWidth === null)) {
                    item.imageWidth = 100;
                }
                return item;
            });

            if (data.tags && data.tags.length > 0) {
                tags = JSON.parse(JSON.stringify(data.tags));
            } else {
                tags = JSON.parse(JSON.stringify(DEFAULT_TAGS));
            }
            while (tags.length < 3) {
                tags.push(JSON.parse(JSON.stringify(DEFAULT_TAGS[tags.length])));
            }

            replacements = data.replacements || [];
            customThemes = data.customThemes || [];

            if (data.textSpacing) {
                textSpacing = { ...textSpacing, ...data.textSpacing };
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

                if (textSizeInput) textSizeInput.value = textSpacing.fontSize;
                if (textSizeSlider) textSizeSlider.value = textSpacing.fontSize;
                if (lineHeightInput) lineHeightInput.value = textSpacing.lineHeight;
                if (lineHeightSlider) lineHeightSlider.value = textSpacing.lineHeight;
                if (letterSpacingInput) letterSpacingInput.value = textSpacing.letterSpacing;
                if (letterSpacingSlider) letterSpacingSlider.value = textSpacing.letterSpacing;
                if (paragraphSpacingInput) paragraphSpacingInput.value = textSpacing.paragraphSpacing;
                if (paragraphSpacingSlider) paragraphSpacingSlider.value = textSpacing.paragraphSpacing;
                if (textIndentInput) textIndentInput.value = textSpacing.textIndent;
                if (textIndentSlider) textIndentSlider.value = textSpacing.textIndent;

                const _sd = document.getElementById('textSizeDisplay'); if (_sd) _sd.textContent = textSpacing.fontSize.toFixed(1) + 'px';
                const _lhd = document.getElementById('lineHeightDisplay'); if (_lhd) _lhd.textContent = textSpacing.lineHeight.toFixed(2);
                const _lsd = document.getElementById('letterSpacingDisplay'); if (_lsd) _lsd.textContent = textSpacing.letterSpacing.toFixed(1) + 'px';
                const _psd = document.getElementById('paragraphSpacingDisplay'); if (_psd) _psd.textContent = textSpacing.paragraphSpacing + 'px';
                const _tid = document.getElementById('textIndentDisplay'); if (_tid) _tid.textContent = textSpacing.textIndent + 'px';
            } else {
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
            }

            if (data.fontFamily) {
                fontFamily = data.fontFamily;
                const fontFamilyEl = document.getElementById('fontFamily');
                if (fontFamilyEl) fontFamilyEl.value = fontFamily;
            }

            if (data.headingFontSizes) {
                headingFontSizes = { ...headingFontSizes, ...data.headingFontSizes };
                const map = {
                    coverTitle:      { slider: 'coverTitleSizeSlider',      input: 'coverTitleSizeInput',      display: 'coverTitleSizeDisplay' },
                    coverSubtitle:   { slider: 'coverSubtitleSizeSlider',   input: 'coverSubtitleSizeInput',   display: 'coverSubtitleSizeDisplay' },
                    sectionTitle:    { slider: 'sectionTitleSizeSlider',    input: 'sectionTitleSizeInput',    display: 'sectionTitleSizeDisplay' },
                    sectionSubtitle: { slider: 'sectionSubtitleSizeSlider', input: 'sectionSubtitleSizeInput', display: 'sectionSubtitleSizeDisplay' },
                    pageHeaderNum:   { slider: 'pageHeaderNumSizeSlider',   input: 'pageHeaderNumSizeInput',   display: 'pageHeaderNumSizeDisplay' },
                    pageHeaderTitle: { slider: 'pageHeaderTitleSizeSlider', input: 'pageHeaderTitleSizeInput', display: 'pageHeaderTitleSizeDisplay' },
                };
                Object.keys(headingFontSizes).forEach(k => {
                    if (!map[k]) return;
                    const sl = document.getElementById(map[k].slider);
                    const inp = document.getElementById(map[k].input);
                    const dsp = document.getElementById(map[k].display);
                    if (sl) sl.value = headingFontSizes[k];
                    if (inp) inp.value = headingFontSizes[k];
                    if (dsp) dsp.textContent = headingFontSizes[k] + 'px';
                });
            }

            if (data.globalTheme) {
                globalTheme = data.globalTheme;
                const globalThemeEl = document.getElementById('globalTheme');
                if (globalThemeEl) globalThemeEl.value = globalTheme;
            }

            if (data.hidePageNumbers !== undefined) {
                hidePageNumbers = data.hidePageNumbers;
                const hidePageNumbersEl = document.getElementById('hidePageNumbers');
                if (hidePageNumbersEl) hidePageNumbersEl.checked = hidePageNumbers;
            }

            enablePageFold = data.enablePageFold !== undefined ? data.enablePageFold : true;
            const enablePageFoldEl = document.getElementById('enablePageFold');
            if (enablePageFoldEl) enablePageFoldEl.checked = enablePageFold;

            showHeaderWhenFoldOff = data.showHeaderWhenFoldOff || false;
            const shEl = document.getElementById('showHeaderWhenFoldOff');
            if (shEl) shEl.checked = showHeaderWhenFoldOff;

            dividerStyle = data.dividerStyle || 'line';
            dividerCustomText = data.dividerCustomText || '';
            const dsEl = document.getElementById('dividerStyle');
            const dcEl = document.getElementById('dividerCustomText');
            if (dsEl) dsEl.value = dividerStyle;
            if (dcEl) { dcEl.value = dividerCustomText; dcEl.style.display = dividerStyle === 'custom' ? 'block' : 'none'; }

            if (data.profiles && data.profiles.length > 0) {
                profiles = JSON.parse(JSON.stringify(data.profiles));
                profiles = profiles.map(function (profile) {
                    profile.imageUrl = migrateLocalImageValue(profile.imageUrl);
                    return profile;
                });
            } else {
                if (data.userName || data.charName) {
                    profiles = [
                        {
                            name: data.userName || 'User',
                            imageUrl: data.userImageUrl || '',
                            focusX: data.userFocusX !== undefined ? data.userFocusX : 50,
                            focusY: data.userFocusY !== undefined ? data.userFocusY : 30,
                            desc: data.userDesc || '',
                            tag: data.userProfileTag || '',
                            color: ''
                        },
                        {
                            name: data.charName || 'Char',
                            imageUrl: data.charImageUrl || '',
                            focusX: data.charFocusX !== undefined ? data.charFocusX : 50,
                            focusY: data.charFocusY !== undefined ? data.charFocusY : 30,
                            desc: data.charDesc || '',
                            tag: data.charProfileTag || '',
                            color: ''
                        }
                    ];
                } else {
                    profiles = [];
                }
            }

            const enableTags = document.getElementById('enableTags');
            const tagsInputs = document.getElementById('tagsInputs');
            if (tagsInputs && enableTags) {
                tagsInputs.style.display = enableTags.checked ? 'block' : 'none';
            }

            updateTagsList();
            updateReplacementsList();
            updatePagesList();
            updateCustomThemesList();
            updateProfilesList();
        } else {
            loadDefaultSettings();
        }
    } catch (e) {
        console.error('Failed to load from storage:', e);
        loadDefaultSettings();
    }
}

function loadDefaultSettings() {
    editorTitle = '';

    const useRoundedQuotes = document.getElementById('useRoundedQuotes');
    const useTextIndent = document.getElementById('useTextIndent');
    if (useRoundedQuotes) useRoundedQuotes.checked = true;
    if (useTextIndent) useTextIndent.checked = false;
    const preserveLineBreaks = document.getElementById('preserveLineBreaks');
    if (preserveLineBreaks) preserveLineBreaks.checked = false;

    const coverImage = document.getElementById('coverImage');
    const coverZoom = document.getElementById('coverZoom');
    const coverFocusX = document.getElementById('coverFocusX');
    const coverFocusY = document.getElementById('coverFocusY');
    const coverArchiveNo = document.getElementById('coverArchiveNo');
    const coverTitle = document.getElementById('coverTitle');
    const coverSubtitle = document.getElementById('coverSubtitle');
    const coverZoomValue = document.getElementById('coverZoomValue');
    const coverFocusXValue = document.getElementById('coverFocusXValue');
    const coverFocusYValue = document.getElementById('coverFocusYValue');

    if (coverImage) coverImage.value = 'DefaultCover.png';
    if (coverZoom) coverZoom.value = 120;
    if (coverFocusX) coverFocusX.value = 50;
    if (coverFocusY) coverFocusY.value = 30;
    if (coverArchiveNo) coverArchiveNo.value = 'ARCHIVE NO.001';
    if (coverTitle) coverTitle.value = 'Yuzu';
    if (coverSubtitle) coverSubtitle.value = '귀여운 고양이 메이드';
    if (coverZoomValue) coverZoomValue.textContent = '120%';
    if (coverFocusXValue) coverFocusXValue.textContent = '50%';
    if (coverFocusYValue) coverFocusYValue.textContent = '30%';

    profiles = [
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
    ];

    const summaryText = document.getElementById('summaryText');
    if (summaryText) summaryText.value = '';

    const enableTags = document.getElementById('enableTags');
    const tagsInputs = document.getElementById('tagsInputs');
    if (enableTags) enableTags.checked = true;
    if (tagsInputs) tagsInputs.style.display = 'block';
    tags = [
        { name: 'Bot', value: 'Bot', link: '' },
        { name: 'Model', value: 'Model', link: '' },
        { name: 'Prompt', value: 'Prompt', link: '' },
        { name: 'Language', value: 'Eng', link: '' }
    ];

    const topTheme = document.getElementById('topTheme');
    if (topTheme) topTheme.value = 'basic';

    setColorInputValue('customBg', '#ffffff');
    setColorInputValue('customText', '#2c3e50');
    setColorInputValue('customEm', '#2d5af0');
    setColorInputValue('customHeader', '#162a3e');
    setColorInputValue('customQuote1Bg', '#f0f2f5');
    setColorInputValue('customQuote1Text', '#2c3e50');
    setColorInputValue('customQuote2Bg', '#f0f2f5');
    setColorInputValue('customQuote2Text', '#162a3e');
    setColorInputValue('customTagText', '#6c8da8');
    setColorInputValue('customDivider', '#c8d6e0');

    pages = [
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
    ];

    replacements = [{ from: '', to: '' }];
    customThemes = [];

    textSpacing = {
        fontSize: 14.2,
        lineHeight: 1.7,
        letterSpacing: -0.5,
        paragraphSpacing: 10,
        textIndent: 0
    };

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

    fontFamily = 'Noto Serif KR';
    const fontFamilySelect = document.getElementById('fontFamily');
    if (fontFamilySelect) fontFamilySelect.value = fontFamily;

    updateTagsList();
    updateReplacementsList();
    updatePagesList();
    updateCustomThemesList();
    updateProfilesList();
    updatePreview();
}

function collectEditorData(extraData) {
    return {
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
            version: '1.0'
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
            const data = JSON.parse(e.target.result);

            if (!data || typeof data !== 'object') {
                throw new Error('유효하지 않은 데이터 형식입니다.');
            }

            if (!confirm('현재 작업 중인 데이터가 모두 사라집니다. 불러오시겠습니까?')) return;

            editorTitle = data.editorTitle || '';

            if (data.useRoundedQuotes !== undefined) document.getElementById('useRoundedQuotes').checked = data.useRoundedQuotes;
            if (data.useTextIndent !== undefined) document.getElementById('useTextIndent').checked = data.useTextIndent;
            if (data.preserveLineBreaks !== undefined) document.getElementById('preserveLineBreaks').checked = data.preserveLineBreaks;
            if (data.coverImage !== undefined) document.getElementById('coverImage').value = data.coverImage;
            if (data.coverAutoFit !== undefined) {
                document.getElementById('coverAutoFit').checked = data.coverAutoFit;
                const coverManualControls = document.getElementById('coverManualControls');
                if (coverManualControls) coverManualControls.style.display = data.coverAutoFit ? 'none' : 'block';
            }
            if (data.coverZoom !== undefined) {
                document.getElementById('coverZoom').value = data.coverZoom;
                document.getElementById('coverZoomValue').textContent = data.coverZoom + '%';
            }
            if (data.coverFocusX !== undefined) {
                document.getElementById('coverFocusX').value = data.coverFocusX;
                document.getElementById('coverFocusXValue').textContent = data.coverFocusX + '%';
            }
            if (data.coverFocusY !== undefined) {
                document.getElementById('coverFocusY').value = data.coverFocusY;
                document.getElementById('coverFocusYValue').textContent = data.coverFocusY + '%';
            }
            if (data.coverArchiveNo !== undefined) document.getElementById('coverArchiveNo').value = data.coverArchiveNo;
            if (data.coverTitle !== undefined) document.getElementById('coverTitle').value = data.coverTitle;
            if (data.coverSubtitle !== undefined) document.getElementById('coverSubtitle').value = data.coverSubtitle;
            if (data.summaryText !== undefined) document.getElementById('summaryText').value = data.summaryText;
            if (data.enableComment !== undefined) {
                document.getElementById('enableComment').checked = data.enableComment;
                document.getElementById('commentContent').style.display = data.enableComment ? 'block' : 'none';
            }
            if (data.commentText !== undefined) document.getElementById('commentText').value = data.commentText;
            if (data.commentNickname !== undefined) document.getElementById('commentNickname').value = data.commentNickname;
            if (data.enableTags !== undefined) {
                document.getElementById('enableTags').checked = data.enableTags;
                document.getElementById('tagsInputs').style.display = data.enableTags ? 'block' : 'none';
            }

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

            localImages = data.localImages || {};

            if (data.pages) {
                pages = data.pages.map(function (item) {
                    if (item.content) item.content = migrateLocalImagesInText(item.content);
                    if (item.image) item.image = migrateLocalImageValue(item.image);
                    if (item.bgImage) item.bgImage = migrateLocalImageValue(item.bgImage);
                    if (item.headerImage) item.headerImage = migrateLocalImageValue(item.headerImage);
                    return item;
                });
            }
            if (data.tags) tags = data.tags;
            if (data.replacements) replacements = data.replacements;
            if (data.customThemes) customThemes = data.customThemes;
            if (data.profiles) {
                profiles = data.profiles.map(function (profile) {
                    profile.imageUrl = migrateLocalImageValue(profile.imageUrl);
                    return profile;
                });
            }

            if (data.textSpacing) {
                textSpacing = { ...textSpacing, ...data.textSpacing };
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

                if (textSizeInput) textSizeInput.value = textSpacing.fontSize;
                if (textSizeSlider) textSizeSlider.value = textSpacing.fontSize;
                if (lineHeightInput) lineHeightInput.value = textSpacing.lineHeight;
                if (lineHeightSlider) lineHeightSlider.value = textSpacing.lineHeight;
                if (letterSpacingInput) letterSpacingInput.value = textSpacing.letterSpacing;
                if (letterSpacingSlider) letterSpacingSlider.value = textSpacing.letterSpacing;
                if (paragraphSpacingInput) paragraphSpacingInput.value = textSpacing.paragraphSpacing;
                if (paragraphSpacingSlider) paragraphSpacingSlider.value = textSpacing.paragraphSpacing;
                if (textIndentInput) textIndentInput.value = textSpacing.textIndent;
                if (textIndentSlider) textIndentSlider.value = textSpacing.textIndent;
            }

            if (data.fontFamily) {
                fontFamily = data.fontFamily;
                document.getElementById('fontFamily').value = fontFamily;
            }

            if (data.headingFontSizes) {
                headingFontSizes = { ...headingFontSizes, ...data.headingFontSizes };
                const _hmap = {
                    coverArchiveNo:  { slider: 'coverArchiveNoSizeSlider',  input: 'coverArchiveNoSizeInput',  display: 'coverArchiveNoSizeDisplay' },
                    coverTitle:      { slider: 'coverTitleSizeSlider',      input: 'coverTitleSizeInput',      display: 'coverTitleSizeDisplay' },
                    coverSubtitle:   { slider: 'coverSubtitleSizeSlider',   input: 'coverSubtitleSizeInput',   display: 'coverSubtitleSizeDisplay' },
                    coverTag:        { slider: 'coverTagSizeSlider',        input: 'coverTagSizeInput',        display: 'coverTagSizeDisplay' },
                    sectionTitle:    { slider: 'sectionTitleSizeSlider',    input: 'sectionTitleSizeInput',    display: 'sectionTitleSizeDisplay' },
                    sectionSubtitle: { slider: 'sectionSubtitleSizeSlider', input: 'sectionSubtitleSizeInput', display: 'sectionSubtitleSizeDisplay' },
                    pageHeaderNum:   { slider: 'pageHeaderNumSizeSlider',   input: 'pageHeaderNumSizeInput',   display: 'pageHeaderNumSizeDisplay' },
                    pageHeaderTitle: { slider: 'pageHeaderTitleSizeSlider', input: 'pageHeaderTitleSizeInput', display: 'pageHeaderTitleSizeDisplay' },
                };
                Object.keys(headingFontSizes).forEach(k => {
                    if (!_hmap[k]) return;
                    const sl = document.getElementById(_hmap[k].slider);
                    const inp = document.getElementById(_hmap[k].input);
                    const dsp = document.getElementById(_hmap[k].display);
                    if (sl) sl.value = headingFontSizes[k];
                    if (inp) inp.value = headingFontSizes[k];
                    if (dsp) dsp.textContent = headingFontSizes[k] + 'px';
                });
            }

            if (data.globalTheme) {
                globalTheme = data.globalTheme;
                document.getElementById('globalTheme').value = globalTheme;
            }

            if (data.hidePageNumbers !== undefined) {
                hidePageNumbers = data.hidePageNumbers;
                document.getElementById('hidePageNumbers').checked = hidePageNumbers;
            }

            enablePageFold = data.enablePageFold !== undefined ? data.enablePageFold : true;
            const importEnablePageFoldEl = document.getElementById('enablePageFold');
            if (importEnablePageFoldEl) importEnablePageFoldEl.checked = enablePageFold;

            showHeaderWhenFoldOff = data.showHeaderWhenFoldOff || false;
            const importShEl = document.getElementById('showHeaderWhenFoldOff');
            if (importShEl) importShEl.checked = showHeaderWhenFoldOff;

            dividerStyle = data.dividerStyle || 'line';
            dividerCustomText = data.dividerCustomText || '';
            const importDsEl = document.getElementById('dividerStyle');
            const importDcEl = document.getElementById('dividerCustomText');
            if (importDsEl) importDsEl.value = dividerStyle;
            if (importDcEl) { importDcEl.value = dividerCustomText; importDcEl.style.display = dividerStyle === 'custom' ? 'block' : 'none'; }

            if (data.presets && typeof data.presets === 'object') {
                localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(data.presets));
                loadPresets();
            }

            updateTagsList();
            updateReplacementsList();
            updatePagesList();
            updateCustomThemesList();
            updateProfilesList();
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
