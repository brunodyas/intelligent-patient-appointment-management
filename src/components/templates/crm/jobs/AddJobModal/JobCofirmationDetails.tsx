import { useAuth } from "@/context/auth";
import useUserRoles from "@/hooks/useUserRoles";
import { CRMCompany, NewCompany } from "@/interface/companies";
import { CRMContact, NewContact } from "@/interface/contacts";
import { CRMTech } from "@/interface/jobs";

type NewJob = {
  job_name: string;
  pipeline: string;
  stage: string;
  consultation_date: string;
  start_time: string;
  status: string;
  linked_contact: string;
  customer_description: string;
  bypass_validation: string;
};

type Props = {
  job: NewJob;
  contact?: CRMContact | NewContact;
  company?: CRMCompany | NewCompany | any;
  tech?: CRMTech
};

const JobConfirmationDetails: React.FC<Props> = ({ job, contact, company, tech }) => {
  const { isSuperAdmin, isCustomerCare, isAdmin, isCustomerCareManager } = useUserRoles();

  const jobConfirmDetails = {
    "Job Name": job.job_name,
    "Customer Description": job.customer_description,
    "Pipeline": job.pipeline,
    "Stage": job.stage,
    "Consultation Date": job.consultation_date,
    "Start Time": job.start_time,
    "Status": job.status,
    ...(isSuperAdmin || isCustomerCare || isAdmin || isCustomerCareManager ? {"Bypass Validation": job.bypass_validation} : {})
  };

  const contactDetails = contact
    ? {
        "Name": contact.contact_name,
        "Email": contact.customer_email,
        "Phone": "phone" in contact ? contact.phone : null,
        "Address": "customer_address" in contact ? contact.customer_address : null,
        "Source": "source" in contact ? contact.source : null
      }
    : null;

    const companyDetails =
    company && "name" in company
      ? {
          "Company Name": company.name,
          "Email": company.email,
          "Phone": company.phone,
          "Address": company.address,
          "Website": company.website,
          "Industry": company.industry,
          "Number of Employees": company.numberOfEmployees,
        }
      : company && "contact_name" in company
      ? {
          "Customer Name": company.contact_name,
          "Customer Email": company.customer_email,
          "Created At": company.createdAt,
          "Added By": company.added_by.name,
        }
      : null;

    const techDetails = tech 
    ? {
        "ID": tech.id,
        "Name": tech.name,
        "Photo": tech.photo,
        "Role": tech.role,
        "Vehicle": tech.tech_vehicle,
        "License Plate": tech.tech_license_plate
      }
    : null;

  const renderDetails = (details: Record<string, any>) => {
    return Object.entries(details).map(([label, value]) => {
      if (value !== undefined && value !== null) {
        return (
          value.length ?
          <div key={label} className="mb-4">
            <p className="text-sm">{label}</p>
            <p className="font-semibold text-sm">{value}</p>
          </div>
          : ""
        );
      }
      return null;
    });
  };

  return (
    <div className="w-full bg-gray-50 rounded-md grid grid-cols-2 gap-x-6 gap-y-2">
      <div className="bg-[#f2f2f2] px-4 rounded-md">
        <h2 className="text-md sm:text-lg font-semibold mb-2">Job Details</h2>
        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
          {renderDetails(jobConfirmDetails)}
        </div>
      </div>


      {contact && contactDetails && (
        <div className="bg-[#f2f2f2] p-4 rounded-md">
          <h2 className="text-md sm:text-lg font-semibold mb-2">Customer Details</h2>
          <div className={`grid ${"id" in contact ? "grid-cols-1" : "grid-cols-2 gap-x-2"} gap-y-4`}>
            {renderDetails(contactDetails)}
          </div>
        </div>
      )}

      {company && companyDetails && (
        <div className="bg-[#f2f2f2] p-4 rounded-md">
          <h2 className="text-md sm:text-lg font-semibold mb-2">Company Information</h2>
          <div className={`grid ${"id" in company ? "grid-cols-1" : "grid-cols-2 gap-x-2"} gap-y-4`}>
            {renderDetails(companyDetails)}
          </div>
        </div>
      )}

      {tech && techDetails && (
        <div className="bg-[#f2f2f2] p-4 rounded-md">
          <h2 className="text-md sm:text-lg font-semibold mb-2">Tech Information</h2>
          <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-2">
            {renderDetails(techDetails)}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobConfirmationDetails;
