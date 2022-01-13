import React, { FC, useRef } from "react";
import { NextSeo } from "next-seo";
import { useIntersection } from "react-use";
import HomeHeader from "src/components/display/HomeHeader";
import NavBar from "src/components/navigation/NavBar/NavBar";
import { trpc } from "src/lib/hooks/trpc";

const IndexPage: FC = () => {
    const headerref = useRef<HTMLDivElement>(null);
    const intersect = useIntersection(headerref, {});

    trpc.useQuery(["user.guilds"]);

    return (
        <>
            <NextSeo title="Home" />
            <NavBar showBackground={!intersect?.isIntersecting} />
            <HomeHeader ref={headerref} />
        </>
    );
};

export default IndexPage;
