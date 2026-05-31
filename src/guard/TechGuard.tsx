'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUserRoles from '@/hooks/useUserRoles';

const TechGuard = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    const router = useRouter();

    const { isTech } = useUserRoles();

    useEffect(() => {
        if (!isTech) {
            router.push('/');
        }
    }, [isTech]);

    if (!isTech) {
        return null;
    }

    return <>{children}</>;
};

export default TechGuard;