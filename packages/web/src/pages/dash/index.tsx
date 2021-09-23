import React from "react";
import NavBar from "src/components/navigation/NavBar/NavBar";
import { trpc } from "src/lib/hooks/trpc";

export default function DashPage() {
    const test = trpc.useQuery(["user.guilds"]);

    console.log(test.isLoading, test.error);

    return (
        <>
            <NavBar />
        </>
    );
}
