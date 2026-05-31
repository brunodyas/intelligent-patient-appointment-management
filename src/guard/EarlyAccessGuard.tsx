'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth';

const EarlyAccessGuard = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    const { user } = useAuth();
    const router = useRouter();
    const hasEarlyAccess = user?.early_access;

    useEffect(() => {
        if (!hasEarlyAccess) {
            router.push('/');
        }
    }, [hasEarlyAccess]);

    if (!hasEarlyAccess) {
        return null;
    }

    return <>{children}</>;
};

export default EarlyAccessGuard;