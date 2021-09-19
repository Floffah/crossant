import React, { forwardRef } from "react";

const HomeHeader = forwardRef<HTMLDivElement>((_p, ref) => (
    <div
        className="w-full h-96 bg-gray-100 dark:bg-gray-900"
        style={{
            backgroundSize: "cover",
            backgroundImage: 'url("/assets/banner.png")',
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
        }}
        ref={ref}
    >
        <h1 className="relative top-44 text-4xl text-gray-300 w-full text-center">
            The only bot you <span className="text-red-400">dont</span> need
        </h1>
    </div>
));
HomeHeader.displayName = "HomeHeader";

export default HomeHeader;
