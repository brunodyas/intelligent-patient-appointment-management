"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addContact,
  editContactById,
  getContactById,
  getCRMContacts,
} from "@/services/contacts";
import { CheckIcon } from "@/assets/icons";
import { Alerts, Button, Input } from "@/components/atomics";
import UI8Table from "@/components/UI8Table";
import CompaniesSubPage from "@/components/templates/crm/contacts/CompaniesSubPage";
import { useSelectCompany } from "@/context/selectCompany";
import { addCompany } from "@/services/companies";
import { ModalStep } from "@/types";
import { CRMCompany } from "@/interface/companies";
import { CRMContactsResponse, DefaultFormData } from "@/interface/contacts";
import { useUser } from "@/hooks/user/useUser";
import { size } from "@/constants/constants";
import { formatPhoneNum } from "@/utils/formatHelper";
import NewContactForm from "../templates/crm/contacts/NewContactForm";
import { useJune } from "@/hooks/useJune";
import { unformatPhoneNumber } from "@/utils/formatPhoneForCall";

const DEFAULT_DATA: DefaultFormData = {
  contact_name: "",
  customer_email: "",
  customer_phone: "",
  customer_address: "",
  source: "",
  linked_company: "",
  bypass_validation: "False",
};

const ContactsPage = () => {
  const { selectedCompany } = useSelectCompany();
  const [openModalAddCompany, setOpenModalAddCompany] = useState(false);
  const [activeState, setActiveState] = useState(1);
  const [selectedContractId, setSelectedContractId] = useState("");
  const [openModalEdit, setOpenModalEdit] = useState(false);

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openEditAlert, setOpenEditAlert] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchData, setFetchData] = useState(false);

  const [contactsTableData, setContactsTableData] =
    useState<CRMContactsResponse>();
  const [addContactFormData, setAddContactFormData] =
    useState<DefaultFormData>(DEFAULT_DATA);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, seIsLoading] = useState(false);
  const analytics = useJune();
  const [search, setSearch] = useState("")
  const timeoutRef = useRef<any>(null);
  const [openResponseError, setOpenResponseError] = useState(false);
  const [responseErrors, setResponseError] = useState<string[]>([]);

  const { setDefault } = useUser();

  useEffect(() => {
    if (activeState > 1) setActiveState(activeState + 1);
  }, [selectedCompany]);

  useEffect(() => {
    fetchContacts(search);
  }, [page, openSuccess, fetchData]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!addContactFormData.contact_name)
      newErrors.contact_name = "Contract Name is required";
    if (!addContactFormData.customer_email) {
      newErrors.customer_email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(addContactFormData.customer_email)) {
        newErrors.customer_email = "Invalid email format";
      }
    }
    if (!addContactFormData.source) newErrors.source = "Source is required";
    if (!addContactFormData.customer_address)
      newErrors.customer_address = "Customer Address is required";
    const phoneRegex = /^\d{10}$/;
    if (
      addContactFormData.customer_phone &&
      !phoneRegex.test(unformatPhoneNumber(addContactFormData.customer_phone))
    ) {
      newErrors.customer_phone = "Phone number must be exactly 10 digits.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchContacts = useCallback(async (searchValue?: string) => {
    try {
      const response = await getCRMContacts(+page, searchValue);
      analytics?.track("getCRMContacts");
      setContactsTableData(response);
      setTotalPages(Math.ceil(response?.count / size));
    } catch (e) {
      console.error("Error fetching call list:", e);
    }
  }, [page, openSuccess]);

  const handleSearchChange = useCallback((searchValue: string) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      fetchContacts(searchValue)
    }, 2000);
    setSearch(searchValue)
  }, [])

  const getContractDetails = async (id: string) => {
    try {
      const response = await getContactById(id);
      analytics?.track("getContactById");

      if (response) {
        const {
          contact_name,
          customer_email,
          customer_phone,
          customer_address,
          source,
        } = response;
        setAddContactFormData({
          contact_name,
          customer_email,
          customer_address,
          source,
          customer_phone: customer_phone ? customer_phone.substring(2) : "",
          bypass_validation: "False",
        });
        setErrors({});
        setOpenModalEdit(true);
      }
    } catch (e) {
      throw e;
    }
  };

  const handleSubmit = async () => {
    let linkedCompany;
    let contactResponse;
    try {
      seIsLoading(true);
      if (selectedCompany) {
        if ("id" in selectedCompany) {
          linkedCompany = selectedCompany.id;
          try {
            await addContact({
              ...addContactFormData,
              customer_phone: formatPhoneNum(addContactFormData?.customer_phone),
              linked_company: linkedCompany,
            });
            analytics?.track("addContact");
            setOpenSuccess(true);
          } catch (error: any) {
            let errorMessages = [];

            for (const field in error.response.data) {
              errorMessages.push(...error.response.data[field]);

            }
            setResponseError(errorMessages);
            setOpenResponseError(true)
            throw error;
          }
        } else {
          try {
            contactResponse = await addCompany({
              ...selectedCompany,
              phone: formatPhoneNum(selectedCompany?.phone),
            });
            analytics?.track("addCompany");

            linkedCompany = contactResponse.id;
          } catch (e) {
            throw e;
          }
          try {
            await addContact({
              ...addContactFormData,
              customer_phone: formatPhoneNum(addContactFormData?.customer_phone),
              linked_company: linkedCompany,
            });
            analytics?.track("addContact");
          } catch (error: any) {
            let errorMessages = [];

            for (const field in error.response.data) {
              errorMessages.push(...error.response.data[field]);

            }
            setResponseError(errorMessages);
            setOpenResponseError(true);
            throw error;
          }
        }
      } else {
        try {
          await addContact({
            ...addContactFormData,
            customer_phone: formatPhoneNum(addContactFormData?.customer_phone),
          });
          analytics?.track("addContact");
        } catch (error: any) {
          let errorMessages = [];

          for (const field in error.response.data) {
            errorMessages.push(...error.response.data[field]);

          }
          setResponseError(errorMessages);
          setOpenResponseError(true)
          throw error;
        }
      }
    } catch (error) {

    } finally {
      seIsLoading(false);
    }

  };

  const handleEditSubmit = async () => {
    if (!validate()) return;
    try {
      setResponseError([]);
      seIsLoading(true);
      const editData: any = {
        ...addContactFormData,
        customer_phone: formatPhoneNum(addContactFormData?.customer_phone),
      };
      await editContactById(selectedContractId, editData);
      analytics?.track("editContactById");
      setFetchData((e: boolean) => !e);
      setOpenEditAlert(true);
    } catch (error: any) {
      console.log("🚀 ~ handleEditSubmit ~ error:", error)
      let errorMessages = [];

      if (error?.response?.data && typeof error?.response?.data === 'object') {
        for (const field in error?.response?.data) {
          errorMessages.push(...error?.response?.data[field]);
        }
        setResponseError(errorMessages);
        setOpenResponseError(true)
      } else {
        setResponseError(["Somthing went wrong on edit Customers"]);
        setOpenResponseError(true)
      }

      throw error;
    } finally {
      setSelectedContractId("");
      seIsLoading(false);
      setOpenModalEdit(false);
    }
  };

  const modalSteps: ModalStep[] = [
    {
      stepName: "Add Customer",
      description: "Please enter the Customer details below",
      canSkip: false,
      page: (
        <NewContactForm
          addContactFormData={addContactFormData}
          setAddContactFormData={setAddContactFormData}
          errors={errors}
        />
      ),
    },
    {
      stepName: "Link a Company",
      description:
        'You can create or select a company below, or click "Skip" in the bottom right to proceed without linking a company.',
      canSkip: true,
      page: <CompaniesSubPage />,
    },
    {
      stepName: "Confirmation",
      description: "Confirmation new Customer information",
      canSkip: false,
      page: (
        <>
          <div className="container mx-auto px-4">
            <div className="p-4">
              <h1 className="text-sm sm:text-md font-semibold">NEW CUSTOMER</h1>
              <div className="mt-2 px-6 py-4 border rounded-md">
                {Object.entries(addContactFormData).map(
                  ([key, value]) =>
                    key !== "linked_company" && (
                      <p
                        key={key}
                        className="text-sm font-semibold text-gray-500"
                      >
                        {key.charAt(0).toUpperCase() +
                          key.slice(1).replace("_", " ")}
                        : {value}
                      </p>
                    )
                )}
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 my-6">
            {selectedCompany ? (
              "id" in selectedCompany ? (
                <div className="p-4 rounded-lg">
                  <h1 className="text-sm sm:text-md font-semibold">
                    LINKED COMPANY
                  </h1>
                  <div className="mt-2 px-6 py-4 border rounded-md shadow-small">
                    <p className="text-sm">
                      <strong>Customer Name:</strong>{" "}
                      {(selectedCompany as CRMCompany)?.name}
                    </p>
                    <p className="text-sm">
                      <strong>Email:</strong>{" "}
                      {(selectedCompany as CRMCompany)?.email}
                    </p>
                    <p className="text-sm">
                      <strong>Created At:</strong>{" "}
                      {new Date(selectedCompany?.created_at)?.toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      <strong>Added By:</strong>{" "}
                      {(selectedCompany as CRMCompany)?.added_by?.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-primary-surface p-4 rounded-lg shadow-small">
                  <h1 className="text-lg font-bold text-white">
                    Link New Company
                  </h1>
                  <p className="text-sm text-neutral-10">
                    <strong>Name:</strong> {(selectedCompany as any)?.name}
                  </p>
                  <p className="text-sm text-neutral-10">
                    <strong>Email:</strong> {(selectedCompany as any)?.email}
                  </p>
                  <p className="text-sm text-neutral-10">
                    <strong>Phone:</strong> {(selectedCompany as any)?.phone}
                  </p>
                  <p className="text-sm text-neutral-10">
                    <strong>Address:</strong> {(selectedCompany as any)?.address}
                  </p>
                  <p className="text-sm text-neutral-10">
                    <strong>Website:</strong>{" "}
                    <a
                      href={(selectedCompany as any).website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-hover underline"
                    >
                      {(selectedCompany as any)?.website}
                    </a>
                  </p>
                  <p className="text-sm text-neutral-10">
                    <strong>Industry:</strong>{" "}
                    {(selectedCompany as any)?.industry}
                  </p>
                  <p className="text-sm text-neutral-10">
                    <strong>Number of Employees:</strong>{" "}
                    {(selectedCompany as any)?.numberOfEmployees}
                  </p>
                </div>
              )
            ) : (
              <p className="font-semibold text-center text-sm sm:text-md text-neutral-50">
                No Company Linked
              </p>
            )}
          </div>
        </>
      ),
    },
  ];

  const tableConfig = {
    tableName: "Customers",
    page,
    totalPages,
    handlePageChange: (page: number) => {
      setPage(page);
      setFetchData(true);
    },
    search,
    handleSearchChange,
    pageUrl: "/crm/contacts",
    columns: {
      name: { path: "contact_name", header: "Name", type: "string" },
      email: { path: "customer_email", header: "Email", type: "string" },
      created_at: { path: "createdAt", header: "Created At", type: "date" },
      addedBy: { path: "added_by.name", header: "Added By", type: "string" },
    },
    hasNavigation: true,
    actionsColumn: (item: any) => [
      <Button
        key={`select-contact-${item.id}`}
        size="md"
        variant="default-bg"
        className="mr-4 !w-11"
        onClick={(e: any) => {
          e.stopPropagation();
          getContractDetails(item.id);
          setSelectedContractId(item?.id);
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
    ],
    addAction: () => {
      setErrors({});
      setAddContactFormData(DEFAULT_DATA);
      setActiveState(1);
      setOpenModalAddCompany(true);
    },
    modals: [
      {
        title: "Add Customers",
        className: "max-w-4xl",
        open: openModalAddCompany,
        setOpen: setOpenModalAddCompany,
        modalChild: (
          <>
            <main className="my-10 flex flex-col items-center justify-center gap-10">
              <nav className="relative w-fit">
                <div className="absolute left-1/2 top-5 -z-10 h-0.5 w-10/12 -translate-x-1/2 bg-neutral-40"></div>
                <section className="flex items-center justify-center gap-20 max-smx:gap-10 max-sm:gap-4">
                  {modalSteps.map((step, key) => (
                    <div className="flex flex-col items-center gap-2" key={key}>
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border ${activeState > key
                          ? "border-primary-border bg-primary-main"
                          : "border-neutral-50 bg-neutral-50"
                          } text-xl sm:text-body-xl font-semibold text-white `}
                      >
                        {activeState > 0 && activeState <= key + 1 && key + 1}

                        {activeState > key + 1 && (
                          <CheckIcon className="h-6 w-6 text-white" />
                        )}
                      </span>

                      <h5 className="text-xs font-semibold text-neutral-50 max-sm:text-[10px] text-nowrap">
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

            <footer className="flex justify-end gap-3 mt-4">
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
                      if (activeState === 1 && !validate()) return;
                      setActiveState(activeState + 1);
                    }
                  } else {
                    await handleSubmit();
                    setActiveState(1);
                    setOpenModalAddCompany(false);
                    
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
        title: "Edit Customers",
        className: "max-w-4xl",
        open: openModalEdit,
        setOpen: setOpenModalEdit,
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
                onClick={() => setOpenModalEdit(false)}
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
    ],
    alerts: [
      <Alerts
        key="alert-contact-added"
        variant="success"
        open={openSuccess}
        setOpen={setOpenSuccess}
        title="Customer has been added"
        desc="Customer has been added, You can manage this company or add additional information as needed."
      />,
      <Alerts
        key="alert-contact-error"
        variant="success"
        open={openResponseError}
        setOpen={setOpenResponseError}
        title="Error"
        desc={responseErrors}
      />,
      <Alerts
        key="alert-contact-edited"
        variant="success"
        open={openEditAlert}
        setOpen={setOpenEditAlert}
        title="Customer has been edited"
        desc="Customer has been edited, Review the changes and manage additional information as needed."
      />
    ],
  };
  return (
    contactsTableData && (
      <UI8Table data={contactsTableData.results as any} config={tableConfig} />
    )
  );
};

export default ContactsPage;
