// Data-driven HTML renderer. All functions accept ctx (collectEditorData() output).

const STYLES = {
    light: {
        bg: '#ececed', text: '#555555', em: '#666666', header: '#333333',
        headerText: '#333333', line: '#333333', quote1Bg: '#e0e0e0',
        quote1Text: '#444444', quote2Bg: '#dcdcdc', quote2Text: '#222222',
        tagText: '#808080', divider: '#d0d0d0'
    },
    dark: {
        bg: '#252525', text: '#aaaaaa', em: '#999999', header: '#f3f3f3',
        headerText: '#f3f3f3', line: '#f3f3f3', quote1Bg: '#333333',
        quote1Text: '#cccccc', quote2Bg: '#3a3a3a', quote2Text: '#ffffff',
        tagText: '#999999', divider: '#4a4a4a'
    },
    oldMoneyLight: {
        bg: '#efe9da', text: '#574d34', em: '#923838', header: '#56412b',
        headerText: '#56412b', line: '#56412b', quote1Bg: '#f7f3e8',
        quote1Text: '#184f66', quote2Bg: '#f7f3e8', quote2Text: '#634121',
        tagText: '#8b7355', divider: '#d4c9b0'
    },
    oldMoneyDark: {
        bg: '#141e23', text: '#a08e6c', em: '#aa7b5c', header: '#bf9f6f',
        headerText: '#bf9f6f', line: '#bf9f6f', quote1Bg: '#192228',
        quote1Text: '#3092ab', quote2Bg: '#192228', quote2Text: '#d0a053',
        tagText: '#a89070', divider: '#2a3540'
    },
    basic: {
        bg: '#ffffff', text: '#2c3e50', em: '#2d5af0', header: '#162a3e',
        headerText: '#162a3e', line: '#162a3e', quote1Bg: '#f0f2f5',
        quote1Text: '#2c3e50', quote2Bg: '#f0f2f5', quote2Text: '#162a3e',
        tagText: '#6c8da8', divider: '#c8d6e0'
    },
    rose: {
        bg: '#fefbfd', text: '#5c4a5a', em: '#c77d8e', header: '#8b5a6a',
        headerText: '#8b5a6a', line: '#8b5a6a', quote1Bg: '#faf5f7',
        quote1Text: '#6b4a5a', quote2Bg: '#f8f0f3', quote2Text: '#7d5a6a',
        tagText: '#b08090', divider: '#e8d5db'
    },
    ocean: {
        bg: '#f5f9fc', text: '#3d5a6f', em: '#2980b9', header: '#1a4a66',
        headerText: '#1a4a66', line: '#1a4a66', quote1Bg: '#e8f4fa',
        quote1Text: '#2c5d7a', quote2Bg: '#dceef7', quote2Text: '#1e5a78',
        tagText: '#5a8aa8', divider: '#c8dce8'
    },
    forest: {
        bg: '#f7faf5', text: '#3d4f3a', em: '#5a8a50', header: '#2d5a28',
        headerText: '#2d5a28', line: '#2d5a28', quote1Bg: '#eef5ec',
        quote1Text: '#3d5a38', quote2Bg: '#e5f0e3', quote2Text: '#2a5025',
        tagText: '#6a9a60', divider: '#d0e0cc'
    },
    lavender: {
        bg: '#faf8fc', text: '#4a4560', em: '#7b68a8', header: '#5a4a7a',
        headerText: '#5a4a7a', line: '#5a4a7a', quote1Bg: '#f3f0f8',
        quote1Text: '#5a5070', quote2Bg: '#ece8f5', quote2Text: '#4a4068',
        tagText: '#8a7aaa', divider: '#dcd5e8'
    },
    warm: {
        bg: '#fdfbf8', text: '#5a4a3d', em: '#c08860', header: '#6a5040',
        headerText: '#6a5040', line: '#6a5040', quote1Bg: '#f8f4f0',
        quote1Text: '#5a4a40', quote2Bg: '#f5efe8', quote2Text: '#6a5545',
        tagText: '#a08a70', divider: '#e0d5c8'
    },
    sage: {
        bg: '#f8faf7', text: '#4a5547', em: '#6b8e65', header: '#3a4f35',
        headerText: '#3a4f35', line: '#3a4f35', quote1Bg: '#f0f4ee',
        quote1Text: '#4a5a45', quote2Bg: '#e8f0e5', quote2Text: '#3a4f38',
        tagText: '#7a9a70', divider: '#d5e0d0'
    },
    coral: {
        bg: '#fefaf9', text: '#5a4845', em: '#e07a5f', header: '#8a5545',
        headerText: '#8a5545', line: '#8a5545', quote1Bg: '#faf3f1',
        quote1Text: '#6a5048', quote2Bg: '#f7ebe8', quote2Text: '#7a5848',
        tagText: '#c08a75', divider: '#e8d5d0'
    },
    mint: {
        bg: '#f7fcfa', text: '#3d5a54', em: '#4a9d88', header: '#2a5048',
        headerText: '#2a5048', line: '#2a5048', quote1Bg: '#eef7f4',
        quote1Text: '#3d5a50', quote2Bg: '#e5f3ee', quote2Text: '#2d5545',
        tagText: '#6aaa95', divider: '#d0e8dd'
    },
    mustard: {
        bg: '#fdfbf5', text: '#5a5540', em: '#d4a841', header: '#6a5a35',
        headerText: '#6a5a35', line: '#6a5a35', quote1Bg: '#f9f6ec',
        quote1Text: '#5a5545', quote2Bg: '#f5f0e0', quote2Text: '#6a5a40',
        tagText: '#b09860', divider: '#e5ddc8'
    },
    plum: {
        bg: '#faf8fb', text: '#523f52', em: '#9d5f8f', header: '#6a4a65',
        headerText: '#6a4a65', line: '#6a4a65', quote1Bg: '#f5f0f6',
        quote1Text: '#5a4555', quote2Bg: '#f0e8f2', quote2Text: '#6a4a60',
        tagText: '#aa7a9a', divider: '#e0d0dc'
    },
    sky: {
        bg: '#f8fbfd', text: '#3d5565', em: '#5a9ace', header: '#2a4a5a',
        headerText: '#2a4a5a', line: '#2a4a5a', quote1Bg: '#f0f6fa',
        quote1Text: '#3d5560', quote2Bg: '#e8f2f8', quote2Text: '#2d4f5a',
        tagText: '#7aabce', divider: '#d5e5ed'
    },
    terracotta: {
        bg: '#fdfaf8', text: '#5a4840', em: '#c87055', header: '#7a5045',
        headerText: '#7a5045', line: '#7a5045', quote1Bg: '#f9f3f0',
        quote1Text: '#5a4a42', quote2Bg: '#f5ebe5', quote2Text: '#6a5040',
        tagText: '#b08570', divider: '#e5d5cc'
    },
    teal: {
        bg: '#f7fafb', text: '#3d5558', em: '#4a8a88', header: '#2a5053',
        headerText: '#2a5053', line: '#2a5053', quote1Bg: '#eff6f7',
        quote1Text: '#3d5555', quote2Bg: '#e7f2f3', quote2Text: '#2d5250',
        tagText: '#6a9d9a', divider: '#d5e5e5'
    },
    peach: {
        bg: '#fefbf9', text: '#5a4d45', em: '#e8a087', header: '#8a5f4a',
        headerText: '#8a5f4a', line: '#8a5f4a', quote1Bg: '#faf5f2',
        quote1Text: '#5a4f48', quote2Bg: '#f7efe9', quote2Text: '#6a5545',
        tagText: '#c09080', divider: '#e8ddd5'
    },
    slate: {
        bg: '#f8f9fa', text: '#475259', em: '#5a7a88', header: '#354550',
        headerText: '#354550', line: '#354550', quote1Bg: '#f2f4f5',
        quote1Text: '#475560', quote2Bg: '#eceff1', quote2Text: '#3a4f58',
        tagText: '#708a95', divider: '#d8dfe3'
    },
    espresso: {
        bg: '#faf8f6', text: '#4a3d35', em: '#8b6f47', header: '#3a2920',
        headerText: '#3a2920', line: '#3a2920', quote1Bg: '#f5f2ee',
        quote1Text: '#503f35', quote2Bg: '#efe8e0', quote2Text: '#5a4535',
        tagText: '#9a7f60', divider: '#ddd0c0'
    },
    burgundy: {
        bg: '#fefbfc', text: '#5a3d45', em: '#a84860', header: '#6a2d3f',
        headerText: '#6a2d3f', line: '#6a2d3f', quote1Bg: '#faf5f7',
        quote1Text: '#604048', quote2Bg: '#f5eaed', quote2Text: '#7a3d4a',
        tagText: '#b86878', divider: '#e8d0d8'
    },
    indigo: {
        bg: '#f8f9fc', text: '#3d4560', em: '#5a68a8', header: '#2d355a',
        headerText: '#2d355a', line: '#2d355a', quote1Bg: '#f0f2f8',
        quote1Text: '#404a65', quote2Bg: '#e8ebf5', quote2Text: '#354060',
        tagText: '#6a78b8', divider: '#d0d8e8'
    },
    olive: {
        bg: '#fafaf5', text: '#4a4d3d', em: '#7a8050', header: '#3a4030',
        headerText: '#3a4030', line: '#3a4030', quote1Bg: '#f5f5ee',
        quote1Text: '#4f5240', quote2Bg: '#eff0e5', quote2Text: '#45483a',
        tagText: '#8a9060', divider: '#dde0d0'
    },
    ash: {
        bg: '#fafafa', text: '#4a4a4a', em: '#707070', header: '#2a2a2a',
        headerText: '#2a2a2a', line: '#2a2a2a', quote1Bg: '#f2f2f2',
        quote1Text: '#505050', quote2Bg: '#ebebeb', quote2Text: '#3a3a3a',
        tagText: '#8a8a8a', divider: '#d5d5d5'
    },
    aqua: {
        bg: '#f7fbfc', text: '#3d5558', em: '#4a9a9a', header: '#2a4a4d',
        headerText: '#2a4a4d', line: '#2a4a4d', quote1Bg: '#eff6f7',
        quote1Text: '#405a5a', quote2Bg: '#e7f2f3', quote2Text: '#355050',
        tagText: '#6aaaaa', divider: '#d0e5e7'
    },
    chocolate: {
        bg: '#fcfaf8', text: '#4d3a2a', em: '#9a6040', header: '#3d2515',
        headerText: '#3d2515', line: '#3d2515', quote1Bg: '#f7f4f0',
        quote1Text: '#5a402a', quote2Bg: '#f2ebe3', quote2Text: '#6a4530',
        tagText: '#aa7550', divider: '#e0d0c0'
    },
    claret: {
        bg: '#fdfafa', text: '#5a3a3a', em: '#b85050', header: '#6a2525',
        headerText: '#6a2525', line: '#6a2525', quote1Bg: '#faf3f3',
        quote1Text: '#603f3f', quote2Bg: '#f5e8e8', quote2Text: '#7a3535',
        tagText: '#c86868', divider: '#e8d0d0'
    },
    charcoal: {
        bg: '#f9f9f9', text: '#454545', em: '#656565', header: '#252525',
        headerText: '#252525', line: '#252525', quote1Bg: '#f1f1f1',
        quote1Text: '#4a4a4a', quote2Bg: '#e9e9e9', quote2Text: '#353535',
        tagText: '#858585', divider: '#d3d3d3'
    },
    // char is the "다크" option
    char: {
        bg: '#252525', text: '#aaaaaa', em: '#999999', header: '#f3f3f3',
        headerText: '#f3f3f3', line: '#f3f3f3', quote1Bg: '#333333',
        quote1Text: '#cccccc', quote2Bg: '#3a3a3a', quote2Text: '#ffffff',
        tagText: '#999999', divider: '#4a4a4a'
    },
    grape: {
        bg: '#fbf9fc', text: '#4a3f52', em: '#8a68a0', header: '#5a3a68',
        headerText: '#5a3a68', line: '#5a3a68', quote1Bg: '#f5f0f8',
        quote1Text: '#554560', quote2Bg: '#efe8f5', quote2Text: '#604a70',
        tagText: '#9a78b0', divider: '#dcd0e8'
    }
};

