import { FC } from "react";

const NavBar: FC = () => {
    return (
        <div className="w-full bg-gray-400 dark:bg-gray-900 h-12 shadow-lg">
            <h1 className="text-black dark:text-gray-300 text-2xl top-2 left-2 relative w-fit select-none">
                Crossant
            </h1>
        </div>
    );
};

export default NavBar;
