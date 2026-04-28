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
let transientExpandedPageIndexes = [];
let editorTitle = '';

const PROFILE_COLOR_PRESETS = [
    '#c77d8e', '#5a9ace', '#6b8e65', '#d4a841',
    '#9d5f8f', '#4a9d88', '#e07a5f', '#7b68a8',
    '#8b6f47', '#707070'
];

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

const PRESET_STORAGE_KEY = 'rpLogEditorPresets';

const DEFAULT_TAGS = [
    { name: 'Bot', value: 'Bot', link: '' },
    { name: 'Model', value: 'Model', link: '' },
    { name: 'Prompt', value: 'Prompt', link: '' },
    { name: 'Language', value: 'Eng', link: '' }
];
