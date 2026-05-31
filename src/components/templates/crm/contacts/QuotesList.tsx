"use client"
import React, { useCallback, useEffect, useState } from "react";
import Ui7TableNew from "@/components/Ui7TableNew";
import { size } from "@/constants/constants";
import { CRMJobsResponse } from "@/interface/jobs";
import { getCustomerInvoices, getCustomerQuotes } from "@/services/contacts";
import { useJune } from "@/hooks/useJune";
import Ui6Table from "@/components/UI6Table";


type Props = {
    filterId?: string;
  };

const QuotesList = ({ filterId }:Props) => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [isSort, setIsSort] = useState(false);
  const [search, setSearch] = useState("");
  const [typeCheckbox, setTypeCheckbox] = useState<string>("");
  const [cancelSearch, setCencelSearch] = useState("");
  const [dateSearch, setDateSearch] = useState<string>("");
  const [quotesList, setQuotesList] = useState<CRMJobsResponse>();

  const analytics = useJune();

  const fetchCustomerQuotes = useCallback(async () => {
    try {
      if(filterId){
        let eventType = typeCheckbox || "";
        const response = await getCustomerQuotes(+page, filterId,search,isSort,dateSearch);
        analytics?.track("getCustomerInvoices");
        setQuotesList(response);
        setTotalPages(Math.ceil(response?.count / size));
      }
    } catch (e) {
      console.error("Error fetching call list:", e);
    }
  }, [page, filterId,isSort,typeCheckbox,dateSearch,search]);

  useEffect(() => {
    fetchCustomerQuotes();
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
    setTypeCheckbox,
    search,
    setSearch,
    cancelSearch,
    setCencelSearch,
    noFilter:true,
    setIsSort,
    isSort,
    pageUrl: `/crm/contacts/${filterId}/quote`,
    handlePageChange: (newPage: number) => {
      setPage(newPage);
    },
    columns: {
      quote: { path: "total_invoice_amount", header: "Quote", type: "currency" },
      pipeline: { path: "pipeline", header: "Pipeline", type: "string" },
      status: { path: "payment_status", header: "Status", type: "string", style:"text-primary-main font-semibold bg-primary-surface px-2.5 py-1.5 rounded-full" },
      job_name: { path: "job_name", header: "Linked Job", type: "string" },
      quote_date: { path: "createdAt", header: "Created At", type: "dateTime" },

    },
  };
  return (
    <div className="invoices-page">
      <Ui7TableNew data={quotesList?.results as any} config={tableConfig as any} />
    </div>
  );
};
export default QuotesList;