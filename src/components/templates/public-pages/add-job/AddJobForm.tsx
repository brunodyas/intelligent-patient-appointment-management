import { Input } from "@/components/atomics";
import FormSelect from "@/components/atomics/FormSelect";
import {  PUBLIC_PIPELINE_OPTIONS } from "@/constants/formSelect";
import { DefaultFormData } from "@/interface/contacts";

type Props = {
  setFormData: (val: any) => void;
  setContactData: (val: any) => void
  formData: Record<string, any>;
  contactData: DefaultFormData
  errors: { [key: string]: string }
};

const AddJobForm = ({ setFormData, formData, contactData, setContactData, errors }: Props) => {
  
  const handleChangeContact = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setContactData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "contact_name") {
      setFormData((prevState: any) => ({
        ...prevState,
        job_name: value
      }))
    }
  };

  const handleChangeSelect = (name: string, value: string) => {
    setFormData((prevState: Record<string, any>) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="grid w-full grid-cols-2 max-smx:grid-cols-1 gap-6 mb-6">
      <Input
        id="contact_name"
        variant="default"
        label="Full Name"
        placeholder="John Smith"
        handleChange={handleChangeContact}
        isRequired={true}
        defaultValue={contactData.contact_name}
      />

      <FormSelect
        onChange={handleChangeSelect}
        name="pipeline"
        label="Type of Service"
        datas={PUBLIC_PIPELINE_OPTIONS}
        selectedNow={false}
        defaultSelected={formData.pipeline}
      />

      <Input
        type="address"
        id="customer_address"
        variant="default"
        label="Street Address"
        placeholder="123 Main St, City, State, ZIP"
        defaultValue={contactData.customer_address}
        handleChange={handleChangeContact}
        isRequired={true}
        disabled={false}
      />

      <div>
        <Input
          id="customer_email"
          variant="default"
          label="Email"
          placeholder="example@gmail.com"
          handleChange={handleChangeContact}
          isRequired={true}
          defaultValue={contactData.customer_email}
        />
        {errors.customer_email && (
          <span className="text-red-500 text-xs">{errors.customer_email}</span>
        )}
      </div>

      <div>
        <Input
          id="customer_phone"
          variant="phone"
          label="Phone Number"
          placeholder="1234567890"
          handleChange={handleChangeContact}
          isRequired={true}
          value={contactData.customer_phone}
        />
        {errors.customer_phone && (
          <span className="text-red-500 text-xs">{errors.customer_phone}</span>
        )}
      </div>
    </div>
  );
};

export default AddJobForm;