const THEME_STORAGE_KEY = 'theme';
const THEME_TRANSITION_MS = 300;
const darkSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

function getStoredTheme() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY) || 'system';
    } catch (error) {
        return 'system';
    }
}

function resolveTheme(preference) {
    if (preference === 'dark' || preference === 'light') return preference;
    return darkSchemeQuery.matches ? 'dark' : 'light';
}

function applyRootTheme() {
    const isDark = resolveTheme(getStoredTheme()) === 'dark';
    const root = document.documentElement;
    root.classList.toggle('dark-mode', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
}

function applyThemeWithTransition() {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    applyRootTheme();
    setTimeout(() => root.classList.remove('theme-transition'), THEME_TRANSITION_MS);
}

function setTheme(theme) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
        console.error('localStorage write failed:', error);
    }
    applyThemeWithTransition();
}

function replayPageAnimation() {
    const body = document.body;
    if (!body) return;
    body.style.animation = 'none';
    void body.offsetWidth;
    body.style.animation = '';
}

applyRootTheme();

window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === THEME_STORAGE_KEY) applyRootTheme();
});

darkSchemeQuery.addEventListener('change', () => {
    if (getStoredTheme() === 'system') applyThemeWithTransition();
});

window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    applyRootTheme();
    replayPageAnimation();
});
