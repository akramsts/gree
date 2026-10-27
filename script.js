const MAX_SUGGESTIONS = 5;
const CLEAR_BUTTON_HIDE_DELAY_MS = 250;
const DROPDOWN_HIDE_DELAY_MS = 300;
const MODAL_CLOSE_DELAY_MS = 120;

const ICONS = {
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    clock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    chevron: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
    close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
};

const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const historyDropdown = document.getElementById('historyDropdown');
const searchBox = document.querySelector('.search-box');
const searchContainer = document.querySelector('.search-container');

const engineBtn = document.getElementById('engineBtn');
const engineIcon = document.getElementById('engineIcon');
const engineModal = document.getElementById('engineModal');
const engineList = document.getElementById('engineList');

const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
const topMenu = menuBtn.closest('.top-menu');

let selectedIndex = -1;
let typedQuery = '';
let historyCache = null;
let engineModalClosing = false;

function getHistory() {
    if (historyCache === null) historyCache = getSearchHistory();
    return historyCache;
}

function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatch(text, needle) {
    if (!needle) return escapeHTML(text);

    const match = new RegExp(escapeRegExp(needle), 'i').exec(text);
    if (!match) return escapeHTML(text);

    const end = match.index + match[0].length;
    return `${escapeHTML(text.slice(0, match.index))}<b>${escapeHTML(match[0])}</b>${escapeHTML(text.slice(end))}`;
}