function pxToClamp(maxPx, minRatio) {
    minRatio = minRatio || 0.75;
    const min = Math.round(maxPx * minRatio);
    const vw = (maxPx / 900 * 100).toFixed(2);
    return 'clamp(' + min + 'px, ' + vw + 'vw, ' + maxPx + 'px)';
}

function getFontFallback(font) {
    const sansSerifFonts = ['Pretendard', 'Noto Sans KR', 'Nanum Gothic', 'Gothic A1', 'Gowun Dodum', 'IBM Plex Sans KR'];
    return sansSerifFonts.includes(font) ? 'sans-serif' : 'serif';
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeImageUrl(url) {
    if (!url || !url.trim()) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('//')) {
        return 'https:' + trimmed;
    }
    return trimmed;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 236, g: 236, b: 237 };
}

function getTheme(type, ctx) {
    if (type === 'custom') {
        const c = ctx.customColors;
        const headerColor = c.header;
        return {
            bg: c.bg, text: c.text, em: c.em,
            header: headerColor, headerText: headerColor, line: headerColor,
            quote1Bg: c.quote1Bg, quote1Text: c.quote1Text,
            quote2Bg: c.quote2Bg, quote2Text: c.quote2Text,
            tagText: c.tagText || c.text,
            divider: c.divider || c.tagText || c.text
        };
    }
    if (type && type.startsWith('customTheme_')) {
        const index = parseInt(type.split('_')[1]);
        if (ctx.customThemes && ctx.customThemes[index]) {
            return ctx.customThemes[index];
        }
    }
    if (STYLES[type]) return STYLES[type];
    return type === 'user' ? STYLES.light : STYLES.dark;
}

function applyReplacements(text, ctx) {
    let result = text;
    (ctx.replacements || []).forEach(function (rep) {
        if (rep.from && rep.from.trim()) {
            const regex = new RegExp(escapeRegExp(rep.from), 'g');
            result = result.replace(regex, rep.to || '');
        }
    });
    return result;
}

