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

function updatePanelTitle() {
    const el = document.getElementById('panelTitle');
    if (!el) return;
    const title = (editorTitle || getInputValue('coverTitle')).trim();
    el.textContent = title || 'InkLog';
    document.title = title ? title + ' - InkLog' : 'InkLog';
}

function updatePreview() {
    updatePanelTitle();
    const activeTab = document.querySelector('.tab-content.active');
    const preview = document.getElementById('preview');
    if (activeTab && activeTab.id === 'tab-description') {
        preview.innerHTML = generateIntroHTML(collectEditorData());
    } else if (activeTab && activeTab.id === 'tab-pages') {
        const ctx = Object.assign({}, collectEditorData(), {
            enableTopSection: false,
            enableComment: false,
            enableQuoteAssignment: true,
            forceOpenPageIndexes: transientExpandedPageIndexes
        });
        preview.innerHTML = generateHTML(ctx, true);
        transientExpandedPageIndexes = [];
    } else {
        preview.innerHTML = generateHTML(getPreviewData(), true);
    }
}

async function copyToClipboard() {
    const content = generateHTML(collectEditorData(), false);

    try {
        await navigator.clipboard.writeText(content);
        showNotification('HTML 코드가 복사되었습니다!');
        updatePreview();
    } catch (err) {
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