function getSuggestions(inputText) {
    const needle = inputText.trim().toLowerCase();
    const seen = new Set();
    const unique = getHistory().filter((item) => {
        const key = item.query.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    if (!needle) {
        return { items: unique.slice(0, MAX_SUGGESTIONS), showTyped: false };
    }

    const exact = [];
    const prefix = [];
    const partial = [];

    unique.forEach((item) => {
        const key = item.query.toLowerCase();
        if (key === needle) exact.push(item);
        else if (key.startsWith(needle)) prefix.push(item);
        else if (key.includes(needle)) partial.push(item);
    });

    return {
        items: [...exact, ...prefix, ...partial].slice(0, MAX_SUGGESTIONS),
        showTyped: !seen.has(needle)
    };
}

function buildSuggestionsHTML(items, needle, typedText) {
    let html = '';

    if (typedText) {
        html += `
            <div class="history-item" role="menuitem">
                <div class="history-icon">${ICONS.search}</div>
                <div class="history-text" data-query="${escapeHTML(typedText)}">${escapeHTML(typedText)}</div>
                <button class="history-delete" type="button" aria-label="Search">${ICONS.chevron}</button>
            </div>`;
    }

    items.forEach((item) => {
        html += `
            <div class="history-item" role="menuitem">
                <div class="history-icon">${ICONS.clock}</div>
                <div class="history-text" data-query="${escapeHTML(item.query)}">${highlightMatch(item.query, needle)}</div>
                <button class="history-delete" type="button" data-id="${escapeHTML(item.id)}" aria-label="Remove from history">${ICONS.close}</button>
            </div>`;
    });

    return html;
}

function hideHistoryDropdown() {
    historyDropdown.classList.remove('show');
    searchContainer.classList.remove('history-open');
}

function renderHistoryDropdown(inputText = '') {
    const typedText = inputText.trim();
    const { items, showTyped } = getSuggestions(typedText);

    if (items.length === 0 && !showTyped) {
        hideHistoryDropdown();
        historyDropdown.innerHTML = '';
        return;
    }

    selectedIndex = -1;
    historyDropdown.innerHTML = buildSuggestionsHTML(items, typedText.toLowerCase(), showTyped ? typedText : '');
    historyDropdown.classList.add('show');
    searchContainer.classList.add('history-open');
}

function deleteHistoryItem(id) {
    historyCache = removeHistoryEntry(id);
    renderHistoryDropdown(searchInput.value);
}

function updateHistorySelection(items) {
    items.forEach((item, index) => {
        const isSelected = index === selectedIndex;
        item.classList.toggle('selected', isSelected);

        if (isSelected) {
            const query = item.querySelector('.history-text').getAttribute('data-query');
            if (query) searchInput.value = query;
            item.scrollIntoView({ block: 'nearest' });
        }
    });

    if (selectedIndex === -1) searchInput.value = typedQuery;
}

function executeSearch(query, openInNewTab = false) {
    const cleaned = (query || '').replace(/[\r\n]+/g, ' ').trim();
    if (!cleaned) return;

    const url = buildUrl(cleaned);
    if (!url) return;

    historyCache = recordSearch(cleaned) ?? historyCache;

    if (openInNewTab) {
        window.open(url, '_blank', 'noopener');
    } else {
        window.location.href = url;
    }
}

function handleClear(reopenDropdown = true) {
    searchInput.value = '';
    typedQuery = '';
    selectedIndex = -1;
    clearBtn.classList.remove('visible');

    if (reopenDropdown) {
        searchInput.focus();
        renderHistoryDropdown('');
    } else {
        hideHistoryDropdown();
        searchInput.blur();
    }
}

function setMenuOpen(open) {
    menu.classList.toggle('show', open);
    menuBtn.setAttribute('aria-expanded', String(open));
}

function renderEngineButton() {
    const engine = getEngine();
    engineIcon.src = engine.logo;
    engineBtn.title = `Search engine: ${engine.name}`;
    engineBtn.setAttribute('aria-label', `Search engine: ${engine.name}. Change`);
}

function renderEngineList() {
    const currentId = getEngine().id;
    engineList.innerHTML = ENGINES.map((engine) => {
        const selected = engine.id === currentId;
        return `<button type="button" class="engine-option${selected ? ' selected' : ''}" role="radio" aria-checked="${selected}" data-id="${escapeHTML(engine.id)}">` +
            `<img src="${escapeHTML(engine.logo)}" alt="" width="28" height="28">` +
            `<span class="engine-name">${escapeHTML(engine.name)}</span></button>`;
    }).join('');
}

function openEngineModal() {
    hideHistoryDropdown();
    searchInput.blur();
    renderEngineList();
    engineModal.returnValue = '';
    engineModal.showModal();

    const selected = engineList.querySelector('.selected');
    if (selected) selected.focus();
}

function closeEngineModal(returnValue) {
    if (!engineModal.open || engineModalClosing) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        engineModal.close(returnValue);
        return;
    }

    engineModalClosing = true;
    engineModal.classList.add('closing');
    setTimeout(() => {
        engineModal.classList.remove('closing');
        engineModalClosing = false;
        engineModal.close(returnValue);
    }, MODAL_CLOSE_DELAY_MS);
}

searchBox.addEventListener('click', (event) => {
    if (event.target.closest('#engineBtn')) return;
    searchInput.focus();
});

searchInput.addEventListener('focus', () => {
    searchBox.classList.add('focused');
    historyCache = null;
    typedQuery = searchInput.value;
    selectedIndex = -1;

    if (searchInput.value.trim().length > 0) clearBtn.classList.add('visible');
    renderHistoryDropdown(searchInput.value);
});

searchInput.addEventListener('blur', () => {
    searchBox.classList.remove('focused');

    setTimeout(() => {
        if (document.activeElement === searchInput) return;
        if (searchInput.value.trim().length === 0) clearBtn.classList.remove('visible');
    }, CLEAR_BUTTON_HIDE_DELAY_MS);

    setTimeout(() => {
        if (document.activeElement === searchInput) return;
        if (historyDropdown.contains(document.activeElement)) return;
        hideHistoryDropdown();
    }, DROPDOWN_HIDE_DELAY_MS);
});

searchInput.addEventListener('input', () => {
    const text = searchInput.value;
    typedQuery = text;
    selectedIndex = -1;

    clearBtn.classList.toggle('visible', text.trim().length > 0);
    renderHistoryDropdown(text);
});

searchInput.addEventListener('keydown', (event) => {
    if (event.isComposing) return;

    const items = historyDropdown.querySelectorAll('.history-item');
    const isDropdownVisible = historyDropdown.classList.contains('show');

    if (isDropdownVisible && items.length > 0) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            selectedIndex = selectedIndex + 1 >= items.length ? -1 : selectedIndex + 1;
            updateHistorySelection(items);
            return;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            selectedIndex = selectedIndex - 1 < -1 ? items.length - 1 : selectedIndex - 1;
            updateHistorySelection(items);
            return;
        }
    }

    if (event.key === 'Enter') {
        const query = searchInput.value.trim();
        if (!query) return;
        executeSearch(query, event.shiftKey);
    }
});

