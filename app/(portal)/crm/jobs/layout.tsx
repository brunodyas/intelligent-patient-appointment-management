// app/portal/crm/contacts/layout.tsx
import CompanyProvider from '@/context/selectCompany';
import ContactProvider from '@/context/selectContact';
import EarlyAccessGuard from '@/guard/EarlyAccessGuard'; // adjust the path as necessary

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <EarlyAccessGuard>
      <ContactProvider>
        <CompanyProvider>
          <div>
            {children}
          </div>
        </CompanyProvider>
      </ContactProvider>
    </EarlyAccessGuard>
  );
}

export default Layout;
