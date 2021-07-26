import React, { FC } from "react";
import NavBar from "../components/navigation/NavBar/NavBar";
import { NextSeo } from "next-seo";
import HomeHeader from "../components/display/HomeHeader";

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
