'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUserRoles from '@/hooks/useUserRoles';

const IsAdminCustomerCareOrSuperAdminGuard = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    const router = useRouter();

    const { isSuperAdmin, isAdmin, isCustomerCare, isCustomerCareManager } = useUserRoles();
    const hasValidRole = isSuperAdmin || isAdmin || isCustomerCare || isCustomerCareManager;

    useEffect(() => {
        if (!hasValidRole) {
            router.push('/feed');
        }
    }, [hasValidRole]);

    if (!hasValidRole) {
        return null;
    }

    return <>{children}</>;
};

export default IsAdminCustomerCareOrSuperAdminGuard;