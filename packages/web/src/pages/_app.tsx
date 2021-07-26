import React from "react";
import { AppComponent } from "next/dist/next-server/lib/router/router";
import { DefaultSeo } from "next-seo";

import "tailwindcss/tailwind.css";
import { DarkThemeName } from "../lib/util/localStorage";

const App: AppComponent = (p) => {
    if (typeof localStorage !== "undefined") {
        let isDark = localStorage.getItem(DarkThemeName);

        if (isDark === null) {
            localStorage.setItem("dark", "true");
            isDark = "true";
        }

        if (
            document.documentElement.className.includes("dark") &&
            isDark !== "true"
        )
            document.documentElement.classList.remove("dark");
    }

    return (
        <>
            <DefaultSeo titleTemplate="%s - Crossant" defaultTitle="Crossant" />
            <div className="bg-white dark:bg-gray-800 w-full h-full absolute md:transition-all">
                <p.Component {...p.pageProps} />
            </div>
        </>
    );
};

export default App;
