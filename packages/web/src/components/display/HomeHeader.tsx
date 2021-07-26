import React, { FC } from "react";

const HomeHeader: FC = () => {
    return (
        <div className="w-full h-64 bg-gray-100 dark:bg-gray-900">
            <h1 className="relative top-32 text-4xl text-gray-600 dark:text-gray-300 w-full text-center">
                The only bot you{" "}
                <span className="text-red-700 dark:text-red-400">dont</span>{" "}
                need
            </h1>
        </div>
    );
};

export default HomeHeader;
