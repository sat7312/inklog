// 전역 상태
let pages = [];
let tags = [];
let replacements = [];
let customThemes = [];
let profiles = [];
let currentEditingIndex = null;
let tempPageTags = [];
let globalTheme = 'basic';
let hidePageNumbers = false;
let enablePageFold = true;
let showHeaderWhenFoldOff = false;
let dividerStyle = 'line';
let dividerCustomText = '';
let localImages = {};

let textSpacing = {
    fontSize: 14.2,
    lineHeight: 1.7,
    letterSpacing: -0.5,
    paragraphSpacing: 10,
    textIndent: 0
};

let headingFontSizes = {
    coverArchiveNo: 11,
    coverTitle: 42,
    coverSubtitle: 14,
    coverTag: 11,
    sectionTitle: 20,
    sectionSubtitle: 11,
    pageHeaderNum: 40,
    pageHeaderTitle: 15,
};

let fontFamily = 'Pretendard';

// LocalStorage 키
const PRESET_STORAGE_KEY = 'rpLogEditorPresets';

// 기본 태그 (4개) - 영문명으로 변경
const DEFAULT_TAGS = [
    { name: 'Bot', value: 'Bot', link: '' },
    { name: 'Model', value: 'Model', link: '' },
    { name: 'Prompt', value: 'Prompt', link: '' },
    { name: 'Language', value: 'Eng', link: '' }
];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    try {
        setupThemeToggle();
        setupSoundToggle();
        setupCreditModal();
        loadFromStorage();
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

// 탭 네비게이션 설정 함수
function setupTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const targetId = this.getAttribute('data-tab');

            // 1. 모든 탭 버튼 활성화 해제
            navItems.forEach(nav => nav.classList.remove('active'));

            // 2. 클릭한 탭 버튼 활성화
            this.classList.add('active');

            // 3. 모든 컨텐츠 숨김
            tabContents.forEach(content => content.classList.remove('active'));

            // 4. 타겟 컨텐츠 표시
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // 5. 모바일에서 프리뷰가 열려있으면 닫기
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
                if (toggleBtn) {
                    toggleBtn.title = '미리보기 보기';
                }
            }

            updatePreview();
        });
    });
}

// LocalStorage 로드
function loadFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            localImages = data.localImages || {};
            data.coverImage = migrateLocalImageValue(data.coverImage);

            // null 체크를 추가한 안전한 요소 설정
            const useRoundedQuotes = document.getElementById('useRoundedQuotes');
            const useTextIndent = document.getElementById('useTextIndent');
            const enableCover = document.getElementById('enableCover');
            const coverImage = document.getElementById('coverImage');
            const coverZoom = document.getElementById('coverZoom');
            const coverFocusX = document.getElementById('coverFocusX');
            const coverFocusY = document.getElementById('coverFocusY');
            const coverAutoFit = document.getElementById('coverAutoFit');
            const coverArchiveNo = document.getElementById('coverArchiveNo');
            const coverTitle = document.getElementById('coverTitle');
            const coverSubtitle = document.getElementById('coverSubtitle');
            const coverContent = document.getElementById('coverContent');

            if (useRoundedQuotes) useRoundedQuotes.checked = data.useRoundedQuotes || false;
            if (useTextIndent) useTextIndent.checked = data.useTextIndent || false;
            const preserveLineBreaks = document.getElementById('preserveLineBreaks');
            if (preserveLineBreaks) preserveLineBreaks.checked = data.preserveLineBreaks || false;

            // 표지 관련 설정 로드
            if (enableCover) enableCover.checked = data.enableCover || false;
            if (coverImage) coverImage.value = data.coverImage || '';
            if (coverAutoFit) coverAutoFit.checked = data.coverAutoFit || false;
            if (coverZoom) coverZoom.value = data.coverZoom || 120;
            if (coverFocusX) coverFocusX.value = data.coverFocusX || 50;
            if (coverFocusY) coverFocusY.value = data.coverFocusY || 28;
            if (coverArchiveNo) coverArchiveNo.value = data.coverArchiveNo || 'ARCHIVE NO.001';
            if (coverTitle) coverTitle.value = data.coverTitle || '';
            if (coverSubtitle) coverSubtitle.value = data.coverSubtitle || '';
            if (coverContent) coverContent.style.display = data.enableCover ? 'block' : 'none';

            // 자동 크기 조절 상태에 따라 수동 컨트롤 표시/숨김
            const coverManualControls = document.getElementById('coverManualControls');
            if (coverManualControls) {
                coverManualControls.style.display = (data.coverAutoFit) ? 'none' : 'block';
            }

            // Focus 값 표시 업데이트
            const coverZoomValue = document.getElementById('coverZoomValue');
            const coverFocusXValue = document.getElementById('coverFocusXValue');
            const coverFocusYValue = document.getElementById('coverFocusYValue');
            const enableProfilesEl = document.getElementById('enableProfiles');
            const summaryText = document.getElementById('summaryText');
            const enableCommentEl = document.getElementById('enableComment');
            const commentText = document.getElementById('commentText');
            const commentNickname = document.getElementById('commentNickname');
            const commentContent = document.getElementById('commentContent');
            const enableTagsEl = document.getElementById('enableTags');

            if (coverZoomValue) coverZoomValue.textContent = (data.coverZoom || 120) + '%';
            if (coverFocusXValue) coverFocusXValue.textContent = (data.coverFocusX || 50) + '%';
            if (coverFocusYValue) coverFocusYValue.textContent = (data.coverFocusY || 28) + '%';

            if (enableProfilesEl) enableProfilesEl.checked = data.enableProfiles || false;
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
                // 하위 호환성: line과 headerText가 있으면 header로 통합
                setColorInputValue('customHeader', data.customColors.header || data.customColors.line || data.customColors.headerText);
                setColorInputValue('customQuote1Bg', data.customColors.quote1Bg);
                setColorInputValue('customQuote1Text', data.customColors.quote1Text);
                setColorInputValue('customQuote2Bg', data.customColors.quote2Bg);
                setColorInputValue('customQuote2Text', data.customColors.quote2Text);
                setColorInputValue('customTagText', data.customColors.tagText || data.customColors.text);
                setColorInputValue('customDivider', data.customColors.divider || data.customColors.tagText || data.customColors.text);
            }

            pages = data.pages || [];

            // 기존 데이터 마이그레이션: itemType이 없는 항목은 'page'로 설정
            pages = pages.map(function (item) {
                if (!item.itemType) {
                    item.itemType = 'page';
                }
                if (item.content) {
                    item.content = migrateLocalImagesInText(item.content);
                }
                if (item.image) {
                    item.image = migrateLocalImageValue(item.image);
                }
                if (item.bgImage) {
                    item.bgImage = migrateLocalImageValue(item.bgImage);
                }
                if (item.headerImage) {
                    item.headerImage = migrateLocalImageValue(item.headerImage);
                }
                // imageWidth가 없는 페이지는 기본값 100으로 설정
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

            // 텍스트 간격 설정 로드 (요소가 있을 때만)
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
                // display 업데이트
                const _sd = document.getElementById('textSizeDisplay'); if (_sd) _sd.textContent = textSpacing.fontSize.toFixed(1) + 'px';
                const _lhd = document.getElementById('lineHeightDisplay'); if (_lhd) _lhd.textContent = textSpacing.lineHeight.toFixed(2);
                const _lsd = document.getElementById('letterSpacingDisplay'); if (_lsd) _lsd.textContent = textSpacing.letterSpacing.toFixed(1) + 'px';
                const _psd = document.getElementById('paragraphSpacingDisplay'); if (_psd) _psd.textContent = textSpacing.paragraphSpacing + 'px';
                const _tid = document.getElementById('textIndentDisplay'); if (_tid) _tid.textContent = textSpacing.textIndent + 'px';
            } else {
                // 기본값 설정 (요소가 있을 때만)
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

            // 폰트 설정 로드
            if (data.fontFamily) {
                fontFamily = data.fontFamily;
                const fontFamilyEl = document.getElementById('fontFamily');
                if (fontFamilyEl) fontFamilyEl.value = fontFamily;
            }

            // 제목 크기 설정 로드
            if (data.headingFontSizes) {
                headingFontSizes = { ...headingFontSizes, ...data.headingFontSizes };
                // UI는 setupHeadingControl에서 초기화되므로 여기서는 값만 동기화
                Object.keys(headingFontSizes).forEach(k => {
                    const map = {
                        coverTitle:      { slider: 'coverTitleSizeSlider',      input: 'coverTitleSizeInput',      display: 'coverTitleSizeDisplay' },
                        coverSubtitle:   { slider: 'coverSubtitleSizeSlider',   input: 'coverSubtitleSizeInput',   display: 'coverSubtitleSizeDisplay' },
                        sectionTitle:    { slider: 'sectionTitleSizeSlider',    input: 'sectionTitleSizeInput',    display: 'sectionTitleSizeDisplay' },
                        sectionSubtitle: { slider: 'sectionSubtitleSizeSlider', input: 'sectionSubtitleSizeInput', display: 'sectionSubtitleSizeDisplay' },
                        pageHeaderNum:   { slider: 'pageHeaderNumSizeSlider',   input: 'pageHeaderNumSizeInput',   display: 'pageHeaderNumSizeDisplay' },
                        pageHeaderTitle: { slider: 'pageHeaderTitleSizeSlider', input: 'pageHeaderTitleSizeInput', display: 'pageHeaderTitleSizeDisplay' },
                    };
                    if (!map[k]) return;
                    const sl = document.getElementById(map[k].slider);
                    const inp = document.getElementById(map[k].input);
                    const dsp = document.getElementById(map[k].display);
                    if (sl) sl.value = headingFontSizes[k];
                    if (inp) inp.value = headingFontSizes[k];
                    if (dsp) dsp.textContent = headingFontSizes[k] + 'px';
                });
            }

            // 전역 테마 설정 로드
            if (data.globalTheme) {
                globalTheme = data.globalTheme;
                const globalThemeEl = document.getElementById('globalTheme');
                if (globalThemeEl) globalThemeEl.value = globalTheme;
            }

            // 페이지 번호 숨김 설정 로드
            if (data.hidePageNumbers !== undefined) {
                hidePageNumbers = data.hidePageNumbers;
                const hidePageNumbersEl = document.getElementById('hidePageNumbers');
                if (hidePageNumbersEl) hidePageNumbersEl.checked = hidePageNumbers;
            }

            // 페이지 접기 설정 로드
            if (data.enablePageFold !== undefined) {
                enablePageFold = data.enablePageFold;
            } else {
                enablePageFold = true; // 기본값: 켜짐
            }
            const enablePageFoldEl = document.getElementById('enablePageFold');
            if (enablePageFoldEl) enablePageFoldEl.checked = enablePageFold;

            showHeaderWhenFoldOff = data.showHeaderWhenFoldOff || false;
            const shEl = document.getElementById('showHeaderWhenFoldOff');
            if (shEl) shEl.checked = showHeaderWhenFoldOff;

            dividerStyle = data.dividerStyle || 'line';
            dividerCustomText = data.dividerCustomText || '';
            const dsEl = document.getElementById('dividerStyle');
            const dcEl = document.getElementById('dividerCustomText');
            if (dsEl) { dsEl.value = dividerStyle; }
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
                            tag: data.userProfileTag || ''
                        },
                        {
                            name: data.charName || 'Char',
                            imageUrl: data.charImageUrl || '',
                            focusX: data.charFocusX !== undefined ? data.charFocusX : 50,
                            focusY: data.charFocusY !== undefined ? data.charFocusY : 30,
                            desc: data.charDesc || '',
                            tag: data.charProfileTag || ''
                        }
                    ];
                } else {
                    profiles = [];
                }
            }

            const enableProfiles = document.getElementById('enableProfiles');
            const profileInputs = document.getElementById('profileInputs');
            const enableTags = document.getElementById('enableTags');
            const tagsInputs = document.getElementById('tagsInputs');

            if (profiles.length > 0 && enableProfiles && !enableProfiles.checked) {
                enableProfiles.checked = true;
            }

            if (profileInputs && enableProfiles) {
                profileInputs.style.display = enableProfiles.checked ? 'block' : 'none';
            }
            if (tagsInputs && enableTags) {
                tagsInputs.style.display = enableTags.checked ? 'block' : 'none';
            }

            updateTagsList();
            updateReplacementsList();
            updatePagesList();
            updateCustomThemesList();
            updateProfilesList();
        } else {
            // 저장된 데이터가 없을 때: 초기값 설정
            loadDefaultSettings();
        }
    } catch (e) {
        console.error('Failed to load from storage:', e);
        loadDefaultSettings();
    }
}

