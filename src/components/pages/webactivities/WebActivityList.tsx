"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@relume_io/relume-ui";
import { getActivity } from '@/services/webactivities';
import { routes } from "@/constants/routes";
import Route from "@/components/atomics/Route";
import { formatSmallDate } from '@/utils/formatDate';
import convertToLocalTimeToShift from '@/utils/localTImeConverter';
import moment from 'moment';
import { formatPhoneNumber } from '@/utils/formatPhoneForCall';

const WebActivityList = () => {
    const { webactivitiesId } = useParams<{ webactivitiesId: string }>() ?? {webactivitiesId: ''};
    const [activitydata, setActivityData] = useState<any>();

    const fetchActivity = async () => {
        try {
            const response = await getActivity(webactivitiesId);
            setActivityData(response);
        } catch (e: any) {
            console.error("Error fetching call list:", e);
        }
    };

    useEffect(() => {
        fetchActivity()
    }, [webactivitiesId]);

    return (
        <>
            <div className="bg-primary-main pt-6 pb-12 px-8">
                <div className="flex items-center gap-2 mb-3 mt-4 smx:flex ">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <Route
                                    route={routes.crmWebActivities}
                                    linkClassName="text-brand-lightest text-sm font-normal"
                                >
                                    Web Activities
                                </Route>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-neutral-white" />
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    href="#"
                                    className="text-neutral-white font-semibold text-sm cursor-auto"
                                >
                                    {activitydata?.full_name}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex items-start smx:items-center gap-4 mt-4">
                    <div className="flex-col flex smx:flex-row smx:items-center justify-between w-full gap-3">
                        <div>
                            <h3 className="text-2xl text-neutral-white font-semibold mb-1 smx:mb-1.5">
                                {activitydata?.full_name}
                            </h3>
                            <p className="text-base smx:text-sm text-brand-lightest break-all">
                                {activitydata?.email}
                            </p>
                        </div>

                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border border-border-light mt-6 rounded-xl pt-6 pb-12 px-4 sm:px-5 smx:px-6 md:px-7 lg:px-8 mx-4 sm:mx-5 smx:mx-6 md:mx-7 lg:mx-8">
                <div>
                    <h2 className="text-text-black font-medium text-xl md:text-2xl mb-3 mt-0 md:mt-4">
                        Personal Details
                    </h2>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Recipient ID</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.recipient_id ? activitydata?.recipient_id : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">First Name</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.first_name ? activitydata?.first_name : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Last Name</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.last_name ? activitydata?.last_name : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Cons First Name</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.cons_first_name ? activitydata?.cons_first_name : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Cons Last Name</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.cons_last_name ? activitydata?.cons_last_name : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Cons Email</h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.cons_email ? activitydata?.cons_email : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Gender
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_gender ? activitydata?.voy_gender : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Age Range
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_age_range ? activitydata?.voy_age_range : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Children
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_children ? activitydata?.voy_children : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Homeowner
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_homeowner ? activitydata?.voy_homeowner : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Locale
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.locale ? activitydata?.locale : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Time Zone
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.timezone ? activitydata?.timezone : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Net Worth
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.voy_net_worth ? activitydata?.voy_net_worth : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Personal Email Validation Status
                        </h3>
                        <p className="text-text-black text-sm whitespace-nowrap">
                            {activitydata?.voy_personal_emails_validation_status ? activitydata?.voy_personal_emails_validation_status : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Marital Status
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_married ? activitydata?.voy_married : "-"}
                        </p>
                    </div>
                </div>
                <div>
                    <h2 className="text-text-black font-medium text-xl md:text-2xl mb-3 mt-0 md:mt-4">
                        Address:
                    </h2>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Street Address
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_personal_address ? activitydata?.voy_personal_address : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            City
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_personal_city ? activitydata?.voy_personal_city : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            State
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_personal_state ? activitydata?.voy_personal_state : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Postal Code
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_personal_zip ? activitydata?.voy_personal_zip : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Professional Address</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_personal_address ? activitydata?.voy_personal_address : "-"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border border-border-light mt-6 rounded-xl pt-6 pb-12 px-4 sm:px-5 smx:px-6 md:px-7 lg:px-8 mx-4 sm:mx-5 smx:mx-6 md:mx-7 lg:mx-8">
                <div>
                    <h2 className="text-text-black font-medium text-xl md:text-2xl mb-3 mt-0 md:mt-4">
                        Company Details
                    </h2>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Business Email</h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.voy_business_email ? activitydata?.voy_business_email : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Company Address</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_company_address ? activitydata?.voy_company_address : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            City
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_company_city ? activitydata?.voy_company_city : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            State
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_company_state ? activitydata?.voy_company_state : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            ZIP
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_company_zip ? activitydata?.voy_company_zip : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Industry
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_primary_industry ? activitydata?.voy_primary_industry : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Revenue
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_company_revenue ? activitydata?.voy_company_revenue : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            LinkedIn URL
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.voy_company_linkedin_url ? activitydata?.voy_company_linkedin_url : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Job Title
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_job_title ? activitydata?.voy_job_title : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Employee Count
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_company_employee_count ? activitydata?.voy_company_employee_count : "-"}
                        </p>
                    </div>
                </div>
                <div>
                    <h2 className="text-text-black font-medium text-xl md:text-2xl mb-3 mt-0 md:mt-4">
                        Contact Details
                    </h2>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Email</h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.email ? activitydata?.email : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Email Domain</h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.email_domain ? activitydata?.email_domain : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Phone</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.phone ? formatPhoneNumber(activitydata.phone, true) : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Mobile Phone</h3>
                        <p className="text-text-black text-sm">
                            {(() => {
                                const phone = activitydata?.voy_mobile_phone;

                                if (phone) {
                                   try {
                                    return formatPhoneNumber(JSON.parse(phone)?.join(","), true)
                                   } catch {
                                    return formatPhoneNumber(phone, true)
                                   }
                                } else {
                                    return "-"
                                }
                                // try {
                                //     return phone ? JSON.parse(phone)?.join(",") : "-";
                                // } catch {
                                //     return phone || "-"; 
                                // }
                            })()}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Messenger User ID
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.fb_messenger_user_id ? activitydata?.fb_messenger_user_id : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Direct Number</h3>
                        <p className="text-text-black text-sm">
                            {(() => {
                                const phone = activitydata?.voy_direct_number;
                                if (phone) {
                                   try {
                                    return JSON.parse(phone)?.join(",")
                                   } catch {
                                    return formatPhoneNumber(phone, true)
                                   }
                                } else {
                                    return "-"
                                }
                                // try {
                                //     return phone ? JSON.parse(phone)?.join(",") : "-";
                                // } catch {
                                //     return phone || "-";
                                // }
                            })()}
                        </p>
                    </div>

                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Business Contact</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.business_contact ? activitydata?.business_contact : "-"}
                        </p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border border-border-light mt-6 rounded-xl pt-6 pb-12 px-4 sm:px-5 smx:px-6 md:px-7 lg:px-8 mx-4 sm:mx-5 smx:mx-6 md:mx-7 lg:mx-8">
                <div>
                    <h2 className="text-text-black font-medium text-xl md:text-2xl mb-3 mt-0 md:mt-4">
                        Source Details
                    </h2>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Source(Old)</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.source_old ? activitydata?.source_old : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Landing Page Domain</h3>
                        <p className="text-text-black text-sm break-all">
                            <a href={activitydata?.landing_page_domain}
                                target="_blank"
                                rel="noopener noreferrer" className="text-primary-main underline">{activitydata?.landing_page_domain ? activitydata?.landing_page_domain : "-"}</a>
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Landing Page Full URL
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            <a href={activitydata?.landing_page_full_url}
                                target="_blank"
                                rel="noopener noreferrer" className="text-primary-main underline">{activitydata?.landing_page_full_url ? activitydata?.landing_page_full_url : "-"}</a>
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Landing Page URL
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            <a href={activitydata?.landing_page_url}
                                target="_blank"
                                rel="noopener noreferrer" className="text-primary-main underline"  >{activitydata?.landing_page_url ? activitydata?.landing_page_url : "-"}</a>
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Clicked At
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.clicked_at ? convertToLocalTimeToShift(moment(activitydata?.clicked_at), activitydata?.clicked_at.split('T')[1].slice(0, -1), "UTC") : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Referrer
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            <a href={activitydata?.referrer}
                                target="_blank"
                                rel="noopener noreferrer" className="text-primary-main underline">{activitydata?.referrer ? activitydata?.referrer : "-"}</a>
                        </p>
                    </div>
                </div>
                <div>
                    <h2 className="text-text-black font-medium text-xl md:text-2xl mb-3 mt-0 md:mt-4">
                        Session Details
                    </h2>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Created
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.created ? formatSmallDate(activitydata?.created) : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Last Active
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.last_active ? formatSmallDate(activitydata?.last_active) : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Sessions Count</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.sessions_count ? activitydata?.sessions_count : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Time on Site</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.time_on_site ? `${activitydata?.time_on_site} sec` : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Page Views</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.page_views ? activitydata?.page_views : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Clicks</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.clicks ? activitydata?.clicks : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Scroll Depth
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.scroll_depth ? activitydata?.scroll_depth : "-"}
                        </p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border border-border-light mt-6 rounded-xl pt-6 pb-12 px-4 sm:px-5 smx:px-6 md:px-7 lg:px-8 mx-4 sm:mx-5 smx:mx-6 md:mx-7 lg:mx-8">
                <div>
                    <h2 className="text-text-black font-medium text-xl md:text-2xl mb-3 mt-0 md:mt-4">
                        Additional Details
                    </h2>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Comment Guard Answer</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.comment_guard_answer ? activitydata?.comment_guard_answer : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Messenger Ad Answer</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.messenger_ad_answer ? activitydata?.messenger_ad_answer : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Sponsored Message Answer</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.sponsored_message_answer ? activitydata?.sponsored_message_answer : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Suppressed</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.suppressed ? activitydata?.suppressed : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Unsubscribed
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.unsubscribed ? activitydata?.unsubscribed : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            UTM Tags
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.utm_tags ? activitydata?.utm_tags : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Verified User
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.verified_user ? activitydata?.verified_user : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Follower Count
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.follower_count ? activitydata?.follower_count : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            User Follow Business
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.user_follow_business ? activitydata?.user_follow_business : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Business Follow User
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.business_follow_user ? activitydata?.business_follow_user : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            User Follow Business
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.user_follow_business ? activitydata?.user_follow_business : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            Profile Synced At
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.profile_synced_at ? activitydata?.profile_synced_at : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Business Email Validation Status</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_business_email_validation_status ? activitydata?.voy_business_email_validation_status : "-"}
                        </p>
                    </div>

                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Seniority Level</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.voy_seniority_level ? activitydata?.voy_seniority_level : "-"}
                        </p>
                    </div>

                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Ref</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.ref ? activitydata?.ref : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">Handle</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.handle ? activitydata?.handle : "-"}
                        </p>
                    </div>
                </div>
                <div>
                    <h2 className="text-text-black font-medium text-xl md:text-2xl mb-3 mt-0 md:mt-4">
                        Advertisement Details
                    </h2>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">CTM Ad ID</h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.ctm_ad_id ? activitydata?.ctm_ad_id : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">CTM Ad Name</h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.ctm_ad_name ? activitydata?.ctm_ad_name : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm break-all">
                            CTM Ad Set Name
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.ctm_ad_set_name ? activitydata?.ctm_ad_set_name : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            CTM Campaign Name
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.ctm_campaign_name ? activitydata?.ctm_campaign_name : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            SM Ad ID
                        </h3>
                        <p className="text-text-black text-sm">
                            {activitydata?.sm_ad_id ? activitydata?.sm_ad_id : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            SM Ad Name
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.sm_ad_name ? activitydata?.sm_ad_name : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            SM Ad Set Name
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.sm_ad_set_name ? activitydata?.sm_ad_set_name : "-"}
                        </p>
                    </div>
                    <div className="border-b border-border-light py-2.5 flex justify-between items-center gap-2">
                        <h3 className="text-neutral-200 text-sm">
                            SM Campaign Name
                        </h3>
                        <p className="text-text-black text-sm break-all">
                            {activitydata?.sm_campaign_name ? activitydata?.sm_campaign_name : "-"}
                        </p>
                    </div>
                </div>

            </div>


        </>
    )
}

export default WebActivityList;