import { withTRPC } from "@trpc/next";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import React from "react";
import ErrorBoundary from "src/components/util/ErrorBoundary";
import { AppRouter } from "src/lib/api/router";
import { SessionProvider } from "next-auth/react";

import "src/styles/styles.css";
import RenderSaver from "../components/util/RenderSaver";

function App(p: AppProps) {
    return (
        <>
            <DefaultSeo titleTemplate="%s - Crossant" defaultTitle="Crossant" />
            <RenderSaver />
            <div className="bg-white dark:bg-slate-800 w-full h-full absolute md:transition-all">
                <p.Component {...p.pageProps} />
            </div>
        </>
    );
}

const TRPCApp = withTRPC<AppRouter>({
    config: (_c) => {
        const url =
            process.env.NODE_ENV === "production"
                ? `https://crossant.floffah.dev/api/trpc`
                : "http://localhost:3000/api/trpc";

        return {
            url,
        };
    },
    ssr: true,
})(App);

export default function BoundariedApp(p: AppProps) {
    return (
        <ErrorBoundary>
            <SessionProvider>
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                <TRPCApp {...p} />
            </SessionProvider>
        </ErrorBoundary>
    );
}