function parseText(text, themeStyle, skipIndent, reduceParagraphSpacing, imageWidth, ctx) {
    if (!text) return '';

    let processedText = applyReplacements(text, ctx);

    const useRoundedQuotes = ctx.useRoundedQuotes;
    const useTextIndent = ctx.useTextIndent;

    const imgWidth = imageWidth || 100;

    const fontSize = ctx.textSpacing.fontSize + 'px';
    const lineHeight = ctx.textSpacing.lineHeight;
    const letterSpacing = ctx.textSpacing.letterSpacing + 'px';
    const paragraphSpacing = reduceParagraphSpacing ? '5px' : ctx.textSpacing.paragraphSpacing + 'px';
    const indentValue = ctx.textSpacing.textIndent > 0 ? ctx.textSpacing.textIndent : 1;
    const indent = (useTextIndent && !skipIndent) ? indentValue + 'em' : '0';

    const textIndentStyle = indent !== '0' ? ' text-indent: ' + indent + ';' : '';
    const paragraphMargin = '0 0 ' + paragraphSpacing + ' 0';
    const pStyle = 'margin: ' + paragraphMargin + '; color: ' + themeStyle.text + '; line-height: ' + lineHeight + '; letter-spacing: ' + letterSpacing + '; font-size: ' + fontSize + ';' + textIndentStyle;
    const emStyle = 'font-style: italic; color: ' + themeStyle.em + ';';
    const q1Style = 'background-color: ' + themeStyle.quote1Bg + '; color: ' + themeStyle.quote1Text + '; padding: 0.05em 0.25em; border-radius: 2px; vertical-align: baseline; line-height: inherit;';
    const q1StyleNested = 'background-color: ' + themeStyle.quote1Bg + '; color: ' + themeStyle.quote1Text + '; padding: 0.05em 0.1em; border-radius: 2px; vertical-align: baseline; line-height: inherit;';
    const q2Style = 'background-color: ' + themeStyle.quote2Bg + '; color: ' + themeStyle.quote2Text + '; font-weight: 600; padding: 0.05em 0.25em; border-radius: 2px; vertical-align: baseline; line-height: inherit;';
    const footnoteStyle = 'font-size: 11px; color: ' + themeStyle.tagText + '; margin: -8px 0 10px 0; line-height: 1.4;';

    let detailsBlocks = [];
    let detailsCount = 0;

    function processDetailsContent(content) {
        let result = content.trim();
        const quotePlaceholders = [];
        let quoteIndex = 0;
        const detailsUnitPlaceholders = [];
        let detailsUnitIndex = 0;

        result = result.replace(/(\d+)\s*['′]\s*(\d+)\s*["″]/g, function(m) {
            const ph = '{{DETAILS_UNIT_FULL_' + (detailsUnitIndex++) + '}}';
            detailsUnitPlaceholders.push(m);
            return ph;
        });
        result = result.replace(/(\d+)\s*['′]/g, function(m) {
            const ph = '{{DETAILS_UNIT_FEET_' + (detailsUnitIndex++) + '}}';
            detailsUnitPlaceholders.push(m);
            return ph;
        });

        if (useRoundedQuotes) {
            result = result.replace(/“([^”]*)”/g, function (match, content) {
                const innerProcessed = content.replace(/‘(.*?)’/g, function (m, c) {
                    const ph = '{{QUOTE_PH_' + (quoteIndex++) + '}}';
                    quotePlaceholders.push('<span style="' + q1Style + '">‘' + c + '’</span>');
                    return ph;
                });
                const ph = '{{QUOTE_PH_' + (quoteIndex++) + '}}';
                quotePlaceholders.push('<span style="' + q2Style + '">“' + innerProcessed + '”</span>');
                return ph;
            });
            result = result.replace(/‘(.*?)’/g, function (match, content) {
                const ph = '{{QUOTE_PH_' + (quoteIndex++) + '}}';
                quotePlaceholders.push('<span style="' + q1Style + '">‘' + content + '’</span>');
                return ph;
            });
            result = result.replace(/"([^"]*)"/g, function (match, content, offset) {
                if (offset > 0 && /\d/.test(result[offset - 1])) return match;
                if (/^\d+['′]\s*\d*["″]?$/.test(content.trim())) return match;
                const innerProcessed = content.replace(/(?<=[^\w\d]|^)'(.+?)'(?=[^\w\d]|$)/g, function (m, c) {
                    const ph = '{{QUOTE_PH_' + (quoteIndex++) + '}}';
                    quotePlaceholders.push('<span style="' + q1StyleNested + '">‘' + c + '’</span>');
                    return ph;
                });
                const ph = '{{QUOTE_PH_' + (quoteIndex++) + '}}';
                quotePlaceholders.push('<span style="' + q2Style + '">“' + innerProcessed + '”</span>');
                return ph;
            });
            result = result.replace(/(?<=[^\w\d]|^)'(.+?)'(?=[^\w\d]|$)/g, function (match, content, offset) {
                if (offset > 0 && /\d/.test(result[offset - 1])) return match;
                const ph = '{{QUOTE_PH_' + (quoteIndex++) + '}}';
                quotePlaceholders.push('<span style="' + q1Style + '">‘' + content + '’</span>');
                return ph;
            });
        } else {
            result = result.replace(/“([^”]*)”/g, function (match, content) {
                const innerProcessed = content.replace(/‘(.*?)’/g, function (m, c) {
                    const ph = '{{QUOTE_PH_' + (quoteIndex++) + '}}';
                    quotePlaceholders.push('<span style="' + q1Style + '">‘' + c + '’</span>');
                    return ph;
                });
                const ph = '{{QUOTE_PH_' + (quoteIndex++) + '}}';
                quotePlaceholders.push('<span style="' + q2Style + '">"' + innerProcessed + '"</span>');
                return ph;
            });
            result = result.replace(/‘(.*?)’/g, function (match, content) {
                const ph = '{{QUOTE_PH_' + (quoteIndex++) + '}}';
                quotePlaceholders.push('<span style="' + q1Style + '">‘' + content + '’</span>');
                return ph;
            });
            result = result.replace(/"([^"]*)"/g, function (match, content, offset) {
                if (offset > 0 && /\d/.test(result[offset - 1])) return match;
                if (/^\d+['′]\s*\d*["″]?$/.test(content.trim())) return match;
                const innerProcessed = content.replace(/(?<=[^\w\d]|^)'(.+?)'(?=[^\w\d]|$)/g, function (m, c) {
                    const ph = '{{QUOTE_PH_' + (quoteIndex++) + '}}';
                    quotePlaceholders.push('<span style="' + q1StyleNested + '">\'' + c + '\'</span>');
                    return ph;
                });
                const ph = '{{QUOTE_PH_' + (quoteIndex++) + '}}';
                quotePlaceholders.push('<span style="' + q2Style + '">"' + innerProcessed + '"</span>');
                return ph;
            });
            result = result.replace(/(?<=[^\w\d]|^)'(.+?)'(?=[^\w\d]|$)/g, function (match, content, offset) {
                if (offset > 0 && /\d/.test(result[offset - 1])) return match;
                const ph = '{{QUOTE_PH_' + (quoteIndex++) + '}}';
                quotePlaceholders.push('<span style="' + q1Style + '">\'' + content + '\'</span>');
                return ph;
            });
        }

        const italicPlaceholders = [];
        let italicIndex = 0;
        result = result.replace(/\*([^*]+)\*/g, function (match, content) {
            const ph = '{{ITALIC_PH_' + (italicIndex++) + '}}';
            italicPlaceholders.push('<em><span style="' + emStyle + '">' + content + '</span></em>');
            return ph;
        });

        let footnotes = [];
        let fnCount = 0;
        const fnPlaceholders = [];
        result = result.replace(/\[FN:([^\]]+)\]([^\[]*)\[\/FN\]/g, function (match, word, note) {
            fnCount++;
            const marker = '*'.repeat(fnCount);
            footnotes.push({ marker: marker, note: note.trim() });
            const ph = '{{FN_PH_' + (fnCount - 1) + '}}';
            fnPlaceholders.push(word + '<sup style="color:' + themeStyle.em + ';font-size:0.8em;">' + marker + '</sup>');
            return ph;
        });

        for (let i = quotePlaceholders.length - 1; i >= 0; i--) {
            result = result.replace('{{QUOTE_PH_' + i + '}}', function () { return quotePlaceholders[i]; });
        }
        for (let i = 0; i < italicPlaceholders.length; i++) {
            result = result.replace('{{ITALIC_PH_' + i + '}}', function () { return italicPlaceholders[i]; });
        }
        for (let i = 0; i < fnPlaceholders.length; i++) {
            result = result.replace('{{FN_PH_' + i + '}}', function () { return fnPlaceholders[i]; });
        }
        for (let i = detailsUnitPlaceholders.length - 1; i >= 0; i--) {
            result = result.replace('{{DETAILS_UNIT_FULL_' + i + '}}', detailsUnitPlaceholders[i]);
            result = result.replace('{{DETAILS_UNIT_FEET_' + i + '}}', detailsUnitPlaceholders[i]);
        }

        result = result.replace(/\n/g, '<br>');

        if (footnotes.length > 0) {
            const detailsFootnoteStyle = 'font-size: 11px; color: ' + themeStyle.tagText + '; margin: 0px -50px 10px -50px; padding: 0 50px; line-height: 1.4;';
            footnotes.forEach(function (fn) {
                result += '<div style="' + detailsFootnoteStyle + '"><span style="display: inline-block; vertical-align: middle; margin-right: 6px;">' + fn.marker + '</span>' + fn.note + '</div>';
            });
        }
        return result;
    }

    const lines = processedText.split('\n');
    let html = '';
    const preserveLineBreaks = ctx.preserveLineBreaks;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (!line.trim()) {
            if (preserveLineBreaks) {
                html += '<p style="margin: 0; line-height: ' + lineHeight + '; font-size: ' + fontSize + ';">&nbsp;</p>';
            }
            continue;
        }

        if (line.includes('[IMG:')) {
            const imgMatch = line.match(/\[IMG:([^\]]+)\]/);
            if (imgMatch) {
                const imgParts = imgMatch[1].split(':');
                const imageUrl = normalizeImageUrl(imgParts[0]);
                let individualWidth = imgWidth;
                if (imgParts.length > 1 && !isNaN(parseInt(imgParts[1]))) {
                    individualWidth = Math.max(30, Math.min(100, parseInt(imgParts[1])));
                }
                if (imageUrl) {
                    const imgStyle = 'max-width: ' + individualWidth + '%; height: auto; border-radius: 15px; display: block; margin: 0 auto;';
                    const originalUrl = imgParts[0].trim();
                    const needsProxy = originalUrl.includes('namu.la') || originalUrl.includes('arca.live');
                    if (needsProxy) {
                        const proxies = [
                            originalUrl,
                            'https://images.weserv.nl/?url=' + encodeURIComponent(originalUrl),
                            'https://api.allorigins.win/raw?url=' + encodeURIComponent(originalUrl)
                        ];
                        const proxyList = proxies.join('|');
                        html += '<div style="text-align: center; margin: 20px 0;"><img src="' + imageUrl + '" style="' + imgStyle + '" data-original="' + originalUrl + '" data-proxies="' + proxyList + '" data-proxy-index="0" onerror="(function(img){var proxies=img.dataset.proxies.split(\'|\');var idx=parseInt(img.dataset.proxyIndex||0);if(idx<proxies.length-1){img.dataset.proxyIndex=idx+1;img.src=proxies[idx+1];}else{img.style.display=\'none\';};})(this)"></div>';
                    } else {
                        html += '<div style="text-align: center; margin: 20px 0;"><img src="' + imageUrl + '" style="' + imgStyle + '" onerror="this.style.display=\'none\'"></div>';
                    }
                }
                continue;
            }
        }

        if (line.trim().startsWith('{{DETAILS_BLOCK_')) {
            const block = detailsBlocks.find(b => b.placeholder === line.trim());
            if (block) {
                html += block.html;
                continue;
            }
        }

        if (line.trim() === '[HR]') {
            const hrColor = themeStyle.divider || themeStyle.tagText || themeStyle.header;
            const dividerContents = {
                line:     '<div style="width:30%;height:1px;background-color:' + hrColor + ';margin:20px auto;"></div>',
                fleuron:  '<div style="text-align:center;margin:20px auto;color:' + hrColor + ';font-size:' + fontSize + ';">─── ❧ ───</div>',
                dots:     '<div style="text-align:center;margin:20px auto;color:' + hrColor + ';font-size:' + fontSize + ';">· · · · · · ·</div>',
                stars:    '<div style="text-align:center;margin:20px auto;color:' + hrColor + ';font-size:' + fontSize + ';">✦ ─── ✦ ─── ✦</div>',
                diamond:  '<div style="text-align:center;margin:20px auto;color:' + hrColor + ';font-size:' + fontSize + ';">◇ ─ ◇ ─ ◇</div>',
                wave:     '<div style="text-align:center;margin:20px auto;color:' + hrColor + ';font-size:' + fontSize + ';">〰〰〰〰〰</div>',
                cross:    '<div style="text-align:center;margin:20px auto;color:' + hrColor + ';font-size:' + fontSize + ';">† ─── † ─── †</div>',
            };
            if (ctx.dividerStyle === 'custom' && ctx.dividerCustomText) {
                html += '<div style="text-align:center;margin:20px auto;color:' + hrColor + ';font-size:' + fontSize + ';">' + ctx.dividerCustomText + '</div>';
            } else {
                html += dividerContents[ctx.dividerStyle] || dividerContents.line;
            }
            continue;
        }

        let paragraphFootnotes = [];
        let footnoteCount = 0;
        line = line.replace(/\[FN:([^\]]+)\]([^\[]*)\[\/FN\]/g, function (match, word, note) {
            footnoteCount++;
            const marker = '*'.repeat(footnoteCount);
            paragraphFootnotes.push({ marker: marker, note: note.trim() });
            return word + '{{FOOTNOTE_' + footnoteCount + '}}';
        });

        let roundedQuotePairs = [];
        let pairIndex = 0;

        line = line.replace(/“([^”]*)”/g, function (match, content) {
            const innerProcessed = content.replace(/‘(.*?)’/g, function (m, c) {
                pairIndex++;
                roundedQuotePairs.push({ type: 'single', content: c });
                return '{{ROUND_QUOTE_' + pairIndex + '}}';
            });
            pairIndex++;
            roundedQuotePairs.push({ type: 'double', content: innerProcessed });
            return '{{ROUND_QUOTE_' + pairIndex + '}}';
        });

        line = line.replace(/‘(.*?)(’)(?=[^\w]|$)/g, function (match, content) {
            pairIndex++;
            roundedQuotePairs.push({ type: 'single', content: content });
            return '{{ROUND_QUOTE_' + pairIndex + '}}';
        });

        const unitPlaceholders = [];
        let unitIndex = 0;
        line = line.replace(/(\d+)\s*['′]\s*(\d+)\s*["″]/g, function(m) {
            const ph = '{{UNIT_FULL_' + (unitIndex++) + '}}';
            unitPlaceholders.push(m);
            return ph;
        });
        line = line.replace(/(\d+)\s*['′]/g, function(m) {
            const ph = '{{UNIT_FEET_' + (unitIndex++) + '}}';
            unitPlaceholders.push(m);
            return ph;
        });

        if (useRoundedQuotes) {
            line = line.replace(/"([^"]*)"/g, function (match, content, offset) {
                if (offset > 0 && /\d/.test(line[offset - 1])) return match;
                if (/^\d+['′]\s*\d*["″]?$/.test(content.trim())) return match;
                const innerProcessed = content.replace(/(?<=[^\w\d]|^)'(.+?)'(?=[^\w\d]|$)/g, function (m, c) {
                    pairIndex++;
                    roundedQuotePairs.push({ type: 'single', content: c, nested: true });
                    return '{{ROUND_QUOTE_' + pairIndex + '}}';
                });
                pairIndex++;
                roundedQuotePairs.push({ type: 'double', content: innerProcessed });
                return '{{ROUND_QUOTE_' + pairIndex + '}}';
            });
            line = line.replace(/(?<=[^\w\d]|^)'(.+?)'(?=[^\w\d]|$)/g, function (match, content, offset) {
                if (offset > 0 && /\d/.test(line[offset - 1])) return match;
                pairIndex++;
                roundedQuotePairs.push({ type: 'single', content: content });
                return '{{ROUND_QUOTE_' + pairIndex + '}}';
            });
        } else {
            line = line.replace(/"([^"]*)"/g, function (match, content, offset) {
                if (offset > 0 && /\d/.test(line[offset - 1])) return match;
                if (/^\d+['′]\s*\d*["″]?$/.test(content.trim())) return match;
                const innerProcessed = content.replace(/(?<=[^\w\d]|^)'(.+?)'(?=[^\w\d]|$)/g, function(m, c) {
                    return '<span style="' + q1StyleNested + '">\'' + c + '\'</span>';
                });
                return '<span style="' + q2Style + '">"' + innerProcessed + '"</span>';
            });
            line = line.replace(/(?<=[^\w\d]|^)'(.+?)'(?=[^\w\d]|$)/g, function(match, content, offset) {
                if (offset > 0 && /\d/.test(line[offset - 1])) return match;
                return '<span style="' + q1Style + '">\'' + content + '\'</span>';
            });
        }

        for (let idx = roundedQuotePairs.length; idx >= 1; idx--) {
            const pair = roundedQuotePairs[idx - 1];
            if (pair.type === 'double') {
                line = line.replace('{{ROUND_QUOTE_' + idx + '}}', '<span style="' + q2Style + '">“' + pair.content + '”</span>');
            } else {
                const style = pair.nested ? q1StyleNested : q1Style;
                line = line.replace('{{ROUND_QUOTE_' + idx + '}}', '<span style="' + style + '">‘' + pair.content + '’</span>');
            }
        }

        for (let i = unitPlaceholders.length - 1; i >= 0; i--) {
            line = line.replace('{{UNIT_FULL_' + i + '}}', unitPlaceholders[i]);
            line = line.replace('{{UNIT_FEET_' + i + '}}', unitPlaceholders[i]);
        }

        line = line.replace(/\*\*([\s\S]+?)\*\*/g, function(match, inner) {
            const innerParsed = inner.replace(/\*([^*]+)\*/g, '<em><span style="' + emStyle + '">$1</span></em>');
            return '<strong style="font-weight:700; color:' + themeStyle.text + ';">' + innerParsed + '</strong>';
        });
        line = line.replace(/\*([^*]+)\*/g, '<em><span style="' + emStyle + '">$1</span></em>');

        const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const headingText = headingMatch[2];
            const ff = ctx.fontFamily || 'Pretendard';
            const ffFallback = getFontFallback(ff);
            const baseSize = (ctx.headingFontSizes && ctx.headingFontSizes.pageHeaderTitle) ? ctx.headingFontSizes.pageHeaderTitle : 20;
            const hColor = themeStyle.header || themeStyle.text;
            const subColor = themeStyle.tagText || themeStyle.text;
            const sizes = [baseSize * 1.3, baseSize * 1.05, baseSize * 0.88, baseSize * 0.76];
            const weights = ['800', '700', '600', '600'];
            const colors = [hColor, hColor, subColor, subColor];
            const idx = level - 1;

            const prevLine = i > 0 ? lines[i - 1] : '';
            const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
            const prevIsHeading = /^#{1,4}\s+/.test(prevLine.trim());
            const nextIsHeading = /^#{1,4}\s+/.test(nextLine.trim());
            const marginTop = prevIsHeading ? '3px' : '20px';
            const marginBottom = nextIsHeading ? '1px' : '14px';

            const hAlignMatch = headingText.match(/^(\[<\]|\[\|\]|\[>\])\s*/);
            let hAlign = '';
            let hText = headingText;
            if (hAlignMatch) {
                const hAlignMap = { '[<]': 'left', '[|]': 'center', '[>]': 'right' };
                hAlign = hAlignMap[hAlignMatch[1]];
                hText = headingText.slice(hAlignMatch[0].length);
            }
            const hAlignStyle = hAlign ? ' text-align:' + hAlign + ';' : '';
            const hStyle = 'display:block; font-size:' + Math.round(sizes[idx]) + 'px; font-weight:' + weights[idx] + '; color:' + colors[idx] + '; font-family:\'' + ff + '\',' + ffFallback + '; line-height:1.35; margin:' + marginTop + ' 0 ' + marginBottom + '; letter-spacing:-0.2px;' + hAlignStyle;
            html += '<div style="' + hStyle + '">' + hText + '</div>';
            continue;
        }

        for (let j = 1; j <= footnoteCount; j++) {
            line = line.replace('{{FOOTNOTE_' + j + '}}', '<sup style="font-size: 0.7em;">' + '*'.repeat(j) + '</sup>');
        }

        let textAlign = '';
        const alignMatch = line.match(/^\[(<|\||\>)\]\s*/);
        if (alignMatch) {
            const alignMap = { '<': 'left', '|': 'center', '>': 'right' };
            textAlign = alignMap[alignMatch[1]];
            line = line.slice(alignMatch[0].length);
        }
        const alignedPStyle = textAlign ? pStyle + ' text-align:' + textAlign + ';' : pStyle;

        html += '<p style="' + alignedPStyle + '">' + line + '</p>';

        if (paragraphFootnotes.length > 0) {
            for (let k = 0; k < paragraphFootnotes.length; k++) {
                html += '<p style="' + footnoteStyle + '"><span style="vertical-align: middle; margin-right: 2px;">' + paragraphFootnotes[k].marker + '</span>' + paragraphFootnotes[k].note + '</p>';
            }
        }
    }

    return html;
}

