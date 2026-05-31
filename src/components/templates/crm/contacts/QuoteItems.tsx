"use client"
import React, { useCallback, useEffect, useState } from "react";
import Ui7TableNew from "@/components/Ui7TableNew";
import { size } from "@/constants/constants";
import { CRMJobsResponse } from "@/interface/jobs";
import { getListDetails } from "@/services/contacts";
import { useJune } from "@/hooks/useJune";

type Props = {
  jobId?: string;
  pageView: string;
  };

const QuotesItems = ({ pageView, jobId }:Props) => {
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

  const fetchQuotesDetails = useCallback(async () => {
    try {
      if(jobId){
        const response = await getListDetails(pageView, +page, jobId,search,isSort,dateSearch);
        analytics?.track("getCustomerInvoices");
        setQuotesList(response?.configs);
        setTotalPages(Math.ceil(response?.count / size));
      }
    } catch (e) {
      console.error("Error fetching call list:", e);
    }
  }, [page, jobId,isSort,typeCheckbox,dateSearch,search]);

  useEffect(() => {
    fetchQuotesDetails();
  }, [page,jobId,isSort,typeCheckbox,dateSearch,search]);

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
    pageUrl: `/crm/jobs/${jobId?.split('_')[0]}`,
    handlePageChange: (newPage: number) => {
      setPage(newPage);
    },
    columns: {
      config_name: {
        path: "config_name",
        header: "Config Name",
        type: "string",
      },
      product_type: {
        path: "product_type",
        header: "Product Type",
        type: "string",
      },
      vendor: { path: "vendor", header: "Vendor", type: "string" },
      product: { path: "product", header: "Product", type: "string" },
      style: { path: "style", header: "Style", type: "string" },
      created_at: {
        path: "created_at",
        header: "Created At",
        type: "dateTime",
      },
      price: { path: "price", header: "Price", type: "currency" },
    },
  };
  return (
    <div className="invoices-page">
      <Ui7TableNew data={quotesList as any} config={tableConfig as any} />
    </div>
  );
};
export default QuotesItems;