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

function closeQuoteCharacterMenu() {
    const existing = document.getElementById('quoteCharacterMenu');
    if (existing) existing.remove();
}

function openQuoteCharacterMenu(target, pageIndex, lineIndex, quoteSource) {
    closeQuoteCharacterMenu();
    if (!profiles.length) {
        showNotification('등록된 프로필이 없습니다.');
        return;
    }

    const menu = document.createElement('div');
    menu.id = 'quoteCharacterMenu';
    menu.className = 'quote-character-menu';
    profiles.forEach(function (profile, index) {
        if (!profile.name && !profile.tag) return;
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'quote-character-option';
        item.innerHTML =
            '<span class="quote-character-swatch" style="background:' + (profile.color || '#5a9ace') + ';"></span>' +
            '<span>' + escapeHtml(profile.name || profile.tag || ('Profile ' + (index + 1))) + '</span>';
        item.addEventListener('click', function () {
            applyQuoteCharacter(pageIndex, lineIndex, quoteSource, index);
            closeQuoteCharacterMenu();
            showNotification('대사 색상이 적용되었습니다.');
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
        clearQuoteCharacter(pageIndex, lineIndex, quoteSource);
        closeQuoteCharacterMenu();
        showNotification('대사 색상이 해제되었습니다.');
    });
    menu.appendChild(clearButton);

    document.body.appendChild(menu);
    const rect = target.getBoundingClientRect();
    menu.style.left = Math.min(rect.left + window.scrollX, window.scrollX + window.innerWidth - menu.offsetWidth - 12) + 'px';
    menu.style.top = (rect.bottom + window.scrollY + 6) + 'px';
}
