"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCRMContacts } from "@/services/contacts";
import { CRMContactsResponse } from "@/interface/contacts";
import { Button, Checkbox, Input, Selectbox } from "@/components/atomics";
import UI8Table from "@/components/UI8Table";
import CompaniesSubPage from "@/components/templates/crm/contacts/CompaniesSubPage";
import { useSelectCompany } from "@/context/selectCompany";
import { CheckIcon } from "@/assets/icons";
import { ModalStep } from "@/types";
import FormSelect from "@/components/atomics/FormSelect";
import { useSelectContact } from "@/context/selectContact";
import { size } from "@/constants/constants";
import { formatPhoneNum, formatURL } from "@/utils/formatHelper";
import { SOURCES } from "@/constants/formSelect";
import CompanyMinForm from "./CompanyMinForm";
import { NewCompany } from "@/interface/companies";
import { Text } from "@relume_io/relume-ui";
import { useJune } from "@/hooks/useJune";

type Props = {
  idSelect?: string;
};

const sourceData = [{ label: "CRM", value: "CRM", disabled: false }];

const ContactsSubPage = ({ idSelect }: Props) => {
  const { selectedCompany, setSkipCompany, setSelectedCompany } =
    useSelectCompany();
  const { setSelectedContact } = useSelectContact();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openModalAddCompany, setOpenModalAddCompany] = useState(false);
  const [activeState, setActiveState] = useState(1);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const [linkCompanySelected, setLinkCompanySelected] = useState(false);
  const [useSameInfoSelected, setUseSameInfoSelected] = useState(false);
  const [addCompanyMinFormData, setAddCompanyMinFormData] = useState({
    website: "",
    industry: "",
    numberOfEmployees: "",
  });

  const [contactsTableData, setContactsTableData] =
    useState<CRMContactsResponse>();
  const [fetchData, setFetchData] = useState(false);
  const [addContactFormData, setAddContactFormData] = useState({
    contact_name: "",
    customer_email: "",
    phone: "",
    customer_address: "",
    source: "CRM",
  });
  const [search, setSearch] = useState("")
  const timeoutRef = useRef<any>(null);
  const analytics = useJune();

  const fetchContacts = useCallback(async (searchValue?:string) => {
    try {
      const response = await getCRMContacts(+page,searchValue);
      analytics?.track("getCRMContacts");
      setContactsTableData(response);
      setTotalPages(Math.ceil(response?.count / size));
    } catch (e) {
      throw e;
    }
    setFetchData(false);
  }, [page]);

  useEffect(() => {
    fetchContacts(search);
  }, [page]);

  useEffect(() => {
    if (!linkCompanySelected) {
      if (useSameInfoSelected) setUseSameInfoSelected(false);
    }
  }, [linkCompanySelected]);

  const isContactFormValid = useMemo(() => {
    return (
      addContactFormData.contact_name &&
      addContactFormData.customer_email &&
      addContactFormData.customer_address &&
      addContactFormData.source
    );
  }, [addContactFormData]);

  const handleSearchChange = useCallback((searchValue: string) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchContacts(searchValue)
    }, 2000);
    setSearch(searchValue)
  }, [])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAddContactFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChangeAddCompany = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setAddCompanyMinFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChangeSelect = (_:string, value: string) => {
    setAddContactFormData((prevState) => ({
      ...prevState,
      source: value,
    }));
  };

  const handleSubmit = () => {
    setSelectedContact({
      ...addContactFormData,
      phone: addContactFormData?.phone,
      linked_company: selectedCompany,
    });

    if (useSameInfoSelected) {
      const { contact_name, customer_address, customer_email, phone } =
        addContactFormData;
        const updatedCompanyMinFormData = {
          ...addCompanyMinFormData, 
          website: addCompanyMinFormData.website
        ? formatURL(addCompanyMinFormData.website)
        : "",
        };
      setSelectedCompany({
        name: contact_name,
        address: customer_address,
        email: customer_email,
        phone,
        ...updatedCompanyMinFormData,
      });
    }
  };

  let modalSteps: ModalStep[] = [
    {
      stepName: "Enter Information",
      description: "enter information description",
      canSkip: false,
      page: (
        <>
          <div className="grid w-full grid-cols-2 gap-6 max-smx:grid-cols-1">
            <Input
              id="contact_name"
              variant="default"
              label="Name"
              placeholder="Enter Name"
              handleChange={handleChange}
              value={addContactFormData.contact_name}
              isRequired
            />
            <Input
              id="customer_email"
              variant="default"
              label="Email"
              placeholder="Enter email"
              handleChange={handleChange}
              value={addContactFormData.customer_email}
              isRequired
            />
            <Input
              id="phone"
              variant="phone"
              label="Phone"
              placeholder="Enter phone number"
              handleChange={handleChange}
              value={addContactFormData.phone}
            />
            <Input
              type="address"
              id="customer_address"
              variant="default"
              label="Address"
              placeholder="Enter Adddress"
              handleChange={handleChange}
              value={addContactFormData.customer_address}
              defaultValue={addContactFormData.customer_address}
              isRequired={true}
              disabled={false}
            />
            <FormSelect
              defaultSelected={addContactFormData?.source || ""}
              onChange={handleChangeSelect}
              label="Source"
              name="source"
              datas={SOURCES}
              selectedNow={false}
            />{" "}
          </div>
          <div className="w-full">
            <div className="grid grid-cols-2 gap-4 max-smx:grid-cols-1">
              <div className="flex items-center gap-1">
                <Checkbox
                  active={linkCompanySelected}
                  setActive={setLinkCompanySelected}
                />
                <p className="leading-none">Link this customer to a company?</p>
              </div>
              {linkCompanySelected && (
                <div className="flex items-center gap-1">
                  <Checkbox
                    active={useSameInfoSelected}
                    setActive={setUseSameInfoSelected}
                  />
                  <p className="text-sm leading-none">Use the same customer information for the linked company?</p>
                </div>
              )}
            </div>
            {useSameInfoSelected && (
              <CompanyMinForm handleChange={handleChangeAddCompany} />
            )}
          </div>
        </>
      ),
    },
    {
      stepName: "Link a Company",
      description:
        "You can create or select a company below, Skip to proceed without linking a company.",
      canSkip: true,
      page: <CompaniesSubPage />,
    },
  ];

  const tableConfig = {
    tableName: "Customers",
    page,
    totalPages,
    search,
    handleSearchChange,
    handlePageChange: (page: number) => {
      setPage(page);
      setFetchData(true);
    },
    columns: {
      name: { path: "contact_name", header: "Name", type: "string" },
      email: { path: "customer_email", header: "Email", type: "string" },
      created_at: { path: "createdAt", header: "Created At", type: "date" },
      addedBy: { path: "added_by.name", header: "Added By", type: "string" },
    },
    hasNavigation: false,
    _actionsColumn: (item: any) => [
      <Button
        className="!py-[14px]"
        key={`select-company-${item.id}`}
        variant={item.id == idSelect ? "tab-selected" : "tab-unselect"}
        onClick={() => {
          setSelectedContact(item);
          setSelectedCompany(undefined);
          setSkipCompany(true);
        }}
      >
        <Text className="w-18">
          {item.id == idSelect ? "Selected" : "Select"}
        </Text>
      </Button>,
    ],
    get actionsColumn() {
      return this._actionsColumn;
    },
    set actionsColumn(value) {
      this._actionsColumn = value;
    },
    addAction: () => setOpenModalAddCompany(true),
    modals: [
      {
        title: "Add Customers",
        className: "max-w-4xl h-full flex flex-col",
        open: openModalAddCompany,
        setOpen: setOpenModalAddCompany,
        modalChild: (
          <>
            <main className="my-10 flex flex-col items-center justify-center gap-10 flex-grow">
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
                variant={
                  !isContactFormValid ? "disabled-outline" : "primary-bg"
                }
                disabled={!isContactFormValid}
                onClick={async () => {
                  setSelectedContact({ ...addContactFormData });
                  if (modalSteps[activeState - 1]?.canSkip) {
                    setSkipCompany(true);
                    setOpenModalAddCompany(false);
                  } else if (
                    activeState >= modalSteps.length ||
                    useSameInfoSelected
                  ) {
                    handleSubmit();
                    setActiveState(1);
                    setOpenModalAddCompany(false);
                  } else {
                    if (openModalAddCompany === false) {
                      setActiveState(1);
                    } else {
                      setActiveState(activeState + 1);
                    }
                  }
                }}
              >
                {modalSteps[activeState - 1]?.canSkip
                  ? "Skip"
                  : activeState === modalSteps.length || useSameInfoSelected
                    ? "Submit"
                    : "Next"}
              </Button>
            </footer>
          </>
        ),
      },
      {
        title: "Delete Company",
        className: "max-w-lg",
        // hasSteps: false,
        open: openModalDelete,
        setOpen: setOpenModalDelete,
        modalChild: (
          <>
            <main className="mb-10 mt-4">
              <p className="text-sm text-neutral-80">
                Are you sure you want to delete this customer? Deleted Customers
                cannot be recovered.
              </p>
            </main>
            <footer className="flex w-full justify-end gap-3">
              <Button
                className="!h-10"
                size="md"
                variant="default-nude"
                onClick={() => setOpenModalDelete(false)}
              >
                Cancel
              </Button>
              <Button
                className="!h-10"
                size="md"
                variant="error-bg"
                onClick={() => {
                  setOpenModalDelete(false);
                }}
              >
                Submit
              </Button>
            </footer>
          </>
        ),
      },
    ],
  };
  return (
    contactsTableData && (
      <div className="w-full overflow-x-scroll">
        <UI8Table
          data={contactsTableData.results as any}
          config={tableConfig}
        />
      </div>
    )
  );
};

export default ContactsSubPage;
