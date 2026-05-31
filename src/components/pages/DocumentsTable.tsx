"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { Alerts, Button } from "@/components/atomics";

import { TrashIcon } from "@/assets/icons";
import UI8Table from "@/components/UI8Table";
import DocumentFormData from "@/components/templates/crm/documents/FormData";
import { CRMDocumentsResponse } from "@/interface/documents";
import { deleteDocumentsById, getCRMDocuments } from "@/services/documents";
import { size } from "@/constants/constants";
import { useJune } from "@/hooks/useJune";

type Props = {
  filterType?: "company" | "contact" | "job";
  filterId?: string;
};

const DocumentsTable = ({ filterType, filterId }: Props) => {
  const [openModalDeleteDocument, setOpenModalDeleteDocument] = useState(false);
  const [openAddDocument, setOpenAddDocument] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openAlertsDelete, setOpenAlertsDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [documentsTableData, setDocuments] = useState<CRMDocumentsResponse>();

  const [search, setSearch] = useState("")
  const timeoutRef = useRef<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const analytics = useJune();

  const fetchDocuments = useCallback(async (searchValue?: string) => {
    try {
      const response = await getCRMDocuments(+page, filterType, filterId, searchValue);
      analytics?.track("getCRMDocuments");
      setDocuments(response);
      setTotalPages(Math.ceil(response?.count / size));
    } catch (e: any) {
      if (e?.response?.data?.detail === "Invalid page." && page > 1)
        setPage(page - 1);
      console.error("Error fetching call list:", e);
    }
  }, [page]);

  useEffect(() => {
    fetchDocuments(search);
  }, [page]);

  useEffect(() => {
    if (page > 1) setPage(1)
  }, [search])

  const handleDeleteDocument = async () => {
    if (documentToDelete) {
      try {
        setIsLoading(true)
        await deleteDocumentsById(documentToDelete);
        analytics?.track("deleteDocumentsById");
        setOpenAlertsDelete(true);
        fetchDocuments();
      } catch (error) {
        console.error("Error deleting Document:", error);
      } finally {
        setIsLoading(false)
        setOpenModalDeleteDocument(false);
      }
    }
  };

  const handleSearchChange = useCallback((searchValue: string) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      fetchDocuments(searchValue)
    }, 2000);
    setSearch(searchValue)
  }, [])

  const tableConfig = {
    tableName: "Documents",
    pageUrl: "/crm/documents",
    page,
    totalPages,
    handlePageChange: (page: number) => {
      setPage(page);
    },
    columns: {
      file_name: { path: "file_name", header: "File Name", type: "string" },
      added_by: { path: "added_by.name", header: "Added By", type: "string" },
      created_at: { path: "added_date", header: "Created At", type: "date" },
    },
    actionsColumn: (item: any) => [
      <Button
        className="!h-11 !w-11"
        key={`add-contact-${item.id}`}
        size="md"
        variant="default-bg"
        onClick={(e: any) => {
          e.stopPropagation();
          setDocumentToDelete(item.id);
          setOpenModalDeleteDocument(true);
        }}
      >
        <TrashIcon className="h-5 w-5 text-error-main" />
      </Button>,
    ],
    addAction: () => setOpenAddDocument(true),
    modals: [
      {
        title: "Add Documents",
        className: "max-w-4xl !max-h-[90vh]",
        open: openAddDocument,
        setOpen: setOpenAddDocument,
        modalChild: (
          <DocumentFormData
            hideModal={() => setOpenAddDocument(false)}
            refetch={fetchDocuments}
            setOpenSuccess={setOpenSuccess}
            openSuccess={openSuccess}
          />
        ),
      },
      {
        title: "Delete Document",
        className: "max-w-sm !overflow-y-visible",
        open: openModalDeleteDocument,
        setOpen: setOpenModalDeleteDocument,
        modalChild: (
          <>
            <main className="mb-10 mt-4">
              <p className="text-sm text-netral-80">
                Are you sure you want to delete this document?
              </p>
            </main>

            <footer className="flex w-full justify-end gap-3">
              <Button
                className="!h-10"
                size="md"
                disabled={isLoading}
                variant="primary-nude"
                onClick={() => setOpenModalDeleteDocument(false)}
              >
                Cancel
              </Button>

              <Button
                className="!h-10"
                size="md"
                disabled={isLoading}
                variant="error-bg"
                onClick={() => {
                  handleDeleteDocument();
                }}
              >
                Yes
              </Button>
            </footer>
          </>
        ),
      },
    ],
    alerts: [
      <Alerts
        key="alert-Document-added"
        variant="success"
        open={openSuccess}
        setOpen={setOpenSuccess}
        title="Document has been added"
        desc="Document has been added. You can manage this company or add additional information as needed."
      />,
      <Alerts
        key="alert-document-deleted"
        variant="success"
        open={openAlertsDelete}
        setOpen={setOpenAlertsDelete}
        title="Document has been deleted"
        desc="Document has been deleted. Please review any adjustments to your records as necessary."
      />,
    ],
    hasNavigation: true,
    search,
    handleSearchChange
  };

  return (
    documentsTableData && (
      <>
        <UI8Table
          data={documentsTableData.results as any}
          config={tableConfig}
        />
      </>
    )
  );
};

export default DocumentsTable;
