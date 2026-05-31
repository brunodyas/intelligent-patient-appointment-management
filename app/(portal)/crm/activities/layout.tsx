'use client';

import EarlyAccessGuard from "@/guard/EarlyAccessGuard";
import IsAdminCustomerCareOrSuperAdminGuard from "@/guard/isAdminCustomerCareOrSuperAdminGuard";

const Layout = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <>
            <EarlyAccessGuard>
                <IsAdminCustomerCareOrSuperAdminGuard>
                {children}
                </IsAdminCustomerCareOrSuperAdminGuard>
            </EarlyAccessGuard>
        </>
    );
}

export default Layout;