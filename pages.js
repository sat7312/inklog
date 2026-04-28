function updateTagsList() {
    const tagsList = document.getElementById('tagsList');
    if (!tagsList) return;

    tagsList.innerHTML = '';

    tags.forEach(function (tag, index) {
        const tagItem = document.createElement('div');
        tagItem.className = 'tag-edit-item';
        tagItem.innerHTML =
            '<input type="text" class="tag-value-input" placeholder="태그 텍스트" value="' + escapeHtml(tag.value || '') + '" data-index="' + index + '" data-field="value">' +
            '<input type="text" class="tag-link-input" placeholder="링크 (선택)" value="' + escapeHtml(tag.link || '') + '" data-index="' + index + '" data-field="link">' +
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
        tagItem.className = 'tag-edit-item';
        const tagName = escapeHtml(tag.name || 'Tag');
        tagItem.innerHTML =
            '<div class="tag-label-static" title="' + tagName + '">' + tagName + '</div>' +
            '<input type="text" class="tag-value-input" placeholder="값 (Value)" value="' + escapeHtml(tag.value || '') + '" data-index="' + index + '" data-field="value">' +
            '<input type="text" class="tag-link-input" placeholder="링크 (선택)" value="' + escapeHtml(tag.link || '') + '" data-index="' + index + '" data-field="link">' +
            '<button class="btn-delete-tag" data-index="' + index + '" title="삭제">×</button>';
        list.appendChild(tagItem);
    });

    list.querySelectorAll('.tag-value-input, .tag-link-input').forEach(function (input) {
        input.addEventListener('input', function (e) {
            const idx = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            tempPageTags[idx][field] = e.target.value;
        });
    });

    list.querySelectorAll('.btn-delete-tag').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            const idx = parseInt(e.target.dataset.index);
            tempPageTags.splice(idx, 1);
            updatePageTagsList();
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
        item.innerHTML =
            '<input type="text" class="replacement-from-input" placeholder="원본 단어" value="' + escapeHtml(rep.from || '') + '" data-index="' + index + '" data-field="from">' +
            '<div class="arrow-static">→</div>' +
            '<input type="text" class="replacement-to-input" placeholder="바꿀 단어" value="' + escapeHtml(rep.to || '') + '" data-index="' + index + '" data-field="to">' +
            '<button class="btn-delete-item" data-index="' + index + '" title="삭제">×</button>';
        list.appendChild(item);
    });

    list.querySelectorAll('.replacement-from-input, .replacement-to-input').forEach(function (input) {
        input.addEventListener('input', function (e) {
            const idx = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            replacements[idx][field] = e.target.value;
            updatePreview();
            saveToStorage();
        });
    });

    list.querySelectorAll('.btn-delete-item').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            const idx = parseInt(e.target.dataset.index);
            replacements.splice(idx, 1);
            updateReplacementsList();
            updatePreview();
            saveToStorage();
        });
    });
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
        itemType: 'section',
        title: sectionTitle,
        subtitle: sectionSubtitle,
        image: sectionImage,
        align: sectionAlign || 'center',
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

function calculateTextStats(text) {
    if (!text || !text.trim()) {
        return { charCountNoSpace: 0, charCountWithSpace: 0, wordCount: 0 };
    }

    let cleanText = text;
    cleanText = cleanText.replace(/\[HR\]/g, '');
    cleanText = cleanText.replace(/\[IMG:[^\]]*\]/g, '');
    cleanText = cleanText.replace(/\[FN:[^\]]*\].*?\[\/FN\]/g, '');
    cleanText = cleanText.trim();

    return {
        charCountNoSpace: cleanText.replace(/\s/g, '').length,
        charCountWithSpace: cleanText.length,
        wordCount: cleanText.split(/\s+/).filter(word => word.length > 0).length
    };
}

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

