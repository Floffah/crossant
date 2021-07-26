import React, { FC } from "react";
import landscape from "/public/assets/landscape.svg";
import NavBar from "../components/navigation/NavBar/NavBar";

// https://www.tailwind-kit.com/templates/errors404
const E404Page: FC = () => {
    return (
        <>
            <NavBar />
            <div className="bg-indigo-900 relative overflow-hidden h-screen">
                <img
                    src={landscape.src}
                    className="absolute h-full w-full object-cover"
                    alt="Landscape"
                />
                <div className="inset-0 bg-black opacity-25 absolute" />
                <div className="container mx-auto px-6 md:px-12 relative z-10 flex items-center py-32 xl:py-40">
                    <div className="w-full font-mono flex flex-col items-center relative z-10 select-none">
                        {/*<h1 className="font-extrabold text-5xl text-center text-white leading-tight mt-4">*/}
                        {/*    You&#x27;re alone here*/}
                        {/*</h1>*/}
                        <p className="font-extrabold text-8xl my-16 text-white opacity-5">
                            404
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default E404Page;