// 초기값 설정 함수 (저장된 데이터가 없을 때만 실행됨)
function loadDefaultSettings() {
    // ===== 사용자 커스텀 초기값 =====

    // 기본 서식 설정
    const useRoundedQuotes = document.getElementById('useRoundedQuotes');
    const useTextIndent = document.getElementById('useTextIndent');
    if (useRoundedQuotes) useRoundedQuotes.checked = true;
    if (useTextIndent) useTextIndent.checked = false;
    const preserveLineBreaks = document.getElementById('preserveLineBreaks');
    if (preserveLineBreaks) preserveLineBreaks.checked = false;

    // 표지 설정
    const enableCover = document.getElementById('enableCover');
    const coverImage = document.getElementById('coverImage');
    const coverZoom = document.getElementById('coverZoom');
    const coverFocusX = document.getElementById('coverFocusX');
    const coverFocusY = document.getElementById('coverFocusY');
    const coverArchiveNo = document.getElementById('coverArchiveNo');
    const coverTitle = document.getElementById('coverTitle');
    const coverSubtitle = document.getElementById('coverSubtitle');
    const coverContent = document.getElementById('coverContent');
    const coverZoomValue = document.getElementById('coverZoomValue');
    const coverFocusXValue = document.getElementById('coverFocusXValue');
    const coverFocusYValue = document.getElementById('coverFocusYValue');
    
    if (enableCover) enableCover.checked = true;
    if (coverImage) coverImage.value = 'DefaultCover.png';
    if (coverZoom) coverZoom.value = 120;
    if (coverFocusX) coverFocusX.value = 50;
    if (coverFocusY) coverFocusY.value = 30;
    if (coverArchiveNo) coverArchiveNo.value = 'ARCHIVE NO.001';
    if (coverTitle) coverTitle.value = 'Yuzu';
    if (coverSubtitle) coverSubtitle.value = '귀여운 고양이 메이드';
    if (coverContent) coverContent.style.display = 'block';
    if (coverZoomValue) coverZoomValue.textContent = '120%';
    if (coverFocusXValue) coverFocusXValue.textContent = '50%';
    if (coverFocusYValue) coverFocusYValue.textContent = '30%';

    // 프로필 활성화
    const enableProfiles = document.getElementById('enableProfiles');
    const profileInputs = document.getElementById('profileInputs');
    if (enableProfiles) enableProfiles.checked = true;
    if (profileInputs) profileInputs.style.display = 'block';

    // 프로필 데이터
    profiles = [
        {
            name: 'Yuzu',
            imageUrl: 'DefaultProfile1.png',
            zoom: 100,
            focusX: 50,
            focusY: 30,
            desc: ' Profile 1 Description',
            tag: 'CHAR'
        },
        {
            name: 'Jong-won',
            imageUrl: 'DefaultProfile2.png',
            zoom: 100,
            focusX: 50,
            focusY: 10,
            desc: 'Profile 2 Description',
            tag: 'USER'
        }
    ];

    // 요약 텍스트
    const summaryText = document.getElementById('summaryText');
    if (summaryText) summaryText.value = '';

    // 태그 활성화
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

    // 테마 설정
    const topTheme = document.getElementById('topTheme');
    if (topTheme) topTheme.value = 'basic';

    // 커스텀 컬러 (basic 테마)
    setColorInputValue('customBg', '#ffffff');
    setColorInputValue('customText', '#2c3e50');
    setColorInputValue('customEm', '#2d5af0');
    setColorInputValue('customLine', '#2c3e50');
    setColorInputValue('customHeaderText', '#162a3e');
    setColorInputValue('customQuote1Bg', '#f0f2f5');
    setColorInputValue('customQuote1Text', '#2c3e50');
    setColorInputValue('customQuote2Bg', '#f0f2f5');
    setColorInputValue('customQuote2Text', '#162a3e');
    setColorInputValue('customTagText', '#6c8da8');
    setColorInputValue('customDivider', '#c8d6e0');

    // 페이지 데이터
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

    // 치환 규칙
    replacements = [{ from: '', to: '' }];

    // 커스텀 테마
    customThemes = [];

    // 텍스트 간격 설정
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

    // 폰트 설정
    fontFamily = 'Noto Serif KR';
    const fontFamilySelect = document.getElementById('fontFamily');
    if (fontFamilySelect) fontFamilySelect.value = fontFamily;

    // UI 업데이트
    updateTagsList();
    updateReplacementsList();
    updatePagesList();
    updateCustomThemesList();
    updateProfilesList();

    // 초기 미리보기 업데이트
    updatePreview();
}

function setColorInputValue(baseId, value) {
    const colorInput = document.getElementById(baseId);
    const textInput = document.getElementById(baseId + 'Text');
    if (colorInput) colorInput.value = value;
    if (textInput) textInput.value = value;
}

function getColorValue(baseId) {
    const colorInput = document.getElementById(baseId);
    return colorInput ? colorInput.value : '#000000';
}

function getCheckedValue(id, defaultValue) {
    const el = document.getElementById(id);
    return el ? el.checked : !!defaultValue;
}

function getInputValue(id, defaultValue) {
    const el = document.getElementById(id);
    return el ? el.value : (defaultValue || '');
}

function getIntInputValue(id, defaultValue) {
    const value = parseInt(getInputValue(id, defaultValue), 10);
    return Number.isNaN(value) ? defaultValue : value;
}

function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = function () { reject(reader.error || new Error('이미지를 읽을 수 없습니다.')); };
        reader.readAsDataURL(file);
    });
}

function loadImageFromDataUrl(dataUrl) {
    return new Promise(function (resolve, reject) {
        const image = new Image();
        image.onload = function () { resolve(image); };
        image.onerror = function () { reject(new Error('이미지를 불러올 수 없습니다.')); };
        image.src = dataUrl;
    });
}

async function prepareLocalImage(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) {
        throw new Error('이미지 파일을 선택해주세요.');
    }

    const dataUrl = await readFileAsDataUrl(file);
    if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
        return dataUrl;
    }

    const image = await loadImageFromDataUrl(dataUrl);
    const maxSize = 1600;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', 0.86);
}

function selectLocalImage(onSelect) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', async function () {
        const file = input.files && input.files[0];
        if (!file) return;
        try {
            const dataUrl = await prepareLocalImage(file);
            onSelect(dataUrl, file);
        } catch (error) {
            showNotification(error.message);
        }
    });
    input.click();
}

function insertAtCursor(textarea, value) {
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || start;
    const text = textarea.value;
    textarea.value = text.slice(0, start) + value + text.slice(end);
    const nextPos = start + value.length;
    textarea.focus();
    textarea.setSelectionRange(nextPos, nextPos);
}

function createLocalImageRef(dataUrl, file) {
    const id = 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    localImages[id] = {
        dataUrl: dataUrl,
        name: file && file.name ? file.name : '',
        createdAt: new Date().toISOString()
    };
    return 'local:' + id;
}

function migrateLocalImageValue(value) {
    if (typeof value === 'string' && value.startsWith('data:image/')) {
        return createLocalImageRef(value);
    }
    return value;
}

function migrateLocalImagesInText(text) {
    if (typeof text !== 'string' || !text.includes('[IMG:data:image/')) {
        return text;
    }
    return text.replace(/\[IMG:(data:image\/[^\]]+?)\]/g, function (match, dataUrl) {
        return '[IMG:' + createLocalImageRef(dataUrl) + ']';
    });
}

function getProfileCharacters() {
    return profiles.map(function (profile) {
        return {
            name: profile.name || '',
            role: profile.tag || '',
            image: profile.imageUrl || '',
            description: profile.desc || ''
        };
    });
}

