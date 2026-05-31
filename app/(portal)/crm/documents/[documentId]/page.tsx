"use client";
import { Button } from "@/components/atomics";
import Route from "@/components/atomics/Route";
import { routes } from "@/constants/routes";
import { CRMDocumentByIdResponse } from "@/interface/documents";
import { getDocumentById } from "@/services/documents";
import { dueDate } from "@/utils/formatDate";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@relume_io/relume-ui";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useJune } from "@/hooks/useJune";

interface DocType {
  uri: string;
}

const DocumentDetails = () => {
  const { documentId } = useParams<{ documentId: string }>() ?? {documentId: ''};

  const [documents, setDocuments] = useState<CRMDocumentByIdResponse>();
  const [docs, setDocs] = useState<DocType[]>([]);
  const analytics = useJune();

  useEffect(() => {
    const fetchData = async () => {
      const response = await getDocumentById(documentId);
      analytics?.track("getDocumentById");
      setDocuments(response);
      if (response?.file) {
        setDocs([{ uri: response?.file }]);
      }
    };
    fetchData();
  }, [documentId]);

  const detailFields: {
    fieldName: string;
    fieldValue?: string | number | null;
  }[] = [
    {
      fieldName: "Added By",
      fieldValue: documents?.added_by.name,
    },
    {
      fieldName: "Linked Job",
      fieldValue: documents?.linked_job?.job_name,
    },
    {
      fieldName: "Added At",
      fieldValue: dueDate(
        documents?.added_date || "",
        documents?.added_by?.franchise_timezone || ""
      ),
    },
  ];

  const handleDownload = async () => {
    if (documents?.file) {
      try {
        const fileResponse = await fetch(documents.file);
        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = documents.file_name || "downloaded_file";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    }
  };

  const DocumentViewer = ({ doc }: { doc: any }) =>
    doc.length ? (
      <DocViewer
        documents={doc}
        prefetchMethod="GET"
        pluginRenderers={DocViewerRenderers}
        style={{ minHeight: "600px" }}
        config={{
          header: {
            disableFileName: true,
            disableHeader: false,
          },
          pdfZoom: {
            defaultZoom: 1,
            zoomJump: 0.1,
          },
        }}
      />
    ) : null;

  return (
    documents && (
      <div className="p-5 max-w-4xl mx-auto shadow-lg rounded-lg bg-white">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Route
                route={routes.crmDocuments}
                linkClassName="text-neutral-500 hover:cursor-pointer"
              >
                Documents
              </Route>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[#707070]" />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-neutral-black font-medium cursor-auto">
                {documents.file_name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex justify-end">
          <Button size="md" variant="primary-bg" className="!h-10">
            <Route route={routes.crmDocuments} linkClassName="">
              Back
            </Route>
          </Button>
        </div>
        <div className="grid gap-4 grid-cols-1 py-5 px-8 max-smx:grid-cols-1 max-smx:px-4">
          {documents &&
            detailFields.map(
              ({ fieldName, fieldValue }) =>
                fieldValue && (
                  <div className="py-4 flex" key={fieldName}>
                    <p className="text-[#333333b3] mr-5 flex-shrink-0 text-sm">
                      {fieldName}:
                    </p>
                    <p className="w-3/4 break-words text-sm">{fieldValue}</p>
                  </div>
                )
            )}
        </div>
        <div className="flex flex-col md:flex-row"></div>
        <div className="w-full mx-auto shadow-lg rounded-lg bg-white">
          <Button
            size="md"
            variant="primary-bg"
            onClick={handleDownload}
            className="ml-auto !h-10"
          >
            Download File
          </Button>
          <DocumentViewer doc={docs} />
        </div>
      </div>
    )
  );
};

export default DocumentDetails;