function updateTotalStats() {
    const totalStats = document.getElementById('totalStats');
    if (!totalStats) return;

    let totalCharCountNoSpace = 0;
    let totalCharCountWithSpace = 0;
    let totalWordCount = 0;

    pages.forEach(function (item) {
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

    let pageNumber = 0;

    pages.forEach(function (item, index) {
        const pageItem = document.createElement('div');
        pageItem.className = 'page-item';

        if (item.itemType === 'section') {
            let sectionDisplay = item.title || 'Section';
            if (item.subtitle) sectionDisplay += ' - ' + item.subtitle;
            const escapedSectionDisplay = escapeHtml(sectionDisplay);

            pageItem.innerHTML =
                '<div class="page-item-header">' +
                '<div class="page-item-main">' +
                '<div class="page-item-info">' +
                '<span class="page-item-name" style="color: var(--accent-blue); font-weight: 700;">📑 ' + escapedSectionDisplay + '</span>' +
                '<div class="page-item-preview" style="color: var(--text-muted); font-size: 12px;">섹션 (구분선)</div>' +
                '</div>' +
                '</div>' +
                '<div class="page-controls">' +
                '<button class="btn-move btn-move-up" data-index="' + index + '" title="위로">▲</button>' +
                '<button class="btn-move btn-move-down" data-index="' + index + '" title="아래로">▼</button>' +
                '<button class="btn-delete-page" data-index="' + index + '" title="삭제">×</button>' +
                '</div>' +
                '</div>';

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
                setTimeout(function () {
                    sectionModal.scrollTop = 0;
                    const modalBody = sectionModal.querySelector('.modal-body');
                    if (modalBody) modalBody.scrollTop = 0;
                }, 50);
            });
        } else {
            pageNumber++;

            let speaker = '#' + pageNumber;
            if (item.title && item.title.trim()) speaker = item.title;
            if (item.subtitle && item.subtitle.trim()) speaker += ' - ' + item.subtitle;

            const previewText = item.content.substring(0, 50).replace(/\[.*?\]/g, '').trim() + '...';
            const escapedSpeaker = escapeHtml(speaker);
            const escapedPreviewText = escapeHtml(previewText);

            pageItem.innerHTML =
                '<div class="page-item-header">' +
                '<div class="page-item-main">' +
                '<span class="page-num">#' + pageNumber + '</span>' +
                '<div class="page-item-info">' +
                '<span class="page-item-name">' + escapedSpeaker + '</span>' +
                '<div class="page-item-preview">' + escapedPreviewText + '</div>' +
                '</div>' +
                '</div>' +
                '<div class="page-controls">' +
                '<button class="btn-move btn-move-up" data-index="' + index + '" title="위로">▲</button>' +
                '<button class="btn-move btn-move-down" data-index="' + index + '" title="아래로">▼</button>' +
                '<button class="btn-delete-page" data-index="' + index + '" title="삭제">×</button>' +
                '</div>' +
                '</div>';

            pageItem.addEventListener('click', function (e) {
                if (e.target.closest('.btn-move') || e.target.closest('.btn-delete-page')) return;

                currentEditingIndex = index;
                document.getElementById('pageTitle').value = item.title || '';
                document.getElementById('pageSubtitle').value = item.subtitle || '';
                document.getElementById('pageContent').value = item.content;
                tempPageTags = [];

                const pageModal = document.getElementById('pageModal');
                pageModal.style.display = 'flex';
                updatePageStats();
                setTimeout(function () {
                    pageModal.scrollTop = 0;
                    const modalBody = pageModal.querySelector('.modal-body');
                    if (modalBody) modalBody.scrollTop = 0;
                }, 50);
            });
        }

        pagesList.appendChild(pageItem);
    });

    document.querySelectorAll('.btn-move-up').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            movePageUp(parseInt(e.target.dataset.index));
        });
    });

    document.querySelectorAll('.btn-move-down').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            movePageDown(parseInt(e.target.dataset.index));
        });
    });

    document.querySelectorAll('.btn-delete-page').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const idx = parseInt(e.target.dataset.index);

            if (idx < 0 || idx >= pages.length || !pages[idx]) {
                showNotification('삭제할 항목을 찾을 수 없습니다.');
                return;
            }

            const itemType = pages[idx].itemType === 'section' ? '섹션' : '페이지';
            let itemName;
            if (pages[idx].itemType === 'section') {
                itemName = pages[idx].title || 'Section';
            } else {
                let actualPageNumber = 0;
                for (let i = 0; i <= idx; i++) {
                    if (pages[i].itemType !== 'section') actualPageNumber++;
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

    updateTotalStats();
}