function collectEditorData(extraData) {
    return {
        useRoundedQuotes: getCheckedValue('useRoundedQuotes'),
        useTextIndent: getCheckedValue('useTextIndent'),
        preserveLineBreaks: getCheckedValue('preserveLineBreaks'),
        enableTopSection: true,
        enableCover: getCheckedValue('enableCover'),
        coverImage: getInputValue('coverImage'),
        coverAutoFit: getCheckedValue('coverAutoFit'),
        coverZoom: getIntInputValue('coverZoom', 120),
        coverFocusX: getIntInputValue('coverFocusX', 50),
        coverFocusY: getIntInputValue('coverFocusY', 30),
        coverArchiveNo: getInputValue('coverArchiveNo'),
        coverTitle: getInputValue('coverTitle'),
        coverSubtitle: getInputValue('coverSubtitle'),
        enableProfiles: getCheckedValue('enableProfiles'),
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

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collectEditorData()));
    } catch (e) {
        console.error('Failed to save to storage:', e);
    }
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

    // 표지 Focus 슬라이더 이벤트
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

    // 표지 자동 크기 조절 체크박스
    const coverAutoFit = document.getElementById('coverAutoFit');
    if (coverAutoFit) {
        coverAutoFit.addEventListener('change', function () {
            const coverManualControls = document.getElementById('coverManualControls');
            if (coverManualControls) {
                coverManualControls.style.display = this.checked ? 'none' : 'block';
            }
            updatePreview();
            saveToStorage();
        });
    }

    // 표지 활성화 체크박스
    const enableCover = document.getElementById('enableCover');
    if (enableCover) {
        enableCover.addEventListener('change', function () {
            const coverContent = document.getElementById('coverContent');
            if (coverContent) coverContent.style.display = this.checked ? 'block' : 'none';
            updatePreview();
            saveToStorage();
        });
    }

    // globalTheme 변경 시 커스텀 색상에도 반영
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

    // hidePageNumbers 체크박스 이벤트
    const hidePageNumbersEl = document.getElementById('hidePageNumbers');
    if (hidePageNumbersEl) {
        hidePageNumbersEl.addEventListener('change', function () {
            hidePageNumbers = hidePageNumbersEl.checked;
            updatePreview();
            saveToStorage();
        });
    }

    // enablePageFold 체크박스 이벤트
    const enablePageFoldEl = document.getElementById('enablePageFold');
    if (enablePageFoldEl) {
        enablePageFoldEl.addEventListener('change', function () {
            enablePageFold = enablePageFoldEl.checked;
            updatePreview();
            saveToStorage();
        });
    }

    // showHeaderWhenFoldOff 체크박스 이벤트
    const showHeaderWhenFoldOffEl = document.getElementById('showHeaderWhenFoldOff');
    if (showHeaderWhenFoldOffEl) {
        showHeaderWhenFoldOffEl.addEventListener('change', function () {
            showHeaderWhenFoldOff = showHeaderWhenFoldOffEl.checked;
            updatePreview();
            saveToStorage();
        });
    }

    // dividerStyle 드롭다운 이벤트
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

    const checkboxIds = ['useRoundedQuotes', 'useTextIndent', 'preserveLineBreaks', 'enableProfiles', 'enableTags', 'enableCover', 'enableComment'];
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

    const enableProfiles = document.getElementById('enableProfiles');
    if (enableProfiles) {
        enableProfiles.addEventListener('change', function () {
            document.getElementById('profileInputs').style.display =
                enableProfiles.checked ? 'block' : 'none';
        });
    }

    const enableTags = document.getElementById('enableTags');
    if (enableTags) {
        enableTags.addEventListener('change', function () {
            document.getElementById('tagsInputs').style.display =
                enableTags.checked ? 'block' : 'none';
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
            currentEditingIndex = null;
            document.getElementById('pageTitle').value = '';
            document.getElementById('pageSubtitle').value = '';
            document.getElementById('pageContent').value = '';

            tempPageTags = [];

            const pageModal = document.getElementById('pageModal');
            pageModal.style.display = 'block';
            
            // 페이지 통계 초기화
            updatePageStats();
            
            // 모바일에서 모달과 body를 맨 위로 스크롤
            setTimeout(function() {
                pageModal.scrollTop = 0;
                const modalBody = pageModal.querySelector('.modal-body');
                if (modalBody) modalBody.scrollTop = 0;
            }, 50);
        });
    }

    // NEW SECTION 버튼 이벤트
    const addSectionBtn = document.getElementById('addSection');
    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', function () {
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
            
            // 모바일에서 모달과 body를 맨 위로 스크롤
            setTimeout(function() {
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
    if (savePage) {
        savePage.addEventListener('click', savePageData);
    }

    const saveSection = document.getElementById('saveSection');
    if (saveSection) {
        saveSection.addEventListener('click', saveSectionData);
    }

    const deletePage = document.getElementById('deletePage');
    if (deletePage) {
        deletePage.addEventListener('click', deletePageData);
    }

    const deleteSection = document.getElementById('deleteSection');
    if (deleteSection) {
        deleteSection.addEventListener('click', deleteSectionData);
    }

    const deleteAllPagesBtn = document.getElementById('deleteAllPages');
    if (deleteAllPagesBtn) {
        deleteAllPagesBtn.addEventListener('click', deleteAllPages);
    }

    // 페이지 컨텐츠 입력 시 실시간 통계 업데이트
    const pageContent = document.getElementById('pageContent');
    if (pageContent) {
        pageContent.addEventListener('input', function() {
            updatePageStats();
        });
    }

    // 섹션 Focus 슬라이더 이벤트
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

    // 전역 이미지 크기 슬라이더 이벤트
    const defaultImageWidth = document.getElementById('defaultImageWidth');
    if (defaultImageWidth) {
        defaultImageWidth.addEventListener('input', function () {
            const defaultImageWidthValue = document.getElementById('defaultImageWidthValue');
            if (defaultImageWidthValue) {
                defaultImageWidthValue.textContent = this.value + '%';
            }
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

    // ── Bold / Italic 토글 버튼 ──
    function toggleInlineWrap(marker) {
        const ta = document.getElementById('pageContent');
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const text = ta.value;
        const selected = text.slice(start, end);
        const mLen = marker.length;

        // 이미 감싸져 있으면 제거, 없으면 추가
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
    if (insertBoldBtn) insertBoldBtn.addEventListener('click', function() { toggleInlineWrap('**'); });

    const insertItalicBtn = document.getElementById('insertItalic');
    if (insertItalicBtn) insertItalicBtn.addEventListener('click', function() { toggleInlineWrap('*'); });

    // ── 정렬 버튼 ──
    function setLineAlign(prefix) {
        const ta = document.getElementById('pageContent');
        if (!ta) return;
        const start = ta.selectionStart;
        const text = ta.value;
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = text.indexOf('\n', start);
        const lineEndActual = lineEnd === -1 ? text.length : lineEnd;
        const lineText = text.slice(lineStart, lineEndActual);
        // 기존 정렬 prefix 제거 후 새 prefix 추가 (토글: 같은 prefix면 제거)
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
    if (insertAlignLeft) insertAlignLeft.addEventListener('click', function() { setLineAlign('[<]'); });
    const insertAlignCenter = document.getElementById('insertAlignCenter');
    if (insertAlignCenter) insertAlignCenter.addEventListener('click', function() { setLineAlign('[|]'); });
    const insertAlignRight = document.getElementById('insertAlignRight');
    if (insertAlignRight) insertAlignRight.addEventListener('click', function() { setLineAlign('[>]'); });

    // ── 마크다운 헤딩 삽입 버튼 ──
    function insertHeading(prefix) {
        const ta = document.getElementById('pageContent');
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const text = ta.value;
        const selected = text.slice(start, end).trim();
        // 커서가 있는 줄의 시작으로 이동
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = text.indexOf('\n', end);
        const lineEndActual = lineEnd === -1 ? text.length : lineEnd;
        const lineText = text.slice(lineStart, lineEndActual);
        // 이미 헤딩 prefix가 있으면 교체, 없으면 추가
        const stripped = lineText.replace(/^#{1,4}\s*/, '');
        const newLine = prefix + ' ' + (stripped || '제목');
        ta.value = text.slice(0, lineStart) + newLine + text.slice(lineEndActual);
        // 텍스트 부분 선택
        const selectStart = lineStart + prefix.length + 1;
        const selectEnd = lineStart + newLine.length;
        ta.setSelectionRange(selectStart, selectEnd);
        ta.focus();
        updatePreview();
    }

    ['insertH1', 'insertH2', 'insertH3', 'insertH4'].forEach(function(id) {
        const btn = document.getElementById(id);
        if (btn) {
            const level = parseInt(id.replace('insertH', ''));
            btn.addEventListener('click', function() {
                insertHeading('#'.repeat(level));
            });
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
    if (addThemeBtn) {
        addThemeBtn.addEventListener('click', addCustomTheme);
    }

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
                    tag: ''
                });
                updateProfilesList();
                saveToStorage();
            } else {
                alert('프로필은 최대 6개까지 추가할 수 있습니다.');
            }
        });
    }

    const copyBtn = document.getElementById('copyToClipboard');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyToClipboard);
    }


    // --- script.js의 setupEventListeners 함수 내부에 추가 ---

    // 텍스트 간격 조정 기능
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
            // 입력창 변경
            input.addEventListener('input', function () {
                const value = parseFloat(this.value);
                slider.value = value;
                textSpacing[property] = value;
                updateSpacingDisplay(property, value);
                updatePreview();
                saveToStorage();
            });

            // 슬라이더 변경
            slider.addEventListener('input', function () {
                const value = parseFloat(this.value);
                input.value = value;
                textSpacing[property] = value;
                updateSpacingDisplay(property, value);
                updatePreview();
                saveToStorage();
            });

            // 초기 display 갱신
            updateSpacingDisplay(property, textSpacing[property] !== undefined ? textSpacing[property] : parseFloat(slider.value));
        }
    }

    // 각 간격 설정에 대한 이벤트 리스너 등록
    setupSpacingControls('textSizeInput', 'textSizeSlider', 'fontSize');
    setupSpacingControls('lineHeightInput', 'lineHeightSlider', 'lineHeight');
    setupSpacingControls('letterSpacingInput', 'letterSpacingSlider', 'letterSpacing');
    setupSpacingControls('paragraphSpacingInput', 'paragraphSpacingSlider', 'paragraphSpacing');
    setupSpacingControls('textIndentInput', 'textIndentSlider', 'textIndent');

    // 기본값 초기화 버튼
    const resetSpacingBtn = document.getElementById('resetSpacing');
    if (resetSpacingBtn) {
        resetSpacingBtn.addEventListener('click', function () {
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

            updatePreview();
            saveToStorage();
            showNotification('텍스트 간격이 기본값으로 초기화되었습니다.');
        });
    }

    // ── HEADING SIZES 컨트롤 ──────────────────────────────────────────
    const headingDefaults = {
        coverArchiveNo: 11,
        coverTitle: 42,
        coverSubtitle: 14,
        coverTag: 11,
        sectionTitle: 20,
        sectionSubtitle: 11,
        pageHeaderNum: 40,
        pageHeaderTitle: 15,
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
        const input  = document.getElementById(ids.input);
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
        // 초기값 동기화
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
    // ─────────────────────────────────────────────────────────────────

    // 폰트 선택 이벤트
    const fontFamilySelect = document.getElementById('fontFamily');
    if (fontFamilySelect) {
        fontFamilySelect.addEventListener('change', function () {
            fontFamily = this.value;
            updatePreview();
            saveToStorage();
            showNotification('폰트가 변경되었습니다: ' + fontFamily);
        });
    }

    // 코멘트 테마 선택 이벤트
    const commentThemeSelect = document.getElementById('commentTheme');
    if (commentThemeSelect) {
        commentThemeSelect.addEventListener('change', function () {
            updatePreview();
            saveToStorage();
        });
    }

    // 데이터 내보내기 버튼
    const exportDataBtn = document.getElementById('exportData');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportDataToJSON);
    }

    // 데이터 불러오기 버튼
    const importDataBtn = document.getElementById('importData');
    const importFileInput = document.getElementById('importFileInput');
    if (importDataBtn && importFileInput) {
        importDataBtn.addEventListener('click', function () {
            importFileInput.click();
        });

        importFileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                importDataFromJSON(file);
                // 파일 입력 초기화 (같은 파일 다시 선택 가능하도록)
                e.target.value = '';
            }
        });
    }

    // 초기화 버튼
    const resetDataBtn = document.getElementById('resetData');
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', resetCurrentData);
    }

    const saveChapterBtn = document.getElementById('saveChapterToLibrary');
    if (saveChapterBtn) {
        saveChapterBtn.addEventListener('click', saveChapterToLibrary);
    }

    const quickSaveChapterBtn = document.getElementById('quickSaveChapter');
    if (quickSaveChapterBtn) {
        quickSaveChapterBtn.addEventListener('click', saveChapterToLibrary);
    }

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

