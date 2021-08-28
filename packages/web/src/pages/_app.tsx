import { withTRPC } from "@trpc/next";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import React from "react";
import ErrorBoundary from "src/components/util/ErrorBoundary";
import { AppRouter } from "src/lib/api/router";
import RenderSaver from "../components/util/RenderSaver";

import "src/styles/common.css";

function App(p: AppProps) {
    return (
        <>
            <DefaultSeo titleTemplate="%s - Crossant" defaultTitle="Crossant" />
            <RenderSaver />
            <div className="bg-white dark:bg-gray-800 w-full h-full absolute md:transition-all">
                <p.Component {...p.pageProps} />
            </div>
        </>
    );
}

const TRPCApp = withTRPC<AppRouter>({
    config: (_c) => {
        const url = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}/api/trpc`
            : "http://localhost:3000/api/trpc";

        // let pswd: string | undefined = undefined;
        //
        // if (
        //     typeof localStorage !== "undefined" &&
        //     localStorage.getItem(APIAccessName)
        // )
        //     pswd = localStorage.getItem(APIAccessName) as string;

        return {
            url,
            // headers: pswd
            //     ? {
            //         AUTHORIZATION: pswd,
            //     }
            //     : {},
        };
    },
    ssr: true,
})(App);

export default function BoundariedApp(p: AppProps) {
    return (
        <ErrorBoundary>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <TRPCApp {...p} />
        </ErrorBoundary>
    );
}
