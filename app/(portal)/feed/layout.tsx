'use client';

import FeedGuard from "@/guard/FeedGuard";

const Layout = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <>
            <FeedGuard>
                {children}
            </FeedGuard>
        </>
    );
}

export default Layout;