function createHeader(text, themeStyle, headerImage, headerFocusX, headerFocusY, ctx) {
    let pageNum = '';
    let pageTitle = '';
    let pageSubtitle = '';

    const parts = text.split(' - ');
    const titlePart = parts[0];
    if (parts.length > 1) {
        pageSubtitle = parts.slice(1).join(' - ');
    }

    const numMatch = titlePart.match(/^(#\d+)\s*(.*)/);
    if (numMatch) {
        pageNum = numMatch[1];
        pageTitle = numMatch[2];
    } else {
        pageTitle = titlePart;
    }

    const hasHeaderImage = headerImage && typeof headerImage === 'string' && headerImage.trim();
    const numberColor = hasHeaderImage ? '#ffffff' : themeStyle.header;
    const titleColor = hasHeaderImage ? '#ffffff' : themeStyle.header;
    const subtitleColor = hasHeaderImage ? 'rgba(255, 255, 255, 0.85)' : (themeStyle.tagText || themeStyle.text);

    let headerHtml = '';

    if (pageNum && !ctx.hidePageNumbers) {
        headerHtml += '<div style="display: flex; align-items: center; width: 100%; padding: clamp(15px, 3vw, 20px) 0;">';
        headerHtml += '<div style="flex: 0 0 auto; padding-left: clamp(30px, 5vw, 50px); padding-right: clamp(20px, 3vw, 30px); white-space: nowrap;">';
        headerHtml += '<div style="font-size: ' + pxToClamp(ctx.headingFontSizes.pageHeaderNum) + '; font-weight: 700; color: ' + numberColor + '; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + '; line-height: 1; white-space: nowrap;">' + pageNum.replace('#', '') + '</div>';
        headerHtml += '</div>';
        headerHtml += '<div style="flex: 1 1 0; min-width: 0;">';
        if (pageTitle) {
            const titleMargin = pageSubtitle ? ' margin-bottom: 4px;' : '';
            headerHtml += '<div style="font-size: ' + pxToClamp(ctx.headingFontSizes.pageHeaderTitle) + '; font-weight: 700; color: ' + titleColor + ';' + titleMargin + ' font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + '; line-height: 1.3;">' + pageTitle + '</div>';
        }
        if (pageSubtitle) {
            headerHtml += '<div style="font-size: ' + pxToClamp(Math.round(ctx.headingFontSizes.pageHeaderTitle * 0.8)) + '; color: ' + subtitleColor + '; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + '; line-height: 1.4;">' + pageSubtitle + '</div>';
        }
        headerHtml += '</div>';
        headerHtml += '</div>';
    } else if (ctx.hidePageNumbers && (pageTitle || pageSubtitle)) {
        headerHtml += '<div style="padding: clamp(15px, 3vw, 20px) clamp(30px, 5vw, 50px);">';
        if (pageTitle) {
            const titleMarginNoNum = pageSubtitle ? ' margin-bottom: 4px;' : '';
            headerHtml += '<div style="font-size: ' + pxToClamp(ctx.headingFontSizes.pageHeaderTitle) + '; font-weight: 700; color: ' + titleColor + ';' + titleMarginNoNum + ' font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + '; line-height: 1.3;">' + pageTitle + '</div>';
        }
        if (pageSubtitle) {
            headerHtml += '<div style="font-size: ' + pxToClamp(Math.round(ctx.headingFontSizes.pageHeaderTitle * 0.8)) + '; color: ' + subtitleColor + '; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + '; line-height: 1.4;">' + pageSubtitle + '</div>';
        }
        headerHtml += '</div>';
    } else if (ctx.hidePageNumbers && pageNum) {
        const pageNumber = pageNum.replace('#', '');
        headerHtml += '<div style="padding: clamp(15px, 3vw, 20px) clamp(30px, 5vw, 50px);">';
        headerHtml += '<div style="font-size: ' + pxToClamp(ctx.headingFontSizes.pageHeaderTitle) + '; font-weight: 700; color: ' + titleColor + '; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + '; line-height: 1.3;">Page ' + pageNumber + '</div>';
        headerHtml += '</div>';
    } else {
        const displayContent = text ? text.toUpperCase() : '';
        const headerStyle = 'text-align: center; font-size: ' + pxToClamp(ctx.headingFontSizes.pageHeaderTitle) + '; letter-spacing: clamp(2px, 0.5vw, 4px); font-weight: 600; color: ' + titleColor + '; margin-bottom: 0; padding: clamp(15px, 3vw, 20px) 0; line-height: 1; white-space: nowrap;';
        const lineStyle = 'display: inline-block; width: clamp(25px, 5vw, 40px); height: 0px; border-top: 1px solid ' + titleColor + '; vertical-align: middle; font-size: 0px; line-height: 0px;';
        const textWrapperStyle = 'display: inline-block; margin: 0 clamp(10px, 2vw, 15px); vertical-align: middle;';
        headerHtml = '<div style="' + headerStyle + '">' +
            '<span style="' + lineStyle + '">&nbsp;</span>' +
            '<span style="' + textWrapperStyle + '">' + displayContent + '</span>' +
            '<span style="' + lineStyle + '">&nbsp;</span>' +
            '</div>';
    }

    if (hasHeaderImage) {
        const focusX = headerFocusX || 50;
        const focusY = headerFocusY || 50;
        const bannerStyle = 'width: calc(100% + clamp(30px, 6vw, 60px)); margin: 0 -' + 'clamp(15px, 3vw, 30px)' + '; height: 100px; background: url(\'' + headerImage + '\') ' + focusX + '% ' + focusY + '% / cover no-repeat; margin-bottom: 20px; margin-top: -20px;';
        headerHtml += '<div style="' + bannerStyle + '"></div>';
    }

    return headerHtml;
}

function createCreditFooter() {
    return '<div style="text-align: center; padding: clamp(15px, 3vw, 20px) 0; font-size: clamp(9px, 1.5vw, 10px); color: #999999; max-width: 900px; margin: clamp(5px, 1vw, 10px) auto 0;">Template by <a href="https://arca.live/b/characterai/161701867" style="color: #999999; text-decoration: none;">Log Diary</a></div>';
}

function createCommentSection(commentText, commentNickname, themeStyle, ctx) {
    let commentHtml = '';
    const containerStyle = 'box-shadow:0 4px 16px rgba(0,0,0,0.1);max-width: 900px; margin: 5px auto; border-radius: 1rem; background-color: ' + themeStyle.bg + '; padding: clamp(20px, 4vw, 30px) 0; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + '; font-size: clamp(13px, 2.3vw, 14.2px);';

    commentHtml += '<div style="' + containerStyle + '">';
    commentHtml += '<div style="padding: 0 clamp(30px, 5vw, 50px) clamp(10px, 2vw, 15px) clamp(30px, 5vw, 50px); text-align: center;">';
    commentHtml += '<span style="display: inline-block; font-size: clamp(10px, 1.8vw, 12px); font-weight: 600; letter-spacing: clamp(1.5px, 0.3vw, 2px); color: ' + themeStyle.headerText + '; text-transform: uppercase; border-bottom: 1px solid ' + themeStyle.headerText + '; padding-bottom: 5px; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';">Comment</span>';
    commentHtml += '</div>';
    commentHtml += '<div style="padding: 0 clamp(30px, 5vw, 50px);">' + parseText(commentText, themeStyle, true, true, 100, ctx) + '</div>';

    const today = new Date();
    const dateStr = today.getFullYear() + '.' + String(today.getMonth() + 1).padStart(2, '0') + '.' + String(today.getDate()).padStart(2, '0');
    commentHtml += '<div style="text-align: right; padding: clamp(10px, 2vw, 15px) clamp(30px, 5vw, 50px) 0 clamp(30px, 5vw, 50px); font-size: clamp(9px, 1.5vw, 10px); color: ' + (themeStyle.tagText || themeStyle.text) + '; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';">';
    if (commentNickname && commentNickname.trim()) {
        commentHtml += 'BY ' + commentNickname + ' • ' + dateStr;
    } else {
        commentHtml += dateStr;
    }
    commentHtml += '</div>';
    commentHtml += '</div>';
    return commentHtml;
}

function createSoundtrackSection(youtubeUrl, songTitle, artistName, themeStyle, isPreview, ctx) {
    let videoId = '';
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\/\s]+)/,
        /youtube\.com\/.*[?&]v=([^&?\/\s]+)/
    ];
    for (let pattern of patterns) {
        const match = youtubeUrl.match(pattern);
        if (match && match[1]) { videoId = match[1]; break; }
    }
    if (!videoId) return '';

    const embedUrl = 'https://www.youtube.com/embed/' + videoId;
    const thumbnailUrl = 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';

    let html = '';
    html += '<div style="padding-top: clamp(20px, 4vw, 30px);"></div>';
    html += '<div style="text-align: center; padding-bottom: clamp(15px, 3vw, 20px);">';
    html += '<span style="display: inline-block; font-size: clamp(11px, 2vw, 13px); font-weight: 600; letter-spacing: clamp(1.5px, 0.3vw, 2px); color: ' + themeStyle.headerText + '; text-transform: uppercase; border-bottom: 1px solid ' + themeStyle.headerText + '; padding-bottom: 5px; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';">Soundtrack</span>';
    html += '</div>';
    html += '<div style="text-align: center; padding: 0 clamp(20px, 5vw, 40px) clamp(25px, 4vw, 35px);">';
    html += '<div style="max-width: 300px; margin: 0 auto;">';
    if (isPreview) {
        html += '<div style="width: 300px; height: 300px; background: #000 url(\'' + thumbnailUrl + '\') center center / cover no-repeat; border-radius: 4px;">';
        html += '<div style="display: table; width: 100%; height: 100%;"><div style="display: table-cell; vertical-align: middle; text-align: center;">';
        html += '<div style="width: 60px; height: 60px; margin: 0 auto; background: rgba(255,0,0,0.9); border-radius: 12px;">';
        html += '<div style="display: table; width: 100%; height: 100%;"><div style="display: table-cell; vertical-align: middle; text-align: center;">';
        html += '<div style="display: inline-block; width: 0; height: 0; border-top: 12px solid transparent; border-bottom: 12px solid transparent; border-left: 18px solid #fff; margin-left: 4px;"></div>';
        html += '</div></div></div></div></div></div>';
    } else {
        html += '<iframe src="' + embedUrl + '" width="300" height="300" allowfullscreen="true"></iframe>';
    }
    html += '</div>';
    if (songTitle || artistName) {
        html += '<div style="max-width: 300px; margin: clamp(12px, 2.5vw, 18px) auto 0; text-align: center;">';
        if (songTitle) html += '<div style="font-size: clamp(13px, 2.5vw, 15px); font-weight: 600; color: ' + (themeStyle.header || themeStyle.text) + '; line-height: 1.4; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';">' + songTitle + '</div>';
        if (artistName) html += '<div style="font-size: clamp(11px, 2vw, 12px); color: ' + (themeStyle.tagText || '#888') + '; margin-top: 4px; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';">' + artistName + '</div>';
        html += '</div>';
    }
    html += '<div style="max-width: 200px; margin: clamp(15px, 3vw, 22px) auto 0;">';
    html += '<div style="display: table; width: 100%;">';
    html += '<div style="display: table-cell; width: 33%; text-align: center; vertical-align: middle;">';
    html += '<div style="display: inline-block; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-right: 8px solid ' + (themeStyle.tagText || '#888') + ';"></div>';
    html += '<div style="display: inline-block; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-right: 8px solid ' + (themeStyle.tagText || '#888') + '; margin-left: 2px;"></div>';
    html += '</div>';
    html += '<div style="display: table-cell; width: 34%; text-align: center; vertical-align: middle;">';
    html += '<div style="display: inline-block; width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-left: 14px solid ' + (themeStyle.em || themeStyle.header) + ';"></div>';
    html += '</div>';
    html += '<div style="display: table-cell; width: 33%; text-align: center; vertical-align: middle;">';
    html += '<div style="display: inline-block; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 8px solid ' + (themeStyle.tagText || '#888') + ';"></div>';
    html += '<div style="display: inline-block; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 8px solid ' + (themeStyle.tagText || '#888') + '; margin-left: 2px;"></div>';
    html += '</div>';
    html += '</div></div>';
    html += '</div>';
    return html;
}

