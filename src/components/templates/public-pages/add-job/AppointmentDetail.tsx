import { DefaultFormData } from "@/interface/contacts";
import { NewJob } from "@/interface/jobs";

type Props = {
  job: NewJob;
  contact?: DefaultFormData;
};

const AppointmentDetails: React.FC<Props> = ({ job, contact }) => {

  const appointmentDate = new Date(job.consultation_date  + "T" + job.start_time)

  const appointmentData = {
    "Name": contact?.contact_name,
    "Email": contact?.customer_email,
    "Phone": `+1 ${contact?.customer_phone}`,
    "Address": contact?.customer_address,
    "Appointment Type": job.pipeline.at(0) + job.pipeline.slice(1).toLowerCase(),
    "Appointment Date": appointmentDate.toLocaleString() !== "Invalid Date" ? appointmentDate.toLocaleString() : null,
  };
  
  const renderDetails = (details: Record<string, any>) => {
    return Object.entries(details).map(([label, value]) => {
      if (value !== undefined && value !== null) {
        return (
          value.length ?
          <div key={label} className="mb-4">
            <p className="text-sm">{label}</p>
            <p className="font-semibold">{value}</p>
          </div>
          : ""
        );
      }
      return null;
    });
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 w-full m-auto items-center">
        {renderDetails(appointmentData)}
      </div>
    </div>
  );
};

export default AppointmentDetails;