function saveChapterToLibrary() {
    try {
        const saved = localStorage.getItem(CHAPTER_LIBRARY_STORAGE_KEY);
        const chapters = saved ? JSON.parse(saved) : [];
        const editingId = localStorage.getItem(EDITING_CHAPTER_KEY);
        const existingChapter = editingId ? chapters.find(function (c) { return c.id === editingId; }) : null;

        const defaultTitle = existingChapter
            ? existingChapter.title
            : (getInputValue('coverTitle') || getInputValue('pageTitle') || 'Untitled Chapter');
        const title = prompt('저장할 챕터 제목을 입력하세요:', defaultTitle);
        if (title === null || title.trim() === '') return;

        const now = new Date().toISOString();

        const data = collectEditorData();
        if (existingChapter) {
            existingChapter.title = title.trim();
            existingChapter.subtitle = getInputValue('coverSubtitle');
            existingChapter.summary = getInputValue('summaryText');
            existingChapter.coverImage = getInputValue('coverImage');
            existingChapter.descriptionHtml = generateIntroHTML(data);
            existingChapter.html = generateHTML(data, false);
            existingChapter.data = data;
            existingChapter.updatedAt = now;
            localStorage.setItem(CHAPTER_LIBRARY_STORAGE_KEY, JSON.stringify(chapters));
            showNotification('작품이 업데이트되었습니다.');
        } else {
            const chapter = {
                id: 'chapter_' + Date.now(),
                title: title.trim(),
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
            showNotification('챕터가 작품 선택 페이지에 저장되었습니다.');
        }
    } catch (error) {
        console.error('Chapter save failed:', error);
        showNotification('챕터 저장 실패: ' + error.message);
    }
}

// 현재 작업 내용 초기화 (프리셋·커스텀 테마는 유지)
function resetCurrentData() {
    if (!confirm('현재 작업 중인 모든 내용이 초기화됩니다.\n저장된 프리셋과 테마는 유지됩니다.\n\n계속하시겠습니까?')) return;

    // ── 전역 변수 초기화 ──
    pages = [];
    tags = [];
    replacements = [];
    profiles = [];
    localImages = {};
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

    // ── 체크박스 초기화 ──
    const checkboxIds = [
        'useRoundedQuotes', 'useTextIndent', 'preserveLineBreaks',
        'enableCover', 'coverAutoFit', 'enableProfiles',
        'enableTags', 'enableComment', 'hidePageNumbers'
    ];
    checkboxIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = (id === 'coverAutoFit' || id === 'enableTags');
    });

    // enablePageFold는 기본값 true
    const enablePageFoldEl = document.getElementById('enablePageFold');
    if (enablePageFoldEl) enablePageFoldEl.checked = true;

    // showHeaderWhenFoldOff 기본값 false
    const resetShEl = document.getElementById('showHeaderWhenFoldOff');
    if (resetShEl) resetShEl.checked = false;

    const resetDsEl = document.getElementById('dividerStyle');
    const resetDcEl = document.getElementById('dividerCustomText');
    if (resetDsEl) resetDsEl.value = 'line';
    if (resetDcEl) { resetDcEl.value = ''; resetDcEl.style.display = 'none'; }

    // ── 텍스트 입력 초기화 ──
    const textInputIds = [
        'coverImage', 'coverTitle', 'coverSubtitle',
        'summaryText',
        'commentText', 'commentNickname'
    ];
    textInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // coverArchiveNo 기본값 복원
    const coverArchiveNoEl = document.getElementById('coverArchiveNo');
    if (coverArchiveNoEl) coverArchiveNoEl.value = 'ARCHIVE NO.001';

    // ── 폰트 초기화 ──
    const fontFamilyEl = document.getElementById('fontFamily');
    if (fontFamilyEl) fontFamilyEl.value = 'Pretendard';

    // ── 텍스트 간격 슬라이더/입력 초기화 ──
    const spacingDefaults = {
        textSizeInput: 14.2,   textSizeSlider: 14.2,
        lineHeightInput: 1.7,  lineHeightSlider: 1.7,
        letterSpacingInput: -0.5, letterSpacingSlider: -0.5,
        paragraphSpacingInput: 10, paragraphSpacingSlider: 10,
        textIndentInput: 0,    textIndentSlider: 0
    };
    Object.entries(spacingDefaults).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });

    // ── 전역 테마 초기화 ──
    const globalThemeEl = document.getElementById('globalTheme');
    if (globalThemeEl) globalThemeEl.value = 'basic';

    // ── UI 목록 갱신 ──
    updatePagesList();
    updateTagsList();
    updateReplacementsList();
    updateProfilesList();

    // 커버 섹션 숨김
    const coverContent = document.getElementById('coverContent');
    if (coverContent) coverContent.style.display = 'none';
    const profileInputs = document.getElementById('profileInputs');
    if (profileInputs) profileInputs.style.display = 'none';
    const commentContent = document.getElementById('commentContent');
    if (commentContent) commentContent.style.display = 'none';

    // ── localStorage에서 메인 데이터만 삭제 (프리셋·테마는 유지) ──
    localStorage.removeItem(STORAGE_KEY);

    // ── 미리보기 갱신 ──
    updatePreview();

    showNotification('초기화 완료! 프리셋과 테마는 유지됩니다.');
}

// 데이터를 JSON 파일로 내보내기
function exportDataToJSON() {
    try {
        // 프리셋 데이터 가져오기
        const savedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
        const presets = savedPresets ? JSON.parse(savedPresets) : {};
        
        // 현재 상태를 JSON으로 저장
        const data = collectEditorData({
            presets: presets, // 프리셋 데이터 포함
            exportDate: new Date().toISOString(),
            version: '1.0'
        });

        // JSON 문자열로 변환
        const jsonStr = JSON.stringify(data, null, 2);

        // Blob 생성
        const blob = new Blob([jsonStr], { type: 'application/json' });

        // 다운로드 링크 생성
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // 파일명: log-diary-backup-YYYY-MM-DD-HHMMSS.json
        const now = new Date();
        const dateStr = now.getFullYear() + '-' + 
                       String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(now.getDate()).padStart(2, '0') + '-' +
                       String(now.getHours()).padStart(2, '0') + 
                       String(now.getMinutes()).padStart(2, '0') + 
                       String(now.getSeconds()).padStart(2, '0');
        a.download = 'log-diary-backup-' + dateStr + '.json';
        
        // 다운로드 실행
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

// JSON 파일에서 데이터 불러오기
function importDataFromJSON(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // 데이터 유효성 검사
            if (!data || typeof data !== 'object') {
                throw new Error('유효하지 않은 데이터 형식입니다.');
            }

            // 확인 대화상자
            if (!confirm('현재 작업 중인 데이터가 모두 사라집니다. 불러오시겠습니까?')) {
                return;
            }

            // 데이터 복원
            if (data.useRoundedQuotes !== undefined) document.getElementById('useRoundedQuotes').checked = data.useRoundedQuotes;
            if (data.useTextIndent !== undefined) document.getElementById('useTextIndent').checked = data.useTextIndent;
            if (data.preserveLineBreaks !== undefined) document.getElementById('preserveLineBreaks').checked = data.preserveLineBreaks;
            if (data.enableCover !== undefined) {
                document.getElementById('enableCover').checked = data.enableCover;
                document.getElementById('coverContent').style.display = data.enableCover ? 'block' : 'none';
            }
            if (data.coverImage !== undefined) document.getElementById('coverImage').value = data.coverImage;
            if (data.coverAutoFit !== undefined) {
                document.getElementById('coverAutoFit').checked = data.coverAutoFit;
                const coverManualControls = document.getElementById('coverManualControls');
                if (coverManualControls) {
                    coverManualControls.style.display = data.coverAutoFit ? 'none' : 'block';
                }
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
            
            if (data.enableProfiles !== undefined) {
                document.getElementById('enableProfiles').checked = data.enableProfiles;
                document.getElementById('profileInputs').style.display = data.enableProfiles ? 'block' : 'none';
            }
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

            // 커스텀 색상 복원
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

            // 배열 데이터 복원
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

            // 텍스트 간격 복원
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

            // 폰트 설정 복원
            if (data.fontFamily) {
                fontFamily = data.fontFamily;
                document.getElementById('fontFamily').value = fontFamily;
            }

            // 제목 크기 설정 복원
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

            // 전역 테마 복원
            if (data.globalTheme) {
                globalTheme = data.globalTheme;
                document.getElementById('globalTheme').value = globalTheme;
            }

            // 페이지 번호 숨김 복원
            if (data.hidePageNumbers !== undefined) {
                hidePageNumbers = data.hidePageNumbers;
                document.getElementById('hidePageNumbers').checked = hidePageNumbers;
            }

            // 페이지 접기 복원
            if (data.enablePageFold !== undefined) {
                enablePageFold = data.enablePageFold;
            } else {
                enablePageFold = true;
            }
            const importEnablePageFoldEl = document.getElementById('enablePageFold');
            if (importEnablePageFoldEl) importEnablePageFoldEl.checked = enablePageFold;

            showHeaderWhenFoldOff = data.showHeaderWhenFoldOff || false;
            const importShEl = document.getElementById('showHeaderWhenFoldOff');
            if (importShEl) importShEl.checked = showHeaderWhenFoldOff;

            dividerStyle = data.dividerStyle || 'line';
            dividerCustomText = data.dividerCustomText || '';
            const importDsEl = document.getElementById('dividerStyle');
            const importDcEl = document.getElementById('dividerCustomText');
            if (importDsEl) { importDsEl.value = dividerStyle; }
            if (importDcEl) { importDcEl.value = dividerCustomText; importDcEl.style.display = dividerStyle === 'custom' ? 'block' : 'none'; }

            // 프리셋 데이터 복원
            if (data.presets && typeof data.presets === 'object') {
                localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(data.presets));
                loadPresets(); // 프리셋 UI 업데이트
            }

            // UI 업데이트
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

    reader.onerror = function() {
        showNotification('파일 읽기 실패');
    };

    reader.readAsText(file);
}


function updateTagsList() {
    const tagsList = document.getElementById('tagsList');
    if (!tagsList) return;

    tagsList.innerHTML = '';

    tags.forEach(function (tag, index) {
        const tagItem = document.createElement('div');
        tagItem.className = 'tag-edit-item';
        // Grid 구조: 값(Input) | 링크(Input) | 삭제(Btn) - Name 필드 제거
        tagItem.innerHTML =
            '<input type="text" class="tag-value-input" placeholder="태그 텍스트" value="' + (tag.value || '') + '" data-index="' + index + '" data-field="value">' +
            '<input type="text" class="tag-link-input" placeholder="링크 (선택)" value="' + (tag.link || '') + '" data-index="' + index + '" data-field="link">' +
            '<button class="btn-delete-item" data-index="' + index + '" title="삭제">×</button>';
        tagsList.appendChild(tagItem);
    });

    tagsList.querySelectorAll('.tag-value-input, .tag-link-input').forEach(function (input) {
        input.addEventListener('input', function (e) {
            const idx = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            tags[idx][field] = e.target.value;
            updatePreview();
            saveToStorage();
        });
    });

    tagsList.querySelectorAll('.btn-delete-item').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            const idx = parseInt(e.target.dataset.index);
            tags.splice(idx, 1);
            updateTagsList();
            updatePreview();
            saveToStorage();
        });
    });
}

