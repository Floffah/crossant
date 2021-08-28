import React, { FC } from "react";
import { NextSeo } from "next-seo";
import HomeHeader from "src/components/display/HomeHeader";
import NavBar from "src/components/navigation/NavBar/NavBar";

const IndexPage: FC = () => {
    return (
        <>
            <NextSeo title="Home" />
            <NavBar />
            <HomeHeader />
        </>
    );
};

export default IndexPage;