function createContainer(content, type, bgImage, isCollapsed, headerHtml, tagsHtml, hasTopImage, noBottomPadding, ctx) {
    const theme = getTheme(ctx.globalTheme, ctx);
    const topPadding = hasTopImage ? '0' : 'clamp(20px, 4vw, 30px)';
    const bottomPadding = noBottomPadding ? '0' : 'clamp(20px, 4vw, 30px)';
    const overflowStyle = noBottomPadding ? 'overflow:hidden;' : '';
    let containerStyle = 'box-shadow:0 4px 16px rgba(0,0,0,0.1);max-width: 900px; margin: 5px auto; border-radius: 1rem; background-color: ' + theme.bg + '; padding: ' + topPadding + ' 0 ' + bottomPadding + ' 0; ' + overflowStyle + 'font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + '; font-size: clamp(13px, 2.3vw, 14.2px);';

    if (bgImage) {
        const normalizedBgImage = normalizeImageUrl(bgImage);
        const rgb = hexToRgb(theme.bg);
        containerStyle = 'box-shadow:0 4px 16px rgba(0,0,0,0.1);max-width: 900px; margin: 5px auto; padding: clamp(15px, 3vw, 30px); border-radius: 1rem; background-image: url(\'' + normalizedBgImage + '\'); background-size: cover; background-position: center; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + '; font-size: clamp(13px, 2.3vw, 14.2px);';

        if (isCollapsed && headerHtml) {
            const headerInBg = '<div style="padding: clamp(15px, 3vw, 20px) 0;">' + headerHtml.replace('margin-bottom: 20px; padding-top: 20px;', 'margin: 0; padding: 0;') + '</div>';
            content = '<div style="background-color: rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.85); padding: 0; border-radius: 1rem; margin-top: clamp(15px, 3vw, 20px);">' + content + '</div>';
            if (tagsHtml) content += tagsHtml;
            const summaryStyle = 'cursor: pointer; list-style: none; outline: none; color: inherit; font-weight: normal;';
            let detailsHtml = '<details style="' + containerStyle + '">';
            detailsHtml += '<summary style="' + summaryStyle + '">' + headerInBg + '</summary>';
            detailsHtml += content + '</details>';
            return detailsHtml;
        } else {
            if (headerHtml) {
                const headerInBg = '<div style="padding: clamp(15px, 3vw, 20px) 0;">' + headerHtml.replace('margin-bottom: 20px; padding-top: 20px;', 'margin: 0; padding: 0;') + '</div>';
                const contentWithoutHeader = content.replace(headerHtml, '').replace('<div style="margin-bottom: 20px;"></div>', '');
                content = headerInBg + '<div style="background-color: rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.85); padding: 0; border-radius: 8px; margin-top: clamp(15px, 3vw, 20px);">' + contentWithoutHeader + '</div>';
                if (tagsHtml) content += tagsHtml;
            } else {
                content = '<div style="background-color: rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.85); padding: 0; border-radius: 8px;">' + content + '</div>';
                if (tagsHtml) content += tagsHtml;
            }
        }
    }

    if (isCollapsed && headerHtml) {
        const collapsedHeaderHtml = headerHtml.replace('margin-bottom: 20px; padding-top: 20px;', 'margin: 0; padding: clamp(15px, 3vw, 20px) 0 clamp(15px, 3vw, 20px) 0;');
        const summaryStyle = 'cursor: pointer; list-style: none; outline: none; color: inherit; font-weight: normal;';
        const arrowWrapperStart = '<div style="width: 100%; display: table;"><div style="display: table-row;"><div style="display: table-cell; vertical-align: middle;">';
        const arrowWrapperMid = '</div><div style="display: table-cell; vertical-align: middle; width: clamp(50px, 10vw, 70px); text-align: right; padding-right: clamp(30px, 5vw, 50px);"><span style="font-size: ' + pxToClamp(ctx.headingFontSizes.sectionTitle) + '; color: ' + theme.tagText + ';">⌵</span></div></div></div>';
        const summaryContent = arrowWrapperStart + collapsedHeaderHtml + arrowWrapperMid;
        let detailsHtml = '<details style="' + containerStyle + '">';
        detailsHtml += '<summary style="' + summaryStyle + '">' + summaryContent + '</summary>';
        detailsHtml += content + '</details>';
        return detailsHtml;
    }

    if (headerHtml) {
        const arrowWrapperStart = '<div style="width: 100%; display: table;"><div style="display: table-row;"><div style="display: table-cell; vertical-align: middle;">';
        const arrowWrapperMid = '</div><div style="display: table-cell; vertical-align: middle; width: clamp(50px, 10vw, 70px); text-align: right; padding-right: clamp(30px, 5vw, 50px);"><span style="font-size: ' + pxToClamp(ctx.headingFontSizes.sectionTitle) + '; color: ' + theme.tagText + ';">⌵</span></div></div></div>';
        const headerWithArrow = arrowWrapperStart + headerHtml + arrowWrapperMid;
        return '<div style="' + containerStyle + '">' + headerWithArrow + content + '</div>';
    }

    return '<div style="' + containerStyle + '">' + content + '</div>';
}