function updatePageTagsList() {
    const list = document.getElementById('pageTagsList');
    if (!list) return;

    list.innerHTML = '';

    tempPageTags.forEach(function (tag, index) {
        const tagItem = document.createElement('div');
        tagItem.className = 'tag-edit-item'; // CSS Grid 스타일 적용됨

        // 디자인 통일: Label | Value | Link | Delete(Icon)
        tagItem.innerHTML =
            '<div class="tag-label-static" title="' + (tag.name || 'Tag') + '">' + (tag.name || 'Tag') + '</div>' +
            '<input type="text" class="tag-value-input" placeholder="값 (Value)" value="' + (tag.value || '') + '" data-index="' + index + '" data-field="value">' +
            '<input type="text" class="tag-link-input" placeholder="링크 (선택)" value="' + (tag.link || '') + '" data-index="' + index + '" data-field="link">' +
            '<button class="btn-delete-tag" data-index="' + index + '" title="삭제">×</button>'; // 클래스명 btn-delete-tag 사용 (CSS에서 스타일 통합됨)

        list.appendChild(tagItem);
    });

    // 입력 이벤트 리스너
    list.querySelectorAll('.tag-value-input, .tag-link-input').forEach(function (input) {
        input.addEventListener('input', function (e) {
            const idx = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            tempPageTags[idx][field] = e.target.value;
        });
    });

    // 삭제 버튼 이벤트 리스너
    list.querySelectorAll('.btn-delete-tag').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            const idx = parseInt(e.target.dataset.index);
            tempPageTags.splice(idx, 1);
            updatePageTagsList();
        });
    });
}

function updateProfilesList() {
    const profilesList = document.getElementById('profilesList');
    if (!profilesList) return;

    profilesList.innerHTML = '';

    profiles.forEach(function (profile, index) {
        const profileSection = document.createElement('div');
        profileSection.className = 'profile-section';

        const focusXId = 'profile' + index + 'FocusX';
        const focusYId = 'profile' + index + 'FocusY';
        const focusXValueId = 'profile' + index + 'FocusXValue';
        const focusYValueId = 'profile' + index + 'FocusYValue';
        const zoomId = 'profile' + index + 'Zoom';
        const zoomValueId = 'profile' + index + 'ZoomValue';

        // [수정됨] 페이지 목록(page-controls) 스타일을 그대로 차용
        profileSection.innerHTML =
            '<div class="profile-header">' +
            '<span class="profile-title">PROFILE #' + (index + 1) + '</span>' +
            '<div class="page-controls">' + // page-controls 클래스 재사용
            '<button class="btn-move btn-profile-move-up" data-index="' + index + '" title="위로">▲</button>' +
            '<button class="btn-move btn-profile-move-down" data-index="' + index + '" title="아래로">▼</button>' +
            '<button class="btn-profile-delete" data-index="' + index + '" title="프로필 삭제">×</button>' +
            '</div>' +
            '</div>' +
            '<div class="input-group">' +
            '<label>이름 (Name)</label>' +
            '<input type="text" class="profile-name-input" placeholder="캐릭터 이름" value="' + (profile.name || '') + '" data-index="' + index + '">' +
            '</div>' +
            '<div class="input-group">' +
            '<label>이미지 URL' +
            '<span class="image-url-tooltip">' +
            '<span class="tooltip-icon">?</span>' +
            '<span class="tooltip-text">//ac.namu.la/~ 형식의 링크 사용을 권장합니다. 아카라이브 글쓰기에서 원하는 이미지를 삽입한 후 \'코드보기\'에서 확인할 수 있는 부분을 붙여넣기 해주세요.</span>' +
            '</span>' +
            '</label>' +
            '<input type="text" class="profile-image-input" placeholder="https://..." value="' + (profile.imageUrl || '') + '" data-index="' + index + '">' +
            '<button class="btn-ghost full-width btn-profile-local-image" type="button" data-index="' + index + '">로컬 이미지 선택</button>' +
            '</div>' +
            '<div class="input-group">' +
            '<label>Zoom <span id="' + zoomValueId + '" style="color:var(--accent-blue);">' + (profile.zoom || 100) + '%</span></label>' +
            '<input type="range" id="' + zoomId + '" class="profile-zoom-input spacing-slider" min="100" max="300" value="' + (profile.zoom || 100) + '" data-index="' + index + '" style="width: 100%;">' +
            '</div>' +
            '<div class="input-group">' +
            '<label>Focus X (좌우) <span id="' + focusXValueId + '" style="color:var(--accent-blue);">' + (profile.focusX || 50) + '%</span></label>' +
            '<input type="range" id="' + focusXId + '" class="profile-focusx-input spacing-slider" min="0" max="100" value="' + (profile.focusX || 50) + '" data-index="' + index + '" style="width: 100%;">' +
            '</div>' +
            '<div class="input-group">' +
            '<label>Focus Y (상하) <span id="' + focusYValueId + '" style="color:var(--accent-blue);">' + (profile.focusY || 30) + '%</span></label>' +
            '<input type="range" id="' + focusYId + '" class="profile-focusy-input spacing-slider" min="0" max="100" value="' + (profile.focusY || 30) + '" data-index="' + index + '" style="width: 100%;">' +
            '</div>' +
            '<div class="input-group">' +
            '<label>소개글 (Description)</label>' +
            '<textarea class="profile-desc-input" rows="3" placeholder="소개 내용..." data-index="' + index + '">' + (profile.desc || '') + '</textarea>' +
            '</div>' +
            '<div class="input-group">' +
            '<label>인물 태그</label>' +
            '<div class="select-wrapper">' +
            '<select class="profile-tag-input" data-index="' + index + '">' +
            '<option value="" ' + (!profile.tag ? 'selected' : '') + '>(태그 없음)</option>' +
            '<option value="USER" ' + (profile.tag === 'USER' ? 'selected' : '') + '>USER</option>' +
            '<option value="CHAR" ' + (profile.tag === 'CHAR' ? 'selected' : '') + '>CHAR</option>' +
            '</select>' +
            '</div>' +
            '</div>';

        profilesList.appendChild(profileSection);
    });

    attachProfileEvents(profilesList);
}




// 편의를 위해 이벤트 연결 로직 분리 (updateProfilesList 안에서 호출)
function attachProfileEvents(profilesList) {
    profilesList.querySelectorAll('.profile-name-input').forEach(input => {
        input.addEventListener('input', e => {
            profiles[parseInt(e.target.dataset.index)].name = e.target.value;
            updatePreview(); saveToStorage();
        });
    });
    profilesList.querySelectorAll('.profile-image-input').forEach(input => {
        input.addEventListener('input', e => {
            profiles[parseInt(e.target.dataset.index)].imageUrl = e.target.value;
            updatePreview(); saveToStorage();
        });
    });
    profilesList.querySelectorAll('.btn-profile-local-image').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(e.currentTarget.dataset.index);
            selectLocalImage(function (dataUrl, file) {
                profiles[idx].imageUrl = createLocalImageRef(dataUrl, file);
                updateProfilesList();
                updatePreview();
                saveToStorage();
                showNotification('로컬 프로필 이미지가 추가되었습니다.');
            });
        });
    });
    profilesList.querySelectorAll('.profile-zoom-input').forEach(input => {
        input.addEventListener('input', e => {
            const idx = parseInt(e.target.dataset.index);
            profiles[idx].zoom = parseInt(e.target.value);
            document.getElementById('profile' + idx + 'ZoomValue').textContent = e.target.value + '%';
            updatePreview(); saveToStorage();
        });
    });
    profilesList.querySelectorAll('.profile-focusx-input').forEach(input => {
        input.addEventListener('input', e => {
            const idx = parseInt(e.target.dataset.index);
            profiles[idx].focusX = parseInt(e.target.value);
            document.getElementById('profile' + idx + 'FocusXValue').textContent = e.target.value + '%';
            updatePreview(); saveToStorage();
        });
    });
    profilesList.querySelectorAll('.profile-focusy-input').forEach(input => {
        input.addEventListener('input', e => {
            const idx = parseInt(e.target.dataset.index);
            profiles[idx].focusY = parseInt(e.target.value);
            document.getElementById('profile' + idx + 'FocusYValue').textContent = e.target.value + '%';
            updatePreview(); saveToStorage();
        });
    });
    profilesList.querySelectorAll('.profile-desc-input').forEach(input => {
        input.addEventListener('input', e => {
            profiles[parseInt(e.target.dataset.index)].desc = e.target.value;
            updatePreview(); saveToStorage();
        });
    });
    profilesList.querySelectorAll('.profile-tag-input').forEach(input => {
        input.addEventListener('change', e => {
            profiles[parseInt(e.target.dataset.index)].tag = e.target.value;
            updatePreview(); saveToStorage();
        });
    });
    // [추가됨] 위로 이동 버튼 이벤트
    profilesList.querySelectorAll('.btn-profile-move-up').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(e.target.dataset.index);
            moveProfileUp(idx);
        });
    });

    // [추가됨] 아래로 이동 버튼 이벤트
    profilesList.querySelectorAll('.btn-profile-move-down').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(e.target.dataset.index);
            moveProfileDown(idx);
        });
    });
    profilesList.querySelectorAll('.btn-profile-delete').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(e.target.dataset.index);
            if (confirm('이 프로필을 삭제하시겠습니까?')) {
                profiles.splice(idx, 1);
                updateProfilesList(); updatePreview(); saveToStorage();
            }
        });
    });

}

function updateReplacementsList() {
    const list = document.getElementById('replacementsList');
    if (!list) return;

    list.innerHTML = '';

    replacements.forEach(function (rep, index) {
        const item = document.createElement('div');
        item.className = 'replacement-edit-item';
        // Grid 구조: 원본 | 화살표 | 치환 | 삭제
        item.innerHTML =
            '<input type="text" class="replacement-from-input" placeholder="원본 단어" value="' + (rep.from || '') + '" data-index="' + index + '" data-field="from">' +
            '<div class="arrow-static">→</div>' +
            '<input type="text" class="replacement-to-input" placeholder="바꿀 단어" value="' + (rep.to || '') + '" data-index="' + index + '" data-field="to">' +
            '<button class="btn-delete-item" data-index="' + index + '" title="삭제">×</button>';
        list.appendChild(item);
    });

    // 이벤트 리스너 연결 로직 동일
    document.querySelectorAll('.replacement-from-input, .replacement-to-input').forEach(function (input) {
        input.addEventListener('input', function (e) {
            const idx = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            replacements[idx][field] = e.target.value;
            updatePreview();
            saveToStorage();
        });
    });

    document.querySelectorAll('.btn-delete-item').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            const idx = parseInt(e.target.dataset.index);
            replacements.splice(idx, 1);
            updateReplacementsList();
            updatePreview();
            saveToStorage();
        });
    });
}

