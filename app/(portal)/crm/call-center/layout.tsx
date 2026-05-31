"use client";

import IsAdminCustomerCareOrSuperAdminGuard from "@/guard/isAdminCustomerCareOrSuperAdminGuard";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <IsAdminCustomerCareOrSuperAdminGuard>{children}</IsAdminCustomerCareOrSuperAdminGuard>;
};

export default Layout;
