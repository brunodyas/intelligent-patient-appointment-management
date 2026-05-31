"use client";
import { CRMCompanyByIdResponse } from "@/interface/companies";
import {
  addCompanyNote,
  getCompanyById,
  getCompanyNotesById,
} from "@/services/companies";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Button } from "@/components/atomics";
import { formatDateForFranchiseUser } from "@/utils/formatDate";
import Activities from "@/components/pages/Activity";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import DocumentsTable from "@/components/pages/DocumentsTable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@relume_io/relume-ui";
import Notes from "@/components/templates/crm/notes/notes";
import { Note } from "@/interface/contacts";
import Route from "@/components/atomics/Route";
import ListJobView from "@/components/templates/crm/jobs/ListView";
import { useJune } from "@/hooks/useJune";
import { formatPhoneNumber } from "@/utils/formatPhoneForCall";

const CompanyDetails = () => {
  const { companyId } = useParams<{ companyId: string }>() ?? {companyId: ''};
  const [company, setCompany] = useState<CRMCompanyByIdResponse>();
  const [notes, setNotes] = useState<Note[]>([]);
  const analytics = useJune();

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCompanyById(companyId);
        analytics?.track("getCompanyById");
        const notes = await getCompanyNotesById(companyId);
        analytics?.track("getCompanyNotesById");
        setNotes(notes);
        setCompany(response);
      } catch (e) {
        throw e;
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (note: string) => {
    try {
      const noteResponse = await addCompanyNote(+companyId, note);
      analytics?.track("addCompanyNote");
      setNotes([...notes, noteResponse]);
    } catch (error) {
      console.error(error);
    }
  };

  const detailFields: {
    fieldName: string;
    fieldValue?: string | any;
  }[] = [
      {
        fieldName: "Company",
        fieldValue: company?.name,
      },
      {
        fieldName: "Added By",
        fieldValue: company?.added_by?.name,
      },
      {
        fieldName: "Created At",
        fieldValue: formatDateForFranchiseUser(company?.created_at as any),
      },
      {
        fieldName: "Recent Notes",
        fieldValue: "Test",
      },
      {
        fieldName: "Address",
        fieldValue: company?.address,
      },
      {
        fieldName: "Phone Number",
        fieldValue: company?.phone && formatPhoneNumber(company?.phone, true) ,
      },
      {
        fieldName: "Website",
        fieldValue: <a href={company?.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-main underline"  >
          {company?.website ? company?.website : "-"}
        </a>,
      },
    ];
  const categories = [
    {
      name: "Details",
      page: (
        <div>
          <div className="border rounded-md w-3/4 max-md:w-11/12 m-auto shadow-small">
            <p className="mt-5 mx-5 font-semibold text-lg sm:text-xl">
              Details
            </p>
            <div className="grid gap-4 grid-cols-2 py-5 px-8 max-smx:grid-cols-1 max-smx:px-5">
              {company &&
                detailFields.map(({ fieldName, fieldValue }) => (
                  <div className="py-4 flex" key={fieldName}>
                    <p className="text-[#333333b3] mr-5 flex-shrink-0 text-sm">
                      {fieldName}
                    </p>
                    <p className="w-3/4 break-words text-sm">{fieldValue}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Jobs",
      page: <ListJobView filterType="company" filterId={companyId} />,
    },
    {
      name: "Activities",
      page: <Activities filterType="company" filterId={companyId} />,
    },
    {
      name: "Documents",
      page: <DocumentsTable filterType="company" filterId={companyId} />,
    },
    {
      name: "Notes",
      page: <Notes handleSubmit={handleSubmit} notes={notes} />,
    },
  ];

  return (
    <div className="h-screen w-full justify-center pt-10">
      <div className="flex justify-between items-center max-smx:px-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Route
                route={routes.crmCompanies}
                linkClassName="text-neutral-500 hover:cursor-pointer"
              >
                Companies
              </Route>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[#707070]" />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-neutral-black font-medium cursor-auto">
                {company?.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button size="md" variant="primary-bg">
          <Route route={routes.crmCompanies} linkClassName="">
            Back
          </Route>
        </Button>
      </div>

      <div className="w-full">
        <TabGroup className="w-full">
          <TabList className="flex gap-4 justify-center flex-wrap">
            {categories.map(({ name }) => (
              <Tab
                key={name}
                className="text-primary-main rounded-lg py-1 px-3 text-sm/6 font-semibold focus:outline-none data-[selected]:bg-primary-surface data-[hover]:bg-primary-highlight data-[selected]:data-[hover]:bg-primary-surface data-[focus]:outline-primary-main data-[focus]:outline-black !h-10"
              >
                {name}
              </Tab>
            ))}
          </TabList>
          <TabPanels className="mt-3">
            {categories.map(({ name, page }) => (
              <TabPanel
                key={name}
                className="rounded-xl bg-white/5 p-3 max-sm:p-0"
              >
                {page}
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
};

export default CompanyDetails;
