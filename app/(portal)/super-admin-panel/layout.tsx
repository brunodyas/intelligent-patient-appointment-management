'use client';
import SuperAdminOrCustomerCareGuard from "@/guard/SuperAdminOrCustomerCareGuard"

const Layout = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <>
            <SuperAdminOrCustomerCareGuard>
                {children}
            </SuperAdminOrCustomerCareGuard>
        </>
    );
}

export default Layout;