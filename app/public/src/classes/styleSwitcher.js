import { Themes } from "../enums/styles.js";

const themes = [
    Themes.Light,
    Themes.Night,
    Themes.Contrast,
    Themes.Random
];

export const setTheme = (themeId) => {
    let theme = themes[themeId];
    if (themeId == 3) {
        theme = theme();
    }
    if (!theme) {
        console.error(`Theme '${theme}' not found.`);
        return;
    }

    Object.keys(theme).forEach(key => {
        document.documentElement.style.setProperty(`--${key}`, theme[key]);
    });
};