import { signin, useSession } from "next-auth/client";
import React, { FC, useState } from "react";
import Icon from "@mdi/react";
import { mdiLoading, mdiMoonWaxingCrescent, mdiWeatherSunny } from "@mdi/js";
import { useRouter } from "next/router";
import { useSwitchTheme } from "src/lib/hooks/theme";

const NavBar: FC<{ showBackground?: boolean }> = (p) => {
    const router = useRouter();
    const { switchTheme, theme } = useSwitchTheme();
    const [session] = useSession();
    const [sendingToLogin, setSendingToLogin] = useState(false);
    let showBackground = p.showBackground;

    if (typeof showBackground !== "boolean") showBackground = true;

    return (
        <div
            className={
                "w-full h-12 shadow-lg fixed top-0 left-0 select-none text-gray-600 dark:text-gray-300 z-50 " +
                (showBackground
                    ? "bg-gray-100 dark:bg-gray-900"
                    : "backdrop-blur-sm")
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
                            signin("discord");
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
