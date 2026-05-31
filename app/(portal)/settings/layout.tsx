'use client';
import { Title } from "@/components/atomics";
import { useAuth } from "@/context/auth";
import useUserRoles from "@/hooks/useUserRoles";
import * as Tabs from "@radix-ui/react-tabs";
import { useRouter, usePathname } from "next/navigation";

const Layout = ({ personal, redirects, blockedNumbers }: Readonly<{
    personal: React.ReactNode;
    redirects: React.ReactNode;
    blockedNumbers: React.ReactNode;
    children: React.ReactNode;
}>) => {
    const router = useRouter();
    const { isSuperAdmin, isCustomerCare, isCustomerCareManager } = useUserRoles();

    const pathname = usePathname();
    const isSuperAdminOrManager = isSuperAdmin || isCustomerCareManager
    if (!isSuperAdmin && !isCustomerCare && !isCustomerCareManager) {
        if (pathname?.startsWith('/settings/')) {
            return router.push('/settings');
        }
        return <>{personal}</>;
    }

    const handleTabChanges = () => router.push('/settings');

    return (
        <>
            <div className="flex justify-between items-start pt-5 px-1">
                <Title
                    size="2xl"
                    variant={"undefined"}
                    className="gap-0 !text-2xl text-text-black"
                >
                    Settings
                </Title>

            </div>
            <Tabs.Root
                className="flex flex-col w-full h-[calc(100%-170px)] min-[480px]:h-[calc(100%-127px)] mt-7"
                defaultValue={"tab1"}
                onValueChange={handleTabChanges}
            >
                <Tabs.List className="shrink-0 flex flex-col" aria-label="Manage your account">
                    <div className="flex items-center">
                        <Tabs.Trigger
                            className="bg-white max-[600px]:flex-1 px-5 h-[45px] flex items-center justify-center text-sm sm:text-base select-none hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:focus:relative outline-none rounded-l-md data-[state=active]:bg-active-surface border"
                            value="tab1"
                        >
                            Personalized Settings
                        </Tabs.Trigger>
                        {isSuperAdminOrManager && (
                            <Tabs.Trigger
                                className="bg-white max-[600px]:flex-1 px-5 h-[45px] flex items-center justify-center text-sm sm:text-base select-none hover:text-violet11 data-[state=active]:focus:relative outline-none  data-[state=active]:bg-active-surface surface border"
                                value="tab2"
                            >
                                Call Center Numbers
                            </Tabs.Trigger>
                        )}
                        {isSuperAdminOrManager && <Tabs.Trigger
                            className="bg-white max-[600px]:flex-1 px-5 h-[45px] flex items-center justify-center text-sm sm:text-base select-none hover:text-violet11 data-[state=active]:focus:relative outline-none rounded-r-md data-[state=active]:bg-active-surface surface border"
                            value="tab3"
                        >
                            Blocked Numbers
                        </Tabs.Trigger>}
                    </div>
                    <div>
                        <Tabs.Content
                            className="h-[calc(100%-45px)]"
                            value="tab1"
                        >
                            {personal}
                        </Tabs.Content>
                        <Tabs.Content
                            className="py-8 min-[480px]:pb-0 h-[calc(100%-45px)]"
                            value="tab2"
                        >
                            {redirects}
                        </Tabs.Content>
                        <Tabs.Content
                            className="py-8 min-[480px]:pb-0 h-[calc(100%-45px)]"
                            value="tab3"
                        >
                            {blockedNumbers}
                        </Tabs.Content>
                    </div>
                </Tabs.List>
            </Tabs.Root>
        </>
    );
}

export default Layout;