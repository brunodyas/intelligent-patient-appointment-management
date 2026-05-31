"use client"
import { getRedirectsById } from "@/services/redirects";
import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import { routes } from "@/constants/routes";
import Route from "@/components/atomics/Route";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@relume_io/relume-ui";
import { formatPhoneNumber } from "@/utils/formatPhoneForCall";


const RedirectDetailPage = () => {
    const { id } = useParams<{ id: string }>() ?? {id: ''};
    const [redirectData, setRedirectData] = useState<any>();

    const fetchActivity = async () => {
        try {
            const response = await getRedirectsById(id);
            setRedirectData(response);
        } catch (e: any) {
            console.error("Error fetching call list:", e);
        }
    };

    useEffect(() => {
        fetchActivity()
    }, [id]);

    return (
        <>
            <div className="bg-primary-main pt-6 pb-12 px-8 rounded-xl">
                <div className="flex items-center gap-2 mb-3 mt-4 smx:flex ">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <Route
                                    route="/settings"
                                    linkClassName="text-brand-lightest text-sm font-normal"
                                >
                                    Redirects
                                </Route>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-neutral-white" />
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    href="#"
                                    className="text-neutral-white font-semibold text-sm cursor-auto"
                                >
                                    {redirectData?.twilio_number && formatPhoneNumber(redirectData?.twilio_number, true)}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex items-start smx:items-center gap-4 mt-4">
                    <div className="flex-col flex smx:flex-row smx:items-center justify-between w-full gap-3">
                        <div>
                            <h3 className="text-2xl text-neutral-white font-semibold mb-1 smx:mb-1.5">
                                {redirectData?.twilio_number && formatPhoneNumber(redirectData?.twilio_number, true)}
                            </h3>
                        </div>

                    </div>
                </div>
            </div>
            <div className="border border-border-light mt-6 rounded-xl pt-6 pb-6 md:pb-10 px-4 sm:px-5 smx:px-6 md:px-7 lg:px-8">
                <div>
                    <h2 className="text-text-black font-medium text-xl md:text-2xl mb-3 mt-0 md:mt-4">
                        Redirect Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
                        <div>
                            <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                                <h3 className="text-neutral-200 text-sm">Twilio Number</h3>
                                <p className="text-text-black text-sm">
                                    {redirectData?.twilio_number ? formatPhoneNumber(redirectData?.twilio_number, true) : "-"}
                                </p>
                            </div>
                            <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                                <h3 className="text-neutral-200 text-sm">Number Type</h3>
                                <p className="text-text-black text-sm">
                                    {redirectData?.number_type ? redirectData?.number_type : "-"}
                                </p>
                            </div>
                            <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                                <h3 className="text-neutral-200 text-sm">Redirect Number</h3>
                                <p className="text-text-black text-sm">
                                    {redirectData?.redirect_number ? formatPhoneNumber(redirectData?.redirect_number, true) : "-"}
                                </p>
                            </div>
                        </div>
                        <div>
                            <div className="border-0 md:border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                                <h3 className="text-neutral-200 text-sm">Franchise</h3>
                                <p className="text-text-black text-sm break-all">
                                    {redirectData?.franchise ? redirectData?.franchise?.franchise_name : "-"}
                                </p>
                            </div>
                            <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-5">
                                <h3 className="text-neutral-200 text-sm text-nowrap">Notification Emails</h3>
                                <p className="text-text-black text-sm text-wrap text-right">
                                    {redirectData?.notification_emails.length ? redirectData?.notification_emails.join(", ") : "-"}
                                </p>
                            </div>
                        </div >
                    </div >
                </div >
            </div >
        </>

    )
}

export default RedirectDetailPage;