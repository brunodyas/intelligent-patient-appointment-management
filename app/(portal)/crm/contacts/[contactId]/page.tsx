"use client";

import { CRMContactByIdResponse, Note } from "@/interface/contacts";
import {
  addContactNote,
  getContactById,
  getContactNotesById,
} from "@/services/contacts";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Button } from "@/components/atomics";
import formatDate from "@/utils/formatDate";
import ActivitiesTable from "@/components/pages/Activity";
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
import Route from "@/components/atomics/Route";
import ListJobView from "@/components/templates/crm/jobs/ListView";
import { useJune } from "@/hooks/useJune";
import QuotesList from "@/components/templates/crm/contacts/QuotesList";
import InvoicesList from "@/components/templates/crm/contacts/InvoicesList";
import { formatPhoneNumber } from "@/utils/formatPhoneForCall";

const ContactDetails = () => {
  const { contactId } = useParams<{ contactId: string }>() ?? {contactId: ''};
  const [contact, setContact] = useState<CRMContactByIdResponse>();
  const [notes, setNotes] = useState<Note[]>([]);
  const analytics = useJune();

  useEffect(() => {
    const fetchContactDetail = async () => {
      try {
        const contactDetails = await getContactById(contactId);
        analytics?.track("getContactById");
        const notes = await getContactNotesById(contactId);
        analytics?.track("getContactNotesById");
        setNotes(notes);
        setContact(contactDetails);
      } catch (error) {
        console.error(error);
      }
    };
    fetchContactDetail();
  }, []);

  const handleSubmit = async (note: string) => {
    try {
      const noteResponse = await addContactNote(+contactId, note);
      analytics?.track("addContactNote");
      setNotes([...notes, noteResponse]);
    } catch (error) {
      console.error(error);
    }
  };

  const detailFields: {
    fieldName: string;
    fieldValue?: string | null;
  }[] = [
      {
        fieldName: "Customer",
        fieldValue: contact?.contact_name,
      },
      {
        fieldName: "Source",
        fieldValue: contact?.source,
      },
      {
        fieldName: "Position",
        fieldValue: contact?.contact_position,
      },
      {
        fieldName: "Added By",
        fieldValue: contact?.added_by?.name,
      },
      {
        fieldName: "Created At",
        fieldValue: formatDate(contact?.createdAt as any),
      },
      {
        fieldName: "Recent Notes",
        fieldValue: "Test",
      },
      {
        fieldName: "Address",
        fieldValue: contact?.customer_address,
      },
      {
        fieldName: "Phone Number",
        fieldValue: contact?.customer_phone && formatPhoneNumber(contact?.customer_phone, true) ,
      }
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
            <div className="grid gap-4 grid-cols-2 py-5 px-8 max-smx:grid-cols-1 max-smx:px-4">
              {contact &&
                detailFields.map(
                  ({ fieldName, fieldValue }) =>
                    fieldValue && (
                      <div className="py-4 flex" key={fieldName}>
                        <p className="text-[#333333b3] mr-5 flex-shrink-0 text-sm">
                          {fieldName}
                        </p>
                        <p className="w-3/4 break-words text-sm">
                          {fieldValue}
                        </p>
                      </div>
                    )
                )}
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Jobs",
      page: <ListJobView filterType="contact" filterId={contactId} />,
    },
    {
      name: "Quotes",
      page: <QuotesList filterId={contactId} />,
    },
    {
      name: "Invoices",
      page: <InvoicesList filterId={contactId} />,
    },
    {
      name: "Calendar",
      page: <ActivitiesTable filterType="contact" filterId={contactId} />,
    },
    {
      name: "Documents",
      page: <DocumentsTable filterType="contact" filterId={contactId} />,
    },
    {
      name: "Notes",
      page: <Notes handleSubmit={handleSubmit} notes={notes} />,
    },
  ];

  return (
    <div className="h-screen w-full justify-center pt-10">
      <div className="flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Route route={routes.crmContacts} linkClassName="text-neutral-500 hover:cursor-pointer">
                Customers
              </Route>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[#707070]" />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-neutral-black font-medium cursor-auto">
                {contact?.contact_name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button size="md" variant="primary-bg" className="!h-10">
          <Route route={routes.crmContacts} linkClassName="">
            Back
          </Route>
        </Button>
      </div>

      <div className="w-full">
        <TabGroup className="w-full">
          <TabList className="flex gap-4 justify-center flex-wrap pt-2">
            {categories.map(({ name }) => (
              <Tab
                key={name}
                className="text-primary-main rounded-lg py-[8px] px-3 text-sm/6 font-semibold focus:outline-none data-[selected]:bg-primary-surface data-[hover]:bg-primary-highlight data-[selected]:data-[hover]:bg-primary-surface data-[focus]:outline-primary-main data-[focus]:outline-black"
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

export default ContactDetails;
