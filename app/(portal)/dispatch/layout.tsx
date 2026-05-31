// app/portal/crm/contacts/layout.tsx
import CompanyProvider from '@/context/selectCompany';
import ContactProvider from '@/context/selectContact'; // adjust the path as necessary
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
      <ContactProvider>
        <CompanyProvider>
          <div>
            {children}
          </div>
        </CompanyProvider>
      </ContactProvider>
      </IsAdminCustomerCareOrSuperAdminGuard>
    </EarlyAccessGuard>
  );
}

export default Layout;
