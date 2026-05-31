// app/portal/crm/contacts/layout.tsx
import CompanyProvider from '@/context/selectCompany'; // adjust the path as necessary
import EarlyAccessGuard from '@/guard/EarlyAccessGuard';
import IsAdminCustomerCareOrSuperAdminGuard from '@/guard/isAdminCustomerCareOrSuperAdminGuard';

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <EarlyAccessGuard>
      <IsAdminCustomerCareOrSuperAdminGuard>
      <CompanyProvider>
        <div>
          {children}
        </div>
      </CompanyProvider>
      </IsAdminCustomerCareOrSuperAdminGuard>
    </EarlyAccessGuard>
  );
}

export default Layout;
