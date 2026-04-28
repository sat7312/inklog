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
