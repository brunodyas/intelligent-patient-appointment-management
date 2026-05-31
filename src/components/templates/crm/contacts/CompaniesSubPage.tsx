import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  NewCompany,
  CRMCompaniesResponse,
} from "@/interface/companies";
import { getCRMCompanies } from "@/services/companies";
import { useSelectCompany } from "@/context/selectCompany";
import { Button, Input } from "../../../atomics";
import UI8Table from "../../../UI8Table";
import { CheckIcon } from "@/assets/icons";
import { size } from "@/constants/constants";
import { formatURL } from "@/utils/formatHelper";
import { useJune } from "@/hooks/useJune";

type ModalStep = {
  stepName: string;
  description: string;
  page: ReactNode;
  canSkip: boolean;
  nextAction?: () => void;
};

const CompaniesSubPage = () => {
  const [openModalAddCompany, setOpenModalAddCompany] = useState(false);
  const [companyTableData, setCompanyTableData] =
    useState<CRMCompaniesResponse>();
  const { setSelectedCompany } = useSelectCompany();
  const [activeState, setActiveState] = useState(1);
  const [addCompanyFormData, setAddCompanyFormData] = useState<NewCompany>({
    name: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    industry: "",
    numberOfEmployees: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchData, setFetchData] = useState(false);
  const analytics = useJune();
  const [search, setSearch] = useState("")
  const timeoutRef = useRef<any>(null);
  
  const fetchCompanies = useCallback(async (searchValue: string) => {
    try {
      const response = await getCRMCompanies(+page, searchValue);
      analytics?.track("getCRMCompanies");
      setCompanyTableData(response);
      setTotalPages(Math.ceil(response?.count / size));
    } catch (e) {
      console.error("Error fetching call list:", e);
    }
    setFetchData(false);
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
    setPage(1)
  }, [search])

  useEffect(() => {
    fetchCompanies(search);
  }, [page]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAddCompanyFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    setSelectedCompany({
      ...addCompanyFormData,
      phone: addCompanyFormData?.phone,
      website: addCompanyFormData.website
        ? formatURL(addCompanyFormData.website)
        : "",
    });
  };

  const isCompanyFormValid = useMemo(
    () => addCompanyFormData.name,
    [addCompanyFormData]
  );
  const modalSteps: ModalStep[] = [
    {
      stepName: "Add Company",
      description: "Please enter the company details below",
      canSkip: false,
      page: (
        <div className="grid w-full grid-cols-2 gap-6">
          <Input
            id="name"
            variant="default"
            label="Name"
            placeholder="Enter Name"
            handleChange={handleChange}
            isRequired
          />
          <Input
            id="email"
            variant="default"
            label="Email"
            placeholder="Enter email"
            handleChange={handleChange}
          />
          <Input
            id="phone"
            variant="phone"
            label="Phone"
            placeholder="Enter phone number"
            handleChange={handleChange}
          />
          <Input
            type="address"
            id="address"
            variant="default"
            label="Address"
            placeholder="Enter Full Address"
            handleChange={handleChange}
            isRequired={true}
            disabled={false}
          />
          <Input
            id="website"
            variant="default"
            label="Website"
            placeholder="Enter Website"
            handleChange={handleChange}
          />
          <Input
            id="industry"
            variant="default"
            label="Industry"
            placeholder="Enter Industry"
            handleChange={handleChange}
          />

          <Input
            id="numberOfEmployees"
            type="number"
            variant="default"
            label="Number of Employees"
            value={addCompanyFormData.numberOfEmployees}
            placeholder="1, 2, 3..."
            handleChange={handleChange}
          />
        </div>
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

    actionsColumn: (item: any) => [
      // Changed to a function
      <Button
        className="!py-[14px]"
        key={`select-company-${item.id}`}
        variant="default-outline"
        onClick={(e: any) => {
          e.stopPropagation();
          setSelectedCompany(item);
          setOpenModalAddCompany(false);
        }}
      >
        Select
      </Button>,
    ],
    addAction: () => setOpenModalAddCompany(true),
    modals: [
      {
        title: "Add Company",
        className: "max-w-4xl h-full flex flex-col",
        open: openModalAddCompany,
        setOpen: setOpenModalAddCompany,
        modalChild: (
          <>
            <main className="my-10 flex flex-col items-center justify-center gap-10 flex-grow">
              <nav className="relative w-fit">
                <div className="absolute left-1/2 top-5 -z-10 h-0.5 w-10/12 -translate-x-1/2 bg-neutral-40"></div>
                <section className="flex items-center justify-center gap-20">
                  {modalSteps.map((step, key) => (
                    <div className="flex flex-col items-center gap-2" key={key}>
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                          activeState > key
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
                  !isCompanyFormValid ? "disabled-outline" : "primary-bg"
                }
                disabled={!isCompanyFormValid}
                onClick={() => {
                  if (activeState < modalSteps.length) {
                    if (openModalAddCompany === false) {
                      setActiveState(1);
                    } else {
                      setActiveState(activeState + 1);
                    }
                  } else {
                    setActiveState(1);
                    setOpenModalAddCompany(false);
                    handleSubmit();
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
    ],
  };
  return (
    <div className="w-full min-h-[38.5vh]">
      {companyTableData && (
        <UI8Table data={companyTableData.results as any} config={tableConfig} />
      )}
    </div>
  );
};

export default CompaniesSubPage;
