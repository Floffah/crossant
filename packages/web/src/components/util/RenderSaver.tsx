import React from "react";
import { useSwitchTheme } from "../../lib/hooks/theme";
import { useHotkeys } from "react-hotkeys-hook";
import { ThemeName } from "../../lib/util/localStorage";

export default function RenderSaver() {
    const { switchTheme } = useSwitchTheme();

    if (typeof localStorage !== "undefined") {
        let theme = localStorage.getItem(ThemeName);

        if (theme === null) {
            localStorage.setItem(ThemeName, "dark");
            theme = "dark";
        }

        if (
            document.documentElement.className.includes("dark") &&
            theme !== "dark"
        )
            document.documentElement.classList.remove("dark");
    }

    useHotkeys("CTRL+SHIFT+L", () => switchTheme());

    return <></>;
}
