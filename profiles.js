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

        profileSection.innerHTML =
            '<div class="profile-header">' +
            '<div class="profile-title-group profile-header-toggle" data-index="' + index + '" style="cursor:pointer;">' +
            '<span class="profile-title" id="profileTitle' + index + '">' + (profile.name ? profile.name : 'PROFILE #' + (index + 1)) + '</span>' +
            '</div>' +
            '<div class="page-controls">' +
            '<button class="btn-move btn-profile-move-up" data-index="' + index + '" title="위로">▲</button>' +
            '<button class="btn-move btn-profile-move-down" data-index="' + index + '" title="아래로">▼</button>' +
            '<button class="btn-profile-delete" data-index="' + index + '" title="프로필 삭제">×</button>' +
            '</div>' +
            '</div>' +
            '<div class="profile-body">' +
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
            '<button class="btn-ghost full-width btn-profile-local-image" type="button" data-index="' + index + '" style="margin-top: 8px;">로컬 이미지 선택</button>' +
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
            '</div>' +
            '<div class="input-group">' +
            '<label>캐릭터 색상</label>' +
            '<div class="profile-color-row">' +
            '<button class="profile-color-chip" type="button" style="background:' + (profile.color || '#5a9ace') + ';" data-index="' + index + '" title="색상 미리보기"></button>' +
            '<input type="text" class="profile-color-text-input" placeholder="#5a9ace" value="' + (profile.color || '') + '" data-index="' + index + '">' +
            '<button class="btn-move btn-profile-eyedropper" type="button" data-index="' + index + '" title="스포이드">⌖</button>' +
            '</div>' +
            '<div class="profile-color-palette">' +
            PROFILE_COLOR_PRESETS.map(function (color) {
                return '<button class="profile-color-swatch" type="button" style="background:' + color + ';" data-index="' + index + '" data-color="' + color + '" title="' + color + '"></button>';
            }).join('') +
            '</div>' +
            '</div>' +
            '</div>';

        profilesList.appendChild(profileSection);
    });

    attachProfileEvents(profilesList);
}

function attachProfileEvents(profilesList) {
    profilesList.querySelectorAll('.profile-header-toggle').forEach(el => {
        el.addEventListener('click', function () {
            const section = this.closest('.profile-section');
            section.classList.toggle('collapsed');
        });
    });

    profilesList.querySelectorAll('.profile-name-input').forEach(input => {
        input.addEventListener('input', e => {
            const idx = parseInt(e.target.dataset.index);
            profiles[idx].name = e.target.value;
            const titleEl = document.getElementById('profileTitle' + idx);
            if (titleEl) titleEl.textContent = e.target.value || 'PROFILE #' + (idx + 1);
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

    function setProfileColor(idx, value) {
        profiles[idx].color = value;
        const textInput = profilesList.querySelector('.profile-color-text-input[data-index="' + idx + '"]');
        const chip = profilesList.querySelector('.profile-color-chip[data-index="' + idx + '"]');
        if (textInput) textInput.value = value;
        if (chip && /^#[0-9a-fA-F]{6}$/.test(value)) chip.style.background = value;
        updatePreview(); saveToStorage();
    }

    profilesList.querySelectorAll('.profile-color-text-input').forEach(input => {
        input.addEventListener('input', e => {
            const idx = parseInt(e.target.dataset.index);
            const value = e.target.value.trim();
            profiles[idx].color = value;
            if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                const chip = profilesList.querySelector('.profile-color-chip[data-index="' + idx + '"]');
                if (chip) chip.style.background = value;
            }
            updatePreview(); saveToStorage();
        });
    });
    profilesList.querySelectorAll('.profile-color-swatch').forEach(btn => {
        btn.addEventListener('click', e => {
            setProfileColor(parseInt(e.currentTarget.dataset.index), e.currentTarget.dataset.color);
        });
    });
    profilesList.querySelectorAll('.profile-color-chip').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(e.currentTarget.dataset.index);
            const current = profiles[idx].color || '#5a9ace';
            const nextIndex = (PROFILE_COLOR_PRESETS.indexOf(current.toLowerCase()) + 1) % PROFILE_COLOR_PRESETS.length;
            setProfileColor(idx, PROFILE_COLOR_PRESETS[nextIndex]);
        });
    });
    profilesList.querySelectorAll('.btn-profile-eyedropper').forEach(btn => {
        const isSupported = 'EyeDropper' in window;
        btn.style.display = isSupported ? 'flex' : 'none';
        if (!isSupported) return;
        btn.addEventListener('click', async e => {
            try {
                const eyeDropper = new EyeDropper();
                const result = await eyeDropper.open();
                setProfileColor(parseInt(e.currentTarget.dataset.index), result.sRGBHex);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    showNotification('스포이드 사용 실패');
                }
            }
        });
    });
    profilesList.querySelectorAll('.btn-profile-move-up').forEach(btn => {
        btn.addEventListener('click', e => {
            moveProfileUp(parseInt(e.target.dataset.index));
        });
    });
    profilesList.querySelectorAll('.btn-profile-move-down').forEach(btn => {
        btn.addEventListener('click', e => {
            moveProfileDown(parseInt(e.target.dataset.index));
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