function generateHTML(ctx, isPreview) {
    let html = '';

    const enableTopSection = ctx.enableTopSection;
    const enableProfiles = ctx.enableProfiles;
    const enableTags = ctx.enableTags;
    const summaryText = ctx.summaryText || '';
    const enableCover = ctx.enableCover;
    const coverImageUrl = enableCover ? normalizeImageUrl(ctx.coverImage) : '';

    if (enableCover && coverImageUrl) {
        const originalCoverUrl = (ctx.coverImage || '').trim();
        const needsCoverProxy = originalCoverUrl.includes('namu.la') || originalCoverUrl.includes('arca.live');
        if (needsCoverProxy) {
            const proxies = [
                originalCoverUrl,
                'https://images.weserv.nl/?url=' + encodeURIComponent(originalCoverUrl),
                'https://api.allorigins.win/raw?url=' + encodeURIComponent(originalCoverUrl)
            ];
            const proxyList = proxies.join('|');
            html += '<img style="width: 0px; height: 0px;" src="' + coverImageUrl + '" class="fr-fic fr-dii" data-proxies="' + proxyList + '" data-proxy-index="0" onerror="(function(img){var proxies=img.dataset.proxies.split(\'|\');var idx=parseInt(img.dataset.proxyIndex||0);if(idx<proxies.length-1){img.dataset.proxyIndex=idx+1;img.src=proxies[idx+1];}else{img.remove();};})(this)">';
        } else {
            html += '<img style="width: 0px; height: 0px;" src="' + coverImageUrl + '" class="fr-fic fr-dii">';
        }
    }

    if (enableTopSection) {
        const themeType = ctx.globalTheme;
        const theme = getTheme(themeType, ctx);
        let topContent = '';
        const coverImage = coverImageUrl;
        const lineRgb = hexToRgb(theme.line);
        const lineColor = 'rgba(' + lineRgb.r + ', ' + lineRgb.g + ', ' + lineRgb.b + ', 0.6)';

        const coverArchiveNo = ctx.coverArchiveNo || '';
        const coverTitle = ctx.coverTitle || '';
        const coverSubtitle = ctx.coverSubtitle || '';
        const soundtrackUrlCheck = ctx.soundtrackUrl || '';
        const hasRealContent = (enableProfiles && ctx.profiles.length > 0) || summaryText.trim() || (soundtrackUrlCheck && soundtrackUrlCheck.trim());
        const hasCommentSection = ctx.enableComment && ctx.commentText && ctx.commentText.trim();
        const isIntroLastContainer = ctx.pages.length === 0 && !hasCommentSection;

        if (enableCover) {
            const coverAutoFit = ctx.coverAutoFit;
            const coverZoom = ctx.coverZoom;
            const coverFocusX = ctx.coverFocusX;
            const coverFocusY = ctx.coverFocusY;
            const hasCoverContent = coverImage || coverArchiveNo || coverTitle || coverSubtitle;

            if (hasCoverContent) {
                if (coverImage) {
                    const normalizedCoverImage = normalizeImageUrl(coverImage);
                    const backgroundSize = coverAutoFit ? 'cover' : (coverZoom + '% auto');
                    const coverWrapperMarginBottom = hasRealContent ? '30px' : '0';
                    const coverImgBorderRadius = hasRealContent ? '10px 10px 0 0' : '10px 10px 10px 10px';

                    topContent += '<div style="width:100%;margin:0 0 ' + coverWrapperMarginBottom + ' 0;box-sizing:border-box;background-color:#1a1a1a;background-image:url(\'' + normalizedCoverImage + '\');background-size:' + backgroundSize + ';background-position:' + coverFocusX + '% ' + coverFocusY + '%;background-repeat:no-repeat;border-radius:' + coverImgBorderRadius + ';display:table;">';
                    topContent += '<div style="display:table-cell;vertical-align:bottom;width:100%;height:min(68.421vw, 615px);min-height:200px;padding:clamp(15px, 3vw, 20px) clamp(30px, 5vw, 40px);box-sizing:border-box;background:linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 25%, transparent 45%);border-radius:' + coverImgBorderRadius + ';">';

                    if (coverArchiveNo) {
                        topContent += '<p style="font-size:' + pxToClamp(ctx.headingFontSizes.coverArchiveNo) + ';color:rgba(255, 255, 255, 0.8);letter-spacing:clamp(2px, 0.4vw, 3px);margin:0 0 5px 0;font-family:\'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';text-shadow:0 2px 4px rgba(0,0,0,0.5);">' + coverArchiveNo + '</p>';
                    }
                    if (coverTitle) {
                        const titleMargin = coverSubtitle ? '0 0 0px 0' : '0 0 10px 0';
                        topContent += '<h1 style="font-size:' + pxToClamp(ctx.headingFontSizes.coverTitle) + ';color:rgba(255, 255, 255, 1.0);margin:' + titleMargin + ';font-family:\'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';font-weight:700;line-height:1.0;text-shadow:0 4px 15px rgba(0,0,0,0.6);word-break:keep-all;">' + coverTitle + '</h1>';
                    }
                    if (coverSubtitle) {
                        topContent += '<div style="font-size:' + pxToClamp(ctx.headingFontSizes.coverSubtitle) + ';letter-spacing:-0.5px;color:rgba(255, 255, 255, 0.9);margin:5px 0 10px 0;font-family:\'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';max-width:90%;text-shadow:0 1px 3px rgba(0,0,0,0.8);">' + coverSubtitle + '</div>';
                    }
                    if (enableTags && ctx.tags && ctx.tags.length > 0) {
                        const validTags = ctx.tags.filter(function (tag) { return tag.value && tag.value.trim(); });
                        if (validTags.length > 0) {
                            topContent += '<div style="font-size:0;">';
                            validTags.forEach(function (tag) {
                                const tagContent = tag.link
                                    ? '<a href="' + tag.link + '" style="text-decoration:none;color:inherit;">' + tag.value + '</a>'
                                    : tag.value;
                                const tagStyle = 'display:inline-block;vertical-align:top;background:rgba(255, 255, 255, 0.1);color:#ffffff;padding:' + pxToClamp(Math.round(ctx.headingFontSizes.coverTag * 0.45)) + ' ' + pxToClamp(Math.round(ctx.headingFontSizes.coverTag * 1.1)) + ';margin:0 ' + pxToClamp(Math.round(ctx.headingFontSizes.coverTag * 0.7)) + ' ' + pxToClamp(Math.round(ctx.headingFontSizes.coverTag * 0.7)) + ' 0;border:1px solid rgba(255, 255, 255, 0.3);font-size:' + pxToClamp(ctx.headingFontSizes.coverTag) + ';font-family:\'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';';
                                topContent += '<span style="' + tagStyle + '">' + tagContent + '</span> ';
                            });
                            topContent += '</div>';
                        }
                    }
                    topContent += '</div></div>';
                } else {
                    topContent += '<div style="padding: clamp(20px, 4vw, 30px) clamp(30px, 5vw, 40px) clamp(15px, 3vw, 20px) clamp(30px, 5vw, 40px);">';
                    if (coverArchiveNo) {
                        topContent += '<p style="font-size:' + pxToClamp(ctx.headingFontSizes.coverArchiveNo) + ';color:' + theme.tagText + ';letter-spacing:clamp(2px, 0.4vw, 3px);margin:0 0 8px 0;font-family:\'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';">' + coverArchiveNo + '</p>';
                    }
                    if (coverTitle) {
                        const titleMargin = coverSubtitle ? '0 0 5px 0' : '0 0 15px 0';
                        topContent += '<h1 style="font-size:' + pxToClamp(ctx.headingFontSizes.coverTitle) + ';color:' + theme.header + ';margin:' + titleMargin + ';font-family:\'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';font-weight:700;line-height:1.1;word-break:keep-all;">' + coverTitle + '</h1>';
                    }
                    if (coverSubtitle) {
                        topContent += '<div style="font-size:' + pxToClamp(ctx.headingFontSizes.coverSubtitle) + ';letter-spacing:-0.5px;color:' + theme.text + ';margin:5px 0 15px 0;font-family:\'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';max-width:90%;">' + coverSubtitle + '</div>';
                    }
                    if (enableTags && ctx.tags && ctx.tags.length > 0) {
                        const validTags = ctx.tags.filter(function (tag) { return tag.value && tag.value.trim(); });
                        if (validTags.length > 0) {
                            topContent += '<div style="font-size:0;margin-top:10px;">';
                            validTags.forEach(function (tag) {
                                const tagContent = tag.link
                                    ? '<a href="' + tag.link + '" style="text-decoration:none;color:inherit;">' + tag.value + '</a>'
                                    : tag.value;
                                const tagStyle = 'display:inline-block;vertical-align:top;background:' + theme.quote1Bg + ';color:' + theme.text + ';padding:' + pxToClamp(Math.round(ctx.headingFontSizes.coverTag * 0.45)) + ' ' + pxToClamp(Math.round(ctx.headingFontSizes.coverTag * 1.1)) + ';margin:0 ' + pxToClamp(Math.round(ctx.headingFontSizes.coverTag * 0.7)) + ' ' + pxToClamp(Math.round(ctx.headingFontSizes.coverTag * 0.7)) + ' 0;border:1px solid ' + theme.divider + ';font-size:' + pxToClamp(ctx.headingFontSizes.coverTag) + ';font-family:\'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';';
                                topContent += '<span style="' + tagStyle + '">' + tagContent + '</span> ';
                            });
                            topContent += '</div>';
                        }
                    }
                    topContent += '</div>';
                }
            }
        }

        if (enableProfiles && ctx.profiles.length > 0) {
            const hasCoverContent = coverImage || coverArchiveNo || coverTitle || coverSubtitle;
            const topPadding = hasCoverContent ? '0px' : '30px';
            topContent += '<div style="padding: ' + topPadding + ' 0 10px 0;">';
            topContent += '<div style="padding: 0 clamp(30px, 5vw, 50px) 10px clamp(30px, 5vw, 50px); text-align: center;">';
            topContent += '<span style="display: inline-block; font-size: clamp(11px, 2vw, 13px); font-weight: 600; letter-spacing: clamp(1.5px, 0.3vw, 2px); color: ' + theme.headerText + '; text-transform: uppercase; border-bottom: 1px solid ' + theme.headerText + '; padding-bottom: 5px;margin-bottom:10px">Profile</span>';
            topContent += '</div>';

            const profileRowStyle = 'width: 100%; text-align: center; font-size: 0; margin-bottom: 0px;';
            const profileContainerStyle = 'display: inline-block; width: 50%; max-width: 350px; vertical-align: top; text-align: center; box-sizing: border-box; padding: 0 clamp(15px, 4vw, 30px); margin-bottom: clamp(20px, 4vw, 30px);';
            const imgWrapperStyle = 'display: inline-block; width: 100%; max-width: clamp(130px, 18vw, 200px); vertical-align: top; margin: 0 auto clamp(10px, 2vw, 15px) auto;';
            const imgCircleStyleBase = 'width: 100%; height: 0; padding-bottom: 100%; border-radius: 50%; margin: 0 auto;';
            const textContainerStyle = 'text-align: center;';
            const nameStyle = 'display: block; font-size: clamp(13px, 2.5vw, 18px); font-weight: 700; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + '; color: ' + theme.headerText + '; line-height: 1.2; margin-bottom: clamp(6px, 1.5vw, 10px);';
            const tagStyle = 'font-size: clamp(8px, 1.3vw, 10px); color: ' + theme.tagText + '; margin-bottom: 3px; font-weight: 600; text-transform: uppercase; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';';
            const descStyle = 'font-size: clamp(11px, 2vw, 12px); line-height: 1.6; color: ' + theme.text + '; word-break: keep-all; text-align: center; padding: 0 5px; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';';

            topContent += '<div style="' + profileRowStyle + '">';
            ctx.profiles.forEach(function (profile) {
                const profileImageUrl = normalizeImageUrl(profile.imageUrl || '');
                const hasImage = profileImageUrl.trim() !== '';
                const hasContent = (profile.name && profile.name.trim()) || (profile.desc && profile.desc.trim());
                if (hasContent) {
                    topContent += '<div style="' + profileContainerStyle + '">';
                    if (hasImage) {
                        topContent += '<div style="' + imgWrapperStyle + '">';
                        const bgPosition = (profile.focusX || 50) + '% ' + (profile.focusY || 30) + '%';
                        const bgSize = (profile.zoom || 100) + '% auto';
                        topContent += '<div style="' + imgCircleStyleBase + ' background: url(\'' + profileImageUrl + '\') ' + bgPosition + ' / ' + bgSize + ' no-repeat;"></div>';
                        topContent += '</div>';
                    }
                    topContent += '<div style="' + textContainerStyle + '">';
                    if (profile.tag) topContent += '<div style="' + tagStyle + '">' + profile.tag + '</div>';
                    if (profile.name && profile.name.trim()) topContent += '<div style="' + nameStyle + '">' + profile.name + '</div>';
                    if (profile.desc && profile.desc.trim()) {
                        const descText = profile.desc.replace(/\n/g, '<br>');
                        topContent += '<div style="' + descStyle + '">' + descText + '</div>';
                    }
                    topContent += '</div></div>';
                }
            });
            topContent += '</div></div>';
        }

        if (summaryText.trim()) {
            const hasCoverContent = coverImage || coverArchiveNo || coverTitle || coverSubtitle;
            const needTopPadding = !hasCoverContent && (!enableProfiles || ctx.profiles.length === 0);
            const topPadding = needTopPadding ? '30px' : '20px';
            if (!enableProfiles || ctx.profiles.length === 0) {
                topContent += '<div style="padding-top: ' + topPadding + ';"></div>';
            }
            topContent += '<div style="padding: 0 clamp(20px, 3vw, 25px) 5px clamp(20px, 3vw, 25px); text-align: center;">';
            topContent += '<span style="display: inline-block; font-size: clamp(11px, 2vw, 13px); font-weight: 600; letter-spacing: clamp(1.5px, 0.3vw, 2px); color: ' + theme.headerText + '; text-transform: uppercase; border-bottom: 1px solid ' + theme.headerText + '; padding-bottom: 5px; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';">Story So Far</span>';
            topContent += '</div>';
            topContent += '<div style="padding: 10px clamp(30px, 5vw, 50px) 10px clamp(30px, 5vw, 50px);">' + parseText(summaryText, theme, true, true, 100, ctx) + '</div>';
        }

        const soundtrackUrl = ctx.soundtrackUrl || '';
        const soundtrackTitle = ctx.soundtrackTitle || '';
        const soundtrackArtist = ctx.soundtrackArtist || '';
        if (soundtrackUrl && soundtrackUrl.trim()) {
            topContent += createSoundtrackSection(soundtrackUrl, soundtrackTitle, soundtrackArtist, theme, isPreview, ctx);
        }

        if (enableCover && !hasRealContent) {
            html += '<div style="max-width:900px;margin:5px auto;">' + topContent + '</div>';
        } else if (hasRealContent || enableCover) {
            html += createContainer(topContent, themeType, null, false, null, null, !!coverImage, false, ctx);
        }
    }

    if (enableTopSection && ctx.pages.length > 0) {
        html += '<br>';
    }

    let pageNumber = 0;
    let sectionNumber = 0;
    let sectionContainerHtml = '';
    let currentSectionTheme = null;
    let currentSectionHasImage = false;
    let isInSection = false;

    const hasCommentAtEnd = ctx.enableComment && ctx.commentText && ctx.commentText.trim();

    ctx.pages.forEach(function (item, index) {
        if (item.itemType === 'section') {
            if (isInSection && sectionContainerHtml) {
                const topPadding = currentSectionHasImage ? '0' : 'clamp(20px, 4vw, 30px)';
                html += '<div style="box-shadow:0 4px 16px rgba(0,0,0,0.1);max-width: 900px; margin: 5px auto; border-radius: 1rem; background-color: ' + currentSectionTheme.bg + '; padding: ' + topPadding + ' 0 clamp(20px, 4vw, 30px) 0; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + '; font-size: clamp(13px, 2.2vw, 14.2px);">';
                html += sectionContainerHtml;
                html += '</div><br>';
                sectionContainerHtml = '';
            }

            pageNumber = 0;
            sectionNumber++;
            isInSection = true;
            currentSectionHasImage = item.image && item.image.trim();

            if (index + 1 < ctx.pages.length && ctx.pages[index + 1].itemType !== 'section') {
                currentSectionTheme = getTheme(ctx.globalTheme, ctx);
            } else {
                currentSectionTheme = getTheme(ctx.globalTheme, ctx);
                isInSection = false;
            }

            let sectionHtml = '';
            if (item.image && item.image.trim()) {
                const zoom = item.zoom || 100;
                const focusX = item.focusX || 50;
                const focusY = item.focusY || 50;
                const textAlign = item.align || 'center';
                const sectionImage = normalizeImageUrl(item.image);
                const sectionMarginBottom = isInSection ? 'margin-bottom:20px;' : '';
                const sectionBorderRadius = isInSection ? 'border-radius:10px 10px 0 0;' : 'border-radius:10px;';

                sectionHtml += '<div style="width:100%;height:15vh;display:table;background-color:#1a1a1a;background-image:url(\'' + sectionImage + '\');background-size:' + zoom + '% auto;background-position:' + focusX + '% ' + focusY + '%;background-repeat:no-repeat;' + sectionBorderRadius + sectionMarginBottom + '">';
                sectionHtml += '<div style="display:table-cell;vertical-align:middle;width:100%;height:15vh;padding:clamp(15px, 3vw, 20px) clamp(30px, 5vw, 40px);box-sizing:border-box;background:linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 30%, transparent 60%);' + sectionBorderRadius + 'text-align:' + textAlign + ';">';
                if (item.subtitle && item.subtitle.trim()) {
                    sectionHtml += '<div style="font-size:' + pxToClamp(ctx.headingFontSizes.sectionSubtitle) + ';line-height:1.3;letter-spacing:clamp(1.5px, 0.3vw, 2px);color:rgba(255, 255, 255, 0.7);margin:0 0 clamp(6px, 1.2vw, 8px) 0;font-family:\'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';text-transform:uppercase;text-shadow:0 1px 3px rgba(0,0,0,0.8);">' + item.subtitle + '</div>';
                }
                if (item.title) {
                    sectionHtml += '<h1 style="font-size:' + pxToClamp(ctx.headingFontSizes.sectionTitle) + ';color:rgba(255, 255, 255, 1.0);margin:0;font-family:\'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';font-weight:700;line-height:1.2;text-shadow:0 4px 15px rgba(0,0,0,0.6);">' + item.title + '</h1>';
                }
                sectionHtml += '</div></div>';
            } else {
                const textAlign = item.align || 'center';
                sectionHtml += '<div style="width: 100%; padding: clamp(15px, 3vw, 20px) clamp(30px, 5vw, 40px); text-align: ' + textAlign + ';">';
                if (item.subtitle && item.subtitle.trim()) {
                    sectionHtml += '<div style="font-size: ' + pxToClamp(ctx.headingFontSizes.sectionSubtitle) + '; color: ' + currentSectionTheme.tagText + '; letter-spacing: clamp(1.5px, 0.3vw, 2px); margin-bottom: clamp(8px, 1.5vw, 10px); text-transform: uppercase;">' + item.subtitle + '</div>';
                }
                if (item.title) {
                    sectionHtml += '<div style="font-size: ' + pxToClamp(ctx.headingFontSizes.sectionTitle) + '; font-weight: 700; color: ' + currentSectionTheme.header + '; letter-spacing: clamp(0.5px, 0.2vw, 1px);">' + item.title + '</div>';
                }
                sectionHtml += '</div>';
            }

            if (isInSection) {
                sectionContainerHtml += sectionHtml;
            } else {
                html += '<div style="box-shadow:0 4px 16px rgba(0,0,0,0.1);max-width: 900px; margin: 5px auto; border-radius: 10px; background-color: ' + currentSectionTheme.bg + '; padding: 0; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + ';">';
                html += sectionHtml;
                html += '</div>';
                if (index + 1 < ctx.pages.length && ctx.pages[index + 1].itemType === 'section') {
                    html += '<br>';
                }
            }
        } else {
            pageNumber++;
            const currentPage = item;
            const theme = getTheme(ctx.globalTheme, ctx);

            let headerText = '#' + pageNumber;
            if (currentPage.title && currentPage.title.trim()) headerText += ' ' + currentPage.title;
            if (currentPage.subtitle && currentPage.subtitle.trim()) headerText += ' - ' + currentPage.subtitle;

            let pageContentHtml = '';
            const header = createHeader(headerText, theme, currentPage.headerImage, currentPage.headerFocusX, currentPage.headerFocusY, ctx);
            const isExpanded = currentPage.collapsed;
            const pageImageWidth = (currentPage.imageWidth !== undefined && currentPage.imageWidth !== null) ? currentPage.imageWidth : 100;

            if (!ctx.enablePageFold) {
                if (ctx.showHeaderWhenFoldOff) pageContentHtml += header;
                pageContentHtml += '<div style="padding: clamp(20px, 4vw, 30px) clamp(30px, 5vw, 50px);">' + parseText(currentPage.content, theme, false, false, pageImageWidth, ctx) + '</div>';

                if (currentPage.bgImage) {
                    const pageHtml = createContainer(pageContentHtml, currentPage.type, currentPage.bgImage, false, null, null, false, false, ctx);
                    if (isInSection) sectionContainerHtml += pageHtml;
                    else html += pageHtml;
                } else {
                    if (isInSection) {
                        sectionContainerHtml += pageContentHtml;
                        if (index + 1 < ctx.pages.length && ctx.pages[index + 1].itemType !== 'section') {
                            const hrColor = theme.divider || theme.tagText || 'rgba(0,0,0,0.1)';
                            sectionContainerHtml += '<div style="height: 1px; background-color: ' + hrColor + '; margin: clamp(10px, 2vw, 15px) clamp(30px, 5vw, 50px);"></div>';
                        }
                    } else {
                        html += createContainer(pageContentHtml, currentPage.type, currentPage.bgImage, false, null, null, false, false, ctx);
                    }
                }
            } else if (isExpanded) {
                if (currentPage.bgImage) {
                    pageContentHtml += '<div style="padding: clamp(20px, 4vw, 30px) clamp(30px, 5vw, 50px);">' + parseText(currentPage.content, theme, false, false, pageImageWidth, ctx) + '</div>';
                } else {
                    pageContentHtml += '<div style="padding: clamp(20px, 4vw, 30px) clamp(30px, 5vw, 50px);">' + parseText(currentPage.content, theme, false, false, pageImageWidth, ctx) + '</div>';
                }

                if (currentPage.bgImage) {
                    const pageHtml = createContainer(pageContentHtml, currentPage.type, currentPage.bgImage, false, header, null, false, false, ctx);
                    if (isInSection) sectionContainerHtml += pageHtml;
                    else html += pageHtml;
                } else {
                    if (isInSection) {
                        sectionContainerHtml += header + pageContentHtml;
                        if (index + 1 < ctx.pages.length && ctx.pages[index + 1].itemType !== 'section') {
                            const hrColor = theme.divider || theme.tagText || 'rgba(0,0,0,0.1)';
                            sectionContainerHtml += '<div style="height: 1px; background-color: ' + hrColor + '; margin: clamp(10px, 2vw, 15px) clamp(30px, 5vw, 50px);"></div>';
                        }
                    } else {
                        html += createContainer(pageContentHtml, currentPage.type, currentPage.bgImage, false, header, null, false, false, ctx);
                    }
                }
            } else {
                let collapsedContent = '<div style="padding: clamp(15px, 3vw, 20px) clamp(30px, 5vw, 50px);">' + parseText(currentPage.content, theme, false, false, pageImageWidth, ctx) + '</div>';

                if (currentPage.bgImage) {
                    const pageHtml = createContainer(collapsedContent, currentPage.type, currentPage.bgImage, true, header, null, false, false, ctx);
                    if (isInSection) sectionContainerHtml += pageHtml;
                    else html += pageHtml;
                } else {
                    if (isInSection) {
                        const summaryStyle = 'cursor: pointer; list-style: none; outline: none; color: inherit; font-weight: normal;';
                        const collapsedHeaderHtml = header.replace('margin-bottom: 20px; padding-top: 20px;', 'margin: 0;').replace('vertical-align: center;', 'vertical-align: middle;');
                        const arrowWrapperStart = '<div style="width: 100%; display: table;"><div style="display: table-row;"><div style="display: table-cell; vertical-align: middle;">';
                        const arrowWrapperMid = '</div><div style="display: table-cell; vertical-align: middle; width: clamp(50px, 10vw, 70px); text-align: right; padding-right: clamp(30px, 5vw, 50px);"><span style="font-size: ' + pxToClamp(ctx.headingFontSizes.sectionTitle) + '; color: ' + theme.tagText + ';">⌵</span></div></div></div>';
                        sectionContainerHtml += '<details style="margin: 0;">';
                        sectionContainerHtml += '<summary style="' + summaryStyle + '">' + arrowWrapperStart + collapsedHeaderHtml + arrowWrapperMid + '</summary>';
                        sectionContainerHtml += collapsedContent;
                        sectionContainerHtml += '</details>';
                        if (index + 1 < ctx.pages.length && ctx.pages[index + 1].itemType !== 'section') {
                            const hrColor = theme.divider || theme.tagText || 'rgba(0,0,0,0.1)';
                            sectionContainerHtml += '<div style="height: 1px; background-color: ' + hrColor + '; margin: clamp(10px, 2vw, 15px) clamp(30px, 5vw, 50px);"></div>';
                        }
                    } else {
                        html += createContainer(collapsedContent, currentPage.type, currentPage.bgImage, true, header, null, false, false, ctx);
                    }
                }
            }

            if (!isInSection && index < ctx.pages.length - 1) {
                html += '<br>';
            }
        }
    });

    if (isInSection && sectionContainerHtml) {
        const topPadding = currentSectionHasImage ? '0' : 'clamp(20px, 4vw, 30px)';
        html += '<div style="box-shadow:0 4px 16px rgba(0,0,0,0.1);max-width: 900px; margin: 5px auto; border-radius: 1rem; background-color: ' + currentSectionTheme.bg + '; padding: ' + topPadding + ' 0 clamp(20px, 4vw, 30px) 0; font-family: \'' + ctx.fontFamily + '\', ' + getFontFallback(ctx.fontFamily) + '; font-size: clamp(13px, 2.2vw, 14.2px);">';
        html += sectionContainerHtml;
        html += '</div>';
    }

    if (ctx.enableComment) {
        const commentText = ctx.commentText || '';
        const commentNickname = ctx.commentNickname || '';
        if (commentText && commentText.trim()) {
            const theme = getTheme(ctx.globalTheme, ctx);
            if (ctx.pages.length > 0) html += '<br>';
            html += createCommentSection(commentText, commentNickname, theme, ctx);
        }
    }

    return html;
}

function generateIntroHTML(ctx) {
    return generateHTML(Object.assign({}, ctx, { pages: [], enableComment: false }), true);
}
