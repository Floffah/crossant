import React from "react";
import { useSwitchTheme } from "src/lib/hooks/theme";
import { useHotkeys } from "react-hotkeys-hook";
import { ThemeName } from "src/lib/util/localStorage";
import NextNProgress from "nextjs-progressbar";

export default function RenderSaver() {
    const { switchTheme, theme } = useSwitchTheme();

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

    return (
        <>
            <NextNProgress
                color={theme === "dark" ? "#0891B2" : "#22D3EE"}
                startPosition={0.3}
                stopDelayMs={200}
                height={2}
                showOnShallow={true}
                options={{
                    showSpinner: false,
                }}
            />
        </>
    );
}
