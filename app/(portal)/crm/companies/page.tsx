"use client";
import { useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@/assets/icons";
import { Alerts, Button } from "@/components/atomics";
import UI8Table from "@/components/UI8Table";
import { size } from "@/constants/constants";
import {
  CompanyFormInterface,
  CRMCompaniesResponse,
} from "@/interface/companies";
import { formatPhoneNum, formatURL } from "@/utils/formatHelper";
import {
  addCompany,
  deleteCompanyById,
  editCompanyById,
  getCompanyById,
  getCRMCompanies,
} from "@/services/companies";
import NewCompanyForm from "@/components/templates/crm/companies/NewCompanyForm";
import { useJune } from "@/hooks/useJune";
import { unformatPhoneNumber } from "@/utils/formatPhoneForCall";

type ModalStep = {
  stepName: string;
  description: string;
  page: ReactNode;
  canSkip: boolean;
  nextAction?: () => void;
};

const DEFAULT_DATA = {
  name: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  industry: "",
  num_employees: "",
};

const Companies = () => {
  const router = useRouter();
  const [companyTableData, setCompanyTableData] =
    useState<CRMCompaniesResponse>();
  const [openModalAddCompany, setOpenModalAddCompany] = useState(false);
  const [openModalEditCompany, setOpenModalEditCompany] = useState(false);
  const [activeState, setActiveState] = useState(1);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openEditAlert, setOpenEditAlert] = useState(false);
  const [openAlertsDelete, setOpenAlertsDelete] = useState(false);
  const [openResponseError, setOpenResponseError] = useState(false);
  const [responseErrors, setResponseError] = useState<string[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [companyFormData, setCompanyFormData] =
    useState<CompanyFormInterface>(DEFAULT_DATA);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchData, setFetchData] = useState(false);
  const [isLoading, seIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const analytics = useJune();
  const [search, setSearch] = useState("")
  const timeoutRef = useRef<any>(null);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!companyFormData.name) newErrors.name = "Company Name is required";
    if (companyFormData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(companyFormData.email)) {
        newErrors.email = "Invalid email format";
      }
    }
    const phoneRegex = /^\d{10}$/;
    if (companyFormData.phone && !phoneRegex.test(unformatPhoneNumber(companyFormData.phone))) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      seIsLoading(true)
      await addCompany({
        ...companyFormData,
        phone: formatPhoneNum(companyFormData.phone),
        website: formatURL(companyFormData?.website),
      });
      analytics?.track("addCompany");
      setActiveState(1);
      setOpenModalAddCompany(false);
      setOpenSuccess(true);
    } catch (error:any) {
      let errorMessages = [];

            for (const field in error.response.data) {
              errorMessages.push(...error.response.data[field]);

            }
            setResponseError(errorMessages);
            setOpenResponseError(true)
            throw error;
    
    } finally {
      seIsLoading(false)
      setCompanyFormData(DEFAULT_DATA);
    }
  };

  const handleEditSubmit = async () => {
    if (!validate()) return;
    try {
      seIsLoading(true);
      const editData: any = {
        ...companyFormData,
        phone: companyFormData?.phone ? `+1${companyFormData?.phone}` : "",
      };
      await editCompanyById(selectedCompanyId, editData);
      analytics?.track("editCompanyById");

      setFetchData((e: boolean) => !e);
      setOpenEditAlert(true);
    } catch (error:any) {
      let errorMessages = [];

            for (const field in error.response.data) {
              errorMessages.push(...error.response.data[field]);

            }
            setResponseError(errorMessages);
            setOpenResponseError(true)
            throw error;
    } finally {
      setCompanyFormData(DEFAULT_DATA);
      seIsLoading(false);
      setOpenModalEditCompany(false);
    }
  };

  const handleDelete = async () => {
    try {
      seIsLoading(true)
      await deleteCompanyById(selectedCompanyId);
      analytics?.track("deleteCompanyById");
      setOpenAlertsDelete(true);
      setFetchData((e) => !e);
    } catch (error) {
      console.log("error", error);
    } finally {
      seIsLoading(false)
      setOpenModalDelete(false);
    }
  };

  const getCompanyDetails = async (id: string) => {
    try {
      const response = await getCompanyById(id);
      analytics?.track("getCompanyById");

      const { name, email, phone, address, website, industry, num_employees } =
        response;
      if (response) {
        setCompanyFormData({
          name,
          email,
          address,
          website,
          industry,
          num_employees,
          phone: phone ? phone.substring(2) : "",
        });
        setOpenModalEditCompany(true);
      }
    } catch (e) {
      throw e;
    }
  };

  const fetchCompanies = useCallback(async (searchValue?: string) => {
    try {
      const response = await getCRMCompanies(+page, searchValue);
      analytics?.track("getCRMCompanies");
      setCompanyTableData(response);
      setTotalPages(Math.ceil(response?.count / size));
    } catch (e: any) {
      if (e?.response?.data?.detail === "Invalid page." && page > 1)
        setPage(page - 1);
      console.log("Error fetching call list:", e);
    }
  }, [page]);

  const handleSearchChange = useCallback((searchValue: string) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      fetchCompanies(searchValue)
    }, 2000);
    setSearch(searchValue)
  }, [])

  useEffect(() => {
    fetchCompanies(search);
  }, [page, fetchData]);

  useEffect(() => {
    setPage(1)
  }, [search])

  const modalSteps: ModalStep[] = [
    {
      stepName: "Create Company",
      description: "Please enter the company details below",
      canSkip: false,
      page: (
        <NewCompanyForm
          companyFormData={companyFormData}
          setCompanyFormData={setCompanyFormData}
          errors={errors}
        />
      ),
    },
  ];

  const tableConfig = {
    tableName: "Companies",
    page,
    totalPages,
    search,
    handleSearchChange,
    handlePageChange: (page: number) => {
      setPage(page);
      setFetchData(true);
    },
    columns: {
      name: { path: "name", header: "Name", type: "string" },
      email: { path: "email", header: "Email", type: "string" },
      created_at: { path: "created_at", header: "Created At", type: "date" },
      addedBy: { path: "added_by.name", header: "Added By", type: "string" },
    },
    hasNavigation: true,
    actionsColumn: (item: any) => [
      <Button
        key={`select-comp-${item.id}`}
        size="md"
        variant="default-bg"
        className="mr-4 !w-11"
        onClick={(e) => {
          e.stopPropagation();
          getCompanyDetails(item?.id);
          setSelectedCompanyId(item?.id);
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.79289 13.4999H3C2.86739 13.4999 2.74021 13.4472 2.64645 13.3535C2.55268 13.2597 2.5 13.1325 2.5 12.9999V10.207C2.5 10.1414 2.51293 10.0764 2.53806 10.0157C2.56319 9.95503 2.60002 9.89991 2.64645 9.85348L10.1464 2.35348C10.2402 2.25971 10.3674 2.20703 10.5 2.20703C10.6326 2.20703 10.7598 2.25971 10.8536 2.35348L13.6464 5.14637C13.7402 5.24014 13.7929 5.36732 13.7929 5.49992C13.7929 5.63253 13.7402 5.75971 13.6464 5.85348L6.14645 13.3535C6.10002 13.3999 6.0449 13.4367 5.98424 13.4619C5.92357 13.487 5.85855 13.4999 5.79289 13.4999Z"
            stroke="#3B4453"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 4L12 7.5"
            stroke="#3B4453"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.96848 13.4675L2.53223 10.0312"
            stroke="#3B4453"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>,
      <Button
        key={`add-comp-${item.id}`}
        size="md"
        variant="default-bg"
        className="!w-11"
        onClick={(e: any) => {
          e.stopPropagation();
          setSelectedCompanyId(item?.id);
          setOpenModalDelete(true);
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.5 3.5L2.5 3.50001"
            stroke="#FF5630"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 6.5V10.5"
            stroke="#FF5630"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 6.5V10.5"
            stroke="#FF5630"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.5 3.5V13C12.5 13.1326 12.4473 13.2598 12.3536 13.3536C12.2598 13.4473 12.1326 13.5 12 13.5H4C3.86739 13.5 3.74021 13.4473 3.64645 13.3536C3.55268 13.2598 3.5 13.1326 3.5 13V3.5"
            stroke="#FF5630"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.5 3.5V2.5C10.5 2.23478 10.3946 1.98043 10.2071 1.79289C10.0196 1.60536 9.76522 1.5 9.5 1.5H6.5C6.23478 1.5 5.98043 1.60536 5.79289 1.79289C5.60536 1.98043 5.5 2.23478 5.5 2.5V3.5"
            stroke="#FF5630"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>,
    ],
    addAction: () => {
      setErrors({});
      setCompanyFormData(DEFAULT_DATA);
      setOpenModalAddCompany(true);
    },
    modals: [
      {
        title: "Add Company",
        className: "max-w-4xl",
        open: openModalAddCompany,
        setOpen: setOpenModalAddCompany,
        modalChild: (
          <>
            <main className="my-10 flex flex-col items-center justify-center gap-10">
              <nav className="relative w-fit">
                <div className="absolute left-1/2 top-5 -z-10 h-0.5 w-10/12 -translate-x-1/2 bg-neutral-40"></div>
                <section className="flex items-center justify-center gap-20">
                  {modalSteps.map((step, key) => (
                    <div className="flex flex-col items-center gap-2" key={key}>
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border ${activeState > key
                          ? "border-primary-border bg-primary-main"
                          : "border-neutral-50 bg-neutral-50"
                          } text-xl sm:text-body-xl font-semibold text-white`}
                      >
                        {activeState > 0 && activeState <= key + 1 && key + 1}

                        {activeState > key + 1 && (
                          <CheckIcon className="h-6 w-6 text-white" />
                        )}
                      </span>

                      <h5 className="text-xs font-semibold text-neutral-50">
                        {step.stepName}
                      </h5>
                    </div>
                  ))}
                </section>
              </nav>

              <header className="space-y-2 text-center">
                <h3 className="text-xl sm:text-body-xl font-semibold">
                  {modalSteps[activeState - 1].stepName}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-50">
                  {modalSteps[activeState - 1].description}
                </p>
              </header>
              {modalSteps[activeState - 1].page}
            </main>

            <footer className="flex justify-end gap-3">
              <Button
                className="!h-10"
                size="md"
                variant="primary-nude"
                disabled={isLoading}
                onClick={() => {
                  if (activeState === 1) {
                    setOpenModalAddCompany(false);
                  } else {
                    setActiveState(activeState - 1);
                  }
                }}
              >
                {activeState === 1 ? "Cancel" : "Previous"}
              </Button>

              <Button
                className="!h-10"
                size="md"
                variant="primary-bg"
                disabled={isLoading}
                onClick={async () => {
                  if (activeState < modalSteps.length) {
                    if (openModalAddCompany === false) {
                      setActiveState(1);
                    } else {
                      setActiveState(activeState + 1);
                    }
                  } else {
                    await handleSubmit();
                  }
                }}
              >
                {activeState === modalSteps.length
                  ? "Submit"
                  : modalSteps[activeState - 1]?.canSkip
                    ? "Skip"
                    : "Next"}
              </Button>
            </footer>
          </>
        ),
      },
      {
        title: "Edit Company",
        className: "max-w-4xl",
        open: openModalEditCompany,
        setOpen: setOpenModalEditCompany,
        modalChild: (
          <>
            <main className="my-10 flex flex-col items-center justify-center gap-10">
              {modalSteps[0].page}
            </main>

            <footer className="flex w-full justify-end gap-3">
              <Button
                className="!h-10"
                size="md"
                variant="default-nude"
                disabled={isLoading}
                onClick={() => setOpenModalEditCompany(false)}
              >
                Cancel
              </Button>
              <Button
                className="!h-10"
                disabled={isLoading}
                size="md"
                variant="primary-bg"
                onClick={() => {
                  handleEditSubmit();
                }}
              >
                Submit
              </Button>
            </footer>
          </>
        ),
      },
      {
        title: "Delete Company",
        className: "max-w-lg",
        open: openModalDelete,
        setOpen: setOpenModalDelete,
        modalChild: (
          <>
            <main className="mb-10 mt-4">
              <p className="text-sm text-neutral-80">
                Are you sure you want to delete this company? Deleted Company
                cannot be recovered.
              </p>
            </main>
            <footer className="flex w-full justify-end gap-3">
              <Button
                className="!h-10"
                size="md"
                disabled={isLoading}
                variant="default-nude"
                onClick={() => setOpenModalDelete(false)}
              >
                Cancel
              </Button>
              <Button
                className="!h-10"
                size="md"
                disabled={isLoading}
                variant="error-bg"
                onClick={() => {
                  handleDelete();
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
        key="alert-company-added"
        variant="success"
        open={openSuccess}
        setOpen={setOpenSuccess}
        title="Company has been added"
        desc="Company has been added. You can manage this company or add additional information as needed."
        alertButton={{
          text: "Go to Customers",
          action: () => {
            router.push("/crm/contacts");
          },
        }}
      />,
      <Alerts
        key="alert-company-edited"
        variant="success"
        open={openEditAlert}
        setOpen={setOpenEditAlert}
        title="Company has been edited"
        desc="Company has been edited. Review the changes and manage additional information as needed."
      />,
      <Alerts
        key="alert-company-deleted"
        variant="success"
        open={openAlertsDelete}
        setOpen={setOpenAlertsDelete}
        title="Company has been deleted"
        desc="Company has been deleted. Please review any adjustments to your records as necessary."
      />,
      <Alerts
        key="alert-contact-error"
        variant="success"
        open={openResponseError}
        setOpen={setOpenResponseError}
        title="Error"
        desc={responseErrors}
      />,
    ],
  };

  return (
    companyTableData && (
      <UI8Table data={companyTableData?.results as any} config={tableConfig} />
    )
  );
};
export default Companies;
