import EarlyAccessGuard from '@/guard/EarlyAccessGuard';
import TechGuard from '@/guard/TechGuard';

const Layout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <EarlyAccessGuard>
            <TechGuard>
                <div>
                    {children}
                </div>
            </TechGuard>
        </EarlyAccessGuard>
    );
}

export default Layout;