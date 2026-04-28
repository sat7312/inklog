function addCustomTheme() {
    if (customThemes.length >= 20) {
        alert('커스텀 테마는 최대 20개까지만 저장할 수 있습니다.');
        return;
    }

    const themeName = prompt('테마 이름을 입력하세요:', '커스텀 테마 ' + (customThemes.length + 1));
    if (themeName === null || themeName.trim() === '') return;

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
            loadCustomTheme(parseInt(e.target.dataset.index));
        });
    });
    document.querySelectorAll('.btn-overwrite-theme').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            overwriteCustomTheme(parseInt(e.target.dataset.index));
        });
    });
    document.querySelectorAll('.btn-rename-theme').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            renameCustomTheme(parseInt(e.target.dataset.index));
        });
    });
    document.querySelectorAll('.btn-delete-theme').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            deleteCustomTheme(parseInt(e.target.dataset.index));
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

    if (!confirm('"' + theme.name + '" 테마를 현재 색상으로 덮어쓰시겠습니까?')) return;

    customThemes[index] = {
        name: theme.name,
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
    if (newName === null || newName.trim() === '') return;

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
