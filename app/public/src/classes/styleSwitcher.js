import { Themes } from "../enums/styles.js";

const themes = [
    Themes.Light,
    Themes.Night,
    Themes.Contrast,
];

export const setTheme = (themeId) => {
    const theme = themes[themeId];
    if (!theme) {
        console.error(`Theme '${theme}' not found.`);
        return;
    }

    Object.keys(theme).forEach(key => {
        document.documentElement.style.setProperty(`--${key}`, theme[key]);
    });
};