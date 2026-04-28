let selectedQuoteTargets = [];

function getQuoteTargetKey(target) {
    return [
        target.pageIndex,
        target.lineIndex,
        target.quoteSource
    ].join('::');
}

function getQuoteTargetFromElement(element) {
    return {
        element: element,
        pageIndex: parseInt(element.dataset.pageIndex, 10),
        lineIndex: parseInt(element.dataset.lineIndex, 10),
        quoteSource: element.dataset.quoteSource || ''
    };
}

function syncQuoteSelectionStyles() {
    document.querySelectorAll('.js-quote-assign.selected-quote').forEach(function (element) {
        element.classList.remove('selected-quote');
    });
    selectedQuoteTargets.forEach(function (target) {
        if (target.element && document.body.contains(target.element)) {
            target.element.classList.add('selected-quote');
        }
    });
}

function clearSelectedQuoteTargets() {
    selectedQuoteTargets = [];
    syncQuoteSelectionStyles();
}

function toggleSelectedQuoteTarget(element) {
    const target = getQuoteTargetFromElement(element);
    const key = getQuoteTargetKey(target);
    const existingIndex = selectedQuoteTargets.findIndex(function (item) {
        return getQuoteTargetKey(item) === key;
    });

    if (existingIndex >= 0) {
        selectedQuoteTargets.splice(existingIndex, 1);
    } else {
        selectedQuoteTargets.push(target);
    }

    if (selectedQuoteTargets.length === 0) {
        selectedQuoteTargets.push(target);
    }
    syncQuoteSelectionStyles();
}

function replaceQuoteWithCharacter(content, lineIndex, quoteSource, profileIndex) {
    if (!quoteSource) return content;
    const replacement = '[CHAR:' + profileIndex + ']' + quoteSource + '[/CHAR]';
    if (content.includes(replacement)) return content;
    const charWrapped = new RegExp('\\[CHAR:\\d+\\]' + escapeRegExp(quoteSource) + '\\[\\/CHAR\\]');
    const lines = content.split('\n');
    if (lineIndex >= 0 && lineIndex < lines.length) {
        if (charWrapped.test(lines[lineIndex])) {
            lines[lineIndex] = lines[lineIndex].replace(charWrapped, replacement);
        } else {
            lines[lineIndex] = lines[lineIndex].replace(quoteSource, replacement);
        }
        return lines.join('\n');
    }
    return charWrapped.test(content) ? content.replace(charWrapped, replacement) : content.replace(quoteSource, replacement);
}

function removeQuoteCharacter(content, lineIndex, quoteSource) {
    if (!quoteSource) return content;
    const charWrapped = new RegExp('\\[CHAR:\\d+\\]' + escapeRegExp(quoteSource) + '\\[\\/CHAR\\]');
    const lines = content.split('\n');
    if (lineIndex >= 0 && lineIndex < lines.length) {
        lines[lineIndex] = lines[lineIndex].replace(charWrapped, quoteSource);
        return lines.join('\n');
    }
    return content.replace(charWrapped, quoteSource);
}

function applyQuoteCharacter(pageIndex, lineIndex, quoteSource, profileIndex) {
    if (pageIndex < 0 || pageIndex >= pages.length || !pages[pageIndex] || pages[pageIndex].itemType === 'section') return;
    pages[pageIndex].content = replaceQuoteWithCharacter(pages[pageIndex].content || '', lineIndex, quoteSource, profileIndex);
    transientExpandedPageIndexes = [pageIndex];

    const pageContent = document.getElementById('pageContent');
    if (currentEditingIndex === pageIndex && pageContent) {
        pageContent.value = pages[pageIndex].content;
        updatePageStats();
    }

    updatePreview();
    updatePagesList();
    saveToStorage();
}

function applyQuoteCharacterBatch(targets, profileIndex) {
    const changedPages = [];
    targets.forEach(function (target) {
        const pageIndex = target.pageIndex;
        if (pageIndex < 0 || pageIndex >= pages.length || !pages[pageIndex] || pages[pageIndex].itemType === 'section') return;
        pages[pageIndex].content = replaceQuoteWithCharacter(pages[pageIndex].content || '', target.lineIndex, target.quoteSource, profileIndex);
        if (changedPages.indexOf(pageIndex) === -1) changedPages.push(pageIndex);
    });

    if (changedPages.length === 0) return;
    transientExpandedPageIndexes = changedPages;

    const pageContent = document.getElementById('pageContent');
    if (currentEditingIndex !== null && changedPages.indexOf(currentEditingIndex) !== -1 && pageContent) {
        pageContent.value = pages[currentEditingIndex].content;
        updatePageStats();
    }

    updatePreview();
    updatePagesList();
    saveToStorage();
}