function addCustomTheme() {
    if (customThemes.length >= 20) {
        alert('커스텀 테마는 최대 20개까지만 저장할 수 있습니다.');
        return;
    }

    const themeName = prompt('테마 이름을 입력하세요:', '커스텀 테마 ' + (customThemes.length + 1));
    if (themeName === null || themeName.trim() === '') return; // 취소 또는 빈 문자열

    const newTheme = {
        name: themeName.trim(),
        bg: getColorValue('customBg'),
        text: getColorValue('customText'),
        em: getColorValue('customEm'),
        line: getColorValue('customLine'),
        headerText: getColorValue('customHeaderText'),
        quote1Bg: getColorValue('customQuote1Bg'),
        quote1Text: getColorValue('customQuote1Text'),
        quote2Bg: getColorValue('customQuote2Bg'),
        quote2Text: getColorValue('customQuote2Text'),
        tagText: getColorValue('customTagText'),
        divider: getColorValue('customDivider')
    };

    customThemes.push(newTheme);
    updateCustomThemesList();
    saveToStorage();
    showNotification('커스텀 테마가 저장되었습니다!');
}

function updateCustomThemesList() {
    const themesList = document.getElementById('customThemesList');
    if (!themesList) return;

    themesList.innerHTML = '';
    customThemes.forEach(function (theme, index) {
        const themeItem = document.createElement('div');
        themeItem.className = 'custom-theme-item';
        themeItem.innerHTML =
            '<span class="theme-name">' + theme.name + '</span>' +
            '<span class="theme-preview" style="background-color: ' + theme.bg + '; border: 1px solid ' + theme.line + ';"></span>' +
            '<div class="theme-actions">' +
                '<button class="btn-load-theme" data-index="' + index + '">불러오기</button>' +
                '<button class="btn-overwrite-theme" data-index="' + index + '">덮어쓰기</button>' +
                '<button class="btn-rename-theme" data-index="' + index + '" title="이름 수정">✎</button>' +
                '<button class="btn-delete-theme" data-index="' + index + '" title="삭제">×</button>' +
            '</div>';
        themesList.appendChild(themeItem);
    });

    document.querySelectorAll('.btn-load-theme').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            const index = parseInt(e.target.dataset.index);
            loadCustomTheme(index);
        });
    });

    document.querySelectorAll('.btn-overwrite-theme').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            const index = parseInt(e.target.dataset.index);
            overwriteCustomTheme(index);
        });
    });

    document.querySelectorAll('.btn-rename-theme').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            const index = parseInt(e.target.dataset.index);
            renameCustomTheme(index);
        });
    });

    document.querySelectorAll('.btn-delete-theme').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            const index = parseInt(e.target.dataset.index);
            deleteCustomTheme(index);
        });
    });
}

function loadCustomTheme(index) {
    const theme = customThemes[index];
    if (!theme) return;

    setColorInputValue('customBg', theme.bg);
    setColorInputValue('customText', theme.text);
    setColorInputValue('customEm', theme.em);
    setColorInputValue('customLine', theme.line);
    setColorInputValue('customHeaderText', theme.headerText);
    setColorInputValue('customQuote1Bg', theme.quote1Bg);
    setColorInputValue('customQuote1Text', theme.quote1Text);
    setColorInputValue('customQuote2Bg', theme.quote2Bg);
    setColorInputValue('customQuote2Text', theme.quote2Text);
    setColorInputValue('customTagText', theme.tagText || theme.badgeBg || '#888888');

    updatePreview();
    saveToStorage();
    showNotification('테마를 불러왔습니다!');
}

function overwriteCustomTheme(index) {
    const theme = customThemes[index];
    if (!theme) return;

    if (!confirm('"' + theme.name + '" 테마를 현재 색상으로 덮어쓰시겠습니까?')) {
        return;
    }

    customThemes[index] = {
        name: theme.name, // 이름은 유지
        bg: getColorValue('customBg'),
        text: getColorValue('customText'),
        em: getColorValue('customEm'),
        line: getColorValue('customLine'),
        headerText: getColorValue('customHeaderText'),
        quote1Bg: getColorValue('customQuote1Bg'),
        quote1Text: getColorValue('customQuote1Text'),
        quote2Bg: getColorValue('customQuote2Bg'),
        quote2Text: getColorValue('customQuote2Text'),
        tagText: getColorValue('customTagText'),
        divider: getColorValue('customDivider')
    };

    updateCustomThemesList();
    saveToStorage();
    showNotification('테마를 덮어썼습니다!');
}

function renameCustomTheme(index) {
    const theme = customThemes[index];
    if (!theme) return;

    const newName = prompt('새로운 테마 이름을 입력하세요:', theme.name);
    if (newName === null || newName.trim() === '') return; // 취소 또는 빈 문자열

    customThemes[index].name = newName.trim();
    updateCustomThemesList();
    saveToStorage();
    showNotification('테마 이름이 변경되었습니다!');
}

function deleteCustomTheme(index) {
    const theme = customThemes[index];
    if (!theme) return;

    if (confirm('"' + theme.name + '" 테마를 삭제하시겠습니까?')) {
        customThemes.splice(index, 1);
        updateCustomThemesList();
        saveToStorage();
        showNotification('테마가 삭제되었습니다.');
    }
}

function savePageData() {
    const pageTitle = document.getElementById('pageTitle').value.trim();
    const pageSubtitle = document.getElementById('pageSubtitle').value.trim();
    const content = migrateLocalImagesInText(document.getElementById('pageContent').value);
    const defaultImageWidthInput = document.getElementById('defaultImageWidth');
    const pageImageWidth = defaultImageWidthInput ? parseInt(defaultImageWidthInput.value) : 100;

    if (!content.trim()) {
        alert('내용을 입력해주세요.');
        return;
    }

    if (currentEditingIndex === null) {
        // 새 페이지 추가
        const pageData = {
            itemType: 'page',
            type: globalTheme,
            title: pageTitle,
            subtitle: pageSubtitle,
            content: content,
            imageWidth: pageImageWidth,
            bgImage: null,
            collapsed: false,
            useGlobalTags: true,
            tags: [],
            headerImage: null,
            headerFocusX: 50,
            headerFocusY: 50
        };
        pages.push(pageData);
    } else {
        const existingPage = pages[currentEditingIndex];
        existingPage.title = pageTitle;
        existingPage.subtitle = pageSubtitle;
        existingPage.content = content;
        existingPage.imageWidth = pageImageWidth;
    }

    document.getElementById('pageModal').style.display = 'none';
    updatePagesList();
    updatePreview();
    saveToStorage();
}

// 섹션 데이터 저장 함수
function saveSectionData() {
    const sectionTitle = document.getElementById('sectionTitle').value.trim();
    const sectionSubtitle = document.getElementById('sectionSubtitle').value.trim();
    const sectionImage = document.getElementById('sectionImage').value.trim();
    const sectionAlign = document.getElementById('sectionAlign').value;
    const sectionZoom = parseInt(document.getElementById('sectionZoom').value);
    const sectionFocusX = parseInt(document.getElementById('sectionFocusX').value);
    const sectionFocusY = parseInt(document.getElementById('sectionFocusY').value);

    if (!sectionTitle && !sectionSubtitle && !sectionImage) {
        alert('제목, 부제목 또는 이미지 중 하나 이상을 입력해주세요.');
        return;
    }

    const sectionData = {
        itemType: 'section', // 섹션 타입 식별자
        title: sectionTitle,
        subtitle: sectionSubtitle,
        image: sectionImage,
        align: sectionAlign || 'center', // 정렬 옵션 추가 (기본값: center)
        zoom: sectionZoom,
        focusX: sectionFocusX,
        focusY: sectionFocusY
    };

    if (currentEditingIndex === null) {
        pages.push(sectionData);
    } else {
        pages[currentEditingIndex] = sectionData;
    }

    document.getElementById('sectionModal').style.display = 'none';
    updatePagesList();
    updatePreview();
    saveToStorage();
}

// 섹션 데이터 삭제 함수
function deleteSectionData() {
    if (currentEditingIndex !== null && confirm('삭제하시겠습니까?')) {
        pages.splice(currentEditingIndex, 1);
        document.getElementById('sectionModal').style.display = 'none';
        updatePagesList();
        updatePreview();
        saveToStorage();
    }
}

function deletePageData() {
    if (currentEditingIndex !== null && confirm('삭제하시겠습니까?')) {
        pages.splice(currentEditingIndex, 1);
        document.getElementById('pageModal').style.display = 'none';
        updatePagesList();
        updatePreview();
        saveToStorage();
    }
}

// 전체 페이지 삭제 함수 (섹션 포함)
function deleteAllPages() {
    if (pages.length === 0) {
        showNotification('삭제할 페이지가 없습니다.');
        return;
    }
    if (confirm('모든 섹션과 페이지를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
        pages = [];
        updatePagesList();
        updatePreview();
        saveToStorage();
        showNotification('모든 섹션과 페이지가 삭제되었습니다.');
    }
}

function movePageUp(index) {
    if (index > 0) {
        const temp = pages[index];
        pages[index] = pages[index - 1];
        pages[index - 1] = temp;
        updatePagesList();
        updatePreview();
        saveToStorage();
    }
}

function movePageDown(index) {
    if (index < pages.length - 1) {
        const temp = pages[index];
        pages[index] = pages[index + 1];
        pages[index + 1] = temp;
        updatePagesList();
        updatePreview();
        saveToStorage();
    }
}

// 텍스트 통계 계산 함수
function calculateTextStats(text) {
    if (!text || !text.trim()) {
        return {
            charCountNoSpace: 0,
            charCountWithSpace: 0,
            wordCount: 0
        };
    }

    // 본문 텍스트만 추출 (태그 및 마크업 제거)
    let cleanText = text;
    
    // [HR], [IMG:...], [FN:...][/FN] 등의 태그 제거
    cleanText = cleanText.replace(/\[HR\]/g, '');
    cleanText = cleanText.replace(/\[IMG:[^\]]*\]/g, '');
    cleanText = cleanText.replace(/\[FN:[^\]]*\].*?\[\/FN\]/g, '');
    
    // 공백 정리
    cleanText = cleanText.trim();
    
    // 글자 수 계산 (공백 제외)
    const charCountNoSpace = cleanText.replace(/\s/g, '').length;
    
    // 글자 수 계산 (공백 포함)
    const charCountWithSpace = cleanText.length;
    
    // 단어 수 계산 (한글은 어절 단위, 영문은 단어 단위)
    const wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length;
    
    return {
        charCountNoSpace: charCountNoSpace,
        charCountWithSpace: charCountWithSpace,
        wordCount: wordCount
    };
}

// 페이지별 통계 업데이트
function updatePageStats() {
    const pageContent = document.getElementById('pageContent');
    const pageStats = document.getElementById('pageStats');
    
    if (!pageContent || !pageStats) return;
    
    const stats = calculateTextStats(pageContent.value);
    
    pageStats.innerHTML = 
        '<strong>현재 페이지:</strong><br>' +
        '글자 수 (공백 제외): <span style="color: var(--accent-blue);">' + stats.charCountNoSpace.toLocaleString() + '자</span><br>' +
        '글자 수 (공백 포함): <span style="color: var(--accent-blue);">' + stats.charCountWithSpace.toLocaleString() + '자</span><br>' +
        '단어 수: <span style="color: var(--accent-blue);">' + stats.wordCount.toLocaleString() + '개</span>';
}

