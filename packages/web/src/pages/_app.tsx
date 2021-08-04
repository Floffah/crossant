import React from "react";
import { AppComponent } from "next/dist/next-server/lib/router/router";
import { DefaultSeo } from "next-seo";

import "tailwindcss/tailwind.css";
import RenderSaver from "../components/util/RenderSaver";

const App: AppComponent = (p) => {
    return (
        <>
            <DefaultSeo titleTemplate="%s - Crossant" defaultTitle="Crossant" />
            <RenderSaver />
            <div className="bg-white dark:bg-gray-800 w-full h-full absolute md:transition-all">
                <p.Component {...p.pageProps} />
            </div>
        </>
    );
};

export default App;