function clearQuoteCharacter(pageIndex, lineIndex, quoteSource) {
    if (pageIndex < 0 || pageIndex >= pages.length || !pages[pageIndex] || pages[pageIndex].itemType === 'section') return;
    pages[pageIndex].content = removeQuoteCharacter(pages[pageIndex].content || '', lineIndex, quoteSource);
    transientExpandedPageIndexes = [pageIndex];

    const pageContent = document.getElementById('pageContent');
    if (currentEditingIndex === pageIndex && pageContent) {
        pageContent.value = pages[pageIndex].content;
        updatePageStats();
    }

    updatePreview();
    updatePagesList();
    saveToStorage();
}

function clearQuoteCharacterBatch(targets) {
    const changedPages = [];
    targets.forEach(function (target) {
        const pageIndex = target.pageIndex;
        if (pageIndex < 0 || pageIndex >= pages.length || !pages[pageIndex] || pages[pageIndex].itemType === 'section') return;
        pages[pageIndex].content = removeQuoteCharacter(pages[pageIndex].content || '', target.lineIndex, target.quoteSource);
        if (changedPages.indexOf(pageIndex) === -1) changedPages.push(pageIndex);
    });

    if (changedPages.length === 0) return;
    transientExpandedPageIndexes = changedPages;

    const pageContent = document.getElementById('pageContent');
    if (currentEditingIndex !== null && changedPages.indexOf(currentEditingIndex) !== -1 && pageContent) {
        pageContent.value = pages[currentEditingIndex].content;
        updatePageStats();
    }

    updatePreview();
    updatePagesList();
    saveToStorage();
}

function closeQuoteCharacterMenu() {
    const existing = document.getElementById('quoteCharacterMenu');
    if (existing) existing.remove();
    clearSelectedQuoteTargets();
}

function openQuoteCharacterMenu(target) {
    const existing = document.getElementById('quoteCharacterMenu');
    if (existing) existing.remove();
    if (!profiles.length) {
        clearSelectedQuoteTargets();
        showNotification('등록된 프로필이 없습니다.');
        return;
    }

    const menu = document.createElement('div');
    menu.id = 'quoteCharacterMenu';
    menu.className = 'quote-character-menu';
    const selectedCount = selectedQuoteTargets.length || 1;

    const status = document.createElement('div');
    status.className = 'quote-character-status';
    status.textContent = selectedCount + '개 대사 선택됨';
    menu.appendChild(status);

    profiles.forEach(function (profile, index) {
        if (!profile.name && !profile.tag) return;
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'quote-character-option';
        item.innerHTML =
            '<span class="quote-character-swatch" style="background:' + (profile.color || '#5a9ace') + ';"></span>' +
            '<span>' + escapeHtml(profile.name || profile.tag || ('Profile ' + (index + 1))) + '</span>';
        item.addEventListener('click', function () {
            applyQuoteCharacterBatch(selectedQuoteTargets.slice(), index);
            closeQuoteCharacterMenu();
            showNotification(selectedCount + '개 대사 색상이 적용되었습니다.');
        });
        menu.appendChild(item);
    });

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'quote-character-option quote-character-clear';
    clearButton.innerHTML =
        '<span class="quote-character-swatch quote-character-clear-icon">×</span>' +
        '<span>색상 해제</span>';
    clearButton.addEventListener('click', function () {
        clearQuoteCharacterBatch(selectedQuoteTargets.slice());
        closeQuoteCharacterMenu();
        showNotification(selectedCount + '개 대사 색상이 해제되었습니다.');
    });
    menu.appendChild(clearButton);

    document.body.appendChild(menu);
    const rect = target.getBoundingClientRect();
    menu.style.left = Math.min(rect.left + window.scrollX, window.scrollX + window.innerWidth - menu.offsetWidth - 12) + 'px';
    menu.style.top = (rect.bottom + window.scrollY + 6) + 'px';
}
