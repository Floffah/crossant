import { ThemeName } from "../util/localStorage";
import { useAtom } from "jotai";
import { themeAtom } from "../state/theme";

export function useSwitchTheme() {
    const [theme, setTheme] = useAtom(themeAtom);

    return {
        switchTheme: (force?: "light" | "dark") => {
            if (force) {
                if (force === "dark")
                    document.documentElement.classList.add("dark");
                else document.documentElement.classList.remove("dark");
                localStorage.setItem(ThemeName, force);
                setTheme(force);
            } else {
                const theme = localStorage.getItem(ThemeName);
                if (theme === "dark") {
                    document.documentElement.classList.remove("dark");
                    localStorage.setItem(ThemeName, "light");
                    setTheme("light");
                } else {
                    document.documentElement.classList.add("dark");
                    localStorage.setItem(ThemeName, "dark");
                    setTheme("dark");
                }
            }
        },
        theme,
    };
}