clearBtn.addEventListener('click', () => handleClear());
clearBtn.addEventListener('mousedown', (event) => event.preventDefault());
clearBtn.addEventListener('touchstart', (event) => {
    event.preventDefault();
    handleClear();
}, { passive: false });

historyDropdown.addEventListener('mousedown', (event) => event.preventDefault());

historyDropdown.addEventListener('mousemove', () => {
    if (selectedIndex === -1) return;
    historyDropdown.querySelectorAll('.history-item').forEach((item) => item.classList.remove('selected'));
    selectedIndex = -1;
    searchInput.value = typedQuery;
});

historyDropdown.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('.history-delete');
    if (deleteBtn && deleteBtn.hasAttribute('data-id')) {
        event.stopPropagation();
        deleteHistoryItem(deleteBtn.getAttribute('data-id'));
        return;
    }

    const item = event.target.closest('.history-item');
    if (!item) return;

    const query = item.querySelector('.history-text').getAttribute('data-query');
    if (!query) return;

    searchInput.value = query;
    executeSearch(query, false);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (engineModal.open) return;
        if (menu.classList.contains('show')) {
            setMenuOpen(false);
            return;
        }
        if (historyDropdown.classList.contains('show')) {
            hideHistoryDropdown();
            return;
        }
        handleClear(false);
        return;
    }

    if (!(event.ctrlKey || event.metaKey)) return;

    const key = (event.key || '').toLowerCase();
    if (key === 'k') {
        event.preventDefault();
        searchInput.focus();
    } else if (key === 'l') {
        event.preventDefault();
        searchInput.focus();
        setTimeout(() => searchInput.select(), 0);
    }
});

document.addEventListener('click', (event) => {
    if (!searchContainer.contains(event.target) && !engineModal.contains(event.target)) {
        hideHistoryDropdown();
    }
    if (!topMenu.contains(event.target)) setMenuOpen(false);
});

menuBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    setMenuOpen(!menu.classList.contains('show'));
    hideHistoryDropdown();
});

menu.querySelectorAll('.menu-item').forEach((item) => {
    item.addEventListener('click', () => setMenuOpen(false));
});

engineBtn.addEventListener('click', openEngineModal);

engineList.addEventListener('click', (event) => {
    const option = event.target.closest('.engine-option');
    if (!option) return;

    setEngine(option.getAttribute('data-id'));
    renderEngineButton();
    closeEngineModal('picked');
});

engineList.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    const options = Array.from(engineList.querySelectorAll('.engine-option'));
    const index = options.indexOf(document.activeElement);
    if (index < 0) return;

    event.preventDefault();
    const step = event.key === 'ArrowDown' ? 1 : -1;
    options[(index + step + options.length) % options.length].focus();
});

engineModal.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeEngineModal();
});

engineModal.addEventListener('close', () => {
    if (engineModal.returnValue === 'picked') searchInput.focus();
    else engineBtn.focus();
});

engineModal.addEventListener('click', (event) => {
    if (event.target === engineModal) closeEngineModal();
});

window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === HISTORY_STORAGE_KEY) historyCache = null;
    if (event.key === null || event.key === ENGINE_STORAGE_KEY) renderEngineButton();
});

window.addEventListener('pageshow', renderEngineButton);
renderEngineButton();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./browser-sw.js')
            .catch((error) => console.error('Service worker registration failed:', error));
    });
}