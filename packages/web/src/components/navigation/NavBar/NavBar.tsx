import React, { FC } from "react";
import Icon from "@mdi/react";
import { mdiMoonWaxingCrescent, mdiWeatherSunny } from "@mdi/js";
import { useRouter } from "next/router";
import { useSwitchTheme } from "src/lib/hooks/theme";

const NavBar: FC = () => {
    const router = useRouter();
    const { switchTheme, theme } = useSwitchTheme();

    return (
        <div className="w-full bg-gray-100 dark:bg-gray-900 h-12 shadow-lg fixed top-0 left-0 select-none text-gray-600 dark:text-gray-300 z-50 cursor-pointer">
            <h1
                className="text-2xl top-2 left-3 relative w-fit inline"
                onClick={() => router.push("/")}
            >
                Crossant
            </h1>
            <div
                className="inline float-right top-3 right-3 relative 2xl:cursor-pointer"
                onClick={() => {
                    switchTheme();
                }}
            >
                <Icon
                    path={
                        theme === "dark"
                            ? mdiWeatherSunny
                            : mdiMoonWaxingCrescent
                    }
                    size={1}
                />
            </div>
        </div>
    );
};

export default NavBar;
