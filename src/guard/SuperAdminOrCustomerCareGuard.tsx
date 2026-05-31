'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUserRoles from '@/hooks/useUserRoles';

const SuperAdminOrCustomerCareGuard = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    const router = useRouter();
    const { isSuperAdmin, isCustomerCare, isCustomerCareManager } = useUserRoles();

    useEffect(() => {
        if ((!isSuperAdmin && !isCustomerCare && !isCustomerCareManager)) {
            router.push('/');
        }
    }, [isSuperAdmin, isCustomerCare, isCustomerCareManager]);

    if ((!isSuperAdmin && !isCustomerCare && !isCustomerCareManager)) {
        return null;
    }

    return <>{children}</>;
};

export default SuperAdminOrCustomerCareGuard;