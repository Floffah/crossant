import { mdiLoading, mdiMoonWaxingCrescent, mdiWeatherSunny } from "@mdi/js";
import Icon from "@mdi/react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { FC, useState } from "react";
import { useSwitchTheme } from "src/lib/hooks/theme";

const NavBar: FC<{ showBackground?: boolean }> = (p) => {
    const router = useRouter();
    const { switchTheme, theme } = useSwitchTheme();
    const { data: session } = useSession();
    const [sendingToLogin, setSendingToLogin] = useState(false);
    let showBackground = p.showBackground;

    if (typeof showBackground !== "boolean") showBackground = true;

    return (
        <div
            className={
                "w-full h-12 shadow-lg fixed top-0 left-0 select-none z-50 " +
                (showBackground
                    ? "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                    : "backdrop-blur-sm text-slate-300")
            }
        >
            <h1
                className="text-2xl top-2 left-3 relative w-fit inline-block cursor-pointer"
                onClick={() => router.push("/")}
            >
                Crossant
            </h1>
            <div className="inline-block float-right mt-2 mr-3">
                <p
                    className="inline-block text-xl mt-0.5 mr-3 cursor-pointer"
                    onClick={() => {
                        if (session) router.push("/dash");
                        else {
                            signIn("discord");
                            setSendingToLogin(true);
                        }
                    }}
                >
                    {sendingToLogin && (
                        <Icon
                            path={mdiLoading}
                            className="animate-spin inline-block mr-1 align-top mt-0.5"
                            size={1}
                        />
                    )}
                    {session ? "Dashboard" : "Login"}
                </p>
                <Icon
                    className="inline-block align-top mt-1 cursor-pointer"
                    path={
                        theme === "dark"
                            ? mdiWeatherSunny
                            : mdiMoonWaxingCrescent
                    }
                    size={1}
                    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    onClick={() => {
                        switchTheme();
                    }}
                />
            </div>
        </div>
    );
};

export default NavBar;
