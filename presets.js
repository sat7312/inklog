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

        const data = migrateEditorData(preset.data);
        applyEditorDataToForm(data);

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
