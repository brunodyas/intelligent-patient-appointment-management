import { Input } from '@/components/atomics';
import FormSelect from '@/components/atomics/FormSelect';
import { SOURCES } from '@/constants/formSelect';
import { DefaultFormData } from '@/interface/contacts';
import React from 'react'

type Props = {
  addContactFormData: DefaultFormData;
  setAddContactFormData: (contactFormData: any) => void;
  errors: { [key: string]: string }
}

const NewContactForm = ({ addContactFormData, setAddContactFormData, errors }: Props) => {

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAddContactFormData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChangeSelect = (name: string, value: string) => {
    setAddContactFormData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="grid w-full grid-cols-2 gap-6 max-smx:grid-cols-1">
      <div>
        <Input
          id="contact_name"
          variant="default"
          label="Name"
          placeholder="Enter Name"
          handleChange={handleChange}
          value={addContactFormData.contact_name}
          isRequired
        />
        {errors.contact_name && (
          <span className="text-red-500 text-xs">{errors.contact_name}</span>
        )}
      </div>
      <div>
        <Input
          id="customer_email"
          variant="default"
          label="Email"
          placeholder="Enter email"
          handleChange={handleChange}
          value={addContactFormData.customer_email}
          isRequired
        />
        {errors.customer_email && (
          <span className="text-red-500 text-xs">{errors.customer_email}</span>
        )}
      </div>
      <div>
        <Input
          id="customer_phone"
          variant="phone"
          label="Phone"
          placeholder="Enter phone number"
          handleChange={handleChange}
          value={addContactFormData.customer_phone}
        />
        {errors.customer_phone && (
          <span className="text-red-500 text-xs">{errors.customer_phone}</span>
        )}
      </div>
      <div>
        <Input
          type="address"
          id="customer_address"
          variant="default"
          label="Address"
          placeholder="Address"
          handleChange={handleChange}
          value={addContactFormData.customer_address}
          defaultValue={addContactFormData.customer_address}
          isRequired={true}
          disabled={false}
        />
        {errors.customer_address && (
          <span className="text-red-500 text-xs">{errors.customer_address}</span>
        )}
      </div>
      <div>
        <FormSelect
          defaultSelected={addContactFormData?.source}
          onChange={handleChangeSelect}
          label="Source"
          name="source"
          datas={SOURCES}
          selectedNow={false}
        />
        {errors.source && (
          <span className="text-red-500 text-xs">{errors.source}</span>
        )}
      </div>
      {/**set up handleChange later  */}
    </div>
  )
}

export default NewContactForm