// 전체 페이지 통계 업데이트
function updateTotalStats() {
    const totalStats = document.getElementById('totalStats');
    if (!totalStats) return;
    
    let totalCharCountNoSpace = 0;
    let totalCharCountWithSpace = 0;
    let totalWordCount = 0;
    
    pages.forEach(function(item) {
        // 페이지만 카운트 (섹션은 제외)
        if (item.itemType !== 'section' && item.content) {
            const stats = calculateTextStats(item.content);
            totalCharCountNoSpace += stats.charCountNoSpace;
            totalCharCountWithSpace += stats.charCountWithSpace;
            totalWordCount += stats.wordCount;
        }
    });
    
    if (totalCharCountNoSpace === 0) {
        totalStats.innerHTML = '<strong>전체 페이지 통계:</strong> 페이지가 없습니다.';
    } else {
        totalStats.innerHTML = 
            '<strong>전체 페이지 통계:</strong><br>' +
            '글자 수 (공백 제외): <span style="color: var(--accent-blue);">' + totalCharCountNoSpace.toLocaleString() + '자</span><br>' +
            '글자 수 (공백 포함): <span style="color: var(--accent-blue);">' + totalCharCountWithSpace.toLocaleString() + '자</span><br>' +
            '단어 수: <span style="color: var(--accent-blue);">' + totalWordCount.toLocaleString() + '개</span>';
    }
}

function updatePagesList() {
    const pagesList = document.getElementById('pagesList');
    pagesList.innerHTML = '';

    let pageNumber = 0; // 실제 페이지 번호 카운터

    pages.forEach(function (item, index) {
        const pageItem = document.createElement('div');
        pageItem.className = 'page-item';

        // 섹션인 경우
        if (item.itemType === 'section') {
            let sectionDisplay = item.title || 'Section';
            if (item.subtitle) {
                sectionDisplay += ' - ' + item.subtitle;
            }

            pageItem.innerHTML =
                '<div class="page-item-header">' +
                '<div class="page-item-main">' +
                '<div class="page-item-info">' +
                '<span class="page-item-name" style="color: var(--accent-blue); font-weight: 700;">📑 ' + sectionDisplay + '</span>' +
                '<div class="page-item-preview" style="color: var(--text-muted); font-size: 12px;">섹션 (구분선)</div>' +
                '</div>' +
                '</div>' +
                '<div class="page-controls">' +
                '<button class="btn-move btn-move-up" data-index="' + index + '" title="위로">▲</button>' +
                '<button class="btn-move btn-move-down" data-index="' + index + '" title="아래로">▼</button>' +
                '<button class="btn-delete-page" data-index="' + index + '" title="삭제">×</button>' +
                '</div>' +
                '</div>';

            // 섹션 클릭 이벤트
            pageItem.addEventListener('click', function (e) {
                if (e.target.closest('.btn-move') || e.target.closest('.btn-delete-page')) return;

                currentEditingIndex = index;
                document.getElementById('sectionTitle').value = item.title || '';
                document.getElementById('sectionSubtitle').value = item.subtitle || '';
                document.getElementById('sectionImage').value = item.image || '';
                document.getElementById('sectionAlign').value = item.align || 'center';
                document.getElementById('sectionZoom').value = item.zoom || 100;
                document.getElementById('sectionFocusX').value = item.focusX || 50;
                document.getElementById('sectionFocusY').value = item.focusY || 50;
                document.getElementById('sectionZoomValue').textContent = (item.zoom || 100) + '%';
                document.getElementById('sectionFocusXValue').textContent = (item.focusX || 50) + '%';
                document.getElementById('sectionFocusYValue').textContent = (item.focusY || 50) + '%';

                const sectionModal = document.getElementById('sectionModal');
                sectionModal.style.display = 'flex';
                
                // 모바일에서 모달과 body를 맨 위로 스크롤
                setTimeout(function() {
                    sectionModal.scrollTop = 0;
                    const modalBody = sectionModal.querySelector('.modal-body');
                    if (modalBody) modalBody.scrollTop = 0;
                }, 50);
            });
        }
        // 페이지인 경우
        else {
            pageNumber++; // 페이지 번호 증가

            let speaker = '#' + pageNumber;
            if (item.title && item.title.trim()) {
                speaker = item.title;
            }
            if (item.subtitle && item.subtitle.trim()) {
                speaker += ' - ' + item.subtitle;
            }

            const previewText = item.content.substring(0, 50).replace(/\[.*?\]/g, '').trim() + '...';

            pageItem.innerHTML =
                '<div class="page-item-header">' +
                '<div class="page-item-main">' +
                '<span class="page-num">#' + pageNumber + '</span>' +
                '<div class="page-item-info">' +
                '<span class="page-item-name">' + speaker + '</span>' +
                '<div class="page-item-preview">' + previewText + '</div>' +
                '</div>' +
                '</div>' +
                '<div class="page-controls">' +
                '<button class="btn-move btn-move-up" data-index="' + index + '" title="위로">▲</button>' +
                '<button class="btn-move btn-move-down" data-index="' + index + '" title="아래로">▼</button>' +
                '<button class="btn-delete-page" data-index="' + index + '" title="삭제">×</button>' +
                '</div>' +
                '</div>';

            // 페이지 클릭 이벤트 (편집)
            pageItem.addEventListener('click', function (e) {
                if (e.target.closest('.btn-move') || e.target.closest('.btn-delete-page')) return;

                currentEditingIndex = index;
                document.getElementById('pageTitle').value = item.title || '';
                document.getElementById('pageSubtitle').value = item.subtitle || '';
                document.getElementById('pageContent').value = item.content;

                tempPageTags = [];

                const pageModal = document.getElementById('pageModal');
                pageModal.style.display = 'flex';
                
                // 페이지 통계 업데이트
                updatePageStats();
                
                // 모바일에서 모달과 body를 맨 위로 스크롤
                setTimeout(function() {
                    pageModal.scrollTop = 0;
                    const modalBody = pageModal.querySelector('.modal-body');
                    if (modalBody) modalBody.scrollTop = 0;
                }, 50);
            });
        }

        pagesList.appendChild(pageItem);
    });

    // 버튼 이벤트 리스너
    document.querySelectorAll('.btn-move-up').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const idx = parseInt(e.target.dataset.index);
            movePageUp(idx);
        });
    });

    document.querySelectorAll('.btn-move-down').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const idx = parseInt(e.target.dataset.index);
            movePageDown(idx);
        });
    });

    // 삭제 버튼 이벤트 리스너
    document.querySelectorAll('.btn-delete-page').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const idx = parseInt(e.target.dataset.index);

            // 인덱스 유효성 검증
            if (idx < 0 || idx >= pages.length || !pages[idx]) {
                showNotification('삭제할 항목을 찾을 수 없습니다.');
                return;
            }

            // 확인 대화상자
            const itemType = pages[idx].itemType === 'section' ? '섹션' : '페이지';
            let itemName;
            if (pages[idx].itemType === 'section') {
                itemName = pages[idx].title || 'Section';
            } else {
                // 섹션을 제외한 실제 페이지 번호 계산
                let actualPageNumber = 0;
                for (let i = 0; i <= idx; i++) {
                    if (pages[i].itemType !== 'section') {
                        actualPageNumber++;
                    }
                }
                itemName = pages[idx].title || '#' + actualPageNumber;
            }

            if (confirm(itemType + ' "' + itemName + '"을(를) 삭제하시겠습니까?')) {
                pages.splice(idx, 1);
                saveToStorage();
                updatePagesList();
                updatePreview();
                showNotification(itemType + '이(가) 삭제되었습니다.');
            }
        });
    });
    
    // 전체 통계 업데이트
    updateTotalStats();
}


function getPreviewData() {
    const ctx = collectEditorData();
    if (currentEditingIndex !== null && currentEditingIndex < pages.length) {
        const page = pages[currentEditingIndex];
        const updatedPages = pages.slice();
        updatedPages[currentEditingIndex] = Object.assign({}, page, {
            content: (document.getElementById('pageContent') || {}).value || page.content
        });
        return Object.assign({}, ctx, { pages: updatedPages });
    }
    return ctx;
}

function updatePreview() {
    const activeTab = document.querySelector('.tab-content.active');
    const preview = document.getElementById('preview');
    if (activeTab && activeTab.id === 'tab-description') {
        preview.innerHTML = generateIntroHTML(collectEditorData());
    } else if (activeTab && activeTab.id === 'tab-pages') {
        const ctx = Object.assign({}, collectEditorData(), { enableTopSection: false, enableComment: false });
        preview.innerHTML = generateHTML(ctx, true);
    } else {
        preview.innerHTML = generateHTML(getPreviewData(), true);
    }
}

async function copyToClipboard() {
    const content = generateHTML(collectEditorData(), false);

    try {
        await navigator.clipboard.writeText(content);
        showNotification('HTML 코드가 복사되었습니다!');

        // 미리보기 화면도 갱신 (선택사항, 하지만 일관성을 위해)
        updatePreview();
    } catch (err) {
        // 클립보드 API 실패 시 fallback
        const textarea = document.createElement('textarea');
        textarea.value = content;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showNotification('HTML 코드가 복사되었습니다!');
        } catch (e) {
            console.error('복사 실패:', e);
            showNotification('복사에 실패했습니다.');
        }
        document.body.removeChild(textarea);
    }
}
function moveProfileUp(index) {
    if (index > 0) {
        const temp = profiles[index];
        profiles[index] = profiles[index - 1];
        profiles[index - 1] = temp;
        updateProfilesList();
        updatePreview();
        saveToStorage();
    }
}

function moveProfileDown(index) {
    if (index < profiles.length - 1) {
        const temp = profiles[index];
        profiles[index] = profiles[index + 1];
        profiles[index + 1] = temp;
        updateProfilesList();
        updatePreview();
        saveToStorage();
    }
}

// 모바일 프리뷰 토글 기능
(function () {
    const toggleBtn = document.getElementById('togglePreview');
    const previewPanel = document.querySelector('.preview-panel');
    const eyeIcon = document.getElementById('icon-preview-eye');
    const editIcon = document.getElementById('icon-preview-edit');

    if (!toggleBtn || !previewPanel) return;

    // 아이콘 전환 함수
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

    // 프리뷰 토글
    toggleBtn.addEventListener('click', function () {
        const isVisible = previewPanel.classList.toggle('mobile-visible');
        toggleIcons(isVisible);
    });

    // 프리뷰 패널의 닫기 버튼 (::before pseudo-element)
    previewPanel.addEventListener('click', function (e) {
        // 프리뷰 패널의 배경이나 닫기 영역 클릭 시
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

    // ESC 키로 프리뷰 닫기
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && previewPanel.classList.contains('mobile-visible')) {
            previewPanel.classList.remove('mobile-visible');
            toggleIcons(false);
        }
    });
})();

// ========================================
//  프리셋 기능
// ========================================

// 프리셋 초기화
function initializePresets() {
    const presetsContainer = document.getElementById('presetSlots');
    if (!presetsContainer) return;

    // 저장된 프리셋 불러오기
    loadPresets();
}

