'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUserRoles from '@/hooks/useUserRoles';

const FeedGuard = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    const router = useRouter();
    const { isSuperAdmin, isTech, isAdmin, isCustomerCare, isCustomerCareManager } = useUserRoles();
    const hasValidRole = isSuperAdmin || isTech || isAdmin || isCustomerCare || isCustomerCareManager;

    useEffect(() => {
        if (!hasValidRole) {
            router.push('/');
        }
    }, [hasValidRole]);

    if (!hasValidRole) {
        return null;
    }

    return <>{children}</>;
};

export default FeedGuard;