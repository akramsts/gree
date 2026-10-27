const HISTORY_STORAGE_KEY = 'searchHistory';
const MAX_HISTORY_ENTRIES = 500;

const HTML_ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
};

const FILE_EXTENSIONS = new Set([
    'js', 'jsx', 'ts', 'tsx', 'json', 'css', 'scss', 'html', 'htm', 'php', 'txt', 'md',
    'py', 'sh', 'rs', 'rb', 'java', 'cpp', 'cs', 'yml', 'yaml', 'xml', 'csv', 'log', 'sql',
    'bat', 'ini', 'cfg', 'conf', 'lock', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'mp3', 'mp4', 'wav', 'avi', 'mkv',
    'mov', 'zip', 'rar', 'gz', 'tar', 'iso', 'dmg', 'exe', 'apk', 'jar'
]);

const storage = {
    get(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('localStorage read failed:', error);
            return null;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error('localStorage write failed:', error);
            return false;
        }
    }
};

function escapeHTML(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

function getSearchHistory() {
    const raw = storage.get(HISTORY_STORAGE_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter((item) => item && typeof item.query === 'string' && item.query.trim() !== '')
            .map((item, index) => ({
                id: item.id ?? `legacy-${index}`,
                query: item.query,
                time: item.time,
                engine: item.engine
            }));
    } catch (error) {
        return [];
    }
}

function writeSearchHistory(history) {
    storage.set(HISTORY_STORAGE_KEY, JSON.stringify(history));
    return history;
}

function recordSearch(query) {
    const text = (query || '').trim();
    if (!text) return null;

    const key = text.toLowerCase();
    const now = Date.now();
    const history = getSearchHistory().filter((item) => item.query.toLowerCase() !== key);

    history.unshift({ id: now, query: text, time: now, engine: getEngine().id });
    return writeSearchHistory(history.slice(0, MAX_HISTORY_ENTRIES));
}

function removeHistoryEntry(id) {
    const history = getSearchHistory().filter((item) => String(item.id) !== String(id));
    return writeSearchHistory(history);
}

function clearSearchHistory() {
    return writeSearchHistory([]);
}

function isLocalAddress(input) {
    return /^localhost(:\d{1,5})?(\/.*)?$/i.test(input)
        || /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?(\/.*)?$/.test(input);
}

function isLikelyUrl(text) {
    const input = (text || '').trim();
    if (!input || /\s/.test(input)) return false;

    try {
        if (/^https?:\/\//i.test(input)) {
            new URL(input);
            return true;
        }

        if (isLocalAddress(input)) {
            new URL(`http://${input}`);
            return true;
        }

        const match = input.match(/^(?:[a-zA-Z0-9-]+\.)+([a-zA-Z]{2,})(:\d{1,5})?(\/.*)?$/);
        if (!match) return false;

        const isBareName = !match[2] && !match[3] && !/^www\./i.test(input);
        if (isBareName && FILE_EXTENSIONS.has(match[1].toLowerCase())) return false;

        new URL(`https://${input}`);
        return true;
    } catch (error) {
        return false;
    }
}

function buildUrl(text, engine = getEngine()) {
    const input = (text || '').trim();
    if (!input) return null;

    if (!isLikelyUrl(input)) return buildSearchUrl(input, engine);
    if (/^https?:\/\//i.test(input)) return input;
    return (isLocalAddress(input) ? 'http://' : 'https://') + input;
}
