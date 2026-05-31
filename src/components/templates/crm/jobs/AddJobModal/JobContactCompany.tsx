"use client";
import { Button } from "@/components/atomics";
import UI8Table from "@/components/UI8Table";
import { size } from "@/constants/constants";
import { CRMCompaniesResponse } from "@/interface/companies";
import { getCRMCompanies } from "@/services/companies";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useJune } from "@/hooks/useJune";

type ModalStep = {
  stepName: string;
  description: string;
  page: ReactNode;
  canSkip: boolean;
  nextAction?: () => void;
};

const JobContactCompany = () => {
  const [companyTableData, setCompanyTableData] =
    useState<CRMCompaniesResponse>();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchData, setFetchData] = useState(false);
  const analytics = useJune();

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await getCRMCompanies(+page);
      analytics?.track("getCRMCompanies");
      setCompanyTableData(response);
      setTotalPages(Math.ceil(response?.count / size));
    } catch (e) {
      console.error("Error fetching call list:", e);
    }
    setFetchData(false);
  }, [page]);

  useEffect(() => {
    fetchCompanies();
  }, [page]);

  const tableConfig = {
    tableName: "Companies",
    page,
    totalPages,
    handlePageChange: (page: number) => {
      setPage(page);
      setFetchData(true);
    },
    columns: {
      id: { path: "id", header: "ID", type: "string" },
      name: { path: "name", header: "Name", type: "string" },
      email: { path: "email", header: "Email", type: "string" },
      created_at: { path: "created_at", header: "Created At", type: "date" },
      addedBy: { path: "added_by.name", header: "Added By", type: "string" },
    },
    hasNavigation: true,
    hideAddButton: true,
    actionsColumn: (item: any) => [
      <Button
        className="!py-[14px]"
        key={`select-company-${item.id}`}
        variant="default-outline"
      >
        Select
      </Button>,
    ],
    modals: [],
    alerts: [],
  };

  return (
    <div className="w-full min-h-[38.5vh]">
      {companyTableData && (
        <UI8Table
          data={companyTableData?.results as any}
          config={tableConfig}
        />
      )}
    </div>
  );
};
export default JobContactCompany;
