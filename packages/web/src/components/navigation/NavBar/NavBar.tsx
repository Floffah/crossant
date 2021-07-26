import React, { FC } from "react";
import Icon from "@mdi/react";
import { mdiMoonWaxingCrescent, mdiWeatherSunny } from "@mdi/js";
import { useToggle } from "react-use";
import { DarkThemeName } from "../../../lib/util/localStorage";

const NavBar: FC = () => {
    const [isDark, toggleIsDark] = useToggle(
        typeof localStorage !== "undefined" &&
            localStorage.getItem(DarkThemeName) === "true",
    );

    if (typeof localStorage !== "undefined") {
        console.log(
            isDark,
            localStorage.getItem(DarkThemeName),
            isDark && localStorage.getItem(DarkThemeName) !== "true",
        );
        if (isDark && localStorage.getItem(DarkThemeName) !== "true")
            toggleIsDark();
    }

    return (
        <div className="w-full bg-gray-200 dark:bg-gray-900 h-12 shadow-lg fixed top-0 left-0 select-none text-gray-600 dark:text-gray-300">
            <h1 className="text-2xl top-2 left-3 relative w-fit inline">
                Crossant
            </h1>
            <div
                className="inline float-right top-3 right-3 relative 2xl:cursor-pointer"
                onClick={() => {
                    if (document.documentElement.className.includes("dark")) {
                        document.documentElement.classList.remove("dark");
                        localStorage.setItem(DarkThemeName, "false");
                    } else {
                        document.documentElement.classList.add("dark");
                        localStorage.setItem(DarkThemeName, "true");
                    }
                    toggleIsDark();
                }}
            >
                <Icon
                    path={isDark ? mdiWeatherSunny : mdiMoonWaxingCrescent}
                    size={1}
                />
            </div>
        </div>
    );
};

export default NavBar;
