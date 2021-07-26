import { AppComponent } from "next/dist/next-server/lib/router/router";
import { DefaultSeo } from "next-seo";

import "tailwindcss/tailwind.css";

const App: AppComponent = (p) => {
    return (
        <>
            <DefaultSeo titleTemplate="%s - Crossant" defaultTitle="Crossant" />
            <div className="bg-white dark:bg-gray-800 w-full h-full absolute">
                <p.Component {...p.pageProps} />
            </div>
        </>
    );
};

export default App;
