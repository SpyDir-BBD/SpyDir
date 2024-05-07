export const setTheme = (theme) => {
    if (!theme) {
        console.error(`Theme '${theme}' not found.`);
        return;
    }

    Object.keys(theme).forEach(key => {
        document.documentElement.style.setProperty(`--${key}`, theme[key]);
    });
};