// 프리셋 불러오기
function loadPresets() {
    try {
        const savedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
        const presets = savedPresets ? JSON.parse(savedPresets) : {};
        
        renderPresetSlots(presets);
    } catch (error) {
        console.error('프리셋 불러오기 실패:', error);
    }
}

// 프리셋 슬롯 렌더링
function renderPresetSlots(presets) {
    const presetsContainer = document.getElementById('presetSlots');
    if (!presetsContainer) return;
    
    presetsContainer.innerHTML = '';
    
    // 저장된 프리셋들을 슬롯으로 렌더링
    const presetKeys = Object.keys(presets).map(Number).sort((a, b) => a - b);
    
    presetKeys.forEach(index => {
        const preset = presets[index];
        const slotDiv = document.createElement('div');
        slotDiv.className = 'preset-slot has-data';
        slotDiv.dataset.slotIndex = index;
        
        slotDiv.innerHTML = `
            <div class="preset-number">${index + 1}</div>
            <div class="preset-info">
                <div class="preset-name">${preset.name || `프리셋 ${index + 1}`}</div>
                <div class="preset-date">${preset.date || ''}</div>
            </div>
            <div class="preset-actions">
                <button class="btn-load-preset" onclick="loadPreset(${index})">불러오기</button>
                <button class="btn-save-preset" onclick="savePreset(${index})">덮어쓰기</button>
                <button class="btn-rename-preset" onclick="renamePreset(${index})" title="이름 수정">✎</button>
                <button class="btn-delete-preset" onclick="deletePreset(${index})" title="삭제">×</button>
            </div>
        `;
        
        presetsContainer.appendChild(slotDiv);
    });
    
    // 현재 프리셋 저장 버튼 (항상 맨 아래)
    const saveNewBtn = document.createElement('button');
    saveNewBtn.className = 'btn-save-new-preset';
    saveNewBtn.textContent = presetKeys.length === 0 ? '프리셋 저장하기' : '+ 새 프리셋 저장';
    saveNewBtn.onclick = saveNewPreset;
    presetsContainer.appendChild(saveNewBtn);
}

// 새 프리셋 저장 (빈 슬롯 찾아서 저장)
function saveNewPreset() {
    try {
        const savedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
        const presets = savedPresets ? JSON.parse(savedPresets) : {};
        
        // 비어있는 가장 작은 인덱스 찾기
        let newIndex = 0;
        while (presets[newIndex] !== undefined) {
            newIndex++;
        }
        
        if (newIndex >= 20) {
            alert('프리셋은 최대 20개까지 저장할 수 있습니다.');
            return;
        }
        
        const presetName = prompt('프리셋 이름을 입력하세요:', `프리셋 ${newIndex + 1}`);
        if (presetName === null || presetName.trim() === '') return; // 취소 또는 빈 문자열
        
        // 현재 상태 수집
        const currentData = collectEditorData();
        
        presets[newIndex] = {
            name: presetName.trim(),
            date: new Date().toLocaleString('ko-KR'),
            data: currentData
        };
        
        localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
        
        loadPresets();
        showNotification(`프리셋 "${presetName}" 저장 완료!`);
    } catch (error) {
        console.error('프리셋 저장 실패:', error);
        showNotification('프리셋 저장 실패: ' + error.message);
    }
}

// 현재 설정을 프리셋으로 저장
function savePreset(slotIndex) {
    try {
        const presetName = prompt('프리셋 이름을 입력하세요:', `프리셋 ${slotIndex + 1}`);
        if (presetName === null) return; // 취소
        
        // 현재 상태 수집
        const currentData = collectEditorData();
        
        // 프리셋 저장
        const savedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
        const presets = savedPresets ? JSON.parse(savedPresets) : {};
        
        presets[slotIndex] = {
            name: presetName,
            date: new Date().toLocaleString('ko-KR'),
            data: currentData
        };
        
        localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
        
        // UI 업데이트
        loadPresets();
        showNotification(`프리셋 "${presetName}" 저장 완료!`);
    } catch (error) {
        console.error('프리셋 저장 실패:', error);
        showNotification('프리셋 저장 실패: ' + error.message);
    }
}

// 프리셋 불러오기
function loadPreset(slotIndex) {
    try {
        const savedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
        if (!savedPresets) return;
        
        const presets = JSON.parse(savedPresets);
        const preset = presets[slotIndex];
        
        if (!preset || !preset.data) {
            showNotification('프리셋 데이터가 없습니다.');
            return;
        }
        
        if (!confirm(`"${preset.name}" 프리셋을 불러오시겠습니까?\n현재 작업 중인 데이터가 사라집니다.`)) {
            return;
        }
        
        const data = preset.data;
        
        // 데이터 복원
        if (data.useRoundedQuotes !== undefined) document.getElementById('useRoundedQuotes').checked = data.useRoundedQuotes;
        if (data.useTextIndent !== undefined) document.getElementById('useTextIndent').checked = data.useTextIndent;
        if (data.enableCover !== undefined) {
            document.getElementById('enableCover').checked = data.enableCover;
            document.getElementById('coverContent').style.display = data.enableCover ? 'block' : 'none';
        }
        if (data.coverImage !== undefined) document.getElementById('coverImage').value = data.coverImage;
        if (data.coverAutoFit !== undefined) {
            document.getElementById('coverAutoFit').checked = data.coverAutoFit;
            const coverManualControls = document.getElementById('coverManualControls');
            if (coverManualControls) {
                coverManualControls.style.display = data.coverAutoFit ? 'none' : 'block';
            }
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
        
        if (data.enableProfiles !== undefined) {
            document.getElementById('enableProfiles').checked = data.enableProfiles;
            document.getElementById('profileInputs').style.display = data.enableProfiles ? 'block' : 'none';
        }
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

        // 커스텀 색상 복원
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

        localImages = data.localImages ? JSON.parse(JSON.stringify(data.localImages)) : {};

        // 배열 데이터 복원
        if (data.pages) {
            pages = JSON.parse(JSON.stringify(data.pages));
            pages = pages.map(function (item) {
                if (item.content) item.content = migrateLocalImagesInText(item.content);
                if (item.image) item.image = migrateLocalImageValue(item.image);
                if (item.bgImage) item.bgImage = migrateLocalImageValue(item.bgImage);
                if (item.headerImage) item.headerImage = migrateLocalImageValue(item.headerImage);
                return item;
            });
            updatePagesList();
        }
        if (data.tags) {
            tags = JSON.parse(JSON.stringify(data.tags));
            updateTagsList();
        }
        if (data.replacements) {
            replacements = JSON.parse(JSON.stringify(data.replacements));
            updateReplacementsList();
        }
        if (data.customThemes) {
            customThemes = JSON.parse(JSON.stringify(data.customThemes));
            updateCustomThemesList();
        }
        if (data.profiles) {
            profiles = JSON.parse(JSON.stringify(data.profiles));
            profiles = profiles.map(function (profile) {
                profile.imageUrl = migrateLocalImageValue(profile.imageUrl);
                return profile;
            });
            updateProfilesList();
        }

        // 텍스트 간격 복원
        if (data.textSpacing) {
            textSpacing = data.textSpacing;
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

        // 폰트 복원
        if (data.fontFamily) {
            fontFamily = data.fontFamily;
            const fontFamilySelect = document.getElementById('fontFamily');
            if (fontFamilySelect) fontFamilySelect.value = fontFamily;
        }

        // 제목 크기 복원
        if (data.headingFontSizes) {
            headingFontSizes = { ...headingFontSizes, ...data.headingFontSizes };
            const _hmap2 = {
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
                if (!_hmap2[k]) return;
                const sl = document.getElementById(_hmap2[k].slider);
                const inp = document.getElementById(_hmap2[k].input);
                const dsp = document.getElementById(_hmap2[k].display);
                if (sl) sl.value = headingFontSizes[k];
                if (inp) inp.value = headingFontSizes[k];
                if (dsp) dsp.textContent = headingFontSizes[k] + 'px';
            });
        }

        // 전역 테마 복원
        if (data.globalTheme) {
            globalTheme = data.globalTheme;
            const themeSelect = document.getElementById('globalTheme');
            if (themeSelect) themeSelect.value = globalTheme;
        }

        // 페이지 번호 숨김 설정 복원
        if (data.hidePageNumbers !== undefined) {
            hidePageNumbers = data.hidePageNumbers;
            const hidePageNumbersCheckbox = document.getElementById('hidePageNumbers');
            if (hidePageNumbersCheckbox) hidePageNumbersCheckbox.checked = hidePageNumbers;
        }

        // 페이지 접기 설정 복원
        if (data.enablePageFold !== undefined) {
            enablePageFold = data.enablePageFold;
        } else {
            enablePageFold = true;
        }
        const presetPageFoldEl = document.getElementById('enablePageFold');
        if (presetPageFoldEl) presetPageFoldEl.checked = enablePageFold;

        showHeaderWhenFoldOff = data.showHeaderWhenFoldOff || false;
        const presetShEl = document.getElementById('showHeaderWhenFoldOff');
        if (presetShEl) presetShEl.checked = showHeaderWhenFoldOff;

        dividerStyle = data.dividerStyle || 'line';
        dividerCustomText = data.dividerCustomText || '';
        const presetDsEl = document.getElementById('dividerStyle');
        const presetDcEl = document.getElementById('dividerCustomText');
        if (presetDsEl) { presetDsEl.value = dividerStyle; }
        if (presetDcEl) { presetDcEl.value = dividerCustomText; presetDcEl.style.display = dividerStyle === 'custom' ? 'block' : 'none'; }

        // 미리보기 업데이트 및 로컬 스토리지 저장
        updatePreview();
        saveToStorage();
        
        showNotification(`프리셋 "${preset.name}" 불러오기 완료!`);
    } catch (error) {
        console.error('프리셋 불러오기 실패:', error);
        showNotification('프리셋 불러오기 실패: ' + error.message);
    }
}

// 프리셋 삭제
function deletePreset(slotIndex) {
    try {
        const savedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
        if (!savedPresets) return;
        
        const presets = JSON.parse(savedPresets);
        const preset = presets[slotIndex];
        
        if (!preset) return;
        
        if (!confirm(`"${preset.name}" 프리셋을 삭제하시겠습니까?`)) {
            return;
        }
        
        delete presets[slotIndex];
        localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
        
        loadPresets();
        showNotification('프리셋 삭제 완료!');
    } catch (error) {
        console.error('프리셋 삭제 실패:', error);
        showNotification('프리셋 삭제 실패: ' + error.message);
    }
}

// 프리셋 이름 수정
function renamePreset(slotIndex) {
    try {
        const savedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
        if (!savedPresets) return;
        
        const presets = JSON.parse(savedPresets);
        const preset = presets[slotIndex];
        
        if (!preset) return;
        
        const newName = prompt('새로운 프리셋 이름을 입력하세요:', preset.name);
        if (newName === null || newName.trim() === '') return; // 취소 또는 빈 문자열
        
        preset.name = newName.trim();
        localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
        
        loadPresets();
        showNotification('프리셋 이름 변경 완료!');
    } catch (error) {
        console.error('프리셋 이름 변경 실패:', error);
        showNotification('프리셋 이름 변경 실패: ' + error.message);
    }
}
