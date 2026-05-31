import React, { ReactNode, useState } from "react";
import { CheckIcon } from "@/assets/icons";
import UI8Table from "@/components/UI8Table";
import { Button, Input } from "@/components/atomics";
import { useSelectCompany } from "@/context/selectCompany";
import { NewCompany } from "@/interface/companies";
import { formatPhoneNum, formatURL } from "@/utils/formatHelper";

type ModalStep = {
  stepName: string;
  description: string;
  page: ReactNode;
  canSkip: boolean;
  nextAction?: () => void;
};

const DocumentLinkJob = () => {
  const [openModalAddCompany, setOpenModalAddCompany] = useState(false);
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
      phone: formatPhoneNum(addCompanyFormData?.phone),
      website: formatURL(addCompanyFormData?.website)
    });
  };

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
            placeholder="Do later"
            handleChange={handleChange}
            isRequired={true}
            disabled={false}
          />
          <Input
            id="website"
            variant="default"
            label="Website"
            placeholder="Do later"
            handleChange={handleChange}
          />
          <Input
            id="industry"
            variant="default"
            label="Industry"
            placeholder="Do later"
            handleChange={handleChange}
          />
          <Input
            id="numberOfEmployees"
            variant="default"
            label="Number of Employees"
            placeholder="Do later"
            handleChange={handleChange}
          />
          <Button variant="default-bg" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      ),
    },
  ];

  const tableConfig = {
    tableName: "Jobs",
    columns: {
      id: { path: "id", header: "ID", type: "string" },
      name: { path: "name", header: "Name", type: "string" },
      email: { path: "email", header: "Email", type: "string" },
      created_at: { path: "created_at", header: "Created At", type: "date" },
      addedBy: { path: "added_by.name", header: "Added By", type: "string" },
    },

    actionsColumn: (item: any) => [
      <Button
        key={`select-company-${item.id}`}
        variant="default-outline"
        onClick={(e: any) => {
          e.stopPropagation();
          setSelectedCompany(item);
        }}
      >
        Select
      </Button>,
    ],
    addAction: () => setOpenModalAddCompany(true),
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
                size="md"
                variant="primary-bg"
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
    disableAddButton: true,
  };
  const tableData = [
    {
      id: "1",
      name: "Test",
      email: "test@getrevscale.com",
      created_at: "05-16-2022",
      added_by: { name: "Michel" },
    },
  ];
  return <UI8Table data={tableData as any} config={tableConfig} />;
};

export default DocumentLinkJob;
