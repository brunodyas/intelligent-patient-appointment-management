"use client"
import React, { useCallback, useEffect, useState } from "react";
import Ui7TableNew from "@/components/Ui7TableNew";
import { size } from "@/constants/constants";
import { CRMJobsResponse } from "@/interface/jobs";
import { getCustomerInvoices } from "@/services/contacts";
import { useJune } from "@/hooks/useJune";


type Props = {
    filterId?: string;
  };
const inititalStatus = [
"Down Payment",
"Final Payment",
"Full Payment"
];


const InvoicesList = ({ filterId }:Props) => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [isSort, setIsSort] = useState(false);
  const [search, setSearch] = useState("");
  const [typeCheckbox, setTypeCheckbox] = useState<string[]>(inititalStatus);
  const [cancelSearch, setCencelSearch] = useState("");
  const [dateSearch, setDateSearch] = useState<string>("");
  const [invoicesList, setInvoicesList] = useState<CRMJobsResponse>();

  const analytics = useJune();

  const fetchCustomerInvoices = useCallback(async () => {
    try {
      if(filterId){
        let eventType = typeCheckbox || "";
        const response = await getCustomerInvoices(+page, filterId,search,isSort,eventType,dateSearch);
        analytics?.track("getCustomerInvoices");
        setInvoicesList(response);
        setTotalPages(Math.ceil(response?.count / size));
      }
    } catch (e) {
      console.error("Error fetching call list:", e);
    }
  }, [page, filterId,isSort,typeCheckbox,dateSearch,search]);

  useEffect(() => {
    fetchCustomerInvoices();
  }, [page, filterId,isSort,typeCheckbox,dateSearch,,search]);

  const handleDateSearch = (date: string) => {
    setDateSearch(date);
  }
  const tableConfig = {
    tableName: "List View",
    page,
    setPage,
    handleDateSearch,
    totalPages,
    count,
    typeCheckbox,
    inititalStatus,
    setTypeCheckbox,
    search,
    setSearch,
    cancelSearch,
    setCencelSearch,
    setIsSort,
    isSort,
    pageUrl: `/crm/contacts/${filterId}/invoice`,
    handlePageChange: (newPage: number) => {
      setPage(newPage);
    },
    columns: {
      quote: { path: "total_invoice_amount", header: "Quote", type: "currency" },
      invoice_id: { path: "invoice_id", header: "Invoice ID", type: "string" },
      pipeline: { path: "pipeline", header: "Pipeline", type: "string" },
      payment_type: { path: "payment_type", header: "Payment Type", type: "string" },
      status: { path: "payment_status", header: "Status", type: "string", style:"text-primary-main font-semibold bg-primary-surface px-2.5 py-1.5 rounded-full", Complete: "bg-[#e4f2e9] text-[#1ea177] px-2.5 py-1.5 rounded-full font-semibold", Pending: "bg-[#fcf7e8] text-[#e18f05] px-2.5 py-1.5 rounded-full font-semibold" },
      job_name: { path: "job_name", header: "Linked Job", type: "string" },
      quote_date: { path: "createdAt", header: "Created At", type: "dateTime" },

    },
  };
  return (
    <div className="invoices-page">
      <Ui7TableNew data={invoicesList?.results as any} config={tableConfig} />
    </div>
  );
};
export default InvoicesList;
