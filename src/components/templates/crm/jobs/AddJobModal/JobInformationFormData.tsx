import { Button, Checkbox, Input } from "@/components/atomics";
import FormSelect from "@/components/atomics/FormSelect";
import { useAuth } from "@/context/auth";
import useUserRoles from "@/hooks/useUserRoles";
import { DateFormat } from "@/interface/activities";
import moment from "moment";
import { useMemo, useState } from "react";

type Props = {
  setFormData: (val: any) => void;
  formData: Record<string, any>;
};

export const REPAIR_OPTIONS = [
  { label: "New", value: "NEW" },
  { label: "Diagnose", value: "DIAGNOSE" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

export const CONSOLATION_OPTIONS = [
  { label: "New", value: "NEW" },
  { label: "Consultation", value: "CONSULTATION" },
  { label: "Ordered", value: "ORDERED" },
  { label: "Installation", value: "INSTALLATION" },
];
export const PIPELINE_OPTIONS = [
  { label: "Repairs", value: "REPAIRS" },
  { label: "Consultation", value: "CONSULTATION" },
];
export const BYPASS_VALIDATIONS = [
  { label: "True", value: "True" },
  { label: "False", value: "False" },
];
export const STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Failed", value: "FAILED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const JobInformationFormData = ({ setFormData, formData }: Props) => {
  const [stageOptions, setStageOption] = useState(
    formData.pipeline?.includes("CONSULTATION")
      ? CONSOLATION_OPTIONS
      : REPAIR_OPTIONS
  );
  const { user } = useAuth();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevState: Record<string, any>) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleTextAreaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevState: Record<string, any>) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDateChange = (date: DateFormat) => {
    const { year, month, day } = date;
    const newDate = moment(`${year}-${month}-${day}`, "YYYY-M-D").format(
      "YYYY-MM-DD"
    );

    setFormData((prevState: Record<string, any>) => ({
      ...prevState,
      consultation_date: newDate,
    }));
  };

  const handleTimeChange = (time: string) => {
    setFormData((prevState: Record<string, any>) => ({
      ...prevState,
      start_time: time,
    }));
  };

  const handleChangeSelect = (name: string, value: string) => {
    if (name === "pipeline" && value !== formData?.pipeline) {
      if (value.toLowerCase() === "repairs") {
        setStageOption(REPAIR_OPTIONS);
      } else {
        setStageOption(CONSOLATION_OPTIONS);
      }
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        stage: "New",
        [name]: value,
      }));
    } else {
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };
  const { isSuperAdmin, isCustomerCare, isAdmin, isCustomerCareManager } = useUserRoles();


  return (
    <div className="grid w-full grid-cols-2 max-smx:grid-cols-1 gap-6">
      <Input
        id="job_name"
        variant="default"
        label="Job Name"
        placeholder="Enter Job Name"
        handleChange={handleChange}
        isRequired={true}
        defaultValue={formData.job_name}
      />
      <Input
        id="consultationDate"
        variant="default"
        label="Consultation Date"
        placeholder="Enter Consultation"
        handleDateChange={handleDateChange}
        type="date"
        isRequired={true}
        value={formData.consultation_date}
      />

      <Input
        id="consultationTime"
        type="time"
        variant="default"
        label="Consultation Time"
        value={formData.start_time}
        placeholder="Enter start time"
        handleTimeChange={handleTimeChange}
        isRequired
      />

      <Input
        id="consultation_duration"
        type="number"
        variant="default"
        label="Consultation Duration (in minutes)"
        value={formData.consultation_duration}
        placeholder="Enter consultation duration"
        handleChange={handleChange}
        isRequired
      />

      <FormSelect
        onChange={handleChangeSelect}
        name="pipeline"
        label="Pipeline"
        datas={PIPELINE_OPTIONS}
        selectedNow={false}
        defaultSelected={formData.pipeline}
      />

      <FormSelect
        onChange={handleChangeSelect}
        name="stage"
        label="Stage"
        datas={stageOptions}
        selectedNow={false}
        defaultSelected={formData.stage}
      />
      <Input
        type="textarea"
        id="customer_description"
        variant="default"
        label="Reason for Appointment"
        placeholder="Looking for new motorized blinds..."
        handleTextAreaChange={handleTextAreaChange}
        defaultValue={formData.customer_description}
        isRequired={false}
      />
      <FormSelect
        name="status"
        onChange={handleChangeSelect}
        label="Status"
        datas={STATUS_OPTIONS}
        selectedNow={false}
        defaultSelected={formData.status}
      />

      {(isSuperAdmin || isCustomerCare || isAdmin || isCustomerCareManager) && (
        <div className="flex justify-start items-center gap-1">
          <Checkbox
            active={formData.bypass_validation === "True"}
            setActive={() => {
              const isChecked =
                formData.bypass_validation === "True" ? "False" : "True";
              const event = {
                target: { name: "bypass_validation", value: isChecked },
              };
              handleChange(event as React.ChangeEvent<HTMLInputElement>);
            }}
          />
          <p className="text-sm leading-none">Bypass Validation</p>
        </div>
      )}
    </div>
  );
};

export default JobInformationFormData;
