const ENGINES = [
    { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={q}', logo: 'logos/duckduckgo.svg' },
    { id: 'startpage', name: 'Startpage', url: 'https://www.startpage.com/do/search?q={q}', logo: 'logos/startpage.svg' },
    { id: 'brave', name: 'Brave', url: 'https://search.brave.com/search?q={q}', logo: 'logos/brave.svg' },
    { id: 'ecosia', name: 'Ecosia', url: 'https://www.ecosia.org/search?q={q}', logo: 'logos/ecosia.svg' },
    { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q={q}', logo: 'logos/bing.svg' },
    { id: 'yahoo', name: 'Yahoo', url: 'https://search.yahoo.com/search?p={q}', logo: 'logos/yahoo.svg' },
    { id: 'google', name: 'Google', url: 'https://www.google.com/search?q={q}', logo: 'logos/google.svg' }
];

const DEFAULT_ENGINE_ID = 'duckduckgo';
const ENGINE_STORAGE_KEY = 'searchEngine';

function getEngineById(id) {
    return ENGINES.find((engine) => engine.id === id)
        || ENGINES.find((engine) => engine.id === DEFAULT_ENGINE_ID);
}

function getEngine() {
    let id = null;
    try {
        id = localStorage.getItem(ENGINE_STORAGE_KEY);
    } catch (error) {
        console.error('localStorage read failed:', error);
    }
    return getEngineById(id);
}

function setEngine(id) {
    if (!ENGINES.some((engine) => engine.id === id)) return;
    try {
        localStorage.setItem(ENGINE_STORAGE_KEY, id);
    } catch (error) {
        console.error('localStorage write failed:', error);
    }
}

function buildSearchUrl(query, engine = getEngine()) {
    return engine.url.replace('{q}', encodeURIComponent(query));
}
