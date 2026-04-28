function initializePresets() {
    const presetsContainer = document.getElementById('presetSlots');
    if (!presetsContainer) return;
    loadPresets();
}

function loadPresets() {
    try {
        const savedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
        const presets = savedPresets ? JSON.parse(savedPresets) : {};
        renderPresetSlots(presets);
    } catch (error) {
        console.error('프리셋 불러오기 실패:', error);
    }
}

function renderPresetSlots(presets) {
    const presetsContainer = document.getElementById('presetSlots');
    if (!presetsContainer) return;

    presetsContainer.innerHTML = '';

    const presetKeys = Object.keys(presets).map(Number).sort((a, b) => a - b);

    presetKeys.forEach(index => {
        const preset = presets[index];
        const slotDiv = document.createElement('div');
        slotDiv.className = 'preset-slot has-data';
        slotDiv.dataset.slotIndex = index;
        const presetName = escapeHtml(preset.name || `프리셋 ${index + 1}`);
        const presetDate = escapeHtml(preset.date || '');

        slotDiv.innerHTML = `
            <div class="preset-number">${index + 1}</div>
            <div class="preset-info">
                <div class="preset-name">${presetName}</div>
                <div class="preset-date">${presetDate}</div>
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

    const saveNewBtn = document.createElement('button');
    saveNewBtn.className = 'btn-save-new-preset';
    saveNewBtn.textContent = presetKeys.length === 0 ? '프리셋 저장하기' : '+ 새 프리셋 저장';
    saveNewBtn.onclick = saveNewPreset;
    presetsContainer.appendChild(saveNewBtn);
}

function saveNewPreset() {
    try {
        const savedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
        const presets = savedPresets ? JSON.parse(savedPresets) : {};

        let newIndex = 0;
        while (presets[newIndex] !== undefined) newIndex++;

        if (newIndex >= 20) {
            alert('프리셋은 최대 20개까지 저장할 수 있습니다.');
            return;
        }

        const presetName = prompt('프리셋 이름을 입력하세요:', `프리셋 ${newIndex + 1}`);
        if (presetName === null || presetName.trim() === '') return;

        presets[newIndex] = {
            name: presetName.trim(),
            date: new Date().toLocaleString('ko-KR'),
            data: collectEditorData()
        };

        localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
        loadPresets();
        showNotification(`프리셋 "${presetName}" 저장 완료!`);
    } catch (error) {
        console.error('프리셋 저장 실패:', error);
        showNotification('프리셋 저장 실패: ' + error.message);
    }
}

function savePreset(slotIndex) {
    try {
        const presetName = prompt('프리셋 이름을 입력하세요:', `프리셋 ${slotIndex + 1}`);
        if (presetName === null) return;

        const savedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
        const presets = savedPresets ? JSON.parse(savedPresets) : {};

        presets[slotIndex] = {
            name: presetName,
            date: new Date().toLocaleString('ko-KR'),
            data: collectEditorData()
        };

        localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
        loadPresets();
        showNotification(`프리셋 "${presetName}" 저장 완료!`);
    } catch (error) {
        console.error('프리셋 저장 실패:', error);
        showNotification('프리셋 저장 실패: ' + error.message);
    }
}

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

        if (!confirm(`"${preset.name}" 프리셋을 불러오시겠습니까?\n현재 작업 중인 데이터가 사라집니다.`)) return;

        const data = preset.data;

        if (data.useRoundedQuotes !== undefined) document.getElementById('useRoundedQuotes').checked = data.useRoundedQuotes;
        if (data.useTextIndent !== undefined) document.getElementById('useTextIndent').checked = data.useTextIndent;
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

        localImages = data.localImages ? JSON.parse(JSON.stringify(data.localImages)) : {};

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
        if (data.tags) { tags = JSON.parse(JSON.stringify(data.tags)); updateTagsList(); }
        if (data.replacements) { replacements = JSON.parse(JSON.stringify(data.replacements)); updateReplacementsList(); }
        if (data.customThemes) { customThemes = JSON.parse(JSON.stringify(data.customThemes)); updateCustomThemesList(); }
        if (data.profiles) {
            profiles = JSON.parse(JSON.stringify(data.profiles));
            profiles = profiles.map(function (profile) {
                profile.imageUrl = migrateLocalImageValue(profile.imageUrl);
                return profile;
            });
            updateProfilesList();
        }

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

        if (data.fontFamily) {
            fontFamily = data.fontFamily;
            const fontFamilySelect = document.getElementById('fontFamily');
            if (fontFamilySelect) fontFamilySelect.value = fontFamily;
        }

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

        if (data.globalTheme) {
            globalTheme = data.globalTheme;
            const themeSelect = document.getElementById('globalTheme');
            if (themeSelect) themeSelect.value = globalTheme;
        }

        if (data.hidePageNumbers !== undefined) {
            hidePageNumbers = data.hidePageNumbers;
            const hidePageNumbersCheckbox = document.getElementById('hidePageNumbers');
            if (hidePageNumbersCheckbox) hidePageNumbersCheckbox.checked = hidePageNumbers;
        }

        enablePageFold = data.enablePageFold !== undefined ? data.enablePageFold : true;
        const presetPageFoldEl = document.getElementById('enablePageFold');
        if (presetPageFoldEl) presetPageFoldEl.checked = enablePageFold;

        showHeaderWhenFoldOff = data.showHeaderWhenFoldOff || false;
        const presetShEl = document.getElementById('showHeaderWhenFoldOff');
        if (presetShEl) presetShEl.checked = showHeaderWhenFoldOff;

        dividerStyle = data.dividerStyle || 'line';
        dividerCustomText = data.dividerCustomText || '';
        const presetDsEl = document.getElementById('dividerStyle');
        const presetDcEl = document.getElementById('dividerCustomText');
        if (presetDsEl) presetDsEl.value = dividerStyle;
        if (presetDcEl) { presetDcEl.value = dividerCustomText; presetDcEl.style.display = dividerStyle === 'custom' ? 'block' : 'none'; }

        updatePreview();
        saveToStorage();
        showNotification(`프리셋 "${preset.name}" 불러오기 완료!`);
    } catch (error) {
        console.error('프리셋 불러오기 실패:', error);
        showNotification('프리셋 불러오기 실패: ' + error.message);
    }
}

function deletePreset(slotIndex) {
    try {
        const savedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
        if (!savedPresets) return;

        const presets = JSON.parse(savedPresets);
        const preset = presets[slotIndex];
        if (!preset) return;

        if (!confirm(`"${preset.name}" 프리셋을 삭제하시겠습니까?`)) return;

        delete presets[slotIndex];
        localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
        loadPresets();
        showNotification('프리셋 삭제 완료!');
    } catch (error) {
        console.error('프리셋 삭제 실패:', error);
        showNotification('프리셋 삭제 실패: ' + error.message);
    }
}

function renamePreset(slotIndex) {
    try {
        const savedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
        if (!savedPresets) return;

        const presets = JSON.parse(savedPresets);
        const preset = presets[slotIndex];
        if (!preset) return;

        const newName = prompt('새로운 프리셋 이름을 입력하세요:', preset.name);
        if (newName === null || newName.trim() === '') return;

        preset.name = newName.trim();
        localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
        loadPresets();
        showNotification('프리셋 이름 변경 완료!');
    } catch (error) {
        console.error('프리셋 이름 변경 실패:', error);
        showNotification('프리셋 이름 변경 실패: ' + error.message);
    }
}
