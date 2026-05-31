import dynamic from 'next/dynamic';
const Route = dynamic(() => import('@/components/atomics/Route'), {
  ssr: false,
});
import { JWT } from '@/constants/enums/enums';
import { routes } from '@/constants/routes';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@relume_io/relume-ui';
import axios from 'axios';
import { cookies as nextCookies } from 'next/headers';
import { Fragment } from 'react';
import formatDate from '@/utils/formatDate';
import QuoteItems from '@/components/templates/crm/contacts/QuoteItems';

interface Params {
  id: string,
  contactId: string,
}

export default async function MyPage({ params }: { params: Params }) {
  const { id, contactId } = params
  const quoteDetail = await fetchQuoteDetails(id)

  const quoteInfo = {
    "Job Name": quoteDetail?.job_name || "--",
    "Customer Name": quoteDetail?.customer_name || "--",
    "Email": quoteDetail?.customer_email || "--",
    "Phone": quoteDetail?.customer_phone || "--",
    "Quote": quoteDetail?.total?.length ? quoteDetail.total : "--",
    "Created At": formatDate(quoteDetail?.createdAt) ?? "--",
  };

  return (  
    <Fragment key={quoteDetail?.job_name}>
      <Breadcrumb >
        <BreadcrumbList>
          <BreadcrumbItem>
            <Route
              route={`${routes.crmContacts}/${contactId}`}
              linkClassName="text-neutral-500 hover:cursor-pointer"
            >
              Customer
            </Route>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-[#707070]" />
          <BreadcrumbItem>
            <BreadcrumbLink className="text-neutral-black font-medium cursor-auto">
              {quoteDetail?.job_name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="py-4">
        <div className="container w-full">
          <div className="border rounded-md px-6 py-5 max-sm:p-3">
            <p className="font-semibold text-md sm:text-lg">
              Quote Information
            </p>
            <div className="grid gap-4 grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 py-5 text-sm">
              {Object.entries(quoteInfo).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <p className="text-gray-600">{key}</p>
                  <p className={["Email", "Quote"].includes(key) ? "text-pink-500" : ""}>
                  {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <QuoteItems pageView="quote" jobId={id} />
    </Fragment>
  )
}

async function fetchQuoteDetails(id: string) {
  try {
    const cookieStore = nextCookies();
    const cookies = cookieStore.get(JWT);
    const token = cookies?.value ? JSON.parse(cookies.value).token : '';

    const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}api/contacts/v1/view-quote-details/${id}/`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `token ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching quote details:", error);
    return null;
  